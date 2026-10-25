import { Component, EventEmitter, Input, Output } from '@angular/core';
// composant qui envoie au parent (app) le choix du tri et des filtres
@Component({
  imports: [],
  selector: 'app-sort-filter',
  styleUrl: './sort-filter.css',
  templateUrl: './sort-filter.html',
})
export class SortFilter {
  // liste des marques envoyee par app
  @Input() brands:string[]=[]
  @Output() onSort=new EventEmitter<string>()
  @Output() onMaxPrice=new EventEmitter<number>()
  @Output() onInStock=new EventEmitter<boolean>()
  @Output() onBrand=new EventEmitter<string>()
  @Output() onReset=new EventEmitter<void>()
  // marque du bouton actif ('' = toutes)
  selectedBrand=''

  selectSort(sortType:string){
    this.onSort.emit(sortType)
  }
  selectMaxPrice(maxPrice:string){
    // la valeur de l input est une chaine, on la convertit en nombre
    this.onMaxPrice.emit(Number(maxPrice))
  }
  selectInStock(inStockOnly:boolean){
    this.onInStock.emit(inStockOnly)
  }
  selectBrand(brand:string){
    this.selectedBrand=brand
    this.onBrand.emit(brand)
  }
  // remet les champs du formulaire a vide puis previent app
  reset(sort:HTMLSelectElement, maxPrice:HTMLInputElement, inStock:HTMLInputElement){
    sort.value=''
    maxPrice.value=''
    inStock.checked=false
    this.selectedBrand=''
    this.onReset.emit()
  }
}
