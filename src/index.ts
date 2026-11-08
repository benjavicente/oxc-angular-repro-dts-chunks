import { Component } from '@angular/core'

@Component({
  selector: 'lib-button',
  template: '<button><ng-content /></button>',
})
export class LibButton {}
