import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Persona, CameraSettings, CreatorAttributes } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanBase64 = (base64Data: string): string => {
  return base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

/**
 * Step 0: Generate a base Reference Image from scratch (Maker Mode)
 */
export const generateReferenceImage = async (attrs: CreatorAttributes): Promise<string> => {
  // Construct a detailed prompt based on the new attributes
  // Refined to focus on visual descriptions rather than strict biometrics to avoid safety filters
  const prompt = `
    Generate a high-quality, photorealistic portrait of a virtual fashion model.
    
    VISUAL ATTRIBUTES:
    - Gender: ${attrs.gender}
    - Age Appearance: Approx ${attrs.age} years old
    - Ethnicity/Heritage: ${attrs.ethnicity}
    - Physique: ${attrs.build} build, approx ${attrs.height}cm tall
    - Face: ${attrs.eyeColor} eyes, clear skin texture
    
    HAIR & STYLE:
    - Hair: ${attrs.hairColor}, ${attrs.hairStyle}
    - Fashion: ${attrs.fashionStyle}
    - Vibe: ${attrs.vibe}

    COMPOSITION: 
    Professional studio photography, front-facing portrait or 3/4 view.
    Neutral, soft-focus background. 
    Lighting: Cinematic studio lighting, 8k resolution, highly detailed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          // imageSize is not supported in gemini-2.5-flash-image
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      // Check for text refusal
      const textPart = parts.find(p => p.text);
      if (textPart?.text) {
        throw new Error(`Model refused: ${textPart.text}`);
      }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Reference Generation Error:", error);
    throw new Error(error.message || "Failed to generate reference image");
  }
};

/**
 * Step 1: Analyze the image to create a Detailed Persona (IN KOREAN)
 */
export const analyzePersona = async (referenceImageBase64: string): Promise<Persona> => {
  const prompt = `
    이 사진 속 인물의 시각적 특징을 깊이 분석하여 구체적인 "인플루언서 페르소나"를 설정해주세요.
    응답은 반드시 **한국어(Korean)**로 작성해야 합니다.
    
    다음 항목들을 상상력을 발휘하여 구체적으로 정의하세요:
    1. **나이(Age)**: 대략적인 나이대 (예: 20대 중반, 30대 초반)
    2. **직업(Occupation)**: 외모와 분위기에 어울리는 직업 (예: 피트니스 강사, 스타트업 CEO, 여행 작가)
    3. **성격(Personality)**: 표정과 포즈에서 느껴지는 성격 (예: 자신감 넘치고 외향적, 차분하고 지적임)
    4. **라이프스타일(Lifestyle)**: 즐길 것 같은 취미나 생활 방식 (예: 주말마다 서핑, 럭셔리 호텔 투어, 빈티지 카페 탐방)
    5. **스타일(Vibe)**: 전반적인 패션 및 분위기 키워드
    6. **별명(Nickname)**: 부르기 쉽고 기억에 남는 별명
    7. **소개글(Description)**: 이 페르소나를 한 줄로 요약하는 문장 (15단어 이내)
    8. **해시태그**: 관련 태그 3~4개
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(referenceImageBase64) } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nickname: { type: Type.STRING },
          age: { type: Type.STRING },
          occupation: { type: Type.STRING },
          personality: { type: Type.STRING },
          lifestyle: { type: Type.STRING },
          vibe: { type: Type.STRING },
          description: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["nickname", "age", "occupation", "personality", "lifestyle", "vibe", "description", "hashtags"]
      } as Schema
    }
  });

  if (!response.text) throw new Error("Failed to generate persona");
  return JSON.parse(response.text) as Persona;
};

/**
 * Step 2: Plan the story (Generate 8 prompts) using the detailed persona
 */
