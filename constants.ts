import { PortfolioAsset, AssetMasterData, AssetChartMasterData, RiskQuestion, AnalysisModel, NewsArticle, AssetType, RiskProfileLevel } from './types';

export const INITIAL_PORTFOLIO_DATA: PortfolioAsset[] = [
    { type: AssetType.Stock, code: 'BBCA', name: 'Bank Central Asia Tbk.', amount: 10, avgBuy: 9250, currentPrice: 9750 },
    { type: AssetType.Stock, code: 'TLKM', name: 'Telkom Indonesia (Persero) Tbk.', amount: 50, avgBuy: 3800, currentPrice: 3100 },
    { type: AssetType.Crypto, code: 'BTC', name: 'Bitcoin', amount: 0.05, avgBuy: 1000000000, currentPrice: 1100000000 },
];

export const STOCK_MASTER_DATA: AssetMasterData = {
    BBCA: { name: 'Bank Central Asia Tbk.', currentPrice: 9750, fundamentals: { 'P/E Ratio': 25.5, 'P/B Ratio': 4.8, 'EPS': 382, 'ROE': '18.8%' } },
    TLKM: { name: 'Telkom Indonesia (Persero) Tbk.', currentPrice: 3100, fundamentals: { 'P/E Ratio': 14.2, 'P/B Ratio': 2.5, 'EPS': 218, 'ROE': '17.6%' } },
    GOTO: { name: 'GoTo Gojek Tokopedia Tbk.', currentPrice: 55, fundamentals: { 'P/E Ratio': 'N/A', 'P/B Ratio': 0.8, 'EPS': -15, 'Market Cap': 'Rp 65T' } },
    ASII: { name: 'Astra International Tbk.', currentPrice: 5150, fundamentals: { 'P/E Ratio': 8.9, 'P/B Ratio': 1.1, 'EPS': 578, 'Dividend Yield': '5.5%' } },
    BBNI: { name: 'Bank Negara Indonesia (Persero) Tbk.', currentPrice: 4700, fundamentals: { 'P/E Ratio': 7.5, 'P/B Ratio': 1.0, 'EPS': 626, 'NIM': '4.5%' } },
    BMRI: { name: 'Bank Mandiri (Persero) Tbk.', currentPrice: 6050, fundamentals: { 'P/E Ratio': 9.2, 'P/B Ratio': 1.8, 'EPS': 657, 'CAR': '22.1%' } }
};

export const CRYPTO_MASTER_DATA: AssetMasterData = {
    BTC: { name: 'Bitcoin', currentPrice: 1100000000, fundamentals: { 'Market Cap': 'Rp 21.000T', 'Circulating Supply': '19.7M', '24h Volume': 'Rp 500T', 'Dominance': '52%' } },
    ETH: { name: 'Ethereum', currentPrice: 58000000, fundamentals: { 'Market Cap': 'Rp 7.000T', 'Circulating Supply': '120M', '24h Volume': 'Rp 250T', 'Gas Fee': '15 Gwei' } },
    DOGE: { name: 'Dogecoin', currentPrice: 2000, fundamentals: { 'Market Cap': 'Rp 280T', 'Circulating Supply': '144B', '24h Volume': 'Rp 20T', 'Inflationary': 'Yes' } },
};

export const STOCK_CHART_DATA: AssetChartMasterData = {
    BBCA: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [8800, 9100, 9300, 9250, 9500, 9750], volume: [100, 120, 110, 130, 90, 150], stochastic: { k: [70, 80, 85, 75, 88, 92], d: [65, 72, 79, 78, 82, 87] } },
    TLKM: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [4000, 3900, 3850, 3500, 3200, 3100], volume: [200, 180, 210, 250, 300, 280], stochastic: { k: [85, 60, 45, 20, 15, 10], d: [88, 75, 60, 40, 25, 15] } },
     GOTO: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [90, 85, 70, 60, 50, 55], volume: [500, 520, 510, 530, 490, 550], stochastic: { k: [40, 30, 25, 15, 10, 12], d: [45, 35, 30, 20, 15, 14] } },
    ASII: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [5500, 5400, 5300, 5200, 5100, 5150], volume: [150, 160, 140, 170, 130, 180], stochastic: { k: [60, 50, 40, 30, 25, 35], d: [65, 55, 45, 35, 30, 32] } },
    BBNI: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [4500, 4600, 4800, 4750, 4650, 4700], volume: [120, 130, 110, 140, 100, 150], stochastic: { k: [75, 85, 90, 80, 70, 78], d: [70, 78, 85, 82, 75, 77] } },
    BMRI: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [5800, 5900, 6000, 6100, 6050, 6050], volume: [180, 190, 170, 200, 160, 210], stochastic: { k: [80, 88, 92, 85, 82, 80], d: [75, 82, 88, 86, 83, 81] } },
};

