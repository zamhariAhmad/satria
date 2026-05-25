## 1. Executive Summary

### 1.1 Background
Menu Wirid dan Doa digunakan untuk menampilkan daftar wirid dan doa berdasarkan kategorinya. melalui menu wirid dan doa pengguna bisa melakukan pencarian doa-doa yang relevan dengan keyword yang dimasukkan. Adapun data wirid dan doa diperoleh dari api https://api.ahmadsanusi.com/v1/ dengan daftar endpoint yang akan dijelaskan pada penjelasan API dibawah ini.

### 1.2 API Description
 https://api.ahmadsanusi.com/v1/ merupakan endpoint yang menyediakan kebutuhan data islami seperti hadits, doa harian, kitab kuning, quran, waktu sholat dan arah kiblat. API yang disediakan sifatnya berbayar, namun tetap bisa diakses dengan limitasi. Setiap akun memiliki api key aktif yang digunakan untuk request api. Setiap API wajib menyertakan X-API-Key yang sudah disediakan dari .env.local atau bisa request dengan contoh di file `SANUSI-API-DOA-DZIKIR-MOC.md`

 ### 1.3 API Endpoint Related List :
 1. Login : /auth/login
 2. Profil : /auth/me
 3. Daftar kategori doa : /doa/kategori
 4. Pencarian doa : /doa/seach?q={keyword}&limit={limit}
 5. Daftar doa berdasarkan kategori : /doa/kategori/doa-pilihan?page=1&limit=10
 7. Melihat detail 1 doa : /doa/{doa_id}

 ### Instruction :
    1. Pada route /wirid buatkan tampilan dengan section sebagai berikut :
        - search box untuk pencarian doa
        - kategori doa dalam bentuk widget interaktif dan modern
    2. Ketika kategori di klik alihkan ke halaman detail untuk menampilkan daftar doa dari kategori yang dipilih
    3. Supaya tidak membebani server paginate daftar doa sebanyak 10 doa per halaman.
    4. Tambahkan pencarian juga supaya bisa mencari doa berdasarkan keyword yang dimasukkan
    5. ketika list doa di klik maka tampilkan detail doa