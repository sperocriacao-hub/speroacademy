import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse("This is a POST-only API endpoint. Please use POST to create a connected account.", { status: 200 });
}

export { POST } from "./route"; // Re-export POST
