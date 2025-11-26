import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. In ra kiểm tra xem đã lấy được API Key chưa (Nó sẽ hiện true/false trong Console)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log("Check API Key:", apiKey ? "Đã có Key" : "Chưa có Key!");

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

// Hàm chính: Em đặt tên là getGeminiResponse
// (Lát anh nhớ kiểm tra bên App.tsx xem có gọi đúng tên này không nhé)
export async function getGeminiResponse(prompt: string, imageFile: File | null) {
  try {
    console.log("Bắt đầu gọi Gemini...");
    
    // 2. Tạo model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model đã tạo:", model ? "Thành công" : "Thất bại");

    let promptConfig: any[] = [prompt];
    if (imageFile) {
      console.log("Đang xử lý ảnh...");
      const imagePart = await fileToGenerativePart(imageFile);
      promptConfig = [prompt, imagePart];
    }

    // 3. Gửi đi
    console.log("Đang gửi yêu cầu...");
    const result = await model.generateContent(promptConfig);
    const response = await result.response;
    const text = response.text();
    
    console.log("Kết quả trả về:", text);
    return text;

  } catch (error) {
    console.error("LỖI CHI TIẾT:", error);
    throw error;
  }
}
