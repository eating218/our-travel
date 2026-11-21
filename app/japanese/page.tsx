"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
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

// ========================================
// PAGE
// ========================================

export default function JapanesePage() {
  const [
    search,
    setSearch,
  ] =
    useState("");

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
  const [speechMessage, setSpeechMessage] = useState("");
  const [clothingSize, setClothingSize] = useState("M");
  const [shoppingCounter, setShoppingCounter] = useState<ShoppingCounter>("general");

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
      const keyword =
        search
          .trim()
          .toLowerCase();

      return japanesePhrases.filter(
        (phrase) => {
          if (selectedCategory === "favorites") {
            if (!favorites.includes(phrase.id)) return false;
          } else if (phrase.category !== selectedCategory) {
            return false;
          }

          if (!keyword) {
            return true;
          }

          const target = [
            phrase.japanese,
            phrase.reading ??
              "",
            phrase.romaji,
            phrase.chinese,
            ...(
              phrase.keywords ??
              []
            ),
          ]
            .join(" ")
            .toLowerCase();

          return target.includes(
            keyword
          );
        }
      );
    }, [
      search,
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

        {/* HERO */}

        <section className="rounded-[28px] border border-[#E6D6B9] bg-[#F3E5CA] p-5 text-[#493A2B]">

          <p className="text-[10px] font-bold tracking-[0.18em] text-[#9B7948]">
            JAPANESE PHRASEBOOK
          </p>

          <h2 className="mt-1.5 text-xl font-bold">
            旅行日語隨身手帳
          </h2>

          <p className="mt-2 text-xs leading-5 text-[#A69988]">
            想說的話，隨時找得到。
            點一下放大給對方看。
          </p>

          {/* SEARCH */}

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[#3E3A39]">

            <span className="text-sm">
              🔍
            </span>

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="搜尋：廁所、素食、車站、結帳..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9A8C7B]"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="text-sm text-[#9A8C7B]"
              >
                ×
              </button>
            )}

          </div>

        </section>

        {/* CATEGORY */}

        <section className="mt-5">

          <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            <div className="flex w-max gap-2">

              <button
                type="button"
                onClick={() => { setSelectedCategory("favorites"); setFavoriteOnly(false); }}
                className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${selectedCategory === "favorites" ? "bg-[#F6D27A] text-[#493A2B]" : "border border-[#E8DFD1] bg-white text-[#756756]"}`}
              >⭐ 常用</button>
              {japaneseCategories.map(
                (
                  category
                ) => {
                  const active =
                    selectedCategory ===
                    category.id;

                  return (
                    <button
                      key={
                        category.id
                      }
                      type="button"
                      onClick={() => {
                        setSelectedCategory(
                          category.id
                        );

                        setFavoriteOnly(
                          false
                        );
                      }}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                        active
                          ? "bg-[#F6D27A] text-[#493A2B]"
                          : "border border-[#E8DFD1] bg-white text-[#756756]"
                      }`}
                    >

                      <span>
                        {
                          category.icon
                        }
                      </span>

                      <span>
                        {
                          category.label
                        }
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </section>

        {/* CUSTOM STATION: transport category only */}
        {selectedCategory === "transport" && !favoriteOnly && (
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
            <button type="button" onClick={() => setSelectedPhrase({id:"custom-station", category:"transport" as JapaneseCategory, japanese:`${stationJapanese.trim()}まで行きたいです。`, romaji:"", chinese:`我想去${stationInput.trim() || stationJapanese.trim()}。`})} className="mt-3 w-full rounded-xl bg-[#F6D27A] px-4 py-3 text-sm font-bold text-[#493A2B]">大字顯示：{stationJapanese.trim()}まで行きたいです。</button>
          )}
          <p className="mt-2 text-[10px] text-[#9A8C7B]">請確認翻譯是否為正確站名；此功能不會在離線時自動翻譯。</p>
          </>)}
        </section>
        )}


        {selectedCategory === "favorites" && favorites.length === 0 && (
          <section className="mt-4 rounded-2xl border border-dashed border-[#D8C7A8] bg-white px-4 py-6 text-center">
            <p className="text-sm font-bold text-[#493A2B]">常用清單還是空的</p>
            <p className="mt-2 text-xs leading-5 text-[#756756]">到其他分類點選 ☆，就能將需要的句子加入這裡。</p>
          </section>
        )}

        {/* VEGETARIAN CARD */}

        {selectedCategory ===
          "vegetarian" && (

          <section className="mt-4 rounded-[24px] border border-[#D8D8B9] bg-[#F2F1DF] p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl">
                🌱
              </div>

              <div>

                <p className="text-sm font-bold text-[#493A2B]">
                  素食點餐小提醒
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#6B6049]">
                  只說「ベジタリアン」
                  有時資訊不夠。
                  蛋與奶可以，其他動物製品不行。
                  洋蔥、蔥、蒜、韭菜、藠頭及阿魏也不吃；請特別確認高湯與調味料。
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedPhrase(
                  {
                    id:
                      "vegetarian-card",

                    category:
                      "vegetarian",

                    japanese:
                      "私は台湾式の卵乳菜食で、五葷も食べません。\n卵と牛乳・乳製品は食べられます。\n肉、鶏肉、魚、魚介類、その他の動物性食品（卵・乳製品を除く）は食べられません。\n玉ねぎ、長ねぎ・青ねぎ、にんにく、にら、らっきょう、アサフェティダも食べられません。\nかつおだし、魚醤、オイスターソース、ゼラチン、ラードなども使わないでください。\n調味料やスープのだしも確認していただけますか。",

                    romaji:
                      "Watashi wa bejitarian desu.",

                    chinese:
                      "台灣蛋奶素（不吃五辛）：可以吃蛋、牛奶與乳製品；不吃肉、禽類、魚、海鮮及其他動物製品。也不吃洋蔥、青蔥、大蒜、韭菜、藠頭、阿魏。請確認柴魚高湯、魚露、蠔油、明膠、豬油等調味料與配料。",

                    important:
                      true,
                  }
                )
              }
              className="mt-3 w-full rounded-2xl bg-[#D6B56D] py-3 text-xs font-bold text-[#493A2B]"
            >
              🌱 顯示給店員看
            </button>

          </section>
        )}

        {/* EMERGENCY CONTACTS — stored locally for offline use */}
        {selectedCategory === "emergency" && !favoriteOnly && (
          <section className="mt-4 rounded-[24px] border border-[#E8C5BC] bg-[#FFF1EC] p-4">
            <p className="text-sm font-bold text-[#844B3F]">🆘 日本緊急聯絡</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href="tel:110" className="rounded-2xl bg-white px-3 py-3 text-center text-sm font-bold text-[#844B3F]">警察 110</a>
              <a href="tel:119" className="rounded-2xl bg-white px-3 py-3 text-center text-sm font-bold text-[#844B3F]">消防／救護 119</a>
            </div>
            <a href="tel:05038162787" className="mt-2 block rounded-2xl bg-white px-3 py-3 text-center text-xs font-bold text-[#844B3F]">Japan Visitor Hotline · 050-3816-2787</a>
            <p className="mt-2 text-[10px] leading-5 text-[#98736B]">號碼可離線查看；撥打電話仍需通訊服務。旅客熱線資訊建議出發前再次確認。</p>
          </section>
        )}

        {/* COUNT */}

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

          <p className="text-[11px] font-medium text-[#9A8C7B]">
            {
              filteredPhrases.length
            }{" "}
            句
          </p>

        </div>

        {/* PHRASES */}

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
                  className="rounded-[18px] border border-[#E8DFD1] bg-white px-3.5 py-3 shadow-sm shadow-[#D8C7A8]/25"
                >

                  <div className="flex items-start gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        openPhrase(
                          phrase
                        )
                      }
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

                    <button type="button" aria-label="朗讀日文" title="朗讀日文" onClick={() => speakJapanese(getDisplayPhrase(phrase).japanese)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F0E7] text-base text-[#756756]">🔊</button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite(
                          phrase.id
                        )
                      }
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
            0 && !(selectedCategory === "favorites" && !search.trim() && favorites.length === 0) && (

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

              {selectedPhrase.id !==
                "vegetarian-card" && selectedPhrase.id !== "custom-station" && (

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

            <button type="button" onClick={() => speakJapanese(/サイズ|尺寸|尺碼/.test(selectedPhrase.japanese + selectedPhrase.chinese) ? `${clothingSize}サイズはありますか？` : getDisplayPhrase(selectedPhrase).japanese)} className="mb-2 w-full rounded-2xl border border-[#E8DFD1] bg-[#FFF8E9] py-3 text-sm font-bold text-[#493A2B]">🔊 播放日文發音</button>
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
