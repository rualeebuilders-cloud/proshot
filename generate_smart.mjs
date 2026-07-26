import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";

fal.config({ credentials: "fcb1af05-85ae-45b6-a8fb-e511542779c3:d252d7dd93a87ba50c70dadc8aa186eb" });

async function main() {
  console.log("Generating casual selfie (African American male)...");
  
  // Step 1: Generate a casual selfie for Tech Startup
  const selfieRes = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: "A casual smartphone selfie of a handsome young African American man in his early 30s, wearing a simple black hoodie, looking directly at the camera, highly realistic photo, iphone front camera, natural skin texture",
      image_size: "portrait_4_3"
    }
  });

  const selfieUrl = selfieRes.data.images[0].url;
  console.log("Selfie URL:", selfieUrl);

  const beforeBuffer = Buffer.from(await (await fetch(selfieUrl)).arrayBuffer());
  fs.writeFileSync(path.join(process.cwd(), "public", "examples", "global_african_american_before.png"), beforeBuffer);
  console.log("Saved global_african_american_before.png");

  // Step 2: Use PuLID to transform into Tech Startup Founder with advanced prompts
  console.log("Transforming into Tech Startup Founder with new optical prompts...");
  const pulidRes = await fal.subscribe("fal-ai/flux-pulid", {
    input: {
      prompt: "close-up modern tech founder headshot, shoulders and head framing, smart casual dark blazer, no tie, relaxed confident expression, softly blurred modern tech workspace backdrop, professional LinkedIn photo, high detail, most flattering best-version portrait of the person, confident magnetic gaze, sparkling catchlights in eyes, vivid iris detail, subsurface scattering skin physics, dewy healthy skin glow, visible micro pores, perfectly tailored attire, immaculate studio softbox lighting, ultra sharp focus on eyes, 8k resolution studio photography",
      reference_image_url: selfieUrl,
      image_size: "portrait_4_3",
      num_inference_steps: 28,
      guidance_scale: 4.2,
      id_weight: 0.95,
      negative_prompt: "blurry, low quality, distorted face, plastic skin, wax figure, CG render, 3D model, anime, cartoon, heavy airbrushed, fake face, extra eyes, asymmetrical face, watermark, text, bad anatomy, over-processed, unflattering shadows, double chin, tired eyes, dark circles"
    }
  });

  const afterUrl = pulidRes.data.images[0].url;
  console.log("After URL:", afterUrl);

  const afterBuffer = Buffer.from(await (await fetch(afterUrl)).arrayBuffer());
  fs.writeFileSync(path.join(process.cwd(), "public", "examples", "global_african_american_after.png"), afterBuffer);
  console.log("Saved global_african_american_after.png");
}

main().catch(console.error);
