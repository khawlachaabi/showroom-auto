import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Auto } from '../../interfaces/auto';
import { DntPipe } from '../../pipes/dnt-pipe';
// composant qui affiche la fiche complete de la voiture selectionnee (popup)
@Component({
  imports: [DntPipe],
  selector: 'app-car-details',
  styleUrl: './car-details.css',
  templateUrl: './car-details.html',
})
export class CarDetails {
  // la voiture est envoyee par le parent (app) avec [car]="..."
  @Input() car!:Auto
  // true si l utilisateur a deja reserve cette voiture
  @Input() reserved=false
  @Output() onClose=new EventEmitter<void>()
  @Output() onReserve=new EventEmitter<Auto>()

  // c est le parent (app) qui diminue le stock
  reserve(){
    this.onReserve.emit(this.car)
  }
  close(){
    this.onClose.emit()
  }

  // simulateur de mensualites
  rate=8            // taux annuel en %
  downPercent=20    // apport en % du prix
  months=36         // duree du credit
  setDownPercent(value:string){
    this.downPercent=Number(value)
  }
  setMonths(value:string){
    this.months=Number(value)
  }
  // apport en DNT (le prix est en milliers de DNT)
  downAmount(){
    return this.car.price*1000*this.downPercent/100
  }
  // montant emprunte = prix - apport
  loanAmount(){
    return this.car.price*1000-this.downAmount()
  }
  // formule du credit : M = C * t / (1 - (1+t)^-n)  avec t = taux mensuel
  monthly(){
    const t=this.rate/100/12
    return this.loanAmount()*t/(1-Math.pow(1+t, -this.months))
  }
}
