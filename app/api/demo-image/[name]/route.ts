import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const IMAGE_MAP: Record<string, string> = {
  corporate_before: "global_corporate_before",
  corporate_after: "global_corporate_after",
  smart_before: "global_african_american_before",
  smart_after: "global_african_american_after",
  artistic_before: "global_artistic_before",
  artistic_after: "global_artistic_after",
  studio_before: "global_studio_before",
  studio_after: "global_studio_after",
  passport_before: "global_passport_before",
  passport_after: "global_passport_after",
  // Aliases
  before: "global_corporate_before",
  corporate: "global_corporate_after",
  smart: "global_african_american_after",
  artistic: "global_artistic_after",
  studio: "global_studio_after",
  passport: "global_passport_after",
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split("/");
    const name = pathnameParts[pathnameParts.length - 1];

    const prefix = IMAGE_MAP[name];

    if (!prefix) {
      return new Response("Not Found", { status: 404 });
    }

    // 1. Check direct generated artifact paths first for artistic_after
    const brainArtisticPath = "/Users/rua/.gemini/antigravity-ide/brain/9d24812b-a8a9-4cf9-a585-9316698c9970/artistic_natural_instagram_v2_1784973985681.png";
    const localPath = path.join(process.cwd(), "public", "examples", `${prefix}.png`);
    let imageBuffer: Buffer | null = null;

    if (prefix === "global_artistic_after" && fs.existsSync(brainArtisticPath)) {
      imageBuffer = fs.readFileSync(brainArtisticPath);
    } else if (fs.existsSync(localPath)) {
      imageBuffer = fs.readFileSync(localPath);
    } else {
      const dir = "/Users/rua/.gemini/antigravity-ide/brain/42564883-44a2-4622-ae28-ed4412cfac3f";
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const targetFile = files.find((f) => f.startsWith(prefix) && f.endsWith(".png"));
        if (targetFile) {
          imageBuffer = fs.readFileSync(path.join(dir, targetFile));
        }
      }
    }

    if (!imageBuffer) {
      return new Response("Image file not found", { status: 404 });
    }

    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to serve demo image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
