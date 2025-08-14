import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { compress } from "hono/compress";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";
import logger from "./utils/logger.js";
import registry from "./registry.js";
import robotstxt from "./robots.txt.js";
import { readFileSync } from "fs";
import { join } from "path";
// 前端视图已删除，使用静态文件服务

const app = new Hono();

// 压缩响应
app.use(compress());

// prettyJSON
app.use(prettyJSON());

// 尾部斜杠重定向
app.use(trimTrailingSlash());

// CORS
app.use(
  "*",
  cors({
    // 可写为数组
    origin: (origin) => {
      // 是否指定域名
      const isSame = config.ALLOWED_HOST && origin.endsWith(config.ALLOWED_HOST);
      return isSame ? origin : config.ALLOWED_DOMAIN;
    },
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    credentials: true,
  }),
);

// 静态资源服务 - 必须在API路由之前
app.use(
  "/_next/*",
  serveStatic({
    root: join(process.cwd(), "public"),
  }),
);

// 专门处理logo文件
app.get("/sga-logo.png", serveStatic({
  root: join(process.cwd(), "public"),
}));

app.use(
  "/favicon.ico",
  serveStatic({
    root: join(process.cwd(), "public"),
    rewriteRequestPath: () => "/favicon.ico",
  }),
);

// 静态文件服务 - 处理其他静态资源
app.use(
  "*",
  serveStatic({
    root: join(process.cwd(), "public"),
    onNotFound: (path, c) => {
      // 只有当请求的是静态文件时才返回404，否则继续处理
      if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)) {
        return undefined; // 让Hono继续处理
      }
    },
  }),
);

// API路由 - 在静态资源之后
app.route("/", registry);

// robots
app.get("/robots.txt", robotstxt);
// 读取前端应用的HTML文件：按请求读取，避免进程内缓存陈旧文件
const readIndexHtml = (): string => {
  try {
    // 优先容器路径
    return readFileSync(join("/app", "public", "index.html"), "utf-8");
  } catch (error) {
    try {
      // 回退到本地开发路径
      return readFileSync(join(process.cwd(), "public", "index.html"), "utf-8");
    } catch (error2) {
      // 最终回退：极简静态页（不自动刷新）
      return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔥 今日热榜 | AI驱动的全网热点聚合平台</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1020; color: white; display: grid; place-items: center; height: 100vh; margin: 0; }
    .container { max-width: 640px; padding: 2rem; text-align: center; }
    a { color: #7dd3fc }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔥 今日热榜</h1>
    <p>静态资源尚未就绪，请稍后刷新，或直接访问 <a href="/aggregate">/aggregate</a></p>
  </div>
</body>
</html>`;
    }
  }
};

// 根路径直接返回前端应用
app.get("/", (c) => {
  return c.html(readIndexHtml());
});

// 404 - 返回前端的404页面
app.notFound((c) => {
  // 对于API路由返回JSON错误
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/aggregate') || c.req.path.startsWith('/routes/')) {
    return c.json({ error: "Not Found", message: "API endpoint not found" }, 404);
  }
  // 对于静态文件返回404
  if (c.req.path.startsWith('/_next/') || c.req.path.includes('.js') || c.req.path.includes('.css') || c.req.path.includes('.png') || c.req.path.includes('.ico')) {
    return c.text('Not Found', 404);
  }
  // 对于其他路由返回前端应用（SPA路由）
  return c.html(readIndexHtml());
});

// error
app.onError((err, c) => {
  logger.error(`❌ [ERROR] ${err?.message}`);
  // 对于API路由返回JSON错误
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/aggregate') || c.req.path.startsWith('/routes/')) {
    return c.json({ error: "Internal Server Error", message: err?.message }, 500);
  }
  // 对于静态文件返回500
  if (c.req.path.startsWith('/_next/') || c.req.path.includes('.js') || c.req.path.includes('.css') || c.req.path.includes('.png') || c.req.path.includes('.ico')) {
    return c.text('Internal Server Error', 500);
  }
  // 对于其他路由返回前端应用
  return c.html(readIndexHtml());
});

export default app;
