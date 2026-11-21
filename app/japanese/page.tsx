"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  japaneseCategories,
  japanesePhrases,
  type JapaneseCategory,
  type JapanesePhrase,
} from "../../data/japaneseData";

type CategoryFilter =
  | "favorites"
  | JapaneseCategory;

const PHRASE_ORDER_KEY = "our-travel-japanese-phrase-order";

const FAVORITES_KEY =
  "our-travel-japanese-favorites";

// ========================================
// QUANTITY
// ========================================

const quantityWords = [
  {
    number: 1,
    japanese: "一つ",
    reading: "ひとつ",
    romaji: "hitotsu",
  },
  {
    number: 2,
    japanese: "二つ",
    reading: "ふたつ",
    romaji: "futatsu",
  },
  {
    number: 3,
    japanese: "三つ",
    reading: "みっつ",
    romaji: "mittsu",
  },
  {
    number: 4,
    japanese: "四つ",
    reading: "よっつ",
    romaji: "yottsu",
  },
  {
    number: 5,
    japanese: "五つ",
    reading: "いつつ",
    romaji: "itsutsu",
  },
  {
    number: 6,
    japanese: "六つ",
    reading: "むっつ",
    romaji: "muttsu",
  },
  {
    number: 7,
    japanese: "七つ",
    reading: "ななつ",
    romaji: "nanatsu",
  },
  {
    number: 8,
    japanese: "八つ",
    reading: "やっつ",
    romaji: "yattsu",
  },
  {
    number: 9,
    japanese: "九つ",
    reading: "ここのつ",
    romaji: "kokonotsu",
  },
  {
    number: 10,
    japanese: "十",
    reading: "とお",
    romaji: "too",
  },
];

// ========================================
// PEOPLE
// ========================================

const peopleWords = [
  {
    number: 1,
    japanese: "一人",
    reading: "ひとり",
    romaji: "hitori",
  },
  {
    number: 2,
    japanese: "二人",
    reading: "ふたり",
    romaji: "futari",
  },
  {
    number: 3,
    japanese: "三人",
    reading: "さんにん",
    romaji: "sannin",
  },
  {
    number: 4,
    japanese: "四人",
    reading: "よにん",
    romaji: "yonin",
  },
  {
    number: 5,
    japanese: "五人",
    reading: "ごにん",
    romaji: "gonin",
  },
  {
    number: 6,
    japanese: "六人",
    reading: "ろくにん",
    romaji: "rokunin",
  },
  {
    number: 7,
    japanese: "七人",
    reading: "ななにん",
    romaji: "nananin",
  },
  {
    number: 8,
    japanese: "八人",
    reading: "はちにん",
    romaji: "hachinin",
  },
  {
    number: 9,
    japanese: "九人",
    reading: "きゅうにん",
    romaji: "kyuunin",
  },
  {
    number: 10,
    japanese: "十人",
    reading: "じゅうにん",
    romaji: "juunin",
  },
];

type ShoppingCounter = "general" | "flat" | "bottle" | "cup" | "pair";

const shoppingCounters: Record<ShoppingCounter, { label: string; chinese: string; japanese: string[]; reading: string[]; romaji: string[] }> = {
  general: { label: "一般（個／份）", chinese: "個／份", japanese: quantityWords.map(w => w.japanese), reading: quantityWords.map(w => w.reading), romaji: quantityWords.map(w => w.romaji) },
  flat: { label: "衣服／紙張（枚）", chinese: "件／張", japanese: ["一枚","二枚","三枚","四枚","五枚","六枚","七枚","八枚","九枚","十枚"], reading: ["いちまい","にまい","さんまい","よんまい","ごまい","ろくまい","ななまい","はちまい","きゅうまい","じゅうまい"], romaji: ["ichimai","nimai","sanmai","yonmai","gomai","rokumai","nanamai","hachimai","kyuumai","juumai"] },
  bottle: { label: "瓶裝／細長物（本）", chinese: "瓶／支", japanese: ["一本","二本","三本","四本","五本","六本","七本","八本","九本","十本"], reading: ["いっぽん","にほん","さんぼん","よんほん","ごほん","ろっぽん","ななほん","はっぽん","きゅうほん","じゅっぽん"], romaji: ["ippon","nihon","sanbon","yonhon","gohon","roppon","nanahon","happon","kyuuhon","juppon"] },
  cup: { label: "杯裝飲料（杯）", chinese: "杯", japanese: ["一杯","二杯","三杯","四杯","五杯","六杯","七杯","八杯","九杯","十杯"], reading: ["いっぱい","にはい","さんばい","よんはい","ごはい","ろっぱい","ななはい","はっぱい","きゅうはい","じゅっぱい"], romaji: ["ippai","nihai","sanbai","yonhai","gohai","roppai","nanahai","happai","kyuuhai","juppai"] },
  pair: { label: "鞋子（足）", chinese: "雙", japanese: ["一足","二足","三足","四足","五足","六足","七足","八足","九足","十足"], reading: ["いっそく","にそく","さんぞく","よんそく","ごそく","ろくそく","ななそく","はっそく","きゅうそく","じゅっそく"], romaji: ["issoku","nisoku","sanzoku","yonsoku","gosoku","rokusoku","nanasoku","hassoku","kyuusoku","jussoku"] },
};

