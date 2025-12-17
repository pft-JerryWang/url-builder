import React, { useState, useEffect } from 'react';
import { Copy, Check, Link as LinkIcon, AlertCircle, Settings2, Image as ImageIcon, Type, Sparkles, Zap } from 'lucide-react';

const UrlBuilder = () => {
  // 狀態管理
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [style, setStyle] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  
  // 邏輯判斷：是否為 Video Generator
  const isVideoGenerator = baseUrl.toLowerCase().includes('ai-video-generator');

  // 模型選項 (參考附件截圖)
  const modelOptions = [
    { value: 'gemini-3-pro-image-preview', label: 'Nano Banana Pro' },
    { value: 'youcam-ai', label: 'YouCam AI' },
    { value: 'gemini-2.5-flash-image-preview', label: 'Nano Banana' },
    { value: 'gpt-image-1', label: 'GPT-Image-1' },
    { value: 'seedream-4-0-250828', label: 'Seedream 4.0' },
    { value: 'imagen-4.0-generate-001', label: 'Imagen 4 Gen' },
    { value: 'imagen-4.0-ultra-generate-001', label: 'Imagen 4 Ultra Gen' },
    { value: 'imagen-3.0-generate-002', label: 'Imagen 3 Gen' },
    { value: 'flux-pro-1.1', label: 'Flux 1.1 Pro' },
  ];
  

  // 比例選項 (參考附件截圖)
  const ratioOptions = ['1:1', '2:3', '3:4', '9:16', '3:2', '4:3', '16:9'];

  // 產生最終 URL
  const generateFinalUrl = () => {
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedStyle = encodeURIComponent(style);
    
    let finalString = `${baseUrl}?model=${model}`;
    
    // 即使 UI 隱藏，邏輯上我們還是串接 style 變數（若為空則為空字串）
    finalString += `&style=${encodedStyle}`;
    finalString += `&ratio=${ratio}`;
    finalString += `&prompt=${encodedPrompt}`;

    return finalString;
  };

  const finalUrl = generateFinalUrl();

  const handleCopy = () => {
    if (!baseUrl) return; // 防呆
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f9] font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* 左側欄 (Sidebar) - 風格調整：深色標題 + 白色內容 */}
      <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-auto md:h-screen overflow-y-auto shadow-xl z-10">
        {/* Sidebar Header - 模擬截圖深色頂部 */}
        <div className="p-6 border-b border-gray-100 bg-[#1e1e2f] text-white">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[#ff4785]">
            <Settings2 size={20} />
            Configuration
          </h2>
        </div>

        <div className="p-6 space-y-8">
          
          {/* 1. Base URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <LinkIcon size={16} className="text-[#ff4785]" />
              Target URL
            </label>
            <input
              type="text"
              placeholder="https://yce.perfectcorp.com/ai-art-generator/result-photo"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#ff4785] focus:border-[#ff4785] focus:outline-none transition-all ${
                baseUrl && !baseUrl.startsWith('http') ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {baseUrl && !baseUrl.startsWith('http') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> URL should start with http or https
              </p>
            )}
            {isVideoGenerator && (
              <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1">
                <AlertCircle size={12} /> Video Generator detected: Ratio disabled.
              </p>
            )}
          </div>

          {/* 2. Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Zap size={16} className="text-[#ff4785]" />
              Model
            </label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#ff4785] focus:border-[#ff4785] focus:outline-none appearance-none cursor-pointer hover:border-[#ff4785] transition-colors"
              >
                {modelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Custom Arrow for select */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* 3. Style Input - 依需求註解隱藏 */}
          {/* <div className={`space-y-2 transition-opacity duration-300 ${isVideoGenerator ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff4785]" />
              Style
            </label>
            <input
              type="text"
              placeholder="e.g. Cyberpunk, Watercolor"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isVideoGenerator}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4785] focus:border-[#ff4785] focus:outline-none disabled:bg-gray-100"
            />
          </div>
          */}

          {/* 4. Ratio Selection */}
          <div className={`space-y-2 transition-opacity duration-300 ${isVideoGenerator ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#ff4785]" />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ratioOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  disabled={isVideoGenerator}
                  className={`py-2 px-1 text-xs font-bold rounded-md border transition-all ${
                    ratio === r
                      ? 'bg-[#fcecef] text-[#a01c4b] border-[#ff4785] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-[#ff4785]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Type size={16} className="text-[#ff4785]" />
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image here..."
              maxLength={2000}
              className="w-full p-3 border border-gray-200 rounded-lg h-40 focus:ring-2 focus:ring-[#ff4785] focus:border-[#ff4785] focus:outline-none resize-none text-sm leading-relaxed"
            />
            <div className="text-right text-xs text-gray-400">
              {prompt.length} characters
            </div>
          </div>

        </div>
      </div>

      {/* 右側欄 (Main Content) */}
      <div className="flex-1 flex flex-col bg-[#f6f6f9] h-auto md:h-screen overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 p-8 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              YCO Prompt <span className="text-[#ff4785]">URL Builder</span>
            </h1>
            <p className="text-gray-500 text-lg">
              Streamline your workflow by generating pre-configured URLs.
            </p>
          </div>
        </div>

        {/* Result Section */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Generated URL</span>
                <span className="text-xs text-gray-400 font-mono">Query String Ready</span>
              </div>
              
              <div className="p-6 pb-2">
                <div className="relative">
                  <pre className={`w-full p-6 rounded-lg font-mono text-sm break-all whitespace-pre-wrap border shadow-inner min-h-[120px] flex items-center transition-colors ${
                     baseUrl ? 'bg-[#212134] text-slate-50 border-slate-700' : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {baseUrl ? finalUrl : <span className="italic opacity-70">Enter a Target URL in the configuration to generate your link...</span>}
                  </pre>
                </div>
              </div>

              {/* Action Button - 依需求移至預覽區塊下方並放大 */}
              <div className="px-6 pb-6">
                 <button
                    onClick={handleCopy}
                    disabled={!baseUrl}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                        baseUrl 
                        ? 'bg-[#ff4785] hover:bg-[#d93675] text-white cursor-pointer hover:shadow-lg' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {copied ? (
                        <>
                            <Check size={24} /> Copied Successfully!
                        </>
                    ) : (
                        <>
                            <Copy size={24} /> Copy URL to Clipboard
                        </>
                    )}
                  </button>
              </div>

              {/* Breakdown / Preview of Params */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 mt-4">Parameter Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#fcfaff] p-3 rounded border border-purple-100">
                    <span className="text-xs text-purple-400 block uppercase font-bold">Model</span>
                    <span className="text-sm font-medium text-gray-800">{model}</span>
                  </div>
                  <div className="bg-[#fcfaff] p-3 rounded border border-purple-100">
                     <span className="text-xs text-purple-400 block uppercase font-bold">Ratio</span>
                     <span className={`text-sm font-medium ${isVideoGenerator ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                       {ratio}
                     </span>
                  </div>
                   {/* Style 隱藏後，Breakdown 可以選擇保留或移除，這裡先保留但顯示 Empty，因為邏輯上變數還在 */}
                   <div className="bg-[#fcfaff] p-3 rounded border border-purple-100">
                     <span className="text-xs text-purple-400 block uppercase font-bold">Style</span>
                     <span className={`text-sm font-medium ${isVideoGenerator ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {style || '(None)'}
                     </span>
                  </div>
                   <div className="bg-[#fcfaff] p-3 rounded border border-purple-100 md:col-span-2">
                     <span className="text-xs text-purple-400 block uppercase font-bold">Encoded Prompt</span>
                     <span className="text-xs font-mono text-gray-600 break-all">
                        {encodeURIComponent(prompt) || '(Empty)'}
                     </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3">
              <div className="text-indigo-500 mt-1">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-indigo-900 text-sm">Did you know?</h4>
                <p className="text-indigo-800 text-sm mt-1">
                  Spaces in your prompt are automatically converted to <code className="bg-indigo-100 px-1 rounded text-indigo-700">%20</code> to ensure the link works correctly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlBuilder;