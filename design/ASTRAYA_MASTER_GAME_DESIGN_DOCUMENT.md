---
title: "ASTRAYA - COMPLETE 2D MMORPG GAME DESIGN DOCUMENT"
subtitle: "Production Design Pack / Master Specification"
author: "Game Design Master Document"
date: "2026-09-24"
lang: tr-TR
toc: true
toc-depth: 3
numbersections: true
geometry: margin=1.65cm
fontsize: 9pt
mainfont: "DejaVu Serif"
sansfont: "DejaVu Sans"
monofont: "DejaVu Sans Mono"
header-includes:
  - \usepackage{longtable}
  - \usepackage{booktabs}
  - \usepackage{array}
  - \usepackage{fancyhdr}
  - \usepackage{graphicx}
  - \usepackage{float}
  - \pagestyle{fancy}
  - \fancyhf{}
  - \lhead{ASTRAYA - MASTER GDD}
  - \rhead{\thepage}
  - \setlength{\headheight}{14pt}
---

![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Concept_Art/project_asset_overview.png){ width=96% }


# 1. Belgenin Amacı ve Üretim Seviyesi

Bu belge Astraya 2D MMORPG projesinin **hikaye + sistem + içerik + veri + asset üretim standardını** tek kaynaktan tanımlar. Amaç yalnızca fikir vermek değil; programcı, level designer, combat designer, quest designer, UI artist ve 2D artistin aynı kurallarla çalışmasını sağlamaktır. ZIP paketindeki CSV/JSON dosyaları bu belgedeki tabloların makine-okunabilir karşılıklarıdır.


## 1.1 Oyun Özeti

- Tür: Top-down / 3-quarter view 2D MMORPG
- Level cap: 100
- Sınıflar: Knight, Berserker, Assassin, Ranger, Mage, Priest
- PvE omurgası: açık dünya, görev, dungeon, world boss, raid
- PvP: duel, 3v3 arena, 10v10 battleground, event PvP
- Sosyal: party, guild, auction, mail, friends, chat
- Monetization: kozmetik ve convenience odaklı cash shop


# 2. Evren ve Ana Hikaye




Astraya kıtası, bin yıl önce “İkinci Şafak” adı verilen kozmik felaketten sonra **dokuz göksel mühür** ile Abyss boyutundan ayrılmıştır. Bu mühürler doğa, kök, ay, ateş, kum, gök, buz ve ışık enerjileriyle beslenir. Başlangıçta küçük bir sınır köyü olan Dawnwatch'ta uyanan oyuncu, çevredeki hayvanların saldırganlaşması ve toprağın altında parlayan mor damarlar nedeniyle yerel sorunlara yardım eder.

İlk büyük kırılma Verdant Trail'deki Thornmaw saldırısıdır. Oyuncu burada bozulmanın tesadüf olmadığını, bir kültün mühürleri içeriden çürüttüğünü öğrenir. Moonfen Marsh'ta kültün ruhları yakıt olarak kullandığı, Ashen Wastes'ta eski lejyonun forge ağını ele geçirdiği, Ironroot'ta ise mühürlerin fiziksel “kök bağlantılarını” kestiği anlaşılır.

Sunscar Desert'ta oyuncu **Solar Keystone** adlı anahtar parçayı bulur. Celestine Ruins'teki arşivlerde “Second Dawn” kehaneti çözülür: Abyss Gate, göksel tutulma sırasında yeniden açılacaktır. Frostpeak Highlands'ta son koruyucu mühür saldırıya uğrar; oyuncu tüm fraksiyonları tek ittifakta birleştirir.

Abyss Gate endgame bölgesinde dünya etkinlikleri artık savunma savaşlarına dönüşür. Son raid olan Eclipse Cathedral'da oyuncular Eclipse Seraph Malzor'u durdurur. Malzor yenilir fakat “Kapı kapandı, fakat gök hatırladı” sözüyle ikinci sezon için göksel varlıkların daha büyük bir çatışmaya hazırlandığı açığa çıkar.


## 2.2 Prologue - Embers at Dawn

**Bölge:** Dawnwatch Village

Oyuncu Dawnwatch çevresindeki ilk anomalileri araştırır. Yerel haydut problemi, mor damarlarla temas eden yaratıkların saldırganlaşması ve kasabanın altında unutulmuş bir mühür odasına giden ilk ipucu anlatılır.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_01_01 | 1 | Prologue: Adım 1 | Talk | Dawnwatch Village içindeki hikâye hedefi 1 | XP tier 1, Gold, story flag MQ_01_01 |
| MQ_01_02 | 2 | Prologue: Adım 2 | Kill | Dawnwatch Village içindeki hikâye hedefi 2 | XP tier 1, Gold, story flag MQ_01_02 |
| MQ_01_03 | 3 | Prologue: Adım 3 | Collect | Dawnwatch Village içindeki hikâye hedefi 3 | XP tier 1, Gold, story flag MQ_01_03 |
| MQ_01_04 | 4 | Prologue: Adım 4 | Investigate | Dawnwatch Village içindeki hikâye hedefi 4 | XP tier 1, Gold, story flag MQ_01_04 |
| MQ_01_05 | 5 | Prologue: Adım 5 | Defend | Dawnwatch Village içindeki hikâye hedefi 5 | XP tier 1, Gold, story flag MQ_01_05 |
| MQ_01_06 | 6 | Prologue: Adım 6 | Escort | Dawnwatch Village içindeki hikâye hedefi 6 | XP tier 1, Gold, story flag MQ_01_06 |
| MQ_01_07 | 7 | Prologue: Adım 7 | Activate | Dawnwatch Village içindeki hikâye hedefi 7 | XP tier 1, Gold, story flag MQ_01_07 |
| MQ_01_08 | 8 | Prologue: Adım 8 | Boss | Dawnwatch Village içindeki hikâye hedefi 8 | XP tier 1, Gold, story flag MQ_01_08 |


\newpage

## 2.3 Chapter I - The Briar Wakes

**Bölge:** Verdant Trail

Ormanın koruyucusu Thornmaw yozlaşmıştır. Oyuncu doğa ruhlarını sakinleştirirken bozulmanın bir kült tarafından yönlendirildiğini keşfeder.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_02_01 | 5 | The Briar Wakes: Adım 1 | Talk | Verdant Trail içindeki hikâye hedefi 1 | XP tier 2, Gold, story flag MQ_02_01 |
| MQ_02_02 | 6 | The Briar Wakes: Adım 2 | Kill | Verdant Trail içindeki hikâye hedefi 2 | XP tier 2, Gold, story flag MQ_02_02 |
| MQ_02_03 | 7 | The Briar Wakes: Adım 3 | Collect | Verdant Trail içindeki hikâye hedefi 3 | XP tier 2, Gold, story flag MQ_02_03 |
| MQ_02_04 | 8 | The Briar Wakes: Adım 4 | Investigate | Verdant Trail içindeki hikâye hedefi 4 | XP tier 2, Gold, story flag MQ_02_04 |
| MQ_02_05 | 9 | The Briar Wakes: Adım 5 | Defend | Verdant Trail içindeki hikâye hedefi 5 | XP tier 2, Gold, story flag MQ_02_05 |
| MQ_02_06 | 10 | The Briar Wakes: Adım 6 | Escort | Verdant Trail içindeki hikâye hedefi 6 | XP tier 2, Gold, story flag MQ_02_06 |
| MQ_02_07 | 11 | The Briar Wakes: Adım 7 | Activate | Verdant Trail içindeki hikâye hedefi 7 | XP tier 2, Gold, story flag MQ_02_07 |
| MQ_02_08 | 12 | The Briar Wakes: Adım 8 | Boss | Verdant Trail içindeki hikâye hedefi 8 | XP tier 2, Gold, story flag MQ_02_08 |


\newpage

## 2.4 Chapter II - Lanterns in the Mire

**Bölge:** Moonfen Marsh

Ruh fenerleri, kayıp hacılar ve Nereza kültü üzerinden Abyss enerjisinin ruhları yakıt gibi tükettiği ortaya çıkar.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_03_01 | 20 | Lanterns in the Mire: Adım 1 | Talk | Moonfen Marsh içindeki hikâye hedefi 1 | XP tier 3, Gold, story flag MQ_03_01 |
| MQ_03_02 | 21 | Lanterns in the Mire: Adım 2 | Kill | Moonfen Marsh içindeki hikâye hedefi 2 | XP tier 3, Gold, story flag MQ_03_02 |
| MQ_03_03 | 22 | Lanterns in the Mire: Adım 3 | Collect | Moonfen Marsh içindeki hikâye hedefi 3 | XP tier 3, Gold, story flag MQ_03_03 |
| MQ_03_04 | 23 | Lanterns in the Mire: Adım 4 | Investigate | Moonfen Marsh içindeki hikâye hedefi 4 | XP tier 3, Gold, story flag MQ_03_04 |
| MQ_03_05 | 24 | Lanterns in the Mire: Adım 5 | Defend | Moonfen Marsh içindeki hikâye hedefi 5 | XP tier 3, Gold, story flag MQ_03_05 |
| MQ_03_06 | 25 | Lanterns in the Mire: Adım 6 | Escort | Moonfen Marsh içindeki hikâye hedefi 6 | XP tier 3, Gold, story flag MQ_03_06 |
| MQ_03_07 | 26 | Lanterns in the Mire: Adım 7 | Activate | Moonfen Marsh içindeki hikâye hedefi 7 | XP tier 3, Gold, story flag MQ_03_07 |
| MQ_03_08 | 27 | Lanterns in the Mire: Adım 8 | Boss | Moonfen Marsh içindeki hikâye hedefi 8 | XP tier 3, Gold, story flag MQ_03_08 |


\newpage

## 2.5 Chapter III - Ashes of the Legion

**Bölge:** Ashen Wastes

Eski lejyon kaleleri yeniden yanmaya başlar. Forge-Eater Golm ve kült demircileri kapı için silah üretmektedir.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_04_01 | 25 | Ashes of the Legion: Adım 1 | Talk | Ashen Wastes içindeki hikâye hedefi 1 | XP tier 4, Gold, story flag MQ_04_01 |
| MQ_04_02 | 26 | Ashes of the Legion: Adım 2 | Kill | Ashen Wastes içindeki hikâye hedefi 2 | XP tier 4, Gold, story flag MQ_04_02 |
| MQ_04_03 | 27 | Ashes of the Legion: Adım 3 | Collect | Ashen Wastes içindeki hikâye hedefi 3 | XP tier 4, Gold, story flag MQ_04_03 |
| MQ_04_04 | 28 | Ashes of the Legion: Adım 4 | Investigate | Ashen Wastes içindeki hikâye hedefi 4 | XP tier 4, Gold, story flag MQ_04_04 |
| MQ_04_05 | 29 | Ashes of the Legion: Adım 5 | Defend | Ashen Wastes içindeki hikâye hedefi 5 | XP tier 4, Gold, story flag MQ_04_05 |
| MQ_04_06 | 30 | Ashes of the Legion: Adım 6 | Escort | Ashen Wastes içindeki hikâye hedefi 6 | XP tier 4, Gold, story flag MQ_04_06 |
| MQ_04_07 | 31 | Ashes of the Legion: Adım 7 | Activate | Ashen Wastes içindeki hikâye hedefi 7 | XP tier 4, Gold, story flag MQ_04_07 |
| MQ_04_08 | 32 | Ashes of the Legion: Adım 8 | Boss | Ashen Wastes içindeki hikâye hedefi 8 | XP tier 4, Gold, story flag MQ_04_08 |


\newpage

## 2.6 Chapter IV - Beneath Root and Stone

**Bölge:** Ironroot Depths

Mühürleri birbirine bağlayan yaşayan kök ağı fiziksel olarak kesilmektedir. Hive Queen bu bozulmadan güçlenmiştir.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_05_01 | 32 | Beneath Root and Stone: Adım 1 | Talk | Ironroot Depths içindeki hikâye hedefi 1 | XP tier 5, Gold, story flag MQ_05_01 |
| MQ_05_02 | 33 | Beneath Root and Stone: Adım 2 | Kill | Ironroot Depths içindeki hikâye hedefi 2 | XP tier 5, Gold, story flag MQ_05_02 |
| MQ_05_03 | 34 | Beneath Root and Stone: Adım 3 | Collect | Ironroot Depths içindeki hikâye hedefi 3 | XP tier 5, Gold, story flag MQ_05_03 |
| MQ_05_04 | 35 | Beneath Root and Stone: Adım 4 | Investigate | Ironroot Depths içindeki hikâye hedefi 4 | XP tier 5, Gold, story flag MQ_05_04 |
| MQ_05_05 | 36 | Beneath Root and Stone: Adım 5 | Defend | Ironroot Depths içindeki hikâye hedefi 5 | XP tier 5, Gold, story flag MQ_05_05 |
| MQ_05_06 | 37 | Beneath Root and Stone: Adım 6 | Escort | Ironroot Depths içindeki hikâye hedefi 6 | XP tier 5, Gold, story flag MQ_05_06 |
| MQ_05_07 | 38 | Beneath Root and Stone: Adım 7 | Activate | Ironroot Depths içindeki hikâye hedefi 7 | XP tier 5, Gold, story flag MQ_05_07 |
| MQ_05_08 | 39 | Beneath Root and Stone: Adım 8 | Boss | Ironroot Depths içindeki hikâye hedefi 8 | XP tier 5, Gold, story flag MQ_05_08 |


\newpage

## 2.7 Chapter V - Kingdom of Sand

**Bölge:** Sunscar Desert

Kumlar altındaki Solar Keystone bulunur. Bu taş, Abyss Gate’i kapatabilecek nadir anahtarların ilkidir.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_06_01 | 38 | Kingdom of Sand: Adım 1 | Talk | Sunscar Desert içindeki hikâye hedefi 1 | XP tier 6, Gold, story flag MQ_06_01 |
| MQ_06_02 | 39 | Kingdom of Sand: Adım 2 | Kill | Sunscar Desert içindeki hikâye hedefi 2 | XP tier 6, Gold, story flag MQ_06_02 |
| MQ_06_03 | 40 | Kingdom of Sand: Adım 3 | Collect | Sunscar Desert içindeki hikâye hedefi 3 | XP tier 6, Gold, story flag MQ_06_03 |
| MQ_06_04 | 41 | Kingdom of Sand: Adım 4 | Investigate | Sunscar Desert içindeki hikâye hedefi 4 | XP tier 6, Gold, story flag MQ_06_04 |
| MQ_06_05 | 42 | Kingdom of Sand: Adım 5 | Defend | Sunscar Desert içindeki hikâye hedefi 5 | XP tier 6, Gold, story flag MQ_06_05 |
| MQ_06_06 | 43 | Kingdom of Sand: Adım 6 | Escort | Sunscar Desert içindeki hikâye hedefi 6 | XP tier 6, Gold, story flag MQ_06_06 |
| MQ_06_07 | 44 | Kingdom of Sand: Adım 7 | Activate | Sunscar Desert içindeki hikâye hedefi 7 | XP tier 6, Gold, story flag MQ_06_07 |
| MQ_06_08 | 45 | Kingdom of Sand: Adım 8 | Boss | Sunscar Desert içindeki hikâye hedefi 8 | XP tier 6, Gold, story flag MQ_06_08 |


\newpage

## 2.8 Chapter VI - Songs of the Celestine

**Bölge:** Celestine Ruins

Göksel arşivlerde Second Dawn kehaneti çözülür. Tutulmanın tarihi ve Malzor’un gerçek planı açığa çıkar.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_07_01 | 45 | Songs of the Celestine: Adım 1 | Talk | Celestine Ruins içindeki hikâye hedefi 1 | XP tier 7, Gold, story flag MQ_07_01 |
| MQ_07_02 | 46 | Songs of the Celestine: Adım 2 | Kill | Celestine Ruins içindeki hikâye hedefi 2 | XP tier 7, Gold, story flag MQ_07_02 |
| MQ_07_03 | 47 | Songs of the Celestine: Adım 3 | Collect | Celestine Ruins içindeki hikâye hedefi 3 | XP tier 7, Gold, story flag MQ_07_03 |
| MQ_07_04 | 48 | Songs of the Celestine: Adım 4 | Investigate | Celestine Ruins içindeki hikâye hedefi 4 | XP tier 7, Gold, story flag MQ_07_04 |
| MQ_07_05 | 49 | Songs of the Celestine: Adım 5 | Defend | Celestine Ruins içindeki hikâye hedefi 5 | XP tier 7, Gold, story flag MQ_07_05 |
| MQ_07_06 | 50 | Songs of the Celestine: Adım 6 | Escort | Celestine Ruins içindeki hikâye hedefi 6 | XP tier 7, Gold, story flag MQ_07_06 |
| MQ_07_07 | 51 | Songs of the Celestine: Adım 7 | Activate | Celestine Ruins içindeki hikâye hedefi 7 | XP tier 7, Gold, story flag MQ_07_07 |
| MQ_07_08 | 52 | Songs of the Celestine: Adım 8 | Boss | Celestine Ruins içindeki hikâye hedefi 8 | XP tier 7, Gold, story flag MQ_07_08 |


\newpage

## 2.9 Chapter VII - Crown of Winter

**Bölge:** Frostpeak Highlands

Son koruyucu mühür saldırıya uğrar. Oyuncu tüm fraksiyonları ittifak altında birleştirir ve raid attunement tamamlar.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_08_01 | 52 | Crown of Winter: Adım 1 | Talk | Frostpeak Highlands içindeki hikâye hedefi 1 | XP tier 8, Gold, story flag MQ_08_01 |
| MQ_08_02 | 53 | Crown of Winter: Adım 2 | Kill | Frostpeak Highlands içindeki hikâye hedefi 2 | XP tier 8, Gold, story flag MQ_08_02 |
| MQ_08_03 | 54 | Crown of Winter: Adım 3 | Collect | Frostpeak Highlands içindeki hikâye hedefi 3 | XP tier 8, Gold, story flag MQ_08_03 |
| MQ_08_04 | 55 | Crown of Winter: Adım 4 | Investigate | Frostpeak Highlands içindeki hikâye hedefi 4 | XP tier 8, Gold, story flag MQ_08_04 |
| MQ_08_05 | 56 | Crown of Winter: Adım 5 | Defend | Frostpeak Highlands içindeki hikâye hedefi 5 | XP tier 8, Gold, story flag MQ_08_05 |
| MQ_08_06 | 57 | Crown of Winter: Adım 6 | Escort | Frostpeak Highlands içindeki hikâye hedefi 6 | XP tier 8, Gold, story flag MQ_08_06 |
| MQ_08_07 | 58 | Crown of Winter: Adım 7 | Activate | Frostpeak Highlands içindeki hikâye hedefi 7 | XP tier 8, Gold, story flag MQ_08_07 |
| MQ_08_08 | 59 | Crown of Winter: Adım 8 | Boss | Frostpeak Highlands içindeki hikâye hedefi 8 | XP tier 8, Gold, story flag MQ_08_08 |


\newpage

## 2.10 Chapter VIII - Eclipse of Astraya

**Bölge:** Abyss Gate

Kapı açılır. Açık dünya savunma etkinlikleri, rift kapatma ve Eclipse Cathedral raid zinciri başlar. Malzor yenilir ancak göksel savaşın bitmediği anlaşılır.


| Quest ID | Level | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| MQ_09_01 | 65 | Eclipse of Astraya: Adım 1 | Talk | Abyss Gate içindeki hikâye hedefi 1 | XP tier 9, Gold, story flag MQ_09_01 |
| MQ_09_02 | 66 | Eclipse of Astraya: Adım 2 | Kill | Abyss Gate içindeki hikâye hedefi 2 | XP tier 9, Gold, story flag MQ_09_02 |
| MQ_09_03 | 67 | Eclipse of Astraya: Adım 3 | Collect | Abyss Gate içindeki hikâye hedefi 3 | XP tier 9, Gold, story flag MQ_09_03 |
| MQ_09_04 | 68 | Eclipse of Astraya: Adım 4 | Investigate | Abyss Gate içindeki hikâye hedefi 4 | XP tier 9, Gold, story flag MQ_09_04 |
| MQ_09_05 | 69 | Eclipse of Astraya: Adım 5 | Defend | Abyss Gate içindeki hikâye hedefi 5 | XP tier 9, Gold, story flag MQ_09_05 |
| MQ_09_06 | 70 | Eclipse of Astraya: Adım 6 | Escort | Abyss Gate içindeki hikâye hedefi 6 | XP tier 9, Gold, story flag MQ_09_06 |
| MQ_09_07 | 71 | Eclipse of Astraya: Adım 7 | Activate | Abyss Gate içindeki hikâye hedefi 7 | XP tier 9, Gold, story flag MQ_09_07 |
| MQ_09_08 | 72 | Eclipse of Astraya: Adım 8 | Boss | Abyss Gate içindeki hikâye hedefi 8 | XP tier 9, Gold, story flag MQ_09_08 |


\newpage

# 3. Dünya Haritası ve Level Design


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Concept_Art/world_map_concept.png){ width=96% }


