import { serve } from "@hono/node-server";
import { config } from "./config.js";
import logger from "./utils/logger.js";
import app from "./app.js";

// 启动服务器
const serveHotApi: (port?: number) => void = (port: number = config.PORT) => {
  try {
    const apiServer = serve({
      fetch: app.fetch,
      port,
    });
    logger.info(`🔥 DailyHot API successfully runs on port ${port}`);
    logger.info(`🔗 Local: 👉 http://localhost:${port}`);
    return apiServer;
  } catch (error) {
    logger.error(error);
  }
};

// 强制启动服务器用于开发
serveHotApi(config.PORT);

export default serveHotApi;
