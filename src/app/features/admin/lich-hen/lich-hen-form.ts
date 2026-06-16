import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LichHenService }      from '../../../core/lich-hen.service';
import { LichHenDichVuService } from '../../../core/lich-hen-dich-vu.service';
import { ThuCungService }      from '../../../core/thu-cung.service';
import { ChuNuoiService }      from '../../../core/chu-nuoi.service';
import { DichVuService }       from '../../../core/dich-vu.service';
import { ThuCung, ChuNuoi, DichVu } from '../../../core/models';

@Component({
  selector: 'app-lich-hen-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lich-hen-form.html',
  styleUrl: './lich-hen-form.css'
})
export class LichHenFormComponent implements OnInit {
  private svc      = inject(LichHenService);
  private lhdvSvc  = inject(LichHenDichVuService);
  private tcSvc    = inject(ThuCungService);
  private cnSvc    = inject(ChuNuoiService);
  private dvSvc    = inject(DichVuService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);

  editId      = signal<number | null>(null);
  loading     = signal(false);
  loadingData = signal(true);
  error       = signal('');

  chuNuois  = signal<ChuNuoi[]>([]);
  thuCungs  = signal<ThuCung[]>([]);
  dichVus   = signal<DichVu[]>([]);

  maCN    = signal(0);
  maTC    = signal(0);
  maDV    = signal(0);
  ngayHen = signal('');
  gioHen  = signal('08:00');
  ghiChu  = signal('');

  thuCungsFiltered = computed(() =>
    this.maCN() ? this.thuCungs().filter(tc => tc.maCN === this.maCN()) : []
  );

  onChuNuoiChange(maCN: number): void {
    this.maCN.set(maCN);
    this.maTC.set(0);
  }

  ngOnInit(): void {
    forkJoin({
      tc: this.tcSvc.getAll(),
      cn: this.cnSvc.getAll(),
      dv: this.dvSvc.getAll()
    }).subscribe(res => {
      this.thuCungs.set(res.tc);
      this.chuNuois.set(res.cn);
      this.dichVus.set(res.dv);

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.editId.set(+id);
        forkJoin({ lh: this.svc.getById(+id), lhdv: this.lhdvSvc.getByLichHen(+id) }).subscribe(r => {
          const pet = res.tc.find(t => t.maTC === r.lh.maTC);
          if (pet) this.maCN.set(pet.maCN);
          this.maTC.set(r.lh.maTC);
          this.ngayHen.set(r.lh.ngayHen);
          this.gioHen.set(r.lh.gioHen);
          this.ghiChu.set(r.lh.ghiChu ?? '');
          if (r.lhdv.length > 0) this.maDV.set(r.lhdv[0].maDV);
          this.loadingData.set(false);
        });
      } else {
        this.loadingData.set(false);
      }
    });
  }

  getDichVuGia(dv: DichVu, maTC: number): string {
    const tc = this.thuCungs().find(t => t.maTC === maTC);
    if (!tc) return '';
    const gia = tc.loai === 'Chó' ? dv.giaCho : tc.loai === 'Mèo' ? dv.giaMeo : dv.giaKhac;
    return gia.toLocaleString('vi-VN') + ' ₫';
  }

  submit(): void {
    if (!this.maTC() || !this.ngayHen() || !this.gioHen()) {
      this.error.set('Vui lòng điền đầy đủ thông tin bắt buộc.'); return;
    }

    this.loading.set(true); this.error.set('');

    const lichHenPayload = {
      maTC: this.maTC(), ngayHen: this.ngayHen(),
      gioHen: this.gioHen(), ghiChu: this.ghiChu().trim() || undefined
    };

    if (this.editId()) {
      this.svc.update(this.editId()!, lichHenPayload).subscribe({
        next: () => { this.loading.set(false); this.router.navigate(['/admin/lich-hen']); },
        error: () => { this.loading.set(false); this.error.set('Cập nhật thất bại.'); }
      });
    } else {
      this.svc.create(lichHenPayload).subscribe({
        next: (lh) => {
          const tc = this.thuCungs().find(t => t.maTC === this.maTC());
          const dv = this.dichVus().find(d => d.maDV === this.maDV());
          if (dv && tc) {
            const gia = tc.loai === 'Chó' ? dv.giaCho : tc.loai === 'Mèo' ? dv.giaMeo : dv.giaKhac;
            this.lhdvSvc.create({ maLH: lh.maLH, maDV: dv.maDV, soLuong: 1, donGia: gia }).subscribe();
          }
          this.loading.set(false);
          this.router.navigate(['/admin/lich-hen']);
        },
        error: () => { this.loading.set(false); this.error.set('Tạo lịch hẹn thất bại.'); }
      });
    }
  }
}