| Region | Level | Theme | Content | Boss |
| --- | --- | --- | --- | --- |
| Dawnwatch Village | 1-10 | Safe Hub / pastoral coast | Main village, class halls, auction, crafting, inn | Garrick the Red |
| Verdant Trail | 5-20 | Forest / meadow | open field, gathering, wolf dens, ancient roots | Thornmaw |
| Moonfen Marsh | 20-30 | Swamp / undead | curse zones, lantern paths, crypt entrances | Grave-Mother Nereza |
| Ashen Wastes | 25-38 | Volcanic badlands | elite camps, mining, forge ruins | Forge-Eater Golm |
| Ironroot Depths | 32-45 | Underground root cavern | crystal mines, spider hive, fungal forest | Hive Queen Velkra |
| Sunscar Desert | 38-50 | Desert / ruins | caravans, mirages, buried temples | Dune Tyrant Khar |
| Celestine Ruins | 45-58 | Sky ruins / arcane | runes, broken bridges, arcane sentinels | Arbiter of Halos |
| Frostpeak Highlands | 52-70 | Snow / mountain | mount routes, temple climb, blizzard events | Icefang Matriarch |
| Abyss Gate | 65-100 | Void corruption / endgame | rift events, raid entrances, mythic farm | Eclipse Seraph Malzor |


## 3.1 Map Layer Standardı

1. Ground Base
2. Ground Detail / Decal
3. Collision
4. Back Props
5. Interactive Props
6. Front Props / Roof
7. Spawn / Patrol Nodes
8. VFX
9. Lighting/Fog
10. Trigger/Event

Tile size 48x48 px. Playable character frame canvas 96x96. Bosslar 192x192 veya daha büyük olabilir. Collision ve navigation sunucu tarafında doğrulanır.


## 3.2 Dawnwatch Village


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Dawnwatch_Village_blockout.png){ width=90% }


**Level:** 1-10  
**Theme:** Safe Hub / pastoral coast  
**Boss:** Garrick the Red


| Technical Property | Value |
| --- | --- |
| map_id | MAP_DAW |
| name | Dawnwatch Village |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 1 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.3 Verdant Trail


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Verdant_Trail_blockout.png){ width=90% }


**Level:** 5-20  
**Theme:** Forest / meadow  
**Boss:** Thornmaw


| Technical Property | Value |
| --- | --- |
| map_id | MAP_VER |
| name | Verdant Trail |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.4 Moonfen Marsh


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Moonfen_Marsh_blockout.png){ width=90% }


**Level:** 20-30  
**Theme:** Swamp / undead  
**Boss:** Grave-Mother Nereza


| Technical Property | Value |
| --- | --- |
| map_id | MAP_MOO |
| name | Moonfen Marsh |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.5 Ashen Wastes


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Ashen_Wastes_blockout.png){ width=90% }


**Level:** 25-38  
**Theme:** Volcanic badlands  
**Boss:** Forge-Eater Golm


| Technical Property | Value |
| --- | --- |
| map_id | MAP_ASH |
| name | Ashen Wastes |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.6 Ironroot Depths


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Ironroot_Depths_blockout.png){ width=90% }


**Level:** 32-45  
**Theme:** Underground root cavern  
**Boss:** Hive Queen Velkra


| Technical Property | Value |
| --- | --- |
| map_id | MAP_IRO |
| name | Ironroot Depths |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.7 Sunscar Desert


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Sunscar_Desert_blockout.png){ width=90% }


**Level:** 38-50  
**Theme:** Desert / ruins  
**Boss:** Dune Tyrant Khar


| Technical Property | Value |
| --- | --- |
| map_id | MAP_SUN |
| name | Sunscar Desert |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.8 Celestine Ruins


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Celestine_Ruins_blockout.png){ width=90% }


**Level:** 45-58  
**Theme:** Sky ruins / arcane  
**Boss:** Arbiter of Halos


| Technical Property | Value |
| --- | --- |
| map_id | MAP_CEL |
| name | Celestine Ruins |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.9 Frostpeak Highlands


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Frostpeak_Highlands_blockout.png){ width=90% }


**Level:** 52-70  
**Theme:** Snow / mountain  
**Boss:** Icefang Matriarch


| Technical Property | Value |
| --- | --- |
| map_id | MAP_FRO |
| name | Frostpeak Highlands |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

## 3.10 Abyss Gate


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Abyss_Gate_blockout.png){ width=90% }


**Level:** 65-100  
**Theme:** Void corruption / endgame  
**Boss:** Eclipse Seraph Malzor


| Technical Property | Value |
| --- | --- |
| map_id | MAP_ABY |
| name | Abyss Gate |
| size_tiles | [256, 192] |
| tile_size_px | 48 |
| layers | ["ground", "detail", "collision", "back_props", "interactables", "front_props", "spawn_nodes", "vfx", "lighting", "triggers"] |
| safe_hubs | 0 |
| farm_slots | 4 |
| elite_zones | 2 |
| gather_nodes | 18 |
| quest_npcs | 6 |
| dungeon_entries | 1 |
| world_boss_arena | 1 |


**Zoning rule:** merkezde quest corridor; kuzey/doğu tarafında elite cep; bir kontrollü dungeon girişi; en az dört farm slotu; world boss arenası ana quest yolunu tıkamayacak şekilde yan kolda konumlanır. Gathering yolları ana quest rotasını keser ama zorunlu olmaz.

\newpage

# 4. Ana Köy - Dawnwatch Village


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Maps/Dawnwatch_Main_Village_services.png){ width=92% }


Dawnwatch tüm oyuncuların ilk kalıcı hubıdır. Town Square merkez referanstır. Kuzeyde class halls, batıda Blacksmith/Crafting, güneybatıda Auction, güneyde Inn/Storage, doğuda Guild Hall ve Event Plaza bulunur. Oyuncu ilk 10 level boyunca her sistemle burada tanışır.


| Service | Function |
| --- | --- |
| Town Square | Quest turn-in, event announcements |
| Class Halls | Skill trainer, class tutorial |
| Blacksmith | Repair, enhance, craft |
| Auction House | Player market |
| Inn / Storage | Rest bonus, stash |
| Guild Hall | Guild creation, guild board |
| Chapel | Heal, resurrection, Priest services |
| Stable | Mount/pet service |
| Stylist | Appearance and cosmetics |
| Portal Plaza | Fast travel unlock |


\newpage

# 5. Level 1-100 Progression


Erken oyun 1-20 öğreticidir; 20-60 sistemleri açar; 60-85 mastery ve endgame hazırlığıdır; 85-100 raid ve mythic progression dönemidir.


## 5.1 Level 1-20


| Lvl | XP Next | Total XP | Stat | Skill | Mastery | Gear Tier | Unlock |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 120 | 120 | 5 | 1 | 0 | Starter |  |
| 2 | 320 | 440 | 5 | 1 | 0 | Starter |  |
| 3 | 570 | 1010 | 5 | 1 | 0 | Starter |  |
| 4 | 850 | 1860 | 5 | 1 | 0 | Starter |  |
| 5 | 1160 | 3020 | 5 | 1 | 0 | Starter | First passive |
| 6 | 1490 | 4510 | 5 | 1 | 0 | Starter |  |
| 7 | 1860 | 6370 | 5 | 1 | 0 | Starter |  |
| 8 | 2240 | 8610 | 5 | 1 | 0 | Starter |  |
| 9 | 2640 | 11250 | 5 | 1 | 0 | Starter |  |
| 10 | 3070 | 14320 | 5 | 1 | 0 | Starter | Class stance |
| 11 | 3510 | 17830 | 5 | 1 | 0 | Uncommon |  |
| 12 | 3970 | 21800 | 5 | 1 | 0 | Uncommon |  |
| 13 | 4450 | 26250 | 5 | 1 | 0 | Uncommon |  |
| 14 | 4940 | 31190 | 5 | 1 | 0 | Uncommon |  |
| 15 | 5450 | 36640 | 5 | 1 | 0 | Uncommon | First group dungeon |
| 16 | 5970 | 42610 | 5 | 1 | 0 | Uncommon |  |
| 17 | 6510 | 49120 | 5 | 1 | 0 | Uncommon |  |
| 18 | 7060 | 56180 | 5 | 1 | 0 | Uncommon |  |
| 19 | 7620 | 63800 | 5 | 1 | 0 | Uncommon |  |
| 20 | 8200 | 72000 | 5 | 1 | 0 | Uncommon | Mount quest |


\newpage

## 5.2 Level 21-40


| Lvl | XP Next | Total XP | Stat | Skill | Mastery | Gear Tier | Unlock |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | 8790 | 80790 | 5 | 1 | 0 | Rare |  |
| 22 | 9390 | 90180 | 5 | 1 | 0 | Rare |  |
| 23 | 10000 | 100180 | 5 | 1 | 0 | Rare |  |
| 24 | 10630 | 110810 | 5 | 1 | 0 | Rare |  |
| 25 | 11270 | 122080 | 5 | 1 | 0 | Rare | Talent row 2 |
| 26 | 11910 | 133990 | 5 | 1 | 0 | Rare |  |
| 27 | 12570 | 146560 | 5 | 1 | 0 | Rare |  |
| 28 | 13240 | 159800 | 5 | 1 | 0 | Rare |  |
| 29 | 13920 | 173720 | 5 | 1 | 0 | Rare |  |
| 30 | 14610 | 188330 | 5 | 1 | 0 | Rare | PvP arena |
| 31 | 15310 | 203640 | 5 | 1 | 0 | Rare |  |
| 32 | 16020 | 219660 | 5 | 1 | 0 | Rare |  |
| 33 | 16740 | 236400 | 5 | 1 | 0 | Rare |  |
| 34 | 17470 | 253870 | 5 | 1 | 0 | Rare |  |
| 35 | 18210 | 272080 | 5 | 1 | 0 | Rare | Craft specialization |
| 36 | 18960 | 291040 | 5 | 1 | 0 | Rare |  |
| 37 | 19710 | 310750 | 5 | 1 | 0 | Rare |  |
| 38 | 20480 | 331230 | 5 | 1 | 0 | Rare |  |
| 39 | 21250 | 352480 | 5 | 1 | 0 | Rare |  |
| 40 | 22040 | 374520 | 5 | 1 | 0 | Rare | Talent row 3 |


\newpage

## 5.3 Level 41-60


| Lvl | XP Next | Total XP | Stat | Skill | Mastery | Gear Tier | Unlock |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 41 | 22830 | 397350 | 5 | 1 | 0 | Epic |  |
| 42 | 23630 | 420980 | 5 | 1 | 0 | Epic |  |
| 43 | 24440 | 445420 | 5 | 1 | 0 | Epic |  |
| 44 | 25250 | 470670 | 5 | 1 | 0 | Epic |  |
| 45 | 26080 | 496750 | 5 | 1 | 0 | Epic | World boss contracts |
| 46 | 26910 | 523660 | 5 | 1 | 0 | Epic |  |
| 47 | 27750 | 551410 | 5 | 1 | 0 | Epic |  |
| 48 | 28600 | 580010 | 5 | 1 | 0 | Epic |  |
| 49 | 29460 | 609470 | 5 | 1 | 0 | Epic |  |
| 50 | 30320 | 639790 | 5 | 1 | 0 | Epic | Epic set bonuses |
| 51 | 31200 | 670990 | 5 | 1 | 0 | Epic |  |
| 52 | 32080 | 703070 | 5 | 1 | 0 | Epic |  |
| 53 | 32960 | 736030 | 5 | 1 | 0 | Epic |  |
| 54 | 33860 | 769890 | 5 | 1 | 0 | Epic |  |
| 55 | 34760 | 804650 | 5 | 1 | 0 | Epic | Raid attunement begins |
| 56 | 35670 | 840320 | 5 | 1 | 0 | Epic |  |
| 57 | 36580 | 876900 | 5 | 1 | 0 | Epic |  |
| 58 | 37510 | 914410 | 5 | 1 | 0 | Epic |  |
| 59 | 38440 | 952850 | 5 | 1 | 0 | Epic |  |
| 60 | 39370 | 992220 | 5 | 1 | 0 | Epic | Mastery system |


\newpage

## 5.4 Level 61-80


| Lvl | XP Next | Total XP | Stat | Skill | Mastery | Gear Tier | Unlock |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 61 | 40320 | 1032540 | 4 | 0 | 1 | Legendary |  |
| 62 | 41270 | 1073810 | 4 | 0 | 1 | Legendary |  |
| 63 | 42220 | 1116030 | 4 | 0 | 1 | Legendary |  |
| 64 | 43190 | 1159220 | 4 | 0 | 1 | Legendary |  |
| 65 | 44160 | 1203380 | 4 | 0 | 1 | Legendary | Abyss Gate access |
| 66 | 45130 | 1248510 | 4 | 0 | 1 | Legendary |  |
| 67 | 46120 | 1294630 | 4 | 0 | 1 | Legendary |  |
| 68 | 47110 | 1341740 | 4 | 0 | 1 | Legendary |  |
| 69 | 48110 | 1389850 | 4 | 0 | 1 | Legendary |  |
| 70 | 49110 | 1438960 | 4 | 0 | 1 | Legendary | Mythic dungeon |
| 71 | 50120 | 1489080 | 4 | 0 | 1 | Legendary |  |
| 72 | 51130 | 1540210 | 4 | 0 | 1 | Legendary |  |
| 73 | 52150 | 1592360 | 4 | 0 | 1 | Legendary |  |
| 74 | 53180 | 1645540 | 4 | 0 | 1 | Legendary |  |
| 75 | 54220 | 1699760 | 4 | 0 | 1 | Legendary | Talent row 5 |
| 76 | 55260 | 1755020 | 4 | 0 | 1 | Legendary |  |
| 77 | 56300 | 1811320 | 4 | 0 | 1 | Legendary |  |
| 78 | 57350 | 1868670 | 4 | 0 | 1 | Legendary |  |
| 79 | 58410 | 1927080 | 4 | 0 | 1 | Legendary |  |
| 80 | 59480 | 1986560 | 4 | 0 | 1 | Legendary | Eclipse Cathedral access |


\newpage

## 5.5 Level 81-100


| Lvl | XP Next | Total XP | Stat | Skill | Mastery | Gear Tier | Unlock |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 81 | 60540 | 2047100 | 4 | 0 | 1 | Legendary |  |
| 82 | 61620 | 2108720 | 4 | 0 | 1 | Legendary |  |
| 83 | 62700 | 2171420 | 4 | 0 | 1 | Legendary |  |
| 84 | 63790 | 2235210 | 4 | 0 | 1 | Legendary |  |
| 85 | 64880 | 2300090 | 4 | 0 | 1 | Legendary | Legendary awakening |
| 86 | 65980 | 2366070 | 4 | 0 | 1 | Mythic |  |
| 87 | 67080 | 2433150 | 4 | 0 | 1 | Mythic |  |
| 88 | 68190 | 2501340 | 4 | 0 | 1 | Mythic |  |
| 89 | 69310 | 2570650 | 4 | 0 | 1 | Mythic |  |
| 90 | 70430 | 2641080 | 4 | 0 | 1 | Mythic | Seasonal endgame |
| 91 | 71560 | 2712640 | 4 | 0 | 1 | Mythic |  |
| 92 | 72690 | 2785330 | 4 | 0 | 1 | Mythic |  |
| 93 | 73820 | 2859150 | 4 | 0 | 1 | Mythic |  |
| 94 | 74970 | 2934120 | 4 | 0 | 1 | Mythic |  |
| 95 | 76110 | 3010230 | 4 | 0 | 1 | Mythic | Mythic weapon quest |
| 96 | 77270 | 3087500 | 4 | 0 | 1 | Mythic |  |
| 97 | 78430 | 3165930 | 4 | 0 | 1 | Mythic |  |
| 98 | 79590 | 3245520 | 4 | 0 | 1 | Mythic |  |
| 99 | 80760 | 3326280 | 4 | 0 | 1 | Mythic |  |
| 100 | 0 | 3326280 | 4 | 0 | 1 | Mythic | Paragon cap + endgame mastery |


\newpage

# 6. Stat Sistemi ve Combat Formülleri




## Primary Stats
- STR: physical attack and heavy weapon scaling.
- AGI: mobility, dodge, attack speed.
- DEX: accuracy, critical chance, ranged scaling.
- VIT: HP, physical mitigation.
- INT: magic attack, spell scaling.
- SPI: mana/Faith, healing, magic defense.

## Core Formula Set
- HP = BaseHP(class) + VIT*32 + Level*18 + GearHP
- Mana/Faith = BaseResource + INT*12 + SPI*18 + GearResource
- PhysicalATK = WeaponATK + STR*3.0 + DEX*1.2
- MagicATK = WeaponMATK + INT*3.4 + SPI*1.4
- PhysicalDEF = Armor + VIT*2.2 + STR*0.6
- MagicDEF = MDEF + SPI*2.5 + INT*0.7
- CritChance% = BaseCrit + DEX*0.08 + AGI*0.03
- Dodge% = BaseDodge + AGI*0.07
- FinalPhysicalDamage = RawDamage * 100/(100+TargetDEF) * PvPModifier * EncounterModifier
- FinalMagicDamage = RawMagic * 100/(100+TargetMDEF) * PvPModifier * EncounterModifier

Hard caps: Crit 65%, Dodge 35% PvE / 20% PvP, cooldown reduction 30%, move speed bonus 35% in combat.




## 6.1 Status Effects

| Status | Effect | PvP Rule |
| --- | --- | --- |
| Stun | No action | Diminishing returns after repeated stun |
| Root | No movement | Max 2.5 sec in PvP |
| Slow | Move speed reduction | Stack cap 45% |
| Silence | Magic/support skill lock | Max 2 sec PvP |
| Bleed | Physical DoT | Can stack 3 |
| Poison | Nature DoT | Can stack 5 |
| Burn | Fire DoT | Refreshable |
| Chill | Slow + frost vulnerability | Builds Freeze meter |
| Blind | Accuracy reduction | Boss immune |
| Taunt | AI target forcing | Players: damage penalty vs others instead |


\newpage

# 7. Class Sistemi, Skilller ve Pasifler


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Concept_Art/classes_turnaround_concept.png){ width=96% }


## 7.1 Knight - Tank


**Resource:** Valor  
**Weapons:** Longsword + Tower Shield / Mace + Shield  
**Armor:** Heavy Plate  
**Primary:** VIT / **Secondary:** STR  
**Identity:** Threat, block, guard links, party mitigation


### Aktif Skill Özeti

| ID | Skill | Lvl | Type | Description | Coef | CD | Cost | Hitbox | CC | Threat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SKL_KNI_001 | Shield Rush | 1 | Active | Gap closer + stun | 1.2 | 8.0 | 20 | 2.2x1.0 rectangle | 1.2s stun | 220 threat |
| SKL_KNI_002 | Bulwark Stance | 3 | Stance | Tank stance | 0.0 | 20.0 | 0 | Self | -20% damage taken | +35% threat |
| SKL_KNI_003 | Taunting Cry | 5 | Active | AoE taunt | 0.0 | 18.0 | 25 | 5m circle | 3s taunt | Set top threat +10% |
| SKL_KNI_004 | Radiant Slash | 8 | Active | Frontal cleave | 1.45 | 6.0 | 22 | 120° cone 3m | Holy mark 6s | 150 threat |
| SKL_KNI_005 | Guardian Oath | 12 | Active | Protect ally | 0.0 | 22.0 | 30 | Target ally | 30% damage redirect | 100 threat |
| SKL_KNI_006 | Aegis Wall | 16 | Active | Party barrier | 0.0 | 24.0 | 35 | 4x2.5m wall | Shield 12% max HP | 80 threat |
| SKL_KNI_007 | Counter Bastion | 20 | Active | Block counter | 1.8 | 14.0 | 18 | 2m frontal | Knockback 0.8m | 170 threat |
| SKL_KNI_008 | Lionheart Banner | 26 | Active | Defense aura | 0.0 | 45.0 | 40 | 6m circle | DEF +12%, Tenacity +15% | 50 threat |
| SKL_KNI_009 | Hammer of Judgment | 32 | Active | AoE slam | 2.0 | 20.0 | 45 | 4m circle | Slow 35% 4s | 190 threat |
| SKL_KNI_010 | Sanctified Rampart | 40 | Active | Mass barrier | 0.0 | 55.0 | 60 | 7m circle | Barrier + cleanse resist | 120 threat |
| SKL_KNI_011 | Kings Challenge | 52 | Active | Boss taunt tool | 0.0 | 35.0 | 50 | Single target | Threat lock 5s | Top threat +25% |
| SKL_KNI_012 | Last Bastion | 70 | Ultimate | Cheat death | 0.0 | 180.0 | 0 | Self | Cannot die 5s | 0 threat |


### Skill Rank 1-5 Verileri


