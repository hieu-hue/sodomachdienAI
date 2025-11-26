import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Khởi tạo AI với API Key từ Vercel
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 2. Hàm chuyển file ảnh sang dạng AI đọc được (Base64)
async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Lấy phần mã phía sau dấu phẩy
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
}

// 3. Hàm chính để gọi Gemini (Anh chú ý tên hàm này nhé)
// Nếu bên file App.tsx anh gọi hàm tên khác (ví dụ: getGeminiResponse), anh nhớ đổi tên hàm "run" dưới đây cho giống.
export async function run(prompt: string, imageFile: File | null) {
  try {
    // Chọn model đời mới, tốc độ nhanh
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let promptConfig: any[] = [prompt];
    
    // Nếu có ảnh thì thêm ảnh vào gói dữ liệu gửi đi
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      promptConfig = [prompt, imagePart];
    }

    // Gửi đi và chờ kết quả
    const result = await model.generateContent(promptConfig);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Lỗi khi gọi Gemini:", error);
    throw error;
  }
}
