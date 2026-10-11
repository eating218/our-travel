"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BaggageType,
  ChecklistCategory,
  ChecklistData,
  ChecklistItem,
  initialChecklistData,
} from "../data/checklistData";

// ========================================
// STORAGE
// ========================================

export const CHECKLIST_STORAGE_KEY =
  "our-travel-packing-list";

// ========================================
// COPY INITIAL DATA
// ========================================

function createInitialData(): ChecklistData {
  return {
    categories:
      initialChecklistData.categories.map(
        (category) => ({
          ...category,
        })
      ),

    items:
      initialChecklistData.items.map(
        (item) => ({
          ...item,
        })
      ),
  };
}

// ========================================
// HOOK
// ========================================

export function useChecklist() {
  const [data, setData] =
    useState<ChecklistData>(
      createInitialData
    );

  const [loaded, setLoaded] =
    useState(false);

  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          CHECKLIST_STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(
            saved
          ) as ChecklistData;

        if (
          Array.isArray(
            parsed.categories
          ) &&
          Array.isArray(
            parsed.items
          )
        ) {
          // 舊資料沒有 userNote 也沒關係
          setData({
            categories:
              parsed.categories,

            items:
              parsed.items.map(
                (item) => ({
                  ...item,

                  userNote:
                    item.userNote ?? "",
                })
              ),
          });
        }
      }
    } catch (error) {
      console.error(
        "Failed to load packing list:",
        error
      );
    }

    setLoaded(true);
  }, []);

  // ========================================
  // SAVE
  // ========================================

  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      localStorage.setItem(
        CHECKLIST_STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        "Failed to save packing list:",
        error
      );
    }
  }, [
    data,
    loaded,
  ]);

  // ========================================
  // TOGGLE ITEM
  // ========================================

  function toggleItem(
    id: string
  ) {
    setData(
      (current) => ({
        ...current,

        items:
          current.items.map(
            (item) =>
              item.id === id
                ? {
                    ...item,

                    completed:
                      !item.completed,
                  }
                : item
          ),
      })
    );
  }

  // ========================================
  // ADD ITEM
  // ========================================

  function addItem(
    categoryId: string,
    title: string,
    baggage:
      BaggageType = "either",
    userNote:
      string = ""
  ) {
    const cleanTitle =
      title.trim();

    const cleanUserNote =
      userNote.trim();

    if (!cleanTitle) {
      return;
    }

    const item:
      ChecklistItem = {
      id:
        `item-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      categoryId,

      title:
        cleanTitle,

      baggage,

      completed:
        false,

      userNote:
        cleanUserNote,

      isCustom:
        true,
    };

    setData(
      (current) => ({
        ...current,

        items: [
          ...current.items,
          item,
        ],
      })
    );
  }

  // ========================================
  // UPDATE ITEM
  // ========================================

  function updateItem(
    id: string,
    updates: {
      title?: string;
      baggage?: BaggageType;
      userNote?: string;
    }
  ) {
    setData(
      (current) => ({
        ...current,

        items:
          current.items.map(
            (item) => {
              if (
                item.id !== id
              ) {
                return item;
              }

              const nextTitle =
                updates.title !==
                undefined
                  ? updates.title.trim()
                  : item.title;

              if (!nextTitle) {
                return item;
              }

              return {
                ...item,

                title:
                  nextTitle,

                baggage:
                  updates.baggage ??
                  item.baggage,

                userNote:
                  updates.userNote !==
                  undefined
                    ? updates.userNote.trim()
                    : item.userNote,
              };
            }
          ),
      })
    );
  }

  // ========================================
  // DELETE ITEM
  // ========================================

  function deleteItem(
    id: string
  ) {
    setData(
      (current) => ({
        ...current,

        items:
          current.items.filter(
            (item) =>
              item.id !== id
          ),
      })
    );
  }

  // ========================================
  // REORDER ITEM
  // 同一分類內重新排序
  // ========================================

  function reorderItems(
    categoryId: string,
    activeId: string,
    overId: string
  ) {
    if (
      activeId === overId
    ) {
      return;
    }

    setData(
      (current) => {
        const categoryItems =
          current.items.filter(
            (item) =>
              item.categoryId ===
              categoryId
          );

        const oldIndex =
          categoryItems.findIndex(
            (item) =>
              item.id === activeId
          );

        const newIndex =
          categoryItems.findIndex(
            (item) =>
              item.id === overId
          );

        if (
          oldIndex === -1 ||
          newIndex === -1
        ) {
          return current;
        }

        const reorderedItems = [
          ...categoryItems,
        ];

        const [movedItem] =
          reorderedItems.splice(
            oldIndex,
            1
          );

        reorderedItems.splice(
          newIndex,
          0,
          movedItem
        );

        let categoryIndex = 0;

        return {
          ...current,

          items:
            current.items.map(
              (item) => {
                if (
                  item.categoryId !==
                  categoryId
                ) {
                  return item;
                }

                const nextItem =
                  reorderedItems[
                    categoryIndex
                  ];

                categoryIndex += 1;

                return nextItem;
              }
            ),
        };
      }
    );
  }

  // ========================================
  // ADD CATEGORY
  // ========================================

  function addCategory(
    title: string
  ) {
    const cleanTitle =
      title.trim();

    if (!cleanTitle) {
      return;
    }

    const category:
      ChecklistCategory = {
      id:
        `category-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      title:
        cleanTitle,

      icon:
        "📦",

      isCustom:
        true,
    };

    setData(
      (current) => ({
        ...current,

        categories: [
          ...current.categories,
          category,
        ],
      })
    );
  }

  // ========================================
  // DELETE CATEGORY
  // ========================================

  function deleteCategory(
    categoryId: string
  ) {
    setData(
      (current) => ({
        categories:
          current.categories.filter(
            (category) =>
              category.id !==
              categoryId
          ),

        items:
          current.items.filter(
            (item) =>
              item.categoryId !==
              categoryId
          ),
      })
    );
  }

  // ========================================
  // IMPORT
  // ========================================

  function importChecklist(
    incoming:
      ChecklistData,
    mode:
      "merge" | "replace"
  ) {
    if (
      mode === "replace"
    ) {
      setData({
        categories:
          incoming.categories.map(
            (category) => ({
              ...category,
            })
          ),

        items:
          incoming.items.map(
            (item) => ({
              ...item,

              completed:
                false,

              userNote:
                item.userNote ?? "",
            })
          ),
      });

      return;
    }

    setData(
      (current) => {
        const categoryMap =
          new Map<
            string,
            string
          >();

        const newCategories =
          incoming.categories.map(
            (category) => {
              const newId =
                `import-category-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`;

              categoryMap.set(
                category.id,
                newId
              );

              return {
                ...category,

                id:
                  newId,

                isCustom:
                  true,
              };
            }
          );

        const newItems =
          incoming.items.map(
            (item) => ({
              ...item,

              id:
                `import-item-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,

              categoryId:
                categoryMap.get(
                  item.categoryId
                ) ??
                item.categoryId,

              completed:
                false,

              userNote:
                item.userNote ?? "",

              isCustom:
                true,
            })
          );

        return {
          categories: [
            ...current.categories,
            ...newCategories,
          ],

          items: [
            ...current.items,
            ...newItems,
          ],
        };
      }
    );
  }

  // ========================================
  // TOTALS
  // ========================================

  const total =
    data.items.length;

  const completed =
    useMemo(
      () =>
        data.items.filter(
          (item) =>
            item.completed
        ).length,
      [data.items]
    );

  const percent =
    total === 0
      ? 0
      : Math.round(
          (
            completed /
            total
          ) * 100
        );

  // ========================================
  // BAGGAGE COUNTS
  // ========================================

  const carryOnCount =
    useMemo(
      () =>
        data.items.filter(
          (item) =>
            item.baggage ===
              "carry-on" ||
            item.baggage ===
              "either"
        ).length,
      [data.items]
    );

  const checkedCount =
    useMemo(
      () =>
        data.items.filter(
          (item) =>
            item.baggage ===
              "checked" ||
            item.baggage ===
              "either"
        ).length,
      [data.items]
    );

  // ========================================
  // RETURN
  // ========================================

  return {
    loaded,

    categories:
      data.categories,

    items:
      data.items,

    total,
    completed,
    percent,

    carryOnCount,
    checkedCount,

    toggleItem,

    addItem,
    updateItem,
    deleteItem,

    reorderItems,

    addCategory,
    deleteCategory,

    importChecklist,
  };
}