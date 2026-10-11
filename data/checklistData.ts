// ========================================
// BAGGAGE TYPE
// ========================================

export type BaggageType =
  | "carry-on"
  | "checked"
  | "either"
  | "none";


// ========================================
// CATEGORY
// ========================================

export type ChecklistCategory = {
  id: string;
  title: string;
  icon: string;
  isCustom?: boolean;
};


// ========================================
// ITEM
// ========================================

export type ChecklistItem = {
  id: string;

  categoryId: string;

  title: string;

  // 系統 / App 提供的注意事項
  note?: string;

  // 使用者自己的備註
  userNote?: string;

  baggage: BaggageType;

  completed: boolean;

  isCustom?: boolean;
};


// ========================================
// STORAGE DATA
// ========================================

export type ChecklistData = {
  categories: ChecklistCategory[];
  items: ChecklistItem[];
};


// ========================================
// SHARE DATA
// ========================================

export type SharedChecklistData = {
  version: 1;

  type: "our-travel-packing-list";

  categories: {
    id: string;
    title: string;
    icon: string;
  }[];

  items: {
    id: string;
    categoryId: string;
    title: string;
    note?: string;
    userNote?: string;
    baggage: BaggageType;
  }[];
};


// ========================================
// DEFAULT CATEGORIES
// ========================================

export const initialChecklistCategories:
  ChecklistCategory[] = [

  {
    id: "documents",
    title: "重要證件與財務",
    icon: "🪪",
  },

  {
    id: "clothing",
    title: "衣物與配件",
    icon: "👕",
  },

  {
    id: "electronics",
    title: "3C 電子設備",
    icon: "🔌",
  },

  {
    id: "toiletries",
    title: "盥洗與保養",
    icon: "🧴",
  },

  {
    id: "medicine",
    title: "常備藥品",
    icon: "💊",
  },

];


// ========================================
// DEFAULT ITEMS
// ========================================

