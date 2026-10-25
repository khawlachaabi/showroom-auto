import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarDetails } from './car-details';
import { Auto } from '../../interfaces/auto';

describe('CarDetails', () => {
  let component: CarDetails;
  let fixture: ComponentFixture<CarDetails>;
  const car: Auto = {
    id: 1, brand: 'Audi', model: 'Q5', price: 350, power: 16,
    photo: 'Q5.webp', availability: 1, description: 'test',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(CarDetails);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('car', { ...car });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onReserve when clicking "Réserver"', () => {
    let emitted: Auto | undefined;
    component.onReserve.subscribe(a => emitted = a);
    fixture.nativeElement.querySelector('.reserve').click();
    expect(emitted?.id).toBe(1);
  });

  it('should show "Out of stock" and disable the button when stock is 0', async () => {
    fixture.componentRef.setInput('car', { ...car, availability: 0 });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Out of stock');
    expect(fixture.nativeElement.querySelector('.reserve').disabled).toBe(true);
  });

  it('should disable the button when already reserved', async () => {
    fixture.componentRef.setInput('reserved', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.reserve').disabled).toBe(true);
  });
});
