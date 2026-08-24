import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductSale } from '../../models/productsale.model';
import { ProductSaleFormComponent } from './../productsale-form/productsale-form';
import { ProductSaleService } from '../../services/productsale.service';
import { CategoryService, Category } from '../../../../shared/services/category.service';

@Component({
  selector: 'app-productsale-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductSaleFormComponent],
  templateUrl: './productsale-list.html',
  styleUrls: ['./productsale-list.css'],
})
export class ProductSaleListComponent implements OnInit {
  products: ProductSale[] = [];
  filteredProducts: ProductSale[] = [];
  isLoading = false;
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'deleted' = 'active';
  currentPage = 1;
  pageSize = 6;

  modalMode: 'view' | 'create' | 'edit' | 'delete' | 'restore' | null = null;
  selectedProduct: ProductSale | null = null;
  toasts: { id: number, msg: string, type: 'success' | 'error' }[] = [];
  isExportingExcel = false;
  isExportingPdf = false;

  private categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);

  constructor(
    private productSaleService: ProductSaleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.listar().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('No se pudieron cargar categorías en la lista:', err);
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
        this.cdr.detectChanges();
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productSaleService.listar().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.showToast('Error al cargar productos', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get stats() {
    return {
      total: this.products.length,
      active: this.products.filter(p => !p.deletedAt).length,
      deleted: this.products.filter(p => p.deletedAt).length,
      lowStock: this.products.filter(p => !p.deletedAt && p.availableStock > 0 && p.availableStock < 10).length,
      outOfStock: this.products.filter(p => !p.deletedAt && p.availableStock === 0).length,
      totalStock: this.products.reduce((acc, p) => acc + (p.availableStock || 0), 0),
    };
  }

  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get pageNumbers() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = p.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      let matchesStatus = true;
      if (this.filterStatus === 'active') matchesStatus = !p.deletedAt;
      else if (this.filterStatus === 'deleted') matchesStatus = !!p.deletedAt;
      
      return matchesSearch && matchesStatus;
    });
    this.currentPage = 1;
  }

  openCreate() {
    this.selectedProduct = null;
    this.modalMode = 'create';
  }

  openEdit(id: string) {
    this.selectedProduct = this.products.find(p => p.productsSaleId === id || p.id === id) || null;
    this.modalMode = 'edit';
  }

  openDelete(id: string) {
    this.selectedProduct = this.products.find(p => p.productsSaleId === id || p.id === id) || null;
    this.modalMode = 'delete';
  }

  openRestore(id: string) {
    this.selectedProduct = this.products.find(p => p.productsSaleId === id || p.id === id) || null;
    this.modalMode = 'restore';
  }

  closeModal() {
    this.modalMode = null;
    this.selectedProduct = null;
  }

  onSaveProduct(formData: any) {
    if (this.modalMode === 'edit' && this.selectedProduct) {
      this.productSaleService.actualizar(this.selectedProduct.productsSaleId!, { ...this.selectedProduct, ...formData }).subscribe({
        next: (updatedProduct) => {
          this.loadProducts(); // Recargar para asegurar consistencia
          this.closeModal();
          this.showToast('Producto actualizado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.showToast('Error al actualizar producto', 'error');
        }
      });
    } else {
      this.productSaleService.guardar(formData).subscribe({
        next: (newProduct) => {
          this.loadProducts();
          this.closeModal();
          this.showToast('Producto creado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.showToast('Error al crear producto', 'error');
        }
      });
    }
  }

  onDeleteProduct() {
    if (this.selectedProduct) {
      this.productSaleService.eliminar(this.selectedProduct.productsSaleId!).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
          this.showToast('Producto eliminado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.showToast('Error al eliminar producto', 'error');
        }
      });
    }
  }

  onRestoreProduct() {
    if (this.selectedProduct) {
      this.productSaleService.restaurar(this.selectedProduct.productsSaleId!).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
          this.showToast('Producto restaurado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error restoring product:', err);
          this.showToast('Error al restaurar producto', 'error');
        }
      });
    }
  }

  exportExcel() {
    this.isExportingExcel = true;
    this.productSaleService.exportExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos_venta_${new Date().toISOString().substring(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExportingExcel = false;
        this.showToast('Excel exportado correctamente', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error exporting Excel:', err);
        this.showToast('Error al exportar Excel', 'error');
        this.isExportingExcel = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportPdf() {
    this.isExportingPdf = true;
    this.productSaleService.exportPdf().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos_venta_${new Date().toISOString().substring(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExportingPdf = false;
        this.showToast('PDF exportado correctamente', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error exporting PDF:', err);
        this.showToast('Error al exportar PDF', 'error');
        this.isExportingPdf = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  formatPrice(monto: number) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto);
  }

  getAvatarColor(id: number) {
    const colors = ['purple', 'blue', 'green', 'amber', 'pink'];
    return colors[id % colors.length];
  }

  getInitials(nombre: string) {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  showToast(msg: string, type: 'success' | 'error') {
    const id = Date.now();
    this.toasts.push({ id, msg, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }
}