type DietKey = "egg" | "dairy" | "meat" | "seafood" | "animal" | "alliums" | "alcohol" | "honey";
type DietSettings = Record<DietKey, boolean>;
const DIET_STORAGE_KEY = "our-travel-diet-preferences-v1";
const defaultDiet: DietSettings = {
  egg: true, dairy: true, meat: false, seafood: false,
  animal: false, alliums: false, alcohol: false, honey: true,
};
const dietOptions: { key: DietKey; zh: string; ja: string }[] = [
  { key: "egg", zh: "蛋", ja: "卵" },
  { key: "dairy", zh: "牛奶、乳製品", ja: "牛乳・乳製品" },
  { key: "meat", zh: "肉類、禽類", ja: "肉・鶏肉などの鳥肉" },
  { key: "seafood", zh: "魚、海鮮", ja: "魚・魚介類" },
  { key: "animal", zh: "其他動物製品（不含蛋奶）", ja: "その他の動物性食品（卵・乳製品を除く）" },
  { key: "alliums", zh: "洋蔥、蔥、蒜、韭菜、藠頭、阿魏", ja: "玉ねぎ・ねぎ・にんにく・にら・らっきょう・アサフェティダ" },
  { key: "alcohol", zh: "酒精（含料理酒）", ja: "アルコール・料理酒" },
  { key: "honey", zh: "蜂蜜", ja: "はちみつ" },
];

// ========================================
// PAGE
// ========================================

