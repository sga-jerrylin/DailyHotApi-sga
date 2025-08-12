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

// API路由 - 必须在静态资源之前
app.route("/", registry);

// robots
app.get("/robots.txt", robotstxt);

// 静态资源服务 - 只处理特定路径
app.use(
  "/_next/*",
  serveStatic({
    root: "./public",
  }),
);

app.use(
  "/favicon.ico",
  serveStatic({
    root: "./public",
    rewriteRequestPath: () => "/favicon.png",
  }),
);

app.use(
  "*.png",
  serveStatic({
    root: "./public",
  }),
);

app.use(
  "*.svg",
  serveStatic({
    root: "./public",
  }),
);

app.use(
  "*.jpg",
  serveStatic({
    root: "./public",
  }),
);
// 读取前端应用的HTML文件
let indexHtml: string;
try {
  // 尝试Docker容器路径
  indexHtml = readFileSync(join("/app", "public", "index.html"), "utf-8");
} catch (error) {
  try {
    // 尝试本地开发路径
    indexHtml = readFileSync(join(process.cwd(), "public", "index.html"), "utf-8");
  } catch (error2) {
    // 如果都找不到，返回一个简单的HTML
    indexHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>今日热榜 | DailyHot API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
        }
        .container { max-width: 600px; padding: 2rem; }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔥 今日热榜</h1>
        <p>AI驱动的全网热点聚合平台</p>
        <p>前端资源加载中，请稍候...</p>
        <a href="/aggregate" class="btn">查看API数据</a>
    </div>
    <script>
        // 每3秒刷新一次页面，直到前端资源加载完成
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    </script>
</body>
</html>`;
  }
}

// 根路径直接返回前端应用
app.get("/", (c) => {
  return c.html(indexHtml);
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
  return c.html(indexHtml);
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
  return c.html(indexHtml);
});

export default app;
