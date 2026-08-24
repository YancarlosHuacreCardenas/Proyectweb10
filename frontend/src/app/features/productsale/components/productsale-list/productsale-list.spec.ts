import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSaleListComponent } from './productsale-list';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductSaleListComponent', () => {
  let component: ProductSaleListComponent;
  let fixture: ComponentFixture<ProductSaleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSaleListComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
