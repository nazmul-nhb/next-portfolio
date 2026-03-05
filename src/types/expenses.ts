import type {
    expenseTypeEnum,
    loanPayments,
    loans,
    loanStatusEnum,
    loanTypeEnum,
    receipts,
    expenses as expenseEntries,
} from '@/lib/drizzle/schema/expenses';

export type ExpenseType = (typeof expenseTypeEnum.enumValues)[number];
export type LoanType = (typeof loanTypeEnum.enumValues)[number];
export type LoanStatus = (typeof loanStatusEnum.enumValues)[number];

export type SelectExpense = typeof expenseEntries.$inferSelect;
export type InsertExpense = Omit<
    typeof expenseEntries.$inferInsert,
    'id' | 'created_at' | 'updated_at'
>;

export type SelectLoan = typeof loans.$inferSelect;
export type InsertLoan = Omit<typeof loans.$inferInsert, 'id' | 'created_at' | 'updated_at'>;

export type SelectLoanPayment = typeof loanPayments.$inferSelect;
export type InsertLoanPayment = Omit<typeof loanPayments.$inferInsert, 'id' | 'created_at'>;

export type SelectReceipt = typeof receipts.$inferSelect;
export type InsertReceipt = Omit<typeof receipts.$inferInsert, 'id' | 'created_at'>;

export interface ExpenseItem extends SelectExpense {
    receipts: SelectReceipt[];
}

export interface LoanItem extends SelectLoan {
    remaining_amount: number;
    payments_count: number;
}

export interface PaginatedExpenses {
    entries: ExpenseItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ExpenseSummary {
    currency: string;
    total_income: number;
    total_expense: number;
    borrowed_outstanding: number;
    lent_outstanding: number;
    active_borrowed_count: number;
    active_lent_count: number;
    net_balance: number;
}