export const initialChecklistItems:
  ChecklistItem[] = [

  // ======================================
  // DOCUMENTS
  // ======================================

  {
    id: "passport",
    categoryId: "documents",
    title: "護照",
    note:
      "隨身攜帶｜確認效期與入境要求，勿放託運行李",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "id-card",
    categoryId: "documents",
    title: "身分證",
    note:
      "建議隨身保管",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "health-card",
    categoryId: "documents",
    title: "健保卡",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "driver-license",
    categoryId: "documents",
    title: "駕照 / 國際駕照",
    note:
      "有自駕需求再攜帶，並確認目的地要求",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "flight-documents",
    categoryId: "documents",
    title: "機票 / 航班資料",
    note:
      "建議手機保存電子版本",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "hotel-documents",
    categoryId: "documents",
    title: "住宿確認資料",
    note:
      "保存飯店名稱、地址與訂房資訊",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "entry-documents",
    categoryId: "documents",
    title: "入境資料 / Visit Japan Web",
    note:
      "出發前確認是否需要完成相關入境程序",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "cash",
    categoryId: "documents",
    title: "現金 / 外幣",
    note:
      "建議分散保管，不要全部放在同一處",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "credit-card",
    categoryId: "documents",
    title: "信用卡",
    note:
      "出發前確認海外交易功能",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "document-backup",
    categoryId: "documents",
    title: "重要證件備份",
    note:
      "手機電子檔或紙本備份，與正本分開保管",
    baggage: "either",
    completed: false,
  },


  // ======================================
  // CLOTHING
  // ======================================

  {
    id: "underwear",
    categoryId: "clothing",
    title: "內衣褲",
    baggage: "checked",
    completed: false,
  },

  {
    id: "socks",
    categoryId: "clothing",
    title: "襪子",
    baggage: "checked",
    completed: false,
  },

  {
    id: "sleepwear",
    categoryId: "clothing",
    title: "睡衣",
    baggage: "checked",
    completed: false,
  },

  {
    id: "tops",
    categoryId: "clothing",
    title: "上衣",
    baggage: "checked",
    completed: false,
  },

  {
    id: "pants",
    categoryId: "clothing",
    title: "長褲 / 裙子",
    baggage: "checked",
    completed: false,
  },

  {
    id: "jacket",
    categoryId: "clothing",
    title: "外套 / 保暖衣物",
    note:
      "依目的地氣候調整",
    baggage: "either",
    completed: false,
  },

  {
    id: "shoes",
    categoryId: "clothing",
    title: "好走的鞋子",
    baggage: "either",
    completed: false,
  },

  {
    id: "slippers",
    categoryId: "clothing",
    title: "拖鞋",
    baggage: "checked",
    completed: false,
  },

  {
    id: "umbrella",
    categoryId: "clothing",
    title: "摺疊雨傘",
    note:
      "攜帶規定可能依機場及航空公司不同",
    baggage: "either",
    completed: false,
  },


  // ======================================
  // ELECTRONICS
  // ======================================

  {
    id: "phone",
    categoryId: "electronics",
    title: "手機",
    note:
      "建議隨身攜帶",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "charger",
    categoryId: "electronics",
    title: "充電器",
    baggage: "either",
    completed: false,
  },

  {
    id: "charging-cable",
    categoryId: "electronics",
    title: "充電線",
    baggage: "either",
    completed: false,
  },

  {
    id: "power-bank",
    categoryId: "electronics",
    title: "行動電源",
    note:
      "⚠️ 必須隨身｜不可託運｜容量與數量請確認航空公司最新規定",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "earphones",
    categoryId: "electronics",
    title: "耳機 / 藍牙耳機",
    note:
      "含鋰電池設備建議隨身攜帶",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "adapter",
    categoryId: "electronics",
    title: "轉接插頭",
    baggage: "either",
    completed: false,
  },

  {
    id: "esim",
    categoryId: "electronics",
    title: "SIM / eSIM",
    note:
      "eSIM 建議出國前先完成安裝與設定",
    baggage: "none",
    completed: false,
  },


  // ======================================
  // TOILETRIES
  // ======================================

  {
    id: "toothbrush",
    categoryId: "toiletries",
    title: "牙刷",
    baggage: "either",
    completed: false,
  },

  {
    id: "toothpaste",
    categoryId: "toiletries",
    title: "牙膏",
    note:
      "隨身攜帶時注意液體 / 膠狀物容量限制",
    baggage: "either",
    completed: false,
  },

  {
    id: "face-wash",
    categoryId: "toiletries",
    title: "洗面乳",
    note:
      "隨身攜帶時單一容器通常不得超過 100 mL",
    baggage: "either",
    completed: false,
  },

  {
    id: "towel",
    categoryId: "toiletries",
    title: "毛巾",
    baggage: "checked",
    completed: false,
  },

  {
    id: "sunscreen",
    categoryId: "toiletries",
    title: "防曬用品",
    note:
      "液體隨身攜帶時注意容量限制",
    baggage: "either",
    completed: false,
  },

  {
    id: "lip-balm",
    categoryId: "toiletries",
    title: "護唇膏",
    baggage: "either",
    completed: false,
  },

  {
    id: "skincare",
    categoryId: "toiletries",
    title: "保養品",
    note:
      "液體隨身攜帶時注意容量限制",
    baggage: "either",
    completed: false,
  },

  {
    id: "shampoo",
    categoryId: "toiletries",
    title: "洗髮 / 沐浴用品",
    note:
      "大容量液體建議放託運行李",
    baggage: "checked",
    completed: false,
  },


  // ======================================
  // MEDICINE
  // ======================================

  {
    id: "prescription",
    categoryId: "medicine",
    title: "個人處方藥",
    note:
      "建議隨身｜保留原包裝，必要時準備處方或相關證明",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "cold-medicine",
    categoryId: "medicine",
    title: "感冒藥",
    baggage: "either",
    completed: false,
  },

  {
    id: "stomach-medicine",
    categoryId: "medicine",
    title: "腸胃藥",
    baggage: "either",
    completed: false,
  },

  {
    id: "painkiller",
    categoryId: "medicine",
    title: "止痛藥",
    baggage: "either",
    completed: false,
  },

  {
    id: "motion-sickness",
    categoryId: "medicine",
    title: "暈車藥",
    baggage: "carry-on",
    completed: false,
  },

  {
    id: "bandage",
    categoryId: "medicine",
    title: "OK 繃",
    baggage: "either",
    completed: false,
  },

];


// ========================================
// INITIAL DATA
// ========================================

export const initialChecklistData:
  ChecklistData = {

  categories:
    initialChecklistCategories,

  items:
    initialChecklistItems,

};