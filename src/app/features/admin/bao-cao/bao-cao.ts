import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoaDonService } from '../../../core/hoa-don.service';

@Component({
  selector: 'app-bao-cao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bao-cao.html',
  styleUrl: './bao-cao.css'
})
export class BaoCaoComponent implements OnInit {
  private svc = inject(HoaDonService);

  loading   = signal(true);
  chartData = signal<{ label: string; value: number; month: number; year: number }[]>([]);
  maxValue  = signal(1);

  tongDoanhThu = computed(() => this.chartData().reduce((s, m) => s + m.value, 0));

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: hoaDons => {
        const now = new Date();
        const months: { label: string; value: number; month: number; year: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const m = d.getMonth() + 1;
          const y = d.getFullYear();
          const value = hoaDons
            .filter(h => {
              if (!h.ngayLap || h.trangThaiTT !== 'DaThanhToan') return false;
              const hd = new Date(h.ngayLap);
              return hd.getMonth() + 1 === m && hd.getFullYear() === y;
            })
            .reduce((s, h) => s + h.tongTien, 0);
          months.push({ label: `T${m}/${y}`, value, month: m, year: y });
        }
        this.chartData.set(months);
        this.maxValue.set(Math.max(...months.map(m => m.value), 1));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  barHeight(v: number): string {
    return Math.round((v / this.maxValue()) * 200) + 'px';
  }

  fmt(n: number): string { return n.toLocaleString('vi-VN') + ' ₫'; }

  isCurrentMonth(item: { month: number; year: number }): boolean {
    const now = new Date();
    return item.month === now.getMonth() + 1 && item.year === now.getFullYear();
  }
}
