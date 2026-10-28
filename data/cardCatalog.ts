export type CardCatalogRegion =
  | "japan"
  | "korea"
  | "thailand"
  | "overseas";


export type CardSpendingType =
  | "general"
  | "physical"
  | "online"
  | "selected";


export type CardRewardRule = {
  id: string;

  label: string;

  /**
   * 此規則的回饋率。
   *
   * 注意：
   * 有些銀行活動的 5% 是「總回饋」，
   * 有些則是「額外加碼 5%」。
   *
   * V1 先以官方活動文字為準，
   * 不自行推導不同規則可以相加。
   */
  rewardRate: number;

  regions: CardCatalogRegion[];

  validFrom: string;
  validUntil: string;

  registrationRequired?: boolean;

  /**
   * 消費門檻
   *
   * 例：
   * 累積消費滿 NT$20,000
   * 才取得這個加碼資格。
   */
  minimumSpendTWD?: number;

  /**
   * 符合此回饋的消費額度上限。
   *
   * 例：
   * 最多 NT$6,250 消費可以享有加碼。
   *
   * 這不是回饋金。
   */
  eligibleSpendCapTWD?: number;

  /**
   * 此規則最多可以拿到多少回饋。
   *
   * 例：
   * 加碼回饋最高 NT$500。
   *
   * 這不是消費額度。
   */
  rewardAmountCapTWD?: number;

  spendingType?: CardSpendingType;

  note?: string;
};


export type CardCatalogItem = {
  id: string;

  issuer: string;
  name: string;

  /**
   * 卡片列表上顯示的「最高回饋」。
   *
   * 僅供摘要顯示。
   * 未來 BEST CARD 不可以只拿這個數字比較。
   */
  headlineRewardRate: number;

  regions: CardCatalogRegion[];

  rewardRules: CardRewardRule[];

  requirements?: string[];

  officialUrl: string;

  /**
   * 我們最後確認官方資料的日期。
   */
  verifiedAt: string;

  /**
   * 未來自動更新 Catalog 時使用。
   */
  sourceVersion?: string;

  note?: string;
};


// ========================================
// CARD CATALOG
// ========================================

