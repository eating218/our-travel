export type MyTravelCard = {
  id: string;

  ownerMemberId: string;

  /**
   * 有 catalogCardId：
   * 代表來自官方卡庫。
   *
   * 沒有：
   * 代表使用者自行建立。
   */
  catalogCardId?: string;

  customIssuer?: string;
  customName?: string;

  /**
   * 出發前已經吃掉同一活動額度的消費。
   */
  preTripSpentTWD: number;

  isActive: boolean;

  createdAt: string;
};


export const initialTravelCreditCards:
  MyTravelCard[] = [];