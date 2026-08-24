import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = '/api/v1/customer';

  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  listar(status?: boolean, type?: string): Observable<Customer[]> {
    let params: any = {};
    if (status !== undefined) params.status = status;
    if (type) params.type = type;
    return this.http.get<Customer[]>(this.apiUrl, { params });
  }

  listarPorId(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  registrar(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  guardar(customer: Customer): Observable<Customer> {
    return this.registrar(customer);
  }

  actualizar(id: string, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  eliminar(id: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/eliminar/${id}`, {});
  }

  restaurar(id: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/restaurar/${id}`, {});
  }
}