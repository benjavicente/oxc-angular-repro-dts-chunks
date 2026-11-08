# Ivy `.d.ts` members are not added when declarations come from rolldown-plugin-dts

> 🤖 Made by agents

`@oxc-angular/vite@0.0.43`, `rolldown-plugin-dts@0.30.0`, Angular 22.2.5, Node 22+.

`src/index.ts` is a standalone component, `LibButton`. `vite.config.ts` builds
it as a library with `compilationMode: 'partial'` and rolldown-plugin-dts, as
the `@oxc-angular/vite` README suggests, plus the `oxc.exclude` setting that
rolldown-plugin-dts documents for Vite. `consumer/app.ts` is an Angular app
that imports `LibButton` from the built `dist/index.d.mts` and is compiled
with `ngc`.

## Quick run

```sh
npm install
npm run repro            # declaration has no static ɵfac / ɵcmp; the consumer fails with NG2012
npm run repro:as-asset   # same build, declaration re-emitted as an asset: members present, consumer compiles
```

## Step by step

1. Install the pinned dependencies.

   ```sh
   npm install
   ```

2. Build the library. A small logging plugin in `vite.config.ts` prints the
   type of every declaration output just before `@oxc-angular/vite` would
   augment it.

   ```sh
   npm run build
   ```

   ```
   declaration output "index.d.mts" has type "chunk"
   ```

3. Look at the declaration.

   ```sh
   cat dist/index.d.mts
   ```

   ```ts
   export declare class LibButton {}
   ```

   There are no `static ɵfac` / `static ɵcmp` members, even though the
   JavaScript in `dist/index.mjs` has `ɵɵngDeclareComponent`.

4. Compile the consumer app against that declaration.

   ```sh
   npm run consumer
   ```

   ```
   app.ts:6:13 - error NG2012: Component imports must be standalone components, directives, pipes, or must be NgModules.

   6   imports: [LibButton],
                 ~~~~~~~~~
   ```

5. Find the cause in the plugin: its `.d.ts` augmentation (the
   `@oxc-angular/vite-dts` plugin, in `generateBundle`) skips every output
   that is not an asset.

   ```sh
   grep -n -B2 -A3 "file.type !== 'asset'" node_modules/@oxc-angular/vite/dist/index.js
   ```

   ```js
   for (const file of Object.values(bundle)) {
       if (file.type !== 'asset')
           continue;
       if (!/\.d\.[cm]?ts$/.test(file.fileName))
           continue;
   ```

   rolldown-plugin-dts emits declarations as chunks (step 2), so they are
   skipped.

6. Confirm it: rebuild with `AS_ASSET=1`, which adds a plugin that re-emits the
   declaration chunk as an asset before `@oxc-angular/vite-dts` runs, then
   repeat steps 3 and 4.

   ```sh
   npm run build:as-asset
   cat dist/index.d.mts
   npm run consumer
   ```

   ```
   declaration output "index.d.mts" has type "asset"
   ```

   ```ts
   import * as i0 from "@angular/core";
   export declare class LibButton {
       static ɵfac: i0.ɵɵFactoryDeclaration<LibButton, never>;
       static ɵcmp: i0.ɵɵComponentDeclaration<LibButton, "lib-button", never, {}, {}, never, never, true, never>;
   }
   ```

   The consumer now compiles without errors.

## Why it fails

Angular decides whether a class from a library is a component by reading the
`static ɵcmp` member in its `.d.ts`. `@oxc-angular/vite` only adds those
members to declaration outputs of type `asset`, but rolldown-plugin-dts emits
declaration chunks, so the published `.d.ts` describes a plain class and
consumers reject it (`NG2012`). Also handling `.d.ts` outputs of type `chunk`
(reading and writing `chunk.code`) would fix it.
