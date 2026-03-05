import { CalendarDays, HandCoins, Landmark, ReceiptText } from 'lucide-react';
import { formatDate } from 'nhb-toolbox';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { LoanItem } from '@/types/expenses';
import { ReceiptGallery } from './ReceiptGallery';

type LoansSectionProps = {
    borrowedLoans: LoanItem[];
    lentLoans: LoanItem[];
    money: (value: number) => string;
    onAddPayment: (loan: LoanItem) => void;
    onSettleLoan: (loan: LoanItem) => void;
    onDeleteLoan: (loan: LoanItem) => void;
};

export function LoansSection({
    borrowedLoans,
    lentLoans,
    money,
    onAddPayment,
    onDeleteLoan,
    onSettleLoan,
}: LoansSectionProps) {
    return (
        <section className="grid gap-4 lg:grid-cols-2">
            <LoanColumn
                emptyMessage="No borrowed loans yet."
                money={money}
                onAddPayment={onAddPayment}
                onDeleteLoan={onDeleteLoan}
                onSettleLoan={onSettleLoan}
                title="Borrowed Loans"
                type="borrowed"
                values={borrowedLoans}
            />
            <LoanColumn
                emptyMessage="No lent loans yet."
                money={money}
                onAddPayment={onAddPayment}
                onDeleteLoan={onDeleteLoan}
                onSettleLoan={onSettleLoan}
                title="Lent Loans"
                type="lent"
                values={lentLoans}
            />
        </section>
    );
}

type LoanColumnProps = {
    title: string;
    type: 'borrowed' | 'lent';
    values: LoanItem[];
    emptyMessage: string;
    money: (value: number) => string;
    onAddPayment: (loan: LoanItem) => void;
    onSettleLoan: (loan: LoanItem) => void;
    onDeleteLoan: (loan: LoanItem) => void;
};

function LoanColumn({
    emptyMessage,
    money,
    onAddPayment,
    onDeleteLoan,
    onSettleLoan,
    title,
    type,
    values,
}: LoanColumnProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {type === 'borrowed' ? (
                        <Landmark className="size-5" />
                    ) : (
                        <HandCoins className="size-5" />
                    )}
                    {title}
                </CardTitle>
                <CardDescription>
                    {type === 'borrowed'
                        ? 'Money you borrowed and need to repay.'
                        : 'Money you lent out and expect back.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {values.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                ) : (
                    <div className="space-y-3">
                        {values.map((loan) => (
                            <div
                                className="rounded-lg border border-border/60 bg-muted/20 p-3"
                                key={loan.id}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{loan.title}</p>
                                        {loan.counterparty && (
                                            <p className="text-xs text-muted-foreground">
                                                {loan.counterparty}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            loan.status === 'settled'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}
                                    >
                                        {loan.status}
                                    </span>
                                </div>
                                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                                    <InfoRow
                                        label="Principal"
                                        value={money(loan.principal_amount)}
                                    />
                                    <InfoRow label="Paid" value={money(loan.paid_amount)} />
                                    <InfoRow
                                        label="Remaining"
                                        value={money(loan.remaining_amount)}
                                    />
                                    <InfoRow
                                        label="Date"
                                        value={formatDate({
                                            date: loan.start_date,
                                            format: 'mmm DD, yyyy hh:mm a',
                                        })}
                                    />
                                </div>
                                <div className="mt-3">
                                    {loan.receipts.length > 0 && (
                                        <ReceiptGallery
                                            maxPreview={8}
                                            receipts={loan.receipts.map(
                                                (item) => item.image_url
                                            )}
                                        />
                                    )}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {loan.status !== 'settled' && (
                                        <>
                                            <Button
                                                onClick={() => onAddPayment(loan)}
                                                size="sm"
                                                variant="outline"
                                            >
                                                <ReceiptText className="size-4" />
                                                Add Repayment
                                            </Button>
                                            <Button
                                                onClick={() => onSettleLoan(loan)}
                                                size="sm"
                                                variant="outline"
                                            >
                                                Settle
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        onClick={() => onDeleteLoan(loan)}
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <p className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground/90">{label}:</span>
            {value}
        </p>
    );
}
