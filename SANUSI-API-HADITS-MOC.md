### Autentikasi
1. Endpoint : /auth/login
2. Request Body :
    - email
    - password
3. Response :
``
{
  "status": "success",
  "data": {
    "user": {
      "id": 55,
      "name": "Kang Makhfud",
      "email": "ayongabdi@gmail.com",
      "tier": "pro",
      "is_active": true,
      "created_at": "2026-05-20T09:12:05"
    },
    "message": "Login berhasil.",
    "rate_limit": {
      "day": 10000,
      "description": "10.000 requests/hari"
    }
  }
}
``


### Profil untuk mengecek token dan request hit per hari
1. Endpoint : /auth/me
2. Request Body : -
3. Request Header : X-API-Key
4. Response :
``
{
  "status": "success",
  "data": {
    "user": {
      "id": 55,
      "name": "Kang Makhfud",
      "email": "ayongabdi@gmail.com",
      "tier": "pro",
      "is_active": true,
      "created_at": "2026-05-20T09:12:05"
    },
    "current_key": {
      "id": 66,
      "name": "satria",
      "key_prefix": "ask_qKz8SKYe",
      "is_active": true,
      "total_requests": 24,
      "created_at": "2026-05-20T09:15:54",
      "last_used_at": "2026-05-21T06:19:56"
    },
    "rate_limit": {
      "day": 10000,
      "description": "10.000 requests/hari"
    }
  }
}
``

### Daftar Kitab hadits
1. Endpoint : /hadits
2. Request Body : -
3. Request Header : X-API-Key
4. Response :
``
{
  "status": "success",
  "data": {
    "kitab": [
      {
        "slug": "musnad_ahmad",
        "nama": "Musnad Ahmad",
        "jumlah": 26363
      },
      {
        "slug": "shahih_bukhari",
        "nama": "Shahih Bukhari",
        "jumlah": 7008
      }
    ]
  }
}
``

### Get Hadits Single Random Harian
1. Endpoint : /hadits/daily
2. Request Body : -
3. Request Header : X-API-Key
4. Response :
``
{
  "status": "success",
  "data": {
    "nomor": 685,
    "kitab": "sunan_ibnu_majah",
    "arab": "",
    "terjemah": "",
    "has_terjemah": true
  }
}
``

### Pencarian hadits
1. Endpoint : /hadits/search
2. Request parameters :
    - q (required)
    - kitab (optional)
    - page (optional)
    - limit (optional)
3. Request Header : X-API-Key
4. Response
``
{
  "status": "success",
  "data": {
    "q": "shalat",
    "kitab": "shahih-bukhari",
    "page": 1,
    "per_page": 10,
    "total": 10833,
    "total_pages": 1084,
    "results": [
      {
        "nomor": 212,
        "kitab": "riyadhus_shalihin",
        "arab": "",
        "terjemah": "",
        "has_terjemah": true
      }
    ]
  }
}
``

### Get Hadits berdasarkan Kitabnya
1. Endpoint : /hadits/{slug}
2. Request Parameters :
    - slug : slug kitab hadits (required, contoh : shahih_bukhari, shahih_muslim, sunan_abu_daud, sunan_tirmidzi, sunan_nasai, sunan_ibnu_majah, musnad_ahmad, musnad_syafii, riyadhus_shalihin, riyadhus_shalihin_arab)
    - page : minimal 1(optional)
    - limit : minimal 1, maksimal 200 (optional)
3. Request Header : X-API-Key
4. Response :
``
{
  "status": "success",
  "data": {
    "kitab": "sunan_nasai",
    "nama": "Sunan Nasa'i",
    "page": 1,
    "per_page": 1,
    "total": 5662,
    "total_pages": 5662,
    "hadiths": [
      {
        "nomor": 1,
        "kitab": "sunan_nasai",
        "arab": "",
        "terjemah": "",
        "has_terjemah": true
      }
    ]
  }
}
``


### Get 1 Hadits dari sebuah kitab
1. Endpoint : /hadits/{kitab}/{nomor}
2. Request Parameter :
    - kitab : kitab hadits (required, contoh : shahih_bukhari, shahih_muslim, sunan_abu_daud, sunan_tirmidzi, sunan_nasai, sunan_ibnu_majah, musnad_ahmad, musnad_syafii, riyadhus_shalihin, riyadhus_shalihin_arab)
    - nomor : nomor hadits
3. Request Header : X-API-Key
4. Response :
``
{
  "status": "success",
  "data": {
    "nomor": 1,
    "kitab": "sunan_nasai",
    "arab": "",
    "terjemah": "",
    "has_terjemah": true
  }
}
``