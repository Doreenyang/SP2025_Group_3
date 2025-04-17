import Cookies from 'js-cookie';

const COOKIE_NAME = 'user_preferences';
const COOKIE_EXPIRY_DAYS = 30;
const MAX_TRACKED_ITEMS = 20;

// Helper function to safely parse cookies
const getSafePreferences = () => {
  try {
    return Cookies.get(COOKIE_NAME) 
      ? JSON.parse(Cookies.get(COOKIE_NAME))
      : { productInteractions: [] };
  } catch (e) {
    console.error("Error parsing preferences cookie", e);
    return { productInteractions: [] };
  }
};

export const trackUserInteraction = (interactionType, data) => {
  const preferences = getSafePreferences();
  
  // Validate required fields
  if (!data?.productId) {
    console.error("Invalid interaction data", data);
    return;
  }

  // Remove existing entry if present
  preferences.productInteractions = (preferences.productInteractions || [])
    .filter(item => item.productId !== data.productId);

  // Add new interaction
  preferences.productInteractions.unshift({
    productId: data.productId,
    name: data.name || `Product ${data.productId}`,
    image: data.image || null,
    season: data.season || 'all',
    interactionType,
    weight: interactionType === 'TRADE_ATTEMPT' ? 2 : 1,
    timestamp: new Date().toISOString()
  });

  // Trim to max items
  preferences.productInteractions = preferences.productInteractions.slice(0, MAX_TRACKED_ITEMS);
  preferences.lastUpdated = new Date().toISOString();
  
  Cookies.set(COOKIE_NAME, JSON.stringify(preferences), { 
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production'
  });
};

export const getRecommendedProducts = (allProducts = []) => {
  const preferences = getSafePreferences();
  const now = new Date();
  
  // Ensure we have interactions to process
  if (!preferences.productInteractions?.length) return [];
  
  // Calculate scores with time decay
  const productScores = preferences.productInteractions.reduce((scores, interaction) => {
    try {
      const daysOld = (now - new Date(interaction.timestamp)) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.max(0.1, 1 - (daysOld / 30));
      const currentScore = scores.get(interaction.productId) || 0;
      scores.set(interaction.productId, currentScore + (interaction.weight * decayFactor));
    } catch (e) {
      console.error("Error processing interaction", interaction, e);
    }
    return scores;
  }, new Map());
  
  // Convert to sorted array of products
  return Array.from(productScores.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by score descending
    .map(([productId]) => {
      try {
        // Try to find complete product data first
        const fullProduct = allProducts.find(p => p.id === productId);
        if (fullProduct) return fullProduct;
        
        // Fallback to basic info from tracking
        const interaction = preferences.productInteractions.find(i => i.productId === productId);
        return interaction ? {
          id: productId,
          product_name: interaction.name,
          product_image: interaction.image,
          season: interaction.season,
          fromCookie: true
        } : null;
      } catch (e) {
        console.error("Error mapping product", productId, e);
        return null;
      }
    })
    .filter(Boolean); // Remove any null entries
};