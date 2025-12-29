import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  Loader2
} from 'lucide-react';

const UrlBuilder = () => {
  // --- 1. 定義常數與對應表 ---

  const featureMap = {
    't2i-prod': { 
      label: 'Text to Image', 
      path: 'ai-art-generator/result-photo',
      type: 't2i'
    },
    'i2v-prod': { 
      label: 'Image to Video', 
      path: 'ai-video-generator/result-photo',
      type: 'i2v'
    },
    't2v-prod': { 
      label: 'Text to Video', 
      path: 'products/ai-text-to-video-generator/result-photo',
      type: 't2v'
    }
  };

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

  // --- 2. 狀態管理 ---
  
  const [apiData, setApiData] = useState({
    t2i: null,
    i2v: null,
    t2v: null,
    vendor: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [feature, setFeature] = useState('t2i-prod');
  const [language, setLanguage] = useState('English');
  const [model, setModel] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(''); 
  const [copied, setCopied] = useState(false);

  // Dynamic Options State
  const [currentModelOptions, setCurrentModelOptions] = useState([]);
  const [currentRatioOptions, setCurrentRatioOptions] = useState([]);
  const [promptMaxLen, setPromptMaxLen] = useState(600);
  const [isRatioDisabled, setIsRatioDisabled] = useState(false);

  // --- 3. API Fetching ---

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [t2iRes, i2vRes, t2vRes, vendorRes] = await Promise.all([
          fetch('https://apptest.armakeup.com/service/V2/get-app-setting?contentver=1.2&lang=en-US&platform=web&product=YouCam%20Enhance&type=T2I_3rdparty_advance_settings&version=1.0&versiontype=web&aid=4748dc23-3dd8-451e-9e70-18e0e0abd839').then(res => res.json()),
          fetch('https://apptest.armakeup.com/service/V2/get-app-setting?contentver=1.0&lang=en-US&platform=web&product=YouCam%20Enhance&type=ycv_i2v_custom_ai_model_support&version=1.0&versiontype=web&aid=4748dc23-3dd8-451e-9e70-18e0e0abd839').then(res => res.json()),
          fetch('https://apptest.armakeup.com/service/V2/get-app-setting?contentver=1.0&lang=en-US&platform=web&product=YouCam%20Enhance&type=ycv_t2v_custom_ai_model_support&version=1.0&versiontype=web&aid=4748dc23-3dd8-451e-9e70-18e0e0abd839').then(res => res.json()),
          fetch('https://apptest.armakeup.com/service/V2/get-app-setting?contentver=1.2&lang=en-US&platform=web&product=YouCam%20Enhance&type=T2I_3rdparty_vendor_info&version=1.0&versiontype=web&aid=4748dc23-3dd8-451e-9e70-18e0e0abd839').then(res => res.json())
        ]);

        setApiData({
          t2i: t2iRes,
          i2v: i2vRes,
          t2v: t2vRes,
          vendor: vendorRes
        });
      } catch (error) {
        console.error("Failed to fetch API data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 4. 資料解析 Helper ---

  // 建立 Vendor I18n Map (Key -> English Label)
  const vendorMap = useMemo(() => {
    if (!apiData.vendor?.result?.translations) return {};
    const map = {};
    apiData.vendor.result.translations.forEach(item => {
      map[item.key] = item.i18n?.enu || Object.values(item.i18n)[0];
    });
    return map;
  }, [apiData.vendor]);

  // 建立 Model ID -> Name Key Map (從 vendor info 的 models 區塊解析)
  const modelIdToKeyMap = useMemo(() => {
    if (!apiData.vendor?.result?.models) return {};
    
    const mapping = {};
    const { txt2Img, img2Img } = apiData.vendor.result.models;

    // Helper function to extract keys
    const extractKeys = (list) => {
      if (!Array.isArray(list)) return;
      list.forEach(item => {
        if (item.model && item.name_key) {
          mapping[item.model] = item.name_key;
        }
      });
    };

    // 掃描 txt2Img 和 img2Img (若重複沒關係，只要找到對應 key 即可)
    extractKeys(txt2Img);
    extractKeys(img2Img);

    return mapping;
  }, [apiData.vendor]);

  // Helper: 解析 i2v/t2v 這種自身帶有 translations 結構的 API
  const parseSelfContainedTranslations = (apiResult) => {
    if (!apiResult?.result?.translations) return {};
    const map = {};
    apiResult.result.translations.forEach(item => {
      map[item.key] = item.i18n?.enu || Object.values(item.i18n)[0];
    });
    return map;
  };

  // 建立 i2v 與 t2v 的專屬翻譯表
  const i2vMap = useMemo(() => parseSelfContainedTranslations(apiData.i2v), [apiData.i2v]);
  const t2vMap = useMemo(() => parseSelfContainedTranslations(apiData.t2v), [apiData.t2v]);

  // 當 Feature 或 Data 改變時，更新 Model 與 Ratio 選項
  useEffect(() => {
    if (isLoading || !apiData.t2i) return;

    const type = featureMap[feature].type;
    let rawModels = [];
    let newModelOptions = [];
    let newRatioOptions = [];
    let newPromptMax = 600; // Default fallback

    // A. 提取該功能的 Raw Models
    if (type === 't2i' && apiData.t2i.result?.models?.txt2Img) {
      rawModels = apiData.t2i.result.models.txt2Img;
    } else if (type === 'i2v' && apiData.i2v.result?.models) {
      rawModels = apiData.i2v.result.models;
    } else if (type === 't2v' && apiData.t2v.result?.models) {
      rawModels = apiData.t2v.result.models;
    }

    // B. 建構 Model Options (Value & Label)
    newModelOptions = rawModels.reduce((acc, m) => {
      let label = m.model; // 預設值
      let shouldKeep = true; // 旗標：決定是否保留此選項

      if (type === 't2i') {
        // --- T2I 邏輯: 查 Vendor Map ---
        let labelKey = modelIdToKeyMap[m.model];
        if (!labelKey) labelKey = m.name_key;
        if (!labelKey) labelKey = `${m.model.replace(/-/g, '_')}_name`;

        // 嚴格檢查 Vendor 翻譯 (過濾掉無翻譯的 model，如 flux-pro)
        if (labelKey && vendorMap[labelKey]) {
          label = vendorMap[labelKey];
        } else {
          shouldKeep = false;
        }

      } else {
        // --- I2V / T2V 邏輯: 查自身 Translations ---
        const selfKey = m.name_key;
        const targetMap = type === 'i2v' ? i2vMap : t2vMap;
        if (selfKey && targetMap[selfKey]) {
           label = targetMap[selfKey];
        }
      }

      // 只有當 shouldKeep 為 true 時，才加入選項
      if (shouldKeep) {
        acc.push({
          value: m.model,
          label: label,
          originalData: m
        });
      }

      return acc;
    }, []).sort((a, b) => b.label.localeCompare(a.label)); // 依照 Label 字母順序排序

    setCurrentModelOptions(newModelOptions);

    // 確保選中的 Model 合法
    const currentModelExists = newModelOptions.find(opt => opt.value === model);
    let activeModelData = currentModelExists ? currentModelExists.originalData : newModelOptions[0]?.originalData;
    
    // 若當前 model 不在清單中（切換 feature 後），預設選第一個
    if (!currentModelExists && newModelOptions.length > 0) {
      const firstModel = newModelOptions[0].value;
      setModel(firstModel); // 更新 State
      activeModelData = newModelOptions[0].originalData; // 更新當前引用
    }

    // --- 請插入這段 Debug Log ---
    console.log("--- DEBUG START ---");
    console.log("Current Feature:", feature);
    console.log("Detected Type:", type);
    console.log("Current Model ID:", model);
    console.log("Active Model Data:", activeModelData); // 展開這個物件檢查有沒有 aspect_ratio

    // C. 根據選中的 Model 更新 Prompt Limit & Ratio
    if (activeModelData) {
      
      // 1. Prompt Limit
      if (type === 't2i') {
        newPromptMax = 600; 
      } else {
        // i2v, t2v 讀取 API (例如 Seedance 是 1500, Kling 是 2500)
        if (activeModelData.prompt?.length) {
          newPromptMax = activeModelData.prompt.length;
        }
      }

      // 2. Aspect Ratio Extraction (修正重點)
      let ratioConfig = null;
      
      if (type === 't2i') {
        // t2i: 藏在 advance_settings 陣列中
        const advanced = activeModelData.advance_settings?.find(s => s.aspect_ratio);
        ratioConfig = advanced?.aspect_ratio;
      } else if (type === 't2v') {
        // --- FIX: T2V 直接讀取根目錄的 aspect_ratio ---
        if (activeModelData.aspect_ratio) {
            ratioConfig = activeModelData.aspect_ratio;
        }
      }
      console.log("Extracted ratioConfig:", ratioConfig);

      // i2v: ratioConfig 保持 null (API 確實沒有)

      // 解析 Ratio Options
      if (ratioConfig?.options && Array.isArray(ratioConfig.options)) {
        // t2i 選項用 'id', t2v 選項用 'name_key' (如 "16:9")
        // 這裡同時支援兩種格式
        newRatioOptions = ratioConfig.options.map(r => r.id || r.name_key);
        
        // 過濾掉無效值並設定狀態
        if (newRatioOptions.length > 0) {
            setIsRatioDisabled(false);
        } else {
            setIsRatioDisabled(true);
        }
      } else {
        newRatioOptions = [];
        setIsRatioDisabled(true);
      }
    }
    console.log("--- DEBUG END ---");
    setCurrentRatioOptions(newRatioOptions);
    setPromptMaxLen(newPromptMax);

    // 若當前 Ratio 不在選項中，重置為第一個選項
    if (!isRatioDisabled && newRatioOptions.length > 0 && !newRatioOptions.includes(ratio)) {
        setRatio(newRatioOptions[0]);
    }

  }, [feature, apiData, isLoading, model]); // 確保 model 變更時重算


  // --- 5. 產生最終 URL ---

  const generateFinalUrl = () => {
    const domain = "https://yce.perfectcorp.com";
    
    let langPath = langMap[language];
    if (langPath === '/') langPath = '';

    const featurePath = featureMap[feature].path;
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedStyle = encodeURIComponent(style);

    let finalString = `${domain}${langPath}/${featurePath}`;
    finalString += `?model=${model}`;
    
    // 只有在 Ratio 未被停用且有值時才加入
    if (!isRatioDisabled && ratio) {
       finalString += `&ratio=${ratio}`;
    }

    finalString += `&prompt=${encodedPrompt}`;
    if (style) finalString += `&style=${encodedStyle}`;

    return finalString;
  };

  const finalUrl = generateFinalUrl();

  // --- 6. Handlers ---

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
    // Model 與 Ratio 會由 useEffect 自動重置回該 Feature 的預設值
    setPrompt('');
    setStyle('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f9] text-slate-500 gap-2">
        <Loader2 className="animate-spin" /> Loading configuration...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f9] font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* 左側 Config */}
      <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-auto md:h-screen overflow-y-auto shadow-xl z-10">
        <div className="p-6 border-b border-gray-100 bg-[#1e1e2f] text-white">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[#ff4785]">
            <Settings2 size={20} />
            Configuration
          </h2>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Feature */}
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
                {Object.entries(featureMap).map(([key, conf]) => (
                    <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-mono truncate px-1">
              .../{featureMap[feature].path}
            </p>
          </div>

          {/* Language */}
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
          </div>

          {/* Model (Dynamic) */}
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
                {currentModelOptions.map((opt) => (
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

          {/* Ratio (Dynamic) */}
          <div className={`space-y-2 transition-opacity duration-300 ${isRatioDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#ff4785]" />
              Aspect Ratio
            </label>
            {currentRatioOptions.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                {currentRatioOptions.map((r) => (
                    <button
                    key={r}
                    onClick={() => setRatio(r)}
                    disabled={isRatioDisabled}
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
            ) : (
                <div className="text-xs text-gray-400 italic p-2 border border-dashed rounded bg-gray-50 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {featureMap[feature].type === 'i2v' ? 'Disabled for Image to Video' : 'No options available'}
                </div>
            )}
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Type size={16} className="text-[#ff4785]" />
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Please input the prompt (Max: ${promptMaxLen} chars)`}
              maxLength={promptMaxLen}
              className="w-full p-3 border border-gray-200 rounded-lg h-40 focus:ring-2 focus:ring-[#ff4785] focus:border-[#ff4785] focus:outline-none resize-none text-sm leading-relaxed"
            />
            <div className={`text-right text-xs font-mono transition-colors ${prompt.length >= promptMaxLen ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
              {prompt.length} / {promptMaxLen}
            </div>
          </div>

        </div>
      </div>

      {/* 右側 Result */}
      <div className="flex-1 flex flex-col bg-[#f6f6f9] h-auto md:h-screen overflow-hidden">
        
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

              <div className="px-6 pb-6 pt-2">
                 <div className="flex flex-col md:flex-row gap-3">
                   <button
                      onClick={handleCopy}
                      className="flex-1 py-3 px-4 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] bg-[#ff4785] hover:bg-[#d93675] text-white"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                      {copied ? 'Copied!' : 'Copy URL'}
                   </button>
                   <button
                      onClick={handleOpenPage}
                      className="flex-1 py-3 px-4 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] bg-white border-2 border-[#ff4785] text-[#ff4785] hover:bg-pink-50"
                    >
                      <ExternalLink size={20} />
                      Open Page
                   </button>
                   <button
                      onClick={handleReset}
                      className="flex-none md:w-32 py-3 px-4 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    >
                      <RotateCcw size={18} />
                      Reset
                   </button>
                 </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-gray-100 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 mt-4">Debug View</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#fcfaff] p-3 rounded border border-purple-100 font-mono text-xs">
                    <span className="block text-purple-400 font-bold mb-1">model:</span>
                    <span className="text-gray-800">{model || '(empty)'}</span>
                  </div>
                  <div className="bg-[#fcfaff] p-3 rounded border border-purple-100 font-mono text-xs">
                     <span className="block text-purple-400 font-bold mb-1">ratio:</span>
                     <span className={`${isRatioDisabled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                       {ratio || '(empty)'}
                     </span>
                  </div>
                   <div className="bg-[#fcfaff] p-3 rounded border border-purple-100 font-mono text-xs md:col-span-2">
                     <span className="block text-purple-400 font-bold mb-1">raw prompt (limit: {promptMaxLen}):</span>
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