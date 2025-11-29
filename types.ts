export enum TicketType {
  STANDARD = 'Standard',
  SYNDICATE = 'Syndicate',
  BUNDLE = 'Bundle'
}

export interface LotteryLine {
  id: string;
  mainNumbers: number[];
  powerNumber: number | null;
  isQuickPick: boolean;
}

export interface LotteryGame {
  id: string;
  name: string;
  jackpot: string;
  nextDraw: string;
  logoColor: string;
  accentColor: string;
  isFavorite?: boolean;
}

export enum AppView {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  GAME_DETAILS = 'GAME_DETAILS', // Also acts as Checkout/Number Selection
  PAYMENT = 'PAYMENT',
  SUCCESS = 'SUCCESS',
  MY_TICKETS = 'MY_TICKETS',
  RESULTS = 'RESULTS',
  PROFILE = 'PROFILE',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  ADMIN_BANNERS = 'ADMIN_BANNERS',
  ADMIN_PANEL = 'ADMIN_PANEL'
}

export type TicketStatus = 'PENDING' | 'PURCHASED' | 'SCANNED' | 'WIN' | 'LOSE';

export interface PurchasedTicket {
  id: string;
  gameId: string;
  gameName: string;
  drawDate: string;
  status: TicketStatus;
  lines: LotteryLine[];
  totalAmount: string;
  purchaseDate: string;
  scannedImageUrl?: string;
}