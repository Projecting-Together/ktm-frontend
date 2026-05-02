export interface RentStatusRow {
  label: string;
  status: string;
  tone: "positive" | "neutral" | "warning" | "negative";
}

export interface RentDetailRow {
  key: string;
  value: string;
}

export const MISSING_DETAIL_TEXT = "Ask owner for this detail";
