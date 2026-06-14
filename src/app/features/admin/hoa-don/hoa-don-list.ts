import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoaDonService } from '../../../core/hoa-don.service';
import { ChuNuoiService } from '../../../core/chu-nuoi.service';
import { LichHenDichVuService } from '../../../core/lich-hen-dich-vu.service';
import { LichHenService } from '../../../core/lich-hen.service';
import { HoaDon, ChuNuoi, LichHenDichVu } from '../../../core/models';
import { ThuCungService } from '../../../core/thu-cung.service';
import { DichVuService } from '../../../core/dich-vu.service';
import { DichVu, ThuCung } from '../../../core/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hoa-don-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hoa-don-list.html',
  styleUrl: './hoa-don-list.css'
})
export class HoaDonListComponent implements OnInit {
  private svc     = inject(HoaDonService);
  private cnSvc   = inject(ChuNuoiService);
  private lhSvc   = inject(LichHenService);
  private lhdvSvc = inject(LichHenDichVuService);
  private tcSvc   = inject(ThuCungService);
  private dvSvc   = inject(DichVuService);

  loading     = signal(true);
  data        = signal<HoaDon[]>([]);
  chuNuois    = signal<ChuNuoi[]>([]);
  search      = signal('');
  filterTT    = signal('');
  msg         = signal('');
  msgType     = signal<'ok'|'err'>('ok');

  // Payment modal
  showModal     = signal(false);
  selectedHD    = signal<HoaDon | null>(null);
  phuongThuc    = signal('TienMat');
  soTienKhachTra = signal('');
  tienThua      = signal(0);
  paying        = signal(false);

  filtered = computed(() => {
    const q  = this.search().toLowerCase();
    const tt = this.filterTT();
    return this.data().filter(h =>
      (!tt || h.trangThaiTT === tt) &&
      (!q  || this.getChuNuoiTen(h.maCN).toLowerCase().includes(q) ||
              h.maHD.toString().includes(q))
    );
  });

  ngOnInit(): void {
    forkJoin({ hd: this.svc.getAll(), cn: this.cnSvc.getAll() }).subscribe({
      next: res => {
        this.data.set(res.hd);
        this.chuNuois.set(res.cn);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getChuNuoiTen(maCN: number): string {
    return this.chuNuois().find(c => c.maCN === maCN)?.hoTen ?? `CN#${maCN}`;
  }

  openPayModal(hd: HoaDon): void {
    this.selectedHD.set(hd);
    this.phuongThuc.set('TienMat');
    this.soTienKhachTra.set(hd.tongTien.toString());
    this.tienThua.set(0);
    this.showModal.set(true);
  }

  onSoTienChange(val: string): void {
    this.soTienKhachTra.set(val);
    const hd = this.selectedHD();
    if (hd) this.tienThua.set(Math.max(0, (+val || 0) - hd.tongTien));
  }

  thanhToan(): void {
    const hd = this.selectedHD();
    if (!hd) return;
    this.paying.set(true);
    this.svc.thanhToan(hd.maHD, this.phuongThuc()).subscribe({
      next: () => {
        this.data.update(d => d.map(h => h.maHD === hd.maHD
          ? { ...h, trangThaiTT: 'DaThanhToan', phuongThucTT: this.phuongThuc() } : h));
        this.paying.set(false);
        this.showModal.set(false);
        this.showMsg('Thanh toán thành công!', 'ok');
      },
      error: () => { this.paying.set(false); this.showMsg('Thanh toán thất bại.', 'err'); }
    });
  }

  xoa(id: number): void {
    if (!confirm('Xoá hoá đơn này?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.data.update(d => d.filter(h => h.maHD !== id)); this.showMsg('Đã xoá.', 'ok'); },
      error: () => this.showMsg('Xoá thất bại.', 'err')
    });
  }

  badgeClass(tt: string): string {
    return tt === 'DaThanhToan' ? 'badge-success' : 'badge-warning';
  }
  labelTT(tt: string): string {
    return tt === 'DaThanhToan' ? 'Đã thanh toán' : 'Chưa thanh toán';
  }
  fmt(n: number): string { return n.toLocaleString('vi-VN') + ' ₫'; }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 3000);
  }
}
