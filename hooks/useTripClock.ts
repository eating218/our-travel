"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getAppNow,
} from "../lib/tripTime";


export function useTripClock() {

  const [now, setNow] =
    useState<Date | null>(null);


  useEffect(() => {

    function updateTime() {

      setNow(
        getAppNow()
      );
    }


    // 第一次進頁面立即更新
    updateTime();


    // 每 30 秒更新一次
    const timer =
      setInterval(
        updateTime,
        30 * 1000
      );


    return () => {

      clearInterval(timer);

    };

  }, []);


  return now;
}