# ASTRAYA AI Orchestrator — Gece Modu

Bu paket **ChatGPT-authenticated Codex Director/Reviewer + Cursor CLI Developer + Git nightly branch + asset candidate queue** döngüsünü çalıştırır.

## Güvenlik modeli

- `main` branch'e otomatik merge YOK.
- Her çalıştırma `ai/nightly-YYYYMMDD-HHMMSS` branch'i açar.
- Cursor'a `git` / `gh`, `.env` ve `CNAME` erişimi verilmez.
- Git commit/push işlemini deterministic olarak orchestrator yapar.
- Varsayılan olarak generated image asset'leri production path'e otomatik taşınmaz.
- `AUTO_PROMOTE_ASSETS=0` varsayılandır.
- Maksimum görev, asset ve fix turu vardır.

## 1) Klasörü repoya koy

Zip'i aç ve klasörü şuraya koy:

```text
papigames.alperensenel.com/
├─ astraya-ai-orchestrator/
├─ ai/
├─ assets/
├─ design/
├─ js/
└─ ...
```

Bu arşiv şu anda bir ek klasör katmanıyla açıldığı için `config.env.example`
içindeki `REPO_PATH=../..` depo kökünü gösterir.

## 2) Cursor CLI

Windows PowerShell:

```powershell
irm 'https://cursor.com/install?win32=true' | iex
agent login
agent status
```

İstersen automation için `CURSOR_API_KEY` kullan.

## 3) Codex / ChatGPT girişi

Director ve Reviewer varsayılan olarak bu bilgisayardaki Codex CLI'nin kayıtlı
ChatGPT oturumunu kullanır:

```powershell
codex login status
```

`Logged in using ChatGPT` çıktısı yeterlidir. Director/Reviewer için Platform API
kredisi gerekmez.

## 4) OpenAI API (yalnızca asset üretimi)

`config.env.example` dosyasını `config.env` adıyla kopyala.

Görsel asset candidate üretmek istiyorsan doldur:

```text
CURSOR_API_KEY=...
OPENAI_API_KEY=...
```

API anahtarlarını GitHub'a commit etme.

`CURSOR_API_KEY` zorunlu değildir; `agent login` oturumu kullanılabilir.

## 5) Mevcut Cursor değişikliklerini commit et

Gece modu varsayılan olarak kirli working tree ile başlamaz.

Cursor'ın şu an yaptığı Knight pipeline değişikliklerini önce commit et:

```bash
git add -A
git commit -m "feat: knight asset pipeline foundation"
git push
```

Bunu Cursor/Git arayüzünden de yapabilirsin.

## 6) Test

`CHECK_SETUP.bat`

çalıştır.

Python, Git, Cursor CLI ve repo durumunu gösterir.

## 7) Başlat

`START_ASTRAYA_AI.bat`

çift tıkla.

İlk çalıştırma Python paketlerini kurar.

## Gece boyunca ne yapar?

1. Temiz repo kontrolü
2. `ai/nightly-*` branch oluşturma
3. Cursor izin sandbox dosyası
4. `ai/ASSET_QUEUE.json` içindeki pending asset candidate'lerini GPT Image ile üretme
5. Üretilen candidate'i vision reviewer ile kontrol etme
6. OpenAI Director'ın repo state dosyalarından tek bir sonraki görev seçmesi
7. Cursor CLI `agent -p` ile görevi uygulaması
8. Git commit
9. Statik istemci doğrulaması (JS syntax + ES module import yolları)
10. OpenAI Reviewer'ın tam commit diff'i ve test çıktısını incelemesi
11. Gerekirse maksimum 3 fix turu
12. Sonraki task
13. `ai/NIGHTLY_REPORT.md` güncelleme

## Asset queue formatı

Cursor'dan machine-readable asset ihtiyacı beklenir:

```json
{
  "jobs": [
    {
      "id": "knight_sword_t01_slash",
      "status": "pending",
      "target_path": "assets/characters/knight/weapons/knight_sword_t01_slash.png",
      "prompt": "Knight tier-1 longsword slash layer. Must align to the current 64x64 LPC slash frames, four direction rows, six frames per row. Weapon layer only; no character body."
    }
  ]
}
```

Durumlar:

- `pending`
- `candidate`
- `approved_candidate`
- `rejected`
- `blocked`
- `promoted`

Varsayılan olarak `approved_candidate` bile production'a taşınmaz. Bu özellikle sprite sheet hassasiyeti yüzündendir.

API kredisi veya görsel üretim isteği yoksa `ENABLE_ASSET_GENERATION=0` bırakılır;
pending işler değiştirilmeden kuyrukta bekler. Üretim açılacağı zaman bunu `1` yap.

## Önemli: AI sprite üretiminin sınırı

Görsel modeller güzel konsept ve sprite adayları üretebilir; ancak 64x64 LPC gibi frame/pivot hassasiyetli animasyonlarda kusursuz grid ve piksel hizasını garanti etmez.

Bu nedenle paket:
- üretir,
- görsel reviewer ile kontrol eder,
- candidate klasöründe tutar,
- ancak varsayılan olarak final diye oyuna sokmaz.

`AUTO_PROMOTE_ASSETS=1` açılabilir, fakat ilk testlerde önerilmez.

## Sabah nereden bakacağım?

Repo:

```text
ai/NIGHTLY_REPORT.md
ai/HANDOFF.md
ai/ASSET_QUEUE.json
assets/generated_candidates/
```

Orchestrator:

```text
astraya-ai-orchestrator/logs/
```

Git:

```text
ai/nightly-...
```

branch'i.

## İlk gece hedefi

Mevcut Knight pipeline'dan devam et:

1. gerçek asset requirement queue
2. Knight longsword candidate'leri
3. shield candidate'leri
4. armor / helmet eksikleri
5. skill effect candidate'leri
6. preview/validation entegrasyonu
7. Knight PASS/BLOCKED durumundan sonra sonraki sınıf

Director `ai/TASKS.md`, `ai/HANDOFF.md` ve asset spec'e göre sırayı kendi seçer.
