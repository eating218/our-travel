"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  FlightInfo,
  tripData,
} from "../../data/tripData";

import { useExpenseData } from "../../hooks/useExpenseData";

import {
  TripSettings,
  useTripSettings,
} from "../../hooks/useTripSettings";


// ========================================
// PROPS
// ========================================

type Props = {
  isOpen: boolean;

  onClose: () => void;
};


// ========================================
// DATE
// ========================================

function formatDate(
  date: string
) {
  if (!date) {
    return "----/--/--";
  }


  const [
    year,
    month,
    day,
  ] = date.split("-");


  return `${year}/${month}/${day}`;
}


// ========================================
// DURATION
// ========================================

function getTripDuration(
  startDate: string,
  endDate: string
) {
  if (
    !startDate ||
    !endDate
  ) {
    return "";
  }


  const start =
    new Date(
      `${startDate}T00:00:00`
    );

  const end =
    new Date(
      `${endDate}T00:00:00`
    );


  const difference =
    end.getTime() -
    start.getTime();


  const days =
    Math.floor(
      difference /
        (1000 *
          60 *
          60 *
          24)
    ) + 1;


  if (
    !Number.isFinite(days) ||
    days <= 0
  ) {
    return "";
  }


  return `${days} 天 ${Math.max(
    days - 1,
    0
  )} 夜`;
}


// ========================================
// FLIGHT HELPERS
// ========================================

function hasFlightDetails(
  flight: FlightInfo
) {
  return Boolean(
    flight.flightNumber ||
      flight.airline ||
      flight.departureTime ||
      flight.arrivalTime ||
      flight.from.airportCode ||
      flight.from.airportName ||
      flight.to.airportCode ||
      flight.to.airportName
  );
}


function getAirportLabel(
  airport: FlightInfo["from"]
) {
  if (airport.airportCode) {
    return airport.airportCode;
  }


  return airport.city;
}


// ========================================
// FLIGHT ROW
// ========================================

