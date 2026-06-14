import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService }    from '../../../core/auth.service';
import { ThuCungService } from '../../../core/thu-cung.service';
import { LichHenService } from '../../../core/lich-hen.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-owner-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './owner-home.html',
  styleUrl: './owner-home.css'
})
export class OwnerHomeComponent implements OnInit {
  auth      = inject(AuthService);
  private tcSvc  = inject(ThuCungService);
  private lhSvc  = inject(LichHenService);

  soThuCung  = signal(0);
  lichHenSap = signal(0);
  loading    = signal(true);

  ngOnInit(): void {
    const maCN = this.auth.user()?.id;
    if (!maCN) { this.loading.set(false); return; }

    forkJoin({
      tc: this.tcSvc.getByChuNuoi(maCN),
      lh: this.lhSvc.getAll()
    }).subscribe({
      next: res => {
        this.soThuCung.set(res.tc.length);
        const today = new Date().toISOString().split('T')[0];
        const maTC  = res.tc.map(t => t.maTC);
        const sap   = res.lh.filter(l =>
          maTC.includes(l.maTC) &&
          (l.trangThai === 'XacNhan' || l.trangThai === 'ChoDuyet') &&
          l.ngayHen >= today
        );
        this.lichHenSap.set(sap.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
