import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tight">
          Asisten <span className="text-brand-primary">Riset</span> AI Anda
        </h1>
        <p className="text-lg text-text-secondary">
          Bantu selesaikan Skripsi, Tesis, dan Disertasi dengan cepat, bebas plagiasi, dan berkualitas tinggi menggunakan kecerdasan buatan terdepan.
        </p>
        
        <div className="pt-8">
          <Link href="/dashboard" className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-light text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-primary/20">
            Masuk ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
