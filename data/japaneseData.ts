export type JapaneseCategory =
  | "basic"
  | "transport"
  | "restaurant"
  | "vegetarian"
  | "hotel"
  | "shopping"
  | "emergency";

export type JapanesePhrase = {
  id: string;
  category: JapaneseCategory;
  japanese: string;
  reading?: string;
  romaji: string;
  chinese: string;
  keywords?: string[];
  important?: boolean;

  // 特殊互動句型
  interactiveType?:
    | "quantity"
    | "people";
};

export const japaneseCategories = [
  {
    id: "all",
    label: "全部",
    icon: "✨",
  },
  {
    id: "basic",
    label: "基本",
    icon: "💬",
  },
  {
    id: "transport",
    label: "交通",
    icon: "🚉",
  },
  {
    id: "restaurant",
    label: "餐廳",
    icon: "🍜",
  },
  {
    id: "vegetarian",
    label: "素食",
    icon: "🌱",
  },
  {
    id: "hotel",
    label: "飯店",
    icon: "🏨",
  },
  {
    id: "shopping",
    label: "購物",
    icon: "🛍️",
  },
  {
    id: "emergency",
    label: "緊急",
    icon: "🆘",
  },
] as const;

export const japanesePhrases: JapanesePhrase[] = [
  // ========================================
  // BASIC
  // ========================================

  {
    id: "basic-thanks",
    category: "basic",
    japanese:
      "ありがとうございます。",
    romaji:
      "Arigatou gozaimasu.",
    chinese:
      "謝謝您。",
    keywords: [
      "謝謝",
      "感謝",
    ],
  },

  {
    id: "basic-excuse-me",
    category: "basic",
    japanese:
      "すみません。",
    romaji:
      "Sumimasen.",
    chinese:
      "不好意思／請問一下。",
    keywords: [
      "不好意思",
      "請問",
      "抱歉",
    ],
    important: true,
  },

  {
    id: "basic-please",
    category: "basic",
    japanese:
      "お願いします。",
    romaji:
      "Onegaishimasu.",
    chinese:
      "麻煩您了／拜託了。",
    keywords: [
      "麻煩",
      "拜託",
    ],
  },

  {
    id: "basic-dont-understand",
    category: "basic",
    japanese:
      "日本語がよく分かりません。",
    romaji:
      "Nihongo ga yoku wakarimasen.",
    chinese:
      "我的日文不太好／不太懂日文。",
    keywords: [
      "聽不懂",
      "日文不好",
    ],
    important: true,
  },

  {
    id: "basic-slowly",
    category: "basic",
    japanese:
      "もう少しゆっくり話してもらえますか？",
    romaji:
      "Mou sukoshi yukkuri hanashite moraemasu ka?",
    chinese:
      "可以再說慢一點嗎？",
    keywords: [
      "說慢",
      "聽不懂",
    ],
  },

  {
    id: "basic-show-phone",
    category: "basic",
    japanese:
      "これを見てもらえますか？",
    romaji:
      "Kore o mite moraemasu ka?",
    chinese:
      "可以麻煩您看一下這個嗎？",
    keywords: [
      "手機",
      "給你看",
      "看一下",
    ],
  },

  // ========================================
  // TRANSPORT
  // ========================================

  {
    id: "transport-where",
    category: "transport",
    japanese:
      "この電車は京都駅に行きますか？",
    romaji:
      "Kono densha wa Kyoto-eki ni ikimasu ka?",
    chinese:
      "這班電車有到京都站嗎？",
    keywords: [
      "電車",
      "京都",
      "車站",
    ],
  },

  {
    id: "transport-platform",
    category: "transport",
    japanese:
      "何番ホームですか？",
    romaji:
      "Nanban hoomu desu ka?",
    chinese:
      "是第幾月台？",
    keywords: [
      "月台",
      "幾號月台",
    ],
    important: true,
  },

  {
    id: "transport-transfer",
    category: "transport",
    japanese:
      "どこで乗り換えますか？",
    romaji:
      "Doko de norikaemasu ka?",
    chinese:
      "要在哪裡轉車？",
    keywords: [
      "轉車",
      "轉乘",
    ],
    important: true,
  },

  {
    id: "transport-ticket",
    category: "transport",
    japanese:
      "この切符は使えますか？",
    romaji:
      "Kono kippu wa tsukaemasu ka?",
    chinese:
      "這張票可以使用嗎？",
    keywords: [
      "票",
      "車票",
    ],
  },

  {
    id: "transport-ic",
    category: "transport",
    japanese:
      "ICカードは使えますか？",
    romaji:
      "IC kaado wa tsukaemasu ka?",
    chinese:
      "可以使用 IC 卡嗎？",
    keywords: [
      "ic",
      "suica",
      "icoca",
      "交通卡",
    ],
  },

  {
    id: "transport-last-train",
    category: "transport",
    japanese:
      "終電は何時ですか？",
    romaji:
      "Shuuden wa nanji desu ka?",
    chinese:
      "末班車是幾點？",
    keywords: [
      "末班車",
      "最後一班",
    ],
  },

  // ========================================
  // RESTAURANT
  // ========================================

  {
    id: "restaurant-quantity",
    category: "restaurant",
    japanese:
      "これを一つお願いします。",
    romaji:
      "Kore o hitotsu onegaishimasu.",
    chinese:
      "請給我一份這個。",
    keywords: [
      "一份",
      "兩份",
      "三份",
      "幾份",
      "幾個",
      "數量",
      "點餐",
    ],
    important: true,
    interactiveType:
      "quantity",
  },

  {
    id: "restaurant-people",
    category: "restaurant",
    japanese:
      "二人です。",
    romaji:
      "Futari desu.",
    chinese:
      "我們兩位。",
    keywords: [
      "幾位",
      "人數",
      "兩位",
      "三位",
      "幾個人",
      "用餐人數",
    ],
    important: true,
    interactiveType:
      "people",
  },

  {
    id: "restaurant-recommend",
    category: "restaurant",
    japanese:
      "おすすめは何ですか？",
    romaji:
      "Osusume wa nan desu ka?",
    chinese:
      "有什麼推薦的嗎？",
    keywords: [
      "推薦",
      "招牌",
    ],
  },

  {
    id: "restaurant-water",
    category: "restaurant",
    japanese:
      "お水をお願いします。",
    romaji:
      "Omizu o onegaishimasu.",
    chinese:
      "麻煩給我水。",
    keywords: [
      "水",
      "開水",
    ],
  },

  {
    id: "restaurant-card",
    category: "restaurant",
    japanese:
      "カードは使えますか？",
    romaji:
      "Kaado wa tsukaemasu ka?",
    chinese:
      "可以刷卡嗎？",
    keywords: [
      "刷卡",
      "信用卡",
      "card",
    ],
    important: true,
  },

  {
    id: "restaurant-bill",
    category: "restaurant",
    japanese:
      "お会計をお願いします。",
    romaji:
      "Okaikei o onegaishimasu.",
    chinese:
      "麻煩結帳。",
    keywords: [
      "結帳",
      "買單",
    ],
    important: true,
  },

  {
    id: "restaurant-reservation",
    category: "restaurant",
    japanese:
      "予約しています。",
    romaji:
      "Yoyaku shiteimasu.",
    chinese:
      "我有預約。",
    keywords: [
      "預約",
      "訂位",
    ],
  },

  // ========================================
  // VEGETARIAN
  // ========================================

  {
    id: "veg-basic",
    category: "vegetarian",
    japanese:
      "私はベジタリアンです。",
    romaji:
      "Watashi wa bejitarian desu.",
    chinese:
      "我吃素。",
    keywords: [
      "素食",
      "吃素",
      "vegetarian",
    ],
    important: true,
  },

  {
    id: "veg-meat-fish",
    category: "vegetarian",
    japanese:
      "肉と魚は食べません。",
    romaji:
      "Niku to sakana wa tabemasen.",
    chinese:
      "我不吃肉和魚。",
    keywords: [
      "肉",
      "魚",
      "素食",
    ],
    important: true,
  },

  {
    id: "veg-onion-garlic-check",
    category: "vegetarian",
    japanese:
      "ネギやニンニクは入っていますか？",
    romaji:
      "Negi ya ninniku wa haitteimasu ka?",
    chinese:
      "請問裡面有蔥或蒜嗎？",
    keywords: [
      "蔥",
      "蒜",
      "大蒜",
      "五辛",
    ],
    important: true,
  },

  {
    id: "veg-onion-garlic-remove",
    category: "vegetarian",
    japanese:
      "ネギとニンニクは抜いてもらえますか？",
    romaji:
      "Negi to ninniku wa nuite moraemasu ka?",
    chinese:
      "可以幫我不要加蔥和蒜嗎？",
    keywords: [
      "不要蔥",
      "不要蒜",
      "去掉",
      "五辛",
    ],
    important: true,
  },

  {
    id: "veg-no-onion-garlic-chive",
    category: "vegetarian",
    japanese:
      "ネギ、ニンニク、ニラは食べません。",
    romaji:
      "Negi, ninniku, nira wa tabemasen.",
    chinese:
      "我不吃蔥、蒜和韭菜。",
    keywords: [
      "蔥",
      "蒜",
      "韭菜",
      "五辛",
    ],
    important: true,
  },

  {
    id: "veg-stock",
    category: "vegetarian",
    japanese:
      "だしに魚や肉を使っていますか？",
    romaji:
      "Dashi ni sakana ya niku o tsukatteimasu ka?",
    chinese:
      "高湯有使用魚或肉嗎？",
    keywords: [
      "高湯",
      "湯底",
      "出汁",
      "だし",
    ],
    important: true,
  },

  {
    id: "veg-bonito",
    category: "vegetarian",
    japanese:
      "かつおだしは入っていますか？",
    romaji:
      "Katsuo dashi wa haitteimasu ka?",
    chinese:
      "裡面有柴魚高湯嗎？",
    keywords: [
      "柴魚",
      "柴魚高湯",
      "鰹魚",
    ],
    important: true,
  },

  {
    id: "veg-animal",
    category: "vegetarian",
    japanese:
      "動物性の食材は入っていますか？",
    romaji:
      "Doubutsusei no shokuzai wa haitteimasu ka?",
    chinese:
      "裡面有動物性食材嗎？",
    keywords: [
      "動物性",
      "素食",
    ],
  },

  {
    id: "veg-egg-milk-ok",
    category: "vegetarian",
    japanese:
      "卵と乳製品は大丈夫です。",
    romaji:
      "Tamago to nyuuseihin wa daijoubu desu.",
    chinese:
      "蛋和乳製品可以。",
    keywords: [
      "蛋奶素",
      "雞蛋",
      "牛奶",
    ],
  },

  {
    id: "veg-egg-milk-no",
    category: "vegetarian",
    japanese:
      "卵と乳製品も食べません。",
    romaji:
      "Tamago to nyuuseihin mo tabemasen.",
    chinese:
      "蛋和乳製品也不吃。",
    keywords: [
      "純素",
      "vegan",
      "蛋",
      "牛奶",
    ],
  },

  // ========================================
  // HOTEL
  // ========================================

  {
    id: "hotel-checkin",
    category: "hotel",
    japanese:
      "チェックインをお願いします。",
    romaji:
      "Chekkuin o onegaishimasu.",
    chinese:
      "我要辦理入住。",
    keywords: [
      "入住",
      "check in",
    ],
  },

  {
    id: "hotel-reservation",
    category: "hotel",
    japanese:
      "予約しています。",
    romaji:
      "Yoyaku shiteimasu.",
    chinese:
      "我有預約。",
    keywords: [
      "訂房",
      "預約",
    ],
  },

  {
    id: "hotel-luggage",
    category: "hotel",
    japanese:
      "荷物を預けてもいいですか？",
    romaji:
      "Nimotsu o azukete mo ii desu ka?",
    chinese:
      "可以寄放行李嗎？",
    keywords: [
      "寄放",
      "行李",
      "寄物",
    ],
    important: true,
  },

  {
    id: "hotel-wifi",
    category: "hotel",
    japanese:
      "Wi-Fiのパスワードを教えてください。",
    romaji:
      "Waifai no pasuwaado o oshiete kudasai.",
    chinese:
      "請告訴我 Wi-Fi 密碼。",
    keywords: [
      "wifi",
      "密碼",
      "網路",
    ],
  },

  // ========================================
  // SHOPPING
  // ========================================

  {
    id: "shopping-price",
    category: "shopping",
    japanese:
      "これはいくらですか？",
    romaji:
      "Kore wa ikura desu ka?",
    chinese:
      "這個多少錢？",
    keywords: [
      "多少錢",
      "價格",
    ],
    important: true,
  },

  {
    id: "shopping-taxfree",
    category: "shopping",
    japanese:
      "免税できますか？",
    romaji:
      "Menzei dekimasu ka?",
    chinese:
      "可以免稅嗎？",
    keywords: [
      "免稅",
      "退稅",
      "tax free",
    ],
    important: true,
  },

  {
    id: "shopping-size",
    category: "shopping",
    japanese:
      "ほかのサイズはありますか？",
    romaji:
      "Hoka no saizu wa arimasu ka?",
    chinese:
      "有其他尺寸嗎？",
    keywords: [
      "尺寸",
      "size",
    ],
  },

  {
    id: "shopping-try",
    category: "shopping",
    japanese:
      "試着してもいいですか？",
    romaji:
      "Shichaku shite mo ii desu ka?",
    chinese:
      "可以試穿嗎？",
    keywords: [
      "試穿",
      "衣服",
    ],
  },

  {
    id: "shopping-bag",
    category: "shopping",
    japanese:
      "袋をお願いします。",
    romaji:
      "Fukuro o onegaishimasu.",
    chinese:
      "麻煩給我袋子。",
    keywords: [
      "袋子",
      "購物袋",
    ],
  },

  // ========================================
  // EMERGENCY
  // ========================================

  {
    id: "emergency-help",
    category: "emergency",
    japanese:
      "助けてください。",
    romaji:
      "Tasukete kudasai.",
    chinese:
      "請幫幫我。",
    keywords: [
      "救命",
      "幫忙",
      "求助",
    ],
    important: true,
  },

  {
    id: "emergency-police",
    category: "emergency",
    japanese:
      "警察を呼んでください。",
    romaji:
      "Keisatsu o yonde kudasai.",
    chinese:
      "請幫我叫警察。",
    keywords: [
      "警察",
      "報警",
    ],
    important: true,
  },

  {
    id: "emergency-ambulance",
    category: "emergency",
    japanese:
      "救急車を呼んでください。",
    romaji:
      "Kyuukyuusha o yonde kudasai.",
    chinese:
      "請幫我叫救護車。",
    keywords: [
      "救護車",
      "醫院",
    ],
    important: true,
  },

  {
    id: "emergency-lost",
    category: "emergency",
    japanese:
      "道に迷いました。",
    romaji:
      "Michi ni mayoimashita.",
    chinese:
      "我迷路了。",
    keywords: [
      "迷路",
      "找不到路",
    ],
  },

  {
    id: "emergency-lost-item",
    category: "emergency",
    japanese:
      "忘れ物をしました。",
    romaji:
      "Wasuremono o shimashita.",
    chinese:
      "我遺失／忘了東西。",
    keywords: [
      "遺失",
      "掉東西",
      "忘東西",
    ],
  },
];