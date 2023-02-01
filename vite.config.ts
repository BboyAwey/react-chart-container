import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import eslint from 'vite-plugin-eslint'
import packageInfo from './package.json'

export default defineConfig({
  build: {
    outDir: 'lib',
    minify: false,
    lib: {
      entry: resolve(__dirname, './react-chart-container/index.tsx'),
      name: packageInfo.name,
      formats: ['es', 'umd', 'cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'fast-copy',
        'fast-equals',
        'resize-detector'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'fast-copy': 'fastCopy',
          'fast-equals': 'fastEquals',
          'resize-detector': 'resizeDetector'
        }
      }
    }
  },
  plugins: [
    eslint({
      fix: true,
      emitWarning: true,
      emitError: true,
      failOnError: false,
      failOnWarning: false
    }),
    dts({
      entryRoot: resolve(__dirname, './react-chart-container')
    })
  ],
  server: {
    port: 5556
  }
})
