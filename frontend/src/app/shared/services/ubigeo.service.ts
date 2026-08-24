import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ubigeo } from '../interfaces/ubigeo.interface';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private apiUrl = '/api/v1/ubigeo';

  constructor(private http: HttpClient) { }

  listar(): Observable<Ubigeo[]> {
    return this.http.get<Ubigeo[]>(this.apiUrl);
  }
}
