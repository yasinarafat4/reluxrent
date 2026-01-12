import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';

export function convertAndFormatToActiveCurrency(currency, price) {
  const { activeCurrency } = useReluxRentAppContext();

  const fromRate = parseFloat(currency?.exchangeRate);
  const toRate = parseFloat(activeCurrency?.exchangeRate);

  if (!fromRate || !toRate) return null;

  const exchangeRate = toRate / fromRate;

  const convertedPrice = price * exchangeRate;

  const formattedBasePrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: activeCurrency?.code,
    minimumFractionDigits: activeCurrency?.decimalPlaces ?? 2,
    maximumFractionDigits: activeCurrency?.decimalPlaces ?? 2,
  }).format(convertedPrice);

  return formattedBasePrice;
}

export function convertAndFormatBookedCurrency({orderCurrency, exchangeRateToBase, exchangeRatePropertyToBase, price}) {
  const convertedPrice = (price * exchangeRatePropertyToBase) / exchangeRateToBase;
  const formattedBasePrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: orderCurrency?.code,
    minimumFractionDigits: orderCurrency?.decimalPlaces ?? 2,
    maximumFractionDigits: orderCurrency?.decimalPlaces ?? 2,
  }).format(convertedPrice);

  return formattedBasePrice;
}

export function convertAndFormatToDefaultCurrency(excRate, price) {
  const { defaultCurrency } = useReluxRentAppContext();

  const fromRate = parseFloat(excRate);
  const toRate = parseFloat(defaultCurrency?.exchangeRate);

  if (!fromRate || !toRate) return null;

  const exchangeRate = toRate / fromRate;
  const convertedPrice = price * exchangeRate;
  const formattedBasePrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: defaultCurrency?.code,
    minimumFractionDigits: defaultCurrency?.decimalPlaces ?? 2,
    maximumFractionDigits: defaultCurrency?.decimalPlaces ?? 2,
  }).format(convertedPrice);

  return formattedBasePrice;
}

//
export function AdminConvertAndFormatToDefaultCurrency(exchangeRate, price) {
  const { defaultCurrency } = useReluxRentAppContext();

  const convertedPrice = price * exchangeRate;
  const formattedBasePrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: defaultCurrency?.code,
    minimumFractionDigits: defaultCurrency?.decimalPlaces ?? 2,
    maximumFractionDigits: defaultCurrency?.decimalPlaces ?? 2,
  }).format(convertedPrice);

  return formattedBasePrice;
}

export function formatPrice(currency, price) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency?.code,
    minimumFractionDigits: currency?.decimalPlaces ?? 2,
    maximumFractionDigits: currency?.decimalPlaces ?? 2,
  }).format(price);

  return formattedPrice;
}
