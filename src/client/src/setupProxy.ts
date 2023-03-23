if (process.env.NODE_ENV !== "production") {
    const { createProxyMiddleware } = require("http-proxy-middleware");
    module.exports = function (app: { use: (arg0: string, arg1: any) => void; }) {
      app.use(
        "/api",
        createProxyMiddleware({
          target: "http://localhost:8080",
          changeOrigin: true,
        })
      );
    };
  }