import { MongoClient } from "mongodb";

let dbPromise = null;


export function connectDB() {
  if (!dbPromise) {
    dbPromise = (async () => {
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing. Add it to your .env file.");
      }
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || "helphive");


      await db.collection("joins").createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
      await db.collection("events").createIndex({ eventDate: 1 });

      console.log("MongoDB connected");
      return db;
    })().catch((error) => {
      dbPromise = null; 
      throw error;
    });
  }
  return dbPromise;
}


export async function eventsCollection() {
  return (await connectDB()).collection("events");
}

export async function joinsCollection() {
  return (await connectDB()).collection("joins");
}
