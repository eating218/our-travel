"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  FlightInfo,
  tripData,
} from "../data/tripData";


// ========================================
// STORAGE
// ========================================

const STORAGE_KEY =
  "our-travel-trip-settings";

const SYNC_EVENT =
  "our-travel-trip-settings-updated";


// ========================================
// TYPES
// ========================================

export type TripSettings = {
  name: string;

  country: string;

  startDate: string;

  endDate: string;

  flights: FlightInfo[];
};


// ========================================
// DEFAULT
// ========================================

function createDefaultSettings():
  TripSettings {
  return {
    name: tripData.name,

    country: tripData.country,

    startDate:
      tripData.startDate,

    endDate:
      tripData.endDate,

    flights:
      tripData.flights.map(
        (flight) => ({
          ...flight,

          from: {
            ...flight.from,
          },

          to: {
            ...flight.to,
          },
        })
      ),
  };
}


// ========================================
// READ STORAGE
// ========================================

function readStoredSettings():
  TripSettings {
  const defaults =
    createDefaultSettings();


  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      return defaults;
    }


    const parsed =
      JSON.parse(
        saved
      ) as Partial<TripSettings>;


    return {
      name:
        parsed.name ??
        defaults.name,

      country:
        parsed.country ??
        defaults.country,

      startDate:
        parsed.startDate ??
        defaults.startDate,

      endDate:
        parsed.endDate ??
        defaults.endDate,

      flights:
        Array.isArray(
          parsed.flights
        )
          ? parsed.flights
          : defaults.flights,
    };
  } catch (error) {
    console.error(
      "讀取旅程設定失敗：",
      error
    );


    return defaults;
  }
}


// ========================================
// HOOK
// ========================================

export function useTripSettings() {
  const [
    settings,
    setSettings,
  ] = useState<TripSettings>(
    createDefaultSettings
  );


  const [
    loaded,
    setLoaded,
  ] = useState(false);


  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    setSettings(
      readStoredSettings()
    );


    setLoaded(true);
  }, []);


  // ========================================
  // SAME PAGE SYNC
  // ========================================

  useEffect(() => {
    function handleSync(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<TripSettings>;


      if (
        customEvent.detail
      ) {
        setSettings(
          customEvent.detail
        );


        return;
      }


      setSettings(
        readStoredSettings()
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


      setSettings(
        readStoredSettings()
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
  // UPDATE SETTINGS
  // ========================================

  function updateSettings(
    nextSettings: TripSettings
  ) {
    setSettings(
      nextSettings
    );


    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          nextSettings
        )
      );


      window.dispatchEvent(
        new CustomEvent<TripSettings>(
          SYNC_EVENT,
          {
            detail:
              nextSettings,
          }
        )
      );
    } catch (error) {
      console.error(
        "儲存旅程設定失敗：",
        error
      );
    }
  }


  // ========================================
  // RESET
  // ========================================

  function resetSettings() {
    const defaults =
      createDefaultSettings();


    setSettings(
      defaults
    );


    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          defaults
        )
      );


      window.dispatchEvent(
        new CustomEvent<TripSettings>(
          SYNC_EVENT,
          {
            detail:
              defaults,
          }
        )
      );
    } catch (error) {
      console.error(
        "重設旅程設定失敗：",
        error
      );
    }
  }


  // ========================================
  // RETURN
  // ========================================

  return {
    loaded,

    settings,

    updateSettings,

    resetSettings,
  };
}