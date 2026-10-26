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
  // LOAD
  // ========================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (saved) {
        const parsed =
          JSON.parse(
            saved
          ) as Partial<TripSettings>;


        const defaults =
          createDefaultSettings();


        setSettings({
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
        });
      }
    } catch (error) {
      console.error(
        "讀取旅程設定失敗：",
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
        STORAGE_KEY,
        JSON.stringify(
          settings
        )
      );
    } catch (error) {
      console.error(
        "儲存旅程設定失敗：",
        error
      );
    }
  }, [
    loaded,
    settings,
  ]);


  // ========================================
  // UPDATE SETTINGS
  // ========================================

  function updateSettings(
    nextSettings: TripSettings
  ) {
    setSettings(
      nextSettings
    );
  }


  // ========================================
  // RESET
  // ========================================

  function resetSettings() {
    setSettings(
      createDefaultSettings()
    );
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