function FlightRow({
  flight,
}: {
  flight: FlightInfo;
}) {
  const outbound =
    flight.direction ===
    "outbound";


  const detailsAvailable =
    hasFlightDetails(
      flight
    );


  const fromLabel =
    getAirportLabel(
      flight.from
    );


  const toLabel =
    getAirportLabel(
      flight.to
    );


  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFFCF7] text-lg shadow-sm">
        {outbound
          ? "🛫"
          : "🛬"}
      </div>


      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#403830]">
              {flight.from.city}
              {" → "}
              {flight.to.city}
            </p>


            <p className="mt-0.5 text-xs text-[#9D8E7C]">
              {formatDate(
                flight.date
              )}

              {" · "}

              {outbound
                ? "去程"
                : "回程"}
            </p>
          </div>


          {flight.flightNumber && (
            <span className="shrink-0 rounded-full bg-[#EAD5AF] px-2.5 py-1 text-[10px] font-bold text-[#655038]">
              {
                flight.flightNumber
              }
            </span>
          )}
        </div>


        {detailsAvailable ? (
          <div className="mt-3 rounded-2xl border border-[#EDE0CD] bg-[#FFFCF7] px-3 py-3 shadow-sm">

            {flight.airline && (
              <p className="mb-2 text-[10px] font-semibold text-[#9D8E7C]">
                {
                  flight.airline
                }
              </p>
            )}


            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-bold text-[#403830]">
                  {flight.departureTime ??
                    "--:--"}
                </p>

                <p className="mt-0.5 text-[10px] font-semibold text-[#8A7B69]">
                  {fromLabel}
                </p>
              </div>


              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="h-px flex-1 bg-[#E7DAC7]" />

                <span className="text-[10px] text-[#B7A48D]">
                  ✈
                </span>

                <div className="h-px flex-1 bg-[#E7DAC7]" />
              </div>


              <div className="text-right">
                <p className="text-sm font-bold text-[#403830]">
                  {flight.arrivalTime ??
                    "--:--"}
                </p>

                <p className="mt-0.5 text-[10px] font-semibold text-[#8A7B69]">
                  {toLabel}
                </p>
              </div>
            </div>


            {(flight.from
              .airportName ||
              flight.to
                .airportName) && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#EFE5D6] pt-3">
                <div>
                  {flight.from
                    .airportName && (
                    <p className="text-[10px] leading-relaxed text-[#9D8E7C]">
                      {
                        flight.from
                          .airportName
                      }

                      {flight.from
                        .terminal &&
                        ` · T${flight.from.terminal}`}
                    </p>
                  )}
                </div>


                <div className="text-right">
                  {flight.to
                    .airportName && (
                    <p className="text-[10px] leading-relaxed text-[#9D8E7C]">
                      {
                        flight.to
                          .airportName
                      }

                      {flight.to
                        .terminal &&
                        ` · T${flight.to.terminal}`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-[#9D8E7C]">
            航班資訊尚未設定
          </p>
        )}
      </div>
    </div>
  );
}


// ========================================
// INPUT
// ========================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder?: string;

  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-[#8A7B69]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="mt-1.5 h-10 w-full rounded-xl border border-[#E7DAC7] bg-[#FAF6EF] px-3 text-sm font-medium text-[#403830] outline-none transition placeholder:text-[#B7A48D] focus:border-[#CDA35E] focus:bg-[#FFFCF7] focus:ring-2 focus:ring-[#F7E8CD]"
      />
    </label>
  );
}


// ========================================
// FLIGHT EDITOR
// ========================================

function FlightEditor({
  flight,
  onChange,
}: {
  flight: FlightInfo;

  onChange: (
    flight: FlightInfo
  ) => void;
}) {
  const outbound =
    flight.direction ===
    "outbound";


  return (
    <div className="rounded-2xl border border-[#E7DAC7] p-4">

      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#403830]">
          {outbound
            ? "🛫 去程"
            : "🛬 回程"}
        </p>

        <span className="text-[10px] font-semibold text-[#9D8E7C]">
          {flight.from.city}
          {" → "}
          {flight.to.city}
        </span>
      </div>


      <div className="mt-4 grid grid-cols-2 gap-3">

        <Field
          label="日期"
          type="date"
          value={
            flight.date
          }
          onChange={(
            value
          ) =>
            onChange({
              ...flight,
              date: value,
            })
          }
        />


        <Field
          label="航空公司"
          value={
            flight.airline ??
            ""
          }
          placeholder="例如：長榮航空"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,
              airline:
                value ||
                undefined,
            })
          }
        />


        <Field
          label="出發城市"
          value={
            flight.from.city
          }
          placeholder="台灣"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              from: {
                ...flight.from,
                city: value,
              },
            })
          }
        />


        <Field
          label="抵達城市"
          value={
            flight.to.city
          }
          placeholder="大阪"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              to: {
                ...flight.to,
                city: value,
              },
            })
          }
        />


        <Field
          label="航班號"
          value={
            flight.flightNumber ??
            ""
          }
          placeholder="BR132"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,
              flightNumber:
                value ||
                undefined,
            })
          }
        />


        <div />


        <Field
          label="出發機場代碼"
          value={
            flight.from
              .airportCode ??
            ""
          }
          placeholder="TPE"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              from: {
                ...flight.from,

                airportCode:
                  value
                    .toUpperCase() ||
                  undefined,
              },
            })
          }
        />


        <Field
          label="抵達機場代碼"
          value={
            flight.to
              .airportCode ??
            ""
          }
          placeholder="KIX"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              to: {
                ...flight.to,

                airportCode:
                  value
                    .toUpperCase() ||
                  undefined,
              },
            })
          }
        />


        <Field
          label="出發機場"
          value={
            flight.from
              .airportName ??
            ""
          }
          placeholder="桃園國際機場"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              from: {
                ...flight.from,

                airportName:
                  value ||
                  undefined,
              },
            })
          }
        />


        <Field
          label="抵達機場"
          value={
            flight.to
              .airportName ??
            ""
          }
          placeholder="關西國際機場"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              to: {
                ...flight.to,

                airportName:
                  value ||
                  undefined,
              },
            })
          }
        />


        <Field
          label="起飛時間"
          type="time"
          value={
            flight.departureTime ??
            ""
          }
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              departureTime:
                value ||
                undefined,
            })
          }
        />


        <Field
          label="抵達時間"
          type="time"
          value={
            flight.arrivalTime ??
            ""
          }
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              arrivalTime:
                value ||
                undefined,
            })
          }
        />


        <Field
          label="出發航廈"
          value={
            flight.from
              .terminal ??
            ""
          }
          placeholder="1"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              from: {
                ...flight.from,

                terminal:
                  value ||
                  undefined,
              },
            })
          }
        />


        <Field
          label="抵達航廈"
          value={
            flight.to
              .terminal ??
            ""
          }
          placeholder="1"
          onChange={(
            value
          ) =>
            onChange({
              ...flight,

              to: {
                ...flight.to,

                terminal:
                  value ||
                  undefined,
              },
            })
          }
        />
      </div>
    </div>
  );
}


