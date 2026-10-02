"use client";

import { useState } from "react";

export default function SimulasiSidangPage() {
  const [nama, setNama] = useState("Indah Permata Sari");
  const [materi, setMateri] = useState("");
  const [jenis, setJenis] = useState("sempro");
  const [penguji, setPenguji] = useState("Dr. Sarah Wijaya (Dosen metodologi, teliti & sistematis)");
  const [gaya, setGaya] = useState("Kritis");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = materi.trim().length > 0 && nama.trim().length > 0;

  const handleSimulasi = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Berperanlah sebagai ${penguji} dengan gaya menguji yang ${gaya}. 
Mahasiswa yang sedang sidang (${jenis === 'sempro' ? 'Seminar Proposal' : 'Seminar Hasil'}) ini bernama ${nama}. 
Berikut adalah ringkasan penelitiannya:\n\n${materi}\n\nBerikan sambutan pembuka sidang singkat, lalu berikan 3 pertanyaan kritis dan menantang (sesuai gaya menguji Anda) untuk menguji argumen, metode, atau temuan dari materi tersebut. Format output dalam Markdown (berupa dialog).`;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setHasil(data.result);
      } else {
        setHasil("Error: " + (data.error || "Gagal menghubungi server AI."));
      }
    } catch (error: any) {
      setHasil("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      
      {/* Top Header */}
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2 cursor-pointer ml-auto">
             <div className="text-xs font-semibold text-accent-red border border-accent-red/20 bg-accent-red/10 px-3 py-1 rounded-full flex items-center gap-1 mr-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                0 kredit
             </div>
             <button className="text-text-secondary hover:text-text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8 overflow-y-auto pb-48">
        
        <div className="flex items-start gap-4 mb-2">
          <div className="w-12 h-12 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center shrink-0 text-brand-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Simulasi Sidang (Teks Mode)</h1>
            <p className="text-text-secondary text-sm mt-1 leading-relaxed">
               Latihan sidang dengan AI dosen penguji. Penguji membaca materi karyamu dan mengejar jawaban yang lemah. (Versi audio dinonaktifkan untuk demo ini).
            </p>
          </div>
        </div>

        <div className="space-y-6 bg-bg-surface border border-border-subtle rounded-xl p-6">
           
           {/* Step 1 */}
           <div>
              <label className="flex items-center gap-2 text-sm mb-3">
                 <div className="w-6 h-6 rounded bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center">1</div>
                 <span className="font-bold text-text-primary">Nama panggilanmu <span className="font-normal text-text-muted">— penguji akan menyapamu dengan nama ini</span></span>
              </label>
              <input 
                type="text" 
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none" 
              />
           </div>

           {/* Step 2 */}
           <div>
              <label className="flex items-center gap-2 text-sm mb-3">
                 <div className="w-6 h-6 rounded bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center">2</div>
                 <span className="font-bold text-text-primary">Materi Ujian (Simulasi Upload Berkas)</span>
              </label>
              <textarea 
                rows={5}
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Paste ringkasan proposal/hasil skripsi Anda di sini..."
                className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none mb-2"
              ></textarea>
           </div>

           {/* Step 3 */}
           <div>
              <label className="flex items-center gap-2 text-sm mb-3">
                 <div className="w-6 h-6 rounded bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center">3</div>
                 <span className="font-bold text-text-primary">Jenis sidang</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                 <div onClick={() => setJenis("sempro")} className={`border rounded-xl p-4 cursor-pointer transition-colors ${jenis === 'sempro' ? 'border-brand-primary bg-brand-primary/10 shadow-[inset_0_0_0_1px_rgba(0,102,255,0.2)]' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                    <div className={`font-bold text-sm mb-1 ${jenis === 'sempro' ? 'text-brand-primary' : 'text-text-primary'}`}>Seminar Proposal</div>
                 </div>
                 <div onClick={() => setJenis("semhas")} className={`border rounded-xl p-4 cursor-pointer transition-colors ${jenis === 'semhas' ? 'border-brand-primary bg-brand-primary/10 shadow-[inset_0_0_0_1px_rgba(0,102,255,0.2)]' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                    <div className={`font-bold text-sm mb-1 ${jenis === 'semhas' ? 'text-brand-primary' : 'text-text-primary'}`}>Seminar Hasil</div>
                 </div>
              </div>
           </div>

           {/* Step 5 */}
           <div>
              <label className="flex items-center gap-2 text-sm mb-3">
                 <div className="w-6 h-6 rounded bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center">4</div>
                 <span className="font-bold text-text-primary">Pilih dosen penguji</span>
              </label>
              <select 
                value={penguji}
                onChange={(e) => setPenguji(e.target.value)}
                className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
              >
                <option value="Dr. Sarah Wijaya (Dosen metodologi, teliti & sistematis)">👩🏻‍🏫 Dr. Sarah Wijaya (Metodologi, sistematis)</option>
                <option value="Dr. Bima Pratama (Dosen praktisi, fokus pada logika & relevansi)">👨🏻‍💼 Dr. Bima Pratama (Praktisi, logika & relevansi)</option>
                <option value="Jenderal Purn. Surya Wibawa (Gaya militer, komando, to the point)">👨🏽‍✈️ Jenderal (Purn.) Surya Wibawa (Gaya militer, tegas)</option>
                <option value="Prof. Rendra Mahardika (Sang orator, retoris & menjebak)">👨🏼‍🏫 Prof. Rendra Mahardika (Orator, pertanyaan menjebak)</option>
              </select>
           </div>

           {/* Step 6 */}
           <div>
              <label className="flex items-center gap-2 text-sm mb-3">
                 <div className="w-6 h-6 rounded bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center">5</div>
                 <span className="font-bold text-text-primary">Gaya menguji</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                 {['Ramah', 'Kritis', 'Killer'].map((g) => (
                   <div key={g} onClick={() => setGaya(g)} className={`border rounded-xl p-4 cursor-pointer transition-colors ${gaya === g ? 'border-brand-primary bg-brand-primary/10 shadow-[inset_0_0_0_1px_rgba(0,102,255,0.2)]' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                      <div className={`font-bold text-sm mb-1 ${gaya === g ? 'text-brand-primary' : 'text-text-primary'}`}>{g === 'Killer' ? '🔥 ' : ''}{g}</div>
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Result Area */}
        {hasil && (
          <div className="border border-brand-primary/20 bg-bg-surface-hover rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed mt-6">
             <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Pertanyaan Penguji:</h3>
             {hasil}
          </div>
        )}

      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-bg-base border-t border-border-subtle p-6 z-50">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
           <button 
             onClick={handleSimulasi}
             disabled={!isFormValid || loading}
             className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed mb-2'}`}
           >
             {loading ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Memanggil Dosen Penguji...
               </>
             ) : (
               <>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                 Mulai Simulasi Sidang
               </>
             )}
           </button>
           <span className="text-xs text-text-muted mt-2">{!isFormValid ? 'Isi materi dan nama untuk mengaktifkan.' : 'Siap diuji!'}</span>
        </div>
      </div>

    </div>
  );
}
