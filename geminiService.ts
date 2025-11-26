import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo AI
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Hàm chuyển file ảnh sang dạng AI đọc được
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Xóa cái đầu "data:image/jpeg;base64," đi chỉ lấy mã phía sau
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Hàm chính để gọi Gemini
export async function getGeminiResponse(prompt: string, imageFile: File | null) {
  try {
    // 1. Chọn model (đời máy)
    // Lưu ý: Dùng 'gemini-1.5-flash' cho nhanh và rẻ
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Chuẩn bị dữ liệu gửi đi
    let promptConfig = [prompt];
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      promptConfig = [prompt, imagePart] as any;
    }

    // 3. Gửi và nhận kết quả
    const result = await model.generateContent(promptConfig);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    throw error;
  }
}
