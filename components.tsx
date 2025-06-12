import React, { useEffect } from 'react';
import { PlanType, RiskProfileLevel, NewsArticle as NewsArticleType } from './types'; // Added NewsArticleType

// Feather Icons require global `feather.replace()` to be called.
// This component simply renders the <i> tag, relying on a global call.
interface FeatherIconProps {
  name: string;
  className?: string;
  size?: string | number; 
}
export const FeatherIcon: React.FC<FeatherIconProps> = ({ name, className = '', size = "1em" }) => {
  const iconSize = typeof size === 'number' ? `${size}px` : size;
  return <i data-feather={name} className={className} style={{ width: iconSize, height: iconSize }}></i>;
};

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | null; // Allow null for initial state
  isLoading: boolean;
}
export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-250 ease-in-out opacity-100 pointer-events-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto ai-content">
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="ml-3 text-gray-600">AI sedang berpikir...</p>
            </div>
          )}
          {!isLoading && content && <div dangerouslySetInnerHTML={{ __html: content }} />}
          {!isLoading && !content && <p>Tidak ada konten untuk ditampilkan.</p>}
        </div>
        <div className="p-4 bg-gray-50 border-t text-xs text-gray-500">
          *Disclaimer: Analisis ini dihasilkan oleh AI dan hanya untuk tujuan informasi. Ini bukan merupakan saran finansial.
        </div>
      </div>
    </div>
  );
};

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: PlanType) => void;
  currentRiskProfile: RiskProfileLevel;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  const [view, setView] = React.useState<'plans' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = React.useState<PlanType | null>(null);
  const [selectedPrice, setSelectedPrice] = React.useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setView('plans'); // Reset to plan view when opened
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).feather) (window as any).feather.replace();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: PlanType, price: number) => {
    setSelectedPlan(plan);
    setSelectedPrice(price);
    setView('payment');
  };

  const handlePayment = () => {
    if (selectedPlan) {
      onSubscribe(selectedPlan);
      onClose(); // Close modal after successful "payment"
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-250 ease-in-out opacity-100 pointer-events-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg text-center p-8">
        {view === 'plans' && (
          <div id="plan-selection-view">
            <FeatherIcon name="lock" className="mx-auto text-yellow-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-2">Akses Fitur Premium</h2>
            <p className="text-gray-600 mb-6">Pilih paket untuk membuka semua fitur canggih, termasuk Analisis Aset dan Tanya AI tanpa batas.</p>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 border-2 border-green-500 rounded-lg p-4">
                <h3 className="text-lg font-bold">1 Bulan</h3>
                <p className="text-2xl font-bold text-green-600 my-2">Rp 8.000</p>
                <p className="text-sm text-gray-500 mb-4">Ditagih setiap bulan</p>
                <button onClick={() => handleSelectPlan(PlanType.Monthly, 8000)} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Pilih Bulanan</button>
              </div>
              <div className="flex-1 border rounded-lg p-4 hover:border-green-400">
                <h3 className="text-lg font-bold">1 Tahun</h3>
                <p className="text-2xl font-bold text-green-600 my-2">Rp 75.000</p>
                <p className="text-sm text-gray-500 mb-4">Ditagih setiap tahun</p>
                <button onClick={() => handleSelectPlan(PlanType.Yearly, 75000)} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Pilih Tahunan</button>
              </div>
            </div>
            <button onClick={onClose} className="mt-2 w-full text-sm text-gray-500 hover:text-gray-700">Lain kali</button>
          </div>
        )}
        {view === 'payment' && (
          <div id="payment-method-view">
            <h2 className="text-2xl font-bold mb-2">Pilih Metode Pembayaran</h2>
            <p className="text-gray-600 mb-6">Total Tagihan: <span className="font-bold">Rp {selectedPrice.toLocaleString('id-ID')}</span></p>
            <div className="space-y-4">
              <button onClick={handlePayment} className="w-full text-left p-4 border rounded-lg hover:bg-gray-100 flex items-center"><FeatherIcon name="credit-card" className="mr-3" />Virtual Account (Otomatis)</button>
              <button onClick={handlePayment} className="w-full text-left p-4 border rounded-lg hover:bg-gray-100 flex items-center"><FeatherIcon name="smartphone" className="mr-3" />QRIS</button>
              <button onClick={handlePayment} className="w-full text-left p-4 border rounded-lg hover:bg-gray-100 flex items-center"><FeatherIcon name="repeat" className="mr-3" />Transfer Bank (Manual)</button>
            </div>
            <button onClick={() => setView('plans')} className="mt-6 w-full text-sm text-gray-500 hover:text-gray-700">&larr; Kembali ke pilihan paket</button>
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  subValue?: string;
  trendText?: string;
  trendIcon?: string; // feather icon name
  trendColorClass?: string; // e.g. text-green-500
  iconBgClass?: string;
}
export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subValue, trendText, trendIcon, trendColorClass = 'text-green-500' }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-gray-500 text-sm font-medium">{title}</h2>
      <p className={`text-3xl font-bold mt-2 ${trendColorClass}`}>{value}</p> {/* Applied trendColorClass here too for profit/loss */}
      {subValue && <p className={`text-sm mt-1 ${trendColorClass}`}>{subValue}</p>}
      {trendText && trendIcon && (
        <p className={`text-sm flex items-center mt-1 ${title === "Nilai Portofolio" || title === "Aset Terbaik" ? 'text-green-500' : 'text-gray-500'}`}> {/* Specific color for portfolio/best asset, gray for others like risk level or P/L total */}
          <FeatherIcon name={trendIcon} className="w-4 h-4 mr-1" /> {trendText}
        </p>
      )}
      {trendText && !trendIcon && (
         <p className={`text-sm text-gray-500 mt-1`}>{trendText}</p>
      )}
    </div>
  );
};


interface NewsArticleCardProps {
  article: NewsArticleType;
  onClick: () => void;
}
export const NewsArticleCard: React.FC<NewsArticleCardProps> = ({ article, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer flex flex-col group"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()} // Accessibility for keyboard
      aria-label={`Baca artikel: ${article.title}`}
    >
      <div className="relative overflow-hidden">
        <img 
          src={article.image} 
          alt={`Gambar untuk artikel ${article.title}`}
          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" 
          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/fallback/600/400')}
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <span className="text-sm font-semibold text-green-600 mb-1">{article.category}</span>
        <h3 className="text-xl font-bold mt-1 mb-2 text-gray-800 group-hover:text-green-700 transition-colors duration-200 line-clamp-2" title={article.title}>{article.title}</h3>
        <p className="text-gray-600 text-sm mb-4 h-20 line-clamp-3 flex-grow">{article.snippet}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
          <span>{article.source}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </div>
  );
};
