import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortFilter } from './sort-filter';

describe('SortFilter', () => {
  let component: SortFilter;
  let fixture: ComponentFixture<SortFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(SortFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
