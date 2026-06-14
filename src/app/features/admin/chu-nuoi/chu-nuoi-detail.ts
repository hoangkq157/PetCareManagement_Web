import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChuNuoiService } from '../../../core/chu-nuoi.service';
import { ThuCungService } from '../../../core/thu-cung.service';
import { HoaDonService } from '../../../core/hoa-don.service';
import { ChuNuoi, ThuCung, HoaDon } from '../../../core/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-chu-nuoi-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chu-nuoi-detail.html',
  styleUrl: './chu-nuoi-detail.css'
})
export class ChuNuoiDetailComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private cnSvc   = inject(ChuNuoiService);
  private tcSvc   = inject(ThuCungService);
  private hdSvc   = inject(HoaDonService);

  loading   = signal(true);
  chuNuoi   = signal<ChuNuoi | null>(null);
  thuCungs  = signal<ThuCung[]>([]);
  hoaDons   = signal<HoaDon[]>([]);
  error     = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      cn: this.cnSvc.getById(id),
      tc: this.tcSvc.getByChuNuoi(id),
      hd: this.hdSvc.getByChuNuoi(id)
    }).subscribe({
      next: res => {
        this.chuNuoi.set(res.cn);
        this.thuCungs.set(res.tc);
        this.hoaDons.set(res.hd.sort((a, b) => (b.maHD - a.maHD)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Không tải được thông tin chủ nuôi.');
        this.loading.set(false);
      }
    });
  }

  tongTien(): number {
    return this.hoaDons().reduce((s, h) => s + h.tongTien, 0);
  }

  fmt(n: number): string { return n.toLocaleString('vi-VN') + ' ₫'; }

  badgeHD(tt: string): string {
    return tt === 'DaThanhToan' ? 'badge-success' : 'badge-warning';
  }

  labelHD(tt: string): string {
    return tt === 'DaThanhToan' ? 'Đã TT' : 'Chưa TT';
  }

  tinhTuoi(ngaySinh?: string): string {
    if (!ngaySinh) return '—';
    const diff = Date.now() - new Date(ngaySinh).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (months < 12) return `${months} tháng`;
    return `${Math.floor(months / 12)} năm`;
  }
}
