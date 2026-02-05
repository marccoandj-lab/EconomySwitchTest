
import { TileType, TileData } from './types';

export const STARTING_CAPITAL = 50000;
export const WIN_THRESHOLD = 1000000;
export const BOARD_SIZE = 28; // 8x8 perimeter

const createEconomyTiles = (): TileData[] => [
  { id: 0, type: TileType.START, label: "START" },
  { id: 1, type: TileType.PROFIT, label: "Salary", amount: 20000 },
  { id: 2, type: TileType.QUESTION, label: "Finance Quiz" },
  { id: 3, type: TileType.TAX, label: "Income Tax", amount: 15000 },
  { id: 4, type: TileType.INVESTMENT, label: "Stock Market" },
  { id: 5, type: TileType.ENUM, label: "Financial Terms" },
  { id: 6, type: TileType.PROFIT, label: "Bonus", amount: 35000 },
  { id: 7, type: TileType.SWITCH, label: "SWITCH" },
  { id: 8, type: TileType.INVESTMENT, label: "Real Estate" },
  { id: 9, type: TileType.QUESTION, label: "Eco Quiz" },
  { id: 10, type: TileType.TAX, label: "VAT", amount: 25000 },
  { id: 11, type: TileType.PROFIT, label: "Dividends", amount: 45000 },
  { id: 12, type: TileType.ENUM, label: "Economic Models" },
  { id: 13, type: TileType.INVESTMENT, label: "Venture Capital" },
  { id: 14, type: TileType.JAIL, label: "JAIL" },
  { id: 15, type: TileType.TAX, label: "Fine", amount: 10000 },
  { id: 16, type: TileType.QUESTION, label: "Sustainability" },
  { id: 17, type: TileType.INVESTMENT, label: "Funds" },
  { id: 18, type: TileType.PROFIT, label: "Lottery", amount: 100000 },
  { id: 19, type: TileType.ENUM, label: "Markets" },
  { id: 20, type: TileType.TAX, label: "Property Tax", amount: 50000 },
  { id: 21, type: TileType.SWITCH, label: "SWITCH" },
  { id: 22, type: TileType.PROFIT, label: "Freelance", amount: 15000 },
  { id: 23, type: TileType.QUESTION, label: "Banking" },
  { id: 24, type: TileType.INVESTMENT, label: "Crypto" },
  { id: 25, type: TileType.TAX, label: "Luxury Tax", amount: 40000 },
  { id: 26, type: TileType.ENUM, label: "Trade" },
  { id: 27, type: TileType.PROFIT, label: "Grant", amount: 30000 },
];

const createSustainabilityTiles = (): TileData[] => [
  { id: 0, type: TileType.START, label: "NATURE START" },
  { id: 1, type: TileType.PROFIT, label: "Solar Refund", amount: 30000 },
  { id: 2, type: TileType.QUESTION, label: "Nature Quiz" },
  { id: 3, type: TileType.TAX, label: "Carbon Tax", amount: 20000 },
  { id: 4, type: TileType.INVESTMENT, label: "Green Bonds" },
  { id: 5, type: TileType.ENUM, label: "Renewables" },
  { id: 6, type: TileType.PROFIT, label: "Solar Export", amount: 15000 },
  { id: 7, type: TileType.SWITCH, label: "SWITCH" },
  { id: 8, type: TileType.PROFIT, label: "Circular Grant", amount: 40000 },
  { id: 9, type: TileType.QUESTION, label: "Ecosystems" },
  { id: 10, type: TileType.TAX, label: "Pollution Fine", amount: 50000 },
  { id: 11, type: TileType.INVESTMENT, label: "Wind Farm" },
  { id: 12, type: TileType.PROFIT, label: "Recycling Hub", amount: 25000 },
  { id: 13, type: TileType.ENUM, label: "Wildfire Prev" },
  { id: 14, type: TileType.JAIL, label: "JAIL" },
  { id: 15, type: TileType.TAX, label: "Waste Fee", amount: 15000 },
  { id: 16, type: TileType.QUESTION, label: "Climate Change" },
  { id: 17, type: TileType.INVESTMENT, label: "Reforestation" },
  { id: 18, type: TileType.PROFIT, label: "EU Subsidy", amount: 120000 },
  { id: 19, type: TileType.ENUM, label: "Conservation" },
  { id: 20, type: TileType.TAX, label: "Water Tax", amount: 30000 },
  { id: 21, type: TileType.SWITCH, label: "SWITCH" },
  { id: 22, type: TileType.INVESTMENT, label: "Eco-Tech" },
  { id: 23, type: TileType.QUESTION, label: "Bio Diversity" },
  { id: 24, type: TileType.PROFIT, label: "Organic Yield", amount: 20000 },
  { id: 25, type: TileType.TAX, label: "Soil Depletion", amount: 45000 },
  { id: 26, type: TileType.ENUM, label: "Ocean Care" },
  { id: 27, type: TileType.INVESTMENT, label: "Agroforest" },
];

export const ECONOMY_TILES = createEconomyTiles();
export const SUSTAINABILITY_TILES = createSustainabilityTiles();

export const PLAYER_COLORS = [
  '#f87171', // Red
  '#60a5fa', // Blue
  '#fbbf24', // Yellow
  '#a78bfa', // Purple
  '#34d399', // Green
  '#f472b6', // Pink
];
