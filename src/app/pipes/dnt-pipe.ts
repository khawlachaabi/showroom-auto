import { Pipe, PipeTransform } from '@angular/core';
// pipe : transforme un nombre en prix lisible dans le template
// utilisation : {{ auto.price | dnt }}  =>  230,000 DNT
@Pipe({
  name: 'dnt',
})
export class DntPipe implements PipeTransform {
  // les prix de autoList sont en milliers de DNT (230 = 230 000 DNT)
  // inThousands=false pour un montant deja en DNT : {{ x | dnt:false }}
  transform(value: number, inThousands: boolean = true): string {
    const amount = inThousands ? value * 1000 : value
    // toLocaleString('en-US') ajoute les virgules : 230000 => 230,000
    return Math.round(amount).toLocaleString('en-US') + ' DNT'
  }
}
