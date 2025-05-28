export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Cannot determine on the server
  }

  // Check user agent for common mobile keywords
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
    return true;
  }

  // Check screen width as a fallback (adjust threshold as needed)
  if (window.innerWidth <= 768) {
    return true;
  }

  return false;
};

// You might want to add other detection functions here if needed, e.g., isTablet

