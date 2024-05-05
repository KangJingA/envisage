import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_NAME = process.env.MONGODB_NAME;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Note: NextJS is stateless so each action require connection to the DB
// caching can be used
// singleton
declare module NodeJS {
    interface Global {
        mongoose: MongooseConnection;
    }
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null,
    };
}

export const getConnection = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URL) throw new Error("Missing MONGODB_URL");

    cached.promise =
        cached.promise ||
        mongoose.connect(MONGODB_URL, { dbName: MONGODB_NAME, bufferCommands: false });

    cached.conn = await cached.promise

    return cached.conn
};
