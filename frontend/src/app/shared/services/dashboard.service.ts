import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  ventasMes: number;
  pedidosPendientes: number;
  alertasStock: number;
  clientesActivos: number;
  plantasDisponibles: number;
  comprasProveedor: number;
}

export interface VentasSemana {
  semana: string;
  arandano: number;
  citrico: number;
  frutal: number;
}

export interface StockCritico {
  nombre: string;
  categoria: string;
  cantidadActual: number;
  cantidadMinima: number;
  unidad: string;
}

export interface PedidoPendiente {
  orderId: number;
  cliente: string;
  producto: string;
  empleado: string;
  fechaPedido: string;
  fechaEntrega: string;
  estado: string;
  total: number;
}

export interface VentasMensuales {
  mes: string;
  arandano: number;
  citrico: number;
  frutal: number;
}

export interface ReportesAnuales {
  totalVentas: number;
  pedidosPendientes: number;
  alertasStock: number;
  mejorMes: string;
  mejorMesVenta: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  // Dashboard endpoints
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getVentasSemana(): Observable<VentasSemana[]> {
    return this.http.get<VentasSemana[]>(`${this.apiUrl}/ventas-semana`);
  }

  getStockCritico(): Observable<StockCritico[]> {
    return this.http.get<StockCritico[]>(`${this.apiUrl}/stock-critico`);
  }

  getPedidosPendientes(): Observable<PedidoPendiente[]> {
    return this.http.get<PedidoPendiente[]>(`${this.apiUrl}/pedidos-pendientes`);
  }

  // Reportes endpoints
  getVentasMensuales(year: number): Observable<VentasMensuales[]> {
    return this.http.get<VentasMensuales[]>(`${this.apiUrl}/ventas-mensuales/${year}`);
  }

  getReportesAnuales(year: number): Observable<ReportesAnuales> {
    return this.http.get<ReportesAnuales>(`${this.apiUrl}/reportes-anuales/${year}`);
  }
}