export const planStory = async (persona: Persona, userScenario?: string): Promise<string[]> => {
  const baseContext = `
    We are creating a photo series (8 images) for a virtual influencer.
    
    INFLUENCER PROFILE (Detailed Persona):
    - Name: ${persona.nickname}
    - Age: ${persona.age}
    - Job: ${persona.occupation}
    - Personality: ${persona.personality}
    - Lifestyle: ${persona.lifestyle}
    - Vibe: ${persona.vibe}
    
    TASK:
    Create a sequential 8-frame visual storyboard. The images should look like a cohesive story or a "day in the life" photo dump.
    ${userScenario 
      ? `SPECIFIC SCENARIO: The user wants the story to be about: "${userScenario}".` 
      : `SCENARIO: Create a trending, engaging lifestyle sequence that fits their Job and Lifestyle perfectly.`}
    
    REQUIREMENTS:
    - Return exactly 8 distinct image prompts.
    - **LOCATION CONSISTENCY (CRITICAL)**: The background and location MUST remain consistent across all 8 frames to create a continuous narrative (e.g., if they are at a specific cafe, all 8 photos are at that cafe). Do not jump between unrelated locations unless the scenario specifically asks to travel.
    - Each prompt must describe the outfit, background, action, and lighting.
    - Keep the outfit relatively consistent (or logically changing, e.g., jacket on/off) within the story.
    - Make the scenes visually diverse (close-ups, wide shots, dynamic angles) while maintaining the same location context.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: baseContext,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      } as Schema
    }
  });

  if (!response.text) throw new Error("Failed to plan story");
  return JSON.parse(response.text) as string[];
};

/**
 * Helper: Generate image from prompt
 */
const generateSingleImage = async (referenceImageBase64: string, prompt: string): Promise<string> => {
  const fullPrompt = `
    Generate a photorealistic influencer photo based on the reference person.
    
    CRITICAL INSTRUCTION: Preserve the facial identity, hair, and body type of the reference image exactly.
    
    SCENE DESCRIPTION: ${prompt}
    
    STYLE: 4k, cinematic, social media aesthetic, high detail.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: fullPrompt },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(referenceImageBase64) } }
      ]
    }
  });

  if (response.candidates && response.candidates.length > 0) {
    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image generated");
};

/**
 * Studio Mode: Generate image with specific camera settings
 */
export const generateStudioImage = async (
  referenceImageBase64: string,
  settings: CameraSettings,
  persona: Persona
): Promise<{ url: string; prompt: string }> => {
  
  // Construct camera prompt
  let cameraDescription = "";
  
  // Rotation
  if (settings.rotation < -10) cameraDescription += `Profile view from the left (${Math.abs(settings.rotation)} degrees), `;
  else if (settings.rotation > 10) cameraDescription += `Profile view from the right (${settings.rotation} degrees), `;
  else cameraDescription += "Front facing view, ";

  // Vertical Angle
  if (settings.vertical < -0.3) cameraDescription += "Low angle shot (worm's eye view), looking up at the subject, ";
  else if (settings.vertical > 0.3) cameraDescription += "High angle shot (bird's eye view), looking down at the subject, ";
  else cameraDescription += "Eye-level shot, ";

  // Zoom
  if (settings.zoom > 7) cameraDescription += "Extreme close-up on face, detailed features, ";
  else if (settings.zoom > 3) cameraDescription += "Medium close-up (head and shoulders), ";
  else cameraDescription += "Full body shot, ";

  // Lens
  if (settings.isWideAngle) cameraDescription += "Shot with a wide-angle lens (16mm), slightly distorted perspective, dynamic background, ";
  else cameraDescription += "Shot with a portrait lens (85mm), compressed background, ";

  const prompt = `
    Studio photography session of ${persona.nickname}. 
    Age: ${persona.age}. Occupation: ${persona.occupation}.
    ${persona.vibe} style.
    
    CAMERA SETUP: ${cameraDescription}
    
    The subject is posing professionally in a studio or clean aesthetic environment.
    Lighting should be high-quality studio lighting.
  `;

  const url = await generateSingleImage(referenceImageBase64, prompt);
  return { url, prompt };
};

/**
 * Orchestrator: Generate the full story (8 images)
 */
export const generateStoryBatch = async (
  referenceImageBase64: string,
  prompts: string[]
): Promise<{ url: string; prompt: string }[]> => {
  
  const promises = prompts.map(async (prompt) => {
    try {
      const url = await generateSingleImage(referenceImageBase64, prompt);
      return { url, prompt, success: true };
    } catch (e) {
      console.error("Failed to generate frame:", prompt, e);
      return { url: '', prompt, success: false };
    }
  });

  const results = await Promise.all(promises);
  return results.filter(r => r.success && r.url).map(r => ({ url: r.url, prompt: r.prompt }));
};