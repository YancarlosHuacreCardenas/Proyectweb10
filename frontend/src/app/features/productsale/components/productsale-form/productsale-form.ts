import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductSale } from '../../models/productsale.model';
import { CategoryService, Category } from '../../../../shared/services/category.service';

@Component({
  selector: 'app-productsale-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productsale-form.html',
  styleUrls: ['./productsale-form.css'],
})
export class ProductSaleFormComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' | null = 'create';
  @Input() product: ProductSale | null = null;

  @Output() save = new EventEmitter<Omit<ProductSale, 'id' | 'productsSaleId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'restoredAt'>>();
  @Output() cancel = new EventEmitter<void>();

  private categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);

  form = {
    category: '',
    productName: '',
    description: '',
    price: 0,
    availableStock: 0,
    unitMeasurement: '',
  };

  errors: { [key: string]: string } = {};

  get isEdit(): boolean { return this.mode === 'edit'; }
  get title(): string { return this.isEdit ? 'Editar Producto' : 'Nuevo Producto'; }
  get subtitle(): string { return this.isEdit ? 'Actualice los datos del producto' : 'Complete los datos del nuevo producto'; }
  get saveLabel(): string { return this.isEdit ? 'Actualizar' : 'Registrar Producto'; }

  ngOnInit(): void {
    this.fillForm();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.listar().subscribe({
      next: (data) => {
        this.categories.set(data);
      },
      error: (err) => {
        console.warn('No se pudieron cargar categorías del backend, usando fallbacks:', err);
        this.categories.set([
          { idCategory: '1', categoryName: 'Semillas', categoryType: 'INSUMO', status: true },
          { idCategory: '2', categoryName: 'Fertilizantes', categoryType: 'INSUMO', status: true },
          { idCategory: '3', categoryName: 'Herramientas', categoryType: 'INSUMO', status: true },
          { idCategory: '4', categoryName: 'Insecticidas', categoryType: 'INSUMO', status: true },
          { idCategory: '5', categoryName: 'Sustratos', categoryType: 'INSUMO', status: true },
          { idCategory: '6', categoryName: 'Envases', categoryType: 'INSUMO', status: true },
          { idCategory: '7', categoryName: 'Frutales', categoryType: 'VENTA', status: true },
          { idCategory: '8', categoryName: 'Cítricos', categoryType: 'VENTA', status: true },
          { idCategory: '9', categoryName: 'Más Plantas', categoryType: 'VENTA', status: true }
        ]);
      }
    });
  }
  ngOnChanges(c: SimpleChanges): void {
    if (c['product'] || c['mode']) this.fillForm();
  }

  private fillForm(): void {
    if (this.isEdit && this.product) {
      this.form = {
        category: this.product.category || '',
        productName: this.product.productName,
        description: this.product.description || '',
        price: this.product.price,
        availableStock: this.product.availableStock,
        unitMeasurement: this.product.unitMeasurement,
      };
    } else {
      this.form = {
        category: '',
        productName: '',
        description: '',
        price: 0,
        availableStock: 0,
        unitMeasurement: 'UNIDAD',
      };
    }
    this.errors = {};
  }

  validate(): boolean {
    this.errors = {};
    
    const name = this.form.productName.trim();
    if (!name) {
      this.errors['productName'] = 'El nombre es requerido';
    } else if (name.length < 3 || name.length > 100) {
      this.errors['productName'] = 'El nombre debe tener entre 3 y 100 caracteres';
    }

    const desc = this.form.description.trim();
    if (!desc) {
      this.errors['description'] = 'La descripción es requerida';
    } else if (desc.length < 10 || desc.length > 255) {
      this.errors['description'] = 'La descripción debe tener entre 10 y 255 caracteres';
    }

    if (this.form.price <= 0) this.errors['price'] = 'El precio debe ser mayor a 0';
    if (this.form.availableStock < 0) this.errors['availableStock'] = 'El stock no puede ser negativo';
    
    const validUnits = ['UNIDAD', 'KG', 'LITRO', 'SACO', 'SOBRE', 'ROLLO'];
    if (!this.form.unitMeasurement.trim()) {
      this.errors['unitMeasurement'] = 'La unidad es requerida';
    } else if (!validUnits.includes(this.form.unitMeasurement)) {
      this.errors['unitMeasurement'] = 'Unidad no válida (use UNIDAD, KG, LITRO, SACO, SOBRE, ROLLO)';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSave(): void {
    if (!this.validate()) return;
    this.save.emit({ ...this.form });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}