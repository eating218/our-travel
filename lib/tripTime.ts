// ========================================
// APP TIME
// ========================================

// true  = 使用測試時間
// false = 使用真實時間
const TEST_MODE = true;


// 測試用時間
const TEST_DATE =
  "2027-03-05T12:20:00";


export function getAppNow() {
  if (TEST_MODE) {
    return new Date(TEST_DATE);
  }

  return new Date();
}