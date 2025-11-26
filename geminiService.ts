import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Khởi tạo kết nối với Google Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 2. Hàm hỗ trợ đọc file ảnh (nếu có)
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

// 3. Hàm chính để chạy (Anh lưu ý tên hàm này phải khớp với bên App.tsx)
export async function getGeminiResponse(prompt: string, imageFile: File | null) {
  try {
    // Tạo model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Kiểm tra xem model có tạo được không
    if (!model) {
      console.error("Lỗi: Không tạo được Model!");
      throw new Error("Model not found");
    }

    // Chuẩn bị dữ liệu
    let promptConfig: any[] = [prompt];
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      promptConfig = [prompt, imagePart];
    }

    // Gửi đi
    const result = await model.generateContent(promptConfig);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Chi tiết lỗi Gemini:", error);
    throw error;
  }
}
