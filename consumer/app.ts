import { Component } from '@angular/core'
import { LibButton } from 'lib-button'

@Component({
  selector: 'app-root',
  imports: [LibButton],
  template: '<lib-button>Click</lib-button>',
})
export class App {}
