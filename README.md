# Tugas Rutin 6 — Interactive Quiz App

Kuis interaktif vanilla JavaScript, tanpa framework, tanpa build step —
tinggal buka `index.html` langsung di browser.

## Cara pakai

Buka `index.html` (double-click, atau pakai extension Live Server di
VS Code). Tidak perlu API key atau instalasi apa pun.

## Ketentuan yang dipenuhi

**Wajib:**
- 8 pertanyaan pilihan ganda (minimal 5) — lihat array `questions` di `quiz.js`
- Render soal & opsi lewat `document.createElement` + `textContent`, bukan `innerHTML`
- Event delegation: satu `click` listener di container `#options`, bukan satu listener per tombol jawaban
- Skor otomatis dihitung di akhir kuis
- High score tersimpan permanen di LocalStorage
- Navigasi antar layar (start → quiz → result) tanpa reload halaman sama sekali (SPA pattern)
- Feedback visual: jawaban benar jadi hijau, jawaban salah yang dipilih jadi merah
- Tombol "Ulangi Kuis" mereset semua state dan mulai dari awal

**Bonus (semua 5 dikerjakan):**
- Timer 15 detik per soal, dengan bar yang mengecil dan berubah warna saat waktu hampir habis
- Progress bar visual menunjukkan soal keberapa dari total
- Urutan soal (dan kategorinya) diacak tiap kali kuis dimulai
- Animasi fade + slide saat kartu soal berganti
- Dark mode toggle di pojok kanan atas

## Cara ganti/tambah soal

Buka `quiz.js`, cari array `questions` di paling atas. Tiap soal
formatnya:

```js
{
  category: "JavaScript",
  question: "Teks pertanyaan di sini?",
  options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
  correctIndex: 2, // index jawaban benar, mulai dari 0
}
```

## Cara push ke GitHub

```bash
git init
git add .
git commit -m "Tugas Rutin 6: Interactive Quiz App"
git branch -M main
git remote add origin https://github.com/username/nama-repo.git
git push -u origin main
```

Ganti `username/nama-repo` dengan repository GitHub kamu sendiri.
