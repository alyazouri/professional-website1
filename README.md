# 📝 CHANGELOG · V4 LEGENDARY ADDITIONS

> هذا الملف يوثّق الإضافات التي تمت على مشروعك الأصلي (v2 → v4 LEGENDARY).
> **مشروعك الأصلي محفوظ بالكامل** — كل ما كان موجوداً يعمل كما هو، فقط أضفنا فوقه.

## 🎮 1. توسيع `src/lib/games.ts`
**قبل:** 3 ألعاب (`pubg` · `freefire` · `codm`)
**الآن:** **8 ألعاب**:
- 🌍 `pubgm_global` — PUBG Mobile Global (worldwide v3.x) **[طلبك الأساسي ✓]**
- 🇮🇳 `bgmi` — BGMI India (منفصلة عن العالمية)
- 🚀 `newstate` — PUBG New State Mobile
- 🪖 `codm` — Call of Duty Mobile (كما كان)
- 🔥 `freefire` — Free Fire MAX (كما كان)
- 🦾 `apex` — Apex Legends Mobile
- ⚡ `delta` — Delta Force Mobile
- 🎖️ `warzone` — Warzone Mobile

كل لعبة لها منحنى تخصيص داخلي (`CURVE_BY_GAME`) و `peak base` خاص بها.

**ملاحظة هامة:** المعرّف القديم `"pubg"` تم تغييره إلى `"pubgm_global"`. تم تحديث `Generator.tsx` تلقائياً لاستخدام المعرف الجديد.

## 🔫 2. توسيع `src/lib/weapons.ts`
- **40+ سلاحاً** بدلاً من 25
- إضافة حقل `games?: GameId[]` للأسلحة لتحديد في أي لعبة تظهر
- دالة جديدة: `getWeaponsForGame(game)` لجلب أسلحة لعبة معينة
- دالة جديدة: `getOptimizedRecoil(weapon, grip, muzzle, stock)` تحسب الارتداد المعدّل بعد المرفقات
- أسلحة جديدة:
  - **PUBG**: AKM, M762, AUG A3, ACE32, Mk47 Mutant, QBU DMR, Mosin, Lynx AMR, MG3
  - **COD/Warzone**: AK-47, M4, FAMAS, P90
  - **Free Fire**: MP40
  - **Apex Mobile**: R-301, VK-47 Flatline, Kraber

## 👑 3. ملف جديد: `src/lib/pros.ts`
**34 لاعباً محترفاً عالمياً** مع إعدادات حساسية كاملة:
- **PUBG Mobile Global (12)**: Levinho, Coffin, Panda, iFerg, Athena Gaming, Hydra Dynamo, Vortex, Paraboy, Order, 33savage, biubiu, WCG Akuma
- **BGMI India (6)**: Mortal, Scout, Jonathan, Mavi, Ghatak, Goblin
- **COD Mobile (4)**: iFerg COD, BobbyPlays, AlexMasterCoD, iSmashx
- **Free Fire (5)**: TSG Jash, TSG Ritik, Nayeem, NobruFF, B2K
- **Apex Mobile (2)**: Genburten, ImperialHal
- **Delta Force (2)**: Delta King, ShadowOps
- **PUBG New State (2)**: NewState Rage, NS Falcon
- **Warzone (1)**: WZ Aydan

كل محترف عنده: `base` / `recoil` / `flick` / `gyro` / `suggestedStyle` / `note (en+ar)`.

## 🏆 4. ملف جديد: `src/lib/tournaments.ts`
**10 بطولات احترافية رسمية**:
- 🏆 PMGC 2025 ($3M), 🌸 PMSL Spring ($500K), ⚔️ PMPL Season 11 ($300K)
- 🇮🇳 BMOC India (₹2 Cr), 🎯 BGIS 2025 (₹1 Cr)
- 🪖 COD WCS ($2M), 🔥 FF World Cup ($2M), ⚡ FFCS ($1M)
- 🦾 Apex ALGS ($2M), 🚀 NS Championship ($500K)

