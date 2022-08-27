import * as path from 'node:path'
import * as url from 'node:url'
import express from 'express'
import { build, type Plugin, type ResolvedConfig, type UserConfig } from 'vite'

export type VitePluginServerOptions = {
  /**
   * The path to the server file (express).
   * @default "./server.ts"
   */
  server?: string
}

export type ServerModule = {
  app: express.Express
}

export const VitePluginServer = (options?: VitePluginServerOptions): Plugin => {
  const appFile = path.resolve(process.cwd(), options?.server ?? './server.ts')
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-server',
    configResolved: (c) => {
      config = c
    },
    configureServer: async (viteDevServer) => {
      viteDevServer.middlewares.use(async (req, res, next) => {
        try {
          const mod = (await viteDevServer.ssrLoadModule(
            `/@fs/${appFile}`
          )) as ServerModule

          /**
           * Create the internal server wrapper
           */
          const server = express()
          server.use((req, res, next) => {
            // @ts-expect-error
            req.viteServer = viteDevServer
            next()
          })

          server.use(mod.app)
          // @ts-expect-error - express.handle exists
          server.handle(req as any, res)
          if (!res.writableEnded) {
            next()
          }
        } catch (error) {
          viteDevServer.ssrFixStacktrace(error)
          process.exitCode = 1
          next(error)
        }
      })
    },
    writeBundle: async () => {
      if (process.env.VITE_PLUGIN_SERVER_BUILD) return
      process.env.VITE_PLUGIN_SERVER_BUILD = 'true'

      const entry = url.fileURLToPath(
        new url.URL('server.template.ts', import.meta.url)
      )

      const server: UserConfig = {
        root: config.root,
        resolve: {
          alias: {
            $server: appFile,
          },
        },
        build: {
          outDir: path.resolve(config.root, config.build.outDir),
          ssr: true,
          rollupOptions: {
            input: {
              server: entry,
            },
            output: {
              // preserves directory structure
              // preserveModules: true,
            },
          },
        },
      }

      await build(server)
    },
  }
}
