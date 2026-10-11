import type {
  BaggageType,
} from "../data/checklistData";

// ========================================
// TYPES
// ========================================

export type BaggageRuleLevel =
  | "info"
  | "warning"
  | "danger";

export type BaggageRule = {
  id: string;

  keywords: string[];

  title: string;

  summary: string;

  rules: string[];

  recommendedBaggage:
    BaggageType;

  level:
    BaggageRuleLevel;

  sourceName: string;

  sourceUrl: string;

  updatedAt: string;
};

// ========================================
// BAGGAGE RULES
// ========================================

export const baggageRules:
  BaggageRule[] = [

  // ======================================
  // 🔋 行動電源
  // ======================================

  {
    id: "power-bank",

    keywords: [
      "行動電源",
      "行充",
      "移動電源",
      "充電寶",
      "power bank",
      "powerbank",
    ],

    title:
      "行動電源搭機限制",

    summary:
      "行動電源屬於備用鋰電池，搭機時有特殊攜帶限制。",

    recommendedBaggage:
      "carry-on",

    level:
      "danger",

    rules: [
      "必須隨身攜帶，不可放入託運行李",
      "每位旅客最多攜帶 2 個",
      "一般可攜帶的行動電源不得超過 100 Wh",
      "飛行途中不得使用行動電源，也不得替行動電源充電",
      "應個別保護，避免碰撞、損壞及電極短路",
      "航空公司可能有更嚴格的額外規定",
    ],

    sourceName:
      "交通部民用航空局 / IATA",

    sourceUrl:
      "https://www.caa.gov.tw/NewsPublish-Content.aspx?a=381&lang=1&ngid=1&nid=2547",

    updatedAt:
      "2026-04",
  },

  // ======================================
  // 🔋 備用鋰電池
  // ======================================

  {
    id: "spare-lithium-battery",

    keywords: [
      "備用鋰電池",
      "備用電池",
      "相機電池",
      "相機備用電池",
      "無人機電池",
      "無人機備用電池",
      "鋰電池",
      "lithium battery",
      "spare battery",
    ],

    title:
      "備用鋰電池搭機限制",

    summary:
      "未安裝在設備中的備用鋰電池有較嚴格的航空運輸限制。",

    recommendedBaggage:
      "carry-on",

    level:
      "danger",

    rules: [
      "備用鋰電池應放在隨身行李，不可放入託運行李",
      "電池端子應個別保護，避免短路",
      "100 Wh 以下通常可隨身攜帶",
      "100–160 Wh 通常需要事先取得航空公司同意",
      "超過 160 Wh 的一般消費型備用電池通常不得作為旅客行李攜帶",
      "實際數量及攜帶方式請確認航空公司的最新規定",
    ],

    sourceName:
      "IATA / 交通部民用航空局",

    sourceUrl:
      "https://www.iata.org/en/youandiata/travelers/batteries",

    updatedAt:
      "2026",
  },

  // ======================================
  // 🚬 電子煙
  // ======================================

  {
    id: "e-cigarette",

    keywords: [
      "電子煙",
      "電子菸",
      "電子煙主機",
      "電子菸主機",
      "vape",
      "vaping",
      "e-cigarette",
      "ecigarette",
    ],

    title:
      "電子煙搭機限制",

    summary:
      "電子煙含有電池，航空運輸有特殊限制，目的地也可能禁止攜帶。",

    recommendedBaggage:
      "carry-on",

    level:
      "danger",

    rules: [
      "若航空公司及目的地允許攜帶，電子煙應放在隨身行李",
      "不可放入託運行李",
      "飛行途中不得使用或充電",
      "應防止意外啟動及電池短路",
      "部分國家或地區禁止持有或攜入電子煙，出發前務必確認目的地法規",
    ],

    sourceName:
      "IATA",

    sourceUrl:
      "https://www.iata.org/en/youandiata/travelers/batteries",

    updatedAt:
      "2026",
  },

  // ======================================
  // 🧳 智慧行李箱
  // ======================================

  {
    id: "smart-baggage",

    keywords: [
      "智慧行李箱",
      "智能行李箱",
      "電動行李箱",
      "騎乘行李箱",
      "smart luggage",
      "smart baggage",
      "smart suitcase",
    ],

    title:
      "智慧行李箱電池限制",

    summary:
      "內建鋰電池的智慧行李箱，能否攜帶通常取決於電池是否可拆卸。",

    recommendedBaggage:
      "either",

    level:
      "danger",

    rules: [
      "出發前先確認內建鋰電池是否可以拆卸",
      "若行李箱需要託運，通常必須先拆下可拆式鋰電池",
      "拆下的鋰電池應放入隨身行李",
      "不可拆卸電池的智慧行李箱可能無法被航空公司接受",
      "不同航空公司可能有額外限制，務必提前確認",
    ],

    sourceName:
      "IATA",

    sourceUrl:
      "https://www.iata.org/en/youandiata/travelers/batteries",

    updatedAt:
      "2026",
  },

  // ======================================
  // 💧 液體 / 凝膠
  // ======================================

  {
    id: "liquid-gel",

    keywords: [
      "洗髮精",
      "洗髮乳",
      "沐浴乳",
      "洗面乳",
      "乳液",
      "化妝水",
      "卸妝液",
      "卸妝油",
      "精華液",
      "防曬乳",
      "牙膏",
      "髮膠",
      "凝膠",
      "香水",
      "漱口水",
      "隱形眼鏡藥水",
      "液體",
      "liquid",
      "gel",
      "perfume",
      "shampoo",
    ],

    title:
      "液體、凝膠類隨身限制",

    summary:
      "液體、凝膠及部分膏狀用品放入隨身行李時會受到安檢容量限制。",

    recommendedBaggage:
      "checked",

    level:
      "warning",

    rules: [
      "若要放入隨身行李，常見國際安檢規定為單一容器不超過 100 mL",
      "液體容器通常需集中放入透明、可重複密封的塑膠袋",
      "常見規範為透明袋總容量不超過 1 公升",
      "超過隨身安檢容量的液體建議放入託運行李",
      "藥品、嬰兒食品及特殊飲食用品可能有例外規定",
      "轉機及各國機場的安檢要求可能不同",
    ],

    sourceName:
      "IATA",

    sourceUrl:
      "https://www.iata.org/en/programs/ops-infra/baggage/passenger-baggage-rules",

    updatedAt:
      "2026",
  },

  // ======================================
  // 💨 噴霧
  // ======================================

  {
    id: "aerosol",

    keywords: [
      "噴霧",
      "噴霧罐",
      "定型噴霧",
      "髮型噴霧",
      "防曬噴霧",
      "止汗噴霧",
      "刮鬍泡",
      "aerosol",
      "hairspray",
    ],

    title:
      "噴霧用品搭機注意",

    summary:
      "噴霧用品可能同時受到液體安檢及危險物品規定限制。",

    recommendedBaggage:
      "checked",

    level:
      "warning",

    rules: [
      "隨身攜帶時可能受到 100 mL 液體安檢限制",
      "一般盥洗或個人用品在合理數量下通常可以攜帶",
      "噴嘴或閥門應有保護措施，避免意外釋放內容物",
      "易燃、工業用途或非一般盥洗用途噴霧可能禁止攜帶",
      "請依產品內容物及航空公司的最新規定確認",
    ],

    sourceName:
      "IATA",

    sourceUrl:
      "https://www.iata.org/en/programs/cargo/dangerous-goods/dgr-guidance-passengers",

    updatedAt:
      "2026",
  },

  // ======================================
  // ✂️ 刀具 / 尖銳物
  // ======================================

  {
    id: "sharp-object",

    keywords: [
      "剪刀",
      "指甲剪",
      "修眉刀",
      "美工刀",
      "水果刀",
      "菜刀",
      "小刀",
      "瑞士刀",
      "刀具",
      "裁紙刀",
      "刀片",
      "scissors",
      "knife",
      "cutter",
    ],

    title:
      "刀具、尖銳物品限制",

    summary:
      "刀具及多數尖銳、切割用品不可放入隨身行李。",

    recommendedBaggage:
      "checked",

    level:
      "danger",

    rules: [
      "刀具及切割工具通常不可放入隨身行李",
      "需要攜帶時應優先放入託運行李",
      "應妥善包裝刀刃及尖銳部分，避免造成傷害",
      "不同國家、機場及航空公司對尺寸與種類可能有額外限制",
    ],

    sourceName:
      "IATA",

    sourceUrl:
      "https://www.iata.org/en/programs/ops-infra/baggage/passenger-baggage-rules",

    updatedAt:
      "2026",
  },

  // ======================================
  // 💊 藥品
  // ======================================

  {
    id: "medicine",

    keywords: [
      "處方藥",
      "藥品",
      "藥物",
      "液體藥",
      "胰島素",
      "針筒",
      "注射器",
      "medicine",
      "medication",
      "insulin",
      "syringe",
    ],

    title:
      "藥品與醫療用品搭機注意",

    summary:
      "藥品通常可以攜帶，但液體藥品、針具及特殊醫療用品可能需要額外說明或證明。",

    recommendedBaggage:
      "carry-on",

    level:
      "warning",

    rules: [
      "旅途中需要使用的重要藥品建議放在隨身行李",
      "處方藥建議保留原包裝及藥品標示",
      "液體藥品可能適用醫療用途例外，但安檢時可能需要另外申報",
      "攜帶針筒或注射器時，建議備妥可證明醫療需求的文件",
      "目的地國家可能對部分處方藥或管制藥物有不同入境規定",
    ],

    sourceName:
      "IATA",

    sourceUrl:
      "https://www.iata.org/en/programs/ops-infra/baggage/passenger-baggage-rules",

    updatedAt:
      "2026",
  },

  // ======================================
  // 💻 含鋰電池電子設備
  // ======================================

  {
    id: "portable-electronics",

    keywords: [
      "筆電",
      "筆記型電腦",
      "平板",
      "ipad",
      "macbook",
      "laptop",
      "相機",
      "camera",
      "無人機",
      "drone",
    ],

    title:
      "鋰電池電子設備搭機注意",

    summary:
      "筆電、相機、平板及無人機等設備通常含有鋰電池，建議隨身攜帶。",

    recommendedBaggage:
      "carry-on",

    level:
      "warning",

    rules: [
      "含鋰電池的電子設備建議放入隨身行李",
      "若航空公司允許設備託運，設備應完全關機並防止意外啟動及損壞",
      "備用鋰電池不可放入託運行李",
      "若設備使用超過 100 Wh 的大型電池，應先確認是否需要航空公司同意",
      "若登機門要求將手提行李改為託運，記得先取出備用鋰電池及行動電源",
    ],

    sourceName:
      "IATA",

    sourceUrl:
      "https://www.iata.org/en/youandiata/travelers/batteries",

    updatedAt:
      "2026",
  },
];

// ========================================
// NORMALIZE
// ========================================

function normalizeText(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

// ========================================
// FIND MATCHING RULE
// ========================================

export function findBaggageRule(
  itemName: string
):
  | BaggageRule
  | null {
  const normalizedName =
    normalizeText(itemName);

  if (!normalizedName) {
    return null;
  }

  const rule =
    baggageRules.find(
      (candidate) =>
        candidate.keywords.some(
          (keyword) =>
            normalizedName.includes(
              normalizeText(
                keyword
              )
            )
        )
    );

  return rule ?? null;
}