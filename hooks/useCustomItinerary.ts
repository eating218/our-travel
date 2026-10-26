"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  TripItem,
} from "../data/tripData";

// ========================================
// TYPES
// ========================================

export type CustomItemsByDay =
  Record<number, TripItem[]>;

export type BaseItemOverride = {
  day: number;
  item: TripItem;
};

export type BaseItemOverrides =
  Record<string, BaseItemOverride>;

type StoredItineraryData = {
  customItemsByDay:
    CustomItemsByDay;

  baseItemOverrides:
    BaseItemOverrides;

  hiddenBaseItemIds:
    string[];
};

// ========================================
// STORAGE
// ========================================

// 舊版：
// {
//   "2": [...],
//   "3": [...]
// }
//
// 新版：
// {
//   customItemsByDay: {...},
//   baseItemOverrides: {...},
//   hiddenBaseItemIds: [...]
// }
//
// LOAD 時會自動相容舊資料。

const STORAGE_KEY =
  "our-travel-custom-itinerary";

// ========================================
// HOOK
// ========================================

export function useCustomItinerary() {
  const [
    customItemsByDay,
    setCustomItemsByDay,
  ] =
    useState<CustomItemsByDay>(
      {}
    );

  const [
    baseItemOverrides,
    setBaseItemOverrides,
  ] =
    useState<BaseItemOverrides>(
      {}
    );

  const [
    hiddenBaseItemIds,
    setHiddenBaseItemIds,
  ] = useState<string[]>([]);

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) {
        setIsLoaded(true);
        return;
      }

      const parsed =
        JSON.parse(stored);

      if (
        !parsed ||
        typeof parsed !==
          "object"
      ) {
        setIsLoaded(true);
        return;
      }

      // ====================================
      // NEW FORMAT
      // ====================================

      if (
        "customItemsByDay" in
        parsed
      ) {
        const data =
          parsed as Partial<StoredItineraryData>;

        setCustomItemsByDay(
          data.customItemsByDay ??
            {}
        );

        setBaseItemOverrides(
          data.baseItemOverrides ??
            {}
        );

        setHiddenBaseItemIds(
          Array.isArray(
            data.hiddenBaseItemIds
          )
            ? data.hiddenBaseItemIds
            : []
        );

        setIsLoaded(true);
        return;
      }

      // ====================================
      // OLD FORMAT MIGRATION
      //
      // 舊版 localStorage 本身就是：
      // Record<number, TripItem[]>
      //
      // 所以直接當成 customItemsByDay，
      // 不會吃掉之前新增的行程。
      // ====================================

      setCustomItemsByDay(
        parsed as CustomItemsByDay
      );

      setBaseItemOverrides(
        {}
      );

      setHiddenBaseItemIds(
        []
      );
    } catch (error) {
      console.error(
        "Failed to load custom itinerary:",
        error
      );
    }

    setIsLoaded(true);
  }, []);

  // ========================================
  // SAVE
  // ========================================

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      const data: StoredItineraryData =
        {
          customItemsByDay,
          baseItemOverrides,
          hiddenBaseItemIds,
        };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        "Failed to save custom itinerary:",
        error
      );
    }
  }, [
    customItemsByDay,
    baseItemOverrides,
    hiddenBaseItemIds,
    isLoaded,
  ]);

  // ========================================
  // ADD CUSTOM ITEM
  // ========================================

  function addCustomItem(
    day: number,
    item: TripItem
  ) {
    setCustomItemsByDay(
      (current) => ({
        ...current,

        [day]: [
          ...(current[day] ??
            []),
          item,
        ],
      })
    );
  }

  // ========================================
  // UPDATE CUSTOM ITEM
  //
  // 可以：
  // Day 1 → Day 3
  // 14:00 → 17:00
  // 名稱 / 地址 / guide 全部一起改
  // ========================================

  function updateCustomItem(
    originalDay: number,
    newDay: number,
    updatedItem: TripItem
  ) {
    setCustomItemsByDay(
      (current) => {
        const next: CustomItemsByDay =
          {
            ...current,
          };

        // 先從原 Day 移除
        next[originalDay] = (
          next[originalDay] ??
          []
        ).filter(
          (item) =>
            item.id !==
            updatedItem.id
        );

        // 再加入新 Day
        next[newDay] = [
          ...(next[newDay] ??
            []),
          updatedItem,
        ];

        return next;
      }
    );
  }

  // ========================================
  // DELETE CUSTOM ITEM
  // ========================================

  function deleteCustomItem(
    day: number,
    itemId: string
  ) {
    setCustomItemsByDay(
      (current) => ({
        ...current,

        [day]: (
          current[day] ?? []
        ).filter(
          (item) =>
            item.id !==
            itemId
        ),
      })
    );
  }

  // ========================================
  // UPDATE BASE ITEM
  //
  // 不修改 tripData.ts。
  //
  // 例如：
  // 清水寺原本 Day 2 / 09:00
  // 使用者改成 Day 3 / 17:00
  //
  // 就記：
  //
  // kiyomizudera: {
  //   day: 3,
  //   item: {...17:00...}
  // }
  // ========================================

  function updateBaseItem(
    itemId: string,
    newDay: number,
    updatedItem: TripItem
  ) {
    setBaseItemOverrides(
      (current) => ({
        ...current,

        [itemId]: {
          day: newDay,
          item: updatedItem,
        },
      })
    );

    // 如果之前刪除過，
    // 現在又修改它，
    // 就自動恢復顯示。
    setHiddenBaseItemIds(
      (current) =>
        current.filter(
          (id) =>
            id !== itemId
        )
    );
  }

  // ========================================
  // HIDE BASE ITEM
  //
  // 原始 tripData 不能真的刪，
  // 所以用 hidden list。
  // ========================================

  function hideBaseItem(
    itemId: string
  ) {
    setHiddenBaseItemIds(
      (current) => {
        if (
          current.includes(
            itemId
          )
        ) {
          return current;
        }

        return [
          ...current,
          itemId,
        ];
      }
    );
  }

  // ========================================
  // RESTORE BASE ITEM
  //
  // 先準備好。
  // 未來可以做：
  // 「恢復原始行程」
  // ========================================

  function restoreBaseItem(
    itemId: string
  ) {
    setHiddenBaseItemIds(
      (current) =>
        current.filter(
          (id) =>
            id !== itemId
        )
    );

    setBaseItemOverrides(
      (current) => {
        const next = {
          ...current,
        };

        delete next[itemId];

        return next;
      }
    );
  }

  // ========================================
  // RESET BASE ITEM EDIT
  //
  // 保留行程，
  // 但取消使用者修改，
  // 回到 tripData.ts 原始版本。
  // ========================================

  function resetBaseItemOverride(
    itemId: string
  ) {
    setBaseItemOverrides(
      (current) => {
        const next = {
          ...current,
        };

        delete next[itemId];

        return next;
      }
    );
  }

  // ========================================
  // HELPERS
  // ========================================

  function isBaseItemHidden(
    itemId: string
  ) {
    return hiddenBaseItemIds.includes(
      itemId
    );
  }

  function getBaseItemOverride(
    itemId: string
  ) {
    return (
      baseItemOverrides[
        itemId
      ] ?? null
    );
  }

  // ========================================
  // RETURN
  // ========================================

  return {
    // DATA
    customItemsByDay,
    baseItemOverrides,
    hiddenBaseItemIds,
    isLoaded,

    // CUSTOM
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,

    // BASE
    updateBaseItem,
    hideBaseItem,
    restoreBaseItem,
    resetBaseItemOverride,

    // HELPERS
    isBaseItemHidden,
    getBaseItemOverride,
  };
}