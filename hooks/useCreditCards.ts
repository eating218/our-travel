"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  initialTravelCreditCards,
  MyTravelCard,
} from "../data/cardData";


// ========================================
// STORAGE
// ========================================

const STORAGE_KEY =
  "our-travel-credit-cards";

const SYNC_EVENT =
  "our-travel-credit-cards-updated";


type StoredCreditCardData = {
  version: 2;
  cards: MyTravelCard[];
};


// ========================================
// DEFAULT
// ========================================

function createDefaultData():
  StoredCreditCardData {
  return {
    version: 2,

    cards:
      initialTravelCreditCards,
  };
}


// ========================================
// MIGRATION
// ========================================

function migrateData(
  raw: unknown
): StoredCreditCardData {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return createDefaultData();
  }


  const parsed =
    raw as {
      version?: number;
      cards?: unknown[];
    };


  if (
    !Array.isArray(
      parsed.cards
    )
  ) {
    return createDefaultData();
  }


  /**
   * Version 2 是目前正式格式。
   */
  if (
    parsed.version === 2
  ) {
    return {
      version: 2,

      cards:
        parsed.cards as
          MyTravelCard[],
    };
  }


  /**
   * V1 還沒有正式投入 Expense，
   * 因此不嘗試把舊的優惠資料硬轉換。
   *
   * 避免留下錯誤 catalog 關聯。
   */
  return createDefaultData();
}


// ========================================
// READ
// ========================================

function readStoredData():
  StoredCreditCardData {
  if (
    typeof window ===
    "undefined"
  ) {
    return createDefaultData();
  }


  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {
      return createDefaultData();
    }


    return migrateData(
      JSON.parse(raw)
    );
  } catch {
    return createDefaultData();
  }
}


// ========================================
// WRITE
// ========================================

function writeStoredData(
  data: StoredCreditCardData
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }


  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );


  window.dispatchEvent(
    new CustomEvent(
      SYNC_EVENT,
      {
        detail: data,
      }
    )
  );
}


// ========================================
// HOOK
// ========================================

