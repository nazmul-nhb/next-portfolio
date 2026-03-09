import {
    type $UUID,
    column,
    defineSchema,
    type InferInsertType,
    type InferSelectType,
    Locality,
} from 'locality-idb';
import type { PhotoCardConfig } from './photo-card/types';

const dbSchema = defineSchema({
    photo_cards: {
        id: column.uuid().pk(),
        createdAt: column.timestamp().index(),
        config: column.object<PhotoCardConfig>(),
        previewBlob: column.custom<Blob>(),
    },
    resume: {
        id: column.int().pk(),
        createdAt: column.timestamp(),
    },
});

export type SavedPhotoCard = InferSelectType<typeof dbSchema.photo_cards>;
type SavedPhotoCardInsert = InferInsertType<typeof dbSchema.photo_cards>;

function createDB() {
    return new Locality({
        dbName: 'nazmul-nhb.dev',
        version: 1,
        schema: dbSchema,
    });
}

let nhbDb: ReturnType<typeof createDB> | null = null;

function getDB() {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        throw new Error('IndexedDB is only available in the browser.');
    }

    const db = nhbDb ?? createDB();

    nhbDb = db;

    return db;
}

async function ready() {
    const db = getDB();

    await db.ready();

    return db;
}

export async function listSavedPhotoCards() {
    const db = await ready();

    return db.from('photo_cards').sortByIndex('createdAt', 'desc').findAll();
}

export async function savePhotoCard(
    values: Pick<SavedPhotoCardInsert, 'config' | 'previewBlob'>
) {
    const db = await ready();

    return db
        .insert('photo_cards')
        .values({
            config: values.config,
            previewBlob: values.previewBlob,
        })
        .run();
}

export async function deleteSavedPhotoCard(id: $UUID) {
    const db = await ready();

    return db
        .delete('photo_cards')
        .where((row) => row.id === id)
        .run();
}