#### Shield Rush

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.2 | 8.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.33 | 7.8 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.46 | 7.6 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.6 | 7.4 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.73 | 7.2 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Bulwark Stance

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 20.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 19.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 19.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 18.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 18.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Taunting Cry

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 18.0 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 17.6 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 17.1 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 16.7 | 27 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 16.2 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Radiant Slash

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.45 | 6.0 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.61 | 5.8 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.77 | 5.7 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.93 | 5.6 | 24 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.09 | 5.4 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Guardian Oath

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 22.0 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 21.4 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 20.9 | 32 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 20.4 | 33 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 19.8 | 34 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Aegis Wall

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 24.0 | 35 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 23.4 | 36 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 22.8 | 37 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 22.2 | 38 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 21.6 | 39 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Counter Bastion

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.8 | 14.0 | 18 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.0 | 13.7 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.2 | 13.3 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.39 | 13.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.59 | 12.6 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Lionheart Banner

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 45.0 | 40 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 43.9 | 41 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 42.8 | 42 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 41.6 | 44 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 40.5 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Hammer of Judgment

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.0 | 20.0 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.22 | 19.5 | 46 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.44 | 19.0 | 48 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.66 | 18.5 | 49 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.88 | 18.0 | 50 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Sanctified Rampart

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 55.0 | 60 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 53.6 | 62 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 52.2 | 64 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 50.9 | 65 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 49.5 | 67 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Kings Challenge

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 35.0 | 50 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 34.1 | 52 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 33.2 | 53 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 32.4 | 55 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 31.5 | 56 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Last Bastion

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 180.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 175.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 171.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 166.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 162.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |


### Pasifler

| ID | Passive | Unlock | Effect |
| --- | --- | --- | --- |
| PAS_KNI_001 | Iron Discipline | 4 | Block +4% and armor +6% |
| PAS_KNI_002 | Shield Mastery | 10 | Shield block value +12% |
| PAS_KNI_003 | Unbroken Resolve | 18 | Damage taken while CC -10% |
| PAS_KNI_004 | Royal Bearing | 28 | Nearby allies DEF +4% |
| PAS_KNI_005 | Fortress Soul | 44 | Max HP +12% |
| PAS_KNI_006 | Paragon of Duty | 60 | Guard skills cooldown -10% |
| PAS_KNI_007 | Immovable | 75 | Knockback resistance +50% |
| PAS_KNI_008 | Crown Defender | 90 | Barrier power +15% |


### Art / Sprite Standardı

Front, Back, Left, Right turnaround zorunlu. Idle 8f, Run 8f, Basic Attack 8f, signature skill 10-16f, Hit 6f, Death 12f. Helmet/chest/gloves/legs/boots/cape/weapon/off-hand ayrı overlay layer olur.

\newpage

## 7.2 Berserker - Tank / DPS


**Resource:** Rage  
**Weapons:** Greataxe / Greatsword  
**Armor:** Heavy Hybrid  
**Primary:** STR / **Secondary:** VIT  
**Identity:** Rage, cleave, lifesteal, stance swap


### Aktif Skill Özeti

| ID | Skill | Lvl | Type | Description | Coef | CD | Cost | Hitbox | CC | Threat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SKL_BER_001 | Savage Cleave | 1 | Active | Frontal AoE | 1.35 | 4.0 | 10 | 120° cone | Bleed 4s | 120 threat |
| SKL_BER_002 | War Roar | 4 | Active | AoE challenge | 0.0 | 18.0 | 0 | 5m circle | Fear immunity 3s | 180 threat |
| SKL_BER_003 | Blood Crash | 7 | Active | Heavy strike | 1.7 | 8.0 | 20 | 2.5m target | Bleed 8s | 130 threat |
| SKL_BER_004 | Ravager Stance | 10 | Stance | DPS stance | 0.0 | 20.0 | 0 | Self | Damage +15%, DEF -10% | -20% threat |
| SKL_BER_005 | Defender Stance | 10 | Stance | Tank stance | 0.0 | 20.0 | 0 | Self | Damage taken -12% | +45% threat |
| SKL_BER_006 | Whirlwind Carve | 14 | Active | Spin AoE | 2.2 | 14.0 | 30 | 4m circle | Pull micro 0.4m | 140 threat |
| SKL_BER_007 | Skullsplitter | 18 | Active | Armor break | 1.8 | 12.0 | 25 | 2.5m | Armor -15% 8s | 150 threat |
| SKL_BER_008 | Blood Pact | 24 | Active | Self buff | 0.0 | 40.0 | 0 | Self | Lifesteal +12% | 0 threat |
| SKL_BER_009 | Titanbreaker Leap | 30 | Active | Leap AoE | 2.05 | 18.0 | 35 | 4m impact | Stun 1s | 180 threat |
| SKL_BER_010 | Chain of Carnage | 38 | Active | Multi-hit cleave | 2.4 | 24.0 | 45 | 5m chain | Bleed refresh | 150 threat |
| SKL_BER_011 | Unyielding Frenzy | 50 | Active | Burst mode | 0.0 | 60.0 | 50 | Self | AS +25%, Rage gain +35% | 0 threat |
| SKL_BER_012 | Execution Storm | 68 | Ultimate | Execute AoE | 3.2 | 28.0 | 60 | 5m circle | Bonus under 30% HP | 180 threat |


### Skill Rank 1-5 Verileri


#### Savage Cleave

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.35 | 4.0 | 10 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.5 | 3.9 | 10 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.65 | 3.8 | 11 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.8 | 3.7 | 11 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.94 | 3.6 | 11 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### War Roar

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 18.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 17.6 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 17.1 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 16.7 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 16.2 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Blood Crash

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.7 | 8.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.89 | 7.8 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.07 | 7.6 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.26 | 7.4 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.45 | 7.2 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Ravager Stance

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 20.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 19.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 19.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 18.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 18.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Defender Stance

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 20.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 19.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 19.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 18.5 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 18.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Whirlwind Carve

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.2 | 14.0 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.44 | 13.7 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.68 | 13.3 | 32 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.93 | 13.0 | 33 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 3.17 | 12.6 | 34 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Skullsplitter

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.8 | 12.0 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.0 | 11.7 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.2 | 11.4 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.39 | 11.1 | 27 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.59 | 10.8 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Blood Pact

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 40.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 39.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 38.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 37.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 36.0 | 0 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Titanbreaker Leap

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.05 | 18.0 | 35 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.28 | 17.6 | 36 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.5 | 17.1 | 37 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.73 | 16.7 | 38 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.95 | 16.2 | 39 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Chain of Carnage

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.4 | 24.0 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.66 | 23.4 | 46 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.93 | 22.8 | 48 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 3.19 | 22.2 | 49 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 3.46 | 21.6 | 50 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Unyielding Frenzy

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 60.0 | 50 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 58.5 | 52 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 57.0 | 53 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 55.5 | 55 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 54.0 | 56 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Execution Storm

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 3.2 | 28.0 | 60 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 3.55 | 27.3 | 62 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 3.9 | 26.6 | 64 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 4.26 | 25.9 | 65 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 4.61 | 25.2 | 67 | PvP coefficient 0.85 | Server-authoritative hit validation |


### Pasifler

| ID | Passive | Unlock | Effect |
| --- | --- | --- | --- |
| PAS_BER_001 | Rageheart | 5 | Damage taken generates +20% Rage |
| PAS_BER_002 | Battle Scarred | 12 | Missing HP grants up to +12% DEF |
| PAS_BER_003 | Cleaver Instinct | 20 | Bleed damage +15% |
| PAS_BER_004 | Butchers Rhythm | 34 | Crit reduces Rage skill CD by 0.5s |
| PAS_BER_005 | Titan Hide | 46 | Armor +8%, stun resist +10% |
| PAS_BER_006 | Lord of Slaughter | 62 | Rage spend skills heal 2% dealt |
| PAS_BER_007 | Red Mist | 76 | Below 35% HP damage +10% |
| PAS_BER_008 | Warborn | 90 | Stance swap has no GCD |


### Art / Sprite Standardı

Front, Back, Left, Right turnaround zorunlu. Idle 8f, Run 8f, Basic Attack 8f, signature skill 10-16f, Hit 6f, Death 12f. Helmet/chest/gloves/legs/boots/cape/weapon/off-hand ayrı overlay layer olur.

\newpage

## 7.3 Assassin - Mobility + DPS


**Resource:** Focus  
**Weapons:** Dual Daggers / Short Swords  
**Armor:** Light Leather  
**Primary:** AGI / **Secondary:** DEX  
**Identity:** Stealth, poison, backstab, combo burst


### Aktif Skill Özeti

| ID | Skill | Lvl | Type | Description | Coef | CD | Cost | Hitbox | CC | Threat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SKL_ASS_001 | Shadow Jab | 1 | Active | Double strike | 1.1 | 3.0 | 15 | 2m target | 2 hits | 90 threat |
| SKL_ASS_002 | Vanish | 4 | Active | Stealth reset | 0.0 | 22.0 | 30 | Self | Stealth 4s | Threat -100% |
| SKL_ASS_003 | Backstab | 6 | Active | Rear burst | 1.9 | 6.0 | 20 | 2m rear | Guaranteed crit from rear | 100 threat |
| SKL_ASS_004 | Poison Edge | 9 | Active | Weapon poison | 0.8 | 10.0 | 18 | 2m | Poison 8s | 90 threat |
| SKL_ASS_005 | Shadowstep | 12 | Active | Teleport behind | 1.0 | 12.0 | 22 | 8m target | Position behind | 80 threat |
| SKL_ASS_006 | Fan of Knives | 16 | Active | Cone AoE | 1.65 | 14.0 | 25 | 140° cone 4m | Bleed 5s | 100 threat |
| SKL_ASS_007 | Smoke Veil | 20 | Active | Defensive field | 0.0 | 24.0 | 35 | 5m circle | Dodge +20% | 0 threat |
| SKL_ASS_008 | Crimson Mark | 26 | Active | Vulnerability mark | 0.7 | 18.0 | 20 | Single target | Damage taken +8% | 90 threat |
| SKL_ASS_009 | Eviscerate | 32 | Active | Combo finisher | 2.6 | 16.0 | 35 | 2m | Consumes combo | 110 threat |
| SKL_ASS_010 | Night Parade | 40 | Active | Shadow clones | 2.8 | 36.0 | 45 | 5m chain | 6 shadow hits | 100 threat |
| SKL_ASS_011 | Death Lotus | 54 | Active | AoE spin | 3.1 | 45.0 | 60 | 5m circle | Dodge during cast | 120 threat |
| SKL_ASS_012 | Kingkiller Art | 72 | Ultimate | Single target burst | 4.0 | 90.0 | 80 | 3m | Execute scaling | 130 threat |


### Skill Rank 1-5 Verileri


#### Shadow Jab

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.1 | 3.0 | 15 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.22 | 2.9 | 15 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.34 | 2.8 | 16 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.46 | 2.8 | 16 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.58 | 2.7 | 17 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Vanish

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 22.0 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 21.4 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 20.9 | 32 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 20.4 | 33 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 19.8 | 34 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Backstab

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.9 | 6.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.11 | 5.8 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.32 | 5.7 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.53 | 5.6 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.74 | 5.4 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Poison Edge

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.8 | 10.0 | 18 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.89 | 9.8 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.98 | 9.5 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.06 | 9.2 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.15 | 9.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Shadowstep

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.0 | 12.0 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.11 | 11.7 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.22 | 11.4 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.33 | 11.1 | 24 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.44 | 10.8 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Fan of Knives

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.65 | 14.0 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.83 | 13.7 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.01 | 13.3 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.19 | 13.0 | 27 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.38 | 12.6 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Smoke Veil

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 24.0 | 35 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 23.4 | 36 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 22.8 | 37 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 22.2 | 38 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 21.6 | 39 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Crimson Mark

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.7 | 18.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.78 | 17.6 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.85 | 17.1 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.93 | 16.7 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.01 | 16.2 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Eviscerate

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.6 | 16.0 | 35 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.89 | 15.6 | 36 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 3.17 | 15.2 | 37 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 3.46 | 14.8 | 38 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 3.74 | 14.4 | 39 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Night Parade

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.8 | 36.0 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 3.11 | 35.1 | 46 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 3.42 | 34.2 | 48 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 3.72 | 33.3 | 49 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 4.03 | 32.4 | 50 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Death Lotus

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 3.1 | 45.0 | 60 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 3.44 | 43.9 | 62 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 3.78 | 42.8 | 64 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 4.12 | 41.6 | 65 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 4.46 | 40.5 | 67 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Kingkiller Art

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 4.0 | 90.0 | 80 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 4.44 | 87.8 | 82 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 4.88 | 85.5 | 85 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 5.32 | 83.2 | 87 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 5.76 | 81.0 | 90 | PvP coefficient 0.85 | Server-authoritative hit validation |


### Pasifler

| ID | Passive | Unlock | Effect |
| --- | --- | --- | --- |
| PAS_ASS_001 | Fleet Soles | 5 | Move speed +5%, dodge +3% |
| PAS_ASS_002 | Keen Blades | 11 | Crit damage +10% |
| PAS_ASS_003 | Venom Lore | 19 | Poison duration +25% |
| PAS_ASS_004 | Umbra Training | 28 | Stealth exit damage +12% for 3s |
| PAS_ASS_005 | Murderous Intent | 42 | Boss single target damage +6% |
| PAS_ASS_006 | Phantom Body | 58 | Once/120s lethal hit leaves 1 HP and Vanish |
| PAS_ASS_007 | Silent Step | 74 | Shadowstep grants dodge 1.5s |
| PAS_ASS_008 | Perfect Kill | 90 | Marked target crit rate +8% |


### Art / Sprite Standardı

Front, Back, Left, Right turnaround zorunlu. Idle 8f, Run 8f, Basic Attack 8f, signature skill 10-16f, Hit 6f, Death 12f. Helmet/chest/gloves/legs/boots/cape/weapon/off-hand ayrı overlay layer olur.

\newpage

## 7.4 Ranger - Mobile Ranged DPS / AoE


**Resource:** Focus  
**Weapons:** Longbow / Recurve Bow / Light Crossbow  
**Armor:** Medium Leather  
**Primary:** DEX / **Secondary:** AGI  
**Identity:** Kiting, mark, traps, volley, line damage


### Aktif Skill Özeti

| ID | Skill | Lvl | Type | Description | Coef | CD | Cost | Hitbox | CC | Threat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SKL_RAN_001 | Quick Shot | 1 | Active | Fast shot | 1.05 | 2.0 | 12 | 12m projectile | None | 70 threat |
| SKL_RAN_002 | Rolling Escape | 4 | Active | Mobility dodge | 0.0 | 10.0 | 18 | 4m roll | I-frame 0.25s | 0 threat |
| SKL_RAN_003 | Marked Prey | 6 | Active | Target mark | 0.6 | 14.0 | 15 | 14m target | Crit taken +6% | 60 threat |
| SKL_RAN_004 | Piercing Arrow | 9 | Active | Line shot | 1.75 | 8.0 | 20 | 14x1m line | Pierces 5 targets | 80 threat |
| SKL_RAN_005 | Volley | 13 | Active | Ground AoE | 1.85 | 12.0 | 25 | 5m circle at 12m | 6 ticks | 90 threat |
| SKL_RAN_006 | Snare Trap | 17 | Active | Root trap | 0.4 | 18.0 | 18 | 3m trap | Root 2.5s | 50 threat |
| SKL_RAN_007 | Falcon Scout | 22 | Active | Reveal utility | 0.5 | 30.0 | 20 | 10m scout zone | Reveal stealth | 40 threat |
| SKL_RAN_008 | Storm Arrows | 28 | Active | Rapid fire | 2.2 | 24.0 | 35 | 12m cone | 8 arrows | 90 threat |
| SKL_RAN_009 | Ricochet Bolt | 35 | Active | Chain shot | 1.95 | 16.0 | 30 | 4 targets | -15% each bounce | 80 threat |
| SKL_RAN_010 | Emerald Canopy | 42 | Active | Party mobility field | 0.0 | 35.0 | 40 | 6m circle | Dodge +10%, MS +12% | 0 threat |
| SKL_RAN_011 | Meteor Volley | 56 | Active | Large AoE | 3.0 | 40.0 | 55 | 7m circle | Knockback minor | 100 threat |
| SKL_RAN_012 | Kings Hunt | 74 | Ultimate | Marked burst | 3.8 | 95.0 | 75 | 14m target | 12 arrows on marked target | 110 threat |


### Skill Rank 1-5 Verileri


#### Quick Shot

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.05 | 2.0 | 12 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.17 | 1.9 | 12 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.28 | 1.9 | 13 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.4 | 1.9 | 13 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.51 | 1.8 | 13 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Rolling Escape

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 10.0 | 18 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 9.8 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 9.5 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 9.2 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 9.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Marked Prey

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.6 | 14.0 | 15 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.67 | 13.7 | 15 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.73 | 13.3 | 16 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.8 | 13.0 | 16 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.86 | 12.6 | 17 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Piercing Arrow

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.75 | 8.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.94 | 7.8 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.13 | 7.6 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.33 | 7.4 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.52 | 7.2 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Volley

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.85 | 12.0 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.05 | 11.7 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.26 | 11.4 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.46 | 11.1 | 27 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.66 | 10.8 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Snare Trap

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.4 | 18.0 | 18 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.44 | 17.6 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.49 | 17.1 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.53 | 16.7 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.58 | 16.2 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Falcon Scout

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.5 | 30.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.56 | 29.2 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.61 | 28.5 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.67 | 27.8 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.72 | 27.0 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Storm Arrows

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.2 | 24.0 | 35 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.44 | 23.4 | 36 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.68 | 22.8 | 37 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.93 | 22.2 | 38 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 3.17 | 21.6 | 39 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Ricochet Bolt

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.95 | 16.0 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.16 | 15.6 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.38 | 15.2 | 32 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.59 | 14.8 | 33 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.81 | 14.4 | 34 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Emerald Canopy

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 35.0 | 40 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 34.1 | 41 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 33.2 | 42 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 32.4 | 44 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 31.5 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Meteor Volley

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 3.0 | 40.0 | 55 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 3.33 | 39.0 | 57 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 3.66 | 38.0 | 58 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 3.99 | 37.0 | 60 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 4.32 | 36.0 | 62 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Kings Hunt

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 3.8 | 95.0 | 75 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 4.22 | 92.6 | 77 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 4.64 | 90.2 | 80 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 5.05 | 87.9 | 82 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 5.47 | 85.5 | 84 | PvP coefficient 0.85 | Server-authoritative hit validation |


### Pasifler

| ID | Passive | Unlock | Effect |
| --- | --- | --- | --- |
| PAS_RAN_001 | Trailrunner | 5 | Move while attacking penalty -50% |
| PAS_RAN_002 | Steady Aim | 10 | Damage +6% beyond 8m |
| PAS_RAN_003 | Wildcraft | 18 | Trap duration +20% |
| PAS_RAN_004 | Arrow Tempest | 30 | AoE radius +10% |
| PAS_RAN_005 | Predators Calm | 44 | Boss crit +5% |
| PAS_RAN_006 | Skyeye Doctrine | 60 | Falcon active grants CDR +8% |
| PAS_RAN_007 | Windstep | 75 | Roll gains 1 charge every 20s |
| PAS_RAN_008 | Perfect Trajectory | 90 | Piercing attacks ignore 8% armor |


### Art / Sprite Standardı

Front, Back, Left, Right turnaround zorunlu. Idle 8f, Run 8f, Basic Attack 8f, signature skill 10-16f, Hit 6f, Death 12f. Helmet/chest/gloves/legs/boots/cape/weapon/off-hand ayrı overlay layer olur.

\newpage

## 7.5 Mage - Ranged AoE DPS


**Resource:** Mana  
**Weapons:** Arcane Staff / Orb / Grimoire  
**Armor:** Cloth  
**Primary:** INT / **Secondary:** SPI  
**Identity:** Element combos, burst AoE, gravity control


### Aktif Skill Özeti

| ID | Skill | Lvl | Type | Description | Coef | CD | Cost | Hitbox | CC | Threat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SKL_MAG_001 | Arc Bolt | 1 | Active | Basic spell | 1.15 | 2.0 | 18 | 13m projectile | Arcane tag | 60 threat |
| SKL_MAG_002 | Flame Sigil | 4 | Active | Ground burn | 1.45 | 8.0 | 26 | 4m circle | Burn 6s | 70 threat |
| SKL_MAG_003 | Frost Needle | 7 | Active | Single target slow | 1.4 | 6.0 | 20 | 13m projectile | Slow 35% 3s | 60 threat |
| SKL_MAG_004 | Mana Shield | 10 | Active | Barrier | 0.0 | 24.0 | 30 | Self | Absorb via mana | 0 threat |
| SKL_MAG_005 | Chain Lightning | 14 | Active | Chain AoE | 1.85 | 12.0 | 32 | 5 targets | Shock 4s | 70 threat |
| SKL_MAG_006 | Arcane Pulse | 18 | Active | Point blank AoE | 1.7 | 10.0 | 28 | 4m circle | Push 0.6m | 70 threat |
| SKL_MAG_007 | Gravity Well | 24 | Active | Pull field | 0.9 | 18.0 | 40 | 5m circle | Pull + slow | 80 threat |
| SKL_MAG_008 | Meteor Shard | 30 | Active | Large AoE | 2.35 | 16.0 | 45 | 6m circle | Burn 8s | 90 threat |
| SKL_MAG_009 | Mirror Rune | 38 | Active | Spell echo | 0.0 | 28.0 | 22 | Self rune | Next spell repeats 45% | 0 threat |
| SKL_MAG_010 | Frozen Domain | 46 | Active | Control field | 1.2 | 32.0 | 55 | 7m circle | Slow 45%, brittle | 90 threat |
| SKL_MAG_011 | Astral Cataclysm | 60 | Active | Burst nuke | 3.4 | 70.0 | 80 | 7m circle | Knockdown minor mobs | 100 threat |
| SKL_MAG_012 | Eclipse Orbit | 78 | Ultimate | Overdrive | 0.0 | 110.0 | 100 | Self | Spell power +25% 12s | 0 threat |


