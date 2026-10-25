import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, showroom-auto');
  });

  // ajout : tests des nouvelles fonctionnalites
  describe('features', () => {
    let app: App;
    beforeEach(async () => {
      localStorage.clear();
      const fixture = TestBed.createComponent(App);
      app = fixture.componentInstance;
      await fixture.whenStable();
    });

    it('reserves a car only once and cancels it', () => {
      const car = app.autoList[0];
      const stock = car.availability;
      app.reserveCar(car);
      app.reserveCar(car);
      expect(car.availability).toBe(stock - 1);
      expect(app.reservedCars.length).toBe(1);
      app.cancelReservation(car);
      expect(car.availability).toBe(stock);
      expect(app.reservedCars.length).toBe(0);
    });

    it('toggles favorites, saves them and filters on them', () => {
      app.toggleFavorite(app.autoList[2]);
      expect(JSON.parse(localStorage.getItem('favorites')!)).toEqual([3]);
      app.toggleOnlyFavorites();
      expect(app.displayedAutos.map(x => x.id)).toEqual([3]);
      app.toggleFavorite(app.autoList[2]);
      expect(app.displayedAutos.length).toBe(0);
    });

    it('compares 3 cars maximum', () => {
      app.autoList.slice(0, 4).forEach(x => app.toggleCompare(x));
      expect(app.compareCars.length).toBe(3);
      app.clearCompare();
      expect(app.compareCars.length).toBe(0);
    });

    it('keeps the 3 last viewed cars, most recent first', () => {
      [0, 1, 2, 3, 1].forEach(i => app.selectCar(app.autoList[i]));
      expect(app.recentCars.map(x => x.id)).toEqual([2, 4, 3]);
    });

    it('resets all filters', () => {
      app.changeBrand('Audi');
      app.changeMaxPrice(200);
      app.changeSort('price-desc');
      app.resetFilters();
      expect(app.displayedAutos.length).toBe(app.autoList.length);
      expect(app.toastMessage).toBe('Filters reset');
    });

    it('hides the toast after 3 seconds', () => {
      vi.useFakeTimers();
      app.showToast('hello');
      expect(app.toastMessage).toBe('hello');
      vi.advanceTimersByTime(3000);
      expect(app.toastMessage).toBe('');
      vi.useRealTimers();
    });

    it('toggles dark mode on the html tag', () => {
      app.toggleTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      app.toggleTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('filters by brand and stock', () => {
      app.changeBrand('Audi');
      expect(app.displayedAutos.every(x => x.brand == 'Audi')).toBe(true);
      app.changeBrand('');
      app.autoList[0].availability = 0;
      app.changeInStock(true);
      expect(app.displayedAutos.includes(app.autoList[0])).toBe(false);
    });
  });
});