export const CRYPTO_CHART_DATA: AssetChartMasterData = {
    BTC: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [950, 1000, 1150, 1050, 1080, 1100].map(p => p * 1000000), volume: [50, 60, 70, 55, 65, 80], stochastic: { k: [60, 75, 90, 70, 80, 85], d: [55, 65, 80, 75, 78, 82] } },
    ETH: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [40, 45, 55, 50, 52, 58].map(p => p * 1000000), volume: [100, 110, 130, 90, 105, 120], stochastic: { k: [50, 70, 88, 65, 75, 85], d: [45, 60, 78, 70, 72, 80] } },
    DOGE: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'], prices: [1800, 1900, 2200, 1950, 2100, 2000], volume: [1000, 1100, 1300, 900, 1050, 1200], stochastic: { k: [40, 60, 78, 55, 65, 60], d: [35, 50, 68, 60, 62, 58] } },
};

export const RISK_QUESTIONS_DATA: RiskQuestion[] = [
    { q: "Apa tujuan utama investasi Anda?", o: [{ t: "Menjaga nilai pokok modal (sangat anti risiko)", v: 1 }, { t: "Pendapatan rutin dan pertumbuhan modal minim", v: 2 }, { t: "Keseimbangan pendapatan dan pertumbuhan modal", v: 3 }, { t: "Pertumbuhan modal jangka panjang, siap hadapi fluktuasi", v: 4 }, { t: "Pertumbuhan modal maksimal (spekulasi), siap rugi besar", v: 5 }] },
    { q: "Berapa lama horizon waktu investasi Anda?", o: [{ t: "< 1 tahun", v: 1 }, { t: "1-3 tahun", v: 2 }, { t: "3-5 tahun", v: 3 }, { t: "5-10 tahun", v: 4 }, { t: "> 10 tahun", v: 5 }] },
    { q: "Jika portofolio Anda anjlok 25% dalam sebulan, apa reaksi Anda?", o: [{ t: "Panik dan jual semua aset", v: 1 }, { t: "Jual sebagian untuk mengurangi kerugian", v: 2 }, { t: "Tidak melakukan apa-apa dan menunggu", v: 3 }, { t: "Membeli lebih banyak karena harga murah (average down)", v: 4 }, {t: "Membeli lebih banyak dengan agresif", v: 5 }] },
    { q: "Berapa persen dari pendapatan Anda yang dialokasikan untuk investasi?", o: [{ t: "< 5%", v: 1 }, { t: "5-10%", v: 2 }, { t: "11-20%", v: 3 }, { t: "21-30%", v: 4 }, { t: "> 30%", v: 5 }] },
    { q: "Seberapa penting likuiditas (kemudahan aset dicairkan) bagi Anda?", o: [{ t: "Sangat penting, butuh dana cepat", v: 1 }, { t: "Cukup penting", v: 2 }, { t: "Netral", v: 3 }, { t: "Tidak terlalu penting", v: 4 }, {t: "Sama sekali tidak penting", v: 5 }] },
    { q: "Mana deskripsi yang paling cocok dengan pengetahuan investasi Anda?", o: [{ t: "Pemula, baru belajar", v: 1 }, { t: "Mengerti dasar-dasar", v: 2 }, { t: "Cukup berpengalaman", v: 3 }, { t: "Berpengalaman dan mengikuti pasar", v: 4 }, {t: "Sangat ahli, sering riset mendalam", v: 5 }] },
    { q: "Instrumen apa yang paling Anda minati?", o: [{ t: "Deposito & Obligasi Pemerintah", v: 1 }, { t: "Reksadana Pendapatan Tetap", v: 2 }, { t: "Reksadana Campuran & Saham Blue Chip", v: 3 }, { t: "Saham lapis dua/tiga & Kripto besar", v: 4 }, { t: "Kripto alternatif & instrumen derivatif", v: 5 }] },
    { q: "Seberapa nyaman Anda dengan utang untuk investasi (leverage)?", o: [{ t: "Sangat tidak nyaman", v: 1 }, { t: "Cenderung menghindari", v: 2 }, { t: "Mungkin mempertimbangkan dalam jumlah kecil", v: 3 }, { t: "Nyaman jika peluangnya bagus", v: 4 }, {t: "Sangat nyaman, bagian dari strategi", v: 5}] },
    { q: "Bagaimana perasaan Anda saat melihat keuntungan yang belum direalisasi (unrealized profit)?", o: [{ t: "Segera jual untuk mengamankan keuntungan", v: 1 }, { t: "Jual sebagian", v: 2 }, { t: "Tahan sesuai rencana awal", v: 3 }, { t: "Tahan dan berharap naik lebih tinggi", v: 4 }, {t: "Menambah posisi untuk keuntungan lebih besar", v: 5}] },
    { q: "Pilih skenario imbal hasil/risiko yang paling Anda sukai.", o: [{ t: "Untung 5%, potensi rugi 1%", v: 1 }, { t: "Untung 10%, potensi rugi 5%", v: 2 }, { t: "Untung 20%, potensi rugi 15%", v: 3 }, { t: "Untung 40%, potensi rugi 30%", v: 4 }, { t: "Untung 70%, potensi rugi 60%", v: 5 }] }
];

