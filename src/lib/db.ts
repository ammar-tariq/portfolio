import mongoose from "mongoose";

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongo = globalThis as typeof globalThis & { __mongoose?: Cached };

function cache(): Cached {
  if (!globalForMongo.__mongoose) {
    globalForMongo.__mongoose = { conn: null, promise: null };
  }
  return globalForMongo.__mongoose;
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  const cached = cache();
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Fail fast (5s instead of the 30s driver default) so pages fall back to
    // static content quickly when Mongo is unreachable.
    cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).catch((error) => {
      // Never cache a rejected promise: clearing it lets the next request
      // retry, instead of failing every request until the process restarts.
      cached.promise = null;
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
