export type TripItemType =
  | "sightseeing"
  | "food"
  | "transport"
  | "hotel";

export type SightseeingGuide = {
  introduction: string;
  highlights: string;
  story: string;
  tips: string;
};

export type PlaceInfoSource = {
  name: string;
  url?: string;
  checkedAt: string;
};

export type TripItem = {
  id: string;
  type: TripItemType;

  startTime: string;
  endTime?: string;

  name: string;
  detail?: string;

  // 景點營業 / 參拜資訊
  openingHours?: string;
  closedDays?: string;

  // AI / 官方資料來源
  placeInfoSource?: PlaceInfoSource;

  location?: {
    name: string;
    address?: string;
    mapQuery: string;
  };

  guide?: SightseeingGuide;
};

export type TripDay = {
  day: number;
  date: string;
  title: string;
  subtitle: string;
  items: TripItem[];
};


// ========================================
// FLIGHT
// ========================================

export type FlightInfo = {
  id: string;

  direction:
    | "outbound"
    | "return";

  date: string;

  from: {
    city: string;

    // 例如 TPE
    airportCode?: string;

    // 例如 桃園國際機場
    airportName?: string;

    // 例如 1
    terminal?: string;
  };

  to: {
    city: string;

    airportCode?: string;
    airportName?: string;
    terminal?: string;
  };

  // 例如 MM028
  flightNumber?: string;

  // 例如 樂桃航空
  airline?: string;

  // 當地時間 HH:mm
  departureTime?: string;
  arrivalTime?: string;
};


// ========================================
// TRIP DATA
// ========================================

export const tripData = {
  name: "京都・大阪",
  country: "日本",
  countryCode: "JP",

  startDate: "2027-02-28",
  endDate: "2027-03-06",

  // 這兩個仍然代表整趟旅行的生命週期，
  // 不與航班時間綁定。
  departAt: "2027-02-28T07:40:00",
  tripEnd: "2027-03-06T23:59:59",

  duration: "7 天 6 夜",


  // ========================================
  // FLIGHTS
  // ========================================

  flights: [
    {
      id: "outbound-flight",
      direction: "outbound",

      date: "2027-02-28",

      from: {
        city: "台灣",
      },

      to: {
        city: "大阪",
      },

      // 確定航班後再填：
      //
      // airline: "樂桃航空",
      // flightNumber: "MM000",
      // departureTime: "08:40",
      // arrivalTime: "12:15",
      //
      // from: {
      //   city: "台灣",
      //   airportCode: "TPE",
      //   airportName: "桃園國際機場",
      //   terminal: "1",
      // },
      //
      // to: {
      //   city: "大阪",
      //   airportCode: "KIX",
      //   airportName: "關西國際機場",
      //   terminal: "2",
      // },
    },

    {
      id: "return-flight",
      direction: "return",

      date: "2027-03-06",

      from: {
        city: "大阪",
      },

      to: {
        city: "台灣",
      },

      // 確定航班後再填：
      //
      // airline: "樂桃航空",
      // flightNumber: "MM000",
      // departureTime: "19:20",
      // arrivalTime: "21:30",
    },
  ] satisfies FlightInfo[],


  // ========================================
  // DAYS
  // ========================================

  days: [
    {
      day: 1,
      date: "2027-02-28",
      title: "前往京都",
      subtitle: "台灣 → 關西機場 → 京都",
      items: [],
    },

    {
      day: 2,
      date: "2027-03-01",
      title: "京都・東山",
      subtitle: "清水寺・二年坂・祇園",

      items: [
        {
          id: "kiyomizudera",
          type: "sightseeing",

          startTime: "09:00",
          endTime: "11:00",

          name: "清水寺",
          detail: "參拜・散策",

          location: {
            name: "清水寺",
            address:
              "京都府京都市東山区清水1丁目294",
            mapQuery: "清水寺 京都",
          },

          guide: {
            introduction:
              "清水寺是京都最具代表性的寺院之一，以建於山坡上的本堂與「清水舞台」聞名，也是京都東山地區的重要景點。",

            highlights:
              "來到清水寺可以特別留意本堂的木造結構與清水舞台。舞台由大量木柱支撐，從舞台可以眺望京都市區與周圍山景。",

            story:
              "日本有一句「從清水舞台跳下去」的說法，用來形容一個人下定決心、放手一搏。這句話的典故正與清水寺的舞台有關。",

            tips:
              "參觀完本堂後，可以繼續前往音羽瀑布，再從清水寺往二年坂、三年坂方向散步，是很順的東山散策路線。",
          },
        },

        {
          id: "ninenzaka",
          type: "sightseeing",

          startTime: "11:30",
          endTime: "12:30",

          name: "二年坂・三年坂",
          detail: "京都老街散策",

          location: {
            name: "二年坂",
            address:
              "京都府京都市東山区桝屋町",
            mapQuery: "二年坂 京都",
          },

          guide: {
            introduction:
              "二年坂與三年坂是京都東山保存相當完整的傳統街道，沿途可以看到町家、石板路、茶屋與各式京都特色商店。",

            highlights:
              "這一帶最值得感受的不是單一建築，而是整體街道景觀。石板坡道與傳統町家構成非常具有京都特色的街景。",

            story:
              "二年坂、三年坂的名稱流傳著不同說法，其中也有「在三年坂跌倒會有不好的事情」等民間傳說，因此形成許多有趣的地方故事。",

            tips:
              "從清水寺一路往二年坂、三年坂步行最順。沿途店家很多，不需要急著在第一間店購物，可以一路逛到八坂一帶。",
          },
        },

        {
          id: "lunch",
          type: "food",

          startTime: "13:00",
          endTime: "14:00",

          name: "午餐",
          detail: "祇園周邊用餐",

          location: {
            name: "祇園",
            mapQuery: "祇園 京都",
          },
        },

        {
          id: "yasaka",
          type: "sightseeing",

          startTime: "15:00",
          endTime: "16:30",

          name: "八坂神社",
          detail: "參拜・祇園散策",

          location: {
            name: "八坂神社",
            address:
              "京都府京都市東山区祇園町北側625",
            mapQuery: "八坂神社 京都",
          },

          guide: {
            introduction:
              "八坂神社位於京都祇園，是京都非常重要的神社之一，也是日本著名祭典「祇園祭」的重要中心。",

            highlights:
              "進入神社後可以留意舞殿以及境內懸掛的大量提燈，入夜點燈後會呈現與白天不同的氣氛。",

            story:
              "八坂神社與祇園地區關係非常深，而祇園祭的歷史也與過去人們祈求消除疫病有關，逐漸發展成京都最具代表性的祭典之一。",

            tips:
              "八坂神社就在祇園附近，可以和花見小路、四條通安排在一起。傍晚前往也很適合接續晚餐行程。",
          },
        },
      ],
    },

    {
      day: 3,
      date: "2027-03-02",
      title: "京都・嵐山",
      subtitle: "竹林・天龍寺・渡月橋",
      items: [],
    },

    {
      day: 4,
      date: "2027-03-03",
      title: "宇治",
      subtitle: "平等院・宇治散策",
      items: [],
    },

    {
      day: 5,
      date: "2027-03-04",
      title: "大阪",
      subtitle:
        "大阪城・心齋橋・道頓堀",
      items: [],
    },

    {
      day: 6,
      date: "2027-03-05",
      title: "大阪自由行",
      subtitle: "購物・美食",
      items: [],
    },

    {
      day: 7,
      date: "2027-03-06",
      title: "返回台灣",
      subtitle:
        "大阪 → 關西機場 → 台灣",
      items: [],
    },
  ] satisfies TripDay[],
};