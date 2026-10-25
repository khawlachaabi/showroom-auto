import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Auto } from '../../interfaces/auto';
import { DntPipe } from '../../pipes/dnt-pipe';
// panier : liste des voitures reservees (popup)
@Component({
  imports: [DntPipe],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  @Input() cars:Auto[]=[]
  @Output() onCancel=new EventEmitter<Auto>()
  @Output() onClose=new EventEmitter<void>()

  // somme des prix des voitures reservees
  total(){
    return this.cars.reduce((sum, x)=>sum + x.price, 0)
  }
  cancel(auto:Auto){
    this.onCancel.emit(auto)
  }
  close(){
    this.onClose.emit()
  }
}
