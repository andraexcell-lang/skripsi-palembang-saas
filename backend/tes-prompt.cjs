// Uji prompt struktur per varian — node tes-prompt.cjs (dari folder backend)
require('dotenv').config();
const { babPrompt } = require('./dist/routes/projects.routes.js');

const kasus = [
  ['kuantitatif-tesis bab1', { judul: 'X', jenis: 'tesis', metode: 'Kuantitatif' }, 'bab1'],
  ['kuantitatif-skripsi bab3', { judul: 'X', jenis: 'skripsi', metode: 'Kuantitatif' }, 'bab3'],
  ['kualitatif-skripsi bab3', { judul: 'X', jenis: 'skripsi', metode: 'Kualitatif' }, 'bab3'],
  ['kualitatif-tesis bab4', { judul: 'X', jenis: 'tesis', metode: 'Kualitatif' }, 'bab4'],
  ['pustaka-skripsi bab2', { judul: 'X', jenis: 'skripsi', metode: 'Studi Pustaka' }, 'bab2'],
  ['ptk-skripsi bab4', { judul: 'X', jenis: 'skripsi', metode: 'PTK' }, 'bab4'],
  ['hukum-tesis bab5', { judul: 'X', jenis: 'tesis', metode: 'Hukum Normatif' }, 'bab5'],
  ['rnd-skripsi lampiran', { judul: 'X', jenis: 'skripsi', metode: 'R&D' }, 'lampiran'],
  ['mixed-tesis bab3', { judul: 'X', jenis: 'tesis', metode: 'Mixed Method' }, 'bab3'],
];
for (const [nama, p, bab] of kasus) {
  const t = babPrompt(bab, p, [{ doi: '10.1/x', title: 'T', authors: 'A', year: '2024', url: '' }], {});
  const awal = t.split('Judul: karya berikut.')[0];
  console.log('===== ' + nama + ' =====');
  console.log(awal.trim().slice(0, 900));
  console.log('');
}
