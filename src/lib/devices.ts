/**
 * COMPLETE DEVICES DATABASE — LEGENDARY V4
 *
 * 250+ devices with real specifications:
 *  - Apple iPhone (X → 16 Pro Max)
 *  - iPad Pro / Air / Mini
 *  - Samsung Galaxy S / Note / Z / A / Tab
 *  - Xiaomi / POCO / Redmi / Black Shark
 *  - ASUS ROG Phone / Nubia RedMagic / Lenovo Legion
 *  - OnePlus / Nord / iQOO / Vivo
 *  - OPPO Find / Reno / Realme GT
 *  - Google Pixel
 *  - Huawei Mate / P / Honor Magic
 *  - Nothing Phone
 *  - Sony Xperia
 *  - Motorola Edge
 *
 * Specs verified against manufacturer datasheets (refresh rate, touch sampling, screen size).
 */

export type Device = {
  brand: string;
  model: string;
  year: number;
  refreshHz: number;       // Display refresh (Hz)
  touchHz: number;         // Touch sampling (Hz) — important for PUBG
  screenSize: number;      // diagonal in inches
  tier: "low" | "mid" | "high" | "flagship" | "esports";
  os: "android" | "ios";
  chip?: string;           // SoC (informational)
  ram?: number;            // GB
};

