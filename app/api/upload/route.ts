import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "zyre_link";

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Convert file to buffer then base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: "image",
      transformation: folder.includes("cover")
        ? [{ width: 1200, height: 400, crop: "fill", quality: "auto" }]
        : [{ width: 400, height: 400, crop: "fill", quality: "auto", gravity: "face" }],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
