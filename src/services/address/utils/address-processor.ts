
export const sanitizeSearchTerm = (searchTerm: string): string => {
  // Remove special characters except spaces, letters, numbers, and basic punctuation
  return searchTerm
    .replace(/[^\w\s,-]/gi, '')
    .trim();
};

export const formatPostcodeForDisplay = (postcode: string): string => {
  return postcode.toUpperCase().trim();
};

export const isValidPostcode = (postcode: string): boolean => {
  const regex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return regex.test(postcode.trim());
};
