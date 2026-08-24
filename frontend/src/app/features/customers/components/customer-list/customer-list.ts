import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';
import { CustomerFormComponent } from '../customer-form/customer-form';
import { CustomerService } from '../../services/customer.service';
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerFormComponent],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.css'],
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = false;
  searchQuery = '';
  filterTipo = '';
  filterEstado = '';
  currentPage = 1;
  pageSize = 5;

  modalMode: 'view' | 'create' | 'edit' | 'delete' | null = null;
  selectedCustomer: Customer | null = null;
  toasts: { id: number, msg: string, type: 'success' | 'error' }[] = [];

  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    const status = this.filterEstado === 'activo' ? true : (this.filterEstado === 'inactivo' ? false : undefined);
    const type = this.filterTipo || undefined;

    this.customerService.listar(status, type).subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
        this.applyLocalFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading customers', err);
        this.showToast('Error al cargar clientes', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get stats() {
    return {
      total: this.customers.length,
      activos: this.customers.filter(c => c.status === true).length,
      empresas: this.customers.filter(c => c.customerType?.toUpperCase() === 'EMPRESA').length,
      personas: this.customers.filter(c => c.customerType?.toUpperCase() === 'NATURAL').length,
    };
  }

  get paginatedCustomers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCustomers.slice(start, start + this.pageSize);
  }

  get pageNumbers() {
    const totalPages = Math.ceil(this.filteredCustomers.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  get pageInfo() {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredCustomers.length);
    return `Mostrando ${start}-${end} de ${this.filteredCustomers.length} resultados`;
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.applyLocalFilters();
  }

  onFilterTypeChange() {
    this.loadCustomers(); // Recargar desde el backend
  }

  onFilterStatusChange() {
    this.loadCustomers(); // Recargar desde el backend
  }

  applyLocalFilters() {
    // Filtro de búsqueda local sobre los datos ya filtrados por el backend
    this.filteredCustomers = this.customers.filter(c => {
      const fullName = `${c.customerName} ${c.customerLastname}`.toLowerCase();
      const matchesSearch = fullName.includes(this.searchQuery.toLowerCase()) ||
                          c.documentNumber.includes(this.searchQuery) ||
                          c.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesSearch;
    });
    this.currentPage = 1;
  }

  openCreate() {
    this.selectedCustomer = null;
    this.modalMode = 'create';
  }

  openView(id?: string) {
    if (id === undefined) return;
    this.selectedCustomer = this.customers.find(c => c.idCustomer === id) || null;
    this.modalMode = 'view';
  }

  openEdit(id?: string) {
    if (id === undefined) return;
    this.selectedCustomer = this.customers.find(c => c.idCustomer === id) || null;
    this.modalMode = 'edit';
  }

  openDelete(id?: string) {
    if (id === undefined) return;
    this.selectedCustomer = this.customers.find(c => c.idCustomer === id) || null;
    this.modalMode = 'delete';
  }

  closeModal() {
    this.modalMode = null;
    this.selectedCustomer = null;
  }

  onSaveCustomer(formData: any) {
    if (this.modalMode === 'edit' && this.selectedCustomer) {
      this.customerService.actualizar(this.selectedCustomer.idCustomer!, formData).subscribe({
        next: () => {
          this.showToast('Cliente actualizado correctamente', 'success');
          this.loadCustomers();
          this.closeModal();
        },
        error: (err: any) => this.showToast('Error al actualizar cliente', 'error')
      });
    } else {
      this.customerService.guardar(formData).subscribe({
        next: () => {
          this.showToast('Cliente creado correctamente', 'success');
          this.loadCustomers();
          this.closeModal();
        },
        error: (err: any) => this.showToast('Error al crear cliente', 'error')
      });
    }
  }

  onDeleteCustomer() {
    if (this.selectedCustomer) {
      this.customerService.eliminar(this.selectedCustomer.idCustomer!).subscribe({
        next: () => {
          this.showToast('Cliente eliminado correctamente', 'success');
          this.loadCustomers();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Error deleting customer', err);
          this.showToast('Error al eliminar cliente', 'error');
        }
      });
    }
  }

  onRestoreCustomer() {
    if (this.selectedCustomer) {
      this.customerService.restaurar(this.selectedCustomer.idCustomer!).subscribe({
        next: () => {
          this.showToast('Cliente restaurado correctamente', 'success');
          this.loadCustomers();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Error restoring customer', err);
          this.showToast('Error al restaurar cliente', 'error');
        }
      });
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  getTypeColor(tipo: string) {
    return tipo === 'Empresa' ? 'badge-purple' : 'badge-amber';
  }

  getStatusColor(estado: boolean) {
    if (estado === true) return 'badge-green';
    if (estado === false) return 'badge-red';
    return 'badge-gray';
  }

  formatCompras(monto?: number) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto || 0);
  }

  getAvatarColor(id?: string) {
    const colors = ['purple', 'blue', 'green', 'amber', 'pink'];
    const num = id ? parseInt(id.slice(-2), 16) : 0;
    return colors[num % colors.length];
  }

  getInitials(nombre: string, apellido: string) {
    return (nombre[0] || '') + (apellido[0] || '').toUpperCase();
  }

  showToast(msg: string, type: 'success' | 'error') {
    const id = Date.now();
    this.toasts.push({ id, msg, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }

  // ── EXPORTAR EXCEL — usa endpoint del backend ────────────────────────────
  exportExcel(): void {
    const link = document.createElement('a');
    link.href     = '/api/customer/excel';
    link.download = `clientes_${new Date().toISOString().substring(0, 10)}.xlsx`;
    link.click();
    this.showToast('Descargando Excel...', 'success');
  }

  // ── EXPORTAR PDF — usa endpoint del backend ───────────────────────────────
  exportPDF(): void {
    const link = document.createElement('a');
    link.href     = '/api/customer/pdf';
    link.download = `clientes_${new Date().toISOString().substring(0, 10)}.pdf`;
    link.click();
    this.showToast('Descargando PDF...', 'success');
  }
}
