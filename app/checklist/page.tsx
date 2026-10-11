"use client";

import Link from "next/link";

import {
  findBaggageRule,
} from "../../lib/baggageRules";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import {
  BaggageType,
  ChecklistCategory,
  ChecklistItem,
} from "../../data/checklistData";

import {
  useChecklist,
} from "../../hooks/useChecklist";

// ========================================
// TYPES
// ========================================

type FilterType =
  | "all"
  | "carry-on"
  | "checked";

type AddItemState = {
  categoryId: string;
} | null;

type DeleteItemState = {
  id: string;
  title: string;
} | null;

type EditItemState = {
  id: string;
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
    updateItem,
    deleteItem,
    reorderItems,

    addCategory,
    deleteCategory,
  } = useChecklist();

  // ========================================
  // DRAG SENSORS
  //
  // 滑鼠：按住稍微移動才開始
  // 手機：長按 400ms 才開始拖曳
  // ========================================

  const sensors =
    useSensors(
      useSensor(
        MouseSensor,
        {
          activationConstraint: {
            distance: 6,
          },
        }
      ),

      useSensor(
        TouchSensor,
        {
          activationConstraint: {
            delay: 400,
            tolerance: 8,
          },
        }
      )
    );

  // ========================================
  // FILTER
  // ========================================

  const [
    filter,
    setFilter,
  ] = useState<FilterType>(
    "all"
  );

  // ========================================
  // COLLAPSE
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

  const detectedBaggageRule =
  useMemo(
    () =>
      findBaggageRule(
        newItemTitle
      ),
    [newItemTitle]
  );

  useEffect(() => {
    if (detectedBaggageRule) 
      {
        setNewItemBaggage(
          detectedBaggageRule
            .recommendedBaggage
        );
      }
    }, [detectedBaggageRule]
  );

  const [
    newItemBaggage,
    setNewItemBaggage,
  ] = useState<BaggageType>(
    "either"
  );

  const [
    newItemUserNote,
    setNewItemUserNote,
  ] = useState("");

  // ========================================
  // EDIT ITEM
  // ========================================

  const [
    editItemState,
    setEditItemState,
  ] = useState<EditItemState>(
    null
  );

  const [
    editTitle,
    setEditTitle,
  ] = useState("");

  const [
    editBaggage,
    setEditBaggage,
  ] = useState<BaggageType>(
    "either"
  );

  const [
    editUserNote,
    setEditUserNote,
  ] = useState("");

  // ========================================
  // DELETE ITEM
  // ========================================

  const [
    deleteItemState,
    setDeleteItemState,
  ] = useState<DeleteItemState>(
    null
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

  const filteredItems =
    useMemo(
      () => {
        if (
          filter === "all"
        ) {
          return items;
        }

        if (
          filter ===
          "carry-on"
        ) {
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
  // CATEGORY
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

  function openAddItem(
    categoryId: string
  ) {
    setNewItemTitle("");

    setNewItemBaggage(
      "either"
    );

    setNewItemUserNote("");

    setAddItemState({
      categoryId,
    });
  }

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
      newItemBaggage,
      newItemUserNote
    );

    setAddItemState(
      null
    );

    setNewItemTitle("");
    setNewItemUserNote("");

    setNewItemBaggage(
      "either"
    );
  }

  // ========================================
  // EDIT ITEM
  // ========================================

  function openEditItem(
    item: ChecklistItem
  ) {
    setEditTitle(
      item.title
    );

    setEditBaggage(
      item.baggage
    );

    setEditUserNote(
      item.userNote ?? ""
    );

    setEditItemState({
      id: item.id,
    });
  }

  function handleSaveEdit() {
    if (!editItemState) {
      return;
    }

    const title =
      editTitle.trim();

    if (!title) {
      return;
    }

    updateItem(
      editItemState.id,
      {
        title,

        baggage:
          editBaggage,

        userNote:
          editUserNote,
      }
    );

    setEditItemState(
      null
    );
  }

  const editingItem =
    editItemState
      ? items.find(
          (item) =>
            item.id ===
            editItemState.id
        )
      : undefined;

  const editingBaggageRule =
  useMemo(
    () =>
      findBaggageRule(
        editTitle
      ),
    [editTitle]
  );

  useEffect(() => {
    if (
      editingBaggageRule
    ) {
      setEditBaggage(
        editingBaggageRule
          .recommendedBaggage
      );
    }
  }, [
    editingBaggageRule,
  ]);
  // ========================================
  // DELETE ITEM
  // ========================================

  function handleDeleteItem() {
    if (!deleteItemState) {
      return;
    }

    deleteItem(
      deleteItemState.id
    );

    setDeleteItemState(
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
  // DRAG END
  // ========================================

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const {
      active,
      over,
    } = event;

    if (!over) {
      return;
    }

    if (
      active.id === over.id
    ) {
      return;
    }

    const activeItem =
      items.find(
        (item) =>
          item.id === active.id
      );

    const overItem =
      items.find(
        (item) =>
          item.id === over.id
      );

    if (
      !activeItem ||
      !overItem
    ) {
      return;
    }

    // V1：禁止跨分類
    if (
      activeItem.categoryId !==
      overItem.categoryId
    ) {
      return;
    }

    reorderItems(
      activeItem.categoryId,
      activeItem.id,
      overItem.id
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={
        closestCenter
      }
      onDragEnd={
        handleDragEnd
      }
    >
      <main className="min-h-screen bg-slate-50">
        {/* HEADER */}

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

        {/* CONTENT */}

        <div className="mx-auto max-w-md px-5 pb-28 pt-5">
          {/* PROGRESS */}

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

          {/* FILTER */}

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

          {/* ACTIONS */}

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
              className="text-xs font-bold text-slate-700"
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
              className="text-[11px] font-bold text-slate-400"
            >
              {allCollapsed
                ? "全部展開 ↓"
                : "全部收合 ↑"}
            </button>
          </section>

          {/* CATEGORIES */}

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
                      collapsedCategories.has(
                        category.id
                      )
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
                    onEditItem={
                      openEditItem
                    }
                    onDeleteItem={(
                      id,
                      title
                    ) =>
                      setDeleteItemState({
                        id,
                        title,
                      })
                    }
                    onDeleteCategory={
                      deleteCategory
                    }
                    onAddItem={() =>
                      openAddItem(
                        category.id
                      )
                    }
                  />
                );
              }
            )}
          </div>

          {filter === "all" && (
            <p className="mt-4 text-center text-[10px] font-medium text-slate-300">
              長按物品即可拖曳排序
            </p>
          )}
        </div>

        {/* EDIT ITEM */}

        {editItemState &&
          editingItem && (
            <BottomSheet
              onClose={() =>
                setEditItemState(
                  null
                )
              }
            >
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">
                EDIT ITEM
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                編輯旅行用品
              </h2>

              <label className="mt-5 block text-xs font-bold text-slate-500">
                物品名稱
              </label>

              <input
                value={
                  editTitle
                }
                onChange={(
                  event
                ) =>
                  setEditTitle(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
              />

              <p className="mt-5 text-xs font-bold text-slate-500">
                放哪裡？
              </p>

              <div className="mt-2 grid grid-cols-3 gap-2">
                <BaggageButton
                  active={
                    editBaggage ===
                    "carry-on"
                  }
                  onClick={() =>
                    setEditBaggage(
                      "carry-on"
                    )
                  }
                >
                  🎒 隨身
                </BaggageButton>

                <BaggageButton
                  active={
                    editBaggage ===
                    "checked"
                  }
                  onClick={() =>
                    setEditBaggage(
                      "checked"
                    )
                  }
                >
                  🧳 託運
                </BaggageButton>

                <BaggageButton
                  active={
                    editBaggage ===
                    "either"
                  }
                  onClick={() =>
                    setEditBaggage(
                      "either"
                    )
                  }
                >
                  ↔ 皆可
                </BaggageButton>
              </div>

              {editingItem.note && (
                <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3">
                  <p className="text-[10px] font-bold tracking-wide text-amber-600">
                    注意事項
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    {
                      editingItem.note
                    }
                  </p>
                </div>
              )}

              {/* AIRLINE BAGGAGE RULE */}

              {editingBaggageRule && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
                      ⚠️
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[10px] font-bold tracking-[0.12em] text-amber-600">
                        航空行李注意
                      </p>

                      <h3 className="mt-0.5 text-sm font-bold text-slate-900">
                        {editingBaggageRule.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {editingBaggageRule.summary}
                      </p>

                      <div className="mt-3 space-y-1.5">

                        {editingBaggageRule.rules.map(
                          (rule) => (
                            <div
                              key={rule}
                              className="flex items-start gap-2 text-xs leading-5 text-slate-700"
                            >
                              <span className="shrink-0 font-bold text-amber-600">
                                •
                              </span>

                              <span>
                                {rule}
                              </span>
                            </div>
                          )
                        )}

                      </div>

                      <div className="mt-3 border-t border-amber-200 pt-2">

                        <p className="text-[10px] leading-4 text-slate-400">
                          資料來源：
                          {editingBaggageRule.sourceName}
                        </p>

                        <p className="text-[10px] leading-4 text-slate-400">
                          規則更新：
                          {editingBaggageRule.updatedAt}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          實際限制仍以搭乘航空公司的最新規定為準。
                        </p>

                      </div>

                    </div>
                  </div>

                </div>
              )}

              <label className="mt-5 block text-xs font-bold text-slate-500">
                📝 我的備註
              </label>

              <textarea
                value={
                  editUserNote
                }
                onChange={(
                  event
                ) =>
                  setEditUserNote(
                    event.target.value
                  )
                }
                placeholder="例如：記得帶白色那顆、放在側背包..."
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
              />

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditItemState(
                      null
                    )
                  }
                  className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-500"
                >
                  取消
                </button>

                <button
                  type="button"
                  disabled={
                    !editTitle.trim()
                  }
                  onClick={
                    handleSaveEdit
                  }
                  className="flex-[1.5] rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white disabled:opacity-30"
                >
                  儲存修改
                </button>
              </div>
            </BottomSheet>
          )}

        {/* DELETE ITEM */}

        {deleteItemState && (
          <BottomSheet
            onClose={() =>
              setDeleteItemState(
                null
              )
            }
          >
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
                🗑️
              </div>

              <p className="mt-5 text-[10px] font-bold tracking-[0.15em] text-slate-400">
                DELETE ITEM
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                刪除這個物品？
              </h2>

              <p className="mt-3 text-sm font-bold text-slate-700">
                {
                  deleteItemState.title
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                刪除後會從旅行用品清單移除
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteItemState(
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
                  handleDeleteItem
                }
                className="flex-[1.5] rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-600"
              >
                刪除物品
              </button>
            </div>
          </BottomSheet>
        )}

        {/* ADD ITEM */}

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

            <label className="mt-5 block text-xs font-bold text-slate-500">
              物品名稱
            </label>

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
              placeholder="例如：相機"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
            />

            {/* 航空行李安全提醒 */}
            {detectedBaggageRule && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
                    ⚠️
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[10px] font-bold tracking-[0.12em] text-amber-600">
                      航空行李注意
                    </p>

                    <h3 className="mt-0.5 text-sm font-bold text-slate-900">
                      {detectedBaggageRule.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {detectedBaggageRule.summary}
                    </p>

                    <div className="mt-3 space-y-1.5">
                      {detectedBaggageRule.rules.map(
                        (rule) => (
                          <div
                            key={rule}
                            className="flex items-start gap-2 text-xs leading-5 text-slate-700"
                          >
                            <span className="shrink-0 font-bold text-amber-600">
                              •
                            </span>

                            <span>
                              {rule}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-3 border-t border-amber-200 pt-2">

                      <p className="text-[10px] leading-4 text-slate-400">
                        資料來源：
                        {detectedBaggageRule.sourceName}
                      </p>

                      <p className="text-[10px] leading-4 text-slate-400">
                        規則更新：
                        {detectedBaggageRule.updatedAt}
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-slate-400">
                        實際限制仍以搭乘航空公司的最新規定為準。
                      </p>

                    </div>

                  </div>
                </div>
              </div>
            )}

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

            <label className="mt-5 block text-xs font-bold text-slate-500">
              📝 我的備註

              <span className="ml-1 font-medium text-slate-300">
                選填
              </span>
            </label>

            <textarea
              value={
                newItemUserNote
              }
              onChange={(
                event
              ) =>
                setNewItemUserNote(
                  event.target.value
                )
              }
              placeholder="例如：放側背包、記得前一天充電..."
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
            />

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
                disabled={
                  !newItemTitle.trim()
                }
                onClick={
                  handleAddItem
                }
                className="flex-[1.5] rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white disabled:opacity-30"
              >
                加入清單
              </button>
            </div>
          </BottomSheet>
        )}

        {/* ADD CATEGORY */}

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
              placeholder="例如：攝影用品"
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
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
    </DndContext>
  );
}

// ========================================
// CATEGORY
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

  onEditItem:
    (item: ChecklistItem) => void;

  onDeleteItem:
    (
      id: string,
      title: string
    ) => void;

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
  onEditItem,
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
      {/* HEADER */}

      <div className="flex items-center">
        <button
          type="button"
          onClick={
            onToggleCategory
          }
          className="min-w-0 flex-1 px-4 py-4 text-left active:bg-slate-50"
        >
          <div className="flex items-center gap-3">
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
                  {
                    category.icon
                  }
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2
                  className={`truncate text-sm font-bold ${
                    isComplete
                      ? "text-slate-400"
                      : "text-slate-900"
                  }`}
                >
                  {
                    category.title
                  }
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
                    className="h-full rounded-full bg-slate-900"
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

            <span
              className={`text-xs text-slate-300 transition-transform ${
                collapsed
                  ? ""
                  : "rotate-180"
              }`}
            >
              ↓
            </span>
          </div>
        </button>

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
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-300"
          >
            ×
          </button>
        )}
      </div>

      {/* ITEMS */}

      {!collapsed && (
        <div className="border-t border-slate-100">
          <SortableContext
            items={items.map(
              (item) =>
                item.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
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
                  dragEnabled={
                    filter === "all"
                  }
                  onToggle={
                    onToggle
                  }
                  onEdit={
                    onEditItem
                  }
                  onDelete={
                    onDeleteItem
                  }
                />
              )
            )}
          </SortableContext>

          {items.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              這個分類目前沒有項目
            </div>
          )}

          {filter === "all" && (
            <button
              type="button"
              onClick={
                onAddItem
              }
              className="flex w-full items-center px-4 py-3.5 text-xs font-bold text-slate-400 active:bg-slate-50"
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

  dragEnabled:
    boolean;

  onToggle:
    (id: string) => void;

  onEdit:
    (item: ChecklistItem) => void;

  onDelete:
    (
      id: string,
      title: string
    ) => void;
};

function ChecklistRow({
  item,
  isLast,
  dragEnabled,
  onToggle,
  onEdit,
  onDelete,
}: ChecklistRowProps) {
  const baggage =
    baggageConfig[
      item.baggage
    ];

  const baggageRule =
  findBaggageRule(
    item.title
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id:
      item.id,

    disabled:
      !dragEnabled,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),

    transition,

    zIndex:
      isDragging
        ? 20
        : undefined,

    position:
      isDragging
        ? ("relative" as const)
        : undefined,
  };

  return (
    <div
      ref={
        setNodeRef
      }
      style={
        style
      }
      className={`flex gap-3 px-4 py-3.5 transition-shadow ${
        !isLast
          ? "border-b border-slate-100"
          : ""
      } ${
        isDragging
          ? "scale-[1.02] bg-white shadow-xl"
          : "bg-white"
      }`}
    >
      {/* CHECK */}

      <button
        type="button"
        onClick={(
          event
        ) => {
          event.stopPropagation();

          onToggle(
            item.id
          );
        }}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          item.completed
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-transparent"
        }`}
      >
        <span className="text-[9px] font-bold">
          ✓
        </span>
      </button>

      {/* CONTENT
          短按 = 編輯
          長按 = 拖曳 */}

      <button
        type="button"
        {...(
          dragEnabled
            ? attributes
            : {}
        )}
        {...(
          dragEnabled
            ? listeners
            : {}
        )}
        onClick={() => {
          if (
            !isDragging
          ) {
            onEdit(item);
          }
        }}
        className={`min-w-0 flex-1 select-none text-left ${
          dragEnabled
            ? "touch-pan-y"
            : ""
        }`}
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

        {/* SYSTEM NOTE */}

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

        {/* AIRLINE BAGGAGE WARNING */}

        {baggageRule && (
          <div
            className={`mt-1.5 flex items-center gap-1.5 ${
              item.completed
                ? "text-slate-200"
                : "text-amber-600"
            }`}
          >
            <span className="text-[10px]">
              ⚠️
            </span>

            <span className="text-[10px] font-bold">
              搭機限制
            </span>

            {!item.completed && (
              <span className="text-[9px] font-medium text-amber-500">
                · 點擊查看
              </span>
            )}
          </div>
        )}

        {/* USER NOTE */}

        {item.userNote && (
          <div
            className={`mt-1.5 flex items-start gap-1 text-[10px] leading-4 ${
              item.completed
                ? "text-slate-200"
                : "text-slate-500"
            }`}
          >
            <span className="shrink-0">
              📝
            </span>

            <span>
              {item.userNote}
            </span>
          </div>
        )}
      </button>

      {/* DELETE */}

      <button
        type="button"
        onClick={(
          event
        ) => {
          event.preventDefault();
          event.stopPropagation();

          onDelete(
            item.id,
            item.title
          );
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-medium text-slate-400 active:bg-red-50 active:text-red-500"
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
  active:
    boolean;

  onClick:
    () => void;

  children:
    ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex-1 rounded-xl px-2 py-2.5 text-[11px] font-bold ${
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
  active:
    boolean;

  onClick:
    () => void;

  children:
    ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl border px-2 py-3 text-xs font-bold ${
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
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-[2px]">
      {/* 點擊背景關閉 */}
      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="absolute inset-0"
      />

      {/* 中央 Modal */}
      <div
        className="
          relative z-10
          max-h-[80dvh]
          w-full max-w-md
          overflow-y-auto
          rounded-[28px]
          bg-white
          p-5
          shadow-2xl
        "
      >
        {children}
      </div>
    </div>
  );
}