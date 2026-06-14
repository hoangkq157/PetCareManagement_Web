import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChuNuoiService } from '../../../core/chu-nuoi.service';
import { ChuNuoi } from '../../../core/models';

@Component({
  selector: 'app-chu-nuoi-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chu-nuoi-list.html',
  styleUrl: './chu-nuoi-list.css'
})
export class ChuNuoiListComponent implements OnInit {
  private svc = inject(ChuNuoiService);

  loading    = signal(true);
  data       = signal<ChuNuoi[]>([]);
  search     = signal('');
  deletingId = signal<number | null>(null);
  msg        = signal('');
  msgType    = signal<'ok'|'err'>('ok');

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.data().filter(c =>
      c.hoTen.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.soDienThoai ?? '').includes(q)
    );
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  xoa(id: number): void {
    if (!confirm('Xoá chủ nuôi này? Toàn bộ thú cưng và dữ liệu liên quan cũng bị xoá.')) return;
    this.deletingId.set(id);
    this.svc.delete(id).subscribe({
      next: () => {
        this.data.update(d => d.filter(c => c.maCN !== id));
        this.deletingId.set(null);
        this.showMsg('Đã xoá chủ nuôi.', 'ok');
      },
      error: () => { this.deletingId.set(null); this.showMsg('Xoá thất bại.', 'err'); }
    });
  }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 3000);
  }
}
