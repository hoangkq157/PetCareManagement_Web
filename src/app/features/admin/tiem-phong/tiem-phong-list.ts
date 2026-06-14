import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TiemPhongService } from '../../../core/tiem-phong.service';
import { ThuCungService }   from '../../../core/thu-cung.service';
import { TiemPhong, ThuCung } from '../../../core/models';

@Component({
  selector: 'app-tiem-phong-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tiem-phong-list.html',
  styleUrl: './tiem-phong-list.css'
})
export class TiemPhongListComponent implements OnInit {
  private svc   = inject(TiemPhongService);
  private tcSvc = inject(ThuCungService);

  loading     = signal(true);
  data        = signal<TiemPhong[]>([]);
  sapHan      = signal<TiemPhong[]>([]);
  thuCungs    = signal<ThuCung[]>([]);
  search      = signal('');
  showCanhBao = signal(false);
  msg         = signal('');
  msgType     = signal<'ok'|'err'>('ok');

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.data().filter(t =>
      t.tenVaccine.toLowerCase().includes(q) ||
      this.getThuCungTen(t.maTC).toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.tcSvc.getAll().subscribe(tc => this.thuCungs.set(tc));
    this.load();
    this.svc.getSapDenHan().subscribe(s => this.sapHan.set(s));
  }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getThuCungTen(maTC: number): string {
    return this.thuCungs().find(t => t.maTC === maTC)?.tenThuCung ?? `TC#${maTC}`;
  }

  xoa(id: number): void {
    if (!confirm('Xoá bản ghi tiêm phòng này?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.data.update(d => d.filter(t => t.maTP !== id)); this.showMsg('Đã xoá.', 'ok'); },
      error: () => this.showMsg('Xoá thất bại.', 'err')
    });
  }

  isSapHan(tp: TiemPhong): boolean {
    if (!tp.ngayTiemTiep) return false;
    const diff = new Date(tp.ngayTiemTiep).getTime() - Date.now();
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 3000);
  }
}
