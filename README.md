# Ivy `.d.ts` members are not added when declarations come from rolldown-plugin-dts

> 🤖 Made by agents

`@oxc-angular/vite@0.0.43`, `rolldown-plugin-dts@0.30.0`, Angular 22.2.5.

```sh
npm install
npm run repro            # declaration has no static ɵfac / ɵcmp
npm run repro:as-asset   # same build, declaration re-emitted as an asset: members present
```

The README lists rolldown-plugin-dts as a declaration generator to pair with
`compilationMode: 'partial'`. rolldown-plugin-dts emits declarations as bundle
**chunks** (`index.d.mts` has `type: "chunk"`), but the plugin's `generateBundle`
only augments files with `type === 'asset'`, so the published declaration has
no Ivy members and the Angular CLI does not recognize the component.

`repro:as-asset` re-emits the declaration chunk as an asset before the plugin's
post `generateBundle`, and the members are added, confirming the cause.

The Vite config uses the `oxc.exclude` setting rolldown-plugin-dts documents for Vite.
