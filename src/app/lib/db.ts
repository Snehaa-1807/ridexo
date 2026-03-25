import mongoose, { Connection } from "mongoose";

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
  throw new Error("MONGODB_URL is not defined in environment variables");
}

// Use globalThis for safety
let cached = (globalThis as any).mongooseConn;

if (!cached) {
  cached = (globalThis as any).mongooseConn = {
    conn: null,
    promise: null,
  };
}

const connectDb = async (): Promise<Connection> => {
  if (cached.conn) {
    return cached.conn;
  }
 

  cached.promise ??= mongoose.connect(mongodbUrl).then((mongooseInstance) => {
    return mongooseInstance.connection;
  });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error);
    throw error; // IMPORTANT
  }
};

export default connectDb;