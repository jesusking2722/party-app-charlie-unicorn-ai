export const extractNumericPrice = (formattedPrice: string): number => {
  if (!formattedPrice) return 0;

  // Remove all currency symbols, whitespace and non-numeric characters
  // except for the decimal point and minus sign
  const cleanedString = formattedPrice.replace(/[^\d.-]/g, "");

  // Parse the string to a floating-point number
  const numericValue = parseFloat(cleanedString);

  // Return 0 if the result is NaN
  return isNaN(numericValue) ? 0 : numericValue;
};
