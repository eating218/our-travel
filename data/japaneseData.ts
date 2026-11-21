export type JapaneseCategory = "basic" | "shopping" | "restaurant" | "vegetarian" | "transport" | "hotel" | "sightseeing" | "facilities" | "emergency";
export type JapanesePhrase = { id: string; category: JapaneseCategory; japanese: string; reading?: string; romaji: string; chinese: string; keywords?: string[]; important?: boolean; interactiveType?: "quantity" | "people" };
export const japaneseCategories: { id: JapaneseCategory; label: string; icon: string }[] = [
  {
    "id": "basic",
    "label": "基本",
    "icon": "💬"
  },
  {
    "id": "shopping",
    "label": "購物",
    "icon": "🛍️"
  },
  {
    "id": "restaurant",
    "label": "餐廳",
    "icon": "🍜"
  },
  {
    "id": "vegetarian",
    "label": "素食",
    "icon": "🥬"
  },
  {
    "id": "transport",
    "label": "交通",
    "icon": "🚆"
  },
  {
    "id": "hotel",
    "label": "飯店",
    "icon": "🏨"
  },
  {
    "id": "sightseeing",
    "label": "景點",
    "icon": "📍"
  },
  {
    "id": "facilities",
    "label": "設施",
    "icon": "🚻"
  },
  {
    "id": "emergency",
    "label": "緊急",
    "icon": "🆘"
  }
];
export const japanesePhrases: JapanesePhrase[] = [
  {
    "id": "basic-01",
    "category": "basic",
    "japanese": "こんにちは",
    "romaji": "Konnichiwa",
    "chinese": "你好",
    "important": false
  },
  {
    "id": "basic-02",
    "category": "basic",
    "japanese": "おはようございます",
    "romaji": "Ohayou gozaimasu",
    "chinese": "早安",
    "important": false
  },
  {
    "id": "basic-03",
    "category": "basic",
    "japanese": "こんばんは",
    "romaji": "Konbanwa",
    "chinese": "晚安／晚上好",
    "important": false
  },
  {
    "id": "basic-04",
    "category": "basic",
    "japanese": "ありがとうございます",
    "romaji": "Arigatou gozaimasu",
    "chinese": "謝謝",
    "important": false
  },
  {
    "id": "basic-05",
    "category": "basic",
    "japanese": "すみません",
    "romaji": "Sumimasen",
    "chinese": "不好意思／打擾一下",
    "important": true
  },
  {
    "id": "basic-06",
    "category": "basic",
    "japanese": "ごめんなさい",
    "romaji": "Gomen nasai",
    "chinese": "對不起",
    "important": false
  },
  {
    "id": "basic-07",
    "category": "basic",
    "japanese": "はい",
    "romaji": "Hai",
    "chinese": "是",
    "important": false
  },
  {
    "id": "basic-08",
    "category": "basic",
    "japanese": "いいえ",
    "romaji": "Iie",
    "chinese": "不是",
    "important": false
  },
  {
    "id": "basic-09",
    "category": "basic",
    "japanese": "大丈夫です",
    "romaji": "Daijoubu desu",
    "chinese": "沒問題",
    "important": false
  },
  {
    "id": "basic-10",
    "category": "basic",
    "japanese": "わかりません",
    "romaji": "Wakarimasen",
    "chinese": "我不懂",
    "important": false
  },
  {
    "id": "basic-11",
    "category": "basic",
    "japanese": "日本語があまり話せません",
    "romaji": "Nihongo ga amari hanasemasen",
    "chinese": "我不太會說日文",
    "important": false
  },
  {
    "id": "basic-12",
    "category": "basic",
    "japanese": "英語は話せますか？",
    "romaji": "Eigo wa hanasemasu ka?",
    "chinese": "你會說英文嗎？",
    "important": false
  },
  {
    "id": "basic-13",
    "category": "basic",
    "japanese": "もう一度お願いします",
    "romaji": "Mou ichido onegaishimasu",
    "chinese": "可以再說一次嗎？",
    "important": false
  },
  {
    "id": "basic-14",
    "category": "basic",
    "japanese": "ゆっくり話してもらえますか？",
    "romaji": "Yukkuri hanashite moraemasu ka?",
    "chinese": "可以說慢一點嗎？",
    "important": false
  },
  {
    "id": "basic-15",
    "category": "basic",
    "japanese": "翻訳アプリを使ってもいいですか？",
    "romaji": "Honyaku apuri o tsukatte mo ii desu ka?",
    "chinese": "可以用翻譯軟體嗎？",
    "important": false
  },
  {
    "id": "basic-16",
    "category": "basic",
    "japanese": "これは何ですか？",
    "romaji": "Kore wa nan desu ka?",
    "chinese": "這是什麼？",
    "important": false
  },
  {
    "id": "basic-17",
    "category": "basic",
    "japanese": "いいですか？",
    "romaji": "Ii desu ka?",
    "chinese": "可以嗎？",
    "important": false
  },
  {
    "id": "basic-18",
    "category": "basic",
    "japanese": "ちょっと待ってください",
    "romaji": "Chotto matte kudasai",
    "chinese": "請等一下",
    "important": false
  },
  {
    "id": "shopping-01",
    "category": "shopping",
    "japanese": "これはいくらですか？",
    "romaji": "Kore wa ikura desu ka?",
    "chinese": "這個多少錢？",
    "important": false
  },
  {
    "id": "shopping-02",
    "category": "shopping",
    "japanese": "これはありますか？",
    "romaji": "Kore wa arimasu ka?",
    "chinese": "有這個嗎？",
    "important": false
  },
  {
    "id": "shopping-03",
    "category": "shopping",
    "japanese": "これをください",
    "romaji": "Kore o kudasai",
    "chinese": "我想要這個",
    "important": false
  },
  {
    "id": "shopping-04",
    "category": "shopping",
    "japanese": "これを見せてもらえますか？",
    "romaji": "Kore o misete moraemasu ka?",
    "chinese": "可以看一下這個嗎？",
    "important": false
  },
  {
    "id": "shopping-05",
    "category": "shopping",
    "japanese": "他の色はありますか？",
    "romaji": "Hoka no iro wa arimasu ka?",
    "chinese": "有其他顏色嗎？",
    "important": false
  },
  {
    "id": "shopping-06",
    "category": "shopping",
    "japanese": "他のサイズはありますか？",
    "romaji": "Hoka no saizu wa arimasu ka?",
    "chinese": "有其他尺寸嗎？",
    "important": false
  },
  {
    "id": "shopping-07",
    "category": "shopping",
    "japanese": "試着してもいいですか？",
    "romaji": "Shichaku shite mo ii desu ka?",
    "chinese": "可以試穿嗎？",
    "important": false
  },
  {
    "id": "shopping-08",
    "category": "shopping",
    "japanese": "試着室はどこですか？",
    "romaji": "Shichakushitsu wa doko desu ka?",
    "chinese": "試衣間在哪裡？",
    "important": false
  },
  {
    "id": "shopping-09",
    "category": "shopping",
    "japanese": "カードは使えますか？",
    "romaji": "Kaado wa tsukaemasu ka?",
    "chinese": "可以刷卡嗎？",
    "important": false
  },
  {
    "id": "shopping-10",
    "category": "shopping",
    "japanese": "現金は使えますか？",
    "romaji": "Genkin wa tsukaemasu ka?",
    "chinese": "可以用現金嗎？",
    "important": false
  },
  {
    "id": "shopping-11",
    "category": "shopping",
    "japanese": "ICカードは使えますか？",
    "romaji": "IC kaado wa tsukaemasu ka?",
    "chinese": "可以用交通 IC 卡嗎？",
    "important": false
  },
  {
    "id": "shopping-12",
    "category": "shopping",
    "japanese": "免税できますか？",
    "romaji": "Menzei dekimasu ka?",
    "chinese": "可以免稅嗎？",
    "important": false
  },
  {
    "id": "shopping-13",
    "category": "shopping",
    "japanese": "免税カウンターはどこですか？",
    "romaji": "Menzei kauntaa wa doko desu ka?",
    "chinese": "免稅櫃台在哪裡？",
    "important": false
  },
  {
    "id": "shopping-14",
    "category": "shopping",
    "japanese": "袋はいりません",
    "romaji": "Fukuro wa irimasen",
    "chinese": "不需要袋子",
    "important": false
  },
  {
    "id": "shopping-15",
    "category": "shopping",
    "japanese": "袋をお願いします",
    "romaji": "Fukuro o onegaishimasu",
    "chinese": "請給我袋子",
    "important": false
  },
  {
    "id": "shopping-16",
    "category": "shopping",
    "japanese": "見ているだけです",
    "romaji": "Mite iru dake desu",
    "chinese": "只是看看",
    "important": false
  },
  {
    "id": "shopping-17",
    "category": "shopping",
    "japanese": "ちょっと考えます",
    "romaji": "Chotto kangaemasu",
    "chinese": "我再考慮一下",
    "important": false
  },
  {
    "id": "restaurant-03",
    "category": "restaurant",
    "japanese": "席はありますか？",
    "romaji": "Seki wa arimasu ka?",
    "chinese": "有位子嗎？",
    "important": false
  },
  {
    "id": "restaurant-04",
    "category": "restaurant",
    "japanese": "予約しています",
    "romaji": "Yoyaku shiteimasu",
    "chinese": "有預約",
    "important": false
  },
  {
    "id": "restaurant-05",
    "category": "restaurant",
    "japanese": "予約していません",
    "romaji": "Yoyaku shiteimasen",
    "chinese": "沒有預約",
    "important": false
  },
  {
    "id": "restaurant-06",
    "category": "restaurant",
    "japanese": "英語のメニューはありますか？",
    "romaji": "Eigo no menyuu wa arimasu ka?",
    "chinese": "有英文菜單嗎？",
    "important": false
  },
  {
    "id": "restaurant-07",
    "category": "restaurant",
    "japanese": "中国語のメニューはありますか？",
    "romaji": "Chuugokugo no menyuu wa arimasu ka?",
    "chinese": "有中文菜單嗎？",
    "important": false
  },
  {
    "id": "restaurant-08",
    "category": "restaurant",
    "japanese": "これをお願いします",
    "romaji": "Kore o onegaishimasu",
    "chinese": "我要這個",
    "important": false
  },
  {
    "id": "restaurant-09",
    "category": "restaurant",
    "japanese": "お水をお願いします",
    "romaji": "Omizu o onegaishimasu",
    "chinese": "請給我水",
    "important": false
  },
  {
    "id": "restaurant-10",
    "category": "restaurant",
    "japanese": "これは抜きにできますか？",
    "romaji": "Kore wa nuki ni dekimasu ka?",
    "chinese": "可以不要這個嗎？",
    "important": false
  },
  {
    "id": "restaurant-11",
    "category": "restaurant",
    "japanese": "これは辛いですか？",
    "romaji": "Kore wa karai desu ka?",
    "chinese": "這個辣嗎？",
    "important": false
  },
  {
    "id": "restaurant-12",
    "category": "restaurant",
    "japanese": "少なめにできますか？",
    "romaji": "Sukuname ni dekimasu ka?",
    "chinese": "可以少一點嗎？",
    "important": false
  },
  {
    "id": "restaurant-13",
    "category": "restaurant",
    "japanese": "おいしいです",
    "romaji": "Oishii desu",
    "chinese": "很好吃",
    "important": false
  },
  {
    "id": "restaurant-14",
    "category": "restaurant",
    "japanese": "ごちそうさまでした",
    "romaji": "Gochisousama deshita",
    "chinese": "我吃飽了／謝謝招待",
    "important": false
  },
  {
    "id": "restaurant-15",
    "category": "restaurant",
    "japanese": "お会計お願いします",
    "romaji": "Okaikei onegaishimasu",
    "chinese": "請結帳",
    "important": true
  },
  {
    "id": "restaurant-16",
    "category": "restaurant",
    "japanese": "別々に払えますか？",
    "romaji": "Betsubetsu ni haraemasu ka?",
    "chinese": "可以分開結帳嗎？",
    "important": false
  },
  {
    "id": "vegetarian-01",
    "category": "vegetarian",
    "japanese": "肉は入っていますか？",
    "romaji": "Niku wa haitte imasu ka?",
    "chinese": "這裡面有肉嗎？",
    "important": false
  },
  {
    "id": "vegetarian-02",
    "category": "vegetarian",
    "japanese": "魚は入っていますか？",
    "romaji": "Sakana wa haitte imasu ka?",
    "chinese": "有魚嗎？",
    "important": false
  },
  {
    "id": "vegetarian-03",
    "category": "vegetarian",
    "japanese": "魚介類は入っていますか？",
    "romaji": "Gyokairui wa haitte imasu ka?",
    "chinese": "有海鮮嗎？",
    "important": false
  },
  {
    "id": "vegetarian-04",
    "category": "vegetarian",
    "japanese": "卵は入っていますか？",
    "romaji": "Tamago wa haitte imasu ka?",
    "chinese": "有蛋嗎？",
    "important": false
  },
  {
    "id": "vegetarian-05",
    "category": "vegetarian",
    "japanese": "乳製品は入っていますか？",
    "romaji": "Nyuuseihin wa haitte imasu ka?",
    "chinese": "有牛奶／乳製品嗎？",
    "important": false
  },
  {
    "id": "vegetarian-06",
    "category": "vegetarian",
    "japanese": "魚のだしは入っていますか？",
    "romaji": "Sakana no dashi wa haitte imasu ka?",
    "chinese": "有魚高湯嗎？",
    "important": false
  },
  {
    "id": "vegetarian-07",
    "category": "vegetarian",
    "japanese": "かつお節は入っていますか？",
    "romaji": "Katsuobushi wa haitte imasu ka?",
    "chinese": "有柴魚嗎？",
    "important": false
  },
  {
    "id": "vegetarian-08",
    "category": "vegetarian",
    "japanese": "肉抜きにできますか？",
    "romaji": "Niku nuki ni dekimasu ka?",
    "chinese": "可以不放肉嗎？",
    "important": false
  },
  {
    "id": "vegetarian-09",
    "category": "vegetarian",
    "japanese": "魚抜きにできますか？",
    "romaji": "Sakana nuki ni dekimasu ka?",
    "chinese": "可以不放魚嗎？",
    "important": false
  },
  {
    "id": "vegetarian-10",
    "category": "vegetarian",
    "japanese": "ベジタリアン料理はありますか？",
    "romaji": "Bejitarian ryouri wa arimasu ka?",
    "chinese": "有素食料理嗎？",
    "important": false
  },
  {
    "id": "vegetarian-11",
    "category": "vegetarian",
    "japanese": "ヴィーガン料理はありますか？",
    "romaji": "Viigan ryouri wa arimasu ka?",
    "chinese": "有純素料理嗎？",
    "important": false
  },
  {
    "id": "transport-01",
    "category": "transport",
    "japanese": "○○駅はどこですか？",
    "romaji": "○○ eki wa doko desu ka?",
    "chinese": "○○站在哪裡？",
    "important": false
  },
  {
    "id": "transport-02",
    "category": "transport",
    "japanese": "○○に行きたいです",
    "romaji": "○○ ni ikitai desu",
    "chinese": "我要去○○",
    "important": false
  },
  {
    "id": "transport-03",
    "category": "transport",
    "japanese": "この電車は○○に行きますか？",
    "romaji": "Kono densha wa ○○ ni ikimasu ka?",
    "chinese": "這班車會到○○嗎？",
    "important": false
  },
  {
    "id": "transport-04",
    "category": "transport",
    "japanese": "どこで乗り換えますか？",
    "romaji": "Doko de norikaemasu ka?",
    "chinese": "我要在哪裡轉車？",
    "important": false
  },
  {
    "id": "transport-05",
    "category": "transport",
    "japanese": "どこで降りますか？",
    "romaji": "Doko de orimasu ka?",
    "chinese": "要在哪裡下車？",
    "important": false
  },
  {
    "id": "transport-06",
    "category": "transport",
    "japanese": "何番ホームですか？",
    "romaji": "Nanban hoomu desu ka?",
    "chinese": "哪個月台？",
    "important": false
  },
  {
    "id": "transport-07",
    "category": "transport",
    "japanese": "次の電車は何時ですか？",
    "romaji": "Tsugi no densha wa nanji desu ka?",
    "chinese": "下一班是幾點？",
    "important": false
  },
  {
    "id": "transport-08",
    "category": "transport",
    "japanese": "○○方面ですか？",
    "romaji": "○○ houmen desu ka?",
    "chinese": "這是往○○方向嗎？",
    "important": false
  },
  {
    "id": "transport-09",
    "category": "transport",
    "japanese": "切符はどこで買えますか？",
    "romaji": "Kippu wa doko de kaemasu ka?",
    "chinese": "車票在哪裡買？",
    "important": false
  },
  {
    "id": "transport-10",
    "category": "transport",
    "japanese": "ICカードは使えますか？",
    "romaji": "IC kaado wa tsukaemasu ka?",
    "chinese": "可以用 IC 卡嗎？",
    "important": false
  },
  {
    "id": "transport-11",
    "category": "transport",
    "japanese": "ICカードはどこでチャージできますか？",
    "romaji": "IC kaado wa doko de chaaji dekimasu ka?",
    "chinese": "IC 卡在哪裡加值？",
    "important": false
  },
  {
    "id": "transport-12",
    "category": "transport",
    "japanese": "バス停はどこですか？",
    "romaji": "Basutei wa doko desu ka?",
    "chinese": "巴士站在哪裡？",
    "important": false
  },
  {
    "id": "transport-13",
    "category": "transport",
    "japanese": "タクシー乗り場はどこですか？",
    "romaji": "Takushii noriba wa doko desu ka?",
    "chinese": "計程車乘車處在哪？",
    "important": false
  },
  {
    "id": "hotel-01",
    "category": "hotel",
    "japanese": "チェックインをお願いします",
    "romaji": "Chekkuin o onegaishimasu.",
    "chinese": "我要辦理入住",
    "important": false
  },
  {
    "id": "hotel-02",
    "category": "hotel",
    "japanese": "チェックアウトをお願いします",
    "romaji": "Chekkuauto o onegaishimasu.",
    "chinese": "我要退房",
    "important": false
  },
  {
    "id": "hotel-03",
    "category": "hotel",
    "japanese": "予約しています",
    "romaji": "Yoyaku shite imasu.",
    "chinese": "我有預約",
    "important": false
  },
  {
    "id": "hotel-04",
    "category": "hotel",
    "japanese": "名前は○○です",
    "romaji": "Namae wa ○○ desu.",
    "chinese": "我的名字是○○",
    "important": false
  },
  {
    "id": "hotel-05",
    "category": "hotel",
    "japanese": "荷物を預かってもらえますか？",
    "romaji": "Nimotsu o azukatte moraemasu ka?",
    "chinese": "可以寄放行李嗎？",
    "important": false
  },
  {
    "id": "hotel-06",
    "category": "hotel",
    "japanese": "チェックイン前に荷物を預けられますか？",
    "romaji": "Chekkuin mae ni nimotsu o azukeraremasu ka?",
    "chinese": "入住前可以寄放行李嗎？",
    "important": false
  },
  {
    "id": "hotel-07",
    "category": "hotel",
    "japanese": "チェックアウト後に荷物を預けられますか？",
    "romaji": "Chekkuauto go ni nimotsu o azukeraremasu ka?",
    "chinese": "退房後可以寄放行李嗎？",
    "important": false
  },
  {
    "id": "hotel-08",
    "category": "hotel",
    "japanese": "朝食は何時からですか？",
    "romaji": "Choushoku wa nanji kara desu ka?",
    "chinese": "早餐幾點開始？",
    "important": false
  },
  {
    "id": "hotel-09",
    "category": "hotel",
    "japanese": "朝食会場はどこですか？",
    "romaji": "Choushoku kaijou wa doko desu ka?",
    "chinese": "早餐在哪裡？",
    "important": false
  },
  {
    "id": "hotel-10",
    "category": "hotel",
    "japanese": "Wi-Fiのパスワードは何ですか？",
    "romaji": "Wai-fai no pasuwaado wa nan desu ka?",
    "chinese": "Wi-Fi 密碼是什麼？",
    "important": false
  },
  {
    "id": "hotel-11",
    "category": "hotel",
    "japanese": "部屋の○○が壊れています",
    "romaji": "Heya no ○○ ga kowarete imasu.",
    "chinese": "房間的○○壞了",
    "important": false
  },
  {
    "id": "hotel-12",
    "category": "hotel",
    "japanese": "お湯が出ません",
    "romaji": "Oyu ga demasen.",
    "chinese": "沒有熱水",
    "important": false
  },
  {
    "id": "hotel-13",
    "category": "hotel",
    "japanese": "エアコンが使えません",
    "romaji": "Eakon ga tsukaemasen.",
    "chinese": "冷氣不能用",
    "important": false
  },
  {
    "id": "hotel-14",
    "category": "hotel",
    "japanese": "部屋を変えてもらえますか？",
    "romaji": "Heya o kaete moraemasu ka?",
    "chinese": "可以換房間嗎？",
    "important": false
  },
  {
    "id": "hotel-15",
    "category": "hotel",
    "japanese": "充電器を借りられますか？",
    "romaji": "Juudenki o kariraremasu ka?",
    "chinese": "可以借充電器嗎？",
    "important": false
  },
  {
    "id": "sightseeing-01",
    "category": "sightseeing",
    "japanese": "○○はどこですか？",
    "romaji": "○○ wa doko desu ka?",
    "chinese": "○○在哪裡？",
    "important": false
  },
  {
    "id": "sightseeing-02",
    "category": "sightseeing",
    "japanese": "○○にはどうやって行きますか？",
    "romaji": "○○ ni wa dou yatte ikimasu ka?",
    "chinese": "要怎麼去○○？",
    "important": false
  },
  {
    "id": "sightseeing-03",
    "category": "sightseeing",
    "japanese": "歩いて行けますか？",
    "romaji": "Aruite ikemasu ka?",
    "chinese": "走路可以到嗎？",
    "important": false
  },
  {
    "id": "sightseeing-04",
    "category": "sightseeing",
    "japanese": "どのくらいかかりますか？",
    "romaji": "Dono kurai kakarimasu ka?",
    "chinese": "大概要多久？",
    "important": false
  },
  {
    "id": "sightseeing-05",
    "category": "sightseeing",
    "japanese": "この方向で合っていますか？",
    "romaji": "Kono houkou de atte imasu ka?",
    "chinese": "是這個方向嗎？",
    "important": false
  },
  {
    "id": "sightseeing-06",
    "category": "sightseeing",
    "japanese": "地図で教えてもらえますか？",
    "romaji": "Chizu de oshiete moraemasu ka?",
    "chinese": "可以在地圖上指給我看嗎？",
    "important": false
  },
  {
    "id": "sightseeing-07",
    "category": "sightseeing",
    "japanese": "入口はどこですか？",
    "romaji": "Iriguchi wa doko desu ka?",
    "chinese": "入口在哪裡？",
    "important": false
  },
  {
    "id": "sightseeing-08",
    "category": "sightseeing",
    "japanese": "出口はどこですか？",
    "romaji": "Deguchi wa doko desu ka?",
    "chinese": "出口在哪裡？",
    "important": false
  },
  {
    "id": "sightseeing-09",
    "category": "sightseeing",
    "japanese": "チケット売り場はどこですか？",
    "romaji": "Chiketto uriba wa doko desu ka?",
    "chinese": "售票處在哪裡？",
    "important": false
  },
  {
    "id": "sightseeing-10",
    "category": "sightseeing",
    "japanese": "入場料はいくらですか？",
    "romaji": "Nyuujouryou wa ikura desu ka?",
    "chinese": "門票多少錢？",
    "important": false
  },
  {
    "id": "sightseeing-11",
    "category": "sightseeing",
    "japanese": "今日は開いていますか？",
    "romaji": "Kyou wa aite imasu ka?",
    "chinese": "今天有開嗎？",
    "important": false
  },
  {
    "id": "sightseeing-12",
    "category": "sightseeing",
    "japanese": "何時に閉まりますか？",
    "romaji": "Nanji ni shimarimasu ka?",
    "chinese": "幾點關門？",
    "important": false
  },
  {
    "id": "sightseeing-13",
    "category": "sightseeing",
    "japanese": "写真を撮ってもいいですか？",
    "romaji": "Shashin o totte mo ii desu ka?",
    "chinese": "可以拍照嗎？",
    "important": false
  },
  {
    "id": "sightseeing-14",
    "category": "sightseeing",
    "japanese": "写真を撮ってもらえますか？",
    "romaji": "Shashin o totte moraemasu ka?",
    "chinese": "可以幫我拍照嗎？",
    "important": false
  },
  {
    "id": "facilities-01",
    "category": "facilities",
    "japanese": "トイレはどこですか？",
    "romaji": "Toire wa doko desu ka?",
    "chinese": "廁所在哪裡？",
    "important": true
  },
  {
    "id": "facilities-02",
    "category": "facilities",
    "japanese": "トイレを使ってもいいですか？",
    "romaji": "Toire o tsukatte mo ii desu ka?",
    "chinese": "可以使用廁所嗎？",
    "important": false
  },
  {
    "id": "facilities-03",
    "category": "facilities",
    "japanese": "コインロッカーはありますか？",
    "romaji": "Koin rokkaa wa arimasu ka?",
    "chinese": "有置物櫃嗎？",
    "important": false
  },
  {
    "id": "facilities-04",
    "category": "facilities",
    "japanese": "コインロッカーはどこですか？",
    "romaji": "Koin rokkaa wa doko desu ka?",
    "chinese": "置物櫃在哪裡？",
    "important": false
  },
  {
    "id": "facilities-05",
    "category": "facilities",
    "japanese": "ゴミ箱はありますか？",
    "romaji": "Gomibako wa arimasu ka?",
    "chinese": "有垃圾桶嗎？",
    "important": false
  },
  {
    "id": "facilities-06",
    "category": "facilities",
    "japanese": "充電できる場所はありますか？",
    "romaji": "Juuden dekiru basho wa arimasu ka?",
    "chinese": "有充電的地方嗎？",
    "important": false
  },
  {
    "id": "facilities-07",
    "category": "facilities",
    "japanese": "Wi-Fiはありますか？",
    "romaji": "Wai-fai wa arimasu ka?",
    "chinese": "有 Wi-Fi 嗎？",
    "important": false
  },
  {
    "id": "facilities-08",
    "category": "facilities",
    "japanese": "エレベーターはどこですか？",
    "romaji": "Erebeetaa wa doko desu ka?",
    "chinese": "電梯在哪裡？",
    "important": false
  },
  {
    "id": "facilities-09",
    "category": "facilities",
    "japanese": "エスカレーターはどこですか？",
    "romaji": "Esukareetaa wa doko desu ka?",
    "chinese": "自動扶梯在哪裡？",
    "important": false
  },
  {
    "id": "emergency-01",
    "category": "emergency",
    "japanese": "助けてください",
    "romaji": "Tasukete kudasai.",
    "chinese": "請幫幫我",
    "important": true
  },
  {
    "id": "emergency-02",
    "category": "emergency",
    "japanese": "警察を呼んでください",
    "romaji": "Keisatsu o yonde kudasai.",
    "chinese": "請叫警察",
    "important": false
  },
  {
    "id": "emergency-03",
    "category": "emergency",
    "japanese": "救急車を呼んでください",
    "romaji": "Kyuukyuusha o yonde kudasai.",
    "chinese": "請叫救護車",
    "important": true
  },
  {
    "id": "emergency-04",
    "category": "emergency",
    "japanese": "道に迷いました",
    "romaji": "Michi ni mayoimashita.",
    "chinese": "我迷路了",
    "important": false
  },
  {
    "id": "emergency-05",
    "category": "emergency",
    "japanese": "気分が悪いです",
    "romaji": "Kibun ga warui desu.",
    "chinese": "我不舒服",
    "important": false
  },
  {
    "id": "emergency-06",
    "category": "emergency",
    "japanese": "けがをしました",
    "romaji": "Kega o shimashita.",
    "chinese": "我受傷了",
    "important": false
  },
  {
    "id": "emergency-07",
    "category": "emergency",
    "japanese": "お腹が痛いです",
    "romaji": "Onaka ga itai desu.",
    "chinese": "我肚子痛",
    "important": false
  },
  {
    "id": "emergency-08",
    "category": "emergency",
    "japanese": "熱があります",
    "romaji": "Netsu ga arimasu.",
    "chinese": "我發燒了",
    "important": false
  },
  {
    "id": "emergency-09",
    "category": "emergency",
    "japanese": "持ち物をなくしました",
    "romaji": "Mochimono o nakushimashita.",
    "chinese": "我的東西不見了",
    "important": false
  },
  {
    "id": "emergency-10",
    "category": "emergency",
    "japanese": "財布をなくしました",
    "romaji": "Saifu o nakushimashita.",
    "chinese": "我的錢包不見了",
    "important": false
  },
  {
    "id": "emergency-11",
    "category": "emergency",
    "japanese": "携帯電話をなくしました",
    "romaji": "Keitai denwa o nakushimashita.",
    "chinese": "我的手機不見了",
    "important": false
  },
  {
    "id": "emergency-12",
    "category": "emergency",
    "japanese": "パスポートをなくしました",
    "romaji": "Pasupooto o nakushimashita.",
    "chinese": "我的護照不見了",
    "important": false
  },
  {
    "id": "emergency-13",
    "category": "emergency",
    "japanese": "一番近い病院はどこですか？",
    "romaji": "Ichiban chikai byouin wa doko desu ka?",
    "chinese": "最近的醫院在哪？",
    "important": false
  },
  {
    "id": "emergency-14",
    "category": "emergency",
    "japanese": "中国語を話せる人はいますか？",
    "romaji": "Chuugokugo o hanaseru hito wa imasu ka?",
    "chinese": "有會說中文的人嗎？",
    "important": false
  },
  {
    "id": "emergency-15",
    "category": "emergency",
    "japanese": "英語を話せる人はいますか？",
    "romaji": "Eigo o hanaseru hito wa imasu ka?",
    "chinese": "有會說英文的人嗎？",
    "important": false
  },
  {
    "id": "vegetarian-statement",
    "category": "vegetarian",
    "japanese": "私はベジタリアンです。肉と魚は食べません。",
    "romaji": "Watashi wa bejitarian desu. Niku to sakana wa tabemasen.",
    "chinese": "我吃素，不吃肉和魚。",
    "important": true
  },
  {
    "id": "vegetarian-vegan",
    "category": "vegetarian",
    "japanese": "私はヴィーガンです。動物性のものは食べません。",
    "romaji": "Watashi wa viigan desu. Doubutsusei no mono wa tabemasen.",
    "chinese": "我是純素者，不吃動物性食品。",
    "important": true
  },
  {
    "id": "restaurant-quantity",
    "category": "restaurant",
    "japanese": "これを一つお願いします。",
    "reading": "これをひとつおねがいします。",
    "romaji": "Kore o hitotsu onegaishimasu.",
    "chinese": "請給我 1 份這個。",
    "interactiveType": "quantity"
  },
  {
    "id": "restaurant-people",
    "category": "restaurant",
    "japanese": "二人です。",
    "reading": "ふたりです。",
    "romaji": "Futari desu.",
    "chinese": "我們 2 位。",
    "interactiveType": "people"
  }
];
