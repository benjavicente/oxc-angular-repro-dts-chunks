import { angular } from '@oxc-angular/vite'
import { dts } from 'rolldown-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig({
  // As documented by rolldown-plugin-dts for Vite.
  oxc: { exclude: [/\.js$/, /\.d\.[cm]?ts$/] },
  plugins: [
    angular({ tsconfig: 'tsconfig.json', compilationMode: 'partial' }),
    dts({ tsconfig: 'tsconfig.json' }),
    // Set AS_ASSET=1 to re-emit declaration chunks as assets before
    // @oxc-angular/vite's post generateBundle: the Ivy members then appear.
    process.env.AS_ASSET && {
      name: 'declaration-chunks-as-assets',
      generateBundle(_, bundle) {
        for (const [key, file] of Object.entries(bundle)) {
          if (file.type === 'chunk' && /\.d\.[cm]?ts$/.test(file.fileName)) {
            delete bundle[key]
            this.emitFile({ type: 'asset', fileName: file.fileName, source: file.code })
          }
        }
      },
    },
    {
      name: 'log-declaration-output-types',
      enforce: 'post',
      generateBundle(_, bundle) {
        for (const file of Object.values(bundle)) {
          if (/\.d\.[cm]?ts$/.test(file.fileName)) {
            console.log(`declaration output "${file.fileName}" has type "${file.type}"`)
          }
        }
      },
    },
  ],
  build: {
    minify: false,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: (_format, name) => `${name}.mjs` },
    rolldownOptions: { external: [/^@angular\//] },
  },
})
