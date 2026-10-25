import { Component, EventEmitter, Input, Output } from '@angular/core';
// decorateur contient les imports , selecter fichier de style et template
@Component({
  imports: [],
  selector: 'app-head-bar',//represente le nom d une balise correspondant a u composant
  styleUrl: './head-bar.css',
  templateUrl: './head-bar.html',
})
export class HeadBar {
  // ajout : compteurs envoyes par app
  @Input() favoritesCount=0
  @Input() reservationsCount=0
  @Input() onlyFavorites=false
  @Output() onShowFavorites=new EventEmitter<void>()
  @Output() onShowCart=new EventEmitter<void>()
  // ajout : mode sombre
  @Input() darkMode=false
  @Output() onToggleTheme=new EventEmitter<void>()

  showFavorites(){
    this.onShowFavorites.emit()
  }
  showCart(){
    this.onShowCart.emit()
  }
  toggleTheme(){
    this.onToggleTheme.emit()
  }
}
