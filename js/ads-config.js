/* Google AdSense Centralized Configuration */
window.OMNI_ADS_CONFIG = {
  // Replace with your Google AdSense Publisher ID (e.g., 'pub-8836410103198896')
  publisherId: 'ca-pub-8836410103198896',
  
  // Ad Slot IDs (Replace with your created units from Google AdSense dashboard)
  slots: {
    headerLeaderboard: '1000000001',
    sidebarBanner: '2000000001',
    contentFooter: '3000000001'
  },

  // Enable/disable ad rendering for testing/production
  enabled: true
};

(function initGoogleAds() {
  if (!window.OMNI_ADS_CONFIG.enabled) return;

  const pubId = window.OMNI_ADS_CONFIG.publisherId;
  
  // Dynamically attach Google AdSense Auto-Ads Tag if not present
  if (!document.querySelector(`script[src*="adsbygoogle.js"]`)) {
    const adScript = document.createElement('script');
    adScript.async = true;
    adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
    adScript.crossOrigin = 'anonymous';
    document.head.appendChild(adScript);
  }
})();
