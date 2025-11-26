import { GoogleGenerativeAI } from "@google/generative-ai";
// 1. Import thêm cái khuôn mẫu ImageFile từ file types của anh
import { ImageFile } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: { data: base64Data, mimeType: file.type },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 2. Sửa tham số đầu vào nhận đúng kiểu ImageFile
export async function getGeminiResponse(prompt: string, imageInput: ImageFile | null) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let promptConfig: any[] = [prompt];
    
    // 3. QUAN TRỌNG: Kiểm tra và lấy đúng cái ruột .file ra
    if (imageInput && imageInput.file) {
      // Sửa lỗi Parameter 1 is not of type 'Blob' chính là ở đây:
      // Chúng ta đưa imageInput.file (file thật) vào chứ không đưa cả cục imageInput
      const imagePart = await fileToGenerativePart(imageInput.file);
      promptConfig = [prompt, imagePart];
    }

    const result = await model.generateContent(promptConfig);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Lỗi Gemini:", error);
    throw error;
  }
}
