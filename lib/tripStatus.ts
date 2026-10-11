import { TripDay, TripItem } from "../data/tripData";

export type TripPhase =
  | "before"
  | "during"
  | "after";

export type ItemStatus =
  | "completed"
  | "now"
  | "next"
  | "upcoming";

export function getLocalDateString(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// 判斷整趟旅行目前在哪個階段
export function getTripPhase(
  now: Date,
  departAt: string,
  tripEnd: string
): TripPhase {
  const start = new Date(departAt);
  const end = new Date(tripEnd);

  if (now < start) {
    return "before";
  }

  if (now > end) {
    return "after";
  }

  return "during";
}


// 找出今天是 Day 幾
export function getTodayTripDay(
  days: TripDay[],
  now: Date
) {
  const today = getLocalDateString(now);

  return days.find(
    (day) => day.date === today
  );
}


// 取得某個行程的完整時間
export function getItemStartTime(
  day: TripDay,
  item: TripItem
) {
  return new Date(
    `${day.date}T${item.startTime}:00`
  );
}

export function getItemEndTime(
  day: TripDay,
  item: TripItem
) {
  if (!item.endTime) {
    return null;
  }

  return new Date(
    `${day.date}T${item.endTime}:00`
  );
}

// 找出今天下一個行程
export function getNextTripItem(
  day: TripDay,
  now: Date
) {
  return day.items.find(
    (item) => {
      const start =
        getItemStartTime(
          day,
          item
        );

      return start > now;
    }
  );
}


// 判斷單一行程目前的狀態
export function getItemStatus(
  day: TripDay,
  item: TripItem,
  now: Date
): ItemStatus {
  const start =
    getItemStartTime(day, item);

  const end =
    getItemEndTime(day, item);


  // -------------------------
  // NOW
  // -------------------------

  if (
    end &&
    now >= start &&
    now < end
  ) {
    return "now";
  }


  // -------------------------
  // COMPLETED
  // -------------------------

  if (
    end &&
    now >= end
  ) {
    return "completed";
  }


  // 沒有 endTime 的行程
  if (
    !end &&
    now >= start
  ) {
    return "completed";
  }


  // -------------------------
  // NEXT
  // -------------------------

  const nextItem =
    getNextTripItem(
      day,
      now
    );

  if (
    nextItem?.id === item.id
  ) {
    return "next";
  }


  return "upcoming";
}