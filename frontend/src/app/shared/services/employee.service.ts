import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../interfaces/employee.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = '/api/employee';

  constructor(private http: HttpClient) { }

  listar(status?: string): Observable<Employee[]> {
    if (status) {
      return this.http.get<Employee[]>(this.apiUrl, { params: { status } });
    }
    return this.http.get<Employee[]>(this.apiUrl);
  }

  listarPorId(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  guardar(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  actualizar(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  eliminarLogico(id: number): Observable<Employee> {
    return this.http.delete<Employee>(`${this.apiUrl}/${id}`);
  }

  restaurar(id: number): Observable<Employee> {
    return this.http.patch<Employee>(`${this.apiUrl}/restaurar/${id}`, {});
  }
}
