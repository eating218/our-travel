"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  BaggageType,
  ChecklistCategory,
  ChecklistItem,
} from "../../data/checklistData";

import {
  useChecklist,
} from "../../hooks/useChecklist";


// ========================================
// FILTER
// ========================================

type FilterType =
  | "all"
  | "carry-on"
  | "checked";


// ========================================
// ADD ITEM STATE
// ========================================

type AddItemState = {
  categoryId: string;
} | null;


// ========================================
// BAGGAGE CONFIG
// ========================================

const baggageConfig = {
  "carry-on": {
    icon: "🎒",
    label: "隨身",
  },

  checked: {
    icon: "🧳",
    label: "託運",
  },

  either: {
    icon: "↔",
    label: "皆可",
  },

  none: {
    icon: "",
    label: "",
  },
} satisfies Record<
  BaggageType,
  {
    icon: string;
    label: string;
  }
>;


// ========================================
// PAGE
// ========================================

export default function ChecklistPage() {
  const {
    loaded,

    categories,
    items,

    total,
    completed,
    percent,

    toggleItem,

    addItem,
    deleteItem,

    addCategory,
    deleteCategory,
  } = useChecklist();


  // ========================================
  // FILTER
  // ========================================

  const [
    filter,
    setFilter,
  ] = useState<FilterType>("all");


  // ========================================
  // COLLAPSED CATEGORIES
  // ========================================

  const [
    collapsedCategories,
    setCollapsedCategories,
  ] = useState<Set<string>>(
    new Set()
  );


  // ========================================
  // ADD ITEM
  // ========================================

  const [
    addItemState,
    setAddItemState,
  ] = useState<AddItemState>(
    null
  );


  const [
    newItemTitle,
    setNewItemTitle,
  ] = useState("");


  const [
    newItemBaggage,
    setNewItemBaggage,
  ] = useState<BaggageType>(
    "either"
  );


  // ========================================
  // ADD CATEGORY
  // ========================================

  const [
    showAddCategory,
    setShowAddCategory,
  ] = useState(false);


  const [
    newCategoryTitle,
    setNewCategoryTitle,
  ] = useState("");


  // ========================================
  // FILTER ITEMS
  // ========================================

  const filteredItems = useMemo(
    () => {
      if (filter === "all") {
        return items;
      }

      if (filter === "carry-on") {
        return items.filter(
          (item) =>
            item.baggage ===
              "carry-on" ||
            item.baggage ===
              "either"
        );
      }

      return items.filter(
        (item) =>
          item.baggage ===
            "checked" ||
          item.baggage ===
            "either"
      );
    },
    [
      filter,
      items,
    ]
  );


  // ========================================
  // TOGGLE CATEGORY
  // ========================================

  function toggleCategory(
    categoryId: string
  ) {
    setCollapsedCategories(
      (current) => {
        const next =
          new Set(current);

        if (
          next.has(categoryId)
        ) {
          next.delete(
            categoryId
          );
        } else {
          next.add(
            categoryId
          );
        }

        return next;
      }
    );
  }


  // ========================================
  // COLLAPSE ALL
  // ========================================

  function collapseAll() {
    setCollapsedCategories(
      new Set(
        categories.map(
          (category) =>
            category.id
        )
      )
    );
  }


  // ========================================
  // EXPAND ALL
  // ========================================

  function expandAll() {
    setCollapsedCategories(
      new Set()
    );
  }


  const allCollapsed =
    categories.length > 0 &&
    categories.every(
      (category) =>
        collapsedCategories.has(
          category.id
        )
    );


  // ========================================
  // ADD ITEM
  // ========================================

  function handleAddItem() {
    if (!addItemState) {
      return;
    }

    const title =
      newItemTitle.trim();

    if (!title) {
      return;
    }

    addItem(
      addItemState.categoryId,
      title,
      newItemBaggage
    );

    setNewItemTitle("");

    setNewItemBaggage(
      "either"
    );

    setAddItemState(
      null
    );
  }


  // ========================================
  // ADD CATEGORY
  // ========================================

  function handleAddCategory() {
    const title =
      newCategoryTitle.trim();

    if (!title) {
      return;
    }

    addCategory(title);

    setNewCategoryTitle("");

    setShowAddCategory(
      false
    );
  }


  // ========================================
  // LOADING
  // ========================================

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
            <div className="h-9 w-9 rounded-full bg-slate-100" />

            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

            <div className="w-9" />
          </div>
        </header>

        <div className="mx-auto max-w-md px-5 pt-6">
          <div className="h-24 animate-pulse rounded-3xl bg-slate-200" />

          <div className="mt-7 h-72 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }


  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg transition active:scale-95"
          >
            ‹
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
              MY PACKING LIST
            </p>

            <h1 className="text-sm font-bold text-slate-900">
              旅行用品
            </h1>
          </div>

          <div className="h-9 w-9" />

        </div>
      </header>


      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="mx-auto max-w-md px-5 pb-28 pt-5">

        {/* =================================
            PROGRESS
        ================================= */}

        <section className="rounded-3xl bg-slate-900 px-5 py-4 text-white">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">
                PACKING
              </p>

              <p className="mt-1 text-xl font-bold">
                {completed}

                <span className="text-slate-500">
                  {" / "}
                  {total}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold">
                {percent}

                <span className="text-sm text-slate-400">
                  %
                </span>
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                已準備
              </p>
            </div>

          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{
                width:
                  `${percent}%`,
              }}
            />
          </div>

        </section>


        {/* =================================
            FILTER
        ================================= */}

        <section className="mt-4 flex rounded-2xl bg-slate-100 p-1">

          <FilterButton
            active={
              filter === "all"
            }
            onClick={() =>
              setFilter("all")
            }
          >
            全部
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "carry-on"
            }
            onClick={() =>
              setFilter(
                "carry-on"
              )
            }
          >
            🎒 隨身
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "checked"
            }
            onClick={() =>
              setFilter(
                "checked"
              )
            }
          >
            🧳 託運
          </FilterButton>

        </section>


        {/* =================================
            LIST ACTIONS
        ================================= */}

        <section className="mt-5 flex items-center justify-between px-1">

          <button
            type="button"
            onClick={() => {
              setNewCategoryTitle(
                ""
              );

              setShowAddCategory(
                true
              );
            }}
            className="text-xs font-bold text-slate-700 transition active:opacity-50"
          >
            ＋ 新增分類
          </button>


          <button
            type="button"
            onClick={
              allCollapsed
                ? expandAll
                : collapseAll
            }
            className="text-[11px] font-bold text-slate-400 transition active:opacity-50"
          >
            {allCollapsed
              ? "全部展開 ↓"
              : "全部收合 ↑"}
          </button>

        </section>


        {/* =================================
            CATEGORIES
        ================================= */}

        <div className="mt-4 space-y-3">

          {categories.map(
            (category) => {

              const categoryItems =
                filteredItems.filter(
                  (item) =>
                    item.categoryId ===
                    category.id
                );


              if (
                filter !== "all" &&
                categoryItems.length ===
                  0
              ) {
                return null;
              }


              const collapsed =
                collapsedCategories.has(
                  category.id
                );


              return (
                <CategorySection
                  key={
                    category.id
                  }

                  category={
                    category
                  }

                  items={
                    categoryItems
                  }

                  collapsed={
                    collapsed
                  }

                  filter={
                    filter
                  }

                  onToggleCategory={() =>
                    toggleCategory(
                      category.id
                    )
                  }

                  onToggle={
                    toggleItem
                  }

                  onDeleteItem={
                    deleteItem
                  }

                  onDeleteCategory={
                    deleteCategory
                  }

                  onAddItem={() => {
                    setNewItemTitle(
                      ""
                    );

                    setNewItemBaggage(
                      "either"
                    );

                    setAddItemState({
                      categoryId:
                        category.id,
                    });
                  }}
                />
              );
            }
          )}

        </div>

      </div>


      {/* =====================================
          ADD ITEM SHEET
      ===================================== */}

      {addItemState && (
        <BottomSheet
          onClose={() =>
            setAddItemState(
              null
            )
          }
        >

          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">
            NEW ITEM
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            新增旅行用品
          </h2>


          <input
            autoFocus
            value={
              newItemTitle
            }
            onChange={(
              event
            ) =>
              setNewItemTitle(
                event.target.value
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                handleAddItem();
              }
            }}
            placeholder="例如：相機"
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
          />


          <p className="mt-5 text-xs font-bold text-slate-500">
            放哪裡？
          </p>


          <div className="mt-2 grid grid-cols-3 gap-2">

            <BaggageButton
              active={
                newItemBaggage ===
                "carry-on"
              }
              onClick={() =>
                setNewItemBaggage(
                  "carry-on"
                )
              }
            >
              🎒 隨身
            </BaggageButton>


            <BaggageButton
              active={
                newItemBaggage ===
                "checked"
              }
              onClick={() =>
                setNewItemBaggage(
                  "checked"
                )
              }
            >
              🧳 託運
            </BaggageButton>


            <BaggageButton
              active={
                newItemBaggage ===
                "either"
              }
              onClick={() =>
                setNewItemBaggage(
                  "either"
                )
              }
            >
              ↔ 皆可
            </BaggageButton>

          </div>


          <div className="mt-6 flex gap-2">

            <button
              type="button"
              onClick={() =>
                setAddItemState(
                  null
                )
              }
              className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-500"
            >
              取消
            </button>


            <button
              type="button"
              onClick={
                handleAddItem
              }
              disabled={
                !newItemTitle.trim()
              }
              className="flex-[1.5] rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white disabled:opacity-30"
            >
              加入清單
            </button>

          </div>

        </BottomSheet>
      )}


      {/* =====================================
          ADD CATEGORY
      ===================================== */}

      {showAddCategory && (
        <BottomSheet
          onClose={() =>
            setShowAddCategory(
              false
            )
          }
        >

          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">
            NEW CATEGORY
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            新增分類
          </h2>


          <input
            autoFocus
            value={
              newCategoryTitle
            }
            onChange={(
              event
            ) =>
              setNewCategoryTitle(
                event.target.value
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                handleAddCategory();
              }
            }}
            placeholder="例如：攝影用品"
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-slate-900 focus:bg-white"
          />


          <div className="mt-5 flex gap-2">

            <button
              type="button"
              onClick={() =>
                setShowAddCategory(
                  false
                )
              }
              className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-500"
            >
              取消
            </button>


            <button
              type="button"
              onClick={
                handleAddCategory
              }
              disabled={
                !newCategoryTitle.trim()
              }
              className="flex-[1.5] rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white disabled:opacity-30"
            >
              新增分類
            </button>

          </div>

        </BottomSheet>
      )}

    </main>
  );
}


