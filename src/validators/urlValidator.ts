export const urlValidator = (url: string): boolean => {
  if (!url) return true;
  return url.startsWith('http://') || url.startsWith('https://');
};
//TOASK il n'est pas obligatoire mais met faux si pas indiqué