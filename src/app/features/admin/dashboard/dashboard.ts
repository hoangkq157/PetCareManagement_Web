import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ThuCungService }   from '../../../core/thu-cung.service';
import { ChuNuoiService }   from '../../../core/chu-nuoi.service';
import { LichHenService }   from '../../../core/lich-hen.service';
import { TiemPhongService } from '../../../core/tiem-phong.service';
import { HoaDonService }    from '../../../core/hoa-don.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private thuCungSvc   = inject(ThuCungService);
  private chuNuoiSvc   = inject(ChuNuoiService);
  private lichHenSvc   = inject(LichHenService);
  private tiemPhongSvc = inject(TiemPhongService);
  private hoaDonSvc    = inject(HoaDonService);

  loading        = signal(true);
  soThuCung      = signal(0);
  soChuNuoi      = signal(0);
  lichHenHomNay  = signal(0);
  lichHenChoDuyet= signal(0);
  vaccineSapHan  = signal(0);
  doanhThuThang  = signal(0);

  // Doanh thu 6 tháng gần nhất
  chartData      = signal<{ label: string; value: number }[]>([]);
  maxValue       = signal(1);

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    forkJoin({
      thuCung:    this.thuCungSvc.getAll(),
      chuNuoi:    this.chuNuoiSvc.getAll(),
      lichHen:    this.lichHenSvc.getAll(),
      vaccine:    this.tiemPhongSvc.getSapDenHan(),
      hoaDon:     this.hoaDonSvc.getAll(),
    }).subscribe({
      next: (res) => {
        this.soThuCung.set(res.thuCung.length);
        this.soChuNuoi.set(res.chuNuoi.length);

        const homNay = res.lichHen.filter(l => l.ngayHen === today);
        this.lichHenHomNay.set(homNay.length);
        this.lichHenChoDuyet.set(res.lichHen.filter(l => l.trangThai === 'ChoDuyet').length);
        this.vaccineSapHan.set(res.vaccine.length);

        // Doanh thu tháng hiện tại
        const thangNay = new Date().getMonth() + 1;
        const namNay   = new Date().getFullYear();
        const ttThang  = res.hoaDon
          .filter(h => {
            if (!h.ngayLap) return false;
            const d = new Date(h.ngayLap);
            return d.getMonth() + 1 === thangNay && d.getFullYear() === namNay && h.trangThaiTT === 'DaThanhToan';
          })
          .reduce((s, h) => s + h.tongTien, 0);
        this.doanhThuThang.set(ttThang);

        // Chart: 6 tháng gần nhất
        const now = new Date();
        const months: { label: string; value: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const m = d.getMonth() + 1;
          const y = d.getFullYear();
          const label = `${m}/${y}`;
          const value = res.hoaDon
            .filter(h => {
              if (!h.ngayLap) return false;
              const hd = new Date(h.ngayLap);
              return hd.getMonth() + 1 === m && hd.getFullYear() === y && h.trangThaiTT === 'DaThanhToan';
            })
            .reduce((s, h) => s + h.tongTien, 0);
          months.push({ label, value });
        }
        this.chartData.set(months);
        this.maxValue.set(Math.max(...months.map(m => m.value), 1));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatVND(n: number): string {
    return n.toLocaleString('vi-VN') + ' ₫';
  }

  barHeight(v: number): string {
    return Math.round((v / this.maxValue()) * 160) + 'px';
  }
}
