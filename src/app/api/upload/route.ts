import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";
import { processFile, generateUniqueFilename } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const fileName = file.name.toLowerCase();
    const isValidType =
      allowedTypes.includes(file.type) ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".docx");

    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a .txt or .docx file." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Extract text content from file
    const textContent = await processFile(file);

    if (!textContent.trim()) {
      return NextResponse.json(
        { error: "File appears to be empty or could not be processed." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory already exists
    }

    // Save file locally
    const filePath = join(uploadsDir, uniqueFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Connect to MongoDB and save metadata
    await connectDB();
    const document = new DocumentModel({
      filename: uniqueFilename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      filePath: filePath,
      uploadedAt: new Date(),
    });

    const savedDoc = await document.save();

    return NextResponse.json({
      success: true,
      documentId: savedDoc._id.toString(),
      fileName: file.name,
      fileSize: file.size,
      textContent: textContent,
      filePath: filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
