import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { HeadBar } from './components/head-bar/head-bar';
import { SearchBar } from './components/search-bar/search-bar';
import { Auto } from './interfaces/auto';
import { CarDetails } from './components/car-details/car-details';
import { SortFilter } from './components/sort-filter/sort-filter';
import { Compare } from './components/compare/compare';
import { Cart } from './components/cart/cart';
import { Toast } from './components/toast/toast';
import { RecentCars } from './components/recent-cars/recent-cars';
import { SCRAPED_AUTOS } from './data/scraped-autos';
@Component({
  imports: [ HeadBar, SearchBar, CarDetails, SortFilter, Compare, Cart, Toast, RecentCars],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // signal est defini ici et on peut l appeler dans app.html
  protected readonly title = signal('showroom-auto');
  // pour changer la valeur du signal 
  constructor(){
    this.title.set('My Showroom');
  }
  // lorsqu on ne peut pas initialiser une voiture
  // ? au lieu de ! : selectedCar peut redevenir vide quand on ferme la popup
  selectedCar?:Auto
  selectCar(auto:Auto){
    this.selectedCar=auto
    // ajout : historique des 3 dernieres voitures vues (la plus recente en premier)
    this.recentCars=[auto, ...this.recentCars.filter(x=>x!=auto)].slice(0,3)
  }
  recentCars:Auto[]=[]

  // notification (toast) : message affiche 3 secondes
  toastMessage=''
  toastTimer:any
  // l application est "zoneless" : apres un setTimeout Angular ne rafraichit
  // pas l ecran tout seul, on le previent avec markForCheck()
  private cdr=inject(ChangeDetectorRef)
  showToast(message:string){
    this.toastMessage=message
    clearTimeout(this.toastTimer)
    this.toastTimer=setTimeout(()=>{
      this.toastMessage=''
      this.cdr.markForCheck()
    }, 3000)
  }

  // mode sombre : classe "dark" sur la balise <html> (voir styles.css)
  darkMode=false
  toggleTheme(){
    this.darkMode=!this.darkMode
    document.documentElement.classList.toggle('dark', this.darkMode)
    try{
      localStorage.setItem('darkMode', String(this.darkMode))
    }catch{}
  }

  // popup + reservation
  closeDetails(){
    this.selectedCar=undefined
  }
  // voitures deja reservees : une seule reservation par voiture
  reservedCars:Auto[]=[]
  reserveCar(auto:Auto){
    if(!this.reservedCars.includes(auto) && auto.availability>0){
      auto.availability--
      // on cree un nouveau tableau (OnPush) au lieu de push
      this.reservedCars=[...this.reservedCars, auto]
      // nouvelle liste => search-bar met a jour le stock sur les cartes
      this.updateList()
      this.showToast(auto.brand + ' ' + auto.model + ' reserved')
    }
  }
  // panier : annuler une reservation remet la voiture en stock
  showCart=false
  openCart(){
    this.showCart=true
  }
  closeCart(){
    this.showCart=false
  }
  cancelReservation(auto:Auto){
    auto.availability++
    this.reservedCars=this.reservedCars.filter(x=>x!=auto)
    this.updateList()
    this.showToast('Reservation cancelled: ' + auto.model)
  }

  // favoris : on garde les id dans le localStorage du navigateur
  favoriteIds:number[]=[]
  onlyFavorites=false
  toggleFavorite(auto:Auto){
    if(this.favoriteIds.includes(auto.id)){
      this.favoriteIds=this.favoriteIds.filter(x=>x!=auto.id)
      this.showToast(auto.model + ' removed from favorites')
    }
    else{
      this.favoriteIds=[...this.favoriteIds, auto.id]
      this.showToast(auto.model + ' added to favorites')
    }
    try{
      localStorage.setItem('favorites', JSON.stringify(this.favoriteIds))
    }catch{}
    this.updateList()
  }
  toggleOnlyFavorites(){
    this.onlyFavorites=!this.onlyFavorites
    this.updateList()
  }

  // comparateur : 3 voitures maximum
  compareCars:Auto[]=[]
  toggleCompare(auto:Auto){
    if(this.compareCars.includes(auto))
      this.compareCars=this.compareCars.filter(x=>x!=auto)
    else if(this.compareCars.length<3)
      this.compareCars=[...this.compareCars, auto]
  }
  clearCompare(){
    this.compareCars=[]
  }

  // tri + filtre : liste envoyee a search-bar (autoList reste intacte)
  displayedAutos:Auto[]=[]
  sortType=''
  maxPrice=0
  inStockOnly=false
  selectedBrand=''
  brands:string[]=[]
  ngOnInit(){
    this.displayedAutos=this.autoList
    // liste des marques sans doublons pour les boutons de sort-filter
    this.brands=[...new Set(this.autoList.map(x=>x.brand))]
    try{
      this.favoriteIds=JSON.parse(localStorage.getItem('favorites') ?? '[]')
      // ajout : on remet le mode sombre si il etait active
      if(localStorage.getItem('darkMode')=='true') this.toggleTheme()
    }catch{}
  }
  changeSort(sortType:string){
    this.sortType=sortType
    this.updateList()
  }
  changeMaxPrice(maxPrice:number){
    this.maxPrice=maxPrice
    this.updateList()
  }
  changeInStock(inStockOnly:boolean){
    this.inStockOnly=inStockOnly
    this.updateList()
  }
  changeBrand(brand:string){
    this.selectedBrand=brand
    this.updateList()
  }
  // ajout : remet tous les filtres a zero
  resetFilters(){
    this.sortType=''
    this.maxPrice=0
    this.inStockOnly=false
    this.selectedBrand=''
    this.onlyFavorites=false
    this.updateList()
    this.showToast('Filters reset')
  }
  updateList(){
    // filter cree un nouveau tableau, donc autoList n est pas modifiee par sort
    let list=this.autoList.filter(x=>
      (!this.maxPrice || x.price<=this.maxPrice) &&
      (!this.inStockOnly || x.availability>0) &&
      (!this.selectedBrand || x.brand==this.selectedBrand) &&
      (!this.onlyFavorites || this.favoriteIds.includes(x.id))
    )
    if(this.sortType=='price-asc') list.sort((a,b)=>a.price-b.price)
    if(this.sortType=='price-desc') list.sort((a,b)=>b.price-a.price)
    if(this.sortType=='power-asc') list.sort((a,b)=>a.power-b.power)
    if(this.sortType=='power-desc') list.sort((a,b)=>b.power-a.power)
    this.displayedAutos=list
  }

  // ajout : voitures recuperees par web scraping sur automobile.tn
  // (fichier genere par scraper/scrape_automobile_tn.py)
  autoList:Auto[]=SCRAPED_AUTOS

  // liste d origine, gardee pour pouvoir revenir en arriere :
  // supprimer la ligne autoList ci-dessus et renommer autoListProf en autoList
  autoListProf:Auto[]=[
    {     
      id:1,
      brand: "Mercedes Benz",
      model: "C-CLASS",
      price: 230,
      power: 9,
      photo: "CLASS-C.webp",
      availability  :4,
      description:"The Mercedes-Benz C-Class is a line of luxury compact executive cars, known for blending sporty exterior styling with a sophisticated, high-tech interior. It features advanced technology like a digital cockpit, and many models include a mild hybrid system for efficiency and boost. "
    },
    {
      id:2,
      brand: "Mercedes Benz",
      model: "GLA",
      price: 203,
      power: 8,
      photo: "GLA.webp",
      availability  :4,
      description:"The Mercedes-Benz GLA is a compact luxury SUV, based on the A-Class platform, available with petrol and diesel engines, in front-wheel drive or all-wheel drive (4MATIC). It is characterized by modern technologies, innovative driver assistance systems, an enhanced design and high level of comfort, making it the smallest SUV in the brand's lineup."
    },
    {
      id:3,
      brand: "Mercedes Benz",
      model: "GLE",
      price: 450,
      power: 17,
      photo: "GLE.webp",
      availability  :4,
      description:"The Mercedes-Benz GLE is a luxury SUV known for its combination of sportiness and luxurious comfort, available in several versions, including hybrid models and high-performance 'Mercedes-AMG' versions. The range includes models such as the 'Urban Edition', 'Hybrid Drive', 'AMG Line', 'Mercedes-AMG 53 4MATIC+', and 'Mercedes-AMG 63 S 4MATIC+'. The vehicle is distinguished by its spacious and luxurious interior, intelligent technology, and driver-focused design."
    },
    {
      id:4,
      brand: "Jaguar",
      model: "F-Pace",
      price: 399,
      power: 16,
      photo: "FPACE.webp",
      availability  :4,
      description:"The Jaguar F-PACE is a luxury SUV that blends performance and design, featuring a refreshed exterior including new headlights, a redesigned grille, and more dynamic exterior finishes. The interior has been reimagined to be luxurious and spacious, equipped with the Pivi Pro infotainment system with a large 11.4-inch touchscreen, premium materials, and a selection of seats and colors."
    },
    {
      id:5,
      brand: "Jaguar",
      model: "E-PACE",
      price: 350,
      power: 12,
      photo: "EPACE.webp",
      availability  :4,
      description:"The Jaguar E-PACE is a compact luxury SUV that combines sporty design with modern technology. It features a driver-focused interior, an 11.4-inch infotainment screen, plug-in hybrid powertrains, and personalization options such as the R-Dynamic trim. The driving experience is agile, with all-wheel-drive options and a suspension designed to balance performance and comfort."
    },
    {
      id:6,
      brand: "Audi",
      model: "Q3 CROSSBACK",
      price: 230,
      power: 9,
      photo: "Q3.webp",
      availability  :3,
      description:"The Audi Q3 Sportback is a compact SUV with a coupé-like design that combines sporty style and versatility. It stands out with its dynamic silhouette, modern and technologically advanced interior, as well as its spacious cabin and modular trunk. It offers a wide range of powertrains, including plug-in hybrid TFSIe versions."
    },
    {
      id:7,
      brand: "Audi",
      model: "Q5",
      price: 350,
      power: 16,
      photo: "Q5.webp",
      availability :3,
      description:"The Audi Q5 is a luxury SUV that combines performance, technology, and comfort. It features a turbocharged engine, quattro all-wheel drive, and several powertrain options, including mild-hybrid diesel and gasoline versions. Its exterior design is characterized by a distinctive grille, flowing lines, and modern LED headlights, while the interior boasts a large touchscreen and comfortable seats."
    },
    {
      id:8,
      brand: "Audi",
      model: "A3 SPORTBACK",
      price: 145,
      power: 8,
      photo: "A3.webp",
      availability :3,
      description:"The Audi A3 Sportback is a compact car distinguished by its sporty design and modern technology. It offers a versatile interior, a modular trunk, and a range of high-performance engines, both internal combustion and plug-in hybrid. Features include options such as the virtual cockpit and various trim levels, including the S line, which accentuates its athletic look."
    },
    {
      id:9,
      brand: "BMW",
      model: "X2 SDRIVE PACK",
      price: 245,
      power: 8,
      photo: "X2.webp",
      availability :3,
      description:"The BMW X2 sDrive pack describes a front-wheel-drive model that typically includes a Sporty M Sport design and is often paired with a 'Tech/Pro Pack'. Key features common to sDrive models with the Tech/Pro pack include an M Sport brake system, M Adaptive Suspension, and features for convenience and technology like Adaptive LED Headlights, Parking Assistant, and Heated Sport Seats. The 'sDrive' designation indicates two-wheel drive, in contrast to the all-wheel-drive 'xDrive' models."
    },
    {
      id:10,
      brand: "BMW",
      model: "IX",
      price: 432,
      power: 11,
      photo: "IX.webp",
      availability :3,
      description:"The BMW iX is a fully electric luxury SUV characterized by its futuristic design, minimalist yet spacious interior, and advanced technology. It offers a long electric range, semi-autonomous driving (up to level 3 on certain models), and exceptional comfort thanks to its features and driver assistance systems. Options include performance packages such as the M Sport package for enhanced aesthetics and performance."
    },
    {
      id:11,
      brand: "BMW",
      model: "X3 HYBRIDE",
      price: 355,
      power: 11,
      photo: "X3.webp",
      availability :3,
      description:"The BMW X3 plug-in hybrid is a family SUV combining a 2.0L gasoline engine with an electric motor, delivering a combined output of approximately 299 horsepower and an electric range of up to 90 km. It is characterized by its performance (0 to 100 km/h in approximately 6.1 seconds), its luxurious interior featuring advanced technologies such as the BMW Curved Display, and low fuel consumption, although this increases once the battery is depleted. Its 19.7 kWh battery can be recharged in approximately 2 hours and 15 minutes using an 11 kW AC charging station."
    },
    {
      id:12,
      brand: "Land Rover",
      model: "Range Rover Evoque",
      price: 340,
      power: 9,
      photo: "EVOQUE.webp",
      availability  :4,
      description:"The Range Rover Evoque is a compact luxury SUV distinguished by its modern design, clean lines inspired by Range Rover DNA (floating roof, continuous beltline), and sophisticated interior. It combines an elegant exterior with premium features, such as Pixel LED headlights, large wheels, and high-quality materials like Windsor leather. In terms of performance, it offers plug-in hybrid (PHEV) powertrains with an electric range of up to 61 km."
    },
    {
      id:13,
      brand: "Land Rover",
      model: "Defender 90",
      price: 398,
      power: 21,
      photo: "DEFENDER.webp",
      availability  :4,
      description:"The Land Rover Defender 90 is a compact off-road vehicle, renowned for its iconic design, small proportions, and off-road capabilities. It combines a modern and comfortable interior with robust features such as impressive ground clearance and optional equipment like an electric winch. Powerful versions like the Defender 90 V8, with a 525 hp petrol engine, can accelerate from 0 to 100 km/h in 5.2 seconds."
    },
    {
      id:14,
      brand: "Land Rover",
      model: "Range Rover",
      price: 702,
      power: 24,
      photo: "RANGE.webp",
      availability  :4,
      description:"The Land Rover Range Rover is a luxury crossover SUV known for its combination of luxury, performance, and off-road capability. It features sophisticated design with iconic lines, a refined interior, and advanced technology. Available in various configurations including short and long wheelbases, different engine options (including V8, mild-hybrid, and plug-in hybrid), the Range Rover is designed to be both a capable all-terrain vehicle and a high-end family vehicle."
    },
    {
      id:15,
      brand: "Alfa Romeo",
      model: "Stelvio",
      price: 268,
      power: 18,
      photo: "STELVIO.webp",
      availability  :11,
      description:"The Alfa Romeo Stelvio is a sporty and elegant SUV, characterized by its distinctive Italian design, dynamic performance, and optimal weight distribution. It is available with a range of gasoline and diesel engines, with power outputs from 150 hp for the entry-level model to over 500 hp for the Quadrifoglio version, and is equipped with advanced driver assistance systems, such as Level 2 autonomous driving. Its interior combines comfort and sportiness, with premium finishes and a large 525-liter trunk."
    },
    {
      id:16,
      brand: "Alfa Romeo",
      model: "Giulia",
      price: 198,
      power: 18,
      photo: "GIULIA.webp",
      availability  :11,
      description:"The Alfa Romeo Giulia is a premium sports sedan renowned for its elegant design, dynamic performance, and advanced technology. It is available with a range of engines, including a 280-horsepower turbocharged gasoline engine and 160- or 210-horsepower diesel options. The Giulia features a customizable 12.3-inch digital instrument cluster, an 8.8-inch touchscreen with navigation, and advanced driver assistance systems."
    }
  ]
}

