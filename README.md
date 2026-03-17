# Website THR Lebaran

Website THR Lebaran adalah web interaktif bertema Idul Fitri untuk membagikan THR digital secara unik. Pengunjung bisa menekan tombol `Buka Amplop THR!`, melihat animasi pembukaan amplop, menerima isi THR, lalu mengunduh hasilnya sebagai file `.txt`.

Project ini dibuat sebagai website statis yang bisa dijalankan di browser biasa maupun di-deploy ke GitHub Pages. Untuk stok THR global, project ini juga sudah mendukung integrasi dengan Google Sheets melalui Google Apps Script.

Website ini dibuat untuk bagi-bagi THR dalam bentuk akun atau akses apps premium, misalnya seperti Netflix Premium, YouTube Premium, dan CapCut Premium.

## Fitur Utama

- Animasi pembukaan amplop THR dengan overlay, efek cahaya, dan confetti.
- Popup hasil THR dengan status berhasil atau gagal saat stok sudah habis.
- Download hasil THR sebagai file `.txt` setelah tombol `Terima THR` ditekan.
- Generator kartu ucapan THR yang bisa di-download sebagai PNG.
- Dukungan mobile/responsive.
- Sistem `1 orang 1 kali buka per 24 jam` per browser/device menggunakan `localStorage`.
- Fallback ke file lokal `akun.txt` jika Google Sheets belum dipakai.
- Integrasi Google Sheets + Google Apps Script untuk stok THR global.

## Cara Kerja

### Mode Lokal

Jika URL Google Apps Script belum diisi, website akan membaca data THR dari file `akun.txt`.

### Mode Google Sheets

Jika `APPS_SCRIPT_URL` di `script.js` diisi, website akan mengambil THR dari Google Sheets lewat Google Apps Script.

Alurnya:

1. User klik `Buka Amplop THR!`
2. Website menjalankan animasi amplop
3. Website mengambil 1 data THR dari Google Apps Script
4. Google Apps Script menandai row tersebut sebagai `CLAIMED`
5. Hasil THR ditampilkan ke user
6. Saat tombol `Terima THR` diklik, file `.txt` akan otomatis di-download

## Teknologi yang Dipakai

- `HTML`
  Untuk struktur halaman.
- `CSS`
  Untuk styling, animasi, layout responsive, dan efek visual.
- `JavaScript`
  Untuk semua logika interaktif di frontend.
- `Tailwind CSS`
  Dipakai lewat CDN untuk utility class pada tampilan.
- `Google Apps Script`
  Dipakai sebagai backend ringan untuk mengambil dan mengunci stok THR dari Google Sheets.
- `Google Sheets`
  Dipakai sebagai penyimpanan data THR global.

## Setup Google Sheets

### 1. Siapkan Spreadsheet

Buat sheet dengan nama:

`THR`

Gunakan header berikut:

- `reward`
- `status`
- `claimed_at`
- `source`

Setiap 1 THR harus berada dalam 1 baris. Isi detail akun dimasukkan ke kolom `reward` dalam satu sel multi-line.

### 2. Import Template

Import file:

[google-sheets-template.csv](/c:/laragon/www/website-thr/google-sheets-template.csv)

### 3. Deploy Google Apps Script

Salin isi:

[google-apps-script.gs](/c:/laragon/www/website-thr/google-apps-script.gs)

Lalu deploy sebagai Web App dengan pengaturan:

- `Execute as`: `Me`
- `Who has access`: `Anyone`

### 4. Pasang URL Web App

Isi konstanta berikut di:

[script.js](/c:/laragon/www/website-thr/script.js)

```js
const APPS_SCRIPT_URL = 'URL_WEB_APP_ANDA';
```

## Fitur Keamanan Sederhana

Website ini memiliki pembatasan `1 orang 1 kali buka per 24 jam` berbasis browser menggunakan `localStorage`. Artinya:

- Jika user sudah pernah membuka THR di browser tersebut, tombol akan terkunci sementara.
- Setelah refresh, tombol tetap tidak bisa dipakai selama masa lock belum habis.
- Setelah lewat 24 jam, tombol akan aktif kembali otomatis dan user bisa membuka amplop lagi.

Catatan: ini bukan proteksi server-side penuh. Jika ingin aturan yang lebih kuat lintas device/user, penguncian utama tetap harus dilakukan oleh Google Sheets/Apps Script.

## Catatan

- Untuk GitHub Pages, file frontend tetap statis.
- Pengurangan stok global tidak bisa mengandalkan `txt` lokal saja.
- Karena itu project ini memakai rekomendasi Google Sheets + Google Apps Script untuk stok bersama.
