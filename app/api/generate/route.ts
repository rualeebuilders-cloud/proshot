import { fal } from "@fal-ai/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";      // 필수: Buffer + @fal-ai/client 사용
export const maxDuration = 60;

const VARIANT_PROMPTS: Record<string, { v1: string; v2: string }> = {
  realtor_sales: {
    v1: "professional real estate agent headshot, confident friendly smile, dark navy tailored blazer, bright clean modern office background, soft warm lighting, sharp focus, 8k resolution",
    v2: "professional real estate agent headshot, radiant warm smile, elegant beige or light blazer, luxury bright interior background, natural window daylight, 8k resolution",
  },
  tech_startup: {
    v1: "modern tech founder headshot, smart casual dark blazer, no tie, relaxed confident expression, softly blurred modern tech workspace backdrop, professional LinkedIn photo, high detail",
    v2: "modern tech startup founder portrait, neat navy sweater over white shirt, friendly approachable smile, bright modern open office backdrop with soft plants, 8k resolution",
  },
  corporate_law: {
    v1: "executive corporate headshot, dark navy business suit, white shirt, neat tie, clean neutral studio background, authoritative posture, sharp professional lighting, 8k resolution",
    v2: "executive attorney headshot, charcoal grey business suit, light blue shirt, clean executive office background, confident warm smile, 8k resolution",
  },
  medical_creator: {
    v1: "radiant professional doctor portrait, clean bright white lab coat or smart blazer, warm approachable smile, soft high-key studio beauty lighting, flawless complexion, light grey background, high detail",
    v2: "aesthetic creator & public speaker headshot, neat light knit sweater, bright natural window daylight space, clear glowing skin, friendly radiant smile, 8k resolution",
  },
  passport_visa: {
    v1: "official US passport photo standard, neutral calm expression, facing forward looking directly at camera, clean dark shirt, solid off-white studio background, perfectly even passport lighting, sharp 8k ID portrait",
    v2: "official biometric visa ID photo, front facing neutral expression, white studio background, clear face lighting, neat formal collared shirt, high resolution studio photograph",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, style } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "셀피 이미지가 없습니다." }, { status: 400 });

    // BYOK: 사용자 키가 있으면 그걸, 없으면 서버 데모 키
    const userKey = req.headers.get("x-fal-key");
    fal.config({ credentials: userKey || process.env.FAL_KEY });

    const raw = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const blob = new Blob([Buffer.from(raw, "base64")], { type: "image/jpeg" });
    const referenceUrl = await fal.storage.upload(blob);

    const variantSet = VARIANT_PROMPTS[style] || VARIANT_PROMPTS.realtor_sales;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [res1, res2]: any = await Promise.all([
      fal.subscribe("fal-ai/flux-pulid", {
        input: {
          prompt: `${variantSet.v1}, most flattering best-version portrait of the person, confident magnetic gaze, perfectly tailored attire, immaculate studio softbox lighting, ultra sharp focus on eyes, 8k resolution studio photography`,
          reference_image_url: referenceUrl,
          image_size: "portrait_4_3",
          num_inference_steps: 28,
          guidance_scale: 4.2,
          id_weight: 0.95,
          negative_prompt: "blurry, low quality, distorted face, plastic skin, fake face, extra eyes, asymmetrical face, watermark, text, bad anatomy, over-processed, unflattering shadows, double chin, tired eyes",
        },
      }),
      fal.subscribe("fal-ai/flux-pulid", {
        input: {
          prompt: `${variantSet.v2}, prime peak attractiveness corporate portrait, warm trustworthy charismatic smile, sharp executive attire, high-end studio illumination, flawless natural skin, 8k resolution`,
          reference_image_url: referenceUrl,
          image_size: "portrait_4_3",
          num_inference_steps: 28,
          guidance_scale: 4.2,
          id_weight: 0.95,
          negative_prompt: "blurry, low quality, distorted face, plastic skin, fake face, extra eyes, asymmetrical face, watermark, text, bad anatomy, over-processed, unflattering shadows, double chin, tired eyes",
        },
      }),
    ]);

    const imageUrl1 = res1.data?.images?.[0]?.url;
    const imageUrl2 = res2.data?.images?.[0]?.url || imageUrl1;

    if (!imageUrl1) return NextResponse.json({ error: "이미지 생성에 실패했습니다. 다시 시도해 주세요." }, { status: 502 });

    const imageUrls = [imageUrl1, imageUrl2].filter(Boolean);

    return NextResponse.json({
      imageUrl: imageUrl1,
      imageUrls,
    });
  } catch (err) {
    console.error(err); // 서버 로그만 — 클라이언트로 절대 노출 금지
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