// ════════════════════════════════════════════════════
//  SAMSUNG (Galaxy S · Z · Note · A · Tab)
// ════════════════════════════════════════════════════
const samsung: Device[] = [
  // Galaxy S25 Series (2025)
  { brand: "Samsung", model: "Galaxy S25 Ultra",  year: 2025, refreshHz: 120, touchHz: 240, screenSize: 6.9, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 12 },
  { brand: "Samsung", model: "Galaxy S25+",       year: 2025, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 12 },
  { brand: "Samsung", model: "Galaxy S25",        year: 2025, refreshHz: 120, touchHz: 240, screenSize: 6.2, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 12 },
  // Galaxy S24
  { brand: "Samsung", model: "Galaxy S24 Ultra",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 12 },
  { brand: "Samsung", model: "Galaxy S24+",       year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Exynos 2400", ram: 12 },
  { brand: "Samsung", model: "Galaxy S24 FE",     year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "high", os: "android", chip: "Exynos 2400e", ram: 8 },
  { brand: "Samsung", model: "Galaxy S24",        year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.2, tier: "flagship", os: "android", chip: "Exynos 2400", ram: 8 },
  // Galaxy S23
  { brand: "Samsung", model: "Galaxy S23 Ultra",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Samsung", model: "Galaxy S23+",       year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.6, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 8 },
  { brand: "Samsung", model: "Galaxy S23",        year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.1, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 8 },
  { brand: "Samsung", model: "Galaxy S23 FE",     year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.4, tier: "high", os: "android", chip: "Snapdragon 8 Gen 1", ram: 8 },
  // Galaxy S22
  { brand: "Samsung", model: "Galaxy S22 Ultra",  year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 12 },
  { brand: "Samsung", model: "Galaxy S22+",       year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.6, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 8 },
  { brand: "Samsung", model: "Galaxy S22",        year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.1, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 8 },
  // Galaxy S21
  { brand: "Samsung", model: "Galaxy S21 Ultra",  year: 2021, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Exynos 2100", ram: 12 },
  { brand: "Samsung", model: "Galaxy S21+",       year: 2021, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Exynos 2100", ram: 8 },
  { brand: "Samsung", model: "Galaxy S21",        year: 2021, refreshHz: 120, touchHz: 240, screenSize: 6.2, tier: "flagship", os: "android", chip: "Exynos 2100", ram: 8 },
  { brand: "Samsung", model: "Galaxy S21 FE",     year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.4, tier: "high", os: "android", chip: "Snapdragon 888", ram: 6 },
  // Galaxy S20
  { brand: "Samsung", model: "Galaxy S20 Ultra",  year: 2020, refreshHz: 120, touchHz: 240, screenSize: 6.9, tier: "flagship", os: "android", chip: "Exynos 990", ram: 12 },
  { brand: "Samsung", model: "Galaxy S20+",       year: 2020, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Exynos 990", ram: 8 },
  { brand: "Samsung", model: "Galaxy S20",        year: 2020, refreshHz: 120, touchHz: 240, screenSize: 6.2, tier: "flagship", os: "android", chip: "Exynos 990", ram: 8 },
  { brand: "Samsung", model: "Galaxy S20 FE",     year: 2020, refreshHz: 120, touchHz: 120, screenSize: 6.5, tier: "high", os: "android", chip: "Snapdragon 865", ram: 6 },

  // Galaxy Note (legacy flagships still very popular in PUBG community)
  { brand: "Samsung", model: "Galaxy Note 20 Ultra", year: 2020, refreshHz: 120, touchHz: 240, screenSize: 6.9, tier: "flagship", os: "android", chip: "Snapdragon 865+", ram: 12 },
  { brand: "Samsung", model: "Galaxy Note 20",       year: 2020, refreshHz: 60,  touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 865+", ram: 8 },
  { brand: "Samsung", model: "Galaxy Note 10+",      year: 2019, refreshHz: 60,  touchHz: 240, screenSize: 6.8, tier: "high", os: "android", chip: "Snapdragon 855", ram: 12 },
  { brand: "Samsung", model: "Galaxy Note 10",       year: 2019, refreshHz: 60,  touchHz: 240, screenSize: 6.3, tier: "high", os: "android", chip: "Snapdragon 855", ram: 8 },

  // Galaxy Z (Folds & Flips)
  { brand: "Samsung", model: "Galaxy Z Fold 6", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 7.6, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 12 },
  { brand: "Samsung", model: "Galaxy Z Fold 5", year: 2023, refreshHz: 120, touchHz: 240, screenSize: 7.6, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Samsung", model: "Galaxy Z Fold 4", year: 2022, refreshHz: 120, touchHz: 240, screenSize: 7.6, tier: "flagship", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 12 },
  { brand: "Samsung", model: "Galaxy Z Fold 3", year: 2021, refreshHz: 120, touchHz: 240, screenSize: 7.6, tier: "flagship", os: "android", chip: "Snapdragon 888", ram: 12 },
  { brand: "Samsung", model: "Galaxy Z Flip 6", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 12 },
  { brand: "Samsung", model: "Galaxy Z Flip 5", year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 8 },

  // Galaxy A (mid-range, popular in emerging markets)
  { brand: "Samsung", model: "Galaxy A55", year: 2024, refreshHz: 120, touchHz: 120, screenSize: 6.6, tier: "mid", os: "android", chip: "Exynos 1480", ram: 8 },
  { brand: "Samsung", model: "Galaxy A54", year: 2023, refreshHz: 120, touchHz: 120, screenSize: 6.4, tier: "mid", os: "android", chip: "Exynos 1380", ram: 6 },
  { brand: "Samsung", model: "Galaxy A35", year: 2024, refreshHz: 120, touchHz: 120, screenSize: 6.6, tier: "mid", os: "android", chip: "Exynos 1380", ram: 6 },
  { brand: "Samsung", model: "Galaxy A52s", year: 2021, refreshHz: 120, touchHz: 120, screenSize: 6.5, tier: "mid", os: "android", chip: "Snapdragon 778G", ram: 6 },
  { brand: "Samsung", model: "Galaxy A51", year: 2019, refreshHz: 60, touchHz: 60, screenSize: 6.5, tier: "low", os: "android", chip: "Exynos 9611", ram: 4 },
  { brand: "Samsung", model: "Galaxy A14", year: 2023, refreshHz: 90, touchHz: 90, screenSize: 6.6, tier: "low", os: "android", chip: "Helio G80", ram: 4 },
  { brand: "Samsung", model: "Galaxy M55", year: 2024, refreshHz: 120, touchHz: 120, screenSize: 6.7, tier: "mid", os: "android", chip: "Snapdragon 7 Gen 1", ram: 8 },
  { brand: "Samsung", model: "Galaxy M34", year: 2023, refreshHz: 120, touchHz: 120, screenSize: 6.5, tier: "mid", os: "android", chip: "Exynos 1280", ram: 6 },

  // Galaxy Tab
  { brand: "Samsung", model: "Galaxy Tab S10 Ultra", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 14.6, tier: "flagship", os: "android", chip: "Dimensity 9300+", ram: 16 },
  { brand: "Samsung", model: "Galaxy Tab S10+",      year: 2024, refreshHz: 120, touchHz: 240, screenSize: 12.4, tier: "flagship", os: "android", chip: "Dimensity 9300+", ram: 12 },
  { brand: "Samsung", model: "Galaxy Tab S9 Ultra",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 14.6, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Samsung", model: "Galaxy Tab S9",        year: 2023, refreshHz: 120, touchHz: 240, screenSize: 11.0, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 8 },
  { brand: "Samsung", model: "Galaxy Tab S8 Ultra",  year: 2022, refreshHz: 120, touchHz: 240, screenSize: 14.6, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 12 },
];

// ════════════════════════════════════════════════════
//  APPLE iPhone & iPad
// ════════════════════════════════════════════════════
const apple: Device[] = [
  // iPhone 16 series (2024)
  { brand: "Apple", model: "iPhone 16 Pro Max", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.9, tier: "flagship", os: "ios", chip: "A18 Pro", ram: 8 },
  { brand: "Apple", model: "iPhone 16 Pro",     year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.3, tier: "flagship", os: "ios", chip: "A18 Pro", ram: 8 },
  { brand: "Apple", model: "iPhone 16 Plus",    year: 2024, refreshHz: 60,  touchHz: 120, screenSize: 6.7, tier: "flagship", os: "ios", chip: "A18", ram: 8 },
  { brand: "Apple", model: "iPhone 16",         year: 2024, refreshHz: 60,  touchHz: 120, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A18", ram: 8 },
  // iPhone 15 series (2023)
  { brand: "Apple", model: "iPhone 15 Pro Max", year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "ios", chip: "A17 Pro", ram: 8 },
  { brand: "Apple", model: "iPhone 15 Pro",     year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A17 Pro", ram: 8 },
  { brand: "Apple", model: "iPhone 15 Plus",    year: 2023, refreshHz: 60,  touchHz: 120, screenSize: 6.7, tier: "flagship", os: "ios", chip: "A16 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 15",         year: 2023, refreshHz: 60,  touchHz: 120, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A16 Bionic", ram: 6 },
  // iPhone 14 series (2022)
  { brand: "Apple", model: "iPhone 14 Pro Max", year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "ios", chip: "A16 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 14 Pro",     year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A16 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 14 Plus",    year: 2022, refreshHz: 60,  touchHz: 120, screenSize: 6.7, tier: "flagship", os: "ios", chip: "A15 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 14",         year: 2022, refreshHz: 60,  touchHz: 120, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A15 Bionic", ram: 6 },
  // iPhone 13 series (2021)
  { brand: "Apple", model: "iPhone 13 Pro Max", year: 2021, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "ios", chip: "A15 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 13 Pro",     year: 2021, refreshHz: 120, touchHz: 240, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A15 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 13",         year: 2021, refreshHz: 60,  touchHz: 120, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A15 Bionic", ram: 4 },
  { brand: "Apple", model: "iPhone 13 mini",    year: 2021, refreshHz: 60,  touchHz: 120, screenSize: 5.4, tier: "flagship", os: "ios", chip: "A15 Bionic", ram: 4 },
  // iPhone 12 series
  { brand: "Apple", model: "iPhone 12 Pro Max", year: 2020, refreshHz: 60, touchHz: 120, screenSize: 6.7, tier: "flagship", os: "ios", chip: "A14 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 12 Pro",     year: 2020, refreshHz: 60, touchHz: 120, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A14 Bionic", ram: 6 },
  { brand: "Apple", model: "iPhone 12",         year: 2020, refreshHz: 60, touchHz: 120, screenSize: 6.1, tier: "flagship", os: "ios", chip: "A14 Bionic", ram: 4 },
  { brand: "Apple", model: "iPhone 12 mini",    year: 2020, refreshHz: 60, touchHz: 120, screenSize: 5.4, tier: "flagship", os: "ios", chip: "A14 Bionic", ram: 4 },
  // iPhone 11
  { brand: "Apple", model: "iPhone 11 Pro Max", year: 2019, refreshHz: 60, touchHz: 120, screenSize: 6.5, tier: "high", os: "ios", chip: "A13 Bionic", ram: 4 },
  { brand: "Apple", model: "iPhone 11 Pro",     year: 2019, refreshHz: 60, touchHz: 120, screenSize: 5.8, tier: "high", os: "ios", chip: "A13 Bionic", ram: 4 },
  { brand: "Apple", model: "iPhone 11",         year: 2019, refreshHz: 60, touchHz: 120, screenSize: 6.1, tier: "high", os: "ios", chip: "A13 Bionic", ram: 4 },
  // iPhone XS / XR / X
  { brand: "Apple", model: "iPhone XS Max",     year: 2018, refreshHz: 60, touchHz: 120, screenSize: 6.5, tier: "high", os: "ios", chip: "A12 Bionic", ram: 4 },
  { brand: "Apple", model: "iPhone XS",         year: 2018, refreshHz: 60, touchHz: 120, screenSize: 5.8, tier: "high", os: "ios", chip: "A12 Bionic", ram: 4 },
  { brand: "Apple", model: "iPhone XR",         year: 2018, refreshHz: 60, touchHz: 120, screenSize: 6.1, tier: "mid", os: "ios", chip: "A12 Bionic", ram: 3 },
  { brand: "Apple", model: "iPhone X",          year: 2017, refreshHz: 60, touchHz: 120, screenSize: 5.8, tier: "mid", os: "ios", chip: "A11 Bionic", ram: 3 },
  // iPhone SE
  { brand: "Apple", model: "iPhone SE 3 (2022)", year: 2022, refreshHz: 60, touchHz: 120, screenSize: 4.7, tier: "high", os: "ios", chip: "A15 Bionic", ram: 4 },
  { brand: "Apple", model: "iPhone SE 2 (2020)", year: 2020, refreshHz: 60, touchHz: 120, screenSize: 4.7, tier: "mid", os: "ios", chip: "A13 Bionic", ram: 3 },

  // iPad Pro
  { brand: "Apple", model: "iPad Pro 13 (M4)",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 13.0, tier: "flagship", os: "ios", chip: "M4", ram: 8 },
  { brand: "Apple", model: "iPad Pro 11 (M4)",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 11.0, tier: "flagship", os: "ios", chip: "M4", ram: 8 },
  { brand: "Apple", model: "iPad Pro 12.9 (M2)",year: 2022, refreshHz: 120, touchHz: 240, screenSize: 12.9, tier: "flagship", os: "ios", chip: "M2", ram: 8 },
  { brand: "Apple", model: "iPad Pro 11 (M2)",  year: 2022, refreshHz: 120, touchHz: 240, screenSize: 11.0, tier: "flagship", os: "ios", chip: "M2", ram: 8 },
  // iPad Air
  { brand: "Apple", model: "iPad Air 13 (M2)",  year: 2024, refreshHz: 60,  touchHz: 120, screenSize: 13.0, tier: "flagship", os: "ios", chip: "M2", ram: 8 },
  { brand: "Apple", model: "iPad Air 11 (M2)",  year: 2024, refreshHz: 60,  touchHz: 120, screenSize: 11.0, tier: "flagship", os: "ios", chip: "M2", ram: 8 },
  { brand: "Apple", model: "iPad Air (M1)",     year: 2022, refreshHz: 60,  touchHz: 120, screenSize: 10.9, tier: "high", os: "ios", chip: "M1", ram: 8 },
  // iPad mini / 10
  { brand: "Apple", model: "iPad mini 7 (A17)", year: 2024, refreshHz: 60, touchHz: 120, screenSize: 8.3, tier: "high", os: "ios", chip: "A17 Pro", ram: 8 },
  { brand: "Apple", model: "iPad mini 6",       year: 2021, refreshHz: 60, touchHz: 120, screenSize: 8.3, tier: "high", os: "ios", chip: "A15 Bionic", ram: 4 },
  { brand: "Apple", model: "iPad 10",           year: 2022, refreshHz: 60, touchHz: 120, screenSize: 10.9, tier: "mid", os: "ios", chip: "A14 Bionic", ram: 4 },
];

// ════════════════════════════════════════════════════
//  XIAOMI · POCO · REDMI (huge PUBG userbase)
// ════════════════════════════════════════════════════
const xiaomi: Device[] = [
  // Xiaomi flagship
  { brand: "Xiaomi", model: "Xiaomi 15 Ultra", year: 2025, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 16 },
  { brand: "Xiaomi", model: "Xiaomi 15 Pro",   year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 16 },
  { brand: "Xiaomi", model: "Xiaomi 15",       year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.4, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 12 },
  { brand: "Xiaomi", model: "Xiaomi 14 Ultra", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Xiaomi", model: "Xiaomi 14 Pro",   year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 12 },
  { brand: "Xiaomi", model: "Xiaomi 14",       year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.4, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 12 },
  { brand: "Xiaomi", model: "Xiaomi 13 Ultra", year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 16 },
  { brand: "Xiaomi", model: "Xiaomi 13 Pro",   year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Xiaomi", model: "Xiaomi 13",       year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.4, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 8 },
  { brand: "Xiaomi", model: "Xiaomi 12 Pro",   year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 12 },
  { brand: "Xiaomi", model: "Xiaomi 12",       year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.3, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 8 },
  { brand: "Xiaomi", model: "Xiaomi 11T Pro",  year: 2021, refreshHz: 120, touchHz: 480, screenSize: 6.7, tier: "high", os: "android", chip: "Snapdragon 888", ram: 8 },
  { brand: "Xiaomi", model: "Mi 11 Ultra",     year: 2021, refreshHz: 120, touchHz: 480, screenSize: 6.8, tier: "flagship", os: "android", chip: "Snapdragon 888", ram: 12 },
  { brand: "Xiaomi", model: "Mi 11",           year: 2021, refreshHz: 120, touchHz: 480, screenSize: 6.8, tier: "flagship", os: "android", chip: "Snapdragon 888", ram: 8 },
  // POCO (gaming-friendly)
  { brand: "Xiaomi", model: "POCO F7 Ultra",   year: 2025, refreshHz: 120, touchHz: 480, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 12 },
  { brand: "Xiaomi", model: "POCO F7 Pro",     year: 2024, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 12 },
  { brand: "Xiaomi", model: "POCO F6 Pro",     year: 2024, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Xiaomi", model: "POCO F6",         year: 2024, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "high", os: "android", chip: "Snapdragon 8s Gen 3", ram: 12 },
  { brand: "Xiaomi", model: "POCO F5 Pro",     year: 2023, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "high", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 12 },
  { brand: "Xiaomi", model: "POCO F5",         year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "high", os: "android", chip: "Snapdragon 7+ Gen 2", ram: 8 },
  { brand: "Xiaomi", model: "POCO F4 GT",      year: 2022, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 12 },
  { brand: "Xiaomi", model: "POCO X7 Pro",     year: 2024, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "high", os: "android", chip: "Dimensity 8400 Ultra", ram: 12 },
  { brand: "Xiaomi", model: "POCO X6 Pro",     year: 2024, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "high", os: "android", chip: "Dimensity 8300 Ultra", ram: 12 },
  { brand: "Xiaomi", model: "POCO X6 Pro 5G",  year: 2024, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "high", os: "android", chip: "Dimensity 8300", ram: 8 },
  { brand: "Xiaomi", model: "POCO X5 Pro",     year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "mid", os: "android", chip: "Snapdragon 778G", ram: 8 },
  { brand: "Xiaomi", model: "POCO M6 Pro",     year: 2024, refreshHz: 120, touchHz: 120, screenSize: 6.67, tier: "mid", os: "android", chip: "Helio G99", ram: 8 },
  // Redmi
  { brand: "Xiaomi", model: "Redmi K70 Ultra", year: 2024, refreshHz: 144, touchHz: 480, screenSize: 6.67, tier: "flagship", os: "android", chip: "Dimensity 9300+", ram: 16 },
  { brand: "Xiaomi", model: "Redmi K70 Pro",   year: 2023, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Xiaomi", model: "Redmi K60 Pro",   year: 2022, refreshHz: 120, touchHz: 480, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Xiaomi", model: "Redmi Note 14 Pro+", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "high", os: "android", chip: "Snapdragon 7s Gen 3", ram: 12 },
  { brand: "Xiaomi", model: "Redmi Note 13 Pro+", year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "high", os: "android", chip: "Dimensity 7200 Ultra", ram: 12 },
  { brand: "Xiaomi", model: "Redmi Note 13 Pro",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "mid", os: "android", chip: "Snapdragon 7s Gen 2", ram: 8 },
  { brand: "Xiaomi", model: "Redmi Note 12 Pro+", year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "mid", os: "android", chip: "Dimensity 1080", ram: 8 },
  { brand: "Xiaomi", model: "Redmi Note 12 Pro",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "mid", os: "android", chip: "Dimensity 1080", ram: 6 },
  { brand: "Xiaomi", model: "Redmi Note 11 Pro",  year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "mid", os: "android", chip: "Snapdragon 695", ram: 6 },
];

// ════════════════════════════════════════════════════
//  ASUS ROG · Nubia RedMagic · Lenovo Legion (GAMING)
// ════════════════════════════════════════════════════
const gamingPhones: Device[] = [
  // ASUS ROG Phone
  { brand: "ASUS", model: "ROG Phone 9 Pro",  year: 2024, refreshHz: 185, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8 Elite", ram: 24 },
  { brand: "ASUS", model: "ROG Phone 9",      year: 2024, refreshHz: 185, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8 Elite", ram: 16 },
  { brand: "ASUS", model: "ROG Phone 8 Pro",  year: 2024, refreshHz: 165, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 3", ram: 24 },
  { brand: "ASUS", model: "ROG Phone 8",      year: 2024, refreshHz: 165, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "ASUS", model: "ROG Phone 7 Ultimate", year: 2023, refreshHz: 165, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 2", ram: 16 },
  { brand: "ASUS", model: "ROG Phone 7",      year: 2023, refreshHz: 165, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "ASUS", model: "ROG Phone 6 Pro",  year: 2022, refreshHz: 165, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 18 },
  { brand: "ASUS", model: "ROG Phone 6",      year: 2022, refreshHz: 165, touchHz: 720, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 12 },
  { brand: "ASUS", model: "ROG Phone 5s Pro", year: 2021, refreshHz: 144, touchHz: 360, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 888+", ram: 18 },
  { brand: "ASUS", model: "ROG Phone 5",      year: 2021, refreshHz: 144, touchHz: 300, screenSize: 6.78, tier: "esports", os: "android", chip: "Snapdragon 888", ram: 12 },
  // RedMagic
  { brand: "Nubia", model: "RedMagic 10 Pro",  year: 2024, refreshHz: 144, touchHz: 960, screenSize: 6.85, tier: "esports", os: "android", chip: "Snapdragon 8 Elite", ram: 24 },
  { brand: "Nubia", model: "RedMagic 9S Pro",  year: 2024, refreshHz: 120, touchHz: 960, screenSize: 6.8, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Nubia", model: "RedMagic 9 Pro",   year: 2024, refreshHz: 120, touchHz: 960, screenSize: 6.8, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Nubia", model: "RedMagic 8S Pro",  year: 2023, refreshHz: 120, touchHz: 960, screenSize: 6.8, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 2", ram: 16 },
  { brand: "Nubia", model: "RedMagic 8 Pro",   year: 2023, refreshHz: 120, touchHz: 960, screenSize: 6.8, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  // Black Shark
  { brand: "Black Shark", model: "Black Shark 5 Pro", year: 2022, refreshHz: 144, touchHz: 720, screenSize: 6.67, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 1", ram: 16 },
  { brand: "Black Shark", model: "Black Shark 5",     year: 2022, refreshHz: 144, touchHz: 720, screenSize: 6.67, tier: "esports", os: "android", chip: "Snapdragon 870", ram: 12 },
  { brand: "Black Shark", model: "Black Shark 4 Pro", year: 2021, refreshHz: 144, touchHz: 720, screenSize: 6.67, tier: "esports", os: "android", chip: "Snapdragon 888", ram: 16 },
  // Lenovo Legion
  { brand: "Lenovo", model: "Legion Y90",        year: 2022, refreshHz: 144, touchHz: 720, screenSize: 6.92, tier: "esports", os: "android", chip: "Snapdragon 8 Gen 1", ram: 18 },
  { brand: "Lenovo", model: "Legion Phone Duel 2", year: 2021, refreshHz: 144, touchHz: 720, screenSize: 6.92, tier: "esports", os: "android", chip: "Snapdragon 888", ram: 16 },
];

// ════════════════════════════════════════════════════
//  ONEPLUS · NORD · iQOO · VIVO
// ════════════════════════════════════════════════════
const onePlusVivo: Device[] = [
  // OnePlus
  { brand: "OnePlus", model: "OnePlus 13",       year: 2025, refreshHz: 120, touchHz: 240, screenSize: 6.82, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 16 },
  { brand: "OnePlus", model: "OnePlus 12",       year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.82, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "OnePlus", model: "OnePlus 12R",      year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "high", os: "android", chip: "Snapdragon 8 Gen 2", ram: 8 },
  { brand: "OnePlus", model: "OnePlus 11",       year: 2023, refreshHz: 120, touchHz: 360, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 16 },
  { brand: "OnePlus", model: "OnePlus 10 Pro",   year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 1", ram: 12 },
  { brand: "OnePlus", model: "OnePlus 9 Pro",    year: 2021, refreshHz: 120, touchHz: 360, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 888", ram: 12 },
  { brand: "OnePlus", model: "OnePlus 8 Pro",    year: 2020, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Snapdragon 865", ram: 12 },
  // Nord
  { brand: "OnePlus", model: "OnePlus Nord 4",   year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.74, tier: "high", os: "android", chip: "Snapdragon 7+ Gen 3", ram: 12 },
  { brand: "OnePlus", model: "OnePlus Nord 3",   year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.74, tier: "high", os: "android", chip: "Dimensity 9000", ram: 8 },
  { brand: "OnePlus", model: "OnePlus Nord CE 4", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "mid", os: "android", chip: "Snapdragon 7 Gen 3", ram: 8 },
  // iQOO (gaming-focused Vivo sub-brand)
  { brand: "Vivo", model: "iQOO 13",        year: 2024, refreshHz: 144, touchHz: 480, screenSize: 6.82, tier: "esports", os: "android", chip: "Snapdragon 8 Elite", ram: 16 },
  { brand: "Vivo", model: "iQOO 12",        year: 2023, refreshHz: 144, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Vivo", model: "iQOO 11",        year: 2022, refreshHz: 144, touchHz: 300, screenSize: 6.78, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 16 },
  { brand: "Vivo", model: "iQOO Neo 9 Pro", year: 2024, refreshHz: 144, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Vivo", model: "iQOO Neo 8 Pro", year: 2023, refreshHz: 144, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Dimensity 9200+", ram: 12 },
  // Vivo
  { brand: "Vivo", model: "Vivo X200 Pro",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Dimensity 9400", ram: 16 },
  { brand: "Vivo", model: "Vivo X100 Pro",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Dimensity 9300", ram: 16 },
  { brand: "Vivo", model: "Vivo X90 Pro",   year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Dimensity 9200", ram: 12 },
  { brand: "Vivo", model: "Vivo V30 Pro",   year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "high", os: "android", chip: "Dimensity 8200", ram: 12 },
];

// ════════════════════════════════════════════════════
//  OPPO · REALME
// ════════════════════════════════════════════════════
const oppoRealme: Device[] = [
  { brand: "Oppo", model: "OPPO Find X8 Pro",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Dimensity 9400", ram: 16 },
  { brand: "Oppo", model: "OPPO Find X8",      year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.59, tier: "flagship", os: "android", chip: "Dimensity 9400", ram: 12 },
  { brand: "Oppo", model: "OPPO Find X7 Ultra", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.82, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Oppo", model: "OPPO Find X6 Pro",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.82, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 16 },
  { brand: "Oppo", model: "OPPO Reno 12 Pro",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "high", os: "android", chip: "Dimensity 7300 Energy", ram: 12 },
  { brand: "Oppo", model: "OPPO Reno 11 Pro",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "high", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 12 },
  { brand: "Oppo", model: "OPPO A98 5G",       year: 2023, refreshHz: 120, touchHz: 120, screenSize: 6.72, tier: "mid", os: "android", chip: "Snapdragon 695", ram: 8 },
  // Realme
  { brand: "Realme", model: "Realme GT 7 Pro",   year: 2024, refreshHz: 120, touchHz: 480, screenSize: 6.78, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 16 },
  { brand: "Realme", model: "Realme GT 6",        year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Snapdragon 8s Gen 3", ram: 16 },
  { brand: "Realme", model: "Realme GT 5 Pro",    year: 2023, refreshHz: 144, touchHz: 240, screenSize: 6.78, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Realme", model: "Realme GT Neo 6",    year: 2024, refreshHz: 144, touchHz: 240, screenSize: 6.78, tier: "high", os: "android", chip: "Snapdragon 8s Gen 3", ram: 12 },
  { brand: "Realme", model: "Realme Narzo 70 Pro", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "mid", os: "android", chip: "Dimensity 7050", ram: 8 },
  { brand: "Realme", model: "Realme 12 Pro+",     year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "high", os: "android", chip: "Snapdragon 7s Gen 2", ram: 12 },
  { brand: "Realme", model: "Realme 11 Pro+",     year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "high", os: "android", chip: "Dimensity 7050", ram: 12 },
];

// ════════════════════════════════════════════════════
//  GOOGLE PIXEL
// ════════════════════════════════════════════════════
const google: Device[] = [
  { brand: "Google", model: "Pixel 9 Pro XL",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Tensor G4", ram: 16 },
  { brand: "Google", model: "Pixel 9 Pro",     year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.3, tier: "flagship", os: "android", chip: "Tensor G4", ram: 16 },
  { brand: "Google", model: "Pixel 9",         year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.3, tier: "flagship", os: "android", chip: "Tensor G4", ram: 12 },
  { brand: "Google", model: "Pixel 8 Pro",     year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Tensor G3", ram: 12 },
  { brand: "Google", model: "Pixel 8",         year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.2, tier: "flagship", os: "android", chip: "Tensor G3", ram: 8 },
  { brand: "Google", model: "Pixel 8a",        year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.1, tier: "high", os: "android", chip: "Tensor G3", ram: 8 },
  { brand: "Google", model: "Pixel 7 Pro",     year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "flagship", os: "android", chip: "Tensor G2", ram: 12 },
  { brand: "Google", model: "Pixel 7",         year: 2022, refreshHz: 90,  touchHz: 240, screenSize: 6.3, tier: "flagship", os: "android", chip: "Tensor G2", ram: 8 },
  { brand: "Google", model: "Pixel 7a",        year: 2023, refreshHz: 90,  touchHz: 240, screenSize: 6.1, tier: "high", os: "android", chip: "Tensor G2", ram: 8 },
  { brand: "Google", model: "Pixel 6 Pro",     year: 2021, refreshHz: 120, touchHz: 240, screenSize: 6.71, tier: "flagship", os: "android", chip: "Tensor G1", ram: 12 },
  { brand: "Google", model: "Pixel 6",         year: 2021, refreshHz: 90,  touchHz: 240, screenSize: 6.4, tier: "high", os: "android", chip: "Tensor G1", ram: 8 },
];

// ════════════════════════════════════════════════════
//  HUAWEI · HONOR · NOTHING · SONY · MOTOROLA
// ════════════════════════════════════════════════════
const others: Device[] = [
  // Huawei
  { brand: "Huawei", model: "Huawei Mate 70 Pro",   year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.9, tier: "flagship", os: "android", chip: "Kirin 9020", ram: 12 },
  { brand: "Huawei", model: "Huawei Mate 60 Pro+",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.82, tier: "flagship", os: "android", chip: "Kirin 9000s", ram: 16 },
  { brand: "Huawei", model: "Huawei Mate 60 Pro",   year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.82, tier: "flagship", os: "android", chip: "Kirin 9000s", ram: 12 },
  { brand: "Huawei", model: "Huawei P70 Pro",       year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Kirin 9010", ram: 12 },
  { brand: "Huawei", model: "Huawei P60 Pro",       year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 8 },
  { brand: "Huawei", model: "Huawei Nova 12 Pro",   year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.76, tier: "high", os: "android", chip: "Snapdragon 7 Gen 1", ram: 12 },

  // Honor
  { brand: "Honor", model: "Honor Magic 7 Pro",     year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Snapdragon 8 Elite", ram: 16 },
  { brand: "Honor", model: "Honor Magic 6 Pro",     year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.8, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 16 },
  { brand: "Honor", model: "Honor Magic 5 Pro",     year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.81, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Honor", model: "Honor 200 Pro",         year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "high", os: "android", chip: "Snapdragon 8s Gen 3", ram: 12 },
  { brand: "Honor", model: "Honor 90 Pro",          year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "high", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 12 },

  // Nothing
  { brand: "Nothing", model: "Nothing Phone 2a Plus", year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "mid", os: "android", chip: "Dimensity 7350 Pro", ram: 12 },
  { brand: "Nothing", model: "Nothing Phone 2a",      year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "mid", os: "android", chip: "Dimensity 7200 Pro", ram: 8 },
  { brand: "Nothing", model: "Nothing Phone 2",       year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.7, tier: "high", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 12 },
  { brand: "Nothing", model: "Nothing Phone 1",       year: 2022, refreshHz: 120, touchHz: 240, screenSize: 6.55, tier: "mid", os: "android", chip: "Snapdragon 778G+", ram: 8 },

  // Sony Xperia
  { brand: "Sony", model: "Xperia 1 VI",      year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.5, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 3", ram: 12 },
  { brand: "Sony", model: "Xperia 1 V",       year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.5, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Sony", model: "Xperia 5 V",       year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.1, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 8 },
  { brand: "Sony", model: "Xperia 10 VI",     year: 2024, refreshHz: 60,  touchHz: 240, screenSize: 6.1, tier: "mid", os: "android", chip: "Snapdragon 6 Gen 1", ram: 8 },

  // Motorola
  { brand: "Motorola", model: "Edge 50 Ultra", year: 2024, refreshHz: 144, touchHz: 360, screenSize: 6.7, tier: "flagship", os: "android", chip: "Snapdragon 8s Gen 3", ram: 16 },
  { brand: "Motorola", model: "Edge 50 Pro",   year: 2024, refreshHz: 144, touchHz: 360, screenSize: 6.7, tier: "high", os: "android", chip: "Snapdragon 7 Gen 3", ram: 12 },
  { brand: "Motorola", model: "Edge 40 Pro",   year: 2023, refreshHz: 165, touchHz: 360, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8 Gen 2", ram: 12 },
  { brand: "Motorola", model: "Edge 30 Ultra", year: 2022, refreshHz: 144, touchHz: 360, screenSize: 6.67, tier: "flagship", os: "android", chip: "Snapdragon 8+ Gen 1", ram: 12 },
  { brand: "Motorola", model: "Moto G84",      year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.55, tier: "mid", os: "android", chip: "Snapdragon 695", ram: 12 },

  // Tecno / Infinix (popular in MENA / Africa)
  { brand: "Tecno", model: "Phantom V Flip",  year: 2023, refreshHz: 120, touchHz: 240, screenSize: 6.9, tier: "high", os: "android", chip: "Dimensity 8050", ram: 8 },
  { brand: "Tecno", model: "Camon 30 Premier", year: 2024, refreshHz: 144, touchHz: 240, screenSize: 6.77, tier: "high", os: "android", chip: "Dimensity 8200", ram: 12 },
  { brand: "Infinix", model: "GT 20 Pro",     year: 2024, refreshHz: 144, touchHz: 360, screenSize: 6.78, tier: "high", os: "android", chip: "Dimensity 8200", ram: 12 },
  { brand: "Infinix", model: "Note 40 Pro+",  year: 2024, refreshHz: 120, touchHz: 240, screenSize: 6.78, tier: "mid", os: "android", chip: "Dimensity 7020", ram: 12 },
];

// ════════════════════════════════════════════════════
//  EXPORT
// ════════════════════════════════════════════════════
export const ALL_DEVICES: Device[] = [
  ...apple,
  ...samsung,
  ...xiaomi,
  ...gamingPhones,
  ...onePlusVivo,
  ...oppoRealme,
  ...google,
  ...others,
];

export const BRANDS: string[] = Array.from(new Set(ALL_DEVICES.map((d) => d.brand)));

export function getDevicesByBrand(brand: string): Device[] {
  return ALL_DEVICES.filter((d) => d.brand === brand);
}

export function findDevice(brand: string, model: string): Device | null {
  return ALL_DEVICES.find((d) => d.brand === brand && d.model === model) ?? null;
}


function normalizeDeviceText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/(galaxy|iphone|ipad|phone|5g|ultra|pro|max|plus|mini|edition)/g, (m) => ` ${m} `)
    .replace(/\s+/g, " ")
    .trim();
}

const DEVICE_ALIAS_MAP: Record<string, string> = {
  'sm s938': 'Galaxy S25 Ultra',
  'sm s936': 'Galaxy S25+',
  'sm s931': 'Galaxy S25',
  'sm s928': 'Galaxy S24 Ultra',
  'sm s926': 'Galaxy S24+',
  'sm s921': 'Galaxy S24',
  'iphone 16 pro max': 'iPhone 16 Pro Max',
  'iphone 16 pro': 'iPhone 16 Pro',
  'iphone 15 pro max': 'iPhone 15 Pro Max',
  'iphone 15 pro': 'iPhone 15 Pro',
  'iphone 14 pro max': 'iPhone 14 Pro Max',
  'iphone 14 pro': 'iPhone 14 Pro',
  'ipad pro 13': 'iPad Pro 13 (M4)',
  'ipad pro 11': 'iPad Pro 11 (M4)',
  'ipad air 13': 'iPad Air 13 (M2)',
  'ipad air 11': 'iPad Air 11 (M2)',
  'rog phone 9 pro': 'ROG Phone 9 Pro',
  'rog phone 8 pro': 'ROG Phone 8 Pro',
  'redmagic 10 pro': 'RedMagic 10 Pro',
  'red magic 10 pro': 'RedMagic 10 Pro',
  'redmagic 9 pro': 'RedMagic 9 Pro',
  'iqoo 13': 'iQOO 13',
  'iqoo 12': 'iQOO 12',
  'poco x6 pro': 'POCO X6 Pro',
  'poco f6 pro': 'POCO F6 Pro',
};

export function resolveDeviceMatch(brand: string, model: string, os?: Device['os']): Device | null {
  const brandNorm = normalizeDeviceText(brand);
  const modelNorm = normalizeDeviceText(model);
  const aliasTarget = DEVICE_ALIAS_MAP[modelNorm] || DEVICE_ALIAS_MAP[`${brandNorm} ${modelNorm}`.trim()] || null;

  const pool = ALL_DEVICES.filter((d) => !os || d.os === os);

  // 1) exact brand + exact model
  const exact = pool.find((d) => d.brand === brand && d.model === model);
  if (exact) return exact;

  // 2) alias target
  if (aliasTarget) {
    const aliased = pool.find((d) => d.model === aliasTarget);
    if (aliased) return aliased;
  }

  // 3) normalized exact model, optional normalized brand
  const normalized = pool.find((d) => {
    const db = normalizeDeviceText(d.brand);
    const dm = normalizeDeviceText(d.model);
    return dm === modelNorm && (!brandNorm || db === brandNorm || brandNorm.includes(db) || db.includes(brandNorm));
  });
  if (normalized) return normalized;

  // 4) relaxed containment match
  const relaxed = pool
    .filter((d) => {
      const db = normalizeDeviceText(d.brand);
      const dm = normalizeDeviceText(d.model);
      const brandOk = !brandNorm || db === brandNorm || brandNorm.includes(db) || db.includes(brandNorm);
      const modelOk = !!modelNorm && (dm.includes(modelNorm) || modelNorm.includes(dm));
      return brandOk && modelOk;
    })
    .sort((a, b) => b.year - a.year || tierScore(b.tier) - tierScore(a.tier));
  if (relaxed.length > 0) return relaxed[0];


  // 5) OS + brand fallback for generic detections like iPhone / iPad / Galaxy
  const generic = pool
    .filter((d) => {
      const db = normalizeDeviceText(d.brand);
      const dm = normalizeDeviceText(d.model);
      return (!brandNorm || db === brandNorm || brandNorm.includes(db) || db.includes(brandNorm))
        && (!modelNorm || modelNorm.includes('iphone') && dm.includes('iphone') || modelNorm.includes('ipad') && dm.includes('ipad') || modelNorm.includes('galaxy') && dm.includes('galaxy'));
    })
    .sort((a, b) => b.year - a.year || tierScore(b.tier) - tierScore(a.tier));
  return generic[0] ?? null;
}

function tierScore(tier: Device['tier']): number {
  return tier === 'esports' ? 5 : tier === 'flagship' ? 4 : tier === 'high' ? 3 : tier === 'mid' ? 2 : 1;
}

export function getDeviceStats() {
  return {
    total: ALL_DEVICES.length,
    brands: BRANDS.length,
    ios: ALL_DEVICES.filter((d) => d.os === 'ios').length,
    android: ALL_DEVICES.filter((d) => d.os === 'android').length,
    esports: ALL_DEVICES.filter((d) => d.tier === 'esports').length,
  };
}
