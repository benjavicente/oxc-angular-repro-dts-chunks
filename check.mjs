// Prints the built declaration and whether it has the Ivy members the Angular
// compiler needs to recognize `LibButton` as a standalone component.
import { readFileSync } from 'node:fs'

const dts = readFileSync('dist/index.d.mts', 'utf8')
console.log('\ndist/index.d.mts:\n' + dts)
console.log(
  dts.includes('ɵcmp')
    ? 'OK: Ivy declarations present'
    : 'BUG: no Ivy declarations (expected static ɵfac / ɵcmp members)',
)