export const cardCatalog: CardCatalogItem[] = [
  // ========================================
  // 中國信託 uniopen
  // ========================================

  {
    id: "ctbc-uniopen",

    issuer: "中國信託",

    name: "uniopen 聯名卡",

    headlineRewardRate: 11,

    regions: [
      "overseas",
    ],

    rewardRules: [
      {
        id:
          "ctbc-uniopen-overseas-general-2026",

        label:
          "國外一般消費",

        rewardRate: 2,

        regions: [
          "overseas",
        ],

        validFrom:
          "2026-09-01",

        validUntil:
          "2026-12-31",

        spendingType:
          "general",

        note:
          "海外一般消費 2% OPENPOINT，依銀行公告之一般消費定義。",
      },

      {
        id:
          "ctbc-uniopen-overseas-physical-2026",

        label:
          "國外實體商店",

        rewardRate: 11,

        regions: [
          "overseas",
        ],

        validFrom:
          "2026-09-01",

        validUntil:
          "2026-12-31",

        spendingType:
          "physical",

        /**
         * 注意：
         *
         * 目前我們掌握的是：
         * 實體加碼 8% 每月最高 500 OPENPOINT。
         *
         * 500 是「回饋金額上限」，
         * 不是「消費額度上限」。
         */
        rewardAmountCapTWD:
          500,

        note:
          "國外實體商店最高 11%。其中實體消費加碼 8% 每月回饋上限 500 OPENPOINT。",
      },
    ],

    requirements: [
      "需完成 uniopen 會員連結以取得 OPENPOINT",
      "實體商店加碼不適用網路交易、條碼支付或部分第三方支付",
    ],

    officialUrl:
      "https://mkt.ctbcbank.com/long/creditcard/N2025052600033_01/index.html",

    verifiedAt:
      "2026-10-28",

    sourceVersion:
      "2026-10-28",

    note:
      "目前官方公告之海外活動至 2026/12/31。",
  },


  // ========================================
  // 永豐 現金回饋 JCB
  // ========================================

  {
    id:
      "sinopac-cashback-jcb",

    issuer:
      "永豐銀行",

    name:
      "現金回饋 JCB 卡",

    headlineRewardRate:
      10,

    regions: [
      "japan",
      "korea",
      "thailand",
      "overseas",
    ],

    rewardRules: [
      {
        id:
          "sinopac-jcb-overseas-base",

        label:
          "國外一般消費",

        rewardRate:
          2,

        regions: [
          "overseas",
        ],

        validFrom:
          "2026-07-01",

        validUntil:
          "2027-03-31",

        spendingType:
          "general",

        note:
          "國外一般消費基本回饋。",
      },

      {
        id:
          "sinopac-jcb-japan-selected",

        label:
          "日本特選通路",

        rewardRate:
          5,

        regions: [
          "japan",
        ],

        validFrom:
          "2026-07-01",

        validUntil:
          "2027-03-31",

        spendingType:
          "selected",

        /**
         * 這裡的 NT$300 是加碼回饋金額上限，
         * 不是只能消費 NT$300。
         */
        rewardAmountCapTWD:
          300,

        note:
          "最高 5%，包含國外基本回饋及特選通路加碼；每卡戶每期帳單加碼回饋上限依官方公告。",
      },

      {
        id:
          "sinopac-jcb-jkt-quarter",

        label:
          "日韓泰實體消費滿額加碼",

        rewardRate:
          5,

        regions: [
          "japan",
          "korea",
          "thailand",
        ],

        validFrom:
          "2026-07-01",

        validUntil:
          "2027-03-31",

        spendingType:
          "physical",

        registrationRequired:
          true,

        /**
         * 累積滿 NT$20,000
         * 才符合加碼資格。
         */
        minimumSpendTWD:
          20000,

        /**
         * 目前官方資訊明確的是：
         * 加碼 5% 回饋最高 NT$1,000。
         *
         * 因此：
         * 1000 / 5% = 20000
         *
         * 在純數學上代表最多約 NT$20,000
         * 消費可取得這段 5% 加碼。
         *
         * 但我們不在 Catalog 裡自行反推，
         * 先只存官方直接表達的回饋上限。
         */
        rewardAmountCapTWD:
          1000,

        note:
          "每季實體消費累積滿 NT$20,000，加碼 5%；每季需登錄且有限量名額。",
      },
    ],

    requirements: [
      "部分加碼需電子或行動帳單",
      "部分加碼需設定指定帳戶自動扣繳",
      "日韓泰滿額活動需每季登錄",
    ],

    officialUrl:
      "https://bank.sinopac.com/sinopacBT/webevents/2010_JCARD/index.html",

    verifiedAt:
      "2026-10-28",

    sourceVersion:
      "2026-10-28",

    note:
      "日本消費可能同時涉及基本、特選通路與滿額活動，實際資格須依交易類型與活動條件判斷。",
  },


  // ========================================
  // 玉山 熊本熊
  // ========================================

  {
    id:
      "esun-kumamon",

    issuer:
      "玉山銀行",

    name:
      "熊本熊卡",

    headlineRewardRate:
      8.5,

    regions: [
      "japan",
    ],

    /**
     * 尚未完成規則化。
     *
     * 所以保持空陣列，
     * UI 必須顯示「待確認規則」。
     */
    rewardRules: [],

    requirements: [],

    officialUrl:
      "https://www.esunbank.com/zh-tw/personal/credit-card/intro/",

    verifiedAt:
      "2026-10-28",

    sourceVersion:
      "2026-10-28",

    note:
      "玉山官方目前列示日本消費最高 8.5%。詳細規則尚未納入自動計算，因此目前僅作卡庫候選卡顯示。",
  },


  // ========================================
  // 聯邦 吉鶴
  // ========================================

  {
    id:
      "ubot-japanese-crane",

    issuer:
      "聯邦銀行",

    name:
      "吉鶴卡",

    headlineRewardRate:
      11,

    regions: [
      "japan",
    ],

    rewardRules: [],

    requirements: [],

    officialUrl:
      "https://card.ubot.com.tw/e_card/index.aspx",

    verifiedAt:
      "2026-10-28",

    sourceVersion:
      "2026-10-28",

    note:
      "官方目前列示日本旅遊最高 11%，目前收錄活動至 2026/12/31；詳細規則尚未納入自動計算。",
  },
];