import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSaleFormComponent } from './productsale-form';

describe('ProductSaleFormComponent', () => {
  let component: ProductSaleFormComponent;
  let fixture: ComponentFixture<ProductSaleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSaleFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSaleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
