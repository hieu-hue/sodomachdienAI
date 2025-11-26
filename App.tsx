import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { SolutionViewer } from './components/SolutionViewer';
import { Button } from './components/Button';
import { getGeminiResponse as analyzePhysicsProblem } from './geminiService';
import { AnalysisStatus, ImageFile } from './types';

const App: React.FC = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleImageSelected = (img: ImageFile) => {
    setImage(img);
    setStatus(AnalysisStatus.IDLE);
    setResult('');
    setErrorMsg('');
  };

  const handleClearImage = () => {
    setImage(null);
    setStatus(AnalysisStatus.IDLE);
    setResult('');
    setQuestion('');
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg('');

    try {
      const analysisText = await analyzePhysicsProblem(image.file, question);
      setResult(analysisText);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              ⚡
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PhysiSolve AI</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-600">
                  <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                1. Tải ảnh bài tập
              </h2>
              <ImageUploader 
                currentImage={image} 
                onImageSelected={handleImageSelected} 
                onClear={handleClearImage} 
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-grow">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-600">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                2. Câu hỏi cụ thể (Tùy chọn)
              </h2>
              <textarea
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-900 placeholder:text-slate-400"
                rows={4}
                placeholder="Ví dụ: Tìm cường độ dòng điện qua R1? Tính gia tốc của vật M?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              
              <div className="mt-6">
                <Button 
                  onClick={handleAnalyze} 
                  isLoading={status === AnalysisStatus.ANALYZING}
                  disabled={!image}
                  className="w-full py-3 text-lg shadow-md"
                >
                  {status === AnalysisStatus.ANALYZING ? 'Đang phân tích...' : 'Giải bài tập ngay'}
                </Button>
                {status === AnalysisStatus.ERROR && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="flex flex-col h-full min-h-[500px]">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                   <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-600">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Kết quả phân tích
                   </h2>
                </div>
                
                <div className="flex-grow overflow-hidden relative">
                  {status === AnalysisStatus.IDLE && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      <p>Kết quả giải bài tập sẽ hiển thị tại đây.</p>
                    </div>
                  )}

                  {status === AnalysisStatus.ANALYZING && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-indigo-700 font-medium animate-pulse">Đang phân tích mạch điện & tính toán...</p>
                      <p className="text-slate-500 text-sm mt-2">Quá trình này có thể mất vài giây.</p>
                    </div>
                  )}

                  {result && (
                     <div className="h-full">
                       <SolutionViewer result={result} />
                     </div>
                  )}
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
