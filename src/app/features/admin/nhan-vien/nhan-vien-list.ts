import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NhanVienService } from '../../../core/nhan-vien.service';
import { NhanVien } from '../../../core/models';

@Component({
  selector: 'app-nhan-vien-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nhan-vien-list.html',
  styleUrl: './nhan-vien-list.css'
})
export class NhanVienListComponent implements OnInit {
  private svc = inject(NhanVienService);

  loading   = signal(true);
  data      = signal<NhanVien[]>([]);
  search    = signal('');
  msg       = signal('');
  msgType   = signal<'ok'|'err'>('ok');

  // Modal form
  showForm  = signal(false);
  editId    = signal<number | null>(null);
  saving    = signal(false);
  formError = signal('');

  // Form fields
  hoTen       = signal('');
  email       = signal('');
  matKhau     = signal('');
  vaiTro      = signal('NhanVien');
  soDienThoai = signal('');
  trangThai   = signal(true);
  showPass    = signal(false);

  vaiTroOptions = ['NhanVien', 'Admin'];

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.data().filter(nv =>
      nv.hoTen.toLowerCase().includes(q) ||
      nv.email.toLowerCase().includes(q) ||
      (nv.soDienThoai ?? '').includes(q)
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

  openEdit(nv: NhanVien): void {
    this.editId.set(nv.maNV);
    this.hoTen.set(nv.hoTen);
    this.email.set(nv.email);
    this.matKhau.set('');
    this.vaiTro.set(nv.vaiTro);
    this.soDienThoai.set(nv.soDienThoai ?? '');
    this.trangThai.set(nv.trangThai);
    this.formError.set('');
    this.showForm.set(true);
  }

  save(): void {
    if (!this.hoTen().trim()) { this.formError.set('Vui lòng nhập họ tên.'); return; }
    if (!this.email().trim()) { this.formError.set('Vui lòng nhập email.'); return; }
    if (!this.editId() && !this.matKhau().trim()) { this.formError.set('Vui lòng nhập mật khẩu cho nhân viên mới.'); return; }

    this.saving.set(true);
    this.formError.set('');

    const payload: Partial<NhanVien> = {
      hoTen: this.hoTen().trim(),
      email: this.email().trim(),
      vaiTro: this.vaiTro(),
      soDienThoai: this.soDienThoai().trim() || undefined,
      trangThai: this.trangThai()
    };
    if (this.matKhau().trim()) payload.matKhau = this.matKhau().trim();

    const req = (this.editId()
      ? this.svc.update(this.editId()!, payload)
      : this.svc.create(payload)) as any;

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
        this.showMsg(this.editId() ? 'Đã cập nhật nhân viên.' : 'Đã thêm nhân viên mới.', 'ok');
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Lưu thất bại. Email có thể đã tồn tại.');
      }
    });
  }

  xoa(id: number): void {
    if (!confirm('Xoá nhân viên này? Hành động này không thể hoàn tác.')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.data.update(d => d.filter(x => x.maNV !== id));
        this.showMsg('Đã xoá nhân viên.', 'ok');
      },
      error: () => this.showMsg('Xoá thất bại.', 'err')
    });
  }

  resetForm(): void {
    this.hoTen.set('');
    this.email.set('');
    this.matKhau.set('');
    this.vaiTro.set('NhanVien');
    this.soDienThoai.set('');
    this.trangThai.set(true);
    this.formError.set('');
    this.showPass.set(false);
  }

  badgeVaiTro(vt: string): string {
    return vt === 'Admin' ? 'badge-danger' : 'badge-info';
  }

  private showMsg(m: string, t: 'ok'|'err'): void {
    this.msg.set(m); this.msgType.set(t);
    setTimeout(() => this.msg.set(''), 3000);
  }
}
