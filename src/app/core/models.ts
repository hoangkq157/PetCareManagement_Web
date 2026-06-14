export interface ThuCung {
  maTC: number;
  maCN: number;
  tenThuCung: string;
  loai: string;
  giong?: string;
  ngaySinh?: string;
  canNang?: number;
  mauLong?: string;
  ghiChu?: string;
}

export interface ChuNuoi {
  maCN: number;
  hoTen: string;
  email: string;
  matKhau?: string;
  soDienThoai?: string;
  diaChi?: string;
  ngayDangKy?: string;
}

export interface NhanVien {
  maNV: number;
  hoTen: string;
  email: string;
  matKhau?: string;
  vaiTro: string;
  soDienThoai?: string;
  ngayTao?: string;
  trangThai: boolean;
}

export interface DichVu {
  maDV: number;
  tenDichVu: string;
  danhMuc?: string;
  giaCho: number;
  giaMeo: number;
  giaKhac: number;
  moTa?: string;
  trangThai: boolean;
}

export interface LichHen {
  maLH: number;
  maTC: number;
  maNV?: number;
  ngayHen: string;
  gioHen: string;
  trangThai: string;
  ghiChu?: string;
  ngayTao?: string;
}

export interface LichHenDichVu {
  maLHDV: number;
  maLH: number;
  maDV: number;
  soLuong: number;
  donGia: number;
}

export interface TiemPhong {
  maTP: number;
  maTC: number;
  tenVaccine: string;
  ngayTiem: string;
  ngayTiemTiep?: string;
  chuKyNgay: number;
  lieuLuong?: string;
  bacSiThucHien?: string;
  ghiChu?: string;
}

export interface HoaDon {
  maHD: number;
  maLH: number;
  maCN: number;
  ngayLap?: string;
  tongTien: number;
  trangThaiTT: string;
  phuongThucTT?: string;
  soTienKhachTra?: number;
  tienThua?: number;
  ngayThanhToan?: string;
  ghiChu?: string;
}
