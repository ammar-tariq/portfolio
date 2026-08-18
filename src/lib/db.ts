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
    cached.promise = mongoose.connect(uri).then((instance) => instance);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
