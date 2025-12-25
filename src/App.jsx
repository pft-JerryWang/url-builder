import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Link as LinkIcon, 
  Settings2, 
  Image as ImageIcon, 
  Type, 
  Zap, 
  Globe, 
  ExternalLink, 
  RotateCcw,
  Languages,
  AlertCircle
} from 'lucide-react';

const UrlBuilder = () => {
  // --- 1. 定義常數與對應表 ---

  // Feature 選單與對應路徑
  const featureMap = {
    't2i-prod': { 
      label: 'Text to Image', 
      path: 'ai-art-generator/result-photo' 
    },
    'i2v-prod': { 
      label: 'Image to Video', 
      path: 'ai-video-generator/result-photo' 
    },
    't2v-prod': { 
      label: 'Text to Video', 
      path: 'products/ai-text-to-video-generator/result-photo' 
    }
  };

  // 語言對應表 (JSON Key -> URL Path)
  const langMap = {
    'English': '/',
    'Deutsch': '/de',
    'Español': '/es',
    'French': '/fr',
    'Italian': '/it',
    '日本語': '/ja',
    'Portuguese': '/pt',
    '한국어': '/ko',
    '繁體中文': '/zh-tw'
  };

  // 模型選項
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

  const ratioOptions = ['1:1', '2:3', '3:4', '9:16', '3:2', '4:3', '16:9'];

  // --- 2. 狀態管理 ---
  // 預設值設定
  const [feature, setFeature] = useState('t2i-prod');
  const [language, setLanguage] = useState('English');
  const [model, setModel] = useState('gemini-3-pro-image-preview');
  const [ratio, setRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');
  
  // Style 暫時隱藏但保留狀態
  const [style, setStyle] = useState(''); 
  const [copied, setCopied] = useState(false);

  // --- 3. 邏輯處理 ---

  // 判斷是否為 Image to Video (依據截圖說明：Disabled automatically for Image to Video)
  // 注意：這裡使用 feature key 來判斷
  const isImageToVideo = feature === 'i2v-prod';

  // 產生最終 URL
  const generateFinalUrl = () => {
    const domain = "https://yce.perfectcorp.com";
    
    // 取得語言路徑
    // 邏輯：如果是 English ('/')，我們通常不在網域後加 '//'，而是保持空白或單個 '/'
    // 但根據需求 "Generated URL時要在yce.perfectcorp.com後方加入keyvalue"
    // 範例：English -> https://yce.perfectcorp.com/ai-art...
    // 範例：Deutsch -> https://yce.perfectcorp.com/de/ai-art...
    
    let langPath = langMap[language];
    if (langPath === '/') langPath = ''; // 英文時設為空字串，避免雙斜線

    const featurePath = featureMap[feature].path;
    
    // 參數編碼
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedStyle = encodeURIComponent(style);

    // 基礎路徑拼接
    let finalString = `${domain}${langPath}/${featurePath}`;
    
    // Query Strings
    finalString += `?model=${model}`;
    
    // 只有在非 i2v 時才加入 ratio (或根據需求調整)
    // 截圖顯示 Image to Video 時 Ratio disable，通常 URL 也不帶參數，或帶空值
    if (!isImageToVideo) {
       finalString += `&ratio=${ratio}`;
    }

    finalString += `&prompt=${encodedPrompt}`;
    if (style) finalString += `&style=${encodedStyle}`;

    return finalString;
  };

  const finalUrl = generateFinalUrl();

  // 功能函數
  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPage = () => {
    window.open(finalUrl, '_blank');
  };

  const handleReset = () => {
    setFeature('t2i-prod');
    setLanguage('English');
    setModel('Nano Banana Pro');
    setRatio('1:1');
    setPrompt('');
    setStyle('');
  };

  return (
    <div className="min-h-screen bg-[#f6f6f9] font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* --- 左側欄 (Configuration) --- */}
      <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-auto md:h-screen overflow-y-auto shadow-xl z-10">
        <div className="p-6 border-b border-gray-100 bg-[#1e1e2f] text-white">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[#ff4785]">
            <Settings2 size={20} />
            Configuration
          </h2>
        </div>

        <div className="p-6 space-y-8">
          
          {/* 1. Feature Selector (Target URL) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <LinkIcon size={16} className="text-[#ff4785]" />
              Feature (Target URL)
            </label>
            <div className="relative">
              <select
                id="feature"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#ff4785] focus:border-[#ff4785] focus:outline-none appearance-none cursor-pointer font-medium"
              >
                <option value="t2i-prod">Text to Image</option>
                <option value="i2v-prod">Image to Video</option>
                <option value="t2v-prod">Text to Video</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            {/* 顯示當前選中的路徑提示 */}
            <p className="text-xs text-gray-400 font-mono truncate px-1">
              .../{featureMap[feature].path}
            </p>
          </div>

          {/* 2. Language Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Globe size={16} className="text-[#ff4785]" />
              Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(langMap).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-2 px-1 text-xs font-bold rounded-md border transition-all truncate ${
                    language === lang
                      ? 'bg-[#fcecef] text-[#a01c4b] border-[#ff4785] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-[#ff4785]'
                  }`}
                  title={lang}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 px-1">
              Prefix: <span className="font-mono text-gray-600">{langMap[language] === '/' ? '(None)' : langMap[language]}</span>
            </p>
          </div>

          {/* 3. Model Selection */}
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
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* 4. Ratio Selection */}
          <div className={`space-y-2 transition-opacity duration-300 ${isImageToVideo ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#ff4785]" />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ratioOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  disabled={isImageToVideo}
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
            {isImageToVideo && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <AlertCircle size={10} /> Disabled for Image to Video
              </p>
            )}
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
              placeholder="Please input the prompt (Max: 600 chars)"
              maxLength={600}
              className="w-full p-3 border border-gray-200 rounded-lg h-40 focus:ring-2 focus:ring-[#ff4785] focus:border-[#ff4785] focus:outline-none resize-none text-sm leading-relaxed"
            />
            {/* 字數統計更新 */}
            <div className={`text-right text-xs font-mono transition-colors ${prompt.length >= 600 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
              {prompt.length} / 600
            </div>
          </div>

        </div>
      </div>

      {/* --- 右側欄 (Main Content) --- */}
      <div className="flex-1 flex flex-col bg-[#f6f6f9] h-auto md:h-screen overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-8 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              YCO Prompt <span className="text-[#ff4785]">URL Builder</span>
            </h1>
            <p className="text-gray-500 text-lg">
              Generate localized URLs for production features.
            </p>
          </div>
        </div>

        {/* Result Section */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Output URL</span>
                <span className="text-xs text-gray-400 font-mono">Ready</span>
              </div>
              
              <div className="p-6 pb-2">
                <div className="relative">
                  <pre className="w-full p-6 rounded-lg font-mono text-sm break-all whitespace-pre-wrap border shadow-inner min-h-[120px] flex items-center transition-colors bg-[#212134] text-slate-50 border-slate-700">
                    {finalUrl}
                  </pre>
                </div>
              </div>

              {/* Action Buttons (3 Buttons Layout) */}
              <div className="px-6 pb-6 pt-2">
                 <div className="flex flex-col md:flex-row gap-3">
                   
                   {/* 1. Copy URL */}
                   <button
                      onClick={handleCopy}
                      className="flex-1 py-3 px-4 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] bg-[#ff4785] hover:bg-[#d93675] text-white"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                      {copied ? 'Copied!' : 'Copy URL'}
                   </button>

                   {/* 2. Open Page */}
                   <button
                      onClick={handleOpenPage}
                      className="flex-1 py-3 px-4 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] bg-white border-2 border-[#ff4785] text-[#ff4785] hover:bg-pink-50"
                    >
                      <ExternalLink size={20} />
                      Open Page
                   </button>

                   {/* 3. Reset */}
                   <button
                      onClick={handleReset}
                      className="flex-none md:w-32 py-3 px-4 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    >
                      <RotateCcw size={18} />
                      Reset
                   </button>
                 </div>
              </div>

              {/* Debug View / Breakdown */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 mt-4">Debug View</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#fcfaff] p-3 rounded border border-purple-100 font-mono text-xs">
                    <span className="block text-purple-400 font-bold mb-1">model:</span>
                    <span className="text-gray-800">{model || '(empty)'}</span>
                  </div>
                  <div className="bg-[#fcfaff] p-3 rounded border border-purple-100 font-mono text-xs">
                     <span className="block text-purple-400 font-bold mb-1">ratio:</span>
                     <span className={`${isImageToVideo ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                       {ratio || '(empty)'}
                     </span>
                  </div>
                   <div className="bg-[#fcfaff] p-3 rounded border border-purple-100 font-mono text-xs md:col-span-2">
                     <span className="block text-purple-400 font-bold mb-1">raw prompt:</span>
                     <span className="text-gray-800 break-all">
                        {prompt || '(empty)'}
                     </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlBuilder;