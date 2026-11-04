# USTP PPD Petaling Utama

Repo kekal: https://github.com/ustpPU/main . Homepage GitHub Pages dan laluan terus menggunakan backend Apps Script untuk pendaftaran, maklum balas, sijil serta pengesahan admin. Jika sesi Google menyekat bacaan katalog merentas laman, pintu masuk membuka aplikasi Apps Script secara terus.

Data peserta disimpan dalam Sheet private cm4 yang berasingan daripada kod. Penerbitan laman/kod tidak memadam data. Tiada data peserta, kunci QR acara sebenar, token admin atau ID Sheet private dimasukkan ke repo.

Admin boleh pilih daftar terus hadir atau pradaftar dengan QR kehadiran berasingan. Dashboard disegarkan automatik setiap 20 saat apabila aktif, tanpa mengganggu borang/modal.

`npm test` dan `npm run build`. Isi ID Sheet hanya dalam salinan deployment private; jangan commit nilai itu. `initializeUstpLive` menambah tab/acara yang belum ada sahaja, mengekalkan eventKey dan semua rekod sedia ada. `verifyUstpLive` semakan baca sahaja. Helpers staging ditolak pada live. Jangan padam Sheet atau jalankan reset semasa pembangunan.

Acara pertama: Bengkel Transformasi Digital STEM: Pemerkasaan Literasi AI, 4 November 2026, 08:30–16:00, MAHSA Avenue International College. Sasaran Pengetua/Guru Besar semua SR dan SM.

Borang peserta dan katalog public boleh dibuka tanpa login MOE. Laluan admin menggunakan deployment domain MOE berasingan. Kedua-duanya menggunakan database private kekal yang sama.
