function formatPrice(currency, price) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency?.code,
    minimumFractionDigits: currency?.decimalPlaces ?? 2,
    maximumFractionDigits: currency?.decimalPlaces ?? 2,
  }).format(price);

  return formattedPrice;
}

 function convertAndFormatBookedCurrency({orderCurrency, exchangeRateToBase, exchangeRatePropertyToBase, price}) {
  const convertedPrice = (price * exchangeRatePropertyToBase) / exchangeRateToBase;
  const formattedBasePrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: orderCurrency?.code,
    minimumFractionDigits: orderCurrency?.decimalPlaces ?? 2,
    maximumFractionDigits: orderCurrency?.decimalPlaces ?? 2,
  }).format(convertedPrice);

  return formattedBasePrice;
}

module.exports = { formatPrice, convertAndFormatBookedCurrency };