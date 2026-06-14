import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService }         from '../../../core/auth.service';
import { ThuCungService }      from '../../../core/thu-cung.service';
import { DichVuService }       from '../../../core/dich-vu.service';
import { LichHenService }      from '../../../core/lich-hen.service';
import { LichHenDichVuService } from '../../../core/lich-hen-dich-vu.service';
import { ThuCung, DichVu } from '../../../core/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dat-lich',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dat-lich.html',
  styleUrl: './dat-lich.css'
})
export class DatLichComponent implements OnInit {
  private auth    = inject(AuthService);
  private tcSvc   = inject(ThuCungService);
  private dvSvc   = inject(DichVuService);
  private lhSvc   = inject(LichHenService);
  private lhdvSvc = inject(LichHenDichVuService);

  loading   = signal(true);
  thuCungs  = signal<ThuCung[]>([]);
  dichVus   = signal<DichVu[]>([]);
  saving    = signal(false);
  error     = signal('');
  success   = signal('');

  maTC    = signal(0);
  maDV    = signal(0);
  ngayHen = signal('');
  gioHen  = signal('09:00');
  ghiChu  = signal('');

  selectedDV = computed(() => this.dichVus().find(d => d.maDV === this.maDV()));
  selectedTC = computed(() => this.thuCungs().find(t => t.maTC === this.maTC()));

  giaHienTai = computed(() => {
    const dv = this.selectedDV();
    const tc = this.selectedTC();
    if (!dv || !tc) return 0;
    return tc.loai === 'Chó' ? dv.giaCho : tc.loai === 'Mèo' ? dv.giaMeo : dv.giaKhac;
  });

  danhMucList = computed(() => {
    const set = new Set(this.dichVus().map(d => d.danhMuc ?? 'Khác'));
    return [...set];
  });

  ngOnInit(): void {
    const maCN = this.auth.user()?.id;
    if (!maCN) { this.loading.set(false); return; }
    forkJoin({ tc: this.tcSvc.getByChuNuoi(maCN), dv: this.dvSvc.getAll() }).subscribe({
      next: res => {
        this.thuCungs.set(res.tc);
        this.dichVus.set(res.dv);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  datLich(): void {
    if (!this.maTC() || !this.ngayHen() || !this.gioHen()) {
      this.error.set('Vui lòng chọn thú cưng, ngày và giờ hẹn.'); return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (this.ngayHen() < today) { this.error.set('Ngày hẹn không thể là ngày trong quá khứ.'); return; }

    this.saving.set(true); this.error.set('');
    this.lhSvc.create({
      maTC: this.maTC(), ngayHen: this.ngayHen(),
      gioHen: this.gioHen(), ghiChu: this.ghiChu().trim() || undefined
    }).subscribe({
      next: lh => {
        const dv = this.selectedDV();
        const tc = this.selectedTC();
        if (dv && tc) {
          this.lhdvSvc.create({ maLH: lh.maLH, maDV: dv.maDV, soLuong: 1, donGia: this.giaHienTai() }).subscribe();
        }
        this.saving.set(false);
        this.success.set('Đặt lịch thành công! Vui lòng chờ xác nhận từ nhân viên.');
        this.maTC.set(0); this.maDV.set(0); this.ngayHen.set(''); this.gioHen.set('09:00'); this.ghiChu.set('');
      },
      error: () => { this.saving.set(false); this.error.set('Đặt lịch thất bại. Vui lòng thử lại.'); }
    });
  }

  fmt(n: number): string { return n.toLocaleString('vi-VN') + ' ₫'; }
  today(): string { return new Date().toISOString().split('T')[0]; }
}