// ========================================
// CATEGORY SECTION
// ========================================

type CategorySectionProps = {
  category:
    ChecklistCategory;

  items:
    ChecklistItem[];

  collapsed:
    boolean;

  filter:
    FilterType;

  onToggleCategory:
    () => void;

  onToggle:
    (id: string) => void;

  onDeleteItem:
    (id: string) => void;

  onDeleteCategory:
    (id: string) => void;

  onAddItem:
    () => void;
};


function CategorySection({
  category,
  items,
  collapsed,
  filter,
  onToggleCategory,
  onToggle,
  onDeleteItem,
  onDeleteCategory,
  onAddItem,
}: CategorySectionProps) {

  const completed =
    items.filter(
      (item) =>
        item.completed
    ).length;


  const isComplete =
    items.length > 0 &&
    completed ===
      items.length;


  const percent =
    items.length === 0
      ? 0
      : Math.round(
          (
            completed /
            items.length
          ) * 100
        );


  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

      {/* =================================
          CATEGORY HEADER
      ================================= */}

      <div className="flex items-center">

        <button
          type="button"
          onClick={
            onToggleCategory
          }
          className="min-w-0 flex-1 px-4 py-4 text-left transition active:bg-slate-50"
        >

          <div className="flex items-center gap-3">

            {/* ICON */}

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isComplete
                  ? "bg-slate-900"
                  : "bg-slate-50"
              }`}
            >
              {isComplete ? (
                <span className="text-sm font-bold text-white">
                  ✓
                </span>
              ) : (
                <span className="text-lg">
                  {category.icon}
                </span>
              )}
            </div>


            {/* TEXT */}

            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-2">

                <h2
                  className={`truncate text-sm font-bold ${
                    isComplete
                      ? "text-slate-400"
                      : "text-slate-900"
                  }`}
                >
                  {category.title}
                </h2>


                {isComplete && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                    DONE
                  </span>
                )}

              </div>


              <div className="mt-1.5 flex items-center gap-2">

                <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-300"
                    style={{
                      width:
                        `${percent}%`,
                    }}
                  />
                </div>


                <span className="text-[10px] font-medium text-slate-400">
                  {completed}
                  {" / "}
                  {items.length}
                </span>

              </div>

            </div>


            {/* ARROW */}

            <span
              className={`shrink-0 text-xs text-slate-300 transition-transform duration-200 ${
                collapsed
                  ? ""
                  : "rotate-180"
              }`}
            >
              ↓
            </span>

          </div>

        </button>


        {/* DELETE CUSTOM CATEGORY */}

        {category.isCustom && (
          <button
            type="button"
            onClick={() => {
              const confirmed =
                window.confirm(
                  `刪除「${category.title}」分類與裡面的所有項目？`
                );

              if (confirmed) {
                onDeleteCategory(
                  category.id
                );
              }
            }}
            className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-slate-300 transition active:bg-slate-100"
            aria-label="刪除分類"
          >
            ×
          </button>
        )}

      </div>


      {/* =================================
          COLLAPSIBLE CONTENT
      ================================= */}

      {!collapsed && (
        <div className="border-t border-slate-100">

          {/* ITEMS */}

          {items.map(
            (
              item,
              index
            ) => (
              <ChecklistRow
                key={
                  item.id
                }
                item={
                  item
                }
                isLast={
                  index ===
                  items.length - 1
                }
                onToggle={
                  onToggle
                }
                onDelete={
                  onDeleteItem
                }
              />
            )
          )}


          {/* EMPTY */}

          {items.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              這個分類目前沒有項目
            </div>
          )}


          {/* ADD ITEM */}

          {filter === "all" && (
            <button
              type="button"
              onClick={
                onAddItem
              }
              className="flex w-full items-center px-4 py-3.5 text-left text-xs font-bold text-slate-400 transition active:bg-slate-50 active:text-slate-900"
            >
              ＋ 新增物品
            </button>
          )}

        </div>
      )}

    </section>
  );
}


// ========================================
// CHECKLIST ROW
// ========================================

type ChecklistRowProps = {
  item:
    ChecklistItem;

  isLast:
    boolean;

  onToggle:
    (id: string) => void;

  onDelete:
    (id: string) => void;
};


function ChecklistRow({
  item,
  isLast,
  onToggle,
  onDelete,
}: ChecklistRowProps) {

  const baggage =
    baggageConfig[
      item.baggage
    ];


  return (
    <div
      className={`flex gap-3 px-4 py-3.5 ${
        !isLast
          ? "border-b border-slate-100"
          : ""
      }`}
    >

      {/* CHECK */}

      <button
        type="button"
        onClick={() =>
          onToggle(
            item.id
          )
        }
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90 ${
          item.completed
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-transparent"
        }`}
      >
        <span className="text-[9px] font-bold">
          ✓
        </span>
      </button>


      {/* TEXT */}

      <button
        type="button"
        onClick={() =>
          onToggle(
            item.id
          )
        }
        className="min-w-0 flex-1 text-left"
      >

        <div className="flex flex-wrap items-center gap-2">

          <p
            className={`text-sm font-bold ${
              item.completed
                ? "text-slate-300 line-through"
                : "text-slate-800"
            }`}
          >
            {item.title}
          </p>


          {baggage.label && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                item.completed
                  ? "bg-slate-50 text-slate-300"
                  : item.baggage ===
                    "carry-on"
                  ? "bg-blue-50 text-blue-600"
                  : item.baggage ===
                    "checked"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {baggage.icon}{" "}
              {baggage.label}
            </span>
          )}

        </div>


        {item.note && (
          <p
            className={`mt-1 text-[10px] leading-4 ${
              item.completed
                ? "text-slate-200"
                : item.note.startsWith(
                    "⚠️"
                  )
                ? "font-medium text-amber-600"
                : "text-slate-400"
            }`}
          >
            {item.note}
          </p>
        )}

      </button>


      {/* DELETE ITEM */}

        <button
        type="button"
        onClick={() => {
            const confirmed =
            window.confirm(
                `確定要刪除「${item.title}」嗎？`
            );

            if (confirmed) {
            onDelete(
                item.id
            );
            }
        }}
        className="h-7 w-7 shrink-0 rounded-full text-sm text-slate-300 transition active:bg-slate-100"
        aria-label={`刪除 ${item.title}`}
        >
        ×
        </button>

    </div>
  );
}


// ========================================
// FILTER BUTTON
// ========================================

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex-1 rounded-xl px-2 py-2.5 text-[11px] font-bold transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}


// ========================================
// BAGGAGE BUTTON
// ========================================

function BaggageButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}


// ========================================
// BOTTOM SHEET
// ========================================

function BottomSheet({
  children,
  onClose,
}: {
  children:
    React.ReactNode;

  onClose:
    () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 backdrop-blur-[2px]">

      <button
        type="button"
        aria-label="關閉"
        onClick={
          onClose
        }
        className="absolute inset-0"
      />


      <div className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white p-5 pb-8 shadow-2xl">

        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-slate-200" />

        {children}

      </div>

    </div>
  );
}