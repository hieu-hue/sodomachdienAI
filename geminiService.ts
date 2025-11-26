//import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

//const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Dùng dòng này để lấy key trực tiếp, không qua trung gian
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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

export const analyzePhysicsProblem = async (
  imageFile: File,
  userQuestion: string
): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    // Prompt engineering for Physics Tutor persona
    const promptText = `
      Bạn là một chuyên gia Vật lý và kỹ sư điện tử giỏi. Nhiệm vụ của bạn là giải bài tập dựa trên hình ảnh được cung cấp (thường là sơ đồ mạch điện hoặc hệ cơ học).

      Hãy thực hiện các bước sau một cách chi tiết:
      1. **Nhận diện thành phần**: Liệt kê các linh kiện (điện trở, tụ điện, nguồn, ròng rọc, dây, vật nặng...) có trong hình.
      2. **Phân tích cấu trúc**:
         - Với mạch điện: Xác định cách mắc (nối tiếp, song song, mạch cầu, v.v.).
         - Với cơ hệ: Xác định các lực tác dụng, sự tương quan chuyển động.
      3. **Hướng giải**: Đề xuất các định luật vật lý cần áp dụng (Định luật Ohm, Kirchhoff, Newton, Bảo toàn năng lượng...).
      4. **Giải chi tiết**: Thực hiện tính toán từng bước để trả lời câu hỏi của người dùng. Nếu không có câu hỏi cụ thể, hãy phân tích tổng quát các thông số có thể tính được.

      Câu hỏi/Ghi chú thêm của người dùng: "${userQuestion || "Hãy phân tích và giải bài toán trong hình."}"

      Hãy trình bày kết quả bằng Markdown đẹp mắt, sử dụng in đậm cho các kết quả quan trọng.
    `;

    // Using gemini-2.5-flash for speed and multimodal capabilities.
    // Enabling a small thinking budget to improve reasoning on circuit topology.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: promptText }]
      },
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Give it some time to "think" about the circuit topology
      }
    });

    return response.text || "Không thể tạo ra câu trả lời.";
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    throw new Error("Đã xảy ra lỗi khi phân tích hình ảnh. Vui lòng thử lại.");
  }
};
