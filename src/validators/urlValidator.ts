export const urlValidator = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};
