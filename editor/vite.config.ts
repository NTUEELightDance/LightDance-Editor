import type { UserConfigFn, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";

const defineConfig: UserConfigFn = ({ command, mode }) => {
  const config: UserConfig = {
    server: {
      host: true,
      https: false,
      port: 8080,
      proxy: {
        // file-server port at 8081
        "/asset": "http://localhost:8081",
        "/music": "http://localhost:8081",
        "/data": "http://localhost:8081",
        // controller-server port at 8082
        "/api/controller": "http://localhost:8082",
        "/graphql-backend": {
          target: "http://localhost:4000",
          rewrite: (path) => path.replace(/^\/graphql-backend/, "graphql"),
        },
        "/graphql-backend-websocket": {
          target: "ws://localhost:4000",
          ws: true,
          rewrite: (path) => {
            return path.replace(/^\/graphql-backend-websocket/, "graphql");
          },
        },
      },
    },
    plugins: [
      react(),
      tsconfigPaths(),
      legacy(),
      mkcert({
        source: "coding",
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react"],
            "react-dom": ["react-dom"],
          },
        },
      },
    },
  };
  return config;
};

export default defineConfig;
