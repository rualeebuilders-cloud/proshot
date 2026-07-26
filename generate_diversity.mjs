import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";

fal.config({ credentials: "fcb1af05-85ae-45b6-a8fb-e511542779c3:d252d7dd93a87ba50c70dadc8aa186eb" });

async function main() {
  console.log("Generating casual African American selfie...");
  
  // Step 1: Generate a casual selfie using Flux
  const selfieRes = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: "A casual smartphone selfie of a handsome young African American man in his 20s, wearing a simple gray t-shirt, messy bedroom background, looking directly at the camera, natural skin texture, highly realistic photo, iphone front camera",
      image_size: "portrait_4_3"
    }
  });

  const selfieUrl = selfieRes.data.images[0].url;
  console.log("Selfie URL:", selfieUrl);

  // Download and save before image
  const beforeBuffer = Buffer.from(await (await fetch(selfieUrl)).arrayBuffer());
  fs.writeFileSync(path.join(process.cwd(), "public", "examples", "global_african_american_before.png"), beforeBuffer);
  console.log("Saved global_african_american_before.png");

  // Step 2: Use PuLID to transform into a professional Tech Founder
  console.log("Transforming into Tech Founder...");
  const pulidRes = await fal.subscribe("fal-ai/flux-pulid", {
    input: {
      prompt: "tight close-up modern tech founder headshot, shoulders and head framing, face filling 60% of frame, crisp white collared shirt under navy modern blazer, relaxed confident expression, bright softly blurred tech hub office with glass and green plants, vibrant natural daylighting, high detail, most flattering best-version portrait of the person, vibrant clear skin tone, confident magnetic gaze, bright studio softbox lighting, ultra sharp focus on eyes, 8k resolution studio photography",
      reference_image_url: selfieUrl,
      image_size: "portrait_4_3",
      num_inference_steps: 28,
      guidance_scale: 4.2,
      id_weight: 0.95,
      negative_prompt: "blurry, low quality, distorted face, plastic skin, fake face, extra eyes, asymmetrical face, watermark, text, bad anatomy, over-processed, unflattering shadows, double chin, tired eyes, dark gloomy mood, muddy contrast, pitch black background, pitch black t-shirt, dark underexposed face, muddy dark shadows"
    }
  });

  const afterUrl = pulidRes.data.images[0].url;
  console.log("After URL:", afterUrl);

  // Download and save after image
  const afterBuffer = Buffer.from(await (await fetch(afterUrl)).arrayBuffer());
  fs.writeFileSync(path.join(process.cwd(), "public", "examples", "global_african_american_after.png"), afterBuffer);
  console.log("Saved global_african_american_after.png");
}

main().catch(console.error);