### Skill Rank 1-5 Verileri


#### Arc Bolt

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.15 | 2.0 | 18 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.28 | 1.9 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.4 | 1.9 | 19 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.53 | 1.9 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.66 | 1.8 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Flame Sigil

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.45 | 8.0 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.61 | 7.8 | 27 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.77 | 7.6 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.93 | 7.4 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.09 | 7.2 | 29 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Frost Needle

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.4 | 6.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.55 | 5.8 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.71 | 5.7 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.86 | 5.6 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.02 | 5.4 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Mana Shield

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 24.0 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 23.4 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 22.8 | 32 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 22.2 | 33 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 21.6 | 34 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Chain Lightning

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.85 | 12.0 | 32 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.05 | 11.7 | 33 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.26 | 11.4 | 34 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.46 | 11.1 | 35 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.66 | 10.8 | 36 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Arcane Pulse

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.7 | 10.0 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.89 | 9.8 | 29 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.07 | 9.5 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.26 | 9.2 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.45 | 9.0 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Gravity Well

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.9 | 18.0 | 40 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.0 | 17.6 | 41 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.1 | 17.1 | 42 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.2 | 16.7 | 44 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.3 | 16.2 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Meteor Shard

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.35 | 16.0 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.61 | 15.6 | 46 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.87 | 15.2 | 48 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 3.13 | 14.8 | 49 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 3.38 | 14.4 | 50 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Mirror Rune

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 28.0 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 27.3 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 26.6 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 25.9 | 24 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 25.2 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Frozen Domain

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.2 | 32.0 | 55 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.33 | 31.2 | 57 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.46 | 30.4 | 58 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.6 | 29.6 | 60 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.73 | 28.8 | 62 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Astral Cataclysm

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 3.4 | 70.0 | 80 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 3.77 | 68.2 | 82 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 4.15 | 66.5 | 85 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 4.52 | 64.8 | 87 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 4.9 | 63.0 | 90 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Eclipse Orbit

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 110.0 | 100 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 107.2 | 103 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 104.5 | 106 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 101.8 | 109 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 99.0 | 112 | PvP coefficient 0.85 | Server-authoritative hit validation |


### Pasifler

| ID | Passive | Unlock | Effect |
| --- | --- | --- | --- |
| PAS_MAG_001 | Expanded Mind | 5 | Max mana +10% |
| PAS_MAG_002 | Elemental Study | 12 | Element damage +6% |
| PAS_MAG_003 | Quick Casting | 20 | Cast time -8% |
| PAS_MAG_004 | Arcane Resonance | 32 | Different element casts stack +2% dmg x5 |
| PAS_MAG_005 | Overchannel | 48 | High-cost spells crit +6% |
| PAS_MAG_006 | Astral Genius | 64 | AoE radius +8% |
| PAS_MAG_007 | Leywalker | 78 | Moving for 3s restores mana |
| PAS_MAG_008 | Grand Theorem | 92 | Rune cooldown -15% |


### Art / Sprite Standardı

Front, Back, Left, Right turnaround zorunlu. Idle 8f, Run 8f, Basic Attack 8f, signature skill 10-16f, Hit 6f, Death 12f. Helmet/chest/gloves/legs/boots/cape/weapon/off-hand ayrı overlay layer olur.

\newpage

## 7.6 Priest - AoE Support + Buff + Attack


**Resource:** Faith  
**Weapons:** Holy Mace / Censer / Sacred Tome  
**Armor:** Cloth / Light Robe  
**Primary:** SPI / **Secondary:** INT  
**Identity:** AoE healing, buffs, cleanse, holy utility


### Aktif Skill Özeti

| ID | Skill | Lvl | Type | Description | Coef | CD | Cost | Hitbox | CC | Threat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SKL_PRI_001 | Sacred Spark | 1 | Active | Holy projectile | 1.0 | 2.0 | 16 | 12m projectile | Holy tag | 50 threat |
| SKL_PRI_002 | Minor Mend | 3 | Active | Single heal | 1.2 | 4.0 | 20 | 12m ally | Instant heal | -80 threat |
| SKL_PRI_003 | Blessing of Grace | 6 | Active | Party buff | 0.0 | 18.0 | 24 | 6m allies | AS/MS +8% | 0 threat |
| SKL_PRI_004 | Halo Pulse | 9 | Active | AoE holy damage | 1.45 | 10.0 | 26 | 4m circle | Weak blind 1s | 60 threat |
| SKL_PRI_005 | Sanctuary Field | 13 | Active | AoE HoT | 0.0 | 20.0 | 30 | 6m circle | Heal over time | -120 threat |
| SKL_PRI_006 | Purify | 17 | Active | Cleanse | 0.0 | 14.0 | 22 | 12m ally | Removes 2 debuffs | -40 threat |
| SKL_PRI_007 | Guardian Hymn | 22 | Active | Defense aura | 0.0 | 24.0 | 28 | 7m circle | DEF/MDEF +10% | 0 threat |
| SKL_PRI_008 | Luminous Chains | 28 | Active | Damage/support chain | 1.7 | 18.0 | 35 | 4 targets | Heals ally if bounced | 50 threat |
| SKL_PRI_009 | Resurrection | 36 | Active | Revive ally | 0.0 | 120.0 | 50 | 10m ally | Revive 35% HP | 0 threat |
| SKL_PRI_010 | Judgment Ray | 44 | Active | Line holy attack | 1.85 | 16.0 | 40 | 12x1.5m line | Holy vulnerability | 60 threat |
| SKL_PRI_011 | Choir of Dawn | 58 | Active | Major group heal | 0.0 | 50.0 | 65 | 8m party | Heal + renew buffs | -180 threat |
| SKL_PRI_012 | Apotheosis | 76 | Ultimate | Support overdrive | 0.0 | 120.0 | 90 | Self | Heal/buff power +30% | 0 threat |


### Skill Rank 1-5 Verileri


#### Sacred Spark

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.0 | 2.0 | 16 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.11 | 1.9 | 16 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.22 | 1.9 | 17 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.33 | 1.9 | 17 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.44 | 1.8 | 18 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Minor Mend

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.2 | 4.0 | 20 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.33 | 3.9 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.46 | 3.8 | 21 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.6 | 3.7 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 1.73 | 3.6 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Blessing of Grace

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 18.0 | 24 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 17.6 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 17.1 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 16.7 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 16.2 | 27 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Halo Pulse

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.45 | 10.0 | 26 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.61 | 9.8 | 27 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 1.77 | 9.5 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 1.93 | 9.2 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.09 | 9.0 | 29 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Sanctuary Field

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 20.0 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 19.5 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 19.0 | 32 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 18.5 | 33 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 18.0 | 34 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Purify

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 14.0 | 22 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 13.7 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 13.3 | 23 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 13.0 | 24 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 12.6 | 25 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Guardian Hymn

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 24.0 | 28 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 23.4 | 29 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 22.8 | 30 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 22.2 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 21.6 | 31 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Luminous Chains

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.7 | 18.0 | 35 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 1.89 | 17.6 | 36 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.07 | 17.1 | 37 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.26 | 16.7 | 38 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.45 | 16.2 | 39 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Resurrection

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 120.0 | 50 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 117.0 | 52 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 114.0 | 53 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 111.0 | 55 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 108.0 | 56 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Judgment Ray

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.85 | 16.0 | 40 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 2.05 | 15.6 | 41 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 2.26 | 15.2 | 42 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 2.46 | 14.8 | 44 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 2.66 | 14.4 | 45 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Choir of Dawn

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 50.0 | 65 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 48.8 | 67 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 47.5 | 69 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 46.2 | 71 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 45.0 | 73 | PvP coefficient 0.85 | Server-authoritative hit validation |


#### Apotheosis

| Rank | Power Coef | CD | Cost | PvP | Implementation |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.0 | 120.0 | 90 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 2 | 0.0 | 117.0 | 93 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 3 | 0.0 | 114.0 | 95 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 4 | 0.0 | 111.0 | 98 | PvP coefficient 0.85 | Server-authoritative hit validation |
| 5 | 0.0 | 108.0 | 101 | PvP coefficient 0.85 | Server-authoritative hit validation |


### Pasifler

| ID | Passive | Unlock | Effect |
| --- | --- | --- | --- |
| PAS_PRI_001 | Serene Mind | 4 | Faith regen +10% |
| PAS_PRI_002 | Kindled Prayer | 10 | Heal power +8% |
| PAS_PRI_003 | Graceful Steps | 18 | Support cast grants MS +5% |
| PAS_PRI_004 | Sacred Chorus | 28 | Aura duration +20% |
| PAS_PRI_005 | Mercy Beyond | 42 | Targets below 35% HP heal +15% |
| PAS_PRI_006 | Saints Authority | 62 | Buff potency +8% |
| PAS_PRI_007 | Radiant Memory | 78 | First revive each dungeon costs no resource |
| PAS_PRI_008 | Beacon of Dawn | 92 | Sanctuary grants 5% damage reduction |


### Art / Sprite Standardı

Front, Back, Left, Right turnaround zorunlu. Idle 8f, Run 8f, Basic Attack 8f, signature skill 10-16f, Hit 6f, Death 12f. Helmet/chest/gloves/legs/boots/cape/weapon/off-hand ayrı overlay layer olur.

\newpage

# 8. Silah, Zırh, Item ve Loot Sistemi


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Concept_Art/class_equipment_atlas.png){ width=96% }


Rarity: Common -> Uncommon -> Rare -> Epic -> Legendary -> Mythic. Gerçek güç equipment slotlarından gelir; premium costume güç vermez. Enhancement +1..+15; +1..+5 garanti, +6..+10 artan maliyet, +11..+15 başarısızlıkta düşme riski ancak kırılma yok.


## 8.1 Knight Item Catalogue


| Item ID | Name | Slot | Rarity | Lvl | ATK | DEF | Affix Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ITM_0001 | Oathblade Common | MainHand | Common | 1 | 25 | 0 | Knight weapon affix pool |
| ITM_0002 | Lionguard Sword Common | MainHand | Common | 4 | 40 | 0 | Knight weapon affix pool |
| ITM_0003 | Sunward Mace Common | MainHand | Common | 7 | 55 | 0 | Knight weapon affix pool |
| ITM_0004 | Common Knight Head | Head | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0005 | Common Knight Chest | Chest | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0006 | Common Knight Gloves | Gloves | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0007 | Common Knight Legs | Legs | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0008 | Common Knight Boots | Boots | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0009 | Common Knight Cape | Cape | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0010 | Common Knight Necklace | Necklace | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0011 | Common Knight Ring | Ring | Common | 1 | 0 | 13 | Knight armor affix pool |
| ITM_0012 | Oathblade Uncommon | MainHand | Uncommon | 18 | 135 | 0 | Knight weapon affix pool |
| ITM_0013 | Lionguard Sword Uncommon | MainHand | Uncommon | 21 | 150 | 0 | Knight weapon affix pool |
| ITM_0014 | Sunward Mace Uncommon | MainHand | Uncommon | 24 | 165 | 0 | Knight weapon affix pool |
| ITM_0015 | Uncommon Knight Head | Head | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0016 | Uncommon Knight Chest | Chest | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0017 | Uncommon Knight Gloves | Gloves | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0018 | Uncommon Knight Legs | Legs | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0019 | Uncommon Knight Boots | Boots | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0020 | Uncommon Knight Cape | Cape | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0021 | Uncommon Knight Necklace | Necklace | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0022 | Uncommon Knight Ring | Ring | Uncommon | 18 | 0 | 79 | Knight armor affix pool |
| ITM_0023 | Oathblade Rare | MainHand | Rare | 35 | 245 | 0 | Knight weapon affix pool |
| ITM_0024 | Lionguard Sword Rare | MainHand | Rare | 38 | 260 | 0 | Knight weapon affix pool |
| ITM_0025 | Sunward Mace Rare | MainHand | Rare | 41 | 275 | 0 | Knight weapon affix pool |
| ITM_0026 | Rare Knight Head | Head | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0027 | Rare Knight Chest | Chest | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0028 | Rare Knight Gloves | Gloves | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0029 | Rare Knight Legs | Legs | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0030 | Rare Knight Boots | Boots | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0031 | Rare Knight Cape | Cape | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0032 | Rare Knight Necklace | Necklace | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0033 | Rare Knight Ring | Ring | Rare | 35 | 0 | 145 | Knight armor affix pool |
| ITM_0034 | Oathblade Epic | MainHand | Epic | 52 | 355 | 0 | Knight weapon affix pool |
| ITM_0035 | Lionguard Sword Epic | MainHand | Epic | 55 | 370 | 0 | Knight weapon affix pool |
| ITM_0036 | Sunward Mace Epic | MainHand | Epic | 58 | 385 | 0 | Knight weapon affix pool |
| ITM_0037 | Epic Knight Head | Head | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0038 | Epic Knight Chest | Chest | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0039 | Epic Knight Gloves | Gloves | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0040 | Epic Knight Legs | Legs | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0041 | Epic Knight Boots | Boots | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0042 | Epic Knight Cape | Cape | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0043 | Epic Knight Necklace | Necklace | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0044 | Epic Knight Ring | Ring | Epic | 52 | 0 | 211 | Knight armor affix pool |
| ITM_0045 | Oathblade Legendary | MainHand | Legendary | 69 | 465 | 0 | Knight weapon affix pool |
| ITM_0046 | Lionguard Sword Legendary | MainHand | Legendary | 72 | 480 | 0 | Knight weapon affix pool |
| ITM_0047 | Sunward Mace Legendary | MainHand | Legendary | 75 | 495 | 0 | Knight weapon affix pool |
| ITM_0048 | Legendary Knight Head | Head | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0049 | Legendary Knight Chest | Chest | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0050 | Legendary Knight Gloves | Gloves | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0051 | Legendary Knight Legs | Legs | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0052 | Legendary Knight Boots | Boots | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0053 | Legendary Knight Cape | Cape | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0054 | Legendary Knight Necklace | Necklace | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0055 | Legendary Knight Ring | Ring | Legendary | 69 | 0 | 277 | Knight armor affix pool |
| ITM_0056 | Oathblade Mythic | MainHand | Mythic | 86 | 575 | 0 | Knight weapon affix pool |
| ITM_0057 | Lionguard Sword Mythic | MainHand | Mythic | 89 | 590 | 0 | Knight weapon affix pool |
| ITM_0058 | Sunward Mace Mythic | MainHand | Mythic | 92 | 605 | 0 | Knight weapon affix pool |
| ITM_0059 | Mythic Knight Head | Head | Mythic | 86 | 0 | 343 | Knight armor affix pool |
| ITM_0060 | Mythic Knight Chest | Chest | Mythic | 86 | 0 | 343 | Knight armor affix pool |
| ITM_0061 | Mythic Knight Gloves | Gloves | Mythic | 86 | 0 | 343 | Knight armor affix pool |
| ITM_0062 | Mythic Knight Legs | Legs | Mythic | 86 | 0 | 343 | Knight armor affix pool |
| ITM_0063 | Mythic Knight Boots | Boots | Mythic | 86 | 0 | 343 | Knight armor affix pool |
| ITM_0064 | Mythic Knight Cape | Cape | Mythic | 86 | 0 | 343 | Knight armor affix pool |
| ITM_0065 | Mythic Knight Necklace | Necklace | Mythic | 86 | 0 | 343 | Knight armor affix pool |
| ITM_0066 | Mythic Knight Ring | Ring | Mythic | 86 | 0 | 343 | Knight armor affix pool |


\newpage

## 8.2 Berserker Item Catalogue


| Item ID | Name | Slot | Rarity | Lvl | ATK | DEF | Affix Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ITM_0067 | Bloodcleaver Common | MainHand | Common | 1 | 25 | 0 | Berserker weapon affix pool |
| ITM_0068 | Titan Axe Common | MainHand | Common | 4 | 40 | 0 | Berserker weapon affix pool |
| ITM_0069 | Ashreaver Greatsword Common | MainHand | Common | 7 | 55 | 0 | Berserker weapon affix pool |
| ITM_0070 | Common Berserker Head | Head | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0071 | Common Berserker Chest | Chest | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0072 | Common Berserker Gloves | Gloves | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0073 | Common Berserker Legs | Legs | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0074 | Common Berserker Boots | Boots | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0075 | Common Berserker Cape | Cape | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0076 | Common Berserker Necklace | Necklace | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0077 | Common Berserker Ring | Ring | Common | 1 | 0 | 13 | Berserker armor affix pool |
| ITM_0078 | Bloodcleaver Uncommon | MainHand | Uncommon | 18 | 135 | 0 | Berserker weapon affix pool |
| ITM_0079 | Titan Axe Uncommon | MainHand | Uncommon | 21 | 150 | 0 | Berserker weapon affix pool |
| ITM_0080 | Ashreaver Greatsword Uncommon | MainHand | Uncommon | 24 | 165 | 0 | Berserker weapon affix pool |
| ITM_0081 | Uncommon Berserker Head | Head | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0082 | Uncommon Berserker Chest | Chest | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0083 | Uncommon Berserker Gloves | Gloves | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0084 | Uncommon Berserker Legs | Legs | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0085 | Uncommon Berserker Boots | Boots | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0086 | Uncommon Berserker Cape | Cape | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0087 | Uncommon Berserker Necklace | Necklace | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0088 | Uncommon Berserker Ring | Ring | Uncommon | 18 | 0 | 79 | Berserker armor affix pool |
| ITM_0089 | Bloodcleaver Rare | MainHand | Rare | 35 | 245 | 0 | Berserker weapon affix pool |
| ITM_0090 | Titan Axe Rare | MainHand | Rare | 38 | 260 | 0 | Berserker weapon affix pool |
| ITM_0091 | Ashreaver Greatsword Rare | MainHand | Rare | 41 | 275 | 0 | Berserker weapon affix pool |
| ITM_0092 | Rare Berserker Head | Head | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0093 | Rare Berserker Chest | Chest | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0094 | Rare Berserker Gloves | Gloves | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0095 | Rare Berserker Legs | Legs | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0096 | Rare Berserker Boots | Boots | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0097 | Rare Berserker Cape | Cape | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0098 | Rare Berserker Necklace | Necklace | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0099 | Rare Berserker Ring | Ring | Rare | 35 | 0 | 145 | Berserker armor affix pool |
| ITM_0100 | Bloodcleaver Epic | MainHand | Epic | 52 | 355 | 0 | Berserker weapon affix pool |
| ITM_0101 | Titan Axe Epic | MainHand | Epic | 55 | 370 | 0 | Berserker weapon affix pool |
| ITM_0102 | Ashreaver Greatsword Epic | MainHand | Epic | 58 | 385 | 0 | Berserker weapon affix pool |
| ITM_0103 | Epic Berserker Head | Head | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0104 | Epic Berserker Chest | Chest | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0105 | Epic Berserker Gloves | Gloves | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0106 | Epic Berserker Legs | Legs | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0107 | Epic Berserker Boots | Boots | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0108 | Epic Berserker Cape | Cape | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0109 | Epic Berserker Necklace | Necklace | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0110 | Epic Berserker Ring | Ring | Epic | 52 | 0 | 211 | Berserker armor affix pool |
| ITM_0111 | Bloodcleaver Legendary | MainHand | Legendary | 69 | 465 | 0 | Berserker weapon affix pool |
| ITM_0112 | Titan Axe Legendary | MainHand | Legendary | 72 | 480 | 0 | Berserker weapon affix pool |
| ITM_0113 | Ashreaver Greatsword Legendary | MainHand | Legendary | 75 | 495 | 0 | Berserker weapon affix pool |
| ITM_0114 | Legendary Berserker Head | Head | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0115 | Legendary Berserker Chest | Chest | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0116 | Legendary Berserker Gloves | Gloves | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0117 | Legendary Berserker Legs | Legs | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0118 | Legendary Berserker Boots | Boots | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0119 | Legendary Berserker Cape | Cape | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0120 | Legendary Berserker Necklace | Necklace | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0121 | Legendary Berserker Ring | Ring | Legendary | 69 | 0 | 277 | Berserker armor affix pool |
| ITM_0122 | Bloodcleaver Mythic | MainHand | Mythic | 86 | 575 | 0 | Berserker weapon affix pool |
| ITM_0123 | Titan Axe Mythic | MainHand | Mythic | 89 | 590 | 0 | Berserker weapon affix pool |
| ITM_0124 | Ashreaver Greatsword Mythic | MainHand | Mythic | 92 | 605 | 0 | Berserker weapon affix pool |
| ITM_0125 | Mythic Berserker Head | Head | Mythic | 86 | 0 | 343 | Berserker armor affix pool |
| ITM_0126 | Mythic Berserker Chest | Chest | Mythic | 86 | 0 | 343 | Berserker armor affix pool |
| ITM_0127 | Mythic Berserker Gloves | Gloves | Mythic | 86 | 0 | 343 | Berserker armor affix pool |
| ITM_0128 | Mythic Berserker Legs | Legs | Mythic | 86 | 0 | 343 | Berserker armor affix pool |
| ITM_0129 | Mythic Berserker Boots | Boots | Mythic | 86 | 0 | 343 | Berserker armor affix pool |
| ITM_0130 | Mythic Berserker Cape | Cape | Mythic | 86 | 0 | 343 | Berserker armor affix pool |
| ITM_0131 | Mythic Berserker Necklace | Necklace | Mythic | 86 | 0 | 343 | Berserker armor affix pool |
| ITM_0132 | Mythic Berserker Ring | Ring | Mythic | 86 | 0 | 343 | Berserker armor affix pool |


