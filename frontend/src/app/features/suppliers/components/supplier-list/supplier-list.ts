import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supplier, CATEGORY_MAP } from '../../models/supplier.model';
import { SupplierFormComponent } from '../supplier-form/supplier-form';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SupplierFormComponent],
  templateUrl: './supplier-list.html',
  styleUrls: ['./supplier-list.css'],
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  isLoading = false;
  searchQuery = '';
  filterCategoria = '';
  filterEstado = '';
  currentPage = 1;
  pageSize = 5;
  isSaving = false;
  isExporting = false;
  isExportingExcel = false;
  modalMode: 'view' | 'create' | 'edit' | 'delete' | null = null;
  selectedSupplier: Supplier | null = null;
  toasts: { id: number, msg: string, type: 'success' | 'error' }[] = [];

  constructor(
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.isLoading = true;
    const status = this.filterEstado === 'activo' ? true : (this.filterEstado === 'inactivo' ? false : undefined);

    this.supplierService.listar(status).subscribe({
      next: (data: Supplier[]) => {
        this.suppliers = data;
        this.applyLocalFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading suppliers:', err);
        this.showToast('Error al cargar proveedores', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get stats() {
    return {
      total: this.suppliers.length,
      activos: this.suppliers.filter(s => s.status === true).length,
      categorias: new Set(this.suppliers.map(s => s.category?.categoryId)).size,
    };
  }

  get paginatedSuppliers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSuppliers.slice(start, start + this.pageSize);
  }

  get pageNumbers() {
    const totalPages = Math.ceil(this.filteredSuppliers.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  get pageInfo() {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredSuppliers.length);
    return `Mostrando ${start}-${end} de ${this.filteredSuppliers.length} resultados`;
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.applyLocalFilters();
  }

  onFilterCategoryChange() {
    this.applyLocalFilters();
  }

  onFilterStatusChange() {
    this.loadSuppliers(); // Recargar desde el backend
  }

  applyLocalFilters() {
    this.filteredSuppliers = this.suppliers.filter(s => {
      const matchesSearch =
        s.companyName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.ruc.includes(this.searchQuery) ||
        s.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategoria = !this.filterCategoria || s.category?.categoryId?.toString() === this.filterCategoria;
      const matchesEstado = !this.filterEstado || s.status === (this.filterEstado === 'activo');
      return matchesSearch && matchesCategoria && matchesEstado;
    });
    this.currentPage = 1;
  }

  openCreate() {
    this.selectedSupplier = null;
    this.modalMode = 'create';
    this.isSaving = false;
  }

  openView(id?: number) {
    if (id === undefined) return;
    this.selectedSupplier = this.suppliers.find(s => s.supplierId === id) || null;
    this.modalMode = 'view';
  }

  openEdit(id?: number) {
    if (id === undefined) return;
    this.selectedSupplier = this.suppliers.find(s => s.supplierId === id) || null;
    this.modalMode = 'edit';
    this.isSaving = false;
  }

  openDelete(id?: number) {
    if (id === undefined) return;
    this.selectedSupplier = this.suppliers.find(s => s.supplierId === id) || null;
    this.modalMode = 'delete';
  }

  closeModal() {
    this.modalMode = null;
    this.selectedSupplier = null;
    this.isSaving = false;
  }

  onSaveSupplier(formData: Supplier) {
    this.isSaving = true;
    if (this.modalMode === 'edit' && this.selectedSupplier) {
      const statusChanged = formData.status !== this.selectedSupplier.status;

      this.supplierService.actualizar(this.selectedSupplier.supplierId!, formData).subscribe({
        next: () => {
          if (statusChanged) {
            if (formData.status === false) {
              this.supplierService.eliminar(this.selectedSupplier!.supplierId!).subscribe({
                next: () => {
                  this.showToast('Proveedor actualizado e inactivado correctamente', 'success');
                  this.loadSuppliers();
                  this.closeModal();
                },
                error: (err: any) => {
                  this.isSaving = false;
                  console.error('Error inactivating supplier:', err);
                  this.showToast('Error al inactivar proveedor', 'error');
                }
              });
            } else {
              this.supplierService.restaurar(this.selectedSupplier!.supplierId!).subscribe({
                next: () => {
                  this.showToast('Proveedor actualizado y activado correctamente', 'success');
                  this.loadSuppliers();
                  this.closeModal();
                },
                error: (err: any) => {
                  this.isSaving = false;
                  console.error('Error restoring supplier:', err);
                  this.showToast('Error al restaurar proveedor', 'error');
                }
              });
            }
          } else {
            this.showToast('Proveedor actualizado correctamente', 'success');
            this.loadSuppliers();
            this.closeModal();
          }
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error('Error updating supplier:', err);
          this.showToast('Error al actualizar proveedor', 'error');
        }
      });
    } else {
      this.supplierService.guardar(formData).subscribe({
        next: () => {
          this.showToast('Proveedor creado correctamente', 'success');
          this.loadSuppliers();
          this.closeModal();
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error('Error creating supplier:', err);
          this.showToast('Error al crear proveedor', 'error');
        }
      });
    }
  }

  onDeleteSupplier() {
    if (this.selectedSupplier) {
      this.supplierService.eliminar(this.selectedSupplier.supplierId!).subscribe({
        next: () => {
          this.showToast('Proveedor eliminado correctamente', 'success');
          this.loadSuppliers();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Error deleting supplier:', err);
          this.showToast('Error al eliminar proveedor', 'error');
        }
      });
    }
  }

  onRestoreSupplier() {
    if (this.selectedSupplier) {
      this.supplierService.restaurar(this.selectedSupplier.supplierId!).subscribe({
        next: () => {
          this.showToast('Proveedor restaurado correctamente', 'success');
          this.loadSuppliers();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Error restoring supplier:', err);
          this.showToast('Error al restaurar proveedor', 'error');
        }
      });
    }
  }

  exportPdf() {
    this.isExporting = true;
    this.supplierService.exportPdf().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'suppliers.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.showToast('PDF exportado correctamente', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error exporting PDF:', err);
        this.showToast('Error al exportar PDF', 'error');
        this.isExporting = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportExcel() {
    this.isExportingExcel = true;
    this.supplierService.exportExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proveedores_${new Date().toISOString().substring(0, 10)}.xlsx`;
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

  goToPage(page: number) {
    this.currentPage = page;
  }

  getCategoryName(s: Supplier): string {
    return s.category?.categoryName || CATEGORY_MAP[s.category?.categoryId] || 'Desconocido';
  }

  getCategoryColor(s: Supplier): string {
    const name = this.getCategoryName(s);
    const colors: { [key: string]: string } = {
      'Semillas':      'badge-green',
      'Fertilizantes': 'badge-amber',
      'Herramientas':  'badge-blue',
      'Insecticidas':  'badge-pink',
      'Sustratos':     'badge-purple',
      'Envases':       'badge-cyan',
    };
    return colors[name] || 'badge-gray';
  }

  getStatusColor(status: boolean) {
    return status ? 'badge-green' : 'badge-red';
  }

  getStatusLabel(status: boolean) {
    return status ? 'Activo' : 'Inactivo';
  }

  getUbigeoLabel(s: Supplier): string {
    const u = s.ubigeo;
    if (!u) return '—';
    return `${u.department || ''} - ${u.province || ''} - ${u.district || ''}`;
  }

  getAvatarColor(id?: number) {
    const colors = ['purple', 'blue', 'green', 'amber', 'pink'];
    return colors[(id || 0) % colors.length];
  }

  getInitials(nombre: string) {
    if (!nombre) return '??';
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
