import { isNumber } from 'nhb-toolbox';
import type { CurrencyCode } from 'nhb-toolbox/number/types';

export const MONEY_SCALE = 100;

/**
 * Converts a decimal amount string/number to minor units.
 * Example: 12.5 -> 1250
 */
export function toMinorUnits(value: number | string) {
    const normalized = isNumber(value) ? value : Number.parseFloat(value);
    return Math.round(normalized * MONEY_SCALE);
}

/** Converts minor units to a decimal display value. */
export function fromMinorUnits(value: number) {
    return value / MONEY_SCALE;
}

/** Formats a minor-unit amount using Intl currency formatting. */
export function formatMoney(value: number, currency: CurrencyCode, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(fromMinorUnits(value));
}

/** Builds a value compatible with `<input type="datetime-local" />`. */
export function getCurrentDateTimeLocal(date = new Date()) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const local = new Date(date.getTime() - offsetMs);
    return local.toISOString().slice(0, 16);
}

export type BalanceOptions = {
    total_income: number;
    total_expense: number;
    borrowed_outstanding: number;
    lent_outstanding: number;
};

/**
 * Calculates cash-in-hand based on expense + loan movement.
 * borrowed_outstanding = borrowed principal - borrowed repayments
 * lent_outstanding = lent principal - lent repayments
 */
export function calculateNetBalance(options: BalanceOptions) {
    return (
        options.total_income -
        options.total_expense +
        options.borrowed_outstanding -
        options.lent_outstanding
    );
}