\newpage

## 8.3 Assassin Item Catalogue


| Item ID | Name | Slot | Rarity | Lvl | ATK | DEF | Affix Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ITM_0133 | Umbral Fang Common | MainHand | Common | 1 | 25 | 0 | Assassin weapon affix pool |
| ITM_0134 | Nightglass Dagger Common | MainHand | Common | 4 | 40 | 0 | Assassin weapon affix pool |
| ITM_0135 | Kingslayer Knife Common | MainHand | Common | 7 | 55 | 0 | Assassin weapon affix pool |
| ITM_0136 | Common Assassin Head | Head | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0137 | Common Assassin Chest | Chest | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0138 | Common Assassin Gloves | Gloves | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0139 | Common Assassin Legs | Legs | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0140 | Common Assassin Boots | Boots | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0141 | Common Assassin Cape | Cape | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0142 | Common Assassin Necklace | Necklace | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0143 | Common Assassin Ring | Ring | Common | 1 | 0 | 13 | Assassin armor affix pool |
| ITM_0144 | Umbral Fang Uncommon | MainHand | Uncommon | 18 | 135 | 0 | Assassin weapon affix pool |
| ITM_0145 | Nightglass Dagger Uncommon | MainHand | Uncommon | 21 | 150 | 0 | Assassin weapon affix pool |
| ITM_0146 | Kingslayer Knife Uncommon | MainHand | Uncommon | 24 | 165 | 0 | Assassin weapon affix pool |
| ITM_0147 | Uncommon Assassin Head | Head | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0148 | Uncommon Assassin Chest | Chest | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0149 | Uncommon Assassin Gloves | Gloves | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0150 | Uncommon Assassin Legs | Legs | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0151 | Uncommon Assassin Boots | Boots | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0152 | Uncommon Assassin Cape | Cape | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0153 | Uncommon Assassin Necklace | Necklace | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0154 | Uncommon Assassin Ring | Ring | Uncommon | 18 | 0 | 79 | Assassin armor affix pool |
| ITM_0155 | Umbral Fang Rare | MainHand | Rare | 35 | 245 | 0 | Assassin weapon affix pool |
| ITM_0156 | Nightglass Dagger Rare | MainHand | Rare | 38 | 260 | 0 | Assassin weapon affix pool |
| ITM_0157 | Kingslayer Knife Rare | MainHand | Rare | 41 | 275 | 0 | Assassin weapon affix pool |
| ITM_0158 | Rare Assassin Head | Head | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0159 | Rare Assassin Chest | Chest | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0160 | Rare Assassin Gloves | Gloves | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0161 | Rare Assassin Legs | Legs | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0162 | Rare Assassin Boots | Boots | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0163 | Rare Assassin Cape | Cape | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0164 | Rare Assassin Necklace | Necklace | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0165 | Rare Assassin Ring | Ring | Rare | 35 | 0 | 145 | Assassin armor affix pool |
| ITM_0166 | Umbral Fang Epic | MainHand | Epic | 52 | 355 | 0 | Assassin weapon affix pool |
| ITM_0167 | Nightglass Dagger Epic | MainHand | Epic | 55 | 370 | 0 | Assassin weapon affix pool |
| ITM_0168 | Kingslayer Knife Epic | MainHand | Epic | 58 | 385 | 0 | Assassin weapon affix pool |
| ITM_0169 | Epic Assassin Head | Head | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0170 | Epic Assassin Chest | Chest | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0171 | Epic Assassin Gloves | Gloves | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0172 | Epic Assassin Legs | Legs | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0173 | Epic Assassin Boots | Boots | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0174 | Epic Assassin Cape | Cape | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0175 | Epic Assassin Necklace | Necklace | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0176 | Epic Assassin Ring | Ring | Epic | 52 | 0 | 211 | Assassin armor affix pool |
| ITM_0177 | Umbral Fang Legendary | MainHand | Legendary | 69 | 465 | 0 | Assassin weapon affix pool |
| ITM_0178 | Nightglass Dagger Legendary | MainHand | Legendary | 72 | 480 | 0 | Assassin weapon affix pool |
| ITM_0179 | Kingslayer Knife Legendary | MainHand | Legendary | 75 | 495 | 0 | Assassin weapon affix pool |
| ITM_0180 | Legendary Assassin Head | Head | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0181 | Legendary Assassin Chest | Chest | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0182 | Legendary Assassin Gloves | Gloves | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0183 | Legendary Assassin Legs | Legs | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0184 | Legendary Assassin Boots | Boots | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0185 | Legendary Assassin Cape | Cape | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0186 | Legendary Assassin Necklace | Necklace | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0187 | Legendary Assassin Ring | Ring | Legendary | 69 | 0 | 277 | Assassin armor affix pool |
| ITM_0188 | Umbral Fang Mythic | MainHand | Mythic | 86 | 575 | 0 | Assassin weapon affix pool |
| ITM_0189 | Nightglass Dagger Mythic | MainHand | Mythic | 89 | 590 | 0 | Assassin weapon affix pool |
| ITM_0190 | Kingslayer Knife Mythic | MainHand | Mythic | 92 | 605 | 0 | Assassin weapon affix pool |
| ITM_0191 | Mythic Assassin Head | Head | Mythic | 86 | 0 | 343 | Assassin armor affix pool |
| ITM_0192 | Mythic Assassin Chest | Chest | Mythic | 86 | 0 | 343 | Assassin armor affix pool |
| ITM_0193 | Mythic Assassin Gloves | Gloves | Mythic | 86 | 0 | 343 | Assassin armor affix pool |
| ITM_0194 | Mythic Assassin Legs | Legs | Mythic | 86 | 0 | 343 | Assassin armor affix pool |
| ITM_0195 | Mythic Assassin Boots | Boots | Mythic | 86 | 0 | 343 | Assassin armor affix pool |
| ITM_0196 | Mythic Assassin Cape | Cape | Mythic | 86 | 0 | 343 | Assassin armor affix pool |
| ITM_0197 | Mythic Assassin Necklace | Necklace | Mythic | 86 | 0 | 343 | Assassin armor affix pool |
| ITM_0198 | Mythic Assassin Ring | Ring | Mythic | 86 | 0 | 343 | Assassin armor affix pool |


\newpage

## 8.4 Ranger Item Catalogue


| Item ID | Name | Slot | Rarity | Lvl | ATK | DEF | Affix Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ITM_0199 | Whisperleaf Bow Common | MainHand | Common | 1 | 25 | 0 | Ranger weapon affix pool |
| ITM_0200 | Stormfeather Recurve Common | MainHand | Common | 4 | 40 | 0 | Ranger weapon affix pool |
| ITM_0201 | Skyhunter Crossbow Common | MainHand | Common | 7 | 55 | 0 | Ranger weapon affix pool |
| ITM_0202 | Common Ranger Head | Head | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0203 | Common Ranger Chest | Chest | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0204 | Common Ranger Gloves | Gloves | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0205 | Common Ranger Legs | Legs | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0206 | Common Ranger Boots | Boots | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0207 | Common Ranger Cape | Cape | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0208 | Common Ranger Necklace | Necklace | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0209 | Common Ranger Ring | Ring | Common | 1 | 0 | 13 | Ranger armor affix pool |
| ITM_0210 | Whisperleaf Bow Uncommon | MainHand | Uncommon | 18 | 135 | 0 | Ranger weapon affix pool |
| ITM_0211 | Stormfeather Recurve Uncommon | MainHand | Uncommon | 21 | 150 | 0 | Ranger weapon affix pool |
| ITM_0212 | Skyhunter Crossbow Uncommon | MainHand | Uncommon | 24 | 165 | 0 | Ranger weapon affix pool |
| ITM_0213 | Uncommon Ranger Head | Head | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0214 | Uncommon Ranger Chest | Chest | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0215 | Uncommon Ranger Gloves | Gloves | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0216 | Uncommon Ranger Legs | Legs | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0217 | Uncommon Ranger Boots | Boots | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0218 | Uncommon Ranger Cape | Cape | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0219 | Uncommon Ranger Necklace | Necklace | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0220 | Uncommon Ranger Ring | Ring | Uncommon | 18 | 0 | 79 | Ranger armor affix pool |
| ITM_0221 | Whisperleaf Bow Rare | MainHand | Rare | 35 | 245 | 0 | Ranger weapon affix pool |
| ITM_0222 | Stormfeather Recurve Rare | MainHand | Rare | 38 | 260 | 0 | Ranger weapon affix pool |
| ITM_0223 | Skyhunter Crossbow Rare | MainHand | Rare | 41 | 275 | 0 | Ranger weapon affix pool |
| ITM_0224 | Rare Ranger Head | Head | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0225 | Rare Ranger Chest | Chest | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0226 | Rare Ranger Gloves | Gloves | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0227 | Rare Ranger Legs | Legs | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0228 | Rare Ranger Boots | Boots | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0229 | Rare Ranger Cape | Cape | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0230 | Rare Ranger Necklace | Necklace | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0231 | Rare Ranger Ring | Ring | Rare | 35 | 0 | 145 | Ranger armor affix pool |
| ITM_0232 | Whisperleaf Bow Epic | MainHand | Epic | 52 | 355 | 0 | Ranger weapon affix pool |
| ITM_0233 | Stormfeather Recurve Epic | MainHand | Epic | 55 | 370 | 0 | Ranger weapon affix pool |
| ITM_0234 | Skyhunter Crossbow Epic | MainHand | Epic | 58 | 385 | 0 | Ranger weapon affix pool |
| ITM_0235 | Epic Ranger Head | Head | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0236 | Epic Ranger Chest | Chest | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0237 | Epic Ranger Gloves | Gloves | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0238 | Epic Ranger Legs | Legs | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0239 | Epic Ranger Boots | Boots | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0240 | Epic Ranger Cape | Cape | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0241 | Epic Ranger Necklace | Necklace | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0242 | Epic Ranger Ring | Ring | Epic | 52 | 0 | 211 | Ranger armor affix pool |
| ITM_0243 | Whisperleaf Bow Legendary | MainHand | Legendary | 69 | 465 | 0 | Ranger weapon affix pool |
| ITM_0244 | Stormfeather Recurve Legendary | MainHand | Legendary | 72 | 480 | 0 | Ranger weapon affix pool |
| ITM_0245 | Skyhunter Crossbow Legendary | MainHand | Legendary | 75 | 495 | 0 | Ranger weapon affix pool |
| ITM_0246 | Legendary Ranger Head | Head | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0247 | Legendary Ranger Chest | Chest | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0248 | Legendary Ranger Gloves | Gloves | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0249 | Legendary Ranger Legs | Legs | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0250 | Legendary Ranger Boots | Boots | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0251 | Legendary Ranger Cape | Cape | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0252 | Legendary Ranger Necklace | Necklace | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0253 | Legendary Ranger Ring | Ring | Legendary | 69 | 0 | 277 | Ranger armor affix pool |
| ITM_0254 | Whisperleaf Bow Mythic | MainHand | Mythic | 86 | 575 | 0 | Ranger weapon affix pool |
| ITM_0255 | Stormfeather Recurve Mythic | MainHand | Mythic | 89 | 590 | 0 | Ranger weapon affix pool |
| ITM_0256 | Skyhunter Crossbow Mythic | MainHand | Mythic | 92 | 605 | 0 | Ranger weapon affix pool |
| ITM_0257 | Mythic Ranger Head | Head | Mythic | 86 | 0 | 343 | Ranger armor affix pool |
| ITM_0258 | Mythic Ranger Chest | Chest | Mythic | 86 | 0 | 343 | Ranger armor affix pool |
| ITM_0259 | Mythic Ranger Gloves | Gloves | Mythic | 86 | 0 | 343 | Ranger armor affix pool |
| ITM_0260 | Mythic Ranger Legs | Legs | Mythic | 86 | 0 | 343 | Ranger armor affix pool |
| ITM_0261 | Mythic Ranger Boots | Boots | Mythic | 86 | 0 | 343 | Ranger armor affix pool |
| ITM_0262 | Mythic Ranger Cape | Cape | Mythic | 86 | 0 | 343 | Ranger armor affix pool |
| ITM_0263 | Mythic Ranger Necklace | Necklace | Mythic | 86 | 0 | 343 | Ranger armor affix pool |
| ITM_0264 | Mythic Ranger Ring | Ring | Mythic | 86 | 0 | 343 | Ranger armor affix pool |


\newpage

## 8.5 Mage Item Catalogue


| Item ID | Name | Slot | Rarity | Lvl | ATK | DEF | Affix Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ITM_0265 | Starwell Staff Common | MainHand | Common | 1 | 25 | 0 | Mage weapon affix pool |
| ITM_0266 | Celestine Rod Common | MainHand | Common | 4 | 40 | 0 | Mage weapon affix pool |
| ITM_0267 | Eclipse Grimoire Common | MainHand | Common | 7 | 55 | 0 | Mage weapon affix pool |
| ITM_0268 | Common Mage Head | Head | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0269 | Common Mage Chest | Chest | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0270 | Common Mage Gloves | Gloves | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0271 | Common Mage Legs | Legs | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0272 | Common Mage Boots | Boots | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0273 | Common Mage Cape | Cape | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0274 | Common Mage Necklace | Necklace | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0275 | Common Mage Ring | Ring | Common | 1 | 0 | 13 | Mage armor affix pool |
| ITM_0276 | Starwell Staff Uncommon | MainHand | Uncommon | 18 | 135 | 0 | Mage weapon affix pool |
| ITM_0277 | Celestine Rod Uncommon | MainHand | Uncommon | 21 | 150 | 0 | Mage weapon affix pool |
| ITM_0278 | Eclipse Grimoire Uncommon | MainHand | Uncommon | 24 | 165 | 0 | Mage weapon affix pool |
| ITM_0279 | Uncommon Mage Head | Head | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0280 | Uncommon Mage Chest | Chest | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0281 | Uncommon Mage Gloves | Gloves | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0282 | Uncommon Mage Legs | Legs | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0283 | Uncommon Mage Boots | Boots | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0284 | Uncommon Mage Cape | Cape | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0285 | Uncommon Mage Necklace | Necklace | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0286 | Uncommon Mage Ring | Ring | Uncommon | 18 | 0 | 79 | Mage armor affix pool |
| ITM_0287 | Starwell Staff Rare | MainHand | Rare | 35 | 245 | 0 | Mage weapon affix pool |
| ITM_0288 | Celestine Rod Rare | MainHand | Rare | 38 | 260 | 0 | Mage weapon affix pool |
| ITM_0289 | Eclipse Grimoire Rare | MainHand | Rare | 41 | 275 | 0 | Mage weapon affix pool |
| ITM_0290 | Rare Mage Head | Head | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0291 | Rare Mage Chest | Chest | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0292 | Rare Mage Gloves | Gloves | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0293 | Rare Mage Legs | Legs | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0294 | Rare Mage Boots | Boots | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0295 | Rare Mage Cape | Cape | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0296 | Rare Mage Necklace | Necklace | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0297 | Rare Mage Ring | Ring | Rare | 35 | 0 | 145 | Mage armor affix pool |
| ITM_0298 | Starwell Staff Epic | MainHand | Epic | 52 | 355 | 0 | Mage weapon affix pool |
| ITM_0299 | Celestine Rod Epic | MainHand | Epic | 55 | 370 | 0 | Mage weapon affix pool |
| ITM_0300 | Eclipse Grimoire Epic | MainHand | Epic | 58 | 385 | 0 | Mage weapon affix pool |
| ITM_0301 | Epic Mage Head | Head | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0302 | Epic Mage Chest | Chest | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0303 | Epic Mage Gloves | Gloves | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0304 | Epic Mage Legs | Legs | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0305 | Epic Mage Boots | Boots | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0306 | Epic Mage Cape | Cape | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0307 | Epic Mage Necklace | Necklace | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0308 | Epic Mage Ring | Ring | Epic | 52 | 0 | 211 | Mage armor affix pool |
| ITM_0309 | Starwell Staff Legendary | MainHand | Legendary | 69 | 465 | 0 | Mage weapon affix pool |
| ITM_0310 | Celestine Rod Legendary | MainHand | Legendary | 72 | 480 | 0 | Mage weapon affix pool |
| ITM_0311 | Eclipse Grimoire Legendary | MainHand | Legendary | 75 | 495 | 0 | Mage weapon affix pool |
| ITM_0312 | Legendary Mage Head | Head | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0313 | Legendary Mage Chest | Chest | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0314 | Legendary Mage Gloves | Gloves | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0315 | Legendary Mage Legs | Legs | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0316 | Legendary Mage Boots | Boots | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0317 | Legendary Mage Cape | Cape | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0318 | Legendary Mage Necklace | Necklace | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0319 | Legendary Mage Ring | Ring | Legendary | 69 | 0 | 277 | Mage armor affix pool |
| ITM_0320 | Starwell Staff Mythic | MainHand | Mythic | 86 | 575 | 0 | Mage weapon affix pool |
| ITM_0321 | Celestine Rod Mythic | MainHand | Mythic | 89 | 590 | 0 | Mage weapon affix pool |
| ITM_0322 | Eclipse Grimoire Mythic | MainHand | Mythic | 92 | 605 | 0 | Mage weapon affix pool |
| ITM_0323 | Mythic Mage Head | Head | Mythic | 86 | 0 | 343 | Mage armor affix pool |
| ITM_0324 | Mythic Mage Chest | Chest | Mythic | 86 | 0 | 343 | Mage armor affix pool |
| ITM_0325 | Mythic Mage Gloves | Gloves | Mythic | 86 | 0 | 343 | Mage armor affix pool |
| ITM_0326 | Mythic Mage Legs | Legs | Mythic | 86 | 0 | 343 | Mage armor affix pool |
| ITM_0327 | Mythic Mage Boots | Boots | Mythic | 86 | 0 | 343 | Mage armor affix pool |
| ITM_0328 | Mythic Mage Cape | Cape | Mythic | 86 | 0 | 343 | Mage armor affix pool |
| ITM_0329 | Mythic Mage Necklace | Necklace | Mythic | 86 | 0 | 343 | Mage armor affix pool |
| ITM_0330 | Mythic Mage Ring | Ring | Mythic | 86 | 0 | 343 | Mage armor affix pool |


\newpage

## 8.6 Priest Item Catalogue


