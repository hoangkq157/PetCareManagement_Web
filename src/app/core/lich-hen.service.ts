import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LichHen } from './models';

@Injectable({ providedIn: 'root' })
export class LichHenService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/lichHen`;

  getAll(): Observable<LichHen[]>                              { return this.http.get<LichHen[]>(this.api); }
  getById(id: number): Observable<LichHen>                     { return this.http.get<LichHen>(`${this.api}/${id}`); }
  getByThuCung(maTC: number): Observable<LichHen[]>           { return this.http.get<LichHen[]>(`${this.api}/bythuCung/${maTC}`); }
  getByTrangThai(tt: string): Observable<LichHen[]>           { return this.http.get<LichHen[]>(`${this.api}/bytrangThai/${tt}`); }
  create(item: Partial<LichHen>): Observable<LichHen>          { return this.http.post<LichHen>(this.api, item); }
  update(id: number, item: Partial<LichHen>): Observable<void> { return this.http.put<void>(`${this.api}/${id}`, item); }
  updateTrangThai(id: number, tt: string): Observable<void>   { return this.http.patch<void>(`${this.api}/${id}/trangthai`, JSON.stringify(tt), { headers: { 'Content-Type': 'application/json' } }); }
  delete(id: number): Observable<void>                         { return this.http.delete<void>(`${this.api}/${id}`); }
}
