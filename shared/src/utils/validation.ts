export const isValidDeckStatus = (status: string): boolean => {
  return ['draft', 'processing', 'completed', 'error'].includes(status);
};

export const isValidProxyStatus = (status: string): boolean => {
  return ['pending', 'processing', 'completed', 'error'].includes(status);
};

export const isValidRerollAspect = (aspect: string): boolean => {
  return ['name', 'flavor', 'art', 'all'].includes(aspect);
};