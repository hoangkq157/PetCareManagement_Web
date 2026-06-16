import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TiemPhongService } from '../../../core/tiem-phong.service';
import { ThuCungService }   from '../../../core/thu-cung.service';
import { ChuNuoiService }   from '../../../core/chu-nuoi.service';
import { ThuCung, ChuNuoi } from '../../../core/models';

@Component({
  selector: 'app-tiem-phong-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tiem-phong-form.html',
  styleUrl: './tiem-phong-form.css'
})
export class TiemPhongFormComponent implements OnInit {
  private svc    = inject(TiemPhongService);
  private tcSvc  = inject(ThuCungService);
  private cnSvc  = inject(ChuNuoiService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  editId      = signal<number | null>(null);
  loading     = signal(false);
  loadingData = signal(true);
  error       = signal('');

  chuNuois    = signal<ChuNuoi[]>([]);
  thuCungs    = signal<ThuCung[]>([]);

  maCN           = signal(0);
  maTC           = signal(0);
  tenVaccine     = signal('');
  ngayTiem       = signal('');
  chuKyNgay      = signal(365);
  lieuLuong      = signal('');
  bacSiThucHien  = signal('');
  ghiChu         = signal('');

  thuCungsFiltered = computed(() =>
    this.maCN() ? this.thuCungs().filter(tc => tc.maCN === this.maCN()) : []
  );

  onChuNuoiChange(maCN: number): void {
    this.maCN.set(maCN);
    this.maTC.set(0);
  }

  ngOnInit(): void {
    forkJoin({
      chuNuois: this.cnSvc.getAll(),
      thuCungs: this.tcSvc.getAll()
    }).subscribe(({ chuNuois, thuCungs }) => {
      this.chuNuois.set(chuNuois);
      this.thuCungs.set(thuCungs);

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.editId.set(+id);
        this.svc.getById(+id).subscribe(tp => {
          const pet = thuCungs.find(tc => tc.maTC === tp.maTC);
          if (pet) this.maCN.set(pet.maCN);
          this.maTC.set(tp.maTC);
          this.tenVaccine.set(tp.tenVaccine);
          this.ngayTiem.set(tp.ngayTiem);
          this.chuKyNgay.set(tp.chuKyNgay);
          this.lieuLuong.set(tp.lieuLuong ?? '');
          this.bacSiThucHien.set(tp.bacSiThucHien ?? '');
          this.ghiChu.set(tp.ghiChu ?? '');
          this.loadingData.set(false);
        });
      } else {
        this.loadingData.set(false);
      }
    });
  }

  submit(): void {
    if (!this.maTC() || !this.tenVaccine().trim() || !this.ngayTiem()) {
      this.error.set('Vui lòng điền đầy đủ thông tin bắt buộc.'); return;
    }
    this.loading.set(true); this.error.set('');
    const payload = {
      maTC: this.maTC(), tenVaccine: this.tenVaccine().trim(),
      ngayTiem: this.ngayTiem(), chuKyNgay: this.chuKyNgay(),
      lieuLuong: this.lieuLuong().trim() || undefined,
      bacSiThucHien: this.bacSiThucHien().trim() || undefined,
      ghiChu: this.ghiChu().trim() || undefined
    };
    const req = (this.editId() ? this.svc.update(this.editId()!, payload) : this.svc.create(payload)) as any;
    req.subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/admin/tiem-phong']); },
      error: () => { this.loading.set(false); this.error.set('Lưu thất bại.'); }
    });
  }
}
