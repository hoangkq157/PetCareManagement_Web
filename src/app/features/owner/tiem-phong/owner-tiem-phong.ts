import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService }    from '../../../core/auth.service';
import { ThuCungService } from '../../../core/thu-cung.service';
import { TiemPhongService } from '../../../core/tiem-phong.service';
import { TiemPhong, ThuCung } from '../../../core/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-owner-tiem-phong',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-tiem-phong.html',
  styleUrl: './owner-tiem-phong.css'
})
export class OwnerTiemPhongComponent implements OnInit {
  private auth  = inject(AuthService);
  private tcSvc = inject(ThuCungService);
  private svc   = inject(TiemPhongService);

  loading  = signal(true);
  data     = signal<TiemPhong[]>([]);
  thuCungs = signal<ThuCung[]>([]);

  ngOnInit(): void {
    const maCN = this.auth.user()?.id;
    if (!maCN) { this.loading.set(false); return; }
    this.tcSvc.getByChuNuoi(maCN).subscribe(tc => {
      this.thuCungs.set(tc);
      if (tc.length === 0) { this.loading.set(false); return; }
      forkJoin(tc.map(t => this.svc.getByThuCung(t.maTC))).subscribe({
        next: results => {
          this.data.set(results.flat().sort((a, b) => b.ngayTiem.localeCompare(a.ngayTiem)));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }

  getThuCungTen(maTC: number): string {
    return this.thuCungs().find(t => t.maTC === maTC)?.tenThuCung ?? `TC#${maTC}`;
  }

  isSapHan(tp: TiemPhong): boolean {
    if (!tp.ngayTiemTiep) return false;
    const diff = new Date(tp.ngayTiemTiep).getTime() - Date.now();
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  }
}
