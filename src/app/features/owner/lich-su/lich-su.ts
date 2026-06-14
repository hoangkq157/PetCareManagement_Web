import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService }    from '../../../core/auth.service';
import { ThuCungService } from '../../../core/thu-cung.service';
import { LichHenService } from '../../../core/lich-hen.service';
import { LichHenDichVuService } from '../../../core/lich-hen-dich-vu.service';
import { DichVuService }  from '../../../core/dich-vu.service';
import { LichHen, ThuCung, LichHenDichVu, DichVu } from '../../../core/models';
import { forkJoin } from 'rxjs';

interface LichHenRow extends LichHen {
  tenThuCung: string;
  dichVu?: string;
  donGia?: number;
}

@Component({
  selector: 'app-lich-su',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lich-su.html',
  styleUrl: './lich-su.css'
})
export class LichSuComponent implements OnInit {
  private auth    = inject(AuthService);
  private tcSvc   = inject(ThuCungService);
  private lhSvc   = inject(LichHenService);
  private lhdvSvc = inject(LichHenDichVuService);
  private dvSvc   = inject(DichVuService);

  loading = signal(true);
  data    = signal<LichHenRow[]>([]);
  msg     = signal('');

  ngOnInit(): void {
    const maCN = this.auth.user()?.id;
    if (!maCN) { this.loading.set(false); return; }

    forkJoin({
      tc: this.tcSvc.getByChuNuoi(maCN),
      lh: this.lhSvc.getAll(),
      dv: this.dvSvc.getAll()
    }).subscribe({
      next: async res => {
        const maTC = res.tc.map(t => t.maTC);
        const myLH = res.lh
          .filter(l => maTC.includes(l.maTC))
          .sort((a, b) => b.ngayHen.localeCompare(a.ngayHen));

        const rows: LichHenRow[] = [];
        for (const lh of myLH) {
          const tc = res.tc.find(t => t.maTC === lh.maTC);
          const lhdv = await this.lhdvSvc.getByLichHen(lh.maLH).toPromise().catch(() => []) as LichHenDichVu[];
          const dv   = lhdv.length > 0 ? res.dv.find(d => d.maDV === lhdv[0].maDV) : undefined;
          rows.push({ ...lh, tenThuCung: tc?.tenThuCung ?? `TC#${lh.maTC}`, dichVu: dv?.tenDichVu, donGia: lhdv[0]?.donGia });
        }
        this.data.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  huy(maLH: number): void {
    if (!confirm('Huỷ lịch hẹn này?')) return;
    this.lhSvc.updateTrangThai(maLH, 'Huy').subscribe({
      next: () => {
        this.data.update(d => d.map(l => l.maLH === maLH ? { ...l, trangThai: 'Huy' } : l));
        this.msg.set('Đã huỷ lịch hẹn.'); setTimeout(() => this.msg.set(''), 3000);
      },
      error: () => {}
    });
  }

  badgeClass(tt: string): string {
    const m: Record<string, string> = { ChoDuyet: 'badge-warning', XacNhan: 'badge-info', HoanThanh: 'badge-success', Huy: 'badge-danger' };
    return m[tt] ?? 'badge-secondary';
  }
  labelTT(tt: string): string {
    const m: Record<string, string> = { ChoDuyet: 'Chờ duyệt', XacNhan: 'Đã xác nhận', HoanThanh: 'Hoàn thành', Huy: 'Đã huỷ' };
    return m[tt] ?? tt;
  }
  fmt(n?: number): string { return n ? n.toLocaleString('vi-VN') + ' ₫' : '—'; }
}
