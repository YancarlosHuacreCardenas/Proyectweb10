import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductSale } from '../models/productsale.model';

@Injectable({
  providedIn: 'root'
})
export class ProductSaleService {
  private apiUrl = '/api/product-sale';

  constructor(private http: HttpClient) { }

  private mapIncoming(p: any): ProductSale {
    return {
      ...p,
      productsSaleId: p.id ?? p.productsSaleId,
      category: p.category ?? ''
    };
  }

  private mapOutgoing(p: ProductSale): any {
    return {
      productName: p.productName,
      price: p.price,
      availableStock: p.availableStock,
      unitMeasurement: p.unitMeasurement,
      description: p.description,
      category: p.category
    };
  }

  listar(): Observable<ProductSale[]> {
    return this.http.get<ProductSale[]>(this.apiUrl).pipe(
      map(products => products.map(p => this.mapIncoming(p)))
    );
  }

  listarActivos(): Observable<ProductSale[]> {
    return this.http.get<ProductSale[]>(`${this.apiUrl}/activos`).pipe(
      map(products => products.map(p => this.mapIncoming(p)))
    );
  }

  listarInactivos(): Observable<ProductSale[]> {
    return this.http.get<ProductSale[]>(`${this.apiUrl}/inactivos`).pipe(
      map(products => products.map(p => this.mapIncoming(p)))
    );
  }

  listarPorId(id: string): Observable<ProductSale> {
    return this.http.get<ProductSale>(`${this.apiUrl}/${id}`).pipe(
      map(p => this.mapIncoming(p))
    );
  }

  guardar(productSale: ProductSale): Observable<ProductSale> {
    const body = this.mapOutgoing(productSale);
    return this.http.post<ProductSale>(this.apiUrl, body).pipe(
      map(p => this.mapIncoming(p))
    );
  }

  actualizar(id: string, productSale: ProductSale): Observable<ProductSale> {
    const body = this.mapOutgoing(productSale);
    return this.http.put<ProductSale>(`${this.apiUrl}/${id}`, body).pipe(
      map(p => this.mapIncoming(p))
    );
  }

  eliminar(id: string): Observable<ProductSale> {
    return this.http.patch<ProductSale>(`${this.apiUrl}/eliminar/${id}`, {}).pipe(
      map(p => this.mapIncoming(p))
    );
  }

  restaurar(id: string): Observable<ProductSale> {
    return this.http.patch<ProductSale>(`${this.apiUrl}/restaurar/${id}`, {}).pipe(
      map(p => this.mapIncoming(p))
    );
  }

  exportPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf`, { responseType: 'blob' });
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/excel`, { responseType: 'blob' });
  }
}