export const MONEY_SCALE = 100;

/**
 * Converts a decimal amount string/number to minor units.
 * Example: 12.5 -> 1250
 */
export function toMinorUnits(value: number | string) {
    const normalized = typeof value === 'number' ? value : Number.parseFloat(value);
    return Math.round(normalized * MONEY_SCALE);
}

/** Converts minor units to a decimal display value. */
export function fromMinorUnits(value: number) {
    return value / MONEY_SCALE;
}

/** Formats a minor-unit amount using Intl currency formatting. */
export function formatMoney(value: number, currency: string, locale = 'en-US') {
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

/**
 * Calculates cash-in-hand based on expense + loan movement.
 * borrowed_outstanding = borrowed principal - borrowed repayments
 * lent_outstanding = lent principal - lent repayments
 */
export function calculateNetBalance(params: {
    total_income: number;
    total_expense: number;
    borrowed_outstanding: number;
    lent_outstanding: number;
}) {
    return (
        params.total_income -
        params.total_expense +
        params.borrowed_outstanding -
        params.lent_outstanding
    );
}
