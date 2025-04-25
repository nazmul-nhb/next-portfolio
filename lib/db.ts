import type { Connection } from 'mongoose';

import mongoose from 'mongoose';

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
