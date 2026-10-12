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
  | "all"
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
      "all"
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

  const quantityWord =
    quantityWords[
      quantity - 1
    ];

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
          if (
            selectedCategory !==
              "all" &&
            phrase.category !==
              selectedCategory
          ) {
            return false;
          }

          if (
            favoriteOnly &&
            !favorites.includes(
              phrase.id
            )
          ) {
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
          `これを${quantityWord.japanese}お願いします。`,

        reading:
          `これを${quantityWord.reading}おねがいします。`,

        romaji:
          `Kore o ${quantityWord.romaji} onegaishimasu.`,

        chinese:
          `請給我 ${quantity} 份這個。`,
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
    setSelectedPhrase(
      getDisplayPhrase(
        phrase
      )
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700"
          >
            ‹
          </Link>

          <div className="text-center">

            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
              TRAVEL JAPANESE
            </p>

            <h1 className="text-sm font-bold text-slate-900">
              旅遊日語
            </h1>

          </div>

          <button
            type="button"
            onClick={() =>
              setFavoriteOnly(
                (current) =>
                  !current
              )
            }
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
              favoriteOnly
                ? "bg-amber-100 text-amber-500"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            ★
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-md px-5 pb-28 pt-5">

        {/* HERO */}

        <section className="rounded-[28px] bg-slate-900 p-5 text-white">

          <p className="text-[10px] font-bold tracking-[0.18em] text-blue-300">
            JAPAN SURVIVAL KIT
          </p>

          <h2 className="mt-1.5 text-xl font-bold">
            不會說也沒關係 🇯🇵
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            找到你要說的句子，
            點一下直接放大給對方看。
          </p>

          {/* SEARCH */}

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900">

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
              placeholder="搜尋：蔥蒜、寄放行李、刷卡..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="text-sm text-slate-400"
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
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600"
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

        {/* FAVORITE MODE */}

        {favoriteOnly && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">

            <div>

              <p className="text-xs font-bold text-amber-800">
                ★ 我的收藏
              </p>

              <p className="mt-0.5 text-[10px] text-amber-600">
                旅行時最常用的句子
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setFavoriteOnly(
                  false
                )
              }
              className="text-[11px] font-bold text-amber-700"
            >
              顯示全部
            </button>

          </div>
        )}

        {/* VEGETARIAN CARD */}

        {selectedCategory ===
          "vegetarian" && (

          <section className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl">
                🌱
              </div>

              <div>

                <p className="text-sm font-bold text-emerald-950">
                  素食點餐小提醒
                </p>

                <p className="mt-1 text-[11px] leading-5 text-emerald-800">
                  只說「ベジタリアン」
                  有時資訊不夠。
                  建議再確認肉、魚、
                  蔥蒜與高湯。
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
                      "ベジタリアンです。\n肉・魚・ネギ・ニンニク・ニラは食べません。\n魚や肉のだしも食べられません。",

                    romaji:
                      "Bejitarian desu.",

                    chinese:
                      "我吃素。不吃肉、魚、蔥、蒜、韭菜，魚類或肉類熬製的高湯也不吃。",

                    important:
                      true,
                  }
                )
              }
              className="mt-3 w-full rounded-2xl bg-emerald-700 py-3 text-xs font-bold text-white"
            >
              🌱 顯示給店員看
            </button>

          </section>
        )}

        {/* COUNT */}

        <div className="mt-5 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
              PHRASES
            </p>

            <h2 className="mt-1 text-base font-bold text-slate-900">
              {favoriteOnly
                ? "我的收藏"
                : "實用句子"}
            </h2>

          </div>

          <p className="text-[11px] font-medium text-slate-400">
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
              // QUANTITY
              // ============================

              if (
                phrase.interactiveType ===
                "quantity"
              ) {
                return (
                  <InteractivePhraseCard
                    key={
                      phrase.id
                    }
                    icon="🍜"
                    label="點餐數量"
                    number={
                      quantity
                    }
                    japanese={`これを${quantityWord.japanese}お願いします。`}
                    reading={
                      quantityWord.reading
                    }
                    chinese={`請給我 ${quantity} 份這個。`}
                    onDecrease={() =>
                      setQuantity(
                        (current) =>
                          Math.max(
                            1,
                            current -
                              1
                          )
                      )
                    }
                    onIncrease={() =>
                      setQuantity(
                        (current) =>
                          Math.min(
                            10,
                            current +
                              1
                          )
                      )
                    }
                    onShow={() =>
                      openPhrase(
                        phrase
                      )
                    }
                    isFavorite={
                      isFavorite
                    }
                    onFavorite={() =>
                      toggleFavorite(
                        phrase.id
                      )
                    }
                  />
                );
              }

              // ============================
              // PEOPLE
              // ============================

              if (
                phrase.interactiveType ===
                "people"
              ) {
                return (
                  <InteractivePhraseCard
                    key={
                      phrase.id
                    }
                    icon="👥"
                    label="用餐人數"
                    number={
                      people
                    }
                    suffix="人"
                    japanese={`${peopleWord.japanese}です。`}
                    reading={
                      peopleWord.reading
                    }
                    chinese={`我們 ${people} 位。`}
                    onDecrease={() =>
                      setPeople(
                        (current) =>
                          Math.max(
                            1,
                            current -
                              1
                          )
                      )
                    }
                    onIncrease={() =>
                      setPeople(
                        (current) =>
                          Math.min(
                            10,
                            current +
                              1
                          )
                      )
                    }
                    onShow={() =>
                      openPhrase(
                        phrase
                      )
                    }
                    isFavorite={
                      isFavorite
                    }
                    onFavorite={() =>
                      toggleFavorite(
                        phrase.id
                      )
                    }
                  />
                );
              }

              // ============================
              // NORMAL
              // ============================

              return (
                <article
                  key={
                    phrase.id
                  }
                  className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40"
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
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                            USEFUL
                          </span>
                        )}

                        <span className="text-[9px] font-bold tracking-[0.12em] text-slate-300">
                          TAP TO SHOW
                        </span>

                      </div>

                      <p className="mt-2 text-[17px] font-bold leading-7 text-slate-900">
                        {
                          phrase.japanese
                        }
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-400">
                        {
                          phrase.romaji
                        }
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-600">
                        {
                          phrase.chinese
                        }
                      </p>

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite(
                          phrase.id
                        )
                      }
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                        isFavorite
                          ? "bg-amber-50 text-amber-400"
                          : "bg-slate-50 text-slate-300"
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
            0 && (

            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-12 text-center">

              <div className="text-3xl">
                🔍
              </div>

              <p className="mt-3 text-sm font-bold text-slate-700">
                找不到這句
              </p>

              <p className="mt-1 text-xs text-slate-400">
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

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

          <div className="max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-5 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                  SHOW THIS
                </p>

                <p className="mt-1 text-xs font-bold text-slate-600">
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600"
              >
                ×
              </button>

            </div>

            <div className="my-8 text-center">

              <p className="whitespace-pre-line text-[28px] font-bold leading-[1.65] tracking-wide text-slate-950">
                {
                  selectedPhrase.japanese
                }
              </p>

              {selectedPhrase.reading && (
                <p className="mt-3 text-sm font-bold text-blue-500">
                  {
                    selectedPhrase.reading
                  }
                </p>
              )}

              {selectedPhrase.id !==
                "vegetarian-card" && (

                <p className="mt-3 text-xs font-medium leading-5 text-slate-400">
                  {
                    selectedPhrase.romaji
                  }
                </p>

              )}

              <div className="mx-auto mt-6 h-px w-16 bg-slate-200" />

              <p className="mt-6 text-sm font-medium leading-6 text-slate-500">
                {
                  selectedPhrase.chinese
                }
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedPhrase(
                  null
                )
              }
              className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white"
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
  isFavorite,
  onFavorite,
}: InteractivePhraseCardProps) {

  return (

    <article className="overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-sm shadow-slate-200/40">

      {/* HEADER */}

      <div className="flex items-center justify-between bg-blue-50/70 px-4 py-3">

        <div className="flex items-center gap-2">

          <span className="text-lg">
            {icon}
          </span>

          <div>

            <p className="text-[9px] font-bold tracking-[0.14em] text-blue-400">
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
              ? "bg-amber-50 text-amber-400"
              : "bg-white text-slate-300"
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

        <p className="text-[18px] font-bold leading-7 text-slate-900">
          {japanese}
        </p>

        <p className="mt-1 text-[11px] font-medium text-blue-500">
          {reading}
        </p>

        <p className="mt-2 text-sm font-medium text-slate-500">
          {chinese}
        </p>

      </button>

    {/* COUNTER */}

    <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3">

    {/* SMALL COUNTER */}

    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

        <button
        type="button"
        disabled={number <= 1}
        onClick={onDecrease}
        className={`flex h-9 w-9 items-center justify-center text-base font-bold ${
            number <= 1
            ? "text-slate-200"
            : "text-slate-600 active:bg-slate-200"
        }`}
        >
        −
        </button>

        <button
        type="button"
        onClick={onShow}
        className="flex h-9 min-w-[44px] items-center justify-center border-x border-slate-200 bg-white px-2"
        >
        <span className="text-sm font-black text-slate-900">
            {number}
        </span>

        {suffix && (
            <span className="ml-0.5 text-[10px] font-bold text-slate-400">
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
            : "text-slate-600 active:bg-slate-200"
        }`}
        >
        ＋
        </button>

    </div>

    {/* LARGE DISPLAY */}

    <button
        type="button"
        onClick={onShow}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-bold text-white"
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