import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private apiUrl = '/api/v1/supplier';

  constructor(private http: HttpClient) { }

  listar(status?: boolean): Observable<Supplier[]> {
    let params: any = {};
    if (status !== undefined) params.status = status;
    return this.http.get<Supplier[]>(this.apiUrl, { params });
  }

  listarPorId(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  guardar(supplier: Supplier): Observable<Supplier> {
    const payload = {
      companyName: supplier.companyName,
      ruc: supplier.ruc,
      phone: Number(supplier.phone),
      email: supplier.email,
      address: supplier.address,
      status: supplier.status,
      ubigeoCode: supplier.ubigeo?.ubigeoCode,
      categoryId: supplier.category?.categoryId
    };
    return this.http.post<Supplier>(this.apiUrl, payload);
  }

  actualizar(id: number, supplier: Supplier): Observable<Supplier> {
    const payload = {
      companyName: supplier.companyName,
      ruc: supplier.ruc,
      phone: Number(supplier.phone),
      email: supplier.email,
      address: supplier.address,
      status: supplier.status,
      ubigeoCode: supplier.ubigeo?.ubigeoCode,
      categoryId: supplier.category?.categoryId
    };
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/eliminar/${id}`, {});
  }

  restaurar(id: number): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/restaurar/${id}`, {});
  }

  exportPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf`, { responseType: 'blob' });
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/excel`, { responseType: 'blob' });
  }
}