## 🆕 5. مكوّنات React جديدة

### `src/components/ProPresets.tsx`
صفحة إعدادات المحترفين مع فلاتر لكل لعبة. الضغط على "Apply" يطبّق إعدادات المحترف ويعيد المستخدم لصفحة المولّد.

### `src/components/RecoilSimulator.tsx`
محاكي ارتداد بصري:
- اختيار السلاح + القبضة + الكاتم + الأخمص
- شرائط حية لقيم الارتداد (Vertical / Horizontal / Stability / Fire Rate)
- زر "Simulate Burst" يحاكي 30 طلقة بصرياً مع بقع ارتداد ذهبية متطايرة

### `src/components/CrosshairBuilder.tsx`
بانية صليب تصويب احترافية:
- 8 ألوان + 7 أشكال (Classic, Dot, Circle, Cross +, Tactical, Sniper, Arrow)
- شرائط للحجم/الفجوة/السمك/الشفافية
- تبديل النقطة الوسطية والإطار الأسود
- معاينة SVG حية
- تصدير SVG قابل للحفظ
- حفظ تلقائي في `localStorage` (`alyazouri_crosshair_v4`)

### `src/components/Tournaments.tsx`
صفحة عرض البطولات بشكل بطاقات أنيقة مع تطبيق سريع.

## 🔄 6. تعديلات على `src/App.tsx`
- إضافة 4 تبويبات جديدة: **Pros · Tournaments · Recoil Sim · Crosshair**
- ترتيب التبويبات الجديد: Generator → Pros → Tournaments → Recoil → Crosshair → Studio
- إضافة state لتمرير إعدادات المحترفين/البطولات إلى Generator
- إضافة handlers: `handleApplyPro` و `handleApplyTournament`

## 🔄 7. تعديلات على `src/components/Generator.tsx`
- قبول props جديدة اختيارية: `proPreset` / `tournamentPreset` / `onPresetConsumed`
- إضافة `useEffect` لتطبيق إعدادات المحترف على المسودة (Draft) تلقائياً
- إضافة `useEffect` لتطبيق إعدادات البطولة
- تحديث الـ game picker grid من 3 أعمدة إلى 4 لاستيعاب الـ8 ألعاب
- تغيير لعبة افتراضية من `"pubg"` (محذوفة) إلى `"pubgm_global"`

## 🔄 8. تعديلات على `src/lib/i18n.ts`
- إضافة `nav.pros / nav.recoil / nav.crosshair / nav.tournaments` لـ EN و AR
- إضافة كائنات ترجمة كاملة جديدة: `pros / recoil / crosshair / tournaments`
- العربية و الإنجليزية كاملتان

## 🎨 9. تعديلات على `src/index.css`
- إضافة `.gold-text` و `.gold-text-bright` كـ utility classes (gradient gold text)
- دعم الوضع الفاتح للكلاسين

## 📦 10. تحديث `package.json`
- الاسم: `ai-pubg-sensitivity-generator` → **ai-pubg-sensitivity-generator-legendary**
- الإصدار: `2.0.0` → **4.0.0-legendary**

---

## ✅ الفحص النهائي
- `npx tsc --noEmit` → **0 أخطاء TypeScript**
- `npm run build` → **نجاح، dist/index.html بحجم 1.47MB**
- تشغيل Playwright على البناء النهائي → **0 أخطاء console**
- كل الصفحات الجديدة تعمل (شوهد في الـ screenshots)
- اللغة العربية + RTL تعمل
- الـ Splash + Animated BG + Toasts + Achievements **محفوظة كما هي**

## 🚀 التشغيل
```bash
npm install
npm run dev      # تطوير على localhost:5173
npm run build    # بناء إنتاج → dist/index.html (ملف واحد)
```

**كل شيء في مشروعك الأصلي يعمل كما كان** — الـ Studio، الـ Dashboard، الـ Profile، الـ Achievements، الـ Command Palette. فقط أضفنا الميزات الجديدة فوقه.
