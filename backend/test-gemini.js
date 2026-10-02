import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

console.log("Memulai pengetesan API Gemini...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
const model = genAI.getGenerativeModel({ model: "gemini-3.7-pro" });

async function runTest() {
    try {
        console.log("Mengirim prompt ke Gemini 1.5 Pro...");
        const result = await model.generateContent("Tuliskan 1 paragraf latar belakang skripsi tentang pengaruh motivasi terhadap kinerja.");
        console.log("\n✅ HASIL DARI GEMINI:\n");
        console.log(result.response.text());
        console.log("\n✅ Pengetesan Berhasil!");
    } catch (error) {
        console.error("\n❌ Gagal memanggil Gemini API:", error.message);
    }
}

runTest();
