import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LichHenService } from '../../../core/lich-hen.service';
import { ThuCungService } from '../../../core/thu-cung.service';
import { LichHenDichVuService } from '../../../core/lich-hen-dich-vu.service';
import { HoaDonService } from '../../../core/hoa-don.service';
import { LichHen, ThuCung, LichHenDichVu, HoaDon } from '../../../core/models';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-lich-hen-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lich-hen-list.html',
  styleUrl: './lich-hen-list.css'
})
export class LichHenListComponent implements OnInit {
  private svc     = inject(LichHenService);
  private tcSvc   = inject(ThuCungService);
  private lhdvSvc = inject(LichHenDichVuService);
  private hdSvc   = inject(HoaDonService);

  loading    = signal(true);
  data       = signal<LichHen[]>([]);
  thuCungs   = signal<ThuCung[]>([]);
  hoaDons    = signal<HoaDon[]>([]);
  search     = signal('');
  filterTT   = signal('');
  msg        = signal('');
  msgType    = signal<'ok'|'err'>('ok');
  updatingId = signal<number | null>(null);
  creatingHD = signal<number | null>(null);

  trangThaiOptions = ['', 'ChoDuyet', 'XacNhan', 'HoanThanh', 'Huy'];

  filtered = computed(() => {
    const q  = this.search().toLowerCase();
    const tt = this.filterTT();
    return this.data().filter(l =>
      (!tt || l.trangThai === tt) &&
      (!q  || this.getThuCungTen(l.maTC).toLowerCase().includes(q) ||
              l.ngayHen.includes(q))
    );
  });

  ngOnInit(): void {
    this.load();
    this.tcSvc.getAll().subscribe(tc => this.thuCungs.set(tc));
    this.hdSvc.getAll().subscribe(hd => this.hoaDons.set(hd));
  }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.data.set(d.sort((a,b) => b.ngayHen.localeCompare(a.ngayHen))); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  daCoHoaDon(maLH: number): boolean {
    return this.hoaDons().some(h => h.maLH === maLH);
  }

  getThuCungTen(maTC: number): string {
    return this.thuCungs().find(t => t.maTC === maTC)?.tenThuCung ?? `TC#${maTC}`;
  }

  doiTrangThai(id: number, tt: string): void {
    this.updatingId.set(id);
    this.svc.updateTrangThai(id, tt).subscribe({
      next: () => {
        this.data.update(d => d.map(l => l.maLH === id ? { ...l, trangThai: tt } : l));
        this.updatingId.set(null);
        this.showMsg('Đã cập nhật trạng thái.', 'ok');
      },
      error: () => { this.updatingId.set(null); this.showMsg('Cập nhật thất bại.', 'err'); }
    });
  }

  xoa(id: number): void {
    if (!confirm('Xoá lịch hẹn này?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.data.update(d => d.filter(l => l.maLH !== id)); this.showMsg('Đã xoá.', 'ok'); },
      error: () => this.showMsg('Xoá thất bại.', 'err')
    });
  }

  taoHoaDon(lh: LichHen): void {
    if (this.daCoHoaDon(lh.maLH)) {
      this.showMsg('Lịch hẹn này đã có hoá đơn.', 'err');
      return;
    }
    this.creatingHD.set(lh.maLH);
    // Lấy danh sách dịch vụ của lịch hẹn để tính tổng tiền
    this.lhdvSvc.getByLichHen(lh.maLH).pipe(
      switchMap((items: LichHenDichVu[]) => {
        const tongTien = items.reduce((s, i) => s + i.soLuong * i.donGia, 0);
        const thuCung = this.thuCungs().find(t => t.maTC === lh.maTC);
        if (!thuCung) return of(null);
        const hoaDon: Partial<HoaDon> = {
          maLH: lh.maLH,
          maCN: thuCung.maCN,
          tongTien,
          trangThaiTT: 'ChuaThanhToan'
        };
        return this.hdSvc.create(hoaDon);
      })
    ).subscribe({
      next: (hd) => {
        this.creatingHD.set(null);
        if (hd) {
          this.hoaDons.update(d => [...d, hd as HoaDon]);
          this.showMsg('Đã tạo hoá đơn thành công!', 'ok');
        } else {
          this.showMsg('Không tìm thấy thông tin thú cưng.', 'err');
        }
      },
      error: () => {
        this.creatingHD.set(null);
        this.showMsg('Tạo hoá đơn thất bại. Có thể đã tồn tại hoá đơn cho lịch hẹn này.', 'err');
      }
    });
  }

  badgeClass(tt: string): string {
    const m: Record<string, string> = { ChoDuyet: 'badge-warning', XacNhan: 'badge-info', HoanThanh: 'badge-success', Huy: 'badge-danger' };
    return m[tt] ?? 'badge-secondary';
  }

  labelTT(tt: string): string {
    const m: Record<string, string> = { ChoDuyet: 'Chờ duyệt', XacNhan: 'Xác nhận', HoanThanh: 'Hoàn thành', Huy: 'Đã huỷ' };
    return m[tt] ?? tt;
  }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 3000);
  }
}
