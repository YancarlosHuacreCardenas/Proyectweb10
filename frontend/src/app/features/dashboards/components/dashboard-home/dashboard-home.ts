import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CustomerService }     from '../../../../features/customers/services/customer.service';
export type OrderResponse = any;
export type ProductSupply = any;
const MIN_STOCK_MAP: any = {};
import { ProductSaleService }  from '../../../../features/productsale/services/productsale.service';
import { ProductSale }         from '../../../../features/productsale/models/productsale.model';

interface StatCard {
  icon:       string;
  label:      string;
  value:      string;
  sub1:       string;
  sub2:       string;
  badge:      string;
  badgeClass: string;
  colorClass: string;
}

interface StockAlert {
  name:       string;
  current:    number;
  min:        number;
  unit:       string;
  percent:    number;
  colorClass: string;
}

interface WeekData {
  label:    string;
  arandano: number;
  citrico:  number;
  frutal:   number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardComponent implements OnInit {

  private customerSvc       = inject(CustomerService);
  private orderSvc          = { listar: () => of([] as any[]) };
  private saleSvc           = { listar: () => of([] as any[]) };
  private productSaleSvc    = inject(ProductSaleService);
  private productSupplySvc  = { listar: () => of([] as any[]), listarActivos: () => of([] as any[]) };
  private cdr               = inject(ChangeDetectorRef);

  // Umbral de stock bajo para productos de venta
  private readonly UMBRAL_PRODUCTOS = 20;

  today       = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  lastUpdated = 'Actualizando...';

  isLoading   = signal(true);
  error       = signal<string | null>(null);

  statCards:   StatCard[]    = [];
  statCards2:  StatCard[]    = [];
  weekData:    WeekData[]    = [];
  maxBarValue  = 7000;
  stockAlerts: StockAlert[]  = [];   // panel lateral → insumos
  orders:      OrderResponse[] = [];

  ngOnInit(): void { this.loadDashboardData(); }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      customers: this.customerSvc.listar().pipe(catchError(() => of([]))),
      orders:    this.orderSvc.listar().pipe(catchError(() => of([]))),
      sales:     this.saleSvc.listar().pipe(catchError(() => of([]))),
      // KPI 3 fila 1: productos de venta con bajo stock
      products:  this.productSaleSvc.listar().pipe(catchError(() => of([]))),
      // Panel lateral: insumos con bajo stock por categoría
      supplies:  this.productSupplySvc.listarActivos().pipe(
                   catchError(() => this.productSupplySvc.listar().pipe(catchError(() => of([]))))
                 ),
    }).subscribe({
      next: ({ customers, orders, sales, products, supplies }) => {

        const salesArr     = sales     as any[];
        const ordersArr    = orders    as any[];
        const customersArr = customers as any[];
        const productsArr  = products  as ProductSale[];
        const suppliesArr  = supplies  as ProductSupply[];

        // ── KPI 1: Total ventas completadas (todas, sin filtro de mes) ─────
        const completadas = salesArr.filter(s =>
          (s.status ?? '').toLowerCase().startsWith('complet')
        );
        const totalVentasCompletadas = completadas
          .reduce((acc, s) => acc + Number(s.totalCost ?? 0), 0);

        // ── KPI 2: Pedidos pendientes ──────────────────────────────────────
        const pedidosPendientes = ordersArr
          .filter(o => (o.status ?? '').toLowerCase() === 'pendiente').length;

        // ── KPI 3: Productos de VENTA con stock bajo umbral ────────────────
        const productosBajoStock = productsArr
          .filter(p => (p.availableStock ?? 0) < this.UMBRAL_PRODUCTOS && !p.deletedAt);

        // ── Fila 2: Clientes activos ───────────────────────────────────────
        const clientesActivos = customersArr.filter(c => c.status === true).length;
        const enProceso       = ordersArr
          .filter(o => (o.status ?? '').toLowerCase().includes('proceso')).length;

        // ── Panel lateral: INSUMOS bajo mínimo por categoría ──────────────
        const insumosBajoStock = suppliesArr.filter(s => {
          const catId  = s.category?.categoryId ?? 0;
          const minimo = MIN_STOCK_MAP[catId] ?? 20;
          return (s.availableStock ?? 0) < minimo && !s.deletedAt;
        });

        // ── Stat cards FILA 1 ─────────────────────────────────────────────
        this.statCards = [
          {
            icon:       'chart',
            label:      'VENTAS COMPLETADAS',
            value:      `S/ ${totalVentasCompletadas.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            sub1:       `${completadas.length} ventas completadas`,
            sub2:       'Total acumulado de ventas',
            badge:      `${salesArr.length} ventas`,
            badgeClass: 'badge-up',
            colorClass: 'card-purple',
          },
          {
            icon:       'box',
            label:      'PEDIDOS PENDIENTES',
            value:      pedidosPendientes.toString(),
            sub1:       '',
            sub2:       'Requieren atención',
            badge:      `${ordersArr.length} pedidos totales`,
            badgeClass: 'badge-warn',
            colorClass: 'card-red',
          },
          {
            // KPI 3 = stock de PRODUCTOS DE VENTA (< UMBRAL_PRODUCTOS unidades)
            icon:       'alert',
            label:      'STOCK DE PRODUCTOS',
            value:      productosBajoStock.length.toString(),
            sub1:       `productos con stock < ${this.UMBRAL_PRODUCTOS} unid.`,
            sub2:       productosBajoStock.length > 0 ? 'Revisar inventario de productos' : 'Stock en niveles normales',
            badge:      productosBajoStock.length > 0 ? `${productosBajoStock.length} críticos` : 'OK',
            badgeClass: productosBajoStock.length > 0 ? 'badge-danger' : 'badge-up',
            colorClass: 'card-amber',
          },
        ];

        // ── Stat cards FILA 2 ─────────────────────────────────────────────
        this.statCards2 = [
          {
            icon:       'users',
            label:      'CLIENTES ACTIVOS',
            value:      clientesActivos.toString(),
            sub1:       'registrados',
            sub2:       `${customersArr.length} clientes en total`,
            badge:      `${customersArr.filter(c => c.status === false).length} inactivos`,
            badgeClass: 'badge-up',
            colorClass: 'card-teal',
          },
          {
            icon:       'plant',
            label:      'PEDIDOS EN PROCESO',
            value:      enProceso.toString(),
            sub1:       'en proceso',
            sub2:       `${ordersArr.filter(o => (o.status ?? '').toLowerCase() === 'entregado').length} entregados`,
            badge:      '',
            badgeClass: 'badge-info',
            colorClass: 'card-green',
          },
          {
            icon:       'truck',
            label:      'INGRESOS TOTALES',
            value:      `S/ ${totalVentasCompletadas.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            sub1:       'de ventas completadas',
            sub2:       `${salesArr.length} ventas registradas`,
            badge:      '',
            badgeClass: 'badge-down',
            colorClass: 'card-indigo',
          },
        ];

        // ── Panel lateral: top 3 INSUMOS con menor stock ──────────────────
        // (etiquetado como "Alerta de Stock Insumos" en el HTML)
        this.stockAlerts = insumosBajoStock
          .sort((a, b) => (a.availableStock ?? 0) - (b.availableStock ?? 0))
          .slice(0, 3)
          .map(s => {
            const catId  = s.category?.categoryId ?? 0;
            const minimo = MIN_STOCK_MAP[catId] ?? 20;
            const pct    = minimo > 0
              ? Math.round(((s.availableStock ?? 0) / minimo) * 100)
              : 0;
            return {
              name:       s.productName,
              current:    s.availableStock ?? 0,
              min:        minimo,
              unit:       s.unitMeasurement ?? 'unid.',
              percent:    Math.min(pct, 100),
              colorClass: pct <= 25 ? 'bar-red' : pct <= 50 ? 'bar-orange' : 'bar-yellow',
            };
          });

        // ── Últimos 6 pedidos ──────────────────────────────────────────────
        this.orders = [...ordersArr]
          .sort((a, b) => (b.orderId ?? 0) - (a.orderId ?? 0))
          .slice(0, 6) as OrderResponse[];

        // ── Gráfico semanal ────────────────────────────────────────────────
        this.buildWeekData(salesArr);

        this.isLoading.set(false);
        this.lastUpdated = `Actualizado a las ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor');
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  private buildWeekData(sales: any[]): void {
    const weeks: WeekData[] = [
      { label: 'Sem 1', arandano: 0, citrico: 0, frutal: 0 },
      { label: 'Sem 2', arandano: 0, citrico: 0, frutal: 0 },
      { label: 'Sem 3', arandano: 0, citrico: 0, frutal: 0 },
      { label: 'Sem 4', arandano: 0, citrico: 0, frutal: 0 },
    ];
    sales.forEach(s => {
      const d = new Date(s.saleDate ?? s.createdAt ?? '');
      if (isNaN(d.getTime())) return;
      const weekIdx = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
      weeks[weekIdx].arandano += Number(s.totalCost ?? 0);
    });
    this.weekData = weeks;
    this.calculateMaxBarValue();
  }

  calculateMaxBarValue(): void {
    if (!this.weekData.length) { this.maxBarValue = 1000; return; }
    const max = Math.max(...this.weekData.flatMap(w => [w.arandano, w.citrico, w.frutal]), 1);
    this.maxBarValue = Math.ceil(max / 1000) * 1000 || 1000;
  }

  getBarHeight(value: number): number {
    return this.maxBarValue > 0 ? Math.round((value / this.maxBarValue) * 100) : 0;
  }

  formatId(id?: number) { return id ? `#PED-${String(id).padStart(4, '0')}` : '—'; }
  getCustomerName(o: OrderResponse):   string { return o.customerName  ?? `Cliente #${o.idCustomer}`; }
  getCustomerInitial(o: OrderResponse): string { return (o.customerName ?? '?').charAt(0).toUpperCase(); }
  getEmployeeName(o: OrderResponse):   string { return o.employeeName  ?? `Empleado #${o.employeeId}`; }

  formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  formatCurrency(v?: number) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v ?? 0);
  }
  isDeliveryUrgent(d?: string) {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff >= 0 && diff < 3 * 86400000;
  }
  isDeliveryOverdue(d?: string) {
    if (!d) return false;
    return new Date(d).getTime() < Date.now();
  }
  statusClass(s?: string) {
    switch (s?.toLowerCase()) {
      case 'pendiente':  return 'status-pending';
      case 'en proceso': return 'status-process';
      case 'enviado':    return 'status-sent';
      case 'entregado':  return 'status-done';
      case 'cancelado':  return 'status-cancelled';
      default:           return 'status-pending';
    }
  }
  dotClass(s?: string) {
    switch (s?.toLowerCase()) {
      case 'pendiente':  return 'dot-amber';
      case 'en proceso': return 'dot-blue';
      case 'enviado':    return 'dot-indigo';
      case 'entregado':  return 'dot-green';
      case 'cancelado':  return 'dot-red';
      default:           return 'dot-gray';
    }
  }
}
