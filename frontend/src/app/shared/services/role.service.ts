import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../interfaces/role.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = '/api/role';

  constructor(private http: HttpClient) { }

  listar(status?: string): Observable<Role[]> {
    let url = this.apiUrl;
    if (status) {
      return this.http.get<Role[]>(url, { params: { status } });
    }
    return this.http.get<Role[]>(url);
  }

  listarPorId(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  guardar(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  actualizar(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  eliminarLogico(id: number): Observable<Role> {
    return this.http.delete<Role>(`${this.apiUrl}/${id}`);
  }

  restaurar(id: number): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/restaurar/${id}`, {});
  }
}