| Item ID | Name | Slot | Rarity | Lvl | ATK | DEF | Affix Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ITM_0331 | Dawn Censer Common | MainHand | Common | 1 | 25 | 0 | Priest weapon affix pool |
| ITM_0332 | Mercy Mace Common | MainHand | Common | 4 | 40 | 0 | Priest weapon affix pool |
| ITM_0333 | Scripture Tome Common | MainHand | Common | 7 | 55 | 0 | Priest weapon affix pool |
| ITM_0334 | Common Priest Head | Head | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0335 | Common Priest Chest | Chest | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0336 | Common Priest Gloves | Gloves | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0337 | Common Priest Legs | Legs | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0338 | Common Priest Boots | Boots | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0339 | Common Priest Cape | Cape | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0340 | Common Priest Necklace | Necklace | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0341 | Common Priest Ring | Ring | Common | 1 | 0 | 13 | Priest armor affix pool |
| ITM_0342 | Dawn Censer Uncommon | MainHand | Uncommon | 18 | 135 | 0 | Priest weapon affix pool |
| ITM_0343 | Mercy Mace Uncommon | MainHand | Uncommon | 21 | 150 | 0 | Priest weapon affix pool |
| ITM_0344 | Scripture Tome Uncommon | MainHand | Uncommon | 24 | 165 | 0 | Priest weapon affix pool |
| ITM_0345 | Uncommon Priest Head | Head | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0346 | Uncommon Priest Chest | Chest | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0347 | Uncommon Priest Gloves | Gloves | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0348 | Uncommon Priest Legs | Legs | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0349 | Uncommon Priest Boots | Boots | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0350 | Uncommon Priest Cape | Cape | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0351 | Uncommon Priest Necklace | Necklace | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0352 | Uncommon Priest Ring | Ring | Uncommon | 18 | 0 | 79 | Priest armor affix pool |
| ITM_0353 | Dawn Censer Rare | MainHand | Rare | 35 | 245 | 0 | Priest weapon affix pool |
| ITM_0354 | Mercy Mace Rare | MainHand | Rare | 38 | 260 | 0 | Priest weapon affix pool |
| ITM_0355 | Scripture Tome Rare | MainHand | Rare | 41 | 275 | 0 | Priest weapon affix pool |
| ITM_0356 | Rare Priest Head | Head | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0357 | Rare Priest Chest | Chest | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0358 | Rare Priest Gloves | Gloves | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0359 | Rare Priest Legs | Legs | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0360 | Rare Priest Boots | Boots | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0361 | Rare Priest Cape | Cape | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0362 | Rare Priest Necklace | Necklace | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0363 | Rare Priest Ring | Ring | Rare | 35 | 0 | 145 | Priest armor affix pool |
| ITM_0364 | Dawn Censer Epic | MainHand | Epic | 52 | 355 | 0 | Priest weapon affix pool |
| ITM_0365 | Mercy Mace Epic | MainHand | Epic | 55 | 370 | 0 | Priest weapon affix pool |
| ITM_0366 | Scripture Tome Epic | MainHand | Epic | 58 | 385 | 0 | Priest weapon affix pool |
| ITM_0367 | Epic Priest Head | Head | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0368 | Epic Priest Chest | Chest | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0369 | Epic Priest Gloves | Gloves | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0370 | Epic Priest Legs | Legs | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0371 | Epic Priest Boots | Boots | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0372 | Epic Priest Cape | Cape | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0373 | Epic Priest Necklace | Necklace | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0374 | Epic Priest Ring | Ring | Epic | 52 | 0 | 211 | Priest armor affix pool |
| ITM_0375 | Dawn Censer Legendary | MainHand | Legendary | 69 | 465 | 0 | Priest weapon affix pool |
| ITM_0376 | Mercy Mace Legendary | MainHand | Legendary | 72 | 480 | 0 | Priest weapon affix pool |
| ITM_0377 | Scripture Tome Legendary | MainHand | Legendary | 75 | 495 | 0 | Priest weapon affix pool |
| ITM_0378 | Legendary Priest Head | Head | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0379 | Legendary Priest Chest | Chest | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0380 | Legendary Priest Gloves | Gloves | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0381 | Legendary Priest Legs | Legs | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0382 | Legendary Priest Boots | Boots | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0383 | Legendary Priest Cape | Cape | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0384 | Legendary Priest Necklace | Necklace | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0385 | Legendary Priest Ring | Ring | Legendary | 69 | 0 | 277 | Priest armor affix pool |
| ITM_0386 | Dawn Censer Mythic | MainHand | Mythic | 86 | 575 | 0 | Priest weapon affix pool |
| ITM_0387 | Mercy Mace Mythic | MainHand | Mythic | 89 | 590 | 0 | Priest weapon affix pool |
| ITM_0388 | Scripture Tome Mythic | MainHand | Mythic | 92 | 605 | 0 | Priest weapon affix pool |
| ITM_0389 | Mythic Priest Head | Head | Mythic | 86 | 0 | 343 | Priest armor affix pool |
| ITM_0390 | Mythic Priest Chest | Chest | Mythic | 86 | 0 | 343 | Priest armor affix pool |
| ITM_0391 | Mythic Priest Gloves | Gloves | Mythic | 86 | 0 | 343 | Priest armor affix pool |
| ITM_0392 | Mythic Priest Legs | Legs | Mythic | 86 | 0 | 343 | Priest armor affix pool |
| ITM_0393 | Mythic Priest Boots | Boots | Mythic | 86 | 0 | 343 | Priest armor affix pool |
| ITM_0394 | Mythic Priest Cape | Cape | Mythic | 86 | 0 | 343 | Priest armor affix pool |
| ITM_0395 | Mythic Priest Necklace | Necklace | Mythic | 86 | 0 | 343 | Priest armor affix pool |
| ITM_0396 | Mythic Priest Ring | Ring | Mythic | 86 | 0 | 343 | Priest armor affix pool |


\newpage

# 9. Quest Sistemi ve İçerik Akışı


Quest state sunucuda quest_id + step + counter JSON olarak tutulur. Her quest prerequisite, objective, completion trigger, reward ve follow-up alanlarına sahiptir. Ana quest zinciri harita erişimini açar; side questler reputation/crafting/lore sağlar.


## 9.1 Dawnwatch Village Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_01_01 | 1 | Prologue: Adım 1 | Talk | Dawnwatch Village içindeki hikâye hedefi 1 | XP tier 1, Gold, story flag MQ_01_01 | MQ_01_01 |
| MQ_01_02 | 2 | Prologue: Adım 2 | Kill | Dawnwatch Village içindeki hikâye hedefi 2 | XP tier 1, Gold, story flag MQ_01_02 | MQ_01_01 |
| MQ_01_03 | 3 | Prologue: Adım 3 | Collect | Dawnwatch Village içindeki hikâye hedefi 3 | XP tier 1, Gold, story flag MQ_01_03 | MQ_01_02 |
| MQ_01_04 | 4 | Prologue: Adım 4 | Investigate | Dawnwatch Village içindeki hikâye hedefi 4 | XP tier 1, Gold, story flag MQ_01_04 | MQ_01_03 |
| MQ_01_05 | 5 | Prologue: Adım 5 | Defend | Dawnwatch Village içindeki hikâye hedefi 5 | XP tier 1, Gold, story flag MQ_01_05 | MQ_01_04 |
| MQ_01_06 | 6 | Prologue: Adım 6 | Escort | Dawnwatch Village içindeki hikâye hedefi 6 | XP tier 1, Gold, story flag MQ_01_06 | MQ_01_05 |
| MQ_01_07 | 7 | Prologue: Adım 7 | Activate | Dawnwatch Village içindeki hikâye hedefi 7 | XP tier 1, Gold, story flag MQ_01_07 | MQ_01_06 |
| MQ_01_08 | 8 | Prologue: Adım 8 | Boss | Dawnwatch Village içindeki hikâye hedefi 8 | XP tier 1, Gold, story flag MQ_01_08 | MQ_01_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_01_01 | 2 | Dawnwatch Village Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 1 |
| SQ_01_02 | 3 | Dawnwatch Village Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 1 |
| SQ_01_03 | 4 | Dawnwatch Village Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 1 |
| SQ_01_04 | 5 | Dawnwatch Village Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 1 |
| SQ_01_05 | 6 | Dawnwatch Village Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 1 |
| SQ_01_06 | 7 | Dawnwatch Village Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 1 |
| SQ_01_07 | 8 | Dawnwatch Village Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 1 |
| SQ_01_08 | 8 | Dawnwatch Village Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 1 |


\newpage

## 9.2 Verdant Trail Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_02_01 | 5 | The Briar Wakes: Adım 1 | Talk | Verdant Trail içindeki hikâye hedefi 1 | XP tier 2, Gold, story flag MQ_02_01 | MQ_02_01 |
| MQ_02_02 | 6 | The Briar Wakes: Adım 2 | Kill | Verdant Trail içindeki hikâye hedefi 2 | XP tier 2, Gold, story flag MQ_02_02 | MQ_02_01 |
| MQ_02_03 | 7 | The Briar Wakes: Adım 3 | Collect | Verdant Trail içindeki hikâye hedefi 3 | XP tier 2, Gold, story flag MQ_02_03 | MQ_02_02 |
| MQ_02_04 | 8 | The Briar Wakes: Adım 4 | Investigate | Verdant Trail içindeki hikâye hedefi 4 | XP tier 2, Gold, story flag MQ_02_04 | MQ_02_03 |
| MQ_02_05 | 9 | The Briar Wakes: Adım 5 | Defend | Verdant Trail içindeki hikâye hedefi 5 | XP tier 2, Gold, story flag MQ_02_05 | MQ_02_04 |
| MQ_02_06 | 10 | The Briar Wakes: Adım 6 | Escort | Verdant Trail içindeki hikâye hedefi 6 | XP tier 2, Gold, story flag MQ_02_06 | MQ_02_05 |
| MQ_02_07 | 11 | The Briar Wakes: Adım 7 | Activate | Verdant Trail içindeki hikâye hedefi 7 | XP tier 2, Gold, story flag MQ_02_07 | MQ_02_06 |
| MQ_02_08 | 12 | The Briar Wakes: Adım 8 | Boss | Verdant Trail içindeki hikâye hedefi 8 | XP tier 2, Gold, story flag MQ_02_08 | MQ_02_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_02_01 | 6 | Verdant Trail Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 2 |
| SQ_02_02 | 7 | Verdant Trail Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 2 |
| SQ_02_03 | 8 | Verdant Trail Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 2 |
| SQ_02_04 | 9 | Verdant Trail Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 2 |
| SQ_02_05 | 10 | Verdant Trail Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 2 |
| SQ_02_06 | 11 | Verdant Trail Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 2 |
| SQ_02_07 | 12 | Verdant Trail Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 2 |
| SQ_02_08 | 12 | Verdant Trail Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 2 |


\newpage

## 9.3 Moonfen Marsh Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_03_01 | 20 | Lanterns in the Mire: Adım 1 | Talk | Moonfen Marsh içindeki hikâye hedefi 1 | XP tier 3, Gold, story flag MQ_03_01 | MQ_03_01 |
| MQ_03_02 | 21 | Lanterns in the Mire: Adım 2 | Kill | Moonfen Marsh içindeki hikâye hedefi 2 | XP tier 3, Gold, story flag MQ_03_02 | MQ_03_01 |
| MQ_03_03 | 22 | Lanterns in the Mire: Adım 3 | Collect | Moonfen Marsh içindeki hikâye hedefi 3 | XP tier 3, Gold, story flag MQ_03_03 | MQ_03_02 |
| MQ_03_04 | 23 | Lanterns in the Mire: Adım 4 | Investigate | Moonfen Marsh içindeki hikâye hedefi 4 | XP tier 3, Gold, story flag MQ_03_04 | MQ_03_03 |
| MQ_03_05 | 24 | Lanterns in the Mire: Adım 5 | Defend | Moonfen Marsh içindeki hikâye hedefi 5 | XP tier 3, Gold, story flag MQ_03_05 | MQ_03_04 |
| MQ_03_06 | 25 | Lanterns in the Mire: Adım 6 | Escort | Moonfen Marsh içindeki hikâye hedefi 6 | XP tier 3, Gold, story flag MQ_03_06 | MQ_03_05 |
| MQ_03_07 | 26 | Lanterns in the Mire: Adım 7 | Activate | Moonfen Marsh içindeki hikâye hedefi 7 | XP tier 3, Gold, story flag MQ_03_07 | MQ_03_06 |
| MQ_03_08 | 27 | Lanterns in the Mire: Adım 8 | Boss | Moonfen Marsh içindeki hikâye hedefi 8 | XP tier 3, Gold, story flag MQ_03_08 | MQ_03_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_03_01 | 21 | Moonfen Marsh Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 3 |
| SQ_03_02 | 22 | Moonfen Marsh Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 3 |
| SQ_03_03 | 23 | Moonfen Marsh Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 3 |
| SQ_03_04 | 24 | Moonfen Marsh Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 3 |
| SQ_03_05 | 25 | Moonfen Marsh Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 3 |
| SQ_03_06 | 26 | Moonfen Marsh Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 3 |
| SQ_03_07 | 27 | Moonfen Marsh Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 3 |
| SQ_03_08 | 27 | Moonfen Marsh Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 3 |


\newpage

## 9.4 Ashen Wastes Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_04_01 | 25 | Ashes of the Legion: Adım 1 | Talk | Ashen Wastes içindeki hikâye hedefi 1 | XP tier 4, Gold, story flag MQ_04_01 | MQ_04_01 |
| MQ_04_02 | 26 | Ashes of the Legion: Adım 2 | Kill | Ashen Wastes içindeki hikâye hedefi 2 | XP tier 4, Gold, story flag MQ_04_02 | MQ_04_01 |
| MQ_04_03 | 27 | Ashes of the Legion: Adım 3 | Collect | Ashen Wastes içindeki hikâye hedefi 3 | XP tier 4, Gold, story flag MQ_04_03 | MQ_04_02 |
| MQ_04_04 | 28 | Ashes of the Legion: Adım 4 | Investigate | Ashen Wastes içindeki hikâye hedefi 4 | XP tier 4, Gold, story flag MQ_04_04 | MQ_04_03 |
| MQ_04_05 | 29 | Ashes of the Legion: Adım 5 | Defend | Ashen Wastes içindeki hikâye hedefi 5 | XP tier 4, Gold, story flag MQ_04_05 | MQ_04_04 |
| MQ_04_06 | 30 | Ashes of the Legion: Adım 6 | Escort | Ashen Wastes içindeki hikâye hedefi 6 | XP tier 4, Gold, story flag MQ_04_06 | MQ_04_05 |
| MQ_04_07 | 31 | Ashes of the Legion: Adım 7 | Activate | Ashen Wastes içindeki hikâye hedefi 7 | XP tier 4, Gold, story flag MQ_04_07 | MQ_04_06 |
| MQ_04_08 | 32 | Ashes of the Legion: Adım 8 | Boss | Ashen Wastes içindeki hikâye hedefi 8 | XP tier 4, Gold, story flag MQ_04_08 | MQ_04_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_04_01 | 26 | Ashen Wastes Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 4 |
| SQ_04_02 | 27 | Ashen Wastes Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 4 |
| SQ_04_03 | 28 | Ashen Wastes Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 4 |
| SQ_04_04 | 29 | Ashen Wastes Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 4 |
| SQ_04_05 | 30 | Ashen Wastes Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 4 |
| SQ_04_06 | 31 | Ashen Wastes Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 4 |
| SQ_04_07 | 32 | Ashen Wastes Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 4 |
| SQ_04_08 | 32 | Ashen Wastes Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 4 |


\newpage

## 9.5 Ironroot Depths Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_05_01 | 32 | Beneath Root and Stone: Adım 1 | Talk | Ironroot Depths içindeki hikâye hedefi 1 | XP tier 5, Gold, story flag MQ_05_01 | MQ_05_01 |
| MQ_05_02 | 33 | Beneath Root and Stone: Adım 2 | Kill | Ironroot Depths içindeki hikâye hedefi 2 | XP tier 5, Gold, story flag MQ_05_02 | MQ_05_01 |
| MQ_05_03 | 34 | Beneath Root and Stone: Adım 3 | Collect | Ironroot Depths içindeki hikâye hedefi 3 | XP tier 5, Gold, story flag MQ_05_03 | MQ_05_02 |
| MQ_05_04 | 35 | Beneath Root and Stone: Adım 4 | Investigate | Ironroot Depths içindeki hikâye hedefi 4 | XP tier 5, Gold, story flag MQ_05_04 | MQ_05_03 |
| MQ_05_05 | 36 | Beneath Root and Stone: Adım 5 | Defend | Ironroot Depths içindeki hikâye hedefi 5 | XP tier 5, Gold, story flag MQ_05_05 | MQ_05_04 |
| MQ_05_06 | 37 | Beneath Root and Stone: Adım 6 | Escort | Ironroot Depths içindeki hikâye hedefi 6 | XP tier 5, Gold, story flag MQ_05_06 | MQ_05_05 |
| MQ_05_07 | 38 | Beneath Root and Stone: Adım 7 | Activate | Ironroot Depths içindeki hikâye hedefi 7 | XP tier 5, Gold, story flag MQ_05_07 | MQ_05_06 |
| MQ_05_08 | 39 | Beneath Root and Stone: Adım 8 | Boss | Ironroot Depths içindeki hikâye hedefi 8 | XP tier 5, Gold, story flag MQ_05_08 | MQ_05_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_05_01 | 33 | Ironroot Depths Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 5 |
| SQ_05_02 | 34 | Ironroot Depths Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 5 |
| SQ_05_03 | 35 | Ironroot Depths Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 5 |
| SQ_05_04 | 36 | Ironroot Depths Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 5 |
| SQ_05_05 | 37 | Ironroot Depths Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 5 |
| SQ_05_06 | 38 | Ironroot Depths Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 5 |
| SQ_05_07 | 39 | Ironroot Depths Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 5 |
| SQ_05_08 | 39 | Ironroot Depths Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 5 |


\newpage

## 9.6 Sunscar Desert Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_06_01 | 38 | Kingdom of Sand: Adım 1 | Talk | Sunscar Desert içindeki hikâye hedefi 1 | XP tier 6, Gold, story flag MQ_06_01 | MQ_06_01 |
| MQ_06_02 | 39 | Kingdom of Sand: Adım 2 | Kill | Sunscar Desert içindeki hikâye hedefi 2 | XP tier 6, Gold, story flag MQ_06_02 | MQ_06_01 |
| MQ_06_03 | 40 | Kingdom of Sand: Adım 3 | Collect | Sunscar Desert içindeki hikâye hedefi 3 | XP tier 6, Gold, story flag MQ_06_03 | MQ_06_02 |
| MQ_06_04 | 41 | Kingdom of Sand: Adım 4 | Investigate | Sunscar Desert içindeki hikâye hedefi 4 | XP tier 6, Gold, story flag MQ_06_04 | MQ_06_03 |
| MQ_06_05 | 42 | Kingdom of Sand: Adım 5 | Defend | Sunscar Desert içindeki hikâye hedefi 5 | XP tier 6, Gold, story flag MQ_06_05 | MQ_06_04 |
| MQ_06_06 | 43 | Kingdom of Sand: Adım 6 | Escort | Sunscar Desert içindeki hikâye hedefi 6 | XP tier 6, Gold, story flag MQ_06_06 | MQ_06_05 |
| MQ_06_07 | 44 | Kingdom of Sand: Adım 7 | Activate | Sunscar Desert içindeki hikâye hedefi 7 | XP tier 6, Gold, story flag MQ_06_07 | MQ_06_06 |
| MQ_06_08 | 45 | Kingdom of Sand: Adım 8 | Boss | Sunscar Desert içindeki hikâye hedefi 8 | XP tier 6, Gold, story flag MQ_06_08 | MQ_06_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_06_01 | 39 | Sunscar Desert Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 6 |
| SQ_06_02 | 40 | Sunscar Desert Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 6 |
| SQ_06_03 | 41 | Sunscar Desert Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 6 |
| SQ_06_04 | 42 | Sunscar Desert Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 6 |
| SQ_06_05 | 43 | Sunscar Desert Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 6 |
| SQ_06_06 | 44 | Sunscar Desert Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 6 |
| SQ_06_07 | 45 | Sunscar Desert Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 6 |
| SQ_06_08 | 45 | Sunscar Desert Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 6 |


\newpage

## 9.7 Celestine Ruins Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_07_01 | 45 | Songs of the Celestine: Adım 1 | Talk | Celestine Ruins içindeki hikâye hedefi 1 | XP tier 7, Gold, story flag MQ_07_01 | MQ_07_01 |
| MQ_07_02 | 46 | Songs of the Celestine: Adım 2 | Kill | Celestine Ruins içindeki hikâye hedefi 2 | XP tier 7, Gold, story flag MQ_07_02 | MQ_07_01 |
| MQ_07_03 | 47 | Songs of the Celestine: Adım 3 | Collect | Celestine Ruins içindeki hikâye hedefi 3 | XP tier 7, Gold, story flag MQ_07_03 | MQ_07_02 |
| MQ_07_04 | 48 | Songs of the Celestine: Adım 4 | Investigate | Celestine Ruins içindeki hikâye hedefi 4 | XP tier 7, Gold, story flag MQ_07_04 | MQ_07_03 |
| MQ_07_05 | 49 | Songs of the Celestine: Adım 5 | Defend | Celestine Ruins içindeki hikâye hedefi 5 | XP tier 7, Gold, story flag MQ_07_05 | MQ_07_04 |
| MQ_07_06 | 50 | Songs of the Celestine: Adım 6 | Escort | Celestine Ruins içindeki hikâye hedefi 6 | XP tier 7, Gold, story flag MQ_07_06 | MQ_07_05 |
| MQ_07_07 | 51 | Songs of the Celestine: Adım 7 | Activate | Celestine Ruins içindeki hikâye hedefi 7 | XP tier 7, Gold, story flag MQ_07_07 | MQ_07_06 |
| MQ_07_08 | 52 | Songs of the Celestine: Adım 8 | Boss | Celestine Ruins içindeki hikâye hedefi 8 | XP tier 7, Gold, story flag MQ_07_08 | MQ_07_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_07_01 | 46 | Celestine Ruins Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 7 |
| SQ_07_02 | 47 | Celestine Ruins Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 7 |
| SQ_07_03 | 48 | Celestine Ruins Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 7 |
| SQ_07_04 | 49 | Celestine Ruins Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 7 |
| SQ_07_05 | 50 | Celestine Ruins Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 7 |
| SQ_07_06 | 51 | Celestine Ruins Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 7 |
| SQ_07_07 | 52 | Celestine Ruins Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 7 |
| SQ_07_08 | 52 | Celestine Ruins Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 7 |


\newpage

