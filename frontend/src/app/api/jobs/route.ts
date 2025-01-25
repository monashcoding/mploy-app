import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

/**
 * @api {get} /api/jobs Get Job Listings
 * @apiName GetJobs
 * @apiGroup Jobs
 * @apiDescription Fetches job listings from the database with optional filtering and pagination
 *
 * @apiQuery {Number} [offset] Number of records to skip (for pagination)
 * @apiQuery {Number} [limit] Maximum number of records to return (for pagination)
 * @apiQuery {Boolean} [outdated=false] Include outdated job listings (default: false)
 * @apiQuery {String} [working_rights] Comma-separated list of working rights to filter by
 * @apiQuery {String} [types] Comma-separated list of job types to filter by
 * @apiQuery {String} [industry_fields] Comma-separated list of industry fields to filter by
 * @apiQuery {String} [keyword] Search keyword to match against job titles or company names
 *
 * @apiSuccess {Object[]} jobs Array of job listings
 * @apiSuccess {String} jobs._id Job ID
 * @apiSuccess {String} jobs.title Job title
 * @apiSuccess {String} jobs.description Job description
 * @apiSuccess {Object} jobs.company Company information
 * @apiSuccess {String} jobs.company.name Company name
 * @apiSuccess {String} jobs.company.website Company website
 * @apiSuccess {String} [jobs.company.logo] URL to company logo
 * @apiSuccess {String} jobs.application_url URL to apply for the job
 * @apiSuccess {String} jobs.type Job type (EOI, FIRST_YEAR, INTERN, GRADUATE)
 * @apiSuccess {String[]} jobs.working_rights List of required working rights
 * @apiSuccess {String[]} jobs.industry_fields List of relevant industry fields
 * @apiSuccess {String} [jobs.close_date] Job closing date (if applicable)
 * @apiSuccess {String[]} jobs.source_urls URLs where the job was sourced from
 * @apiSuccess {Boolean} jobs.outdated Whether the job listing is outdated
 *
 * @apiError (500) InternalServerError Failed to fetch jobs from database
 *
 * @apiExample {curl} Example usage:
 *   curl -X GET "http://localhost:3000/api/jobs?offset=10&limit=20&types=INTERN,GRADUATE&keyword=engineer"
 */
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
