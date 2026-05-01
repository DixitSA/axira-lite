"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export type UploadResult = {
  success: boolean;
  error?: string;
  url?: string;
};

export async function uploadJobPhoto(formData: FormData): Promise<UploadResult> {
  try {
    const { businessId } = await getAuthenticatedUser();
    
    const file = formData.get("file") as File;
    const jobId = Number(formData.get("jobId"));
    const caption = formData.get("caption") as string | null;

    if (!file || isNaN(jobId)) {
      return { success: false, error: "Invalid data" };
    }

    // Verify job belongs to user
    const job = await db.job.findFirst({ where: { id: jobId, businessId } });
    if (!job) return { success: false, error: "Job not found" };

    // Prepare upload directory (public/uploads)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueName = `${jobId}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Read file and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;

    // Save to DB
    await db.jobMedia.create({
      data: {
        jobId,
        url: fileUrl,
        caption: caption || null,
      }
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, url: fileUrl };

  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload file" };
  }
}
