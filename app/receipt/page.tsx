"use client";



import Link from "next/link";
import { useRouter } from "next/navigation";

import {

  ChangeEvent,

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";



import type {
  Expense,
  ExpenseCategory,
  ExpenseMember,
  ExpenseVisibility,
} from "../../data/expenseData";

import { useExpenseData } from "../../hooks/useExpenseData";



// ========================================

// TYPES

// ========================================



type ReceiptAssignment =

  | {

      type: "personal";

      memberIds: [string];

    }

  | {

      type: "shared";

      memberIds: string[];

    };



type ReceiptItem = {

  id: string;

  originalName: string;

  chineseName: string;

  quantity?: number;

  amount: number;



  // 商品由誰負擔

  assignment: ReceiptAssignment;



  // 是否已經由使用者手動確認過

  hasAssigned: boolean;

};



type ReceiptScanResult = {

  merchant: string;

  date?: string;

  time?: string;

  currency: "JPY";

  total: number;

  tax?: number;

  items: ReceiptItem[];

  suggestedCategory?: string;

};



type MemberShare = {

  memberId: string;

  amount: number;

};



type Transfer = {

  from: string;

  to: string;

  amount: number;

};



// ========================================

// DEMO OCR DATA

// ========================================



const DEMO_ITEMS = [

  {

    id: "demo-1",

    originalName: "紅しゃけおにぎり",

    chineseName: "鮭魚飯糰",

    quantity: 1,

    amount: 178,

  },

  {

    id: "demo-2",

    originalName: "緑茶",

    chineseName: "綠茶",

    quantity: 1,

    amount: 128,

  },

  {

    id: "demo-3",

    originalName: "カスタードプリン",

    chineseName: "卡士達布丁",

    quantity: 1,

    amount: 238,

  },

];



// ========================================

// PAGE

// ========================================



export default function ReceiptPage() {

  const router = useRouter();

  const {
    loaded,
    expenses,
    members,
    categories,
    addExpense,
  } = useExpenseData();



  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const albumInputRef = useRef<HTMLInputElement | null>(null);



  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [fileName, setFileName] = useState("");



  const [status, setStatus] = useState<

    "empty" | "ready" | "scanning" | "result"

  >("empty");



  const [result, setResult] = useState<ReceiptScanResult | null>(null);



  const [editing, setEditing] = useState(false);



  // 整張收據由誰先付款

  const [paidBy, setPaidBy] = useState("");

  // 整張收據的可見性
  const [visibility, setVisibility] =
    useState<ExpenseVisibility>("shared");

  const [saving, setSaving] = useState(false);

  const [pendingExpenseCount, setPendingExpenseCount] =
    useState<number | null>(null);

  const [pendingDestination, setPendingDestination] =
    useState<string | null>(null);



  // 目前正在分配哪個商品

  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);



  // 分配視窗暫存勾選

  const [draftMemberIds, setDraftMemberIds] = useState<string[]>([]);



  // ========================================

  // CURRENT USER

  // ========================================



  const currentUser = members.find((member) => member.isCurrentUser);



  // ========================================

  // IMAGE URL CLEANUP

  // ========================================



  useEffect(() => {

    return () => {

      if (imageUrl) {

        URL.revokeObjectURL(imageUrl);

      }

    };

  }, [imageUrl]);



  // ========================================

  // DEFAULT PAYER = CURRENT USER

  // ========================================



  useEffect(() => {

    if (paidBy || members.length === 0) {

      return;

    }



    const initialPayer = currentUser ?? members[0];



    if (initialPayer) {

      setPaidBy(initialPayer.id);

    }

  }, [members, currentUser, paidBy]);



  // ========================================
  // AFTER SAVE -> GO TO EXPENSE / SETTLEMENT
  // ========================================

  useEffect(() => {
    if (
      pendingExpenseCount === null ||
      !pendingDestination
    ) {
      return;
    }

    if (expenses.length < pendingExpenseCount) {
      return;
    }

    router.push(pendingDestination);
  }, [
    expenses.length,
    pendingExpenseCount,
    pendingDestination,
    router,
  ]);



  // ========================================

  // IMAGE

  // ========================================



  function handleImage(event: ChangeEvent<HTMLInputElement>) {

    const file = event.target.files?.[0];



    if (!file) {

      return;

    }



    if (!file.type.startsWith("image/")) {

      return;

    }



    if (imageUrl) {

      URL.revokeObjectURL(imageUrl);

    }



    const nextUrl = URL.createObjectURL(file);



    setImageUrl(nextUrl);

    setFileName(file.name);



    setResult(null);

    setEditing(false);

    setVisibility("shared");

    setAssigningItemId(null);

    setDraftMemberIds([]);



    setStatus("ready");



    event.target.value = "";

  }



  function resetReceipt() {

    if (imageUrl) {

      URL.revokeObjectURL(imageUrl);

    }



    setImageUrl(null);

    setFileName("");

    setResult(null);

    setEditing(false);

    setVisibility("shared");

    setAssigningItemId(null);

    setDraftMemberIds([]);



    const payer = currentUser ?? members[0];



    setPaidBy(payer?.id ?? "");



    setStatus("empty");

  }



  // ========================================

  // DEMO SCAN

  // ========================================



  function scanReceipt() {

    if (!imageUrl) {

      return;

    }



    if (members.length === 0) {

      return;

    }



    setStatus("scanning");



    const allMemberIds = members.map((member) => member.id);



    setTimeout(() => {

      const demoItems: ReceiptItem[] = DEMO_ITEMS.map((item) => {

        const assignment: ReceiptAssignment =

          allMemberIds.length === 1

            ? {

                type: "personal",

                memberIds: [allMemberIds[0]],

              }

            : {

                type: "shared",

                memberIds: [...allMemberIds],

              };



        return {

          ...item,



          // 剛辨識完還沒有人工確認

          hasAssigned: false,



          // 暫時保留全員共同作為 fallback

          // 但第一次開啟分配視窗時不會打勾

          assignment,

        };

      });



      const demo: ReceiptScanResult = {

        merchant: "セブン‐イレブン",

        date: "2027-03-01",

        time: "18:42",



        currency: "JPY",



        total: 544,

        tax: 40,



        suggestedCategory: "飲食",



        items: demoItems,

      };



      setResult(demo);

      setVisibility("shared");



      // 每次新掃描

      // 預設付款人 = 本人

      const payer = currentUser ?? members[0];



      if (payer) {

        setPaidBy(payer.id);

      }



      setStatus("result");

    }, 900);

  }



  // ========================================

  // EDIT RESULT

  // ========================================



  function updateMerchant(value: string) {

    setResult((current) => {

      if (!current) {

        return current;

      }



      return {

        ...current,

        merchant: value,

      };

    });

  }



  function updateDate(value: string) {

    setResult((current) => {

      if (!current) {

        return current;

      }



      return {

        ...current,

        date: value,

      };

    });

  }



  function updateTime(value: string) {

    setResult((current) => {

      if (!current) {

        return current;

      }



      return {

        ...current,

        time: value,

      };

    });

  }



  function updateItemChineseName(id: string, value: string) {

    setResult((current) => {

      if (!current) {

        return current;

      }



      return {

        ...current,



        items: current.items.map((item) =>

          item.id === id

            ? {

                ...item,

                chineseName: value,

              }

            : item

        ),

      };

    });

  }



  function updateItemAmount(id: string, value: string) {

    const parsed = Number(value);



    setResult((current) => {

      if (!current) {

        return current;

      }



      return {

        ...current,



        items: current.items.map((item) =>

          item.id === id

            ? {

                ...item,



                amount: Number.isFinite(parsed) ? parsed : 0,

              }

            : item

        ),

      };

    });

  }



  // ========================================

  // ASSIGNMENT

  // ========================================



  function openAssignment(item: ReceiptItem) {

    setAssigningItemId(item.id);



    // 第一次開啟商品：

    // 不預設勾任何人

    if (!item.hasAssigned) {

      setDraftMemberIds([]);

      return;

    }



    // 已經分配過：

    // 再次進入時保留原本設定

    setDraftMemberIds(item.assignment.memberIds);

  }



  function closeAssignment() {

    setAssigningItemId(null);

    setDraftMemberIds([]);

  }



  function toggleDraftMember(memberId: string) {

    setDraftMemberIds((current) => {

      if (current.includes(memberId)) {

        return current.filter((id) => id !== memberId);

      }



      return [...current, memberId];

    });

  }



  function selectAllMembers() {

    setDraftMemberIds(members.map((member) => member.id));

  }



  function saveAssignment() {

    if (!assigningItemId || draftMemberIds.length === 0) {

      return;

    }



    setResult((current) => {

      if (!current) {

        return current;

      }



      const updatedItems: ReceiptItem[] = current.items.map((item) => {

        if (item.id !== assigningItemId) {

          return item;

        }



        // 一個人 → 個人用品

        if (draftMemberIds.length === 1) {

          const assignment: ReceiptAssignment = {

            type: "personal",

            memberIds: [draftMemberIds[0]],

          };



          return {

            ...item,

            hasAssigned: true,

            assignment,

          };

        }



        // 多人 → 平均分攤

        const assignment: ReceiptAssignment = {

          type: "shared",

          memberIds: [...draftMemberIds],

        };



        return {

          ...item,

          hasAssigned: true,

          assignment,

        };

      });



      return {

        ...current,

        items: updatedItems,

      };

    });



    closeAssignment();

  }



  function setAllShared() {

    const ids = members.map((member) => member.id);



    if (ids.length === 0) {

      return;

    }



    setResult((current) => {

      if (!current) {

        return current;

      }



      const updatedItems: ReceiptItem[] = current.items.map((item) => {

        const assignment: ReceiptAssignment =

          ids.length === 1

            ? {

                type: "personal",

                memberIds: [ids[0]],

              }

            : {

                type: "shared",

                memberIds: [...ids],

              };



        return {

          ...item,



          // 使用者主動按了「全部全員共同」

          // 視為已確認分配

          hasAssigned: true,



          assignment,

        };

      });



      return {

        ...current,

        items: updatedItems,

      };

    });

  }



  // ========================================

  // MEMBER SHARES

  //

  // 雖然 UI 已移除「每人負擔」卡片，

  // 但 Settlement 計算仍然需要這份資料。

  // ========================================



  const memberShares = useMemo<MemberShare[]>(() => {

    if (!result) {

      return [];

    }



    const map = new Map<string, number>();



    members.forEach((member) => {

      map.set(member.id, 0);

    });



    result.items.forEach((item) => {

      const ids = item.assignment.memberIds;



      if (ids.length === 0) {

        return;

      }



      const share = item.amount / ids.length;



      ids.forEach((memberId) => {

        map.set(memberId, (map.get(memberId) ?? 0) + share);

      });

    });



    return members.map((member) => ({

      memberId: member.id,

      amount: map.get(member.id) ?? 0,

    }));

  }, [result, members]);



  // ========================================

  // ITEM TOTAL

  // ========================================



  const itemTotal =

    result?.items.reduce((sum, item) => sum + item.amount, 0) ?? 0;



  const totalMatches =

    !!result && Math.abs(itemTotal - result.total) < 0.01;



  // ========================================

  // UNASSIGNED ITEMS

  // ========================================



  const unassignedCount =

    result?.items.filter((item) => !item.hasAssigned).length ?? 0;



  const allItemsAssigned = result ? unassignedCount === 0 : false;

  const receiptReady =
    visibility === "private" ? true : allItemsAssigned;



  // ========================================

  // SETTLEMENT

  //

  // 一張收據目前只有一位付款人。

  // 其他人的負擔 → 付款人。

  // ========================================



  const transfers = useMemo<Transfer[]>(() => {

    if (!result || !paidBy || visibility === "private") {

      return [];

    }



    return memberShares

      .filter(

        (share) =>

          share.memberId !== paidBy &&

          share.amount > 0

      )

      .map((share) => ({

        from: share.memberId,

        to: paidBy,

        amount: share.amount,

      }));

  }, [result, paidBy, memberShares, visibility]);



  const payerShare =

    memberShares.find((share) => share.memberId === paidBy)?.amount ?? 0;



  const payerReceivable = transfers.reduce(

    (sum, transfer) => sum + transfer.amount,

    0

  );



  // ========================================

  // CURRENT ASSIGNING ITEM

  // ========================================



  const assigningItem = result?.items.find(

    (item) => item.id === assigningItemId

  );



  // ========================================

  // TEST CONFIRM

  // ========================================



  function handleContinue() {
  if (!result || saving || !loaded) {
    return;
  }

  if (!currentUser) {
    alert("找不到目前使用者，請先確認旅行成員設定。");
    return;
  }

  if (visibility === "shared") {
    if (!paidBy) {
      return;
    }

    if (!allItemsAssigned) {
      alert(`還有 ${unassignedCount} 個商品尚未分配。`);
      return;
    }

    const memberIds = new Set(
      members.map((member) => member.id)
    );

    const invalidAssignment = result.items.some(
      (item) =>
        !item.hasAssigned ||
        item.assignment.memberIds.length === 0 ||
        item.assignment.memberIds.some(
          (memberId) => !memberIds.has(memberId)
        )
    );

    if (invalidAssignment) {
      alert("有商品的分配成員已不存在，請重新分配。");
      return;
    }
  }

  const itemTotal = result.items.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  if (Math.round(itemTotal) !== Math.round(result.total)) {
    alert("品項合計與收據總額不同，請先確認金額。");
    return;
  }

  if (!result.date) {
    alert("請先確認收據日期。");
    return;
  }

  const receiptDate = result.date;

  const categoryId = getReceiptCategoryId(
    result.suggestedCategory,
    categories
  );

  if (!categoryId) {
    alert("找不到可用的記帳分類。");
    return;
  }

  const createdAt = Date.now();

  const newExpenses: Expense[] = result.items.map(
    (item, index) => ({
      id:
        typeof crypto !== "undefined" &&
        "randomUUID" in crypto
          ? `receipt-${crypto.randomUUID()}`
          : `receipt-${createdAt}-${index}`,

      title:
        item.chineseName.trim() ||
        item.originalName.trim() ||
        "收據品項",

      note: `${result.merchant}・收據辨識`,

      amount: item.amount,

      currency: result.currency,

      categoryId,

      visibility,

      paidBy:
        visibility === "private"
          ? currentUser.id
          : paidBy,

      splitBetween:
        visibility === "private"
          ? [currentUser.id]
          : [...item.assignment.memberIds],

      date: receiptDate,

      ...(result.time
        ? {
            time: result.time,
          }
        : {}),
    })
  );

  setSaving(true);

  const targetCount =
    expenses.length + newExpenses.length;

  newExpenses.forEach((expense) => {
    addExpense(expense);
  });

  setPendingExpenseCount(targetCount);

  setPendingDestination(
    visibility === "private"
      ? "/expenses"
      : "/expenses/settlement"
  );
}



// ========================================

  // LOADING

  // ========================================



  if (!loaded) {

    return (

      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-md px-5 pt-5">

          <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />



          <div className="mt-5 h-72 animate-pulse rounded-[26px] bg-slate-200" />

        </div>

      </main>

    );

  }



  // ========================================

  // UI

  // ========================================



  return (

    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}



      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">

          <Link

            href="/"

            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700"

          >

            ‹

          </Link>



          <div className="text-center">

            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">

              RECEIPT SCANNER

            </p>



            <h1 className="text-sm font-bold text-slate-900">

              收據辨識

            </h1>

          </div>



          {status !== "empty" ? (

            <button

              type="button"

              onClick={resetReceipt}

              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500"

            >

              ↻

            </button>

          ) : (

            <div className="h-9 w-9" />

          )}

        </div>

      </header>



      <div className="mx-auto max-w-md px-5 pb-28 pt-5">

        {/* EMPTY */}



        {status === "empty" && (

          <>

            <section className="rounded-[26px] border border-dashed border-slate-300 bg-white px-5 py-9 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-100 text-3xl">

                📸

              </div>



              <h3 className="mt-4 text-base font-bold text-slate-900">

                掃描日本收據

              </h3>



              <p className="mx-auto mt-2 max-w-[250px] text-xs leading-5 text-slate-400">

                收據盡量攤平，避免反光並讓文字保持清楚。

              </p>



              <div className="mt-6 grid grid-cols-2 gap-3">

                <button

                  type="button"

                  onClick={() => cameraInputRef.current?.click()}

                  className="rounded-2xl bg-slate-900 px-3 py-3.5 text-xs font-bold text-white"

                >

                  📷 拍照

                </button>



                <button

                  type="button"

                  onClick={() => albumInputRef.current?.click()}

                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-xs font-bold text-slate-700"

                >

                  🖼️ 相簿

                </button>

              </div>

            </section>



            <section className="mt-4 rounded-[22px] bg-blue-50 px-4 py-4">

              <p className="text-xs font-bold text-blue-900">

                V1 測試模式

              </p>



              <p className="mt-1 text-[11px] leading-5 text-blue-700">

                辨識目前仍使用測試資料。這一版先測試「誰付款、商品是誰的、誰該還誰」。

              </p>

            </section>

          </>

        )}



        {/* IMAGE */}



        {imageUrl && status !== "empty" && (

          <section className="mt-5">

            <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                <div className="min-w-0">

                  <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">

                    RECEIPT

                  </p>



                  <p className="mt-0.5 truncate text-xs font-bold text-slate-700">

                    {fileName || "收據照片"}

                  </p>

                </div>



                {status !== "scanning" && (

                  <button

                    type="button"

                    onClick={() => albumInputRef.current?.click()}

                    className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-600"

                  >

                    換照片

                  </button>

                )}

              </div>



              <div className="flex max-h-[360px] justify-center overflow-hidden bg-slate-100">

                <img

                  src={imageUrl}

                  alt="收據預覽"

                  className="max-h-[360px] w-full object-contain"

                />

              </div>

            </div>

          </section>

        )}



        {/* READY */}



        {status === "ready" && (

          <section className="mt-4">

            <button

              type="button"

              onClick={scanReceipt}

              disabled={members.length === 0}

              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white disabled:bg-slate-300"

            >

              ✨ 開始辨識

            </button>



            {members.length === 0 && (

              <p className="mt-2 text-center text-[10px] text-rose-500">

                目前沒有旅行成員，請先新增成員。

              </p>

            )}

          </section>

        )}



        {/* SCANNING */}



        {status === "scanning" && (

          <section className="mt-4 rounded-[24px] bg-white px-5 py-6 text-center">

            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900" />



            <p className="mt-4 text-sm font-bold text-slate-800">

              正在讀懂這張收據...

            </p>



            <p className="mt-1 text-[11px] text-slate-400">

              辨識日文、商品與金額

            </p>

          </section>

        )}



        {/* RESULT */}



        {status === "result" && result && (

          <>

            {/* RESULT HEADER */}



            <section className="mt-5">

              <div className="mb-3 flex items-end justify-between">

                <div>

                  <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-500">

                    SCAN COMPLETE

                  </p>



                  <h2 className="mt-1 text-base font-bold text-slate-900">

                    辨識完成 ✓

                  </h2>

                </div>



                <button

                  type="button"

                  onClick={() => setEditing((current) => !current)}

                  className={`rounded-xl px-3 py-2 text-[11px] font-bold ${

                    editing

                      ? "bg-slate-900 text-white"

                      : "bg-white text-slate-600"

                  }`}

                >

                  {editing ? "完成" : "修改"}

                </button>

              </div>



              {/* MERCHANT */}



              <div className="rounded-[26px] bg-white p-4 shadow-sm shadow-slate-200/50">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0 flex-1">

                    <p className="text-[10px] font-bold text-slate-400">

                      店家

                    </p>



                    {editing ? (

                      <input

                        type="text"

                        value={result.merchant}

                        onChange={(event) =>

                          updateMerchant(event.target.value)

                        }

                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base font-bold text-slate-900 outline-none"

                      />

                    ) : (

                      <>

                        <h3 className="mt-1 text-lg font-black text-slate-900">

                          {result.merchant}

                        </h3>



                        <p className="mt-1 text-xs font-medium text-slate-400">

                          {getMerchantDisplayName(result.merchant)}

                        </p>

                      </>

                    )}

                  </div>



                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center">

                    <p className="text-[9px] font-bold text-emerald-600">

                      分類

                    </p>



                    <p className="mt-0.5 text-xs font-bold text-emerald-800">

                      🍴 {result.suggestedCategory ?? "未分類"}

                    </p>

                  </div>

                </div>



                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-slate-50 px-3 py-3">

                    <p className="text-[9px] font-bold text-slate-400">

                      日期

                    </p>



                    {editing ? (

                      <input

                        type="date"

                        value={result.date ?? ""}

                        onChange={(event) =>

                          updateDate(event.target.value)

                        }

                        className="mt-1 w-full bg-transparent text-xs font-bold text-slate-800 outline-none"

                      />

                    ) : (

                      <p className="mt-1 text-xs font-bold text-slate-800">

                        {result.date ?? "—"}

                      </p>

                    )}

                  </div>



                  <div className="rounded-2xl bg-slate-50 px-3 py-3">

                    <p className="text-[9px] font-bold text-slate-400">

                      時間

                    </p>



                    {editing ? (

                      <input

                        type="time"

                        value={result.time ?? ""}

                        onChange={(event) =>

                          updateTime(event.target.value)

                        }

                        className="mt-1 w-full bg-transparent text-xs font-bold text-slate-800 outline-none"

                      />

                    ) : (

                      <p className="mt-1 text-xs font-bold text-slate-800">

                        {result.time ?? "—"}

                      </p>

                    )}

                  </div>

                </div>

              </div>

            </section>



            {/* PAYER */}

            {visibility === "shared" && (
            <section className="mt-4 rounded-[26px] bg-white p-4 shadow-sm shadow-slate-200/50">

              <p className="text-[10px] font-bold tracking-[0.14em] text-slate-400">

                PAID BY

              </p>



              <h3 className="mt-1 text-sm font-bold text-slate-900">

                誰先結帳？

              </h3>



              <p className="mt-1 text-[10px] leading-4 text-slate-400">

                預設由本人付款，需要時可以改成其他旅伴。

              </p>



              <div className="mt-4 flex flex-wrap gap-2">

                {members.map((member) => {

                  const selected = paidBy === member.id;



                  return (

                    <button

                      key={member.id}

                      type="button"

                      onClick={() => setPaidBy(member.id)}

                      className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${

                        selected

                          ? "bg-slate-900 text-white"

                          : "bg-slate-100 text-slate-600"

                      }`}

                    >

                      {member.isCurrentUser

                        ? `${member.name}（我）`

                        : member.name}

                    </button>

                  );

                })}

              </div>

            </section>
            )}



            
            {/* VISIBILITY */}

            <section className="mt-4 rounded-[26px] bg-white p-4 shadow-sm shadow-slate-200/50">
              <p className="text-[10px] font-bold tracking-[0.14em] text-slate-400">VISIBILITY</p>
              <h3 className="mt-1 text-sm font-bold text-slate-900">這張收據要一起分帳嗎？</h3>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">共同收據會進入分帳；私人收據只有自己可見。</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility("shared")}
                  className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                    visibility === "shared"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <span className="text-lg leading-none">👥</span>
                  <span>
                    <span className="block text-xs font-bold">共同</span>
                    <span className="mt-0.5 block text-[9px] opacity-70">
                      同行旅伴分帳
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                    visibility === "private"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <span className="text-lg leading-none">🔒</span>
                  <span>
                    <span className="block text-xs font-bold">私人</span>
                    <span className="mt-0.5 block text-[9px] opacity-70">
                      只有自己可見
                    </span>
                  </span>
                </button>
              </div>


            {/* ITEMS */}

              <div className="my-5 border-t border-slate-100" />

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold tracking-[0.14em] text-slate-400">

                    ITEMS

                  </p>



                  <h3 className="mt-1 text-sm font-bold text-slate-900">
                    {visibility === "private"
                      ? "辨識到的品項"
                      : "這些東西是誰的？"}
                  </h3>

                </div>



                <span className="text-[11px] font-bold text-slate-400">

                  {result.items.length} 項

                </span>

              </div>


            {!editing && visibility === "shared" && (

                <div className="mt-3 flex items-center justify-between gap-3">

                  {unassignedCount > 0 ? (

                    <p className="text-[10px] font-bold text-amber-600">

                      還有 {unassignedCount} 項尚未確認

                    </p>

                  ) : (

                    <p className="text-[10px] font-bold text-emerald-600">

                      ✓ 全部分配完成

                    </p>

                  )}



                  <button

                    type="button"

                    onClick={setAllShared}

                    className="shrink-0 rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-indigo-700"

                  >

                    👥 全部全員共同

                  </button>

                </div>

              )}



              <div className="mt-3 divide-y divide-slate-100">

                {result.items.map((item) => (

                  <div

                    key={item.id}

                    className="py-4 first:pt-1 last:pb-1"

                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0 flex-1">

                        {editing ? (

                          <input

                            type="text"

                            value={item.chineseName}

                            onChange={(event) =>

                              updateItemChineseName(

                                item.id,

                                event.target.value

                              )

                            }

                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none"

                          />

                        ) : (

                          <p className="text-sm font-bold text-slate-800">

                            {item.chineseName}

                          </p>

                        )}



                        <p className="mt-1 text-[10px] text-slate-400">

                          {item.originalName}

                        </p>



                        {!editing && visibility === "shared" && (

                          <button

                            type="button"

                            onClick={() => openAssignment(item)}

                            className={`mt-2 inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold ${

                              item.hasAssigned

                                ? "bg-slate-100 text-slate-600"

                                : "bg-amber-50 text-amber-700"

                            }`}

                          >

                            {item.hasAssigned

                              ? getAssignmentLabel(item, members)

                              : "＋ 分給誰？"}



                            <span className="ml-1.5 opacity-60">

                              ›

                            </span>

                          </button>

                        )}

                      </div>



                      {editing ? (

                        <div className="flex shrink-0 items-center rounded-xl border border-slate-200 px-2">

                          <span className="text-xs font-bold text-slate-400">

                            ¥

                          </span>



                          <input

                            type="number"

                            inputMode="numeric"

                            value={item.amount}

                            onChange={(event) =>

                              updateItemAmount(

                                item.id,

                                event.target.value

                              )

                            }

                            className="w-16 bg-transparent py-2 text-right text-sm font-bold text-slate-800 outline-none"

                          />

                        </div>

                      ) : (

                        <p className="shrink-0 text-sm font-black text-slate-900">

                          ¥{formatMoney(item.amount)}

                        </p>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </section>



            {/* SETTLEMENT */}



            {visibility === "shared" && (
            <section className="mt-4 rounded-[26px] bg-slate-900 p-5 text-white">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-[10px] font-bold tracking-[0.14em] text-blue-300">

                    SETTLEMENT

                  </p>



                  <h3 className="mt-1 text-base font-bold">

                    誰要給誰錢？

                  </h3>

                </div>



                <div className="text-right">

                  <p className="text-[9px] text-slate-400">

                    付款人

                  </p>



                  <p className="mt-0.5 text-xs font-bold">

                    {getMemberName(paidBy, members)}

                  </p>

                </div>

              </div>



              {!allItemsAssigned ? (

                <div className="mt-4 rounded-2xl bg-amber-400/10 px-4 py-4">

                  <p className="text-xs font-bold text-amber-200">

                    還有 {unassignedCount} 個商品尚未分配

                  </p>



                  <p className="mt-1 text-[10px] leading-4 text-slate-400">

                    全部商品確認後，這裡才會顯示最終的收付款結果。

                  </p>

                </div>

              ) : transfers.length > 0 ? (

                <div className="mt-4 space-y-2">

                  {transfers.map((transfer, index) => (

                    <div

                      key={`${transfer.from}-${transfer.to}-${index}`}

                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"

                    >

                      <div className="min-w-0">

                        <p className="text-xs font-bold text-white">

                          {getMemberName(

                            transfer.from,

                            members

                          )}



                          <span className="mx-2 text-slate-500">

                            →

                          </span>



                          {getMemberName(

                            transfer.to,

                            members

                          )}

                        </p>



                        <p className="mt-1 text-[9px] text-slate-400">

                          應付

                        </p>

                      </div>



                      <p className="shrink-0 text-lg font-black">

                        ¥{formatMoney(transfer.amount)}

                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="mt-4 rounded-2xl bg-white/10 px-4 py-4 text-center">

                  <p className="text-xs font-bold">

                    不需要另外轉帳 🎉

                  </p>



                  <p className="mt-1 text-[10px] text-slate-400">

                    目前所有負擔都由付款人自己承擔

                  </p>

                </div>

              )}



              {allItemsAssigned && (

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">

                  <div>

                    <p className="text-[9px] text-slate-400">

                      付款人自己負擔

                    </p>



                    <p className="mt-1 text-sm font-black">

                      ¥{formatMoney(payerShare)}

                    </p>

                  </div>



                  <div className="text-right">

                    <p className="text-[9px] text-slate-400">

                      付款人應收

                    </p>



                    <p className="mt-1 text-sm font-black text-emerald-300">

                      ¥{formatMoney(payerReceivable)}

                    </p>

                  </div>

                </div>

              )}

            </section>
            )}



            {/* RECEIPT CHECK */}



            <section className="mt-3">

              {!totalMatches && (

                <div className="rounded-2xl bg-amber-50 px-4 py-3">

                  <p className="text-[10px] font-bold text-amber-700">

                    ⚠ 品項金額與收據總額不同

                  </p>



                  <p className="mt-1 text-[10px] leading-4 text-amber-600">

                    品項加總 ¥{formatMoney(itemTotal)}

                    ，收據合計 ¥{formatMoney(result.total)}

                    。可能有折扣、稅額或辨識誤差。

                  </p>

                </div>

              )}



              {typeof result.tax === "number" && (

                <p className="mt-3 text-center text-[10px] text-slate-400">

                  收據稅額 ¥{formatMoney(result.tax)}

                  ・目前僅作資訊顯示

                </p>

              )}

            </section>



            {/* CONFIRM */}



            <section className="mt-5">

              <button

                type="button"

                onClick={handleContinue}

                disabled={
                saving ||
                result.total <= 0 ||
                result.merchant.trim() === "" ||
                (visibility === "private"
                  ? !currentUser
                  : !paidBy || !allItemsAssigned)
              }
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white disabled:bg-slate-300"

              >

                {saving
                ? "寫入記帳中..."
                : visibility === "private"
                  ? "🔒 記入私人帳本"
                  : receiptReady
                    ? "✓ 確認並記入分帳"
                    : `還有 ${unassignedCount} 項未分配`}

              </button>



              <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">

                {visibility === "private"
                ? "確認後會寫入私人支出，不參與共同結算"
                : "確認後會寫入共同帳本，並直接前往結算頁"}

              </p>

            </section>

          </>

        )}

      </div>



      {/* ======================================== */}

      {/* ASSIGNMENT SHEET */}

      {/* ======================================== */}



      {visibility === "shared" && assigningItem && assigningItemId && (

        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 sm:items-center">

          <button

            type="button"

            aria-label="關閉"

            onClick={closeAssignment}

            className="absolute inset-0"

          />



          <div className="relative z-10 w-full max-w-md rounded-t-[30px] bg-white p-5 pb-7 shadow-2xl sm:rounded-[30px]">

            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />



            <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400">

              ASSIGN ITEM

            </p>



            <h3 className="mt-1 text-lg font-black text-slate-900">

              這項是誰的？

            </h3>



            {/* ITEM */}



            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">

              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">

                  <p className="text-sm font-bold text-slate-800">

                    {assigningItem.chineseName}

                  </p>



                  <p className="mt-1 truncate text-[10px] text-slate-400">

                    {assigningItem.originalName}

                  </p>

                </div>



                <p className="shrink-0 text-base font-black text-slate-900">

                  ¥{formatMoney(assigningItem.amount)}

                </p>

              </div>

            </div>



            {/* QUICK ACTIONS */}



            {/* QUICK ACTION */}



            <div className="mt-4">

            <button

                type="button"

                onClick={selectAllMembers}

                className="w-full rounded-2xl bg-indigo-50 px-3 py-3 text-[11px] font-bold text-indigo-700 active:scale-[0.99]"

            >

                👥 全員共同

            </button>

            </div>



            {/* MEMBERS */}



            <div className="mt-5">

              <p className="text-xs font-bold text-slate-700">

                負擔這項的人

              </p>



              <p className="mt-1 text-[10px] text-slate-400">

                選 1 人＝個人用品；選多人＝這些人平均分攤。

              </p>

            </div>



            <div className="mt-3 space-y-2">

              {members.map((member) => {

                const selected = draftMemberIds.includes(member.id);



                return (

                  <button

                    key={member.id}

                    type="button"

                    onClick={() => toggleDraftMember(member.id)}

                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 transition ${

                      selected

                        ? "border-slate-900 bg-slate-900 text-white"

                        : "border-slate-200 bg-white text-slate-700"

                    }`}

                  >

                    <span className="text-xs font-bold">

                      {member.isCurrentUser

                        ? `${member.name}（我）`

                        : member.name}

                    </span>



                    <span

                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${

                        selected

                          ? "bg-white text-slate-900"

                          : "border border-slate-300 bg-white"

                      }`}

                    >

                      {selected ? "✓" : ""}

                    </span>

                  </button>

                );

              })}

            </div>



            {/* SAVE */}



            <button

              type="button"

              onClick={saveAssignment}

              disabled={draftMemberIds.length === 0}

              className="mt-5 w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white disabled:bg-slate-300"

            >

              {draftMemberIds.length === 0

                ? "請先選擇負擔人"

                : draftMemberIds.length === 1

                  ? "完成分配"

                  : `完成分配・${draftMemberIds.length} 人共同`}

            </button>

          </div>

        </div>

      )}



      {/* ======================================== */}

      {/* FILE INPUTS */}

      {/* ======================================== */}



      <input

        ref={cameraInputRef}

        type="file"

        accept="image/*"

        capture="environment"

        onChange={handleImage}

        className="hidden"

      />



      <input

        ref={albumInputRef}

        type="file"

        accept="image/*"

        onChange={handleImage}

        className="hidden"

      />

    </main>

  );

}



// ========================================

// HELPERS

// ========================================



function getReceiptCategoryId(
  suggestedCategory: string | undefined,
  categories: ExpenseCategory[]
) {
  const value = suggestedCategory?.trim();

  const aliases: Record<string, string> = {
    飲食: "餐飲",
    餐飲: "餐飲",
    交通: "交通",
    購物: "購物",
    門票: "門票",
    住宿: "住宿",
  };

  const targetName =
    value ? aliases[value] ?? value : "";

  return (
    categories.find(
      (category) => category.name === targetName
    )?.id ??
    categories.find(
      (category) => category.id === "food"
    )?.id ??
    categories[0]?.id ??
    ""
  );
}



function getMemberName(

  memberId: string,

  members: ExpenseMember[]

) {

  const member = members.find(

    (item) => item.id === memberId

  );



  if (!member) {

    return "未知";

  }



  return member.isCurrentUser

    ? `${member.name}（我）`

    : member.name;

}



function getAssignmentLabel(

  item: ReceiptItem,

  members: ExpenseMember[]

) {

  const ids = item.assignment.memberIds;



  if (ids.length === 0) {

    return "⚠️ 尚未分配";

  }



  if (ids.length === 1) {

    return `👤 ${getMemberName(

      ids[0],

      members

    )}`;

  }



  if (ids.length === members.length) {

    return "👥 全員共同";

  }



  if (ids.length === 2) {

    return `👥 ${ids

      .map((id) =>

        getMemberName(

          id,

          members

        )

      )

      .join("、")}`;

  }



  return `👥 ${ids.length} 人共同`;

}



function getMerchantDisplayName(

  merchant: string

) {

  const normalized = merchant

    .trim()

    .toLowerCase();



  if (normalized.includes("セブン")) {

    return "7-ELEVEN";

  }



  if (

    normalized.includes("ファミリーマート") ||

    normalized.includes("familymart")

  ) {

    return "FamilyMart";

  }



  if (

    normalized.includes("ローソン") ||

    normalized.includes("lawson")

  ) {

    return "LAWSON";

  }



  return merchant.trim();

}



function formatMoney(value: number) {

  const rounded = Math.round(value);



  return new Intl.NumberFormat("ja-JP", {

    maximumFractionDigits: 0,

  }).format(rounded);

}