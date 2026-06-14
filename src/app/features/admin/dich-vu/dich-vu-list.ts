import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DichVuService } from '../../../core/dich-vu.service';
import { DichVu } from '../../../core/models';

@Component({
  selector: 'app-dich-vu-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dich-vu-list.html',
  styleUrl: './dich-vu-list.css'
})
export class DichVuListComponent implements OnInit {
  private svc = inject(DichVuService);

  loading     = signal(true);
  data        = signal<DichVu[]>([]);
  search      = signal('');
  msg         = signal('');
  msgType     = signal<'ok'|'err'>('ok');

  // Form inline
  showForm    = signal(false);
  editId      = signal<number | null>(null);
  saving      = signal(false);
  formError   = signal('');
  tenDichVu   = signal('');
  danhMuc     = signal('Spa');
  giaCho      = signal('');
  giaMeo      = signal('');
  giaKhac     = signal('');
  moTa        = signal('');
  trangThai   = signal(true);

  danhMucOptions = ['Spa', 'CatTia', 'LuuTru', 'KhamSK', 'TiemPhong', 'Khác'];

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.data().filter(d =>
      d.tenDichVu.toLowerCase().includes(q) ||
      (d.danhMuc ?? '').toLowerCase().includes(q)
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

  openCreate(): void {
    this.editId.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  openEdit(dv: DichVu): void {
    this.editId.set(dv.maDV);
    this.tenDichVu.set(dv.tenDichVu);
    this.danhMuc.set(dv.danhMuc ?? 'Spa');
    this.giaCho.set(dv.giaCho.toString());
    this.giaMeo.set(dv.giaMeo.toString());
    this.giaKhac.set(dv.giaKhac.toString());
    this.moTa.set(dv.moTa ?? '');
    this.trangThai.set(dv.trangThai);
    this.showForm.set(true);
  }

  save(): void {
    if (!this.tenDichVu().trim()) { this.formError.set('Vui lòng nhập tên dịch vụ.'); return; }
    this.saving.set(true); this.formError.set('');
    const payload = {
      tenDichVu: this.tenDichVu().trim(), danhMuc: this.danhMuc(),
      giaCho: +this.giaCho() || 0, giaMeo: +this.giaMeo() || 0, giaKhac: +this.giaKhac() || 0,
      moTa: this.moTa().trim() || undefined, trangThai: this.trangThai()
    };
    const req = (this.editId() ? this.svc.update(this.editId()!, payload) : this.svc.create(payload)) as any;
    req.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); this.showMsg('Đã lưu.', 'ok'); },
      error: () => { this.saving.set(false); this.formError.set('Lưu thất bại.'); }
    });
  }

  xoa(id: number): void {
    if (!confirm('Xoá dịch vụ này?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.data.update(d => d.filter(x => x.maDV !== id)); this.showMsg('Đã xoá.', 'ok'); },
      error: () => this.showMsg('Xoá thất bại.', 'err')
    });
  }

  resetForm(): void {
    this.tenDichVu.set(''); this.danhMuc.set('Spa');
    this.giaCho.set(''); this.giaMeo.set(''); this.giaKhac.set('');
    this.moTa.set(''); this.trangThai.set(true); this.formError.set('');
  }

  fmt(n: number): string { return n.toLocaleString('vi-VN') + ' ₫'; }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 3000);
  }
}
