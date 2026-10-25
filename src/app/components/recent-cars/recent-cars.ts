import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Auto } from '../../interfaces/auto';
// rangee des 3 dernieres voitures consultees
@Component({
  imports: [],
  selector: 'app-recent-cars',
  styleUrl: './recent-cars.css',
  templateUrl: './recent-cars.html',
})
export class RecentCars {
  @Input() cars:Auto[]=[]
  @Output() onSelect=new EventEmitter<Auto>()

  select(auto:Auto){
    this.onSelect.emit(auto)
  }
}
