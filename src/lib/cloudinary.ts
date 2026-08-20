import { v2 as cloudinary } from "cloudinary";
import { hasCloudinary } from "@/lib/env";

function credentials() {
  const url = process.env.CLOUDINARY_URL ?? "";
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/);
  if (match) {
    return { api_key: match[1], api_secret: match[2], cloud_name: match[3] };
  }
  return {
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

function configure() {
  cloudinary.config({ ...credentials(), secure: true });
}

export type UploadedAsset = {
  url: string;
  publicId: string;
};

export async function uploadImage(input: {
  filePath?: string;
  buffer?: Buffer;
  folder: string;
  filename?: string;
  resourceType?: "image" | "video" | "raw";
  uniqueFilename?: boolean;
  overwrite?: boolean;
}): Promise<UploadedAsset> {
  if (!hasCloudinary()) {
    throw new Error("Cloudinary is not configured");
  }
  configure();
  const options = {
    folder: input.folder,
    resource_type: (input.resourceType ?? "image") as "image" | "video" | "raw",
    use_filename: true,
    unique_filename: input.uniqueFilename ?? true,
    overwrite: input.overwrite ?? false,
    filename_override: input.filename,
  };
  const result = input.filePath
    ? await cloudinary.uploader.upload(input.filePath, options)
    : await new Promise<Awaited<ReturnType<typeof cloudinary.uploader.upload>>>((resolve, reject) => {
        if (!input.buffer) {
          reject(new Error("No image data"));
          return;
        }
        const stream = cloudinary.uploader.upload_stream(options, (error, uploaded) => {
          if (error || !uploaded) reject(error ?? new Error("Upload failed"));
          else resolve(uploaded);
        });
        stream.end(input.buffer);
      });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function destroyImage(publicId?: string, resourceType: "image" | "video" | "raw" = "image") {
  if (!publicId || !hasCloudinary()) return;
  configure();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export async function uploadRawFile(input: {
  buffer: Buffer;
  folder: string;
  filename: string;
}): Promise<UploadedAsset> {
  return uploadImage({
    ...input,
    resourceType: "raw",
    uniqueFilename: false,
    overwrite: true,
  });
}

export function cloudinaryShareUrl(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*w_1200/.test(url)) return url;
  return url.replace("/upload/", "/upload/w_1200,h_630,c_fill,g_auto,q_auto:eco,f_jpg/");
}

/** Greyscale, face-weighted crop for the site-wide social card background. */
export function cloudinaryOgPortraitUrl(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*e_grayscale/.test(url)) return url;
  return url.replace(
    "/upload/",
    "/upload/e_grayscale,e_contrast:22,e_brightness:-6,c_fill,g_face,w_1200,h_630,q_auto:good,f_jpg/",
  );
}
