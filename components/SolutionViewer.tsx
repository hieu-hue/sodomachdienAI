import React from 'react';

interface SolutionViewerProps {
  result: string;
}

export const SolutionViewer: React.FC<SolutionViewerProps> = ({ result }) => {
  // A simple way to render markdown-like content without a heavy library for this demo.
  // In a real app, use react-markdown.
  // Here we will process basic formatting: Headers, bold, newlines.

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-indigo-700 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-slate-800 mt-6 mb-3 border-b pb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-slate-900 mt-2 mb-4">{line.replace('# ', '')}</h1>;
      }
      
      // List items
      if (line.trim().startsWith('- ')) {
        return <li key={index} className="ml-4 list-disc text-slate-700 mb-1">{parseBold(line.replace('- ', ''))}</li>;
      }
      if (line.trim().match(/^\d+\./)) {
         return <div key={index} className="ml-4 text-slate-700 mb-1">{parseBold(line)}</div>;
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }

      // Standard paragraphs
      return <p key={index} className="text-slate-700 mb-2 leading-relaxed">{parseBold(line)}</p>;
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full overflow-y-auto markdown-body">
      {renderContent(result)}
    </div>
  );
};
