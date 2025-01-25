import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset")
    ? parseInt(searchParams.get("offset")!, 10)
    : undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : undefined;
  const outdated = searchParams.get("outdated") === "true";

  // Working Rights Filter
  const working_rights = searchParams
    .get("working_rights")
    ?.split(",")
    .map((right) => right.toUpperCase()) as string[];

  // Type Filter
  const types = searchParams
    .get("types")
    ?.split(",")
    .map((type) => type.toUpperCase()) as string[];

  // Industry Field Filter
  const industry_fields = searchParams
    .get("industry_fields")
    ?.split(",")
    .map((field) => field.toUpperCase()) as string[];

  // Keyword Search
  const keyword = searchParams.get("keyword")?.toLowerCase();

  const client = new MongoClient(process.env.MONGODB_URI ?? "");

  // Uncomment for logging
  // console.log("type", types);
  // console.log("industry_fields", industry_fields);
  // console.log("working_rights", working_rights);
  // console.log("keyword", keyword);
  // console.log("offset", offset);
  // console.log("limit", limit);
  // console.log("outdated", outdated);

  try {
    await client.connect();
    const database = client.db("default");
    const collection = database.collection("active_jobs");

    const query: {
      outdated?: boolean;
      working_rights?: { $in: string[] };
      type?: { $in: string[] };
      industry_field?: { $in: string[] };
      $or?: {
        title?: {
          $regex: string;
          $options: string;
        };
        "company.name"?: { $regex: string; $options: string };
      }[];
    } = outdated ? {} : { outdated: false };

    if (working_rights?.length) {
      query.working_rights = { $in: working_rights };
    }

    if (types?.length) {
      query.type = { $in: types };
    }

    if (industry_fields?.length) {
      query.industry_field = { $in: industry_fields };
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { "company.name": { $regex: keyword, $options: "i" } },
      ];
    }
    let cursor = collection.find(query);

    if (offset !== undefined) {
      cursor = cursor.skip(offset);
    }

    if (limit !== undefined) {
      cursor = cursor.limit(limit);
    }

    const allData = await cursor.toArray();

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
