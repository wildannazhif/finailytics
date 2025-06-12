import { Chart } from 'chart.js';

export enum View {
  Login,
  Register,
  RiskAssessment,
  Dashboard,
  Portfolio,
  News,
  Analysis,
  AskAI,
  Settings
}

export enum AssetType {
  Stock = 'stock',
  Crypto = 'crypto'
}

export interface User {
  username: string;
  avatarUrl: string;
  riskProfile: RiskProfileLevel;
  isPremium: boolean;
  premiumExpiry?: Date | null;
}

export interface PortfolioAsset {
  type: AssetType;
  code: string;
  name: string;
  amount: number;
  avgBuy: number;
  currentPrice: number;
}

export interface FundamentalDataItem {
  [key: string]: string | number;
}

export interface StockDetails {
  name: string;
  currentPrice: number;
  fundamentals: FundamentalDataItem;
}

export interface CryptoDetails {
  name: string;
  currentPrice: number;
  fundamentals: FundamentalDataItem;
}

export interface AssetMasterData {
  [code: string]: StockDetails | CryptoDetails;
}

export interface StochasticData {
  k: number[];
  d: number[];
}

export interface AssetChartData {
  labels: string[];
  prices: number[];
  volume: number[];
  stochastic: StochasticData;
}

export interface AssetChartMasterData {
  [code: string]: AssetChartData;
}

export interface RiskQuestionOption {
  t: string; // text
  v: number; // value
}

export interface RiskQuestion {
  q: string; // question
  o: RiskQuestionOption[]; // options
}

export enum RiskProfileLevel {
  SangatKonservatif = 'Sangat Konservatif',
  Konservatif = 'Konservatif',
  Moderat = 'Moderat',
  Agresif = 'Agresif',
  SangatAgresif = 'Sangat Agresif',
  Default = 'Moderat' 
}

export interface AnalysisModel {
  id: string;
  name: string;
  desc: string;
}

export interface NewsArticle {
  category: string;
  title: string;
  source: string;
  date: string;
  snippet: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isHtml?: boolean;
}

export interface ChartRef {
  instance: Chart | null;
}

export enum PlanType {
    Monthly = 'monthly',
    Yearly = 'yearly'
}
