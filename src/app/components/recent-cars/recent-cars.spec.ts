import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentCars } from './recent-cars';

describe('RecentCars', () => {
  let component: RecentCars;
  let fixture: ComponentFixture<RecentCars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentCars],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentCars);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
