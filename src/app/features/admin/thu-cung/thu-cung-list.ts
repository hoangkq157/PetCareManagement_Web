import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThuCungService } from '../../../core/thu-cung.service';
import { ChuNuoiService } from '../../../core/chu-nuoi.service';
import { ThuCung, ChuNuoi } from '../../../core/models';

@Component({
  selector: 'app-thu-cung-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './thu-cung-list.html',
  styleUrl: './thu-cung-list.css'
})
export class ThuCungListComponent implements OnInit {
  private svc     = inject(ThuCungService);
  private cnSvc   = inject(ChuNuoiService);

  loading    = signal(true);
  data       = signal<ThuCung[]>([]);
  chuNuois   = signal<ChuNuoi[]>([]);
  search     = signal('');
  deletingId = signal<number | null>(null);
  msg        = signal('');
  msgType    = signal<'ok'|'err'>('ok');

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.data().filter(t =>
      t.tenThuCung.toLowerCase().includes(q) ||
      this.getChuNuoiTen(t.maCN).toLowerCase().includes(q) ||
      t.loai.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.load();
    this.cnSvc.getAll().subscribe(cn => this.chuNuois.set(cn));
  }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getChuNuoiTen(maCN: number): string {
    return this.chuNuois().find(c => c.maCN === maCN)?.hoTen ?? `CN#${maCN}`;
  }

  xoa(id: number): void {
    if (!confirm('Xoá thú cưng này? Toàn bộ lịch hẹn liên quan cũng bị xoá.')) return;
    this.deletingId.set(id);
    this.svc.delete(id).subscribe({
      next: () => {
        this.data.update(d => d.filter(t => t.maTC !== id));
        this.deletingId.set(null);
        this.showMsg('Đã xoá thú cưng.', 'ok');
      },
      error: () => {
        this.deletingId.set(null);
        this.showMsg('Xoá thất bại. Vui lòng thử lại.', 'err');
      }
    });
  }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 3000);
  }
}
