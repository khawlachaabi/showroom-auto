import { Component, Input } from '@angular/core';
// petit message temporaire en bas de l ecran
// c est app qui decide quand l afficher et quand l effacer
@Component({
  imports: [],
  selector: 'app-toast',
  styleUrl: './toast.css',
  templateUrl: './toast.html',
})
export class Toast {
  @Input() message=''
}
