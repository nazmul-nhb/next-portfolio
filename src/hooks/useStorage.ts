import { useCallback, useEffect, useState } from 'react';

export type StorageType = 'local' | 'session';

export interface StorageOptions<T, Key extends string> {
    /**
     * Allowed keys for this storage instance.
     */
    keys: Readonly<Array<Key>>;

    initialValue: T;

    /**
     * Storage type to use.
     */
    type?: StorageType;

    /**
     * Value serializer.
     */
    serialize?: (value: T) => string;

    /**
     * Value deserializer.
     */
    deserialize?: (value: string) => T;
}

/**
 * A safe storage hook for Next.js that never accesses storage during SSR.
 */
export function useStorage<T, Key extends string>(options: StorageOptions<T, Key>) {
    const {
        keys = [],
        initialValue = null,
        type = 'local',
        serialize = JSON.stringify,
        deserialize = JSON.parse,
    } = options;

    /** Track key safely */
    const [key, setKey] = useState(keys[0] ?? '');

    /** Track value */
    const [value, setValue] = useState<T | null>(initialValue);

    /** Track if storage is available (client phase) */
    const [isReady, setIsReady] = useState(false);

    const getStorage = useCallback(() => {
        if (!isReady) return null;
        return window[`${type ?? 'local'}Storage`];
    }, [isReady, type]);

    /** Mark hook as client-ready */
    useEffect(() => {
        setIsReady(true);
    }, []);

    /** Load the value once key or client readiness changes */
    useEffect(() => {
        if (!isReady || !key) return;

        const storage = getStorage();
        if (!storage) return;

        const item = storage.getItem(key);
        setValue(item ? deserialize(item) : null);
    }, [isReady, key, deserialize, getStorage]);

    /** Set item */
    const setItem = useCallback(
        (newKey: Key, newValue: T) => {
            const storage = getStorage();
            if (!storage) return;

            storage.setItem(newKey, serialize(newValue));
            setKey(newKey);
            setValue(newValue);
        },
        [getStorage, serialize]
    );

    /** Remove item */
    const removeItem = useCallback(
        (removeKey: Key) => {
            const storage = getStorage();
            if (!storage) return;
            storage.removeItem(removeKey);
            setValue(null);
        },
        [getStorage]
    );

    return {
        isReady,
        key,
        value,
        set: setItem,
        remove: removeItem,
    };
}