export function useCreditCards(
  ownerMemberId?: string
) {
  const [
    loaded,
    setLoaded,
  ] = useState(false);


  const [
    allCards,
    setAllCards,
  ] = useState<
    MyTravelCard[]
  >([]);


  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    const data =
      readStoredData();

    setAllCards(
      data.cards
    );

    setLoaded(true);
  }, []);


  // ========================================
  // SAME TAB SYNC
  // ========================================

  useEffect(() => {
    function handleSync(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<
          StoredCreditCardData
        >;


      if (
        !customEvent.detail ||
        !Array.isArray(
          customEvent.detail.cards
        )
      ) {
        return;
      }


      setAllCards(
        customEvent.detail.cards
      );
    }


    window.addEventListener(
      SYNC_EVENT,
      handleSync
    );


    return () => {
      window.removeEventListener(
        SYNC_EVENT,
        handleSync
      );
    };
  }, []);


  // ========================================
  // OTHER TAB SYNC
  // ========================================

  useEffect(() => {
    function handleStorage(
      event: StorageEvent
    ) {
      if (
        event.key !==
        STORAGE_KEY
      ) {
        return;
      }


      const data =
        readStoredData();


      setAllCards(
        data.cards
      );
    }


    window.addEventListener(
      "storage",
      handleStorage
    );


    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);


  // ========================================
  // SAVE
  // ========================================

  const saveCards =
    useCallback(
      (
        nextCards:
          MyTravelCard[]
      ) => {
        setAllCards(
          nextCards
        );


        writeStoredData({
          version: 2,

          cards:
            nextCards,
        });
      },
      []
    );


  // ========================================
  // MY CARDS
  // ========================================

  const cards =
    useMemo(() => {
      if (
        !ownerMemberId
      ) {
        return [];
      }


      return allCards.filter(
        (card) =>
          card.ownerMemberId ===
          ownerMemberId
      );
    }, [
      allCards,
      ownerMemberId,
    ]);


  const activeCards =
    useMemo(
      () =>
        cards.filter(
          (card) =>
            card.isActive
        ),
      [cards]
    );


  // ========================================
  // ADD CATALOG CARD
  // ========================================

  const addCatalogCard =
    useCallback(
      (
        catalogCardId:
          string
      ) => {
        if (
          !ownerMemberId
        ) {
          return false;
        }


        const alreadyExists =
          allCards.some(
            (card) =>
              card.ownerMemberId ===
                ownerMemberId &&
              card.catalogCardId ===
                catalogCardId
          );


        if (
          alreadyExists
        ) {
          return false;
        }


        const newCard:
          MyTravelCard = {
          id:
            createCardId(),

          ownerMemberId,

          catalogCardId,

          preTripSpentTWD:
            0,

          isActive:
            true,

          createdAt:
            new Date()
              .toISOString(),
        };


        saveCards([
          ...allCards,
          newCard,
        ]);


        return true;
      },
      [
        allCards,
        ownerMemberId,
        saveCards,
      ]
    );


  // ========================================
  // ADD CUSTOM CARD
  // ========================================

  const addCustomCard =
    useCallback(
      (
        issuer: string,
        name: string
      ) => {
        if (
          !ownerMemberId
        ) {
          return false;
        }


        const cleanName =
          name.trim();


        if (
          !cleanName
        ) {
          return false;
        }


        const newCard:
          MyTravelCard = {
          id:
            createCardId(),

          ownerMemberId,

          customIssuer:
            issuer.trim() ||
            undefined,

          customName:
            cleanName,

          preTripSpentTWD:
            0,

          isActive:
            true,

          createdAt:
            new Date()
              .toISOString(),
        };


        saveCards([
          ...allCards,
          newCard,
        ]);


        return true;
      },
      [
        allCards,
        ownerMemberId,
        saveCards,
      ]
    );


  // ========================================
  // UPDATE PRE-TRIP SPEND
  // ========================================

  const updatePreTripSpent =
    useCallback(
      (
        cardId: string,
        amount: number
      ) => {
        if (
          !Number.isFinite(
            amount
          ) ||
          amount < 0
        ) {
          return;
        }


        const nextCards =
          allCards.map(
            (card) =>
              card.id ===
              cardId
                ? {
                    ...card,

                    preTripSpentTWD:
                      Math.round(
                        amount
                      ),
                  }
                : card
          );


        saveCards(
          nextCards
        );
      },
      [
        allCards,
        saveCards,
      ]
    );


  // ========================================
  // TOGGLE ACTIVE
  // ========================================

  const toggleCardActive =
    useCallback(
      (
        cardId: string
      ) => {
        const target =
          cards.find(
            (card) =>
              card.id ===
              cardId
          );


        if (!target) {
          return;
        }


        const nextCards =
          allCards.map(
            (card) =>
              card.id ===
              cardId
                ? {
                    ...card,

                    isActive:
                      !card.isActive,
                  }
                : card
          );


        saveCards(
          nextCards
        );
      },
      [
        allCards,
        cards,
        saveCards,
      ]
    );


  // ========================================
  // DELETE
  // ========================================

  const deleteCard =
    useCallback(
      (
        cardId: string
      ) => {
        const target =
          cards.find(
            (card) =>
              card.id ===
              cardId
          );


        if (!target) {
          return false;
        }


        saveCards(
          allCards.filter(
            (card) =>
              card.id !==
              cardId
          )
        );


        return true;
      },
      [
        allCards,
        cards,
        saveCards,
      ]
    );


  return {
    loaded,

    cards,
    activeCards,

    addCatalogCard,
    addCustomCard,

    updatePreTripSpent,

    toggleCardActive,

    deleteCard,
  };
}


// ========================================
// ID
// ========================================

function createCardId() {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }


  return `card-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}