const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export interface ConversionResult {
  original: number;
  converted: number;
  from: string;
  to: string;
  rate: number;
}

// Currency symbols
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: "$",
  CAD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CNY: "¥",
  RWF: "RF",
};

// Simple exchange rates (approximate, for demo purposes)
// In production, these would come from an API
const EXCHANGE_RATES_FROM_CAD: { [key: string]: number } = {
  CAD: 1,
  USD: 0.73,
  EUR: 0.67,
  GBP: 0.57,
  JPY: 108.5,
  AUD: 1.09,
  CNY: 5.18,
  RWF: 973.2,
};

// Format currency with symbol and convert from CAD if needed
export function formatCurrency(valueInCAD: number, targetCurrency: string = "CAD"): string {
  const rate = EXCHANGE_RATES_FROM_CAD[targetCurrency] || 1;
  const convertedValue = valueInCAD * rate;
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || "$";
  return `${symbol}${convertedValue.toFixed(2)}`;
}

export async function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<ConversionResult | null> {
  try {
    if (fromCurrency === toCurrency) {
      return {
        original: amount,
        converted: amount,
        from: fromCurrency,
        to: toCurrency,
        rate: 1
      };
    }

    const response = await fetch(`${BASE_URL}/${fromCurrency}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    const rate = data.rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Conversion rate not available for ${toCurrency}`);
    }
    
    const convertedAmount = amount * rate;
    
    return {
      original: amount,
      converted: convertedAmount,
      from: fromCurrency,
      to: toCurrency,
      rate: rate
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    return null;
  }
}

// Common currencies for your app
export const SUPPORTED_CURRENCIES = {
  CAD: 'Canadian Dollar',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan',
  RWF: 'Rwandan Franc',
};