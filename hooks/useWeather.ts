"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export type WeatherLocationSource =
  | "fallback"
  | "device";

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
    latitude: String(
      roundCoordinate(latitude)
    ),

    longitude: String(
      roundCoordinate(longitude)
    ),

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
    throw new Error(
      "無法取得天氣資料"
    );
  }

  const result =
    (await response.json()) as WeatherApiResponse;

  return {
    locationName,
    locationSource,
    timezone: result.timezone,

    current: {
      time: result.current.time,

      temperature:
        result.current.temperature_2m,

      apparentTemperature:
        result.current
          .apparent_temperature,

      weatherCode:
        result.current.weather_code,
    },

    hourly: result.hourly.time.map(
      (time, index) => ({
        time,

        temperature:
          result.hourly
            .temperature_2m[index],

        apparentTemperature:
          result.hourly
            .apparent_temperature[index],

        precipitationProbability:
          result.hourly
            .precipitation_probability[
            index
          ] ?? 0,

        weatherCode:
          result.hourly
            .weather_code[index],
      })
    ),

    daily: result.daily.time.map(
      (date, index) => ({
        date,

        weatherCode:
          result.daily
            .weather_code[index],

        maxTemperature:
          result.daily
            .temperature_2m_max[index],

        minTemperature:
          result.daily
            .temperature_2m_min[index],

        precipitationProbability:
          result.daily
            .precipitation_probability_max[
            index
          ] ?? 0,
      })
    ),
  };
}

export function getWeatherMeta(
  code: number
) {
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

  if (
    code === 45 ||
    code === 48
  ) {
    return {
      icon: "🌫️",
      label: "有霧",
    };
  }

  if (
    code >= 51 &&
    code <= 57
  ) {
    return {
      icon: "🌦️",
      label: "毛毛雨",
    };
  }

  if (
    code >= 61 &&
    code <= 67
  ) {
    return {
      icon: "🌧️",
      label: "下雨",
    };
  }

  if (
    code >= 71 &&
    code <= 77
  ) {
    return {
      icon: "🌨️",
      label: "降雪",
    };
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return {
      icon: "🌦️",
      label: "陣雨",
    };
  }

  if (
    code >= 85 &&
    code <= 86
  ) {
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

function getLocationErrorMessage(
  error: GeolocationPositionError
) {
  console.error(
    "Geolocation failed:",
    {
      code: error.code,
      message: error.message,
    }
  );

  switch (error.code) {
    case 1:
      return (
        "定位失敗 [1]：Safari 拒絕了定位請求"
      );

    case 2:
      return (
        "定位失敗 [2]：目前無法取得裝置位置"
      );

    case 3:
      return (
        "定位失敗 [3]：取得位置逾時，請再試一次"
      );

    default:
      return `定位失敗 [${error.code}]：${error.message || "未知錯誤"}`;
  }
}

export function useWeather() {
  const [weather, setWeather] =
    useState<WeatherData | null>(
      null
    );

  const [loaded, setLoaded] =
    useState(false);

  const [locating, setLocating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadFallbackWeather =
    useCallback(async () => {
      try {
        setError(null);

        const data =
          await fetchWeather(
            KYOTO.latitude,
            KYOTO.longitude,
            KYOTO.name,
            "fallback"
          );

        setWeather(data);
      } catch {
        setError(
          "暫時無法取得天氣"
        );
      } finally {
        setLoaded(true);
      }
    }, []);

  useEffect(() => {
    loadFallbackWeather();
  }, [loadFallbackWeather]);

  const requestCurrentLocation =
    useCallback(() => {
      setError(null);

      // 確認目前網頁環境
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      if (!window.isSecureContext) {
        setError(
          "定位失敗：目前網頁不是安全的 HTTPS 連線"
        );

        return;
      }

      if (
        !navigator.geolocation
      ) {
        setError(
          "定位失敗：這個瀏覽器不支援定位"
        );

        return;
      }

      setLocating(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log(
            "Geolocation success"
          );

          try {
            const latitude =
              roundCoordinate(
                position.coords.latitude
              );

            const longitude =
              roundCoordinate(
                position.coords.longitude
              );

            const data =
              await fetchWeather(
                latitude,
                longitude,
                "目前位置附近",
                "device"
              );

            setWeather(data);
            setError(null);
          } catch (weatherError) {
            console.error(
              "Weather fetch failed:",
              weatherError
            );

            setError(
              "已取得位置，但目前位置的天氣資料讀取失敗"
            );
          } finally {
            setLocating(false);
          }
        },

        (
          geolocationError
        ) => {
          setError(
            getLocationErrorMessage(
              geolocationError
            )
          );

          setLocating(false);
        },

        {
          // 不要求 GPS 高精度。
          enableHighAccuracy: false,

          // 先給 Safari 多一點時間。
          timeout: 20000,

          // 可接受最近 10 分鐘的位置。
          maximumAge:
            10 * 60 * 1000,
        }
      );
    }, []);

  const today =
    weather?.daily[0] ?? null;

  const todayHourly =
    useMemo(() => {
      if (!weather) {
        return [];
      }

      const todayDate =
        weather.current.time.split(
          "T"
        )[0];

      return weather.hourly.filter(
        (hour) =>
          hour.time.startsWith(
            todayDate
          )
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

    reloadFallback:
      loadFallbackWeather,
  };
}