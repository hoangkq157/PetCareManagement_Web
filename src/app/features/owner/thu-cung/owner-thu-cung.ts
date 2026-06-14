import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService }    from '../../../core/auth.service';
import { ThuCungService } from '../../../core/thu-cung.service';
import { ThuCung } from '../../../core/models';

@Component({
  selector: 'app-owner-thu-cung',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-thu-cung.html',
  styleUrl: './owner-thu-cung.css'
})
export class OwnerThuCungComponent implements OnInit {
  private auth  = inject(AuthService);
  private svc   = inject(ThuCungService);

  loading   = signal(true);
  data      = signal<ThuCung[]>([]);
  showForm  = signal(false);
  saving    = signal(false);
  error     = signal('');
  msg       = signal('');

  tenThuCung = signal('');
  loai       = signal('Chó');
  giong      = signal('');
  ngaySinh   = signal('');
  canNang    = signal('');
  mauLong    = signal('');
  loaiOptions = ['Chó', 'Mèo', 'Thỏ', 'Chim', 'Cá', 'Khác'];

  ngOnInit(): void { this.load(); }

  load(): void {
    const maCN = this.auth.user()?.id;
    if (!maCN) { this.loading.set(false); return; }
    this.svc.getByChuNuoi(maCN).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  them(): void {
    const maCN = this.auth.user()?.id;
    if (!maCN || !this.tenThuCung().trim()) { this.error.set('Vui lòng nhập tên thú cưng.'); return; }
    this.saving.set(true); this.error.set('');
    this.svc.create({
      maCN, tenThuCung: this.tenThuCung().trim(), loai: this.loai(),
      giong: this.giong().trim() || undefined,
      ngaySinh: this.ngaySinh() || undefined,
      canNang: this.canNang() ? +this.canNang() : undefined,
      mauLong: this.mauLong().trim() || undefined
    }).subscribe({
      next: tc => {
        this.data.update(d => [...d, tc]);
        this.saving.set(false); this.showForm.set(false);
        this.tenThuCung.set(''); this.giong.set(''); this.ngaySinh.set(''); this.canNang.set(''); this.mauLong.set('');
        this.msg.set('Đã thêm thú cưng thành công!');
        setTimeout(() => this.msg.set(''), 3000);
      },
      error: () => { this.saving.set(false); this.error.set('Thêm thất bại.'); }
    });
  }

  xoa(id: number): void {
    if (!confirm('Xoá thú cưng này?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.data.update(d => d.filter(t => t.maTC !== id)); this.msg.set('Đã xoá.'); setTimeout(() => this.msg.set(''), 3000); },
      error: () => {}
    });
  }

  tinhTuoi(ngaySinh?: string): string {
    if (!ngaySinh) return '—';
    const diff = Date.now() - new Date(ngaySinh).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    return months < 12 ? `${months} tháng` : `${Math.floor(months / 12)} tuổi`;
  }
}