export const ANALYSIS_MODELS: AnalysisModel[] = [
    { id: 'lstm', name: 'LSTM', desc: 'Model deep learning untuk data sekuensial.'},
    { id: 'arima', name: 'ARIMA', desc: 'Model statistik klasik untuk data time series.'},
    { id: 'prophet', name: 'Prophet', desc: 'Model dari Facebook untuk peramalan dengan musiman.'},
    { id: 'randomforest', name: 'Random Forest', desc: 'Ensemble learning untuk akurasi prediksi.'},
    { id: 'xgboost', name: 'Gradient Boosting', desc: 'Model tree-based yang sangat populer dan kuat.'},
    { id: 'svm', name: 'Support Vector Machine', desc: 'Efektif untuk klasifikasi tren naik/turun.'}
];

export const NEWS_DATA: NewsArticle[] = [
    { category: 'Pasar Modal', title: 'IHSG Melesat 2%, Investor Masuk Ke Saham Blue Chip', source: 'Bisnis Indonesia', date: '8 Juni 2025', snippet: 'Indeks Harga Saham Gabungan (IHSG) melonjak 2% didorong oleh optimisme investor yang beralih ke saham blue chip setelah data ekonomi yang positif.', image: 'https://picsum.photos/seed/IHSG/600/400' },
    { category: 'Pasar Saham', title: 'Emiten Telekomunikasi Raih Kinerja Cemerlang di Kuartal I', source: 'Kontan', date: '8 Juni 2025', snippet: 'Beberapa emiten telekomunikasi berhasil mencatatkan kenaikan laba yang signifikan pada kuartal pertama 2025, didorong oleh peningkatan pengguna dan tarif yang stabil.', image: 'https://picsum.photos/seed/Telekomunikasi/600/400' },
    { category: 'Ekonomi Makro', title: 'Pemerintah Indonesia Tangguhkan Rencana Peningkatan Pajak', source: 'Detik Finance', date: '8 Juni 2025', snippet: 'Pemerintah Indonesia memutuskan untuk menangguhkan rencana peningkatan pajak untuk mendukung pemulihan ekonomi pasca pandemi.', image: 'https://picsum.photos/seed/Pajak/600/400' },
    { category: 'Investasi', title: 'Kepemilikan Emas Terus Meningkat, Investor Masih Optimis', source: 'Investor Daily', date: '8 Juni 2025', snippet: 'Kepemilikan emas di kalangan investor domestik terus meningkat, mengingat ketidakpastian ekonomi global dan tingginya inflasi di negara maju.', image: 'https://picsum.photos/seed/Emas/600/400' },
    { category: 'Banking', title: 'BCA Catat Laba Bersih Rp 7 Triliun di Semester I 2025', source: 'Jakarta Post', date: '8 Juni 2025', snippet: 'Bank Central Asia (BCA) mencatatkan laba bersih sebesar Rp 7 triliun di semester pertama 2025, didorong oleh pertumbuhan kredit yang kuat dan efisiensi operasional.', image: 'https://picsum.photos/seed/BBCAnews/600/400' },
    { category: 'Investasi', title: 'Reksa Dana Saham Menjadi Pilihan Investasi Populer di 2025', source: 'Tribun Finance', date: '8 Juni 2025', snippet: 'Reksa dana saham menjadi pilihan utama investor lokal di 2025, dengan banyaknya yang mencari investasi yang lebih menguntungkan dibandingkan dengan deposito.', image: 'https://picsum.photos/seed/ReksaDana/600/400' },
];

export const DEFAULT_RISK_PROFILE = RiskProfileLevel.Moderat;
export const DEFAULT_USERNAME = 'Pengguna';
export const DEFAULT_AVATAR = 'https://picsum.photos/seed/avatar/40/40';
export const USER_STATUS_FREE = 'Free User';
export const USER_STATUS_PREMIUM = 'Premium User';

export const ALL_ASSET_MASTER_DATA = { ...STOCK_MASTER_DATA, ...CRYPTO_MASTER_DATA };
export const ALL_CHART_DATA = { ...STOCK_CHART_DATA, ...CRYPTO_CHART_DATA };