export default function JapanesePage() {
  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<CategoryFilter>(
      "favorites"
    );

  const [
    favorites,
    setFavorites,
  ] =
    useState<string[]>([]);

  const [
    favoriteOnly,
    setFavoriteOnly,
  ] =
    useState(false);

  const [phraseOrders, setPhraseOrders] = useState<Record<string, string[]>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; active: boolean; timer: ReturnType<typeof setTimeout> | null } | null>(null);
  const dropRef = useRef<string | null>(null);

  const [
    selectedPhrase,
    setSelectedPhrase,
  ] =
    useState<JapanesePhrase | null>(
      null
    );

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  const [
    people,
    setPeople,
  ] =
    useState(2);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  const [stationInput, setStationInput] = useState("");
  const [stationJapanese, setStationJapanese] = useState("");
  const [stationOpen, setStationOpen] = useState(false);
  const [customTerms, setCustomTerms] = useState<Record<string, { zh: string; ja: string; romaji: string }>>({});
  const [customTermOpen, setCustomTermOpen] = useState(false);
  const activeTerm = customTerms[selectedCategory] ?? { zh: "", ja: "", romaji: "" };
  const updateActiveTerm = (key: "zh" | "ja" | "romaji", value: string) => {
    setCustomTerms(current => ({ ...current, [selectedCategory]: { ...(current[selectedCategory] ?? { zh: "", ja: "", romaji: "" }), [key]: value } }));
  };
  const [speechMessage, setSpeechMessage] = useState("");
  const [clothingSize, setClothingSize] = useState("M");
  const [shoppingCounter, setShoppingCounter] = useState<ShoppingCounter>("general");
  const [diet, setDiet] = useState<DietSettings>(defaultDiet);
  const [dietLoaded, setDietLoaded] = useState(false);
  const [dietEditing, setDietEditing] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DIET_STORAGE_KEY) || "null");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        const valid = { ...defaultDiet };
        for (const item of dietOptions) {
          if (typeof saved[item.key] === "boolean") valid[item.key] = saved[item.key];
        }
        setDiet(valid);
      }
    } catch { /* Invalid saved settings: use defaults */ }
    setDietLoaded(true);
  }, []);
  useEffect(() => {
    if (!dietLoaded) return;
    try { localStorage.setItem(DIET_STORAGE_KEY, JSON.stringify(diet)); } catch { /* Storage unavailable */ }
  }, [diet, dietLoaded]);

  const dietAllowed = dietOptions.filter(item => diet[item.key]);
  const dietBlocked = dietOptions.filter(item => !diet[item.key]);
  const dietJapanese = [
    "食事に制限があります。",
    dietAllowed.length ? `【食べられるもの】\n${dietAllowed.map(item => item.ja).join("、")}。` : "",
    dietBlocked.length ? `【食べられないもの】\n${dietBlocked.map(item => item.ja).join("、")}。` : "",
    dietBlocked.length ? "食べられない食材は、だし・スープ・ソース・調味料にも使わないでください。" : "",
    "この条件で食べられる料理はありますか？",
  ].filter(Boolean).join("\n");
  const openDietCard = () => setSelectedPhrase({
    id: "vegetarian-card", category: "vegetarian", japanese: dietJapanese,
    romaji: "", chinese: "我的飲食限制（依設定顯示）", important: true,
  });


  function speakJapanese(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechMessage("這台裝置不支援語音朗讀，仍可使用大字顯示。");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("ja"));
    if (japaneseVoice) utterance.voice = japaneseVoice;
    setSpeechMessage(japaneseVoice ? "" : "使用系統語音；若發音不正確，請在手機設定中安裝日文語音。");
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("travel-station-draft") || "null");
      if (saved && typeof saved.input === "string" && typeof saved.japanese === "string") {
        setStationInput(saved.input);
        setStationJapanese(saved.japanese);
      }
    } catch { /* Ignore invalid offline draft */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("travel-station-draft", JSON.stringify({ input: stationInput, japanese: stationJapanese }));
  }, [stationInput, stationJapanese]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("travel-custom-phrase-terms") || "{}");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) setCustomTerms(stored);
    } catch { /* ignore invalid saved data */ }
  }, []);
  useEffect(() => {
    localStorage.setItem("travel-custom-phrase-terms", JSON.stringify(customTerms));
  }, [customTerms]);

  // ========================================
  // LOAD FAVORITES
  // ========================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          FAVORITES_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          setFavorites(
            parsed
          );
        }
      }
    } catch {
      // ignore invalid data
    }

    try {
      const storedOrder = JSON.parse(localStorage.getItem(PHRASE_ORDER_KEY) || "{}");
      if (storedOrder && typeof storedOrder === "object" && !Array.isArray(storedOrder)) {
        setPhraseOrders(storedOrder);
      }
    } catch { /* Invalid saved order */ }

    setLoaded(true);
  }, []);

  // ========================================
  // SAVE FAVORITES
  // ========================================

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(
        favorites
      )
    );
  }, [
    favorites,
    loaded,
  ]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(PHRASE_ORDER_KEY, JSON.stringify(phraseOrders)); }
    catch { /* Storage unavailable */ }
  }, [phraseOrders, loaded]);

  function reorderPhrase(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const visibleIds = filteredPhrases.map(phrase => phrase.id);
    const from = visibleIds.indexOf(sourceId);
    const to = visibleIds.indexOf(targetId);
    if (from < 0 || to < 0) return;
    visibleIds.splice(from, 1);
    visibleIds.splice(to, 0, sourceId);
    setPhraseOrders(current => ({ ...current, [selectedCategory]: visibleIds }));
  }

  function stopDragging() {
    const current = dragRef.current;
    if (current?.timer) clearTimeout(current.timer);
    if (current?.active && dropRef.current) reorderPhrase(current.id, dropRef.current);
    dragRef.current = null;
    dropRef.current = null;
    setDraggingId(null);
    setDropTargetId(null);
  }

  function beginLongPress(event: React.PointerEvent<HTMLElement>, id: string) {
    if (!isReordering) return;
    if (filteredPhrases.length < 2) return;
    if (dragRef.current?.timer) clearTimeout(dragRef.current.timer);
    const pointerId = event.pointerId;
    const handle = event.currentTarget;
    dragRef.current = {
      id, startX: event.clientX, startY: event.clientY, active: false,
      timer: setTimeout(() => {
        if (!dragRef.current || dragRef.current.id !== id) return;
        dragRef.current.active = true;
        dragRef.current.timer = null;
        handle.setPointerCapture(pointerId);
        setDraggingId(id);
        if (navigator.vibrate) navigator.vibrate(20);
      }, 350),
    };
  }

  function moveLongPress(event: React.PointerEvent<HTMLElement>) {
    const current = dragRef.current;
    if (!current) return;
    if (!current.active) {
      if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 12) {
        if (current.timer) clearTimeout(current.timer);
        dragRef.current = null;
      }
      return;
    }
    const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-phrase-id]");
    const target = hovered?.dataset.phraseId || null;
    dropRef.current = target && target !== current.id ? target : null;
    setDropTargetId(dropRef.current);
    // Scroll the list when dragging near the viewport edges.
    if (event.clientY < 90) window.scrollBy(0, -12);
    if (event.clientY > window.innerHeight - 90) window.scrollBy(0, 12);
  }

  // ========================================
  // CURRENT WORDS
  // ========================================

  const counterWord = shoppingCounters[shoppingCounter];
  const counterIndex = quantity - 1;

  const peopleWord =
    peopleWords[
      people - 1
    ];

  // ========================================
  // FILTER
  // ========================================

  const filteredPhrases =
    useMemo(() => {
      const matching = japanesePhrases.filter((phrase) =>
        selectedCategory === "favorites"
          ? favorites.includes(phrase.id)
          : phrase.category === selectedCategory
      );
      const order = phraseOrders[selectedCategory] ?? [];
      const rank = new Map(order.map((id, index) => [id, index]));
      return matching.sort((a, b) =>
        (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
    }, [
      phraseOrders,
      selectedCategory,
      favoriteOnly,
      favorites,
    ]);

  // ========================================
  // FAVORITE
  // ========================================

  function toggleFavorite(
    id: string
  ) {
    setFavorites(
      (current) => {
        if (
          current.includes(
            id
          )
        ) {
          return current.filter(
            (item) =>
              item !== id
          );
        }

        return [
          ...current,
          id,
        ];
      }
    );
  }

  // ========================================
  // BUILD DISPLAY PHRASE
  // ========================================

  function getDisplayPhrase(
    phrase: JapanesePhrase
  ): JapanesePhrase {
    // Category-specific placeholder substitution, preserving separate drafts.
    const categoryTerm = customTerms[phrase.category];
    const isTransport = phrase.category === "transport";
    const ja = isTransport ? stationJapanese.trim() : categoryTerm?.ja?.trim();
    const zh = isTransport ? stationInput.trim() : categoryTerm?.zh?.trim();
    const latin = isTransport ? "" : categoryTerm?.romaji?.trim();
    if (ja && /○○|〇〇/.test(phrase.japanese)) {
      const japanese = phrase.japanese.replace(/○○|〇〇/g, ja);
      const chinese = phrase.chinese.replace(/○○|〇〇/g, zh || ja);
      
      // 固定句子的拼音一律保留；自訂名稱不要求手動輸入羅馬拼音。
      // 若沒有提供拼音，以日文名稱標示代入部分，避免整句消失。
      const romaji = (phrase.romaji || "").replace(
        /○○|〇〇/g,
        latin || `[${ja}]`
      );

      return { ...phrase, japanese, chinese, romaji, reading: phrase.reading?.replace(/○○|〇〇/g, ja) };
    }
    if (
      phrase.interactiveType ===
      "quantity"
    ) {
      return {
        ...phrase,

        japanese:
          `これを${counterWord.japanese[counterIndex]}お願いします。`,

        reading:
          `これを${counterWord.reading[counterIndex]}おねがいします。`,

        romaji:
          `Kore o ${counterWord.romaji[counterIndex]} onegaishimasu.`,

        chinese:
          `請給我 ${quantity} ${counterWord.chinese}這個。`,
      };
    }

    if (
      phrase.interactiveType ===
      "people"
    ) {
      return {
        ...phrase,

        japanese:
          `${peopleWord.japanese}です。`,

        reading:
          `${peopleWord.reading}です。`,

        romaji:
          `${capitalize(
            peopleWord.romaji
          )} desu.`,

        chinese:
          `我們 ${people} 位。`,
      };
    }

    return phrase;
  }

  function openPhrase(
    phrase: JapanesePhrase
  ) {
    setSelectedPhrase(phrase);
  }

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-screen bg-[#F5F0E7]">

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-[#E8DFD1] bg-[#FFFCF6]/95 backdrop-blur">

        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0E7] text-lg text-[#5B5046]"
          >
            ‹
          </Link>

          <div className="text-center">

            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9A8C7B]">
              TRAVEL JOURNAL
            </p>

            <h1 className="text-sm font-bold text-[#3E3A39]">
              旅遊日語
            </h1>

          </div>

          <button
            type="button"
            onClick={() => { setSelectedCategory("favorites"); setFavoriteOnly(false); }}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
              selectedCategory === "favorites"
                ? "bg-[#F6D27A] text-[#8C5D00]"
                : "bg-[#F5F0E7] text-slate-500"
            }`}
          >
            ★
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-md px-5 pb-28 pt-5">

        {/* CATEGORY */}

        <section className="mt-5">

          <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            <div className="flex w-max gap-2">

              <button
                type="button"
                onClick={() => { setSelectedCategory("favorites"); setFavoriteOnly(false); }}
                className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${selectedCategory === "favorites" ? "bg-[#F6D27A] text-[#493A2B]" : "border border-[#E8DFD1] bg-white text-[#756756]"}`}
              >⭐ 常用</button>
              {japaneseCategories.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setFavoriteOnly(false);
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                      active
                        ? "bg-[#F6D27A] text-[#493A2B]"
                        : "border border-[#E8DFD1] bg-white text-[#756756]"
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                );
              })}

            </div>

          </div>

        </section>

        {/* CUSTOM STATION: transport category only */}
        {selectedCategory === "transport" && (
        <section className="mt-4 rounded-[24px] border border-[#E8DFD1] bg-white p-4">
          <button type="button" onClick={() => setStationOpen((current) => !current)} aria-expanded={stationOpen} className="flex w-full items-center justify-between text-left text-sm font-bold text-[#3E3A39]">
            <span>🚉 自訂車站／目的地</span><span>{stationOpen ? "收合 −" : "展開 ＋"}</span>
          </button>
          {stationOpen && (<>
          <p className="mt-1 text-xs text-[#756756]">輸入目的地；需要時開啟線上翻譯，確認日文名稱後貼回下方。已輸入的內容會儲存在本機。</p>
          <label htmlFor="station-input" className="mt-3 block text-xs font-bold text-[#756756]">中文或原文地名</label>
          <input id="station-input" value={stationInput} onChange={(e) => setStationInput(e.target.value)} placeholder="例如：新宿車站" className="mt-1 w-full rounded-xl border border-[#E8DFD1] p-3 text-sm" />
          <a href={`https://translate.google.com/?sl=auto&tl=ja&text=${encodeURIComponent(stationInput)}&op=translate`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block rounded-xl bg-[#F3E5CA] px-3 py-2 text-xs font-bold text-[#493A2B]">🌐 開啟線上日文翻譯（需網路）</a>
          <label htmlFor="station-ja" className="mt-3 block text-xs font-bold text-[#756756]">確認後的日文地名（可離線保存）</label>
          <input id="station-ja" value={stationJapanese} onChange={(e) => setStationJapanese(e.target.value)} placeholder="例如：新宿駅" className="mt-1 w-full rounded-xl border border-[#E8DFD1] p-3 text-sm" />
          {stationJapanese.trim() && (
            <p className="mt-3 rounded-xl bg-[#F6F4ED] px-3 py-3 text-xs font-semibold leading-5 text-[#493A2B]">✓ 已套用「{stationJapanese.trim()}」到下方所有含 ○○ 的交通句子，包含日文朗讀與大字顯示。</p>
          )}
          {stationJapanese.trim() && (
            <button type="button" onClick={() => setSelectedPhrase({id:"custom-station", category:"transport" as JapaneseCategory, japanese:`${stationJapanese.trim()}まで行きたいです。`, romaji:"", chinese:`我想去${stationInput.trim() || stationJapanese.trim()}。`})} className="mt-3 w-full rounded-xl bg-[#F6D27A] px-4 py-3 text-sm font-bold text-[#493A2B]">大字顯示：{stationJapanese.trim()}まで行きたいです。</button>
          )}
          <p className="mt-2 text-[10px] text-[#9A8C7B]">請確認翻譯是否為正確站名；離線時不會自動翻譯。</p>
          </>)}
        </section>
        )}


        {/* Reusable custom term lookup for sightseeing and hotel placeholders. */}
        {(selectedCategory === "sightseeing" || selectedCategory === "hotel") && (
          <section className="mt-4 rounded-[24px] border border-[#E8DFD1] bg-white p-4">
            <button type="button" className="flex w-full items-center justify-between text-left text-sm font-bold text-[#3E3A39]" aria-expanded={customTermOpen} onClick={() => setCustomTermOpen(value => !value)}>
              <span>{selectedCategory === "hotel" ? "🏨 自訂房間設備／物品" : "📍 自訂景點／目的地"}</span><span>{customTermOpen ? "收合 −" : "展開 ＋"}</span>
            </button>
            {customTermOpen && <div className="mt-3 space-y-3">
              <p className="text-xs text-[#756756]">輸入名稱並確認日文，會自動套入本分類下方含 ○○ 的句子，離線保留。</p>
              <label className="block text-xs font-bold text-[#756756]">中文名稱
                <input value={activeTerm.zh} onChange={e => updateActiveTerm("zh", e.target.value)} placeholder={selectedCategory === "hotel" ? "例如：冷氣" : "例如：清水寺"} className="mt-1 w-full rounded-xl border border-[#E8DFD1] p-3 text-sm" />
              </label>
              <a href={`https://translate.google.com/?sl=auto&tl=ja&text=${encodeURIComponent(activeTerm.zh)}&op=translate`} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-[#F3E5CA] px-3 py-2 text-xs font-bold text-[#493A2B]">🌐 查詢日文（需網路）</a>
              <label className="block text-xs font-bold text-[#756756]">確認後的日文
                <input value={activeTerm.ja} onChange={e => updateActiveTerm("ja", e.target.value)} placeholder={selectedCategory === "hotel" ? "例如：エアコン" : "例如：清水寺"} className="mt-1 w-full rounded-xl border border-[#E8DFD1] p-3 text-sm" />
              </label>
              <label className="block text-xs font-bold text-[#756756]">羅馬拼音（可手動填寫）
                <input value={activeTerm.romaji} onChange={e => updateActiveTerm("romaji", e.target.value)} placeholder={selectedCategory === "hotel" ? "例如：eakon" : "例如：Kiyomizu-dera"} className="mt-1 w-full rounded-xl border border-[#E8DFD1] p-3 text-sm" />
              </label>
              {activeTerm.ja.trim() && <p className="rounded-xl bg-[#F6F4ED] p-3 text-xs font-semibold text-[#493A2B]">✓ 已代入下方句子：{activeTerm.ja}</p>}
            </div>}
          </section>
        )}

        {selectedCategory === "favorites" && favorites.length === 0 && (
          <section className="mt-4 rounded-2xl border border-dashed border-[#D8C7A8] bg-white px-4 py-6 text-center">
            <p className="text-sm font-bold text-[#493A2B]">常用清單還是空的</p>
            <p className="mt-2 text-xs leading-5 text-[#756756]">到其他分類點選 ☆，就能將需要的句子加入這裡。</p>
          </section>
        )}

        {/* DIET PREFERENCES — saved on this device */}
        {selectedCategory === "vegetarian" && (
          <section className="mt-4 rounded-[24px] border border-[#D8D8B9] bg-[#F2F1DF] p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-[#493A2B]">🌱 我的飲食限制</p>
                <p className="mt-1 text-xs text-[#6B6049]">預設蛋奶素、不吃五辛；可依需要修改，離線保留設定。</p>
              </div>
              <button type="button" onClick={() => setDietEditing(v => !v)}
                className="shrink-0 rounded-xl border border-[#D8C7A8] bg-white px-3 py-2 text-xs font-bold text-[#493A2B]">
                {dietEditing ? "完成" : "⚙ 設定"}
              </button>
            </div>
            {dietEditing && (
              <div className="mt-4 space-y-2 rounded-2xl bg-white p-3">
                <p className="text-xs text-[#756756]">選擇各項食材是否可以食用：</p>
                {dietOptions.map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-2 border-b border-[#F0E9DF] py-2 last:border-0">
                    <span className="min-w-0 flex-1 text-xs font-semibold text-[#493A2B]">{item.zh}</span>
                    <div className="flex shrink-0 gap-1" role="group" aria-label={`${item.zh}飲食限制`}>
                      {[true, false].map(value => (
                        <button key={String(value)} type="button" aria-pressed={diet[item.key] === value}
                          onClick={() => setDiet(current => ({ ...current, [item.key]: value }))}
                          className={`rounded-lg px-2 py-2 text-xs font-bold ${diet[item.key] === value ? (value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800") : "bg-[#F5F0E7] text-[#756756]"}`}>
                          {value ? "可吃" : "不吃"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setDiet({ ...defaultDiet })}
                  className="mt-2 w-full rounded-xl border border-[#E8DFD1] py-2 text-xs font-bold text-[#756756]">恢復預設（蛋奶素、不吃五辛）</button>
              </div>
            )}
            <button type="button" onClick={openDietCard}
              className="mt-3 w-full rounded-2xl bg-[#D6B56D] py-3 text-sm font-bold text-[#493A2B]">
              🌱 顯示給店員看
            </button>
          </section>
        )}


        <div className="mt-5 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold tracking-[0.16em] text-[#9A8C7B]">
              PHRASES
            </p>

            <h2 className="mt-1 text-base font-bold text-[#3E3A39]">
              {selectedCategory === "favorites"
                ? "我的常用句子"
                : "實用句子"}
            </h2>

          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-[#9A8C7B]">{filteredPhrases.length} 句</span>
            {filteredPhrases.length > 1 && (
              <button type="button" onClick={() => { stopDragging(); setIsReordering(value => !value); }}
                className="rounded-full border border-[#E6D6B9] bg-white px-3 py-1.5 text-xs font-bold text-[#756756]">
                {isReordering ? "完成" : "調整順序"}
              </button>
            )}
          </div>

        </div>

        {/* PHRASES */}

        {isReordering && (
          <p className="mt-2 text-xs text-[#9A8C7B]">長按句子任意位置拖曳排序，完成後點「完成」。</p>
        )}
        <section className="mt-3 space-y-3">

          {filteredPhrases.map(
            (phrase) => {

              const isFavorite =
                favorites.includes(
                  phrase.id
                );

              // ============================
              // NORMAL
              // ============================

              return (
                <article
                  key={
                    phrase.id
                  }
                  data-phrase-id={phrase.id}
                  onPointerDown={event => { if (isReordering) beginLongPress(event, phrase.id); }}
                  onPointerMove={event => { if (isReordering) moveLongPress(event); }}
                  onPointerUp={() => { if (isReordering) stopDragging(); }}
                  onPointerCancel={() => { if (isReordering) stopDragging(); }}
                  onContextMenu={event => { if (isReordering) event.preventDefault(); }}
                  style={isReordering ? { touchAction: "none", userSelect: "none" } : undefined}
                  className={`rounded-[18px] border bg-white px-3.5 py-3 shadow-sm shadow-[#D8C7A8]/25 transition-colors ${draggingId === phrase.id ? "border-[#D6AE5B] opacity-60" : dropTargetId === phrase.id ? "border-[#D6AE5B] bg-[#FFF8E9]" : "border-[#E8DFD1]"}`}
                >

                  <div className="flex items-start gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        if (!isReordering) openPhrase(phrase);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >

                      <div className="flex items-center gap-2">

                        {phrase.important && (
                          <span className="rounded-full bg-[#FFF3DE] px-2 py-0.5 text-[9px] font-bold text-[#8C5D00]">
                            USEFUL
                          </span>
                        )}



                      </div>

                      <p className="mt-1 text-[17px] font-bold leading-6 text-[#3E3A39]">
                        {
                          getDisplayPhrase(phrase).japanese
                        }
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-[#9A8C7B]">
                        {
                          getDisplayPhrase(phrase).romaji
                        }
                      </p>

                      <p className="mt-1 text-[13px] font-medium text-[#756756]">
                        {
                          getDisplayPhrase(phrase).chinese
                        }
                      </p>

                    </button>

                    <button type="button" aria-label="朗讀日文" title="朗讀日文" onClick={() => { if (!isReordering) speakJapanese(getDisplayPhrase(phrase).japanese); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F0E7] text-base text-[#756756]">🔊</button>
                    <button
                      type="button"
                      onClick={() => { if (!isReordering) toggleFavorite(phrase.id); }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                        isFavorite
                          ? "bg-[#FFF3DE] text-[#B5852B]"
                          : "bg-[#F5F0E7] text-[#A69988]"
                      }`}
                    >
                      ★
                    </button>

                  </div>

                </article>
              );
            }
          )}

          {/* EMPTY */}

          {filteredPhrases.length ===
            0 && selectedCategory !== "favorites" && (

            <div className="rounded-[24px] border border-dashed border-[#E8DFD1] bg-white px-5 py-12 text-center">

              <div className="text-3xl">
                🔍
              </div>

              <p className="mt-3 text-sm font-bold text-[#5B5046]">
                找不到這句
              </p>

              <p className="mt-1 text-xs text-[#9A8C7B]">
                換個中文關鍵字試試看
              </p>

            </div>

          )}

        </section>

      </div>

      {/* ========================================
          LARGE TEXT
      ======================================== */}

      {selectedPhrase && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#342C25]/65 p-4 backdrop-blur-sm">

          <div className="max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-5 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-bold tracking-[0.18em] text-[#9A8C7B]">
                  SHOW THIS
                </p>

                <p className="mt-1 text-xs font-bold text-[#756756]">
                  直接給對方看
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPhrase(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0E7] text-lg text-[#756756]"
              >
                ×
              </button>

            </div>

            {(/サイズ|尺寸|尺碼/.test(selectedPhrase.japanese + selectedPhrase.chinese)) && (
              <div className="mt-5">
                <p className="mb-2 text-center text-xs font-bold text-[#756756]">👕 選擇衣服尺寸</p>
                <div className="flex flex-wrap justify-center gap-2" aria-label="衣服尺寸">
                  {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                    <button key={size} type="button" aria-pressed={clothingSize === size}
                      onClick={() => setClothingSize(size)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold ${clothingSize === size ? "bg-[#F6D27A] text-[#493A2B]" : "bg-[#F5F0E7] text-[#756756]"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(selectedPhrase.interactiveType === "people" || selectedPhrase.interactiveType === "quantity") && (
              <div className="mt-5">
                <p className="mb-2 text-center text-xs font-bold text-[#756756]">
                  {selectedPhrase.interactiveType === "people" ? "👥 用餐人數" : "🛍️ 購買／點餐數量"}
                </p>
                <div className="mx-auto flex w-52 items-center overflow-hidden rounded-2xl border border-[#E8DFD1] bg-[#F5F0E7]">
                  <button type="button" aria-label="減少數量" disabled={(selectedPhrase.interactiveType === "people" ? people : quantity) <= 1}
                    onClick={() => selectedPhrase.interactiveType === "people" ? setPeople(n => Math.max(1, n - 1)) : setQuantity(n => Math.max(1, n - 1))}
                    className="h-12 flex-1 text-xl font-bold text-[#756756] disabled:opacity-30">−</button>
                  <span className="flex h-12 w-16 items-center justify-center border-x border-[#E8DFD1] bg-white text-lg font-bold text-[#3E3A39]">
                    {selectedPhrase.interactiveType === "people" ? people : quantity}
                  </span>
                  <button type="button" aria-label="增加數量" disabled={(selectedPhrase.interactiveType === "people" ? people : quantity) >= 10}
                    onClick={() => selectedPhrase.interactiveType === "people" ? setPeople(n => Math.min(10, n + 1)) : setQuantity(n => Math.min(10, n + 1))}
                    className="h-12 flex-1 text-xl font-bold text-[#756756] disabled:opacity-30">＋</button>
                </div>
                {selectedPhrase.interactiveType === "quantity" && (
                  <div className="mt-3">
                    <label htmlFor="shopping-counter" className="mb-1 block text-center text-xs font-bold text-[#756756]">量詞（選填，預設一般）</label>
                    <select id="shopping-counter" value={shoppingCounter} onChange={e => setShoppingCounter(e.target.value as ShoppingCounter)}
                      className="w-full rounded-xl border border-[#E8DFD1] bg-[#FFF8E9] px-3 py-3 text-sm text-[#493A2B]">
                      {(Object.keys(shoppingCounters) as ShoppingCounter[]).map(key => <option key={key} value={key}>{shoppingCounters[key].label}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            {selectedPhrase.id === "vegetarian-card" ? (
              <div className="mt-4 space-y-3" lang="ja">
                <p className="text-center text-lg font-bold text-slate-950">食事に制限があります。</p>
                {dietAllowed.length > 0 && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                    <p className="mb-1 text-sm font-bold text-green-800">✓ 食べられるもの</p>
                    <p className="break-words text-[15px] font-semibold leading-7 text-slate-950">{dietAllowed.map(item => item.ja).join("・")}</p>
                  </div>
                )}
                {dietBlocked.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="mb-1 text-sm font-bold text-red-800">✕ 食べられないもの</p>
                    <p className="break-words text-[15px] font-semibold leading-7 text-slate-950">{dietBlocked.map(item => item.ja).join("・")}</p>
                  </div>
                )}
                {dietBlocked.length > 0 && (
                  <div className="rounded-xl bg-amber-50 p-3 text-[13px] font-medium leading-6 text-slate-900">
                    食べられない食材は、だし・スープ・ソース・調味料にも使わないでください。
                  </div>
                )}
                <p className="text-center text-[15px] font-bold leading-7 text-slate-950">この条件で食べられる料理はありますか？</p>
                <div lang="zh-Hant" className="mt-4 border-t border-[#E8DFD1] pt-3 text-left text-xs leading-6 text-[#756756]">
                  <p className="mb-2 font-bold">中文翻譯（供自己確認）</p>
                  <p>我有飲食限制。</p>
                  {dietAllowed.length > 0 && <p>✓ 可以吃：{dietAllowed.map(item => item.zh).join("、")}。</p>}
                  {dietBlocked.length > 0 && <p>✕ 不能吃：{dietBlocked.map(item => item.zh).join("、")}。</p>}
                  {dietBlocked.length > 0 && <p>高湯、湯品、醬料及調味料也請不要使用上述不能吃的食材。</p>}
                  <p>請問有符合這些條件、我可以吃的料理嗎？</p>
                </div>
              </div>
            ) : (
            <div className="my-8 text-center">
              <p className="whitespace-pre-line break-words text-[28px] font-bold leading-[1.5] tracking-wide text-slate-950">
                {/サイズ|尺寸|尺碼/.test(selectedPhrase.japanese + selectedPhrase.chinese)
                  ? `${clothingSize}サイズはありますか？`
                  : getDisplayPhrase(selectedPhrase).japanese}
              </p>

              {selectedPhrase.reading && !/サイズ|尺寸|尺碼/.test(selectedPhrase.japanese + selectedPhrase.chinese) && (
                <p className="mt-3 text-sm font-bold text-[#9A7136]">
                  {
                    getDisplayPhrase(selectedPhrase).reading
                  }
                </p>
              )}

              {selectedPhrase.id !== "vegetarian-card" && (

                <p className="mt-3 text-xs font-medium leading-5 text-[#9A8C7B]">
                  {
                    (/サイズ|尺寸|尺碼/.test(selectedPhrase.japanese + selectedPhrase.chinese) ? `${clothingSize} saizu wa arimasu ka?` : getDisplayPhrase(selectedPhrase).romaji)
                  }
                </p>

              )}

              <div className="mx-auto mt-6 h-px w-16 bg-slate-200" />

              <p className="mt-6 text-sm font-medium leading-6 text-slate-500">
                {
                  (/サイズ|尺寸|尺碼/.test(selectedPhrase.japanese + selectedPhrase.chinese) ? `請問有 ${clothingSize} 號嗎？` : getDisplayPhrase(selectedPhrase).chinese)
                }
              </p>

            </div>

            )}

            <button type="button" onClick={() => speakJapanese(/サイズ|尺寸|尺碼/.test(selectedPhrase.japanese + selectedPhrase.chinese) ? `${clothingSize}サイズはありますか？` : (selectedPhrase.id === "vegetarian-card" ? dietJapanese : getDisplayPhrase(selectedPhrase).japanese))} className="mb-2 w-full rounded-2xl border border-[#E8DFD1] bg-[#FFF8E9] py-3 text-sm font-bold text-[#493A2B]">🔊 播放日文發音</button>
            {speechMessage && <p role="status" className="mb-2 text-xs text-[#756756]">{speechMessage}</p>}
            <button
              type="button"
              onClick={() =>
                setSelectedPhrase(
                  null
                )
              }
              className="w-full rounded-2xl bg-[#F6D27A] py-3.5 text-sm font-bold text-[#493A2B]"
            >
              關閉
            </button>

          </div>

        </div>

      )}

    </main>
  );
}

// ========================================
// INTERACTIVE PHRASE CARD
// ========================================

type InteractivePhraseCardProps = {
  icon: string;
  label: string;

  number: number;

  suffix?: string;

  japanese: string;
  reading: string;
  chinese: string;

  onDecrease: () => void;
  onIncrease: () => void;

  onShow: () => void;
  onSpeak: () => void;

  isFavorite: boolean;

  onFavorite: () => void;
};

function InteractivePhraseCard({
  icon,
  label,
  number,
  suffix = "",
  japanese,
  reading,
  chinese,
  onDecrease,
  onIncrease,
  onShow,
  onSpeak,
  isFavorite,
  onFavorite,
}: InteractivePhraseCardProps) {

  return (

    <article className="overflow-hidden rounded-[24px] border border-[#E8DFD1] bg-white shadow-sm shadow-[#D8C7A8]/25">

      {/* HEADER */}

      <div className="flex items-center justify-between bg-[#FFF3DE] px-4 py-3">

        <div className="flex items-center gap-2">

          <span className="text-lg">
            {icon}
          </span>

          <div>

            <p className="text-[9px] font-bold tracking-[0.14em] text-[#AD8B5A]">
              QUICK PHRASE
            </p>

            <p className="text-xs font-bold text-slate-800">
              {label}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={
            onFavorite
          }
          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
            isFavorite
              ? "bg-[#FFF3DE] text-[#B5852B]"
              : "bg-white text-[#A69988]"
          }`}
        >
          ★
        </button>

      </div>

      {/* PHRASE */}

      <button
        type="button"
        onClick={
          onShow
        }
        className="w-full px-4 pt-4 text-left"
      >

        <p className="text-[18px] font-bold leading-7 text-[#3E3A39]">
          {japanese}
        </p>

        <p className="mt-1 text-[11px] font-medium text-[#9A7136]">
          {reading}
        </p>

        <p className="mt-2 text-sm font-medium text-slate-500">
          {chinese}
        </p>

      </button>

    {/* COUNTER */}

    <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3">

    {/* SMALL COUNTER */}

    <div className="flex items-center overflow-hidden rounded-xl border border-[#E8DFD1] bg-[#F5F0E7]">

        <button
        type="button"
        disabled={number <= 1}
        onClick={onDecrease}
        className={`flex h-9 w-9 items-center justify-center text-base font-bold ${
            number <= 1
            ? "text-slate-200"
            : "text-[#756756] active:bg-slate-200"
        }`}
        >
        −
        </button>

        <button
        type="button"
        onClick={onShow}
        className="flex h-9 min-w-[44px] items-center justify-center border-x border-[#E8DFD1] bg-white px-2"
        >
        <span className="text-sm font-black text-[#3E3A39]">
            {number}
        </span>

        {suffix && (
            <span className="ml-0.5 text-[10px] font-bold text-[#9A8C7B]">
            {suffix}
            </span>
        )}
        </button>

        <button
        type="button"
        disabled={number >= 10}
        onClick={onIncrease}
        className={`flex h-9 w-9 items-center justify-center text-base font-bold ${
            number >= 10
            ? "text-slate-200"
            : "text-[#756756] active:bg-slate-200"
        }`}
        >
        ＋
        </button>

    </div>

    <button type="button" onClick={onSpeak} aria-label="朗讀日文" className="rounded-xl border border-[#E8DFD1] bg-white px-3 py-2 text-sm">🔊</button>

    {/* LARGE DISPLAY */}

    <button
        type="button"
        onClick={onShow}
        className="rounded-xl bg-[#F6D27A] px-4 py-2.5 text-[11px] font-bold text-[#493A2B]"
    >
        大字顯示
    </button>

    </div>

    </article>

  );
}

// ========================================
// HELPER
// ========================================

function capitalize(
  value: string
) {
  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}
