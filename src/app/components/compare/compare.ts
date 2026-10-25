import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Auto } from '../../interfaces/auto';
import { DntPipe } from '../../pipes/dnt-pipe';
// comparateur : barre en bas de l ecran + tableau en popup
@Component({
  imports: [DntPipe],
  selector: 'app-compare',
  styleUrl: './compare.css',
  templateUrl: './compare.html',
})
export class Compare {
  @Input() cars:Auto[]=[]
  @Output() onRemove=new EventEmitter<Auto>()
  @Output() onClear=new EventEmitter<void>()
  // true quand le tableau est ouvert
  showTable=false

  remove(auto:Auto){
    this.onRemove.emit(auto)
  }
  clear(){
    this.showTable=false
    this.onClear.emit()
  }
  open(){
    this.showTable=true
  }
  close(){
    this.showTable=false
  }

  // meilleures valeurs pour les mettre en evidence dans le tableau
  bestPrice(){
    return Math.min(...this.cars.map(x=>x.price))
  }
  bestPower(){
    return Math.max(...this.cars.map(x=>x.power))
  }
  bestStock(){
    return Math.max(...this.cars.map(x=>x.availability))
  }
}
