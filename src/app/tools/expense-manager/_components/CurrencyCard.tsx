import { Wallet } from 'lucide-react';
import { CURRENCY_CODES } from 'nhb-toolbox/constants';
import type { CurrencyCode } from 'nhb-toolbox/number/types';
import { useEffect, useState } from 'react';
import type { CurrencyResponse } from '@/app/tools/expense-manager/_components/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useApiMutation } from '@/lib/hooks/use-api';
import type { Uncertain } from '@/types';

type Props = {
    currencyData: Uncertain<CurrencyResponse>;
};

export function CurrencyCard({ currencyData }: Props) {
    const [currencyDraft, setCurrencyDraft] = useState<CurrencyCode>('BDT');

    const { mutate: updateCurrency, isPending: updatingCurrency } = useApiMutation<
        CurrencyResponse,
        CurrencyResponse
    >('/api/tools/expenses/currency', 'PATCH', {
        successMessage: 'Currency preference updated!',
        invalidateKeys: ['expense-summary', 'expense-currency'],
    });

    useEffect(() => {
        if (currencyData?.preferred_currency) {
            setCurrencyDraft(currencyData.preferred_currency);
        }
    }, [currencyData?.preferred_currency]);

    const handleSaveCurrency = () => {
        if (!currencyDraft || currencyDraft === currencyData?.preferred_currency) return;
        updateCurrency({ preferred_currency: currencyDraft });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="size-5" />
                    Currency Preference
                </CardTitle>
                <CardDescription>
                    Choose how all values are displayed across the expense manager.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                    onValueChange={(val) => setCurrencyDraft(val as CurrencyCode)}
                    value={currencyDraft}
                >
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {CURRENCY_CODES.map((item) => (
                            <SelectItem key={item} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    disabled={
                        updatingCurrency || currencyDraft === currencyData?.preferred_currency
                    }
                    loading={updatingCurrency}
                    onClick={handleSaveCurrency}
                >
                    Save Currency
                </Button>
            </CardContent>
        </Card>
    );
}
