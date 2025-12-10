import React, { useState, useEffect } from 'react';
import { Copy, Check, Link as LinkIcon, AlertCircle, Settings2, Image as ImageIcon, Type, Sparkles } from 'lucide-react';

const UrlBuilder = () => {
  // 狀態管理
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('Nano Banana Pro');
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
  // 邏輯: {url}+"?model="+{model選項value}+"&style="+{style 輸入值}+"&ratio="+{ratio選項value}+"&prompt="+{prompt輸入值}
  const generateFinalUrl = () => {
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedStyle = encodeURIComponent(style);
    
    // 如果是 video generator，通常不需要 style 和 ratio (根據需求 deactivate)
    // 這裡我們在生成時保留欄位但值可能為空，或者根據您的需求完全不帶入參數
    // 根據題目描述 "deactivate Style, Ratio"，這通常意味著 UI 鎖住，參數是否帶入視邏輯而定
    // 這裡依循題目公式將所有值帶入，但若 UI 被鎖住，Style 和 Ratio 應保持當前值或預設值
    
    // 為了符合題目的格式要求，我們直接拼接字符串
    let finalString = `${baseUrl}?model=${model}`;
    
    // 雖然 UI 鎖住，但根據題目公式格式，我們還是將參數串接上去
    // 使用者若無法輸入 Style，該值即為空
    finalString += `&style=${encodedStyle}`;
    finalString += `&ratio=${ratio}`;
    finalString += `&prompt=${encodedPrompt}`;

    return finalString;
  };

  const finalUrl = generateFinalUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* 左側欄 (Sidebar) */}
      <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-auto md:h-screen overflow-y-auto shadow-lg z-10">
        <div className="p-6 border-b border-gray-100 bg-slate-900 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings2 size={20} />
            Configuration
          </h2>
        </div>

        <div className="p-6 space-y-8">
          
          {/* 1. Base URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <LinkIcon size={16} />
              Target URL
            </label>
            <input
              type="text"
              placeholder="https://yce.perfectcorp.com/ai-art-generator/result-photo"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                baseUrl && !baseUrl.startsWith('http') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {baseUrl && !baseUrl.startsWith('http') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> URL should start with http or https
              </p>
            )}
            {isVideoGenerator && (
              <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1">
                <AlertCircle size={12} /> Video Generator detected: Style & Ratio disabled.
              </p>
            )}
          </div>

          {/* 2. Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ImageIcon size={16} />
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer hover:border-blue-400 transition-colors"
            >
              {modelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Style Input */}
          <div className={`space-y-2 transition-opacity duration-300 ${isVideoGenerator ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles size={16} />
              Style
            </label>
            <input
              type="text"
              placeholder="e.g. Cyberpunk, Watercolor"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isVideoGenerator}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          {/* 4. Ratio Selection */}
          <div className={`space-y-2 transition-opacity duration-300 ${isVideoGenerator ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ImageIcon size={16} />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ratioOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  disabled={isVideoGenerator}
                  className={`py-2 px-1 text-xs font-medium rounded-md border transition-all ${
                    ratio === r
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Type size={16} />
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image here..."
              maxLength={2000}
              className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm leading-relaxed"
            />
            <div className="text-right text-xs text-gray-400">
              {prompt.length} characters
            </div>
          </div>

        </div>
      </div>

      {/* 右側欄 (Main Content) */}
      <div className="flex-1 flex flex-col bg-gray-50 h-auto md:h-screen overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 p-8 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              YCO Prompt URL Builder
            </h1>
            <p className="text-gray-500 text-lg">
              Streamline your workflow by generating pre-configured URLs with embedded prompts and settings instantly.
            </p>
          </div>
        </div>

        {/* Result Section */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Generated URL</span>
                <span className="text-xs text-gray-400 font-mono">Query String Ready</span>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  <pre className="w-full bg-slate-900 text-slate-50 p-6 rounded-lg font-mono text-sm break-all whitespace-pre-wrap border border-slate-700 shadow-inner min-h-[120px] flex items-center">
                    {baseUrl ? finalUrl : <span className="text-slate-500 italic">Enter a URL in the sidebar to begin...</span>}
                  </pre>
                  
                  {baseUrl && (
                    <button
                      onClick={handleCopy}
                      className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-all backdrop-blur-sm border border-white/10"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Breakdown / Preview of Params */}
              <div className="px-6 pb-6 pt-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Parameter Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <span className="text-xs text-gray-400 block uppercase">Model</span>
                    <span className="text-sm font-medium text-gray-800">{model}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-100">
                     <span className="text-xs text-gray-400 block uppercase">Ratio</span>
                     <span className={`text-sm font-medium ${isVideoGenerator ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                       {ratio}
                     </span>
                  </div>
                   <div className="bg-gray-50 p-3 rounded border border-gray-100">
                     <span className="text-xs text-gray-400 block uppercase">Style</span>
                     <span className={`text-sm font-medium ${isVideoGenerator ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {style || '(None)'}
                     </span>
                  </div>
                   <div className="bg-gray-50 p-3 rounded border border-gray-100 md:col-span-2">
                     <span className="text-xs text-gray-400 block uppercase">Encoded Prompt</span>
                     <span className="text-xs font-mono text-gray-600 break-all">
                        {encodeURIComponent(prompt) || '(Empty)'}
                     </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <div className="text-blue-500 mt-1">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Did you know?</h4>
                <p className="text-blue-800 text-sm mt-1">
                  Spaces in your prompt are automatically converted to <code className="bg-blue-100 px-1 rounded">%20</code> to ensure the link works correctly in browsers.
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