// ========================================
// COMPONENT
// ========================================

export default function TripInfoSheet({
  isOpen,
  onClose,
}: Props) {
  const {
    loaded: expenseLoaded,

    members,
  } = useExpenseData();


  const {
    loaded:
      settingsLoaded,

    settings,

    updateSettings,
  } = useTripSettings();


  const [
    isEditing,
    setIsEditing,
  ] = useState(false);


  const [
    draft,
    setDraft,
  ] = useState<TripSettings>(
    settings
  );


  // ========================================
  // SYNC DRAFT
  // ========================================

  useEffect(() => {
    if (
      !isEditing
    ) {
      setDraft(
        settings
      );
    }
  }, [
    settings,
    isEditing,
  ]);


  // ========================================
  // BODY LOCK
  // ========================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }


    const originalOverflow =
      document.body.style
        .overflow;


    document.body.style.overflow =
      "hidden";


    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    }


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {
      document.body.style.overflow =
        originalOverflow;


      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    onClose,
  ]);


  // ========================================
  // CLOSED
  // ========================================

  if (!isOpen) {
    return null;
  }


  // ========================================
  // FLIGHTS
  // ========================================

  const outboundFlight =
    settings.flights.find(
      (flight) =>
        flight.direction ===
        "outbound"
    );


  const returnFlight =
    settings.flights.find(
      (flight) =>
        flight.direction ===
        "return"
    );


  // ========================================
  // EDIT
  // ========================================

  function handleStartEdit() {
    setDraft({
      ...settings,

      flights:
        settings.flights.map(
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
    });


    setIsEditing(
      true
    );
  }


  function handleCancelEdit() {
    setDraft(
      settings
    );


    setIsEditing(
      false
    );
  }


  function handleSaveEdit() {
    const cleanName =
      draft.name.trim();


    const cleanCountry =
      draft.country.trim();


    if (
      !cleanName ||
      !cleanCountry ||
      !draft.startDate ||
      !draft.endDate
    ) {
      return;
    }


    if (
      draft.endDate <
      draft.startDate
    ) {
      return;
    }


    updateSettings({
      ...draft,

      name:
        cleanName,

      country:
        cleanCountry,
    });


    setIsEditing(
      false
    );
  }


  function updateDraftFlight(
    updatedFlight:
      FlightInfo
  ) {
    setDraft(
      (current) => ({
        ...current,

        flights:
          current.flights.map(
            (flight) =>
              flight.id ===
              updatedFlight.id
                ? updatedFlight
                : flight
          ),
      })
    );
  }


  // ========================================
  // EDIT MODE
  // ========================================

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-[#302820]/45 backdrop-blur-[2px]" />


        <section className="absolute bottom-0 left-0 right-0 mx-auto max-h-[90vh] max-w-md overflow-y-auto rounded-t-[32px] bg-[#FFFCF7] px-5 pb-8 pt-3 shadow-[0_-12px_45px_rgba(65,48,29,0.12)]">

          <div className="mx-auto h-1.5 w-10 rounded-full bg-[#E7DAC7]" />


          {/* HEADER */}

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#916B30]">
                EDIT TRIP
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#403830]">
                編輯旅程資訊
              </h2>

              <p className="mt-1 text-xs text-[#9D8E7C]">
                修改後會記住在這台裝置
              </p>
            </div>


            <button
              type="button"
              onClick={
                handleCancelEdit
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EDE3] text-lg text-[#8A7B69]"
            >
              ×
            </button>
          </div>


          {/* BASIC */}

          <div className="mt-6 rounded-3xl border border-[#E7DAC7] p-4">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#9D8E7C]">
              TRIP
            </p>


            <div className="mt-4 space-y-3">
              <Field
                label="旅行名稱"
                value={
                  draft.name
                }
                placeholder="京都・大阪"
                onChange={(
                  value
                ) =>
                  setDraft(
                    (current) => ({
                      ...current,

                      name: value,
                    })
                  )
                }
              />


              <Field
                label="國家"
                value={
                  draft.country
                }
                placeholder="日本"
                onChange={(
                  value
                ) =>
                  setDraft(
                    (current) => ({
                      ...current,

                      country:
                        value,
                    })
                  )
                }
              />


              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="出發日期"
                  type="date"
                  value={
                    draft.startDate
                  }
                  onChange={(
                    value
                  ) =>
                    setDraft(
                      (current) => ({
                        ...current,

                        startDate:
                          value,
                      })
                    )
                  }
                />


                <Field
                  label="回程日期"
                  type="date"
                  value={
                    draft.endDate
                  }
                  onChange={(
                    value
                  ) =>
                    setDraft(
                      (current) => ({
                        ...current,

                        endDate:
                          value,
                      })
                    )
                  }
                />
              </div>
            </div>
          </div>


          {/* FLIGHTS */}

          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#9D8E7C]">
                FLIGHTS
              </p>

              <p className="text-[10px] text-[#9D8E7C]">
                選填
              </p>
            </div>


            <div className="space-y-3">
              {draft.flights.map(
                (flight) => (
                  <FlightEditor
                    key={
                      flight.id
                    }
                    flight={
                      flight
                    }
                    onChange={
                      updateDraftFlight
                    }
                  />
                )
              )}
            </div>
          </div>


          {/* ACTIONS */}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={
                handleCancelEdit
              }
              className="h-12 rounded-2xl bg-[#F3EDE3] text-sm font-bold text-[#786958]"
            >
              取消
            </button>


            <button
              type="button"
              onClick={
                handleSaveEdit
              }
              className="h-12 rounded-2xl bg-[#D9B878] text-sm font-bold text-[#403830]"
            >
              儲存
            </button>
          </div>
        </section>
      </div>
    );
  }


  // ========================================
  // VIEW MODE
  // ========================================

  return (
    <div className="fixed inset-0 z-50">

      {/* OVERLAY */}

      <button
        type="button"
        aria-label="關閉旅程資訊"
        onClick={onClose}
        className="absolute inset-0 bg-[#302820]/45 backdrop-blur-[2px]"
      />


      {/* SHEET */}

      <section className="absolute bottom-0 left-0 right-0 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-[32px] bg-[#FFFCF7] px-5 pb-8 pt-3 shadow-[0_-12px_45px_rgba(65,48,29,0.12)]">

        <div className="mx-auto h-1.5 w-10 rounded-full bg-[#E7DAC7]" />


        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-[#916B30]">
              TRIP INFO
            </p>


            <h2 className="mt-1 text-2xl font-bold text-[#403830]">
              🇯🇵{" "}

              {settingsLoaded
                ? settings.name
                : tripData.name}
            </h2>


            <p className="mt-1 text-xs text-[#9D8E7C]">
              {settingsLoaded
                ? settings.country
                : tripData.country}
            </p>
          </div>


          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                handleStartEdit
              }
              className="h-9 rounded-full bg-[#F8E7C5] px-3 text-xs font-bold text-[#916B30] transition active:scale-95"
            >
              編輯
            </button>


            <button
              type="button"
              onClick={onClose}
              aria-label="關閉"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EDE3] text-lg text-[#8A7B69] transition active:scale-95"
            >
              ×
            </button>
          </div>
        </div>


        {/* ========================================
            TRAVEL PERIOD
        ======================================== */}

        <div className="mt-6 rounded-3xl border border-[#E9D5B3] bg-[#F5E5C6] px-5 py-4 text-[#403830]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#916B30]">
              TRAVEL PERIOD
            </p>


            <p className="text-xs font-bold text-[#B7A48D]">
              {getTripDuration(
                settings.startDate,
                settings.endDate
              )}
            </p>
          </div>


          <div className="mt-3 flex items-center gap-2">
            <p className="text-base font-bold tracking-tight">
              {formatDate(
                settings.startDate
              )}
            </p>


            <span className="text-[#8A7B69]">
              —
            </span>


            <p className="text-base font-bold tracking-tight">
              {formatDate(
                settings.endDate
              )}
            </p>
          </div>
        </div>


        {/* ========================================
            TRAVELERS
        ======================================== */}

        <div className="mt-4 rounded-2xl border border-[#E7DAC7] bg-[#FFFCF7] px-4 py-3.5">
          <div className="flex items-start gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3EDE3] text-sm">
              👥
            </div>


            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#9D8E7C]">
                TRAVELERS
              </p>


              {!expenseLoaded ? (
                <p className="mt-1 text-xs text-[#9D8E7C]">
                  讀取中...
                </p>
              ) : members.length >
                0 ? (
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[#65584B]">
                  {members
                    .map(
                      (member) =>
                        member.name
                    )
                    .join(" · ")}
                </p>
              ) : (
                <p className="mt-1 text-xs text-[#9D8E7C]">
                  尚未加入同行者
                </p>
              )}
            </div>
          </div>
        </div>


        {/* ========================================
            ROUTE
        ======================================== */}

        <div className="mt-4 rounded-3xl border border-[#E7DAC7] bg-[#FAF6EF] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9D8E7C]">
              ROUTE
            </p>


            <span className="text-[10px] font-semibold text-[#9D8E7C]">
              往返
            </span>
          </div>


          <div className="mt-4">

            {outboundFlight && (
              <FlightRow
                flight={
                  outboundFlight
                }
              />
            )}


            {outboundFlight &&
              returnFlight && (
                <div className="my-2 ml-5 h-5 border-l border-dashed border-[#D8C8B2]" />
              )}


            {returnFlight && (
              <FlightRow
                flight={
                  returnFlight
                }
              />
            )}


            {!outboundFlight &&
              !returnFlight && (
                <p className="text-xs text-[#9D8E7C]">
                  尚未設定往返資訊
                </p>
              )}
          </div>
        </div>


        {/* ========================================
            ITINERARY
        ======================================== */}

        <div className="mt-4 rounded-3xl border border-[#E7DAC7] bg-[#FFFCF7] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9D8E7C]">
                ITINERARY
              </p>


              <p className="mt-1 text-sm font-bold text-[#403830]">
                {
                  tripData.days
                    .length
                }{" "}
                天行程
              </p>
            </div>


            <span className="text-xl">
              🗺️
            </span>
          </div>


          <div className="mt-4 space-y-3">
            {tripData.days.map(
              (day) => (
                <div
                  key={
                    day.day
                  }
                  className="flex items-start gap-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3EDE3] text-[10px] font-bold text-[#786958]">
                    {
                      day.day
                    }
                  </div>


                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#4A4037]">
                      {
                        day.title
                      }
                    </p>


                    <p className="mt-0.5 truncate text-[10px] text-[#9D8E7C]">
                      {
                        day.subtitle
                      }
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>


        {/* ========================================
            ACCOMMODATION
        ======================================== */}

        <div className="mt-4 rounded-2xl bg-[#FAF6EF] p-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">
              🏨
            </span>


            <div>
              <p className="text-xs font-bold text-[#403830]">
                住宿
              </p>


              <p className="mt-1 text-[10px] text-[#9D8E7C]">
                尚未設定
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}