import { Wallet } from 'lucide-react';
import { CURRENCY_CODES } from 'nhb-toolbox/constants';
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

type CurrencyPreferenceCardProps = {
    currencyDraft: string;
    preferredCurrency?: string;
    updatingCurrency: boolean;
    setCurrencyDraft: (value: string) => void;
    onSave: () => void;
};

export function CurrencyPreferenceCard({
    currencyDraft,
    onSave,
    preferredCurrency,
    setCurrencyDraft,
    updatingCurrency,
}: CurrencyPreferenceCardProps) {
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
                <Select onValueChange={setCurrencyDraft} value={currencyDraft}>
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
                    disabled={updatingCurrency || currencyDraft === preferredCurrency}
                    loading={updatingCurrency}
                    onClick={onSave}
                >
                    Save Currency
                </Button>
            </CardContent>
        </Card>
    );
}
