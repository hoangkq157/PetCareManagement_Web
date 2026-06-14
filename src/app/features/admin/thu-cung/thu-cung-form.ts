import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ThuCungService } from '../../../core/thu-cung.service';
import { ChuNuoiService } from '../../../core/chu-nuoi.service';
import { ChuNuoi } from '../../../core/models';

@Component({
  selector: 'app-thu-cung-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './thu-cung-form.html',
  styleUrl: './thu-cung-form.css'
})
export class ThuCungFormComponent implements OnInit {
  private svc     = inject(ThuCungService);
  private cnSvc   = inject(ChuNuoiService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);

  editId    = signal<number | null>(null);
  loading   = signal(false);
  loadingData = signal(true);
  error     = signal('');
  chuNuois  = signal<ChuNuoi[]>([]);

  maCN       = signal(0);
  tenThuCung = signal('');
  loai       = signal('Chó');
  giong      = signal('');
  ngaySinh   = signal('');
  canNang    = signal('');
  mauLong    = signal('');
  ghiChu     = signal('');

  loaiOptions = ['Chó', 'Mèo', 'Thỏ', 'Chim', 'Cá', 'Khác'];

  ngOnInit(): void {
    this.cnSvc.getAll().subscribe(cn => this.chuNuois.set(cn));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(+id);
      this.svc.getById(+id).subscribe({
        next: tc => {
          this.maCN.set(tc.maCN);
          this.tenThuCung.set(tc.tenThuCung);
          this.loai.set(tc.loai);
          this.giong.set(tc.giong ?? '');
          this.ngaySinh.set(tc.ngaySinh ?? '');
          this.canNang.set(tc.canNang?.toString() ?? '');
          this.mauLong.set(tc.mauLong ?? '');
          this.ghiChu.set(tc.ghiChu ?? '');
          this.loadingData.set(false);
        },
        error: () => this.loadingData.set(false)
      });
    } else {
      this.loadingData.set(false);
    }
  }

  submit(): void {
    if (!this.maCN() || !this.tenThuCung().trim() || !this.loai()) {
      this.error.set('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const payload = {
      maCN: this.maCN(),
      tenThuCung: this.tenThuCung().trim(),
      loai: this.loai(),
      giong: this.giong().trim() || undefined,
      ngaySinh: this.ngaySinh() || undefined,
      canNang: this.canNang() ? +this.canNang() : undefined,
      mauLong: this.mauLong().trim() || undefined,
      ghiChu: this.ghiChu().trim() || undefined,
    };

    const req = (this.editId()
      ? this.svc.update(this.editId()!, payload)
      : this.svc.create(payload)) as any;

    req.subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/admin/thu-cung']); },
      error: () => { this.loading.set(false); this.error.set('Lưu thất bại. Vui lòng thử lại.'); }
    });
  }
}
