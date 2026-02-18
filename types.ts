export enum MainCategory {
  FOUNDATION = 'تأسيس',
  OPERATION = 'تشغيل',
  MARKETING = 'تسويق'
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  mainCategory: MainCategory;
  subCategory: string;
  date: string; // ISO date string
  note?: string;
}

export interface CategoryStructure {
  [key: string]: string[];
}

// --- Income Types ---

export enum IncomeType {
  SUBSCRIPTION = 'خطط اشتراكية',
  CONTRACT = 'عقود خارجية'
}

export enum SubscriptionPlan {
  MONTHLY = 'شهرية',
  SEMI_ANNUAL = 'نصف سنوية',
  ANNUAL = 'سنوية'
}

export interface IncomeRecord {
  id: string;
  amount: number;
  type: IncomeType;
  detail: string; // Will hold the Plan Name (e.g., 'Monthly') or Contract Name
  date: string;
  note?: string;
}