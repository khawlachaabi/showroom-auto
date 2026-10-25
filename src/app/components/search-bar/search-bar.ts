import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import { Auto } from '../../interfaces/auto';
import { DntPipe } from '../../pipes/dnt-pipe';
@Component({
  imports: [FontAwesomeModule, DntPipe],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  faMagnifyingGlass=faMagnifyingGlass;
  @Input() autos:Auto[]=[]
  @Output() onSelectCar=new EventEmitter<Auto>()
  selectedAutos: Auto[]=[]

  selectAutos(selectedBrand:string){
    if(selectedBrand){
      this.selectedAutos=this.autos.filter(x=>x.brand.toLowerCase().startsWith(selectedBrand.toLowerCase()))
    }
     else
        this.selectedAutos=this.autos
  }
  ngOnInit(){
  this.selectedAutos = this.autos;
  }
  selectCar(auto:Auto){
    this.onSelectCar.emit(auto)
  }
  // ajout : quand le parent envoie une nouvelle liste (tri/filtre),
  // on refait la recherche avec la marque deja tapee
  @ViewChild('brand') brandInput!:ElementRef
  ngOnChanges(){
    this.selectAutos(this.brandInput?.nativeElement.value ?? '')
  }

  // ajout : favoris et comparateur (les listes sont gardees dans app)
  @Input() favoriteIds:number[]=[]
  @Input() compareCars:Auto[]=[]
  @Output() onToggleFavorite=new EventEmitter<Auto>()
  @Output() onToggleCompare=new EventEmitter<Auto>()
  toggleFavorite(auto:Auto){
    this.onToggleFavorite.emit(auto)
  }
  toggleCompare(auto:Auto){
    this.onToggleCompare.emit(auto)
  }
}
