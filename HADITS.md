## 1. Executive Summary

### 1.1 Background
Hadits menu digunakan untuk menampilkan kitab-kitab hadist terkenal seperti sunan abu daud, hadist bukhari dan lain sebagainya. melalui menu hadits pengguna bisa melakukan membaca hadits dari berbagai kitab hadits terkenal. Pengguna juga bisa melakukan pencarian nama kitab hadits terkenal. adapun data hadits diperoleh dari api https://api.ahmadsanusi.com/v1/ dengan daftar endpoint yang akan dijelaskan pada penjelasan API dibawah ini.

### 1.2 API Description
 https://api.ahmadsanusi.com/v1/ merupakan endpoint yang menyediakan kebutuhan data islami seperti hadits, doa harian, kitab kuning, quran, waktu sholat dan arah kiblat. API yang disediakan sifatnya berbayar, namun tetap bisa diakses dengan limitasi. Setiap akun memiliki api key aktif yang digunakan untuk request api. Setiap API wajib menyertakan X-API-Key yang sudah disediakan dari .env.local atau bisa request dengan contoh di file `SANUSI-API-HADITS-MOC.md`

 ### 1.3 API Endpoint Related List :
 1. Login : /auth/login
 2. Profil : /auth/me
 3. Daftar Kitab : /hadits
 4. Hadits harian (single) : /hadits/daily
 5. Pencarian hadits : /hadits/seach?q={keyword}&kitab={slug_kitab}&page={page}&limit={limit}
 6. Menampilkan daftar hadits berdasarkan kitab : /hadits/{slug}
 7. Melihat detail 1 hadits dari sebuah kitab : /hadits/{slug_kitab}/{nomor_hadits}

 ### Instruction :
    1. Pada route /hadits buatkan tampilan dengan section sebagai berikut :
        - search box untuk pencarian hadits
        - daftar kitab yang tersedia dengan endpoint api nomor 2
    2. Ketika kitab hadits di klik alihkan ke halaman detail untuk menampilkan daftar hadits dari kitab yang dipilih
    3. Supaya tidak membebani server paginate daftar hadits sebanyak 10 hadits per halamn.
    4. Tambahkan pencarian juga supaya bisa mencari hadits berdasarkan kitab yang dipilih
    5. ketika list hadits di klik maka tampilkan detail hadits