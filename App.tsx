
import React, { useState, useEffect, useRef, useCallback, FormEvent, ChangeEvent } from 'react';
import { Chart, registerables } from 'chart.js';
import { View, User, PortfolioAsset, AssetType, RiskQuestion, RiskProfileLevel, AnalysisModel, NewsArticle, ChatMessage, ChartRef, PlanType, RiskQuestionOption, StockDetails, CryptoDetails, AssetChartData, FundamentalDataItem } from './types';
import { INITIAL_PORTFOLIO_DATA, STOCK_MASTER_DATA, CRYPTO_MASTER_DATA, STOCK_CHART_DATA, CRYPTO_CHART_DATA, RISK_QUESTIONS_DATA, ANALYSIS_MODELS, NEWS_DATA, DEFAULT_RISK_PROFILE, DEFAULT_USERNAME, DEFAULT_AVATAR, USER_STATUS_FREE, USER_STATUS_PREMIUM, ALL_ASSET_MASTER_DATA, ALL_CHART_DATA } from './constants';
import { FeatherIcon, AIAnalysisModal, PremiumModal, SummaryCard, NewsArticleCard } from './components';
import { callGeminiAPI, GeminiResponse } from './services/geminiService';

Chart.register(...registerables);

// Helper to get risk profile text color
const getRiskProfileColor = (profile: RiskProfileLevel): string => {
    switch (profile) {
        case RiskProfileLevel.SangatKonservatif: return 'text-cyan-600';
        case RiskProfileLevel.Konservatif: return 'text-blue-500';
        case RiskProfileLevel.Moderat: return 'text-yellow-500';
        case RiskProfileLevel.Agresif: return 'text-orange-500';
        case RiskProfileLevel.SangatAgresif: return 'text-red-600';
        default: return 'text-yellow-500';
    }
};

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.Login);
    const [user, setUser] = useState<User>({
        username: DEFAULT_USERNAME,
        avatarUrl: DEFAULT_AVATAR,
        riskProfile: DEFAULT_RISK_PROFILE,
        isPremium: false,
        premiumExpiry: null,
    });
    const [portfolio, setPortfolio] = useState<PortfolioAsset[]>(INITIAL_PORTFOLIO_DATA);
    
    // Auth form states
    const [loginUsername, setLoginUsername] = useState<string>('investor_demo');
    const [loginPassword, setLoginPassword] = useState<string>('password123');
    const [regUsername, setRegUsername] = useState<string>('');
    const [regPassword, setRegPassword] = useState<string>('');
    const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
    const [riskAnswers, setRiskAnswers] = useState<{[key: number]: number}>({});

    // Modals state
    const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
    const [aiModalTitle, setAiModalTitle] = useState<string>('');
    const [aiModalContent, setAiModalContent] = useState<string | null>(null);
    const [isAiModalLoading, setIsAiModalLoading] = useState<boolean>(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
    const [pendingViewAccess, setPendingViewAccess] = useState<View | null>(null);

    // Mobile Sidebar State
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

    // Chart refs
    const portfolioChartRef = useRef<ChartRef>({ instance: null });
    const allocationPieChartRef = useRef<ChartRef>({ instance: null });
    const assetAnalysisChartRef = useRef<ChartRef>({ instance: null });
    const volumeChartRef = useRef<ChartRef>({ instance: null });
    const stochasticChartRef = useRef<ChartRef>({ instance: null });

    // Canvas refs
    const portfolioCanvasRef = useRef<HTMLCanvasElement>(null);
    const allocationCanvasRef = useRef<HTMLCanvasElement>(null);
    const assetAnalysisCanvasRef = useRef<HTMLCanvasElement>(null);
    const volumeCanvasRef = useRef<HTMLCanvasElement>(null);
    const stochasticCanvasRef = useRef<HTMLCanvasElement>(null);

    // Portfolio View State
    const [addAssetType, setAddAssetType] = useState<AssetType>(AssetType.Stock);
    const [addAssetCode, setAddAssetCode] = useState<string>(Object.keys(STOCK_MASTER_DATA)[0] || '');
    const [addAssetAmount, setAddAssetAmount] = useState<string>('');
    const [addAssetAvgPrice, setAddAssetAvgPrice] = useState<string>('');
    
    // Analysis View State
    const [selectedAnalysisAsset, setSelectedAnalysisAsset] = useState<string>(`stock-${Object.keys(STOCK_MASTER_DATA)[0] || 'BBCA'}`);
    const [mlAnalysisResult, setMlAnalysisResult] = useState<string | null>(null);
    const [mlModelLoading, setMlModelLoading] = useState<string | null>(null); // Stores ID of loading model
    const [deepDiveAiResult, setDeepDiveAiResult] = useState<string | null>(null);
    const [isDeepDiveLoading, setIsDeepDiveLoading] = useState<boolean>(false);

    // Ask AI View State
    const [aiQuestion, setAiQuestion] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: '0', sender: 'ai', text: 'Halo! Saya asisten AI Anda. Tanyakan apa saja tentang saham, kripto, atau analisis pasar. Misalnya: "Bagaimana prospek saham BBCA di kuartal berikutnya?"', isHtml: false }
    ]);

    // Settings View State
    const [editUsername, setEditUsername] = useState<string>(user.username);
    const [editAvatarUrl, setEditAvatarUrl] = useState<string>(user.avatarUrl); // Will store URL or Data URL
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

    // News View State
    const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);
    
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).feather) (window as any).feather.replace();
    }, [currentView, isAiModalOpen, isPremiumModalOpen, portfolio, mlAnalysisResult, chatMessages, selectedNewsArticle, isMobileSidebarOpen]);

    // Set initial values for edit fields when user data changes (e.g., after login)
    useEffect(() => {
        setEditUsername(user.username);
        setEditAvatarUrl(user.avatarUrl);
    }, [user.username, user.avatarUrl]);

    const destroyChart = (chartRefInstance: React.MutableRefObject<ChartRef>) => {
        if (chartRefInstance.current.instance) {
            chartRefInstance.current.instance.destroy();
            chartRefInstance.current.instance = null;
        }
    };
    
    // Initialize/Update Dashboard Charts
    useEffect(() => {
        if (currentView === View.Dashboard) {
            if (portfolioCanvasRef.current) {
                destroyChart(portfolioChartRef);
                const totalPortfolioValueHistory = [1000, 1100, 1250, 1150, 1300, 1350]; // Simulated
                portfolioChartRef.current.instance = new Chart(portfolioCanvasRef.current, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                        datasets: [{ label: 'Nilai Portofolio (Rp Juta)', data: totalPortfolioValueHistory, backgroundColor: 'rgba(56, 161, 105, 0.1)', borderColor: '#38a169', borderWidth: 2, fill: true, tension: 0.4 }]
                    },
                    options: { responsive: true, scales: { y: { beginAtZero: false } } }
                });
            }
            if (allocationCanvasRef.current) {
                destroyChart(allocationPieChartRef);
                const labels = portfolio.map(a => a.code);
                const values = portfolio.map(a => a.currentPrice * a.amount * (a.type === AssetType.Stock ? 100 : 1));
                allocationPieChartRef.current.instance = new Chart(allocationCanvasRef.current, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{ data: values, backgroundColor: ['#2563eb', '#f59e0b', '#16a34a', '#ef4444', '#6366f1', '#d946ef', '#0891b2'] }]
                    },
                    options: { responsive: true, plugins: { legend: { position: 'top' } } }
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentView, portfolio]);

    // Initialize/Update Analysis Charts
    useEffect(() => {
        if (currentView === View.Analysis) {
            const [type, code] = selectedAnalysisAsset.split('-');
            const chartData = (type === AssetType.Stock ? STOCK_CHART_DATA[code] : CRYPTO_CHART_DATA[code]) || ALL_CHART_DATA[code] || {
                labels: ['N/A'], prices: [0], volume: [0], stochastic: { k: [0], d: [0] }
            };

            if (assetAnalysisCanvasRef.current) {
                destroyChart(assetAnalysisChartRef);
                assetAnalysisChartRef.current.instance = new Chart(assetAnalysisCanvasRef.current, {
                    type: 'line', data: { labels: chartData.labels, datasets: [{ label: 'Harga', data: chartData.prices, borderColor: '#3b82f6', borderWidth: 2, tension: 0.1 }] }, options: { responsive: true }
                });
            }
            if (volumeCanvasRef.current) {
                destroyChart(volumeChartRef);
                volumeChartRef.current.instance = new Chart(volumeCanvasRef.current, {
                    type: 'bar', data: { labels: chartData.labels, datasets: [{ label: 'Volume', data: chartData.volume, backgroundColor: '#a5b4fc' }] }, options: { responsive: true }
                });
            }
            if (stochasticCanvasRef.current) {
                destroyChart(stochasticChartRef);
                stochasticChartRef.current.instance = new Chart(stochasticCanvasRef.current, {
                    type: 'line', data: { labels: chartData.labels, datasets: [{ label: '%K', data: chartData.stochastic.k, borderColor: '#3b82f6', borderWidth: 1.5, tension: 0.1 }, { label: '%D', data: chartData.stochastic.d, borderColor: '#f43f5e', borderWidth: 1.5, tension: 0.1 }] }, options: { responsive: true }
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentView, selectedAnalysisAsset]);

    const navigateTo = (view: View) => {
      setCurrentView(view);
      setSelectedNewsArticle(null); // Reset selected article when changing main views
      if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint
        setIsMobileSidebarOpen(false);
      }
    }

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        const newUsername = loginUsername || DEFAULT_USERNAME;
        setUser(prev => ({ ...prev, username: newUsername }));
        // editUsername and editAvatarUrl will be set by the useEffect watching user
        navigateTo(View.Dashboard);
    };

    const handleContinueRegister = (e: FormEvent) => {
        e.preventDefault();
        if (regPassword !== regConfirmPassword) {
            alert("Password dan konfirmasi password tidak cocok!");
            return;
        }
        navigateTo(View.RiskAssessment);
    };
    
    const handleRiskAnswerChange = (questionIndex: number, optionValue: number) => {
        setRiskAnswers(prev => ({ ...prev, [questionIndex]: optionValue }));
    };

    const handleCompleteRegister = () => {
        let totalScore = 0;
        RISK_QUESTIONS_DATA.forEach((_, index) => {
            totalScore += riskAnswers[index] || 0;
        });

        let determinedRiskProfile = DEFAULT_RISK_PROFILE;
        if (totalScore <= 15) determinedRiskProfile = RiskProfileLevel.SangatKonservatif;
        else if (totalScore <= 25) determinedRiskProfile = RiskProfileLevel.Konservatif;
        else if (totalScore <= 35) determinedRiskProfile = RiskProfileLevel.Moderat;
        else if (totalScore <= 45) determinedRiskProfile = RiskProfileLevel.Agresif;
        else determinedRiskProfile = RiskProfileLevel.SangatAgresif;
        
        const newUsername = regUsername || 'Pengguna Baru';
        setUser(prev => ({ ...prev, username: newUsername, riskProfile: determinedRiskProfile, avatarUrl: DEFAULT_AVATAR }));
        // editUsername and editAvatarUrl will be set by the useEffect watching user
        navigateTo(View.Dashboard);
    };

    const handleGenericAICall = useCallback(async (prompt: string, title: string, systemInstruction?: string, targetStateSetter?: (content: string | null) => void, targetLoadingSetter?: (isLoading: boolean) => void) => {
      if (!user.isPremium) {
          setIsPremiumModalOpen(true);
          if (targetLoadingSetter && targetStateSetter) {
              targetStateSetter(`<p class="text-red-500">Fitur ini memerlukan akses premium.</p>`);
          } else { 
              setAiModalTitle(title);
              setAiModalContent(`<p class="text-red-500">Fitur ini memerlukan akses premium.</p>`);
              setIsAiModalLoading(false);
              setIsAiModalOpen(true);
          }
          return;
      }
  
      if (targetLoadingSetter) targetLoadingSetter(true);
      else setIsAiModalLoading(true);
  
      if (!targetStateSetter) { 
          setAiModalTitle(title);
          setAiModalContent(null);
          setIsAiModalOpen(true);
      }
  
      const response: GeminiResponse = await callGeminiAPI(prompt, systemInstruction);
  
      if (targetStateSetter) {
          targetStateSetter(response.text || `<p class="text-red-500">${response.error || 'Gagal memuat konten.'}</p>`);
      } else {
          setAiModalContent(response.text || `<p class="text-red-500">${response.error || 'Gagal memuat konten.'}</p>`);
      }
      
      if (targetLoadingSetter) targetLoadingSetter(false);
      else setIsAiModalLoading(false);
  
  }, [user.isPremium]);


    const handleAddAsset = (e: FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(addAssetAmount);
        const avgPrice = parseFloat(addAssetAvgPrice);
        if (!addAssetType || !addAssetCode || isNaN(amount) || amount <= 0 || isNaN(avgPrice) || avgPrice <= 0) {
            alert("Harap isi semua kolom dengan data yang valid.");
            return;
        }
        const masterData = addAssetType === AssetType.Stock ? STOCK_MASTER_DATA : CRYPTO_MASTER_DATA;
        const assetDetails = masterData[addAssetCode];
        if (!assetDetails) {
            alert("Kode aset tidak valid.");
            return;
        }
        const newAsset: PortfolioAsset = {
            type: addAssetType,
            code: addAssetCode,
            name: assetDetails.name,
            amount,
            avgBuy: avgPrice,
            currentPrice: assetDetails.currentPrice
        };
        setPortfolio(prev => [...prev, newAsset]);
        setAddAssetAmount('');
        setAddAssetAvgPrice('');
    };

    const handleDeleteAsset = (index: number) => {
        setPortfolio(prev => prev.filter((_, i) => i !== index));
    };

    const handleAnalyzePortfolioAI = () => {
        const prompt = `Saya adalah seorang investor dengan profil risiko "${user.riskProfile}". Portofolio saya saat ini berisi: ${portfolio.map(a => `${a.amount} ${a.type === AssetType.Stock ? 'lot saham' : `unit crypto`} ${a.code} (${a.name})`).join(', ')}. Berikan analisis mendalam tentang portofolio saya, termasuk kekuatan, kelemahan, potensi risiko, dan saran diversifikasi atau penyesuaian strategi jika diperlukan. Format jawaban dalam poin-poin dan penjelasan singkat.`;
        handleGenericAICall(prompt, 'Analisis Portofolio oleh AI');
    };
    
    const assetCodeOptions = (assetType: AssetType) => {
        const data = assetType === AssetType.Stock ? STOCK_MASTER_DATA : CRYPTO_MASTER_DATA;
        return Object.keys(data).map(code => (
            <option key={code} value={code}>{code} - {data[code].name}</option>
        ));
    };

    const handleRunMLAnalysis = (model: AnalysisModel) => {
      setMlModelLoading(model.id); 
      setMlAnalysisResult(null); 
      setDeepDiveAiResult(null); 
  
      setTimeout(() => {
          const [type, assetCode] = selectedAnalysisAsset.split('-');
          const currentAssetChartData = (type === AssetType.Stock ? STOCK_CHART_DATA[assetCode] : CRYPTO_CHART_DATA[assetCode]) || ALL_CHART_DATA[assetCode];
          
          if (!currentAssetChartData) {
            setMlAnalysisResult(`<p class="text-red-500">Data chart untuk aset ${assetCode} tidak ditemukan.</p>`);
            setMlModelLoading(null);
            return;
          }

          const lastPrice = currentAssetChartData.prices.slice(-1)[0] || 0;
          const prediction = lastPrice * (1 + (Math.random() - 0.45) * 0.1); 
          const action = prediction > lastPrice ? 'Beli' : 'Jual';
          const accuracy = (85 + Math.random() * 10).toFixed(1);
  
          const resultHtml = `
              <h3 class="font-bold text-lg mb-2">Hasil Analisis Model ${model.name}</h3>
              <p class="mb-1"><span class="font-semibold">Prediksi Harga (${assetCode}):</span> Rp ${Math.round(prediction).toLocaleString('id-ID')}</p>
              <p class="mb-1"><span class="font-semibold">Akurasi Model (Simulasi):</span> ${accuracy}%</p>
              <div class="mt-2 p-3 rounded-lg bg-gray-100">
                  <p class="font-bold text-center text-lg ${action === 'Beli' ? 'text-green-600' : 'text-red-600'}">${action}</p>
              </div>
              <button id="deep-dive-ai-btn-${model.id}" class="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center">
                  <FeatherIcon name="zap" className="mr-2" size={18}/> Dapatkan Wawasan AI Lebih Lanjut
              </button>
              <p class="text-xs text-gray-400 mt-4">*Disclaimer: Simulasi. Bukan saran finansial.</p>
          `;
          setMlAnalysisResult(resultHtml);
          setMlModelLoading(null);
      }, 2000);
  };

  useEffect(() => { 
    if(mlAnalysisResult) {
        const modelIdMatch = mlAnalysisResult.match(/id="deep-dive-ai-btn-(.*?)"/);
        if (modelIdMatch && modelIdMatch[1]) {
            const modelId = modelIdMatch[1];
            const btn = document.getElementById(`deep-dive-ai-btn-${modelId}`);
            if (btn) {
                const clickHandler = () => {
                    const [type, assetCode] = selectedAnalysisAsset.split('-');
                    const assetName = (ALL_ASSET_MASTER_DATA[assetCode] as StockDetails | CryptoDetails)?.name || assetCode;
                    const prompt = `Berikan analisis kualitatif mendalam untuk aset ${assetName} (${assetCode}), termasuk sentimen pasar, berita terkini yang relevan (jika ada data simulasi), dan faktor-faktor fundamental yang mungkin mempengaruhi pergerakannya dalam jangka pendek hingga menengah. Analisis harus mempertimbangkan model ${modelId} yang baru saja memberikan hasil.`;
                    handleGenericAICall(prompt, `Wawasan AI Lanjutan untuk ${assetCode}`, undefined, setDeepDiveAiResult, setIsDeepDiveLoading);
                };
                btn.addEventListener('click', clickHandler);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((window as any).feather) (window as any).feather.replace(); 
                return () => btn.removeEventListener('click', clickHandler); 
            }
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mlAnalysisResult, selectedAnalysisAsset, user.isPremium]);


    const handleAskAISubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!aiQuestion.trim()) return;

        if (!user.isPremium) {
            setIsPremiumModalOpen(true);
            setPendingViewAccess(View.AskAI); 
            return;
        }

        const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: aiQuestion };
        setChatMessages(prev => [...prev, newUserMessage]);
        setAiQuestion('');

        const loadingAiMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: '...', isHtml: true};
        setChatMessages(prev => [...prev, loadingAiMessage]);

        const prompt = `Pengguna bertanya: "${newUserMessage.text}". Berikan jawaban yang informatif dan relevan dengan konteks finansial atau investasi. Anda adalah seorang analis keuangan ahli.`;
        const response = await callGeminiAPI(prompt, "Anda adalah seorang analis keuangan ahli.");
        
        const finalAiMessage: ChatMessage = {
            id: loadingAiMessage.id, 
            sender: 'ai',
            text: response.text || `<p class="text-red-500">${response.error || 'Gagal memuat respons.'}</p>`,
            isHtml: true
        };
        setChatMessages(prev => prev.map(msg => msg.id === finalAiMessage.id ? finalAiMessage : msg));
    };

    const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        setUser(prev => ({ ...prev, username: editUsername, avatarUrl: editAvatarUrl || DEFAULT_AVATAR }));
        alert('Profil berhasil diperbarui!');
    };

    const handleChangePassword = () => {
        if (newPassword !== confirmNewPassword) {
            alert("Password baru dan konfirmasi tidak cocok!");
            return;
        }
        if (!oldPassword || !newPassword) {
            alert("Harap isi semua field password!");
            return;
        }
        alert('Password berhasil diubah! (Simulasi)');
        setOldPassword(''); setNewPassword(''); setConfirmNewPassword('');
    };
    
    const handleSubscribe = (plan: PlanType) => {
        const expiryDate = new Date();
        if (plan === PlanType.Monthly) {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        setUser(prev => ({ ...prev, isPremium: true, premiumExpiry: expiryDate }));
        alert('Pembayaran berhasil! Anda sekarang adalah anggota premium.');
        setIsPremiumModalOpen(false);
        if (pendingViewAccess !== null) {
            navigateTo(pendingViewAccess);
            setPendingViewAccess(null);
        }
    };
    
    const calculatePortfolioSummary = () => {
        const totalValue = portfolio.reduce((acc, asset) => acc + (asset.currentPrice * asset.amount * (asset.type === AssetType.Stock ? 100 : 1)), 0);
        const totalInvestment = portfolio.reduce((acc, asset) => acc + (asset.avgBuy * asset.amount * (asset.type === AssetType.Stock ? 100 : 1)), 0);
        const totalProfitLoss = totalValue - totalInvestment;
        return { totalValue, totalProfitLoss };
    };

    const { totalValue: portfolioTotalValue, totalProfitLoss: portfolioTotalProfitLoss } = calculatePortfolioSummary();

    const handleSelectNewsArticle = (article: NewsArticle) => {
        setSelectedNewsArticle(article);
    };

    const handleBackToNewsList = () => {
        setSelectedNewsArticle(null);
    };

    const renderView = () => {
        switch (currentView) {
            case View.Login:
                return (
                    <div className="flex items-center justify-center h-screen bg-gray-100">
                        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg m-4">
                            <div className="text-center mb-8">
                                <FeatherIcon name="trending-up" className="inline-block mx-auto text-green-600" size={48} />
                                <h1 className="text-3xl font-bold text-gray-900 mt-2">FINAI<span className="text-green-600">LYTICS</span></h1>
                                <p className="text-gray-500">Silakan masuk untuk melanjutkan</p>
                            </div>
                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input type="text" id="username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" id="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300">Masuk</button>
                            </form>
                            <p className="text-center text-sm text-gray-600 mt-6">
                                Belum punya akun? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.Register); }} className="font-medium text-green-600 hover:underline">Daftar di sini</a>
                            </p>
                        </div>
                    </div>
                );
            case View.Register:
                 return (
                    <div className="flex items-center justify-center h-screen bg-gray-100">
                        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg m-4">
                            <h1 className="text-2xl font-bold text-center mb-6">Buat Akun Baru</h1>
                            <form onSubmit={handleContinueRegister}>
                                <div className="mb-4">
                                    <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input type="text" id="reg-username" value={regUsername} onChange={e => setRegUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required/>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" id="reg-password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required/>
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                                    <input type="password" id="reg-confirm-password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required/>
                                </div>
                                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">Lanjutkan</button>
                            </form>
                            <p className="text-center text-sm text-gray-600 mt-6">
                                Sudah punya akun? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.Login); }} className="font-medium text-green-600 hover:underline">Masuk</a>
                            </p>
                        </div>
                    </div>
                );
            case View.RiskAssessment:
                return (
                    <div className="flex items-center justify-center min-h-screen py-10 bg-gray-100">
                        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-lg m-4">
                            <h1 className="text-2xl font-bold text-center mb-2">Kuesioner Profil Risiko</h1>
                            <p className="text-center text-gray-500 mb-8">Jawab pertanyaan berikut untuk membantu kami memahami profil risiko Anda.</p>
                            <div className="space-y-6">
                                {RISK_QUESTIONS_DATA.map((item: RiskQuestion, index: number) => (
                                    <div key={index}>
                                        <p className="font-medium mb-2">{index + 1}. {item.q}</p>
                                        <div className="space-y-2">
                                            {item.o.map((opt: RiskQuestionOption) => (
                                                <label key={opt.v} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name={`risk-q-${index}`} 
                                                        value={opt.v} 
                                                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                        onChange={() => handleRiskAnswerChange(index, opt.v)}
                                                        checked={riskAnswers[index] === opt.v}
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700">{opt.t}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleCompleteRegister} className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">
                                Selesaikan Pendaftaran & Masuk
                            </button>
                        </div>
                    </div>
                );
            default: // Authenticated views
                return (
                    <div className="flex h-screen bg-gray-100"> {/* Root container for sidebar + main content area */}
                        {/* Sidebar */}
                        <aside 
                            id="app-sidebar"
                            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white text-gray-800 shadow-lg flex flex-col 
                                       transform transition-transform duration-300 ease-in-out 
                                       md:relative md:translate-x-0 md:shadow-lg
                                       ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                            aria-hidden={!isMobileSidebarOpen && window.innerWidth < 768}
                        >
                            <div className="p-6 text-2xl font-bold text-gray-900 border-b">
                                <FeatherIcon name="trending-up" className="inline-block mr-2 text-green-600" />FINAI<span className="text-green-600">LYTICS</span>
                            </div>
                            <nav className="flex-1 p-4 space-y-2">
                                {[
                                    { view: View.Dashboard, label: 'Dasbor', icon: 'home' },
                                    { view: View.Portfolio, label: 'Portofolio', icon: 'briefcase' },
                                    { view: View.News, label: 'Berita & Edukasi', icon: 'globe' },
                                    { view: View.Analysis, label: 'Analisis Aset', icon: 'bar-chart-2', premium: true },
                                    { view: View.AskAI, label: 'Tanya AI', icon: 'message-square', premium: true },
                                    { view: View.Settings, label: 'Pengaturan', icon: 'settings' },
                                ].map(item => (
                                    <a
                                        key={item.label}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (item.premium && !user.isPremium) {
                                                setIsPremiumModalOpen(true);
                                                setPendingViewAccess(item.view);
                                                if (window.innerWidth < 768) setIsMobileSidebarOpen(false); // Close sidebar if premium modal opens
                                            } else {
                                                navigateTo(item.view); // navigateTo will handle closing sidebar on mobile
                                            }
                                        }}
                                        className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${currentView === item.view ? 'bg-green-600 text-white' : 'hover:bg-green-100 hover:text-green-700'}`}
                                    >
                                        <FeatherIcon name={item.icon} className="mr-3" /> {item.label}
                                        {item.premium && !user.isPremium && <span className="ml-auto bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">PRO</span>}
                                    </a>
                                ))}
                            </nav>
                            <div className="p-4 border-t">
                                <div className="flex items-center">
                                    <img src={user.avatarUrl} alt="User Avatar" className="rounded-full w-10 h-10 object-cover" onError={(e) => e.currentTarget.src = DEFAULT_AVATAR} />
                                    <div className="ml-3">
                                        <p className="font-semibold">{user.username}</p>
                                        <p className="text-sm text-gray-500">{user.isPremium ? USER_STATUS_PREMIUM : USER_STATUS_FREE}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setLoginUsername(''); setLoginPassword(''); navigateTo(View.Login);}} className="mt-4 w-full text-sm text-red-500 hover:text-red-700 p-2 rounded border border-red-300 hover:bg-red-50 flex items-center justify-center">
                                    <FeatherIcon name="log-out" className="mr-2" size={16}/> Keluar
                                </button>
                            </div>
                        </aside>

                        {/* Main Content Area Wrapper */}
                        <div className="flex-1 flex flex-col overflow-x-hidden"> {/* Handles overflow for main content and header */}
                            {/* Header for Hamburger Menu (Mobile Only) */}
                            <header className="md:hidden bg-white shadow-md p-3 flex items-center justify-between sticky top-0 z-20"> {/* Sticky mobile header */}
                                <button 
                                    onClick={() => setIsMobileSidebarOpen(true)}
                                    className="text-gray-700 p-2 -ml-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    aria-label="Open menu"
                                    aria-expanded={isMobileSidebarOpen}
                                    aria-controls="app-sidebar"
                                >
                                    <FeatherIcon name="menu" size={24} />
                                </button>
                                <div className="text-lg font-bold text-gray-900">
                                    FINAI<span className="text-green-600">LYTICS</span>
                                </div>
                                <div className="w-8"> {/* Spacer to balance menu icon on the left */} </div>
                            </header>

                            {/* Scrollable Main Content */}
                            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                                {currentView === View.Dashboard && (
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Selamat Datang di Dasbor Anda</h1>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                                            <SummaryCard title="Nilai Portofolio" value={`Rp ${portfolioTotalValue.toLocaleString('id-ID')}`} trendText="+2.5% hari ini" trendIcon="arrow-up-right" />
                                            <SummaryCard title="Keuntungan/Kerugian" value={`${portfolioTotalProfitLoss >=0 ? '+' : ''}Rp ${portfolioTotalProfitLoss.toLocaleString('id-ID')}`} subValue={portfolioTotalProfitLoss >= 0 ? undefined : undefined} trendColorClass={portfolioTotalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'} trendText="Total sejak investasi" />
                                            <SummaryCard title="Aset Terbaik" value="BBCA" trendText="+15.8%" trendIcon="trending-up" />
                                            <SummaryCard title="Tingkat Risiko" value={user.riskProfile} trendColorClass={getRiskProfileColor(user.riskProfile)} trendText="Hasil kuesioner"/>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                            <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-md"><h2 className="text-xl font-bold mb-4">Kinerja Portofolio</h2><canvas ref={portfolioCanvasRef}></canvas></div>
                                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md"><h2 className="text-xl font-bold mb-4">Alokasi Aset</h2><canvas ref={allocationCanvasRef}></canvas></div>
                                        </div>
                                    </div>
                                )}
                                {currentView === View.Portfolio && (
                                    <div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                                            <h1 className="text-2xl sm:text-3xl font-bold">Portofolio Aset Pribadi</h1>
                                            <button onClick={handleAnalyzePortfolioAI} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center self-start sm:self-center">
                                                <FeatherIcon name="zap" className="mr-2" size={18} /> Analisis AI
                                            </button>
                                        </div>
                                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-8">
                                            <h2 className="text-xl font-bold mb-4">Tambah Aset Baru</h2>
                                            <form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                                <div className="lg:col-span-1">
                                                    <label htmlFor="add-asset-type" className="block text-sm font-medium text-gray-700 mb-1">Tipe Aset</label>
                                                    <select id="add-asset-type" value={addAssetType} onChange={e => { setAddAssetType(e.target.value as AssetType); setAddAssetCode(Object.keys(e.target.value === AssetType.Stock ? STOCK_MASTER_DATA : CRYPTO_MASTER_DATA)[0] || ''); }} className="w-full p-2 border border-gray-300 rounded-lg">
                                                        <option value={AssetType.Stock}>Saham</option>
                                                        <option value={AssetType.Crypto}>Kripto</option>
                                                    </select>
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label htmlFor="add-asset-code" className="block text-sm font-medium text-gray-700 mb-1">Kode Aset</label>
                                                    <select id="add-asset-code" value={addAssetCode} onChange={e => setAddAssetCode(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                                        {assetCodeOptions(addAssetType)}
                                                    </select>
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label htmlFor="add-asset-amount" className="block text-sm font-medium text-gray-700 mb-1">Jumlah {addAssetType === AssetType.Stock ? '(Lot)' : ''}</label>
                                                    <input type="number" step="any" id="add-asset-amount" value={addAssetAmount} onChange={e => setAddAssetAmount(e.target.value)} min="0" className="w-full p-2 border border-gray-300 rounded-lg" placeholder={addAssetType === AssetType.Stock ? "e.g., 10" : "e.g., 0.1"} />
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label htmlFor="add-asset-avg-price" className="block text-sm font-medium text-gray-700 mb-1">Harga Beli Rata-rata</label>
                                                    <input type="number" step="any" id="add-asset-avg-price" value={addAssetAvgPrice} onChange={e => setAddAssetAvgPrice(e.target.value)} min="1" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g., 5000" />
                                                </div>
                                                <div className="lg:col-span-1"><button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition duration-300 h-full">Tambah</button></div>
                                            </form>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                                            <table className="w-full text-left min-w-[1000px]">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        {['Kode Aset', 'Nama Aset', 'Tipe', 'Jumlah', 'Harga Beli Rata-rata', 'Harga Saat Ini', 'Keuntungan/Kerugian', 'Aksi'].map(header => (
                                                            <th key={header} className={`p-4 font-semibold ${header === 'Aksi' ? 'text-right' : ''}`}>{header}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {portfolio.map((asset, index) => {
                                                        const multiplier = asset.type === AssetType.Stock ? 100 : 1;
                                                        const profitLoss = (asset.currentPrice - asset.avgBuy) * asset.amount * multiplier;
                                                        return (
                                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                                <td className="p-4 font-bold">{asset.code}</td>
                                                                <td className="p-4">{asset.name}</td>
                                                                <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${asset.type === AssetType.Stock ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}</span></td>
                                                                <td className="p-4">{asset.amount.toLocaleString('id-ID')} {asset.type === AssetType.Stock ? 'Lot' : ''}</td>
                                                                <td className="p-4">Rp {asset.avgBuy.toLocaleString('id-ID')}</td>
                                                                <td className="p-4">Rp {asset.currentPrice.toLocaleString('id-ID')}</td>
                                                                <td className={`p-4 font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>Rp {profitLoss.toLocaleString('id-ID')}</td>
                                                                <td className="p-4 text-right"><button onClick={() => handleDeleteAsset(index)} className="text-red-500 hover:text-red-700"><FeatherIcon name="trash-2" className="w-5 h-5" /></button></td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            {portfolio.length === 0 && <p className="p-4 text-center text-gray-500">Portofolio Anda kosong.</p>}
                                        </div>
                                    </div>
                                )}
                                {currentView === View.News && (
                                    <div>
                                        {selectedNewsArticle ? (
                                            <div className="bg-white p-4 md:p-6 lg:p-8 rounded-xl shadow-md">
                                                <button 
                                                    onClick={handleBackToNewsList} 
                                                    className="mb-6 inline-flex items-center text-green-600 hover:text-green-800 transition-colors duration-200 group"
                                                >
                                                    <FeatherIcon name="arrow-left" className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
                                                    Kembali ke Daftar Berita
                                                </button>
                                                <img 
                                                    src={selectedNewsArticle.image} 
                                                    alt={selectedNewsArticle.title} 
                                                    className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-lg mb-6 shadow-sm"
                                                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/fallback_large/800/400')}
                                                />
                                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-gray-900">{selectedNewsArticle.title}</h1>
                                                <div className="flex items-center text-sm text-gray-500 mb-6 border-b pb-4">
                                                    <FeatherIcon name="edit-3" size={14} className="mr-1.5 text-gray-400"/>
                                                    <span>{selectedNewsArticle.source}</span>
                                                    <span className="mx-2 text-gray-400">&bull;</span>
                                                    <FeatherIcon name="calendar" size={14} className="mr-1.5 text-gray-400"/>
                                                    <span>{selectedNewsArticle.date}</span>
                                                </div>
                                                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                                  <p className="whitespace-pre-line">{selectedNewsArticle.snippet}</p> 
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h1 className="text-2xl sm:text-3xl font-bold mb-6">Berita Pasar Terkini</h1>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                                    {NEWS_DATA.map((article, index) => (
                                                        <NewsArticleCard 
                                                            key={index} 
                                                            article={article} 
                                                            onClick={() => handleSelectNewsArticle(article)}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {currentView === View.Analysis && (
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Analisis Aset Individual</h1>
                                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-8">
                                            <label htmlFor="asset-select" className="block text-sm font-medium text-gray-700 mb-2">Pilih Aset:</label>
                                            <select id="asset-select" value={selectedAnalysisAsset} onChange={e => { setSelectedAnalysisAsset(e.target.value); setMlAnalysisResult(null); setDeepDiveAiResult(null);}} className="w-full md:w-1/2 lg:w-1/3 p-2 border border-gray-300 rounded-lg">
                                                <optgroup label="Saham">
                                                    {Object.keys(STOCK_MASTER_DATA).map(code => <option key={`stock-${code}`} value={`stock-${code}`}>{code} - {STOCK_MASTER_DATA[code].name}</option>)}
                                                </optgroup>
                                                <optgroup label="Kripto">
                                                    {Object.keys(CRYPTO_MASTER_DATA).map(code => <option key={`crypto-${code}`} value={`crypto-${code}`}>{code} - {CRYPTO_MASTER_DATA[code].name}</option>)}
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                            <div className="lg:col-span-2 space-y-6 md:space-y-8">
                                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                                                    <h2 className="text-xl md:text-2xl font-bold mb-4">Analisis Fundamental ({selectedAnalysisAsset.split('-')[1]})</h2>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {(ALL_ASSET_MASTER_DATA[selectedAnalysisAsset.split('-')[1]] as StockDetails | CryptoDetails)?.fundamentals && Object.entries((ALL_ASSET_MASTER_DATA[selectedAnalysisAsset.split('-')[1]] as StockDetails | CryptoDetails).fundamentals).map(([key, val]: [string, FundamentalDataItem[string]]) => (
                                                            <div key={key} className="bg-gray-100 p-3 md:p-4 rounded-lg text-center"><p className="text-xs sm:text-sm text-gray-500">{key}</p><p className="text-base sm:text-lg font-bold">{val}</p></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-md"><h2 className="text-lg md:text-xl font-bold mb-4">Analisis Harga Aset ({selectedAnalysisAsset.split('-')[1]})</h2><canvas ref={assetAnalysisCanvasRef}></canvas></div>
                                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-md"><h2 className="text-lg md:text-xl font-bold mb-4">Volume Perdagangan</h2><canvas ref={volumeCanvasRef}></canvas></div>
                                                <div className="bg-white p-4 md:p-6 rounded-xl shadow-md"><h2 className="text-lg md:text-xl font-bold mb-4">Stochastic Oscillator</h2><canvas ref={stochasticCanvasRef}></canvas></div>
                                            </div>
                                            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                                                <h2 className="text-lg md:text-xl font-bold mb-4">Pilih Model Prediksi</h2>
                                                <ul className="space-y-1">
                                                    {ANALYSIS_MODELS.map(model => (
                                                        <li key={model.id} onClick={() => handleRunMLAnalysis(model)} className="p-3 border-b rounded-md hover:bg-green-50 cursor-pointer transition-colors duration-200">
                                                            <p className="font-semibold text-green-700">{model.name}</p>
                                                            <p className="text-xs text-gray-600">{model.desc}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-4">
                                                  {mlModelLoading && ANALYSIS_MODELS.find(m => m.id === mlModelLoading) && (
                                                    <div className="flex items-center justify-center p-4">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                        <p className="ml-3 text-gray-600">Menganalisis dengan {ANALYSIS_MODELS.find(m => m.id === mlModelLoading)?.name}...</p>
                                                    </div>
                                                  )}
                                                  {!mlModelLoading && mlAnalysisResult && <div className="ai-content" dangerouslySetInnerHTML={{ __html: mlAnalysisResult }} />}
                                                  {!mlModelLoading && !mlAnalysisResult && <p className="text-sm text-gray-500">Pilih model di atas untuk memulai analisis.</p>}
                                                  
                                                  {isDeepDiveLoading && (
                                                    <div className="flex items-center justify-center p-4 mt-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                                        <p className="ml-2 text-sm text-gray-600">AI memuat wawasan lanjutan...</p>
                                                    </div>
                                                  )}
                                                  {!isDeepDiveLoading && deepDiveAiResult && <div className="mt-4 pt-4 border-t ai-content" dangerouslySetInnerHTML={{ __html: deepDiveAiResult }} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {currentView === View.AskAI && (
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Tanya AI tentang Aset Finansial</h1>
                                        <div className="bg-white rounded-xl shadow-md h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)] flex flex-col"> {/* Adjusted height for mobile header */}
                                            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                                                {chatMessages.map(msg => (
                                                    <div key={msg.id} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`p-3 rounded-lg max-w-md sm:max-w-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                            {msg.isHtml ? <div className="ai-content" dangerouslySetInnerHTML={{ __html: msg.text }} /> : <p>{msg.text}</p>}
                                                             {msg.sender === 'ai' && msg.text === "..." &&  
                                                                <div className="flex items-center justify-center">
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                                                    <span className="ml-2 text-sm">AI berpikir...</span>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 md:p-4 border-t bg-gray-50">
                                                <form onSubmit={handleAskAISubmit} className="flex items-center space-x-2 sm:space-x-4">
                                                    <input type="text" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Ketik pertanyaan Anda..." />
                                                    <button type="submit" className="bg-green-600 text-white font-bold p-3 rounded-lg hover:bg-green-700 transition duration-300"><FeatherIcon name="send" className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {currentView === View.Settings && (
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Pengaturan Akun</h1>
                                        <div className="bg-white p-4 md:p-8 rounded-xl shadow-md mb-8">
                                            <h2 className="text-xl md:text-2xl font-bold mb-6">Profil</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                                    <input type="text" id="edit-username" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                                                </div>
                                                <div>
                                                    <label htmlFor="edit-avatar-upload" className="block text-sm font-medium text-gray-700 mb-1">Foto Profil Baru</label>
                                                    <input 
                                                        type="file" 
                                                        id="edit-avatar-upload" 
                                                        onChange={handleAvatarUpload} 
                                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                                                        accept="image/*" 
                                                    />
                                                     <div className="mt-4">
                                                        <p className="text-xs font-medium text-gray-600 mb-1">Preview / Foto Saat Ini:</p>
                                                        <img 
                                                            src={editAvatarUrl || DEFAULT_AVATAR} 
                                                            alt="Avatar Preview" 
                                                            className="w-24 h-24 rounded-full object-cover border border-gray-200" 
                                                            onError={(e) => e.currentTarget.src = DEFAULT_AVATAR} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={handleSaveProfile} className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Simpan Profil</button>
                                        </div>
                                        <div className="bg-white p-4 md:p-8 rounded-xl shadow-md mb-8">
                                            <h2 className="text-xl md:text-2xl font-bold mb-6">Keamanan</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div><label htmlFor="old-password" className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label><input type="password" id="old-password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
                                                <div><label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label><input type="password" id="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
                                                <div><label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label><input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" /></div>
                                            </div>
                                            <button onClick={handleChangePassword} className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Ubah Password</button>
                                        </div>
                                        <div className="bg-white p-4 md:p-8 rounded-xl shadow-md">
                                            <h2 className="text-xl md:text-2xl font-bold mb-6">Langganan</h2>
                                            {user.isPremium ? (
                                                <>
                                                    <p className="text-lg font-semibold text-green-600">Anda Pengguna Premium</p>
                                                    <p className="text-sm text-gray-500">Berlaku hingga {user.premiumExpiry ? user.premiumExpiry.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tidak terbatas'}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-lg font-semibold">Anda Pengguna Gratis</p>
                                                    <button onClick={() => setIsPremiumModalOpen(true)} className="mt-2 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600">Upgrade Sekarang</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </main>
                        </div>

                        {/* Overlay for mobile sidebar */}
                        {isMobileSidebarOpen && (
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                                onClick={() => setIsMobileSidebarOpen(false)}
                                aria-hidden="true"
                            ></div>
                        )}
                    </div>
                );
        }
    };
    
    return (
        <>
            {renderView()}
            <AIAnalysisModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
                title={aiModalTitle} 
                content={aiModalContent}
                isLoading={isAiModalLoading}
            />
            <PremiumModal 
                isOpen={isPremiumModalOpen}
                onClose={() => {setIsPremiumModalOpen(false); setPendingViewAccess(null);}}
                onSubscribe={handleSubscribe}
                currentRiskProfile={user.riskProfile}
            />
        </>
    );
};

export default App;
