import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService }    from '../../../core/auth.service';
import { ThuCungService } from '../../../core/thu-cung.service';
import { LichHenService } from '../../../core/lich-hen.service';
import { ThuCung, LichHen } from '../../../core/models';
import { forkJoin } from 'rxjs';

interface LichHenView extends LichHen {
  tenThuCung: string;
}

@Component({
  selector: 'app-owner-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './owner-home.html',
  styleUrl: './owner-home.css'
})
export class OwnerHomeComponent implements OnInit {
  auth      = inject(AuthService);
  private tcSvc  = inject(ThuCungService);
  private lhSvc  = inject(LichHenService);

  loading      = signal(true);
  thuCungs     = signal<ThuCung[]>([]);
  lichHenToi   = signal<LichHenView[]>([]);
  soHoanThanh  = signal(0);

  soThuCung  = computed(() => this.thuCungs().length);
  lichHenSap = computed(() => this.lichHenToi().length);

  loiChao = computed(() => {
    const h = new Date().getHours();
    if (h < 11) return 'Chào buổi sáng';
    if (h < 14) return 'Chào buổi trưa';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  });

  ngOnInit(): void {
    const maCN = this.auth.user()?.id;
    if (!maCN) { this.loading.set(false); return; }

    forkJoin({
      tc: this.tcSvc.getByChuNuoi(maCN),
      lh: this.lhSvc.getAll()
    }).subscribe({
      next: res => {
        this.thuCungs.set(res.tc);

        const today = new Date().toISOString().split('T')[0];
        const maTCMap = new Map(res.tc.map(t => [t.maTC, t.tenThuCung]));
        const myLH = res.lh.filter(l => maTCMap.has(l.maTC));

        this.soHoanThanh.set(myLH.filter(l => l.trangThai === 'HoanThanh').length);

        const sapToi = myLH
          .filter(l => (l.trangThai === 'XacNhan' || l.trangThai === 'ChoDuyet') && l.ngayHen >= today)
          .sort((a, b) => (a.ngayHen + a.gioHen).localeCompare(b.ngayHen + b.gioHen))
          .slice(0, 4)
          .map(l => ({ ...l, tenThuCung: maTCMap.get(l.maTC) ?? `TC#${l.maTC}` }));
        this.lichHenToi.set(sapToi);

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  petEmoji(loai: string): string {
    const m: Record<string, string> = { 'Chó': '🐶', 'Mèo': '🐱', 'Thỏ': '🐰', 'Chim': '🐦', 'Cá': '🐠' };
    return m[loai] ?? '🐾';
  }

  tinhTuoi(ngaySinh?: string): string {
    if (!ngaySinh) return 'Chưa rõ tuổi';
    const diff = Date.now() - new Date(ngaySinh).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'Mới sinh';
    return months < 12 ? `${months} tháng tuổi` : `${Math.floor(months / 12)} tuổi`;
  }

  badgeClass(tt: string): string {
    const m: Record<string, string> = { ChoDuyet: 'badge-warning', XacNhan: 'badge-info', HoanThanh: 'badge-success', Huy: 'badge-danger' };
    return m[tt] ?? 'badge-secondary';
  }
  labelTT(tt: string): string {
    const m: Record<string, string> = { ChoDuyet: 'Chờ duyệt', XacNhan: 'Đã xác nhận', HoanThanh: 'Hoàn thành', Huy: 'Đã huỷ' };
    return m[tt] ?? tt;
  }
}
