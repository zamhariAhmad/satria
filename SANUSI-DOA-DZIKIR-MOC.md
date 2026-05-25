### Kategori Doa
1. Endpoint : /doa/kategori
2. Request Header : X-API-Key
3. Request Parameter : -
4. Request Body : -
5. Response :
``
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nama": "Doa Harian",
      "slug": "doa-harian",
      "group_name": "doa",
      "total": 239
    }
  ]
}
``

### Daftar Doa berdasarkan kategori
1. Endpoint : /doa/kategori/{slug}?page=1&limit=10
2. Request Header : X-API-Key
3. Request parameter :
    - slug (doa-harian, dzikir-pagi, dzikir-petang, dzikir-setelah-shalat, doa-pilihan)
    - page
    - limit
4. Request Body : -
5. Response :
``
{
  "status": "success",
  "data": {
    "kategori": {
      "id": 5,
      "nama": "Doa Pilihan",
      "slug": "doa-pilihan",
      "group_name": "doa",
      "total": null
    },
    "total": 8,
    "page": 1,
    "limit": 10,
    "doa": [
      {
        "id": 90,
        "kategori_id": 5,
        "judul": "Doa Sapu Jagat",
        "arab": "رَبَّنَا آَتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآَخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        "latin": "Rabbanā ātinā fīddunyā ḥasanah wa fīlākhirati ḥasanah waqinā 'ażābannār",
        "terjemah": "Ya Allah, berikanlah kepada kami kebaikan di dunia, berikan pula kebaikan di akhirat dan lindungilah kami dari siksa neraka.",
        "fawaid": "Doa ini adalah doa yang paling sering dipanjatkan oleh Nabi Shallallahu 'alaihi wa sallam, sebagaimana penuturan sahabat Anas bin Malik radhiyallahu 'anhu.",
        "catatan": "",
        "sumber": "QS. Al-Baqarah: 201, al-Bukhari: 6389, HR. Muslim: 2690",
        "urutan": 1
      }
    ]
  }
}
``


### Cari doa berdasarkan keyword tertentu
1. endpoint : /doa/search?q={keyword}&limit={limit}
2. Request Header : X-API-Key
3. Request Parameters :
    - q (wajib)
    - limit (minimal 1, maksimal 50)
4. Request Body : -
5. Response :
``
{
  "status": "success",
  "data": [
    {
      "id": 121,
      "kategori_id": 1,
      "judul": "",
      "arab": "",
      "latin": "",
      "terjemah": "",
      "fawaid": "",
      "catatan": "",
      "sumber": "HR. Muslim 2055.",
      "urutan": 62
    }
  ]
}

### Menampilkan detail doa
1. Endpoint  : /doa/{doa_id}
2. Request Header : X-API-Key
3. Request parameters :
    - doa_id : integer
4. Request Body : -
5. Response :
``
{
  "status": "success",
  "data": {
    "id": 121,
    "kategori_id": 1,
    "judul": "Doa Ketika Diberi Makan oleh Orang Lain 1",
    "arab": "",
    "latin": "Allaahumma ath'im man ath'amanii, wasqi man saqoonii.",
    "terjemah": "Ya Allah, berilah makan kepada orang yang memberi aku makan, dan berilah minum kepada orang yang memberi aku minum.",
    "fawaid": "",
    "catatan": "",
    "sumber": "HR. Muslim 2055.",
    "urutan": 62
  }
}
``
