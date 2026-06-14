import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TiemPhong } from './models';

@Injectable({ providedIn: 'root' })
export class TiemPhongService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/tiemPhong`;

  getAll(): Observable<TiemPhong[]>                                { return this.http.get<TiemPhong[]>(this.api); }
  getById(id: number): Observable<TiemPhong>                      { return this.http.get<TiemPhong>(`${this.api}/${id}`); }
  getByThuCung(maTC: number): Observable<TiemPhong[]>            { return this.http.get<TiemPhong[]>(`${this.api}/bythuCung/${maTC}`); }
  getSapDenHan(): Observable<TiemPhong[]>                         { return this.http.get<TiemPhong[]>(`${this.api}/sapdenhan`); }
  create(item: Partial<TiemPhong>): Observable<TiemPhong>         { return this.http.post<TiemPhong>(this.api, item); }
  update(id: number, item: Partial<TiemPhong>): Observable<void>  { return this.http.put<void>(`${this.api}/${id}`, item); }
  delete(id: number): Observable<void>                            { return this.http.delete<void>(`${this.api}/${id}`); }
}
