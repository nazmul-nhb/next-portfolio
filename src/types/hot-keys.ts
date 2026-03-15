/**
 * Canonical modifier names that map to KeyboardEvent properties.
 */
export type CanonicalModifier = 'Control' | 'Shift' | 'Alt' | 'Meta';
/**
 * Letter keys A-Z (case-insensitive in matching).
 */
export type LetterKey =
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q'
    | 'R'
    | 'S'
    | 'T'
    | 'U'
    | 'V'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z';
/**
 * Number keys 0-9.
 */
export type NumberKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
/**
 * Function keys F1-F12.
 */
export type FunctionKey =
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12';
/**
 * Navigation keys for cursor movement.
 */
export type NavigationKey =
    | 'ArrowUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Home'
    | 'End'
    | 'PageUp'
    | 'PageDown';
/**
 * Editing and special keys.
 */
export type EditingKey = ' ' | 'Enter' | 'Escape' | 'Tab' | 'Backspace' | 'Delete';
/**
 * Punctuation keys commonly used in keyboard shortcuts.
 * These are the literal characters as they appear in KeyboardEvent.key
 * (layout-dependent, typically US keyboard layout).
 */
export type PunctuationKey = '/' | '[' | ']' | '\\' | '=' | '-' | ',' | '.' | '`';
/**
 * Keys that don't change their value when Shift is pressed.
 * These keys produce the same `KeyboardEvent.key` value whether Shift is held or not.
 *
 * Excludes NumberKey (Shift+1 produces '!' on US layout) and PunctuationKey
 * (Shift+',' produces '<' on US layout).
 *
 * Used in hotkey type definitions to prevent layout-dependent issues when Shift
 * is part of the modifier combination.
 */
export type NonPunctuationKey =
    | LetterKey
    | NumberKey
    | EditingKey
    | NavigationKey
    | FunctionKey;
/**
 * All supported non-modifier keys.
 */
export type Key = NonPunctuationKey | PunctuationKey;
/**
 * Keys that can be tracked as "held" (pressed down).
 * Includes both modifier keys and regular keys.
 */
export type HeldKey = CanonicalModifier | Key;

export type TypedKeyboardEvent<T = Element> = Omit<React.KeyboardEvent<T>, 'key'> & {
    key: HeldKey;
};
