import { useCallback, useEffect, useState } from 'react';

export type StorageType = 'local' | 'session';

export interface StorageOptions<T, Key extends string> {
    /**
     * Allowed keys for this storage instance.
     */
    key?: Key;

    initialValue?: T;

    /**
     * Storage type to use.
     */
    type?: StorageType;

    /**
     * Value serializer.
     */
    serialize?: (value: T) => string | undefined;

    /**
     * Value deserializer.
     */
    deserialize?: (value: string) => T | undefined;
}

/**
 * A safe storage hook for Next.js that never accesses storage during SSR.
 */
export function useStorage<T, Key extends string>(options: StorageOptions<T, Key>) {
    const {
        key = 'nhb-hooks-use-storage',
        initialValue = null,
        type = 'local',
        serialize = JSON.stringify,
        deserialize = JSON.parse,
    } = options ?? {};

    /** Track value */
    const [value, setValue] = useState<T | null>(initialValue);

    /** Track if storage is available (client phase) */
    const [isReady, setIsReady] = useState(false);

    const getStorage = useCallback(() => {
        if (!isReady) return null;
        return window[`${type}Storage`];
    }, [isReady, type]);

    /** Mark hook as client-ready */
    useEffect(() => {
        setTimeout(() => {
            setIsReady(true);
        }, 0);
    }, []);

    /** Load the value once key or client readiness changes */
    useEffect(() => {
        if (!isReady || !key) return;

        const storage = getStorage();
        if (!storage) return;

        const item = storage.getItem(key);
        setTimeout(() => {
            setValue(item ? deserialize(item) : null);
        }, 0);
    }, [isReady, key, deserialize, getStorage]);

    /** Set item */
    const setItem = useCallback(
        (newValue: T) => {
            const storage = getStorage();
            if (!storage) return;

            storage.setItem(key, serialize(newValue) ?? '');
            setValue(newValue);
        },
        [getStorage, serialize, key]
    );

    const clearItem = useCallback(() => {
        const storage = getStorage();
        if (!storage) return;

        storage.clear();
    }, [getStorage]);

    /** Remove item */
    const removeItem = useCallback(() => {
        const storage = getStorage();
        if (!storage) return;
        storage.removeItem(key);
        setValue(null);
    }, [getStorage, key]);

    const getItem = (): T | null => {
        const storage = getStorage();
        if (!storage) return null;
        const item = storage.getItem(key);
        return item ? deserialize(item) : null;
    };

    return {
        value,
        get: getItem,
        set: setItem,
        remove: removeItem,
        clear: clearItem,
    };
}
