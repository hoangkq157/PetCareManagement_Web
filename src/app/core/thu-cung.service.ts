import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ThuCung } from './models';

@Injectable({ providedIn: 'root' })
export class ThuCungService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/thuCung`;

  getAll(): Observable<ThuCung[]>                         { return this.http.get<ThuCung[]>(this.api); }
  getById(id: number): Observable<ThuCung>                { return this.http.get<ThuCung>(`${this.api}/${id}`); }
  getByChuNuoi(maCN: number): Observable<ThuCung[]>       { return this.http.get<ThuCung[]>(`${this.api}/bychuNuoi/${maCN}`); }
  create(item: Partial<ThuCung>): Observable<ThuCung>     { return this.http.post<ThuCung>(this.api, item); }
  update(id: number, item: Partial<ThuCung>): Observable<void> { return this.http.put<void>(`${this.api}/${id}`, item); }
  delete(id: number): Observable<void>                    { return this.http.delete<void>(`${this.api}/${id}`); }
}
