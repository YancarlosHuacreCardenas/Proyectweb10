import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  idCategory: string;
  categoryName: string;
  categoryType: string;
  status: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = '/api/v1/category';

  constructor(private http: HttpClient) { }

  listar(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}
