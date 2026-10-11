"use client";

import {
  useEffect,
  useState,
} from "react";

export type ExpenseCurrency =
  | "JPY"
  | "TWD";

type Props = {
  open: boolean;

  currency: ExpenseCurrency;

  initialAmount: number;

  onClose: () => void;

  onConfirm: (
    amount: number
  ) => void;
};

export default function ExpenseCalculator({
  open,
  currency,
  initialAmount,
  onClose,
  onConfirm,
}: Props) {

  const [
    expression,
    setExpression,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState(0);


  // ========================================
  // SYMBOL
  // ========================================

  const symbol =
    currency === "JPY"
      ? "¥"
      : "NT$";


  // ========================================
  // OPEN
  // ========================================

  useEffect(() => {

    if (!open) return;

    if (initialAmount > 0) {

      setExpression(
        String(initialAmount)
      );

      setResult(
        initialAmount
      );

    } else {

      setExpression("");

      setResult(0);

    }

  }, [
    open,
    initialAmount,
  ]);


  // ========================================
  // CALCULATE
  // ========================================

  useEffect(() => {

    if (!expression) {

      setResult(0);

      return;

    }


    try {

      const safe =
        expression.replace(
          /[^0-9+\-*/.()]/g,
          ""
        );


      if (safe !== expression) {
        return;
      }


      const calculated =
        Function(
          `"use strict"; return (${safe})`
        )();


      if (
        typeof calculated !==
          "number" ||
        !Number.isFinite(
          calculated
        )
      ) {
        return;
      }


      setResult(
        Math.max(
          0,
          calculated
        )
      );

    } catch {

      // 輸入到一半，例如 1200+
      // 不需要顯示錯誤

    }

  }, [
    expression,
  ]);


  // ========================================
  // KEY
  // ========================================

  function pressKey(
    key: string
  ) {

    if (key === "AC") {

      setExpression("");

      setResult(0);

      return;

    }


    if (key === "⌫") {

      setExpression(
        (current) =>
          current.slice(
            0,
            -1
          )
      );

      return;

    }


    setExpression(
      (current) =>
        current + key
    );

  }


  // ========================================
  // CONFIRM
  // ========================================

  function handleConfirm() {

    if (result <= 0) {
      return;
    }


    onConfirm(result);

    onClose();

  }


  // ========================================
  // DISPLAY
  // ========================================

  const displayExpression =
    expression
      .replaceAll(
        "*",
        "×"
      )
      .replaceAll(
        "/",
        "÷"
      )
      .replaceAll(
        "-",
        "−"
      );


  // ========================================
  // KEYS
  // ========================================

  const keys = [
    "7",
    "8",
    "9",
    "/",

    "4",
    "5",
    "6",
    "*",

    "1",
    "2",
    "3",
    "-",

    "AC",
    "0",
    "⌫",
    "+",
  ];


  if (!open) {
    return null;
  }


  // ========================================
  // UI
  // ========================================

  return (

    <div className="absolute inset-0 z-30 flex items-end justify-center">


      {/* BACKDROP */}

      <button
        type="button"
        aria-label="關閉計算機"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
      />


      {/* CALCULATOR */}

      <section className="relative z-10 w-full max-w-md rounded-t-[32px] bg-slate-900 px-5 pb-6 pt-3 text-white shadow-2xl">


        {/* HANDLE */}

        <div className="flex justify-center">

          <div className="h-1 w-10 rounded-full bg-white/20" />

        </div>


        {/* HEADER */}

        <div className="mt-4 flex items-center justify-between">

          <div>

            <p className="text-[10px] font-bold tracking-[0.18em] text-blue-300">
              CALCULATOR
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              金額計算
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-slate-300"
          >
            ×
          </button>

        </div>


        {/* DISPLAY */}

        <div className="mt-5 min-h-[88px] text-right">


          <p className="min-h-6 break-all text-base font-medium text-slate-400">

            {displayExpression ||
              "輸入金額"}

          </p>


          <div className="mt-2 flex items-end justify-end gap-2">

            <span className="pb-1 text-xl font-bold text-slate-500">
              {symbol}
            </span>

            <span className="text-4xl font-bold tracking-tight">

              {result.toLocaleString(
                undefined,
                {
                  maximumFractionDigits:
                    2,
                }
              )}

            </span>

          </div>


        </div>


        {/* KEYPAD */}

        <div className="mt-5 grid grid-cols-4 gap-2.5">


          {keys.map(
            (key) => {

              const isOperator =
                [
                  "/",
                  "*",
                  "-",
                  "+",
                ].includes(key);


              const label =
                key === "/"
                  ? "÷"
                  : key === "*"
                  ? "×"
                  : key === "-"
                  ? "−"
                  : key;


              return (

                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    pressKey(key)
                  }
                  className={`flex h-[62px] items-center justify-center rounded-2xl text-[21px] font-bold transition active:scale-95 ${
                    isOperator
                      ? "bg-blue-500 text-white"
                      : key === "AC" ||
                        key === "⌫"
                      ? "bg-white/[0.06] text-slate-300"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {label}
                </button>

              );

            }
          )}


        </div>


        {/* CONFIRM */}

        <button
          type="button"
          disabled={
            result <= 0
          }
          onClick={
            handleConfirm
          }
          className={`mt-4 w-full rounded-2xl py-4 text-base font-bold transition ${
            result > 0
              ? "bg-white text-slate-900 active:scale-[0.99]"
              : "bg-white/10 text-slate-600"
          }`}
        >
          花下去！
        </button>


      </section>


    </div>

  );

}