## 9.8 Frostpeak Highlands Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_08_01 | 52 | Crown of Winter: Adım 1 | Talk | Frostpeak Highlands içindeki hikâye hedefi 1 | XP tier 8, Gold, story flag MQ_08_01 | MQ_08_01 |
| MQ_08_02 | 53 | Crown of Winter: Adım 2 | Kill | Frostpeak Highlands içindeki hikâye hedefi 2 | XP tier 8, Gold, story flag MQ_08_02 | MQ_08_01 |
| MQ_08_03 | 54 | Crown of Winter: Adım 3 | Collect | Frostpeak Highlands içindeki hikâye hedefi 3 | XP tier 8, Gold, story flag MQ_08_03 | MQ_08_02 |
| MQ_08_04 | 55 | Crown of Winter: Adım 4 | Investigate | Frostpeak Highlands içindeki hikâye hedefi 4 | XP tier 8, Gold, story flag MQ_08_04 | MQ_08_03 |
| MQ_08_05 | 56 | Crown of Winter: Adım 5 | Defend | Frostpeak Highlands içindeki hikâye hedefi 5 | XP tier 8, Gold, story flag MQ_08_05 | MQ_08_04 |
| MQ_08_06 | 57 | Crown of Winter: Adım 6 | Escort | Frostpeak Highlands içindeki hikâye hedefi 6 | XP tier 8, Gold, story flag MQ_08_06 | MQ_08_05 |
| MQ_08_07 | 58 | Crown of Winter: Adım 7 | Activate | Frostpeak Highlands içindeki hikâye hedefi 7 | XP tier 8, Gold, story flag MQ_08_07 | MQ_08_06 |
| MQ_08_08 | 59 | Crown of Winter: Adım 8 | Boss | Frostpeak Highlands içindeki hikâye hedefi 8 | XP tier 8, Gold, story flag MQ_08_08 | MQ_08_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_08_01 | 53 | Frostpeak Highlands Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 8 |
| SQ_08_02 | 54 | Frostpeak Highlands Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 8 |
| SQ_08_03 | 55 | Frostpeak Highlands Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 8 |
| SQ_08_04 | 56 | Frostpeak Highlands Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 8 |
| SQ_08_05 | 57 | Frostpeak Highlands Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 8 |
| SQ_08_06 | 58 | Frostpeak Highlands Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 8 |
| SQ_08_07 | 59 | Frostpeak Highlands Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 8 |
| SQ_08_08 | 59 | Frostpeak Highlands Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 8 |


\newpage

## 9.9 Abyss Gate Quest Package

### Main Story

| ID | Lvl | Title | Type | Objective | Reward | Prereq |
| --- | --- | --- | --- | --- | --- | --- |
| MQ_09_01 | 65 | Eclipse of Astraya: Adım 1 | Talk | Abyss Gate içindeki hikâye hedefi 1 | XP tier 9, Gold, story flag MQ_09_01 | MQ_09_01 |
| MQ_09_02 | 66 | Eclipse of Astraya: Adım 2 | Kill | Abyss Gate içindeki hikâye hedefi 2 | XP tier 9, Gold, story flag MQ_09_02 | MQ_09_01 |
| MQ_09_03 | 67 | Eclipse of Astraya: Adım 3 | Collect | Abyss Gate içindeki hikâye hedefi 3 | XP tier 9, Gold, story flag MQ_09_03 | MQ_09_02 |
| MQ_09_04 | 68 | Eclipse of Astraya: Adım 4 | Investigate | Abyss Gate içindeki hikâye hedefi 4 | XP tier 9, Gold, story flag MQ_09_04 | MQ_09_03 |
| MQ_09_05 | 69 | Eclipse of Astraya: Adım 5 | Defend | Abyss Gate içindeki hikâye hedefi 5 | XP tier 9, Gold, story flag MQ_09_05 | MQ_09_04 |
| MQ_09_06 | 70 | Eclipse of Astraya: Adım 6 | Escort | Abyss Gate içindeki hikâye hedefi 6 | XP tier 9, Gold, story flag MQ_09_06 | MQ_09_05 |
| MQ_09_07 | 71 | Eclipse of Astraya: Adım 7 | Activate | Abyss Gate içindeki hikâye hedefi 7 | XP tier 9, Gold, story flag MQ_09_07 | MQ_09_06 |
| MQ_09_08 | 72 | Eclipse of Astraya: Adım 8 | Boss | Abyss Gate içindeki hikâye hedefi 8 | XP tier 9, Gold, story flag MQ_09_08 | MQ_09_07 |


### Side Quests

| ID | Lvl | Title | Type | Objective | Reward |
| --- | --- | --- | --- | --- | --- |
| SQ_09_01 | 66 | Abyss Gate Yan Görev 1 | Kill | Yan görev objective 1 | Gold + region reputation + material tier 9 |
| SQ_09_02 | 67 | Abyss Gate Yan Görev 2 | Collect | Yan görev objective 2 | Gold + region reputation + material tier 9 |
| SQ_09_03 | 68 | Abyss Gate Yan Görev 3 | Delivery | Yan görev objective 3 | Gold + region reputation + material tier 9 |
| SQ_09_04 | 69 | Abyss Gate Yan Görev 4 | Craft | Yan görev objective 4 | Gold + region reputation + material tier 9 |
| SQ_09_05 | 70 | Abyss Gate Yan Görev 5 | Explore | Yan görev objective 5 | Gold + region reputation + material tier 9 |
| SQ_09_06 | 71 | Abyss Gate Yan Görev 6 | Bounty | Yan görev objective 6 | Gold + region reputation + material tier 9 |
| SQ_09_07 | 72 | Abyss Gate Yan Görev 7 | Event | Yan görev objective 7 | Gold + region reputation + material tier 9 |
| SQ_09_08 | 72 | Abyss Gate Yan Görev 8 | MiniBoss | Yan görev objective 8 | Gold + region reputation + material tier 9 |


\newpage

# 10. NPC Sistemi


NPC veri modeli: npc_id, name, map_id, position, facing, dialogue_tree_id, service_profile, quest_offers, shop_table, faction, affinity. Named NPC için portrait + 4-way turnaround; servis NPC için en az 4-direction sprite.


## 10.1 Dawnwatch Village NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_01_01 | Dawnwatch NPC 1 | Blacksmith | Quest/Service tier 1 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_01_02 | Dawnwatch NPC 2 | Alchemist | Quest/Service tier 1 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_01_03 | Dawnwatch NPC 3 | General Merchant | Quest/Service tier 1 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_01_04 | Dawnwatch NPC 4 | Storage | Quest/Service tier 1 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_01_05 | Dawnwatch NPC 5 | Auctioneer | Quest/Service tier 1 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_01_06 | Dawnwatch NPC 6 | Guild Registrar | Quest/Service tier 1 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_DW_ELRIC | Mayor Elric | Mayor/Story | Unique named NPC | Story/faction | 4-way turnaround + portrait |
| NPC_DW_ROWAN | Smith Rowan | Blacksmith | Unique named NPC | Story/faction | 4-way turnaround + portrait |
| NPC_DW_MINA | Priestess Mina | Healer | Unique named NPC | Story/faction | 4-way turnaround + portrait |
| NPC_DW_LYSA | Scout Lysa | Story/Scout | Unique named NPC | Story/faction | 4-way turnaround + portrait |


## 10.2 Verdant Trail NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_02_01 | Verdant NPC 1 | General Merchant | Quest/Service tier 2 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_02_02 | Verdant NPC 2 | Storage | Quest/Service tier 2 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_02_03 | Verdant NPC 3 | Auctioneer | Quest/Service tier 2 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_02_04 | Verdant NPC 4 | Guild Registrar | Quest/Service tier 2 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_02_05 | Verdant NPC 5 | Class Trainer | Quest/Service tier 2 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_02_06 | Verdant NPC 6 | Stablemaster | Quest/Service tier 2 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |


## 10.3 Moonfen Marsh NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_03_01 | Moonfen NPC 1 | Auctioneer | Quest/Service tier 3 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_03_02 | Moonfen NPC 2 | Guild Registrar | Quest/Service tier 3 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_03_03 | Moonfen NPC 3 | Class Trainer | Quest/Service tier 3 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_03_04 | Moonfen NPC 4 | Stablemaster | Quest/Service tier 3 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_03_05 | Moonfen NPC 5 | Stylist | Quest/Service tier 3 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_03_06 | Moonfen NPC 6 | Healer | Quest/Service tier 3 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |


## 10.4 Ashen Wastes NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_04_01 | Ashen NPC 1 | Class Trainer | Quest/Service tier 4 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_04_02 | Ashen NPC 2 | Stablemaster | Quest/Service tier 4 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_04_03 | Ashen NPC 3 | Stylist | Quest/Service tier 4 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_04_04 | Ashen NPC 4 | Healer | Quest/Service tier 4 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_04_05 | Ashen NPC 5 | Event Manager | Quest/Service tier 4 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_04_06 | Ashen NPC 6 | Faction Officer | Quest/Service tier 4 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |


## 10.5 Ironroot Depths NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_05_01 | Ironroot NPC 1 | Stylist | Quest/Service tier 5 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_05_02 | Ironroot NPC 2 | Healer | Quest/Service tier 5 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_05_03 | Ironroot NPC 3 | Event Manager | Quest/Service tier 5 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_05_04 | Ironroot NPC 4 | Faction Officer | Quest/Service tier 5 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_05_05 | Ironroot NPC 5 | Bounty Board Keeper | Quest/Service tier 5 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_05_06 | Ironroot NPC 6 | Dungeon Guide | Quest/Service tier 5 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |


## 10.6 Sunscar Desert NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_06_01 | Sunscar NPC 1 | Event Manager | Quest/Service tier 6 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_06_02 | Sunscar NPC 2 | Faction Officer | Quest/Service tier 6 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_06_03 | Sunscar NPC 3 | Bounty Board Keeper | Quest/Service tier 6 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_06_04 | Sunscar NPC 4 | Dungeon Guide | Quest/Service tier 6 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_06_05 | Sunscar NPC 5 | Craft Master | Quest/Service tier 6 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_06_06 | Sunscar NPC 6 | Mayor/Story | Quest/Service tier 6 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |


## 10.7 Celestine Ruins NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_07_01 | Celestine NPC 1 | Bounty Board Keeper | Quest/Service tier 7 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_07_02 | Celestine NPC 2 | Dungeon Guide | Quest/Service tier 7 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_07_03 | Celestine NPC 3 | Craft Master | Quest/Service tier 7 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_07_04 | Celestine NPC 4 | Mayor/Story | Quest/Service tier 7 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_07_05 | Celestine NPC 5 | Blacksmith | Quest/Service tier 7 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_07_06 | Celestine NPC 6 | Alchemist | Quest/Service tier 7 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |


## 10.8 Frostpeak Highlands NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_08_01 | Frostpeak NPC 1 | Craft Master | Quest/Service tier 8 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_08_02 | Frostpeak NPC 2 | Mayor/Story | Quest/Service tier 8 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_08_03 | Frostpeak NPC 3 | Blacksmith | Quest/Service tier 8 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_08_04 | Frostpeak NPC 4 | Alchemist | Quest/Service tier 8 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_08_05 | Frostpeak NPC 5 | General Merchant | Quest/Service tier 8 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_08_06 | Frostpeak NPC 6 | Storage | Quest/Service tier 8 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |


## 10.9 Abyss Gate NPCs

| ID | Name | Role | Service/Quest | Affinity | Art |
| --- | --- | --- | --- | --- | --- |
| NPC_09_01 | Abyss NPC 1 | Blacksmith | Quest/Service tier 9 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_09_02 | Abyss NPC 2 | Alchemist | Quest/Service tier 9 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_09_03 | Abyss NPC 3 | General Merchant | Quest/Service tier 9 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_09_04 | Abyss NPC 4 | Storage | Quest/Service tier 9 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_09_05 | Abyss NPC 5 | Auctioneer | Quest/Service tier 9 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_09_06 | Abyss NPC 6 | Guild Registrar | Quest/Service tier 9 | Affinity unlock at 20/50/80 | Front/back/left/right turnaround required |
| NPC_AB_VEYA | Oracle Veya | Raid/Story | Unique named NPC | Story/faction | 4-way turnaround + portrait |
| NPC_AB_MIRR | Shade Broker Mirr | Endgame Vendor | Unique named NPC | Story/faction | 4-way turnaround + portrait |


\newpage
# 11. Monsters, Farm Slotları ve Bosslar


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Concept_Art/monster_boss_concept.png){ width=96% }


## 11.1 Dawnwatch Village

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_01_01 | Field Boar | 1 | Normal | 138 | 16 | 1.0 | LootTable_DAW_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_01_02 | Thistle Rat | 2 | Normal | 456 | 36 | 1.0 | LootTable_DAW_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_01_03 | Young Crow | 3 | Normal | 658 | 59 | 1.0 | LootTable_DAW_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_01_04 | Training Slime | 4 | Normal | 1183 | 84 | 1.0 | LootTable_DAW_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_01_05 | Bandit Scout | 5 | Normal | 1890 | 110 | 1.0 | LootTable_DAW_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_01_06 | Rogue Hound | 6 | Normal | 1928 | 137 | 1.0 | LootTable_DAW_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_01_07 | Broken Scarecrow | 7 | Elite | 2816 | 165 | 2.5 | LootTable_DAW_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_01_08 | Wild Ram | 8 | Elite | 3916 | 194 | 2.5 | LootTable_DAW_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_01_09 | Copper Beetle | 9 | Elite | 3616 | 223 | 2.5 | LootTable_DAW_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_01_10 | Garrick Thug | 10 | Elite | 4896 | 253 | 2.5 | LootTable_DAW_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.2 Verdant Trail

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_02_01 | Forest Wolf | 5 | Normal | 1672 | 110 | 1.0 | LootTable_VER_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_02_02 | Briar Entling | 6 | Normal | 2507 | 137 | 1.0 | LootTable_VER_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_02_03 | Vine Stalker | 8 | Normal | 3012 | 194 | 1.0 | LootTable_VER_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_02_04 | Mossling | 10 | Normal | 4896 | 253 | 1.0 | LootTable_VER_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_02_05 | Thorn Archer | 11 | Normal | 6416 | 284 | 1.0 | LootTable_VER_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_02_06 | Sap Golem | 13 | Normal | 6394 | 347 | 1.0 | LootTable_VER_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_02_07 | Horned Doe Spirit | 15 | Elite | 9179 | 412 | 2.5 | LootTable_VER_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_02_08 | Root Snake | 16 | Elite | 11468 | 445 | 2.5 | LootTable_VER_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_02_09 | Bramble Boar | 18 | Elite | 10588 | 513 | 2.5 | LootTable_VER_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_02_10 | Bloom Wisp | 20 | Elite | 14337 | 582 | 2.5 | LootTable_VER_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.3 Moonfen Marsh

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_03_01 | Bog Skeleton | 20 | Normal | 14337 | 582 | 1.0 | LootTable_MOO_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_03_02 | Mire Horror | 21 | Normal | 17480 | 617 | 1.0 | LootTable_MOO_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_03_03 | Marsh Leech | 22 | Normal | 14452 | 653 | 1.0 | LootTable_MOO_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_03_04 | Wisp Toad | 23 | Normal | 17805 | 688 | 1.0 | LootTable_MOO_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_03_05 | Ghast Ferryman | 24 | Normal | 21500 | 725 | 1.0 | LootTable_MOO_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_03_06 | Coffin Crab | 25 | Normal | 17619 | 761 | 1.0 | LootTable_MOO_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_03_07 | Blight Witchling | 26 | Elite | 21532 | 798 | 2.5 | LootTable_MOO_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_03_08 | Swamp Crow | 27 | Elite | 25807 | 835 | 2.5 | LootTable_MOO_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_03_09 | Rotfang Hound | 28 | Elite | 21002 | 872 | 2.5 | LootTable_MOO_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_03_10 | Lantern Shade | 30 | Elite | 26879 | 947 | 2.5 | LootTable_MOO_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.4 Ashen Wastes

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_04_01 | Ash Raider | 25 | Normal | 20262 | 761 | 1.0 | LootTable_ASH_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_04_02 | Ember Hound | 26 | Normal | 24340 | 798 | 1.0 | LootTable_ASH_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_04_03 | Cinder Golem | 27 | Normal | 19851 | 835 | 1.0 | LootTable_ASH_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_04_04 | Scorch Hawk | 29 | Normal | 25503 | 909 | 1.0 | LootTable_ASH_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_04_05 | Flame Sentry | 30 | Normal | 30385 | 947 | 1.0 | LootTable_ASH_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_04_06 | Molten Miner | 32 | Normal | 25832 | 1023 | 1.0 | LootTable_ASH_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_04_07 | Ash Priest | 33 | Elite | 31158 | 1062 | 2.5 | LootTable_ASH_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_04_08 | Char Wyrm | 35 | Elite | 38586 | 1140 | 2.5 | LootTable_ASH_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_04_09 | Lava Slime | 36 | Elite | 31006 | 1179 | 2.5 | LootTable_ASH_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_04_10 | Cinder Revenant | 38 | Elite | 38774 | 1258 | 2.5 | LootTable_ASH_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.5 Ironroot Depths

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_05_01 | Cave Creeper | 32 | Normal | 29707 | 1023 | 1.0 | LootTable_IRO_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_05_02 | Chitin Stalker | 33 | Normal | 35222 | 1062 | 1.0 | LootTable_IRO_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_05_03 | Rootling | 34 | Normal | 28377 | 1101 | 1.0 | LootTable_IRO_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_05_04 | Crystal Beetle | 36 | Normal | 35657 | 1179 | 1.0 | LootTable_IRO_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_05_05 | Glowcap Sprite | 37 | Normal | 42056 | 1218 | 1.0 | LootTable_IRO_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_05_06 | Tunnel Worm | 39 | Normal | 35101 | 1298 | 1.0 | LootTable_IRO_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_05_07 | Hive Tender | 40 | Elite | 41982 | 1338 | 2.5 | LootTable_IRO_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_05_08 | Brood Guard | 42 | Elite | 51187 | 1419 | 2.5 | LootTable_IRO_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_05_09 | Fungal Brute | 43 | Elite | 40837 | 1459 | 2.5 | LootTable_IRO_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_05_10 | Resin Golem | 45 | Elite | 50391 | 1541 | 2.5 | LootTable_IRO_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.6 Sunscar Desert

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_06_01 | Sand Raider | 38 | Normal | 38774 | 1258 | 1.0 | LootTable_SUN_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_06_02 | Scorpion Brute | 39 | Normal | 45632 | 1298 | 1.0 | LootTable_SUN_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_06_03 | Mirage Stalker | 40 | Normal | 36506 | 1338 | 1.0 | LootTable_SUN_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_06_04 | Dust Djinn | 42 | Normal | 45280 | 1419 | 1.0 | LootTable_SUN_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_06_05 | Sun Vulture | 43 | Normal | 53088 | 1459 | 1.0 | LootTable_SUN_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_06_06 | Ruin Sentinel | 44 | Normal | 42318 | 1500 | 1.0 | LootTable_SUN_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_06_07 | Bone Nomad | 46 | Elite | 52137 | 1582 | 2.5 | LootTable_SUN_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_06_08 | Dune Spider | 47 | Elite | 60936 | 1624 | 2.5 | LootTable_SUN_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_06_09 | Sand Wyrm | 48 | Elite | 48428 | 1665 | 2.5 | LootTable_SUN_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_06_10 | Obelisk Shade | 50 | Elite | 59331 | 1749 | 2.5 | LootTable_SUN_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.7 Celestine Ruins

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_07_01 | Arcane Sentinel | 45 | Normal | 50391 | 1541 | 1.0 | LootTable_CEL_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_07_02 | Fallen Acolyte | 46 | Normal | 58938 | 1582 | 1.0 | LootTable_CEL_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_07_03 | Halo Wraith | 47 | Normal | 46874 | 1624 | 1.0 | LootTable_CEL_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_07_04 | Ether Sprite | 49 | Normal | 57502 | 1707 | 1.0 | LootTable_CEL_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_07_05 | Starbound Golem | 50 | Normal | 67069 | 1749 | 1.0 | LootTable_CEL_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_07_06 | Rune Keeper | 52 | Normal | 54825 | 1833 | 1.0 | LootTable_CEL_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_07_07 | Null Priest | 53 | Elite | 64939 | 1876 | 2.5 | LootTable_CEL_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_07_08 | Sky Drake | 55 | Elite | 77747 | 1961 | 2.5 | LootTable_CEL_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_07_09 | Lumen Wisp | 56 | Elite | 61499 | 2004 | 2.5 | LootTable_CEL_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_07_10 | Broken Arbiter | 58 | Elite | 74677 | 2090 | 2.5 | LootTable_CEL_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.8 Frostpeak Highlands

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_08_01 | Frost Wolf | 52 | Normal | 63049 | 1833 | 1.0 | LootTable_FRO_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_08_02 | Glacial Troll | 54 | Normal | 75567 | 1918 | 1.0 | LootTable_FRO_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_08_03 | Ice Harpy | 56 | Normal | 61499 | 2004 | 1.0 | LootTable_FRO_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_08_04 | Snowbound Knight | 58 | Normal | 74677 | 2090 | 1.0 | LootTable_FRO_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_08_05 | Rime Elemental | 60 | Normal | 88973 | 2177 | 1.0 | LootTable_FRO_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_08_06 | Avalanche Goat | 62 | Normal | 72009 | 2264 | 1.0 | LootTable_FRO_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_08_07 | Temple Warden | 64 | Elite | 86987 | 2352 | 2.5 | LootTable_FRO_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_08_08 | Ice Drake | 66 | Elite | 103137 | 2441 | 2.5 | LootTable_FRO_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_08_09 | Snow Wraith | 68 | Elite | 83094 | 2530 | 2.5 | LootTable_FRO_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_08_10 | Frozen Giant | 70 | Elite | 99949 | 2619 | 2.5 | LootTable_FRO_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.9 Abyss Gate

