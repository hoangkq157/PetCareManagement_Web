import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DichVu } from './models';

@Injectable({ providedIn: 'root' })
export class DichVuService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/dichVu`;

  getAll(): Observable<DichVu[]>                              { return this.http.get<DichVu[]>(this.api); }
  getById(id: number): Observable<DichVu>                    { return this.http.get<DichVu>(`${this.api}/${id}`); }
  getByDanhMuc(dm: string): Observable<DichVu[]>             { return this.http.get<DichVu[]>(`${this.api}/danhmuc/${dm}`); }
  create(item: Partial<DichVu>): Observable<DichVu>          { return this.http.post<DichVu>(this.api, item); }
  update(id: number, item: Partial<DichVu>): Observable<void>{ return this.http.put<void>(`${this.api}/${id}`, item); }
  delete(id: number): Observable<void>                       { return this.http.delete<void>(`${this.api}/${id}`); }
}
