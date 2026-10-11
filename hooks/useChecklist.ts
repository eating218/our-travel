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

function createInitialData():
  ChecklistData {

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

  const [
    data,
    setData,
  ] =
    useState<ChecklistData>(
      createInitialData
    );


  const [
    loaded,
    setLoaded,
  ] =
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

          setData(parsed);

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
        JSON.stringify(
          data
        )
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
      BaggageType = "either"
  ) {

    const cleanTitle =
      title.trim();


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

    // ======================================
    // REPLACE
    // ======================================

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
            })
          ),
      });


      return;

    }


    // ======================================
    // MERGE
    // ======================================

    setData(
      (current) => {

        // 為匯入資料建立新的 ID，
        // 避免和目前資料撞 ID。

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
    deleteItem,

    addCategory,
    deleteCategory,

    importChecklist,

  };

}