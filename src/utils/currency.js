// Indian Currency Formatting Utility
export const formatIndianCurrency = (amount) => {
  if (!amount || amount === 0) return '₹0';
  
  // Convert to number if it's a string
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle negative numbers
  const isNegative = num < 0;
  const absoluteNum = Math.abs(num);
  
  // Convert to string and split
  const numStr = absoluteNum.toString();
  
  // Handle decimal places
  let integerPart = numStr;
  let decimalPart = '';
  
  if (numStr.includes('.')) {
    const parts = numStr.split('.');
    integerPart = parts[0];
    decimalPart = '.' + (parts[1] || '00').substring(0, 2);
  }
  
  // Format integer part with Indian numbering system
  let formattedInteger = '';
  const length = integerPart.length;
  
  if (length <= 3) {
    formattedInteger = integerPart;
  } else if (length > 3 && length <= 5) {
    formattedInteger = integerPart.slice(0, length - 3) + ',' + integerPart.slice(length - 3);
  } else {
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedInteger = formattedRemaining + ',' + lastThree;
  }
  
  // Combine all parts
  const result = (isNegative ? '-' : '') + '₹' + formattedInteger + decimalPart;
  
  return result;
};

// Parse Indian currency string back to number
export const parseIndianCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and commas
  const cleaned = currencyString.replace(/[₹,]/g, '');
  
  // Convert to number
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
};

// Input formatter for real-time formatting
export const formatIndianCurrencyInput = (value) => {
  if (!value) return '';
  
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Split into integer and decimal parts
  const parts = cleaned.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1].substring(0, 2) : '';
  
  // Format integer part
  if (integerPart.length > 3) {
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = formattedRemaining + ',' + lastThree;
  }
  
  return integerPart + decimalPart;
};
