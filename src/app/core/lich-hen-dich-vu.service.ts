import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LichHenDichVu } from './models';

@Injectable({ providedIn: 'root' })
export class LichHenDichVuService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/lichHenDichVu`;

  getAll(): Observable<LichHenDichVu[]>                               { return this.http.get<LichHenDichVu[]>(this.api); }
  getByLichHen(maLH: number): Observable<LichHenDichVu[]>             { return this.http.get<LichHenDichVu[]>(`${this.api}/bylichHen/${maLH}`); }
  create(item: Partial<LichHenDichVu>): Observable<LichHenDichVu>     { return this.http.post<LichHenDichVu>(this.api, item); }
  delete(id: number): Observable<void>                                 { return this.http.delete<void>(`${this.api}/${id}`); }
}
