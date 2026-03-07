import {
    column,
    defineSchema,
    type InferInsertType,
    type InferSelectType,
    Locality,
} from 'locality-idb';
import type { PhotoCardConfig } from './types';

const photoCardSchema = defineSchema({
    photo_cards: {
        id: column.uuid().pk(),
        createdAt: column.timestamp().index(),
        config: column.object<PhotoCardConfig>(),
        previewBlob: column.custom<Blob>(),
    },
});

export type SavedPhotoCard = InferSelectType<typeof photoCardSchema.photo_cards>;
type SavedPhotoCardInsert = InferInsertType<typeof photoCardSchema.photo_cards>;

function createPhotoCardDb() {
    return new Locality({
        dbName: 'nhb-photo-card-db',
        version: 1,
        schema: photoCardSchema,
    });
}

let photoCardDb: ReturnType<typeof createPhotoCardDb> | null = null;

function getPhotoCardDb() {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        throw new Error('IndexedDB is only available in the browser.');
    }

    const db = photoCardDb ?? createPhotoCardDb();

    photoCardDb = db;

    return db;
}

async function ready() {
    const db = getPhotoCardDb();

    await db.ready();

    return db;
}

export async function listSavedPhotoCards() {
    const db = await ready();

    return db.from('photo_cards').orderBy('createdAt', 'desc').findAll();
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

export async function deleteSavedPhotoCard(id: SavedPhotoCard['id']) {
    const db = await ready();

    return db
        .delete('photo_cards')
        .where((row) => row.id === id)
        .run();
}
