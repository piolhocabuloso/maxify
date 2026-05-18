import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import path from "path"
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from "electron-vite"
import react from "@vitejs/plugin-react"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      bytecodePlugin({
        protectedStrings: [
          "MAXIFY",
          "premium",
          "Authorization",
          "Bearer",
          "verify-key",
          "logs/login",
          "run-powershell",
          "auth:login",
          "auth:login-free",
          "auth:login-saved",
          "resolvePremiumScriptPayload",
          "send-logs-on-login",
          "discord-user-updated",
          "get-logs-discord-user"
        ]
      })
    ],
  },

  preload: {
    plugins: [
      externalizeDepsPlugin(),
      bytecodePlugin()
    ],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.js")
        }
      }
    }
  },

  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve(__dirname, "src/renderer/src"),
        "@": path.resolve(__dirname, "src/renderer/src"),
      },
    },
    plugins: [react()],
  },
})