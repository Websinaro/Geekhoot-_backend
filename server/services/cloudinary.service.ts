import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

function configureCloudinary(): boolean {
  if (isConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    isConfigured = true;
    console.log("☁️ Cloudinary system successfully initialized.");
    return true;
  }
  return false;
}

/**
 * Uploads a file to Cloudinary and returns its secure URL.
 * Returns null if Cloudinary is not configured or upload fails.
 */
export async function uploadToCloudinary(filePath: string): Promise<string | null> {
  try {
    const ready = configureCloudinary();
    if (!ready) {
      console.warn("⚠️ Cloudinary credentials missing in env. Falling back to local/default hosting.");
      return null;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "geekhoot",
      resource_type: "auto"
    });

    console.log("✨ Successfully uploaded asset to Cloudinary:", result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error("❌ Cloudinary upload transaction failed:", err);
    return null;
  }
}