| ID | Monster | Lvl | Tier | HP | ATK | XP x | Loot | AI | Art |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MON_09_01 | Abyss Hound | 65 | Normal | 89103 | 2396 | 1.0 | LootTable_ABY_01 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_09_02 | Voidfiend | 68 | Normal | 108022 | 2530 | 1.0 | LootTable_ABY_02 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_09_03 | Fallen Seraph | 72 | Normal | 90791 | 2709 | 1.0 | LootTable_ABY_03 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_09_04 | Eclipse Cultist | 76 | Normal | 113537 | 2891 | 1.0 | LootTable_ABY_04 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_09_05 | Star Eater | 80 | Normal | 138967 | 3074 | 1.0 | LootTable_ABY_05 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_09_06 | Rift Crawler | 84 | Normal | 115295 | 3260 | 1.0 | LootTable_ABY_06 | AI_Basic | Front/side/back + attack/hit/death sprite |
| MON_09_07 | Null Apostle | 88 | Elite | 142504 | 3447 | 2.5 | LootTable_ABY_07 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_09_08 | Void Golem | 92 | Elite | 172582 | 3636 | 2.5 | LootTable_ABY_08 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_09_09 | Black Halo Wraith | 96 | Elite | 141808 | 3826 | 2.5 | LootTable_ABY_09 | AI_Elite | Front/side/back + attack/hit/death sprite |
| MON_09_10 | Malzor Hand | 100 | Elite | 173731 | 4019 | 2.5 | LootTable_ABY_10 | AI_Elite | Front/side/back + attack/hit/death sprite |


## 11.10 Boss Catalogue

| ID | Boss | Region | Lvl | Type | Ability Package |
| --- | --- | --- | --- | --- | --- |
| BOSS_01 | Thornmaw | Verdant Trail | 20 | World Boss | Root slam,Vine prison,Seed burst,Add summon,Enrage |
| BOSS_02 | Grave-Mother Nereza | Moonfen Marsh | 30 | World Boss | Soul drain,Lantern adds,Curse stacks,Mist phase,Wail |
| BOSS_03 | Forge-Eater Golm | Ashen Wastes | 38 | World Boss | Magma slam,Vents,Chain drag,Armor phase,Overheat |
| BOSS_04 | Hive Queen Velkra | Ironroot Depths | 45 | Dungeon Boss | Web zones,Eggs,Cocoon,Venom cone,Frenzy |
| BOSS_05 | Dune Tyrant Khar | Sunscar Desert | 50 | World Boss | Burrow,Sand surge,Tail sweep,Mirage split,Collapse |
| BOSS_06 | Arbiter of Halos | Celestine Ruins | 58 | Dungeon Boss | Rune sequence,Seal burst,Beam,Cage,Halo collapse |
| BOSS_07 | Icefang Matriarch | Frostpeak Highlands | 70 | World Boss | Frost breath,Spear rain,Blizzard,Nest call,Frozen Moon |
| BOSS_08 | Gate Herald Xyron | Abyss Gate | 80 | Dungeon Boss | Void lash,Rift bloom,Sanity breach,Orbital ruin,Dark horizon |
| BOSS_09 | Eclipse Seraph Malzor | Abyss Gate | 100 | Raid Final | Gravity spear,Eclipse nova,Starfall,LightDark shift,Broken choir,Second Dawn |


### Farm Slot Tasarım Kuralı

Her field map 4 farm slotuna ayrılır: düşük yoğunluk solo, hızlı respawn AoE, elite duo/group, resource hybrid. Spawn controller oyuncu yoğunluğuna göre +-%20 popülasyon ölçekleyebilir. Aynı spawn node üzerinde 3 saniyeden kısa respawn yasaktır.

\newpage

# 12. Dungeon ve Raid Tasarımı


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Concept_Art/dungeon_ui_concept.png){ width=96% }


| Instance | Lvl | Players | Final Boss | Mechanics |
| --- | --- | --- | --- | --- |
| Rootbound Den | 20 | 4 | Elder Treant | Roots, bridges, spores |
| Blackfen Ossuary | 28 | 4 | Drowned Bishop | Curse, lantern, adds |
| Emberforge Bastion | 35 | 4 | Kragmar the Molten | Heat, vents, hammer traps |
| Temple of Shifting Sand | 42 | 4 | Seraphim of Dunes | Moving rooms, mirage |
| Hive of Ironroot | 48 | 4 | Queen Velkra | Eggs, web, cocoon |
| Frostveil Citadel | 55 | 4 | Lady Veylthra | Freeze stacks, ice clones |
| Celestine Vault | 60 | 4 | Arbiter of Halos | Runes, beams, cages |
| Abyss Gate Breach | 70 | 4 | Gate Herald Xyron | Rifts, sanity, void zones |
| Eclipse Cathedral | 85 | 8 | Malzor | 6-boss raid wing, light/dark |
| Citadel of Second Dawn | 95 | 12 | Twin Oracles | Time loop raid |


Difficulty: Normal, Veteran, Heroic, Mythic. Mythic haftalık affix: Volcanic, Grievous, Echoing, Tyrannical, Swarming, Null Magic gibi modlar.

\newpage

# 13. Crafting, Gathering ve Ekonomi


Meslekler: Blacksmithing, Leatherworking, Tailoring, Alchemy, Enchanting, Cooking, Jewelcrafting. Gathering: Mining, Herbalism, Logging, Skinning, Relic Hunting. Auction House %5 listing + %4 sale tax gold sink kullanır. Repair, enhancement, travel ve reroll diğer ana gold sinklerdir.


| ID | Recipe | Profession | Lvl | Ingredients | Output | Gold |
| --- | --- | --- | --- | --- | --- | --- |
| REC_001 | Leatherworking Recipe 1 | Leatherworking | 1 | Material_A x 2; Material_B x 4 | CraftedItem_001 | 13 |
| REC_002 | Tailoring Recipe 2 | Tailoring | 11 | Material_A x 3; Material_B x 1 | CraftedItem_002 | 16 |
| REC_003 | Alchemy Recipe 3 | Alchemy | 21 | Material_A x 4; Material_B x 2 | CraftedItem_003 | 19 |
| REC_004 | Enchanting Recipe 4 | Enchanting | 31 | Material_A x 5; Material_B x 3 | CraftedItem_004 | 22 |
| REC_005 | Cooking Recipe 5 | Cooking | 41 | Material_A x 1; Material_B x 4 | CraftedItem_005 | 25 |
| REC_006 | Jewelcrafting Recipe 6 | Jewelcrafting | 51 | Material_A x 2; Material_B x 1 | CraftedItem_006 | 28 |
| REC_007 | Blacksmithing Recipe 7 | Blacksmithing | 61 | Material_A x 3; Material_B x 2 | CraftedItem_007 | 31 |
| REC_008 | Leatherworking Recipe 8 | Leatherworking | 71 | Material_A x 4; Material_B x 3 | CraftedItem_008 | 34 |
| REC_009 | Tailoring Recipe 9 | Tailoring | 81 | Material_A x 5; Material_B x 4 | CraftedItem_009 | 37 |
| REC_010 | Alchemy Recipe 10 | Alchemy | 91 | Material_A x 1; Material_B x 1 | CraftedItem_010 | 40 |
| REC_011 | Enchanting Recipe 11 | Enchanting | 1 | Material_A x 2; Material_B x 2 | CraftedItem_011 | 43 |
| REC_012 | Cooking Recipe 12 | Cooking | 11 | Material_A x 3; Material_B x 3 | CraftedItem_012 | 46 |
| REC_013 | Jewelcrafting Recipe 13 | Jewelcrafting | 21 | Material_A x 4; Material_B x 4 | CraftedItem_013 | 49 |
| REC_014 | Blacksmithing Recipe 14 | Blacksmithing | 31 | Material_A x 5; Material_B x 1 | CraftedItem_014 | 52 |
| REC_015 | Leatherworking Recipe 15 | Leatherworking | 41 | Material_A x 1; Material_B x 2 | CraftedItem_015 | 55 |
| REC_016 | Tailoring Recipe 16 | Tailoring | 51 | Material_A x 2; Material_B x 3 | CraftedItem_016 | 58 |
| REC_017 | Alchemy Recipe 17 | Alchemy | 61 | Material_A x 3; Material_B x 4 | CraftedItem_017 | 61 |
| REC_018 | Enchanting Recipe 18 | Enchanting | 71 | Material_A x 4; Material_B x 1 | CraftedItem_018 | 64 |
| REC_019 | Cooking Recipe 19 | Cooking | 81 | Material_A x 5; Material_B x 2 | CraftedItem_019 | 67 |
| REC_020 | Jewelcrafting Recipe 20 | Jewelcrafting | 91 | Material_A x 1; Material_B x 3 | CraftedItem_020 | 70 |

\newpage

| ID | Recipe | Profession | Lvl | Ingredients | Output | Gold |
| --- | --- | --- | --- | --- | --- | --- |
| REC_021 | Blacksmithing Recipe 21 | Blacksmithing | 1 | Material_A x 2; Material_B x 4 | CraftedItem_021 | 73 |
| REC_022 | Leatherworking Recipe 22 | Leatherworking | 11 | Material_A x 3; Material_B x 1 | CraftedItem_022 | 76 |
| REC_023 | Tailoring Recipe 23 | Tailoring | 21 | Material_A x 4; Material_B x 2 | CraftedItem_023 | 79 |
| REC_024 | Alchemy Recipe 24 | Alchemy | 31 | Material_A x 5; Material_B x 3 | CraftedItem_024 | 82 |
| REC_025 | Enchanting Recipe 25 | Enchanting | 41 | Material_A x 1; Material_B x 4 | CraftedItem_025 | 85 |
| REC_026 | Cooking Recipe 26 | Cooking | 51 | Material_A x 2; Material_B x 1 | CraftedItem_026 | 88 |
| REC_027 | Jewelcrafting Recipe 27 | Jewelcrafting | 61 | Material_A x 3; Material_B x 2 | CraftedItem_027 | 91 |
| REC_028 | Blacksmithing Recipe 28 | Blacksmithing | 71 | Material_A x 4; Material_B x 3 | CraftedItem_028 | 94 |
| REC_029 | Leatherworking Recipe 29 | Leatherworking | 81 | Material_A x 5; Material_B x 4 | CraftedItem_029 | 97 |
| REC_030 | Tailoring Recipe 30 | Tailoring | 91 | Material_A x 1; Material_B x 1 | CraftedItem_030 | 100 |
| REC_031 | Alchemy Recipe 31 | Alchemy | 1 | Material_A x 2; Material_B x 2 | CraftedItem_031 | 103 |
| REC_032 | Enchanting Recipe 32 | Enchanting | 11 | Material_A x 3; Material_B x 3 | CraftedItem_032 | 106 |
| REC_033 | Cooking Recipe 33 | Cooking | 21 | Material_A x 4; Material_B x 4 | CraftedItem_033 | 109 |
| REC_034 | Jewelcrafting Recipe 34 | Jewelcrafting | 31 | Material_A x 5; Material_B x 1 | CraftedItem_034 | 112 |
| REC_035 | Blacksmithing Recipe 35 | Blacksmithing | 41 | Material_A x 1; Material_B x 2 | CraftedItem_035 | 115 |
| REC_036 | Leatherworking Recipe 36 | Leatherworking | 51 | Material_A x 2; Material_B x 3 | CraftedItem_036 | 118 |
| REC_037 | Tailoring Recipe 37 | Tailoring | 61 | Material_A x 3; Material_B x 4 | CraftedItem_037 | 121 |
| REC_038 | Alchemy Recipe 38 | Alchemy | 71 | Material_A x 4; Material_B x 1 | CraftedItem_038 | 124 |
| REC_039 | Enchanting Recipe 39 | Enchanting | 81 | Material_A x 5; Material_B x 2 | CraftedItem_039 | 127 |
| REC_040 | Cooking Recipe 40 | Cooking | 91 | Material_A x 1; Material_B x 3 | CraftedItem_040 | 130 |

\newpage

| ID | Recipe | Profession | Lvl | Ingredients | Output | Gold |
| --- | --- | --- | --- | --- | --- | --- |
| REC_041 | Jewelcrafting Recipe 41 | Jewelcrafting | 1 | Material_A x 2; Material_B x 4 | CraftedItem_041 | 133 |
| REC_042 | Blacksmithing Recipe 42 | Blacksmithing | 11 | Material_A x 3; Material_B x 1 | CraftedItem_042 | 136 |
| REC_043 | Leatherworking Recipe 43 | Leatherworking | 21 | Material_A x 4; Material_B x 2 | CraftedItem_043 | 139 |
| REC_044 | Tailoring Recipe 44 | Tailoring | 31 | Material_A x 5; Material_B x 3 | CraftedItem_044 | 142 |
| REC_045 | Alchemy Recipe 45 | Alchemy | 41 | Material_A x 1; Material_B x 4 | CraftedItem_045 | 145 |
| REC_046 | Enchanting Recipe 46 | Enchanting | 51 | Material_A x 2; Material_B x 1 | CraftedItem_046 | 148 |
| REC_047 | Cooking Recipe 47 | Cooking | 61 | Material_A x 3; Material_B x 2 | CraftedItem_047 | 151 |
| REC_048 | Jewelcrafting Recipe 48 | Jewelcrafting | 71 | Material_A x 4; Material_B x 3 | CraftedItem_048 | 154 |
| REC_049 | Blacksmithing Recipe 49 | Blacksmithing | 81 | Material_A x 5; Material_B x 4 | CraftedItem_049 | 157 |
| REC_050 | Leatherworking Recipe 50 | Leatherworking | 91 | Material_A x 1; Material_B x 1 | CraftedItem_050 | 160 |
| REC_051 | Tailoring Recipe 51 | Tailoring | 1 | Material_A x 2; Material_B x 2 | CraftedItem_051 | 163 |
| REC_052 | Alchemy Recipe 52 | Alchemy | 11 | Material_A x 3; Material_B x 3 | CraftedItem_052 | 166 |
| REC_053 | Enchanting Recipe 53 | Enchanting | 21 | Material_A x 4; Material_B x 4 | CraftedItem_053 | 169 |
| REC_054 | Cooking Recipe 54 | Cooking | 31 | Material_A x 5; Material_B x 1 | CraftedItem_054 | 172 |
| REC_055 | Jewelcrafting Recipe 55 | Jewelcrafting | 41 | Material_A x 1; Material_B x 2 | CraftedItem_055 | 175 |
| REC_056 | Blacksmithing Recipe 56 | Blacksmithing | 51 | Material_A x 2; Material_B x 3 | CraftedItem_056 | 178 |
| REC_057 | Leatherworking Recipe 57 | Leatherworking | 61 | Material_A x 3; Material_B x 4 | CraftedItem_057 | 181 |
| REC_058 | Tailoring Recipe 58 | Tailoring | 71 | Material_A x 4; Material_B x 1 | CraftedItem_058 | 184 |
| REC_059 | Alchemy Recipe 59 | Alchemy | 81 | Material_A x 5; Material_B x 2 | CraftedItem_059 | 187 |
| REC_060 | Enchanting Recipe 60 | Enchanting | 91 | Material_A x 1; Material_B x 3 | CraftedItem_060 | 190 |

\newpage

# 14. Party, Guild, Social ve PvP


## Party
4-player standard party. Role preference: tank/healer/DPS. Loot modes: personal loot default, need/greed optional for premade.

## Guild
Guild level 1-20, permission roles, contribution, weekly missions, guild storage, banner, guild hall future expansion.

## PvP
- Duel
- Ranked 3v3
- 10v10 objective battleground
- Limited event open-world PvP

PvP uses separate coefficient layer; CC duration caps and healing dampening apply. Gear normalization can be used in ranked arena.

## Chat
General, Party, Guild, Trade, LookingForGroup, Whisper, System, Event. Spam rate limiting and block/report tools required.


\newpage
# 15. Cash Shop, Premium Currency ve Battle Pass


![](/mnt/data/ASTRAYA_2D_MMO_COMPLETE_PROJECT/12_ASSETS/Concept_Art/costume_cosmetic_concept.png){ width=96% }


| Shop ID | Name | Category | Price | Policy | Duration |
| --- | --- | --- | --- | --- | --- |
| CS_001 | Knight Celestial Guardian Costume | Costume | 1200 | Cosmetic | Permanent |
| CS_002 | Berserker Crimson King Costume | Costume | 1200 | Cosmetic | Permanent |
| CS_003 | Assassin Moonlight Huntress Costume | Costume | 1200 | Cosmetic | Permanent |
| CS_004 | Ranger Flower Fairy Costume | Costume | 1200 | Cosmetic | Permanent |
| CS_005 | Mage Cosmic Oracle Costume | Costume | 1200 | Cosmetic | Permanent |
| CS_006 | Priest Divine Harmony Costume | Costume | 1200 | Cosmetic | Permanent |
| CS_010 | Spectral Stag Mount | Mount | 900 | Cosmetic | Permanent |
| CS_011 | Desert Drake Mount | Mount | 1100 | Cosmetic | Permanent |
| CS_020 | Inventory +24 Slots | Convenience | 500 | Account Utility | Permanent |
| CS_021 | Storage Tab | Convenience | 450 | Account Utility | Permanent |
| CS_030 | Season Premium Pass | BattlePass | 1000 | Seasonal Cosmetics | Season |
| CS_040 | Name Change | Service | 400 | Service | One use |


**Monetization rule:** Raid veya PvP gücü doğrudan satılmaz. Premium costume, mount, pet, emote, aura, storage/inventory convenience ve services satılır. Battle Pass ana ödülleri cosmetics + seasonal currency olur.

\newpage

# 16. UI/UX Sistemi


HUD: player frame, target frame, skill hotbar, resource bar, minimap, quest tracker, party frames, buff/debuff. Menüler: Inventory, Character, Skills, Mastery, Quest Log, World Map, Crafting, Auction, Guild, Friends, Mail, Achievements, Cash Shop, Settings. Tooltips server item definition + instance affix verisini birleştirir.


# 17. Asset ve Art Production Standardı


Final art için her playable class: 4-direction turnaround, 96x96 frame, equipment overlay katmanları, 8-frame idle/run, attack/skill/hit/death animasyonları. Normal moblar en az 4 yön; bosslar concept front/back/side + arena keyframe + telegraph sheet. Haritalar 48x48 tile standardı ve separate collision layer kullanır. ZIP içindeki PNG dosyaları concept/placeholder referanstır.


# 18. Teknik Mimari




# Server Modules
- AuthService
- CharacterService
- WorldService
- MapInstanceService
- CombatService (authoritative)
- SkillService
- QuestService
- LootService
- InventoryService
- CraftingService
- AuctionService
- GuildService
- ChatService
- MatchmakingService
- DungeonService
- RaidService
- CashShopService
- LiveOpsService

# Networking Rules
Movement client-predicted, server-reconciled. Damage, loot, quest completion, currency and item mutations are server authoritative.


## 18.1 Veri Tabloları

Account, Character, InventoryItem, SkillState, QuestState, NPC, MapZone, Monster, DungeonInstance, Guild, AuctionListing, CashShopEntry. Persisted mutations server authoritative olur.

## 18.2 Anti-Cheat / Exploit

Movement speed validation, teleport threshold, server-side damage calculation, inventory transaction idempotency, trade lock, auction escrow, duplicate item instance detection, suspicious farming analytics, GM audit logs.


# 19. Live Ops, Daily/Weekly ve Endgame

Daily: bounty x3, dungeon x1, gathering contract, event quest. Weekly: world boss chest, raid lockout, guild mission, PvP cap. Seasonal: battle pass, new affix rotation, cosmetic set, story epilogue, leaderboard.


# 20. Production Roadmap

| Phase | Scope | Exit Criteria |
| --- | --- | --- |
| Prototype | Movement, targeting, 2 classes, 1 blockout | Combat feel approved |
| Vertical Slice | Dawnwatch + Verdant, 4 classes, dungeon | 15-20 min polished loop |
| Alpha | 6 classes, 6 regions, economy/social basics | Persistent server stable |
| Beta | 9 regions, 8 dungeons, raid, shop | Content/balance ready |
| Launch | Lvl100, 2 raids, live ops | Operations + support ready |


# 21. Machine-readable Dosyalar

Bu PDF ile birlikte teslim edilen proje klasöründeki CSV/JSON/SQL dosyaları oyun verisinin kaynak tablolarıdır. Skill coefficient, quest ID, item ID, NPC ID ve map ID değerleri kod içinde sabit yazılmamalı; data-driven içerik olarak yüklenmelidir.
