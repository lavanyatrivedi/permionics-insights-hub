import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOrigins = process.env["REPLIT_DOMAINS"]
  ? process.env["REPLIT_DOMAINS"].split(",").map((d) => `https://${d.trim()}`)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, curl, mobile apps)
      if (!origin) return callback(null, true);
      // Allow localhost for development
      if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        return callback(null, true);
      }
      // Allow explicitly listed Replit domains
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any *.replit.app or *.repl.co subdomain (preview domains)
      if (/^https:\/\/[a-zA-Z0-9-]+\.replit\.app$/.test(origin) ||
          /^https:\/\/[a-zA-Z0-9-]+\.repl\.co$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

export default app;
