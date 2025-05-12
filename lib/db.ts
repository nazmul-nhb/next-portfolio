import type { TCollection } from '@/types';
import type { Connection } from 'mongoose';

import mongoose, { model, models, type Model, type Schema } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
	throw new Error('MongoDB Connection URI is Missing!');
}

// Updating the global type for mongoose
declare global {
	var mongoose: {
		conn: Connection | null;
		promise: Promise<Connection> | null;
	};
}

let cached = globalThis.mongoose;

if (!cached) {
	cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<Connection> {
	// If connection is already established, return it
	if (cached.conn) return cached.conn;

	// If no active connection, set up a new one
	if (!cached.promise) {
		cached.promise = mongoose
			.connect(MONGODB_URI, {
				dbName: 'NextPortfolio',
				bufferCommands: false,
			})
			.then((db) => db.connection);
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

/**
 * * Create or get an existing mongoose model safely
 *
 * @param name Collection/Model name.
 * @param schema Mongoose Schema.
 * @returns New model based on the collection name and schema.
 */
export function createModel<T>(name: TCollection, schema: Schema<T>): Model<T> {
	return (models[name] as Model<T>) ?? model<T>(name, schema);
}
