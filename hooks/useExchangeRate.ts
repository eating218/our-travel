"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ExchangeRateSnapshot,
} from "../lib/currencyEngine";


const STORAGE_KEY =
  "our-travel-exchange-rate";

const SYNC_EVENT =
  "our-travel-exchange-rate-updated";


type StoredExchangeRate = {
  liveRate: ExchangeRateSnapshot | null;

  manualRate: ExchangeRateSnapshot | null;

  useManualRate: boolean;
};


const EMPTY_DATA: StoredExchangeRate = {
  liveRate: null,
  manualRate: null,
  useManualRate: false,
};


// ========================================
// STORAGE
// ========================================

function readStoredData(): StoredExchangeRate {
  if (
    typeof window === "undefined"
  ) {
    return EMPTY_DATA;
  }


  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {
      return EMPTY_DATA;
    }


    const parsed =
      JSON.parse(raw);


    return {
      liveRate:
        parsed.liveRate ?? null,

      manualRate:
        parsed.manualRate ?? null,

      useManualRate:
        Boolean(
          parsed.useManualRate
        ),
    };
  } catch {
    return EMPTY_DATA;
  }
}


function writeStoredData(
  data: StoredExchangeRate
) {
  if (
    typeof window === "undefined"
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
// API RESPONSE
// ========================================

type ExchangeRateApiResponse = {
  success?: boolean;

  rate?: number;

  capturedAt?: string;

  error?: string;
};


// ========================================
// HOOK
// ========================================

export function useExchangeRate() {
  const [
    loaded,
    setLoaded,
  ] = useState(false);


  const [
    data,
    setData,
  ] =
    useState<StoredExchangeRate>(
      EMPTY_DATA
    );


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    setData(
      readStoredData()
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
          StoredExchangeRate
        >;


      if (
        customEvent.detail
      ) {
        setData(
          customEvent.detail
        );
      } else {
        setData(
          readStoredData()
        );
      }
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


      setData(
        readStoredData()
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
  // UPDATE
  // ========================================

  const updateData =
    useCallback(
      (
        updater:
          | StoredExchangeRate
          | ((
              current: StoredExchangeRate
            ) => StoredExchangeRate)
      ) => {
        setData(
          (current) => {
            const next =
              typeof updater ===
              "function"
                ? updater(
                    current
                  )
                : updater;


            writeStoredData(
              next
            );


            return next;
          }
        );
      },
      []
    );


  // ========================================
  // REFRESH LIVE RATE
  // ========================================

  const refreshRate =
    useCallback(
      async () => {
        if (refreshing) {
          return false;
        }


        setRefreshing(true);
        setError(null);


        try {
          const response =
            await fetch(
              "/api/exchange-rate",
              {
                method: "GET",

                cache:
                  "no-store",
              }
            );


          const result =
            (await response.json()) as
              ExchangeRateApiResponse;


          if (
            !response.ok ||
            !result.success ||
            !result.rate ||
            result.rate <= 0
          ) {
            throw new Error(
              result.error ||
                "無法取得即時匯率"
            );
          }


          const snapshot:
            ExchangeRateSnapshot =
            {
              from: "JPY",
              to: "TWD",

              rate:
                result.rate,

              source:
                "live",

              capturedAt:
                result.capturedAt ??
                new Date().toISOString(),
            };


          updateData(
            (current) => ({
              ...current,

              liveRate:
                snapshot,
            })
          );


          return true;
        } catch (
          caughtError
        ) {
          console.error(
            caughtError
          );


          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "無法取得即時匯率"
          );


          /*
           * 很重要：
           *
           * API 失敗時不清除舊 liveRate。
           *
           * 也就是：
           * 有最近一次成功匯率
           * ↓
           * 網路暫時掛掉
           * ↓
           * 繼續使用最近一次資料
           */

          return false;
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [
        refreshing,
        updateData,
      ]
    );


  // ========================================
  // MANUAL RATE
  // ========================================

  const setManualRate =
    useCallback(
      (
        rate: number
      ) => {
        if (
          !Number.isFinite(
            rate
          ) ||
          rate <= 0
        ) {
          return false;
        }


        const snapshot:
          ExchangeRateSnapshot =
          {
            from: "JPY",
            to: "TWD",

            rate,

            source:
              "manual",

            capturedAt:
              new Date().toISOString(),
          };


        updateData(
          (current) => ({
            ...current,

            manualRate:
              snapshot,

            useManualRate:
              true,
          })
        );


        setError(null);


        return true;
      },
      [updateData]
    );


  // ========================================
  // USE LIVE
  // ========================================

  const useLiveRate =
    useCallback(() => {
      updateData(
        (current) => ({
          ...current,

          useManualRate:
            false,
        })
      );
    }, [updateData]);


  // ========================================
  // ACTIVE RATE
  // ========================================

  const activeRate =
    useMemo(() => {
      if (
        data.useManualRate &&
        data.manualRate
      ) {
        return data.manualRate;
      }


      return data.liveRate;
    }, [data]);


  // ========================================
  // AGE
  // ========================================

  const rateAgeMs =
    useMemo(() => {
      if (!activeRate) {
        return null;
      }


      const captured =
        new Date(
          activeRate.capturedAt
        ).getTime();


      if (
        !Number.isFinite(
          captured
        )
      ) {
        return null;
      }


      return (
        Date.now() -
        captured
      );
    }, [activeRate]);


  const isStale =
    useMemo(() => {
      if (
        rateAgeMs === null
      ) {
        return true;
      }


      /*
       * 12 小時以上
       * 視為需要更新。
       */
      return (
        rateAgeMs >
        12 *
          60 *
          60 *
          1000
      );
    }, [rateAgeMs]);


  return {
    loaded,

    refreshing,

    error,

    liveRate:
      data.liveRate,

    manualRate:
      data.manualRate,

    useManualRate:
      data.useManualRate,

    activeRate,

    isStale,

    refreshRate,

    setManualRate,

    useLiveRate,
  };
}