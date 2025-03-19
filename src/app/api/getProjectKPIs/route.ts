import { createClient } from "@/utils/supabase/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const body = await req.json();
        const { projectID, userID } = body;

        // Validate the request data
        if (!projectID || !userID) {
            return NextResponse.json(
                { success: false, error: "ProjectID and UserID Required" },
                { status: 400 }
            );
        }

        // TODO ADD BACK LATER
        // // Create Supabase Client
        // const supabase = await createClient();

        // const { data: sessionData, error: sessionError } = await supabase.auth.getUser();

        // if (sessionError) {
        //   return NextResponse.json(
        //     { success: false, error: sessionError.message },
        //     { status: 500 }
        //   );
        // }

        // // Check if user is authenticated
        // if (!sessionData.user) {
        //   return NextResponse.json(
        //     { success: false, error: "User is not authenticated" },
        //     { status: 401 }
        //   );
        // }

        // Get Data from AWS S3
        const s3 = new S3Client({
            region: process.env.AWS_BUCKET_REGION!,
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
            },
        });
        const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `projects/${userID}/${projectID}/kpiData.json`,
        });

        const { Body } = await s3.send(getObjectCommand);

        const data = await Body!.transformToString().then((data) => JSON.parse(data));

        // Return success response
        return NextResponse.json(
            {
                success: true,
                responses: data,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process request" },
            { status: 500 }
        );
    }
}