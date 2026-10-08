/* Uji unit normalisasi (item 1 penomoran + item 5 tanpa LaTeX) — jalankan:
 *   node tools/uji-normalisasi.js
 * Fungsi diambil dari tools/normalkan-konten.js (salinan persis backend).
 */
const { bersihTeks, rapikanPenomoran, normalisasiBab } = require('./normalkan-konten');

let gagal = 0;
const eq = (nama, hasil, harap) => {
  const ok = hasil === harap;
  if (!ok) gagal++;
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${nama}${ok ? '' : `\n  dapat : ${JSON.stringify(hasil)}\n  harap : ${JSON.stringify(harap)}`}`);
};

/* —— rapikanPenomoran —— */
eq('nomor lompat diperbaiki',
  rapikanPenomoran('1.1 Latar\nisi\n\n1.3 Rumusan\nisi'),
  '1.1 Latar\nisi\n\n1.2 Rumusan\nisi');

eq('nomor duplikat diperbaiki',
  rapikanPenomoran('1.1 Latar\n\n1.1 Tujuan'),
  '1.1 Latar\n\n1.2 Tujuan');

eq('anak tingkat-3 urut di bawah induknya (lompat di-reset)',
  rapikanPenomoran('3.1 A\n\n3.2 B\n\n3.2.1 C\n\n3.2.3 D\n\n3.2.2 E'),
  '3.1 A\n\n3.2 B\n\n3.2.1 C\n\n3.2.2 D\n\n3.2.3 E');

eq('anak yatim (3.2.1 tanpa 3.2) menempel ke sub terakhir',
  rapikanPenomoran('3.1 A\n\n3.2.1 C'),
  '3.1 A\n\n3.1.1 C');

eq('loncat tingkat (1.1 → 1.1.1.1) diturunkan setingkat',
  rapikanPenomoran('1.1 A\n\n1.1.1.1 B'),
  '1.1 A\n\n1.1.1 B');

eq('lampiran 6.x ikut dirapikan',
  rapikanPenomoran('6.1 Kuesioner\n\n6.3 Tabulasi'),
  '6.1 Kuesioner\n\n6.2 Tabulasi');

eq('idempoten (diulang hasil sama)',
  (() => { const a = rapikanPenomoran('1.1 A\n\n1.3 B\n\n1.3.1 C'); return rapikanPenomoran(a); })(),
  rapikanPenomoran('1.1 A\n\n1.3 B\n\n1.3.1 C'));

eq('baris tabel pipe tak disentuh',
  rapikanPenomoran('| 1 | Studi A |\n| 2 | Studi B |'),
  '| 1 | Studi A |\n| 2 | Studi B |');

eq('sel "3.2.1 | x | y" (pipe, bukan judul) tak disentuh',
  rapikanPenomoran('3.2.1 | x | y'),
  '3.2.1 | x | y');

eq('tanggal 1.1.2024 bukan judul sub-bab',
  rapikanPenomoran('1.1.2024 Kegiatan lapangan'),
  '1.1.2024 Kegiatan lapangan');

eq('daftar "1. Kegunaan Teoretis" tak disentuh',
  rapikanPenomoran('1. Kegunaan Teoretis'),
  '1. Kegunaan Teoretis');

eq('paragraf biasa berangka di tengah tak berubah',
  rapikanPenomoran('Angka 12.34 tetap pada paragraf ini.'),
  'Angka 12.34 tetap pada paragraf ini.');

/* —— bersihTeks —— */
eq('bold dibuang', bersihTeks('teks **penting** lain'), 'teks penting lain');
eq('$…$ dibuang, isinya dipakai', bersihTeks('ukuran ($N$) adalah 275'), 'ukuran (N) adalah 275');
eq('frac → pecahan berkurung (operator di penyebut)', bersihTeks('n = \\frac{N}{1 + Ne^2}'), 'n = N/(1 + Ne^2)');
eq('frac tanpa operator tetap polos', bersihTeks('\\frac{a}{b}'), 'a/b');
eq('sqrt → akar', bersihTeks('\\sqrt{x^2}'), '√x^2');
eq('command Yunani → karakter Unicode', bersihTeks('\\beta_1 dan \\alpha'), 'β_1 dan α');
eq('kurung LaTeX dibuang', bersihTeks('hasil (\\( x + 1 \\)) akhir'), 'hasil ( x + 1 ) akhir');
eq('spasi sel tabel utuh (tak dirapikan)', bersihTeks('| 1   | Judul |'), '| 1   | Judul |');
eq('persen/dolar biasa tak tersentuh', bersihTeks('anggaran naik 5% menjadi $100'), 'anggaran naik 5% menjadi $100');

/* —— normalisasiBab (item 7: kode <br> tak boleh tampil) —— */
eq('br di baris non-tabel → baris baru',
  normalisasiBab('Isi pertama<br>Isi kedua'),
  'Isi pertama\nIsi kedua');

eq('<br/> dan <br /> juga dipecah',
  normalisasiBab('A<br/>B<br />C'),
  'A\nB\nC');

eq('br dalam baris tabel tetap dipertahankan (satu baris sel)',
  normalisasiBab('| 1 | X1<br>• X2 |\n|---|---|\n| 2 | Z |'),
  '| 1 | X1<br>• X2 |\n|---|---|\n| 2 | Z |');

eq('normalisasiBab idempoten',
  (() => { const a = normalisasiBab('A<br>B\n\n1.1 X\n\n1.3 Y'); return normalisasiBab(a); })(),
  normalisasiBab('A<br>B\n\n1.1 X\n\n1.3 Y'));

console.log('');
console.log(gagal ? `=== ${gagal} GAGAL ===` : '=== SEMUA LULUS ===');
process.exit(gagal ? 1 : 0);
