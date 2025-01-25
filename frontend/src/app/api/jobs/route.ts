import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const client = new MongoClient(process.env.MONGODB_URI ?? "");

  try {
    await client.connect();

    // Choose a name for your database
    const database = client.db("default");

    // Choose a name for your collection
    const collection = database.collection("active_jobs");
    const allData = await collection.find({}).toArray();

    return NextResponse.json(allData, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  } finally {
    await client.close();
  }
}
