"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type WeatherLocationSource = "fallback" | "device";

export type HourlyWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  weatherCode: number;
};

export type DailyWeather = {
  date: string;
  weatherCode: number;
  maxTemperature: number;
  minTemperature: number;
  precipitationProbability: number;
};

export type WeatherData = {
  locationName: string;
  locationSource: WeatherLocationSource;
  timezone: string;
  current: {
    time: string;
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
  };
  hourly: HourlyWeather[];
  daily: DailyWeather[];
};

type WeatherApiResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

const KYOTO = {
  latitude: 35.01,
  longitude: 135.77,
  name: "京都",
};

function roundCoordinate(value: number) {
  // 不把手機提供的完整 GPS 精度送到天氣服務。
  return Number(value.toFixed(2));
}

async function fetchWeather(
  latitude: number,
  longitude: number,
  locationName: string,
  locationSource: WeatherLocationSource
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(roundCoordinate(latitude)),
    longitude: String(roundCoordinate(longitude)),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "weather_code",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("無法取得天氣資料");
  }

  const result = (await response.json()) as WeatherApiResponse;

  return {
    locationName,
    locationSource,
    timezone: result.timezone,
    current: {
      time: result.current.time,
      temperature: result.current.temperature_2m,
      apparentTemperature: result.current.apparent_temperature,
      weatherCode: result.current.weather_code,
    },
    hourly: result.hourly.time.map((time, index) => ({
      time,
      temperature: result.hourly.temperature_2m[index],
      apparentTemperature:
        result.hourly.apparent_temperature[index],
      precipitationProbability:
        result.hourly.precipitation_probability[index] ?? 0,
      weatherCode: result.hourly.weather_code[index],
    })),
    daily: result.daily.time.map((date, index) => ({
      date,
      weatherCode: result.daily.weather_code[index],
      maxTemperature: result.daily.temperature_2m_max[index],
      minTemperature: result.daily.temperature_2m_min[index],
      precipitationProbability:
        result.daily.precipitation_probability_max[index] ?? 0,
    })),
  };
}

export function getWeatherMeta(code: number) {
  if (code === 0) {
    return {
      icon: "☀️",
      label: "晴朗",
    };
  }

  if (code === 1 || code === 2) {
    return {
      icon: "🌤️",
      label: "晴時多雲",
    };
  }

  if (code === 3) {
    return {
      icon: "☁️",
      label: "陰天",
    };
  }

  if (code === 45 || code === 48) {
    return {
      icon: "🌫️",
      label: "有霧",
    };
  }

  if (code >= 51 && code <= 57) {
    return {
      icon: "🌦️",
      label: "毛毛雨",
    };
  }

  if (code >= 61 && code <= 67) {
    return {
      icon: "🌧️",
      label: "下雨",
    };
  }

  if (code >= 71 && code <= 77) {
    return {
      icon: "🌨️",
      label: "降雪",
    };
  }

  if (code >= 80 && code <= 82) {
    return {
      icon: "🌦️",
      label: "陣雨",
    };
  }

  if (code >= 85 && code <= 86) {
    return {
      icon: "🌨️",
      label: "陣雪",
    };
  }

  if (code >= 95) {
    return {
      icon: "⛈️",
      label: "雷雨",
    };
  }

  return {
    icon: "🌤️",
    label: "天氣變化",
  };
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFallbackWeather = useCallback(async () => {
    try {
      setError(null);

      const data = await fetchWeather(
        KYOTO.latitude,
        KYOTO.longitude,
        KYOTO.name,
        "fallback"
      );

      setWeather(data);
    } catch {
      setError("暫時無法取得天氣");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFallbackWeather();
  }, [loadFallbackWeather]);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("這個瀏覽器不支援定位");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = roundCoordinate(
            position.coords.latitude
          );
          const longitude = roundCoordinate(
            position.coords.longitude
          );

          const data = await fetchWeather(
            latitude,
            longitude,
            "目前位置附近",
            "device"
          );

          setWeather(data);
        } catch {
          setError("取得目前位置天氣失敗");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("未取得定位權限，繼續顯示京都天氣");
        setLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000,
      }
    );
  }, []);

  const today = weather?.daily[0] ?? null;

  const todayHourly = useMemo(() => {
    if (!weather) {
      return [];
    }

    const todayDate =
      weather.current.time.split("T")[0];

    return weather.hourly.filter((hour) =>
      hour.time.startsWith(todayDate)
    );
  }, [weather]);

  return {
    weather,
    today,
    todayHourly,
    loaded,
    locating,
    error,
    requestCurrentLocation,
    reloadFallback: loadFallbackWeather,
  };
}