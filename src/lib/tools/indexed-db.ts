import {
    type $UUID,
    column,
    defineSchema,
    type InferInsertType,
    type InferSelectType,
    Locality,
} from 'locality-idb';
import type { PhotoCardConfig } from '../photo-card/types';
import type { ResumeConfig } from '../resume-builder/types';

const dbSchema = defineSchema({
    photo_cards: {
        id: column.uuid().pk(),
        createdAt: column.timestamp().index(),
        config: column.object<PhotoCardConfig>(),
        previewBlob: column.custom<Blob>(),
    },
    resumes: {
        id: column.uuid().pk(),
        name: column.text(),
        createdAt: column.timestamp().index(),
        updatedAt: column.timestamp().index(),
        config: column.object<ResumeConfig>(),
    },
});

export type SavedPhotoCard = InferSelectType<typeof dbSchema.photo_cards>;
type SavedPhotoCardInsert = InferInsertType<typeof dbSchema.photo_cards>;

export type SavedResumeData = InferSelectType<typeof dbSchema.resumes>;
type SavedResumeInsert = InferInsertType<typeof dbSchema.resumes>;

function createDB() {
    return new Locality({
        dbName: 'nazmul-nhb.dev',
        version: 2,
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

// Resume functions
export async function listSavedResumes() {
    const db = await ready();

    return db.from('resumes').sortByIndex('updatedAt', 'desc').findAll();
}

export async function saveResume(values: Omit<SavedResumeInsert, 'id'>) {
    const db = await ready();

    return db
        .insert('resumes')
        .values({
            name: values.name,
            config: values.config,
        })
        .run();
}

export async function updateResume(id: $UUID, values: Omit<SavedResumeInsert, 'id'>) {
    const db = await ready();

    return db
        .update('resumes')
        .set({
            name: values.name,
            config: values.config,
        })
        .where((row) => row.id === id)
        .run();
}

export async function getSavedResume(id: $UUID) {
    const db = await ready();

    return db
        .from('resumes')
        .where((row) => row.id === id)
        .findAll()
        .then((rows) => rows[0]);
}

export async function deleteSavedResume(id: $UUID) {
    const db = await ready();

    return db
        .delete('resumes')
        .where((row) => row.id === id)
        .run();
}
