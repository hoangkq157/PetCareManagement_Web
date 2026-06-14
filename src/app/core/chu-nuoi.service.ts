import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChuNuoi } from './models';

@Injectable({ providedIn: 'root' })
export class ChuNuoiService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/chuNuoi`;

  getAll(): Observable<ChuNuoi[]>                           { return this.http.get<ChuNuoi[]>(this.api); }
  getById(id: number): Observable<ChuNuoi>                  { return this.http.get<ChuNuoi>(`${this.api}/${id}`); }
  create(item: Partial<ChuNuoi>): Observable<ChuNuoi>       { return this.http.post<ChuNuoi>(this.api, item); }
  update(id: number, item: Partial<ChuNuoi>): Observable<void> { return this.http.put<void>(`${this.api}/${id}`, item); }
  delete(id: number): Observable<void>                      { return this.http.delete<void>(`${this.api}/${id}`); }
}
