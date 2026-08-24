import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFormComponent } from './supplier-form';

describe('SupplierFormComponent', () => {
  let component: SupplierFormComponent;
  let fixture: ComponentFixture<SupplierFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
