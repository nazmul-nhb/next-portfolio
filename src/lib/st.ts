/**
 * Storage backend type.
 */
export type StorageType = 'local' | 'session';

/**
 * Configuration options for WebStorage.
 */
export interface StorageOptions<T, Key extends string> {
    /**
     * Allowed keys for this storage instance.
     */
    keys: readonly Key[];

    /**
     * Function to serialize values before storing.
     */
    serialize?: (value: T) => string;

    /**
     * Function to deserialize stored values.
     */
    deserialize?: (value: string) => T;
}

/**
 * A fully type-safe and runtime-safe storage manager with builder pattern support.
 *
 * - Enforces declared keys.
 * - Tracks which keys have been written.
 * - Disallows `.get(key)` before `.set(key)`.
 * - Allows chaining.
 */
export class WebStorage<T, DeclaredKey extends string, WrittenKey extends string = never> {
    #storageType: StorageType = 'local';
    #storage: Storage = localStorage;
    #serialize: (value: T) => string = JSON.stringify;
    #deserialize: (value: string) => T = JSON.parse;
    #declaredKeys: Set<DeclaredKey>;
    #writtenKeys: Set<WrittenKey>;

    writtenKeys: WrittenKey[];

    constructor(type?: StorageType, options?: StorageOptions<T, DeclaredKey>) {
        this.#storage = window[`${type ?? 'local'}Storage`];
        this.#serialize = options?.serialize ?? JSON.stringify;
        this.#deserialize = options?.deserialize ?? JSON.parse;

        this.#declaredKeys = new Set(options?.keys);
        this.#writtenKeys = new Set();

        this.writtenKeys = [...this.#writtenKeys];
    }

    /**
     * Reconfigures the storage with a new set of allowed keys.
     */
    configure<N, NewKey extends string>(
        options: StorageOptions<N, NewKey>
    ): WebStorage<N, NewKey, WrittenKey> {
        this.#serialize = options?.serialize ?? JSON.stringify;
        this.#deserialize = options?.deserialize ?? JSON.parse;

        this.#declaredKeys = new Set([
            ...this.#declaredKeys,
            ...(options?.keys as unknown as DeclaredKey[]),
        ]);

        return this as unknown as WebStorage<N, NewKey, WrittenKey>;
    }

    /**
     * Reads a previously written key.
     *
     * Throws at runtime if the key is not written.
     */
    get(key: WrittenKey): T | null {
        if (!this.#writtenKeys.has(key)) {
            console.warn(
                `A read operation was attempted for a key that has not been written: ${key}`
            );
            return null;
        }

        const data = this.#storage.getItem(key);
        if (data === null) {
            console.warn(`Stored value missing for key: ${key}`);
            return null;
        }

        return this.#deserialize(data);
    }

    /**
     * Writes a value to a declared key.
     */
    set<N, KeyToWrite extends DeclaredKey>(
        value: N,
        key: KeyToWrite
    ): WebStorage<N, DeclaredKey, WrittenKey | KeyToWrite> {
        if (!this.#declaredKeys.has(key)) {
            console.warn(`Attempted to write to an undeclared key: ${key}`);
            return this as unknown as WebStorage<N, DeclaredKey, WrittenKey | KeyToWrite>;
        }

        this.#storage.setItem(key, this.#serialize(value as unknown as T));

        const next = new WebStorage<T, DeclaredKey, WrittenKey | KeyToWrite>(
            this.#storageType,
            {
                keys: [...this.#declaredKeys],
                serialize: this.#serialize,
                deserialize: this.#deserialize,
            }
        );

        for (const k of this.#writtenKeys) next.#writtenKeys.add(k);

        next.#writtenKeys.add(key);

        return next as unknown as WebStorage<N, DeclaredKey, WrittenKey | KeyToWrite>;
    }

    /**
     * Removes a key (must have been written).
     * @param key
     */
    remove(key: WrittenKey): void {
        this.#storage.removeItem(key);
        this.#writtenKeys.delete(key);
    }

    /**
     * Clears the entire storage for the current instance.
     */
    clear(): void {
        // this.#storage.clear();
        for (const key of this.#writtenKeys) {
            this.#storage.removeItem(key);
        }
        this.#writtenKeys.clear();
    }
}

export const st = new WebStorage('local', { keys: ['age', 'name'] });

const st2 = st.set(99, 'age'); // ok
st2.get('age'); // ok

// st2.get('name'); // ❌ type error (not written)
// // ❌ runtime error if forced

// const st3 = st.set({ hello: 'world' }, 'name').set(42, 'age');
// st3.get('name'); // ok (now written)

// const st4 =  st3.configure({ keys: ['hello', 'bello'] }).set('lll', 'hello');
// // ❌ type error (bello is never written)
// // ❌ runtime error if bypassed

// st3.clear();

// st4.configure({keys: ['new']}).set('bbb', 'new')
