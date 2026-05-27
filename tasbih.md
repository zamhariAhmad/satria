# Dokumentasi Fitur: Digital Tasbih (Next.js Version)

Dokumentasi ini menjelaskan implementasi fitur **Digital Tasbih** pada *frontend* menggunakan **Next.js (App Router)** dan **Tailwind CSS**. Fitur ini dilengkapi dengan penentu target, indikator lingkaran progres dinamis, penyimpanan otomatis (*persistence*), serta efek suara/getar.

## ✨ Fitur Utama

1. **Penentuan Target:** Pengguna dapat memasukkan target zikir kustom yang diinginkan.
2. **Indikator Melingkar (Circular Progress):** Lingkaran di sekeliling tombol utama yang akan terisi secara dinamis berdasarkan progres zikir.
3. **Auto-Save (LocalStorage):** Hitungan terakhir dan target disimpan otomatis, sehingga aman jika halaman tidak sengaja ter-*refresh* atau ditutup.
4. **Audio & Haptic Feedback:** Mengeluarkan suara klik digital dan efek getar (jika diakses via *mobile device*) setiap kali tombol di-tap.

---

## 🛠️ Logika Perhitungan Lingkaran (SVG)

Untuk membuat lingkaran progres yang presisi, kita menggunakan properti SVG `strokeDasharray` (keliling lingkaran) dan `strokeDashoffset` (sisa jalur yang belum terisi).

$$\text{Keliling} = 2 \times \pi \times r$$
$$\text{Dashoffset} = \text{Keliling} - \left( \frac{\text{Hitungan}}{\text{Target}} \times \text{Keliling} \right)$$

---

## 💻 Implementasi Komponen (`components/Tasbih.tsx`)

Komponen ini memanfaatkan API browser (`localStorage`, `window.AudioContext`), sehingga wajib dieksekusi di sisi klien.

```tsx
"use client";

import React, { useState, useEffect } from 'react';

export default function Tasbih() {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);

  // Konfigurasi SVG Lingkaran
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? (count / target) * circumference : 0;
  const strokeDashoffset = circumference - Math.min(progress, circumference);

  // Mengambil data dari LocalStorage saat pertama kali load di browser
  useEffect(() => {
    const savedCount = localStorage.getItem('tasbih_count');
    const savedTarget = localStorage.getItem('tasbih_target');
    if (savedCount) setCount(Number(savedCount));
    if (savedTarget) setTarget(Number(savedTarget));
  }, []);

  // Menyimpan data ke LocalStorage setiap ada perubahan state
  useEffect(() => {
    localStorage.setItem('tasbih_count', count.toString());
    localStorage.setItem('tasbih_target', target.toString());
  }, [count, target]);

  // Fungsi Efek Suara (Web Audio API)
  const playClickSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  };

  const handleTap = () => {
    if (count < target) {
      const newCount = count + 1;
      setCount(newCount);
      playClickSound();

      if (navigator.vibrate) navigator.vibrate(40);

      if (newCount === target) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        alert("Alhamdulillah, target zikir Anda hari ini tercapai!");
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-xl max-w-md mx-auto my-10">
      <h2 className="text-3xl font-extrabold mb-2 text-emerald-800 tracking-wide">Tasbih Digital</h2>
      <p className="text-sm text-gray-500 mb-8">Dekatkan diri, hitung zikirmu dengan mudah</p>
      
      
      <div className="mb-6 flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100">
        <label className="font-semibold text-gray-700 text-sm">Tentukan Target:</label>
        <input 
          type="number" 
          value={target} 
          onChange={(e) => { 
            const val = Number(e.target.value);
            setTarget(val < 1 ? 1 : val); 
            handleReset(); 
          }}
          className="w-20 px-2 py-1 border border-emerald-300 rounded-lg text-center font-bold text-emerald-700 focus:outline-emerald-500 focus:ring-2 focus:ring-emerald-200"
          min="1"
        />
      </div>

      
      <div className="mb-6 text-center">
        <div className="text-5xl font-black text-gray-800 tabular-nums">
          {count}
        </div>
        <div className="text-sm font-medium text-emerald-600 mt-1">
          dari target {target}
        </div>
      </div>

      
      <div className="relative w-64 h-64 flex items-center justify-center select-none">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-md">
          <circle
            cx="128"
            cy="128"
            r={radius}
            className="stroke-emerald-100"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            className="stroke-emerald-600 transition-all duration-150 ease-out"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <button
          onClick={handleTap}
          disabled={count >= target}
          className="absolute w-44 h-44 bg-gradient-to-br from-emerald-500 to-emerald-700 active:from-emerald-600 active:to-emerald-800 text-white font-extrabold text-2xl rounded-full shadow-lg flex items-center justify-center border-4 border-white transition-transform active:scale-95 disabled:from-gray-400 disabled:to-gray-500 cursor-pointer disabled:cursor-not-allowed"
        >
          {count >= target ? 'Selesai' : 'TAP'}
        </button>
      </div>

      
      <div className="mt-8 flex gap-4 w-full">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-sm rounded-xl transition-colors shadow-sm text-center"
        >
          Reset Hitungan
        </button>
      </div>
    </div>
  );
}