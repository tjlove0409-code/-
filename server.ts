import express from "express";
import path from "path";
import multer from "multer";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Setup Multer for image upload (using memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SYSTEM_PROMPT = `너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘. 단, 사진의 조명, 화장, 필터, 카메라 색감에 따라 결과가 달라질 수 있으므로 최종 진단이 아니라 참고용 분석으로 안내해줘.

분석할 항목은 다음과 같아.
1. 피부 톤 (밝기, 온도(노란기/붉은기/푸른기), 투명도/맑기)
2. 전체 인상 (명도, 채도, 대비감, 이미지 느낌)
3. 웜톤 / 쿨톤 판단
4. 4계절 퍼스널컬러 추천 (세부 타입 포함: 라이트, 브라이트, 뮤트, 딥)
5. 추천 컬러 (8개), 피해야 할 컬러 (5개), 메이크업(립, 블러셔, 섀도우), 헤어, 패션
6. 결과 설명 (친절하고 자연스럽게, 단정적이지 않은 표현 사용)

반드시 아래 JSON 형식으로만 답변해줘. 마크다운이나 다른 서술형 문장은 절대 포함하지 마.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    disclaimer: { type: Type.STRING },
    summary: { type: Type.STRING },
    tone_direction: { type: Type.STRING, description: "warm | cool | neutral" },
    season_type: { type: Type.STRING, description: "봄 웜톤 | 여름 쿨톤 | 가을 웜톤 | 겨울 쿨톤 | 중립톤" },
    sub_type: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    analysis: {
      type: Type.OBJECT,
      properties: {
        skin_tone: { type: Type.STRING },
        brightness: { type: Type.STRING },
        saturation: { type: Type.STRING },
        contrast: { type: Type.STRING },
        overall_impression: { type: Type.STRING }
      },
      required: ["skin_tone", "brightness", "saturation", "contrast", "overall_impression"]
    },
    recommended_colors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "hex", "reason"]
      }
    },
    avoid_colors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "hex", "reason"]
      }
    },
    makeup_recommendations: {
      type: Type.OBJECT,
      properties: {
        lip: { type: Type.ARRAY, items: { type: Type.STRING } },
        blush: { type: Type.ARRAY, items: { type: Type.STRING } },
        eyeshadow: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["lip", "blush", "eyeshadow"]
    },
    hair_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    fashion_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    style_tip: { type: Type.STRING },
    photo_quality_note: { type: Type.STRING }
  },
  required: [
    "disclaimer", "summary", "tone_direction", "season_type", "sub_type", 
    "confidence", "analysis", "recommended_colors", "avoid_colors", 
    "makeup_recommendations", "hair_recommendations", "fashion_recommendations", 
    "style_tip", "photo_quality_note"
  ]
};

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imagePart = {
      inlineData: {
        mimeType: req.file.mimetype,
        data: req.file.buffer.toString("base64"),
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, { text: "Analyze this portrait for personal color consultation." }] },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
