/**
 * @file imageHelpers.js
 * @description Image URL utilities and fallback handling
 * @pattern Utility Module Pattern
 */

/**
 * Default fallback image URL for events
 */
export const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80';

/**
 * Get valid image URL or fallback
 * @param {string} imageUrl - Original image URL
 * @param {string} fallback - Fallback URL (optional)
 * @returns {string} Valid image URL
 */
export const getValidImageUrl = (imageUrl, fallback = DEFAULT_EVENT_IMAGE) => {
  // Return fallback if no URL provided
  if (!imageUrl) return fallback;
  
  // Return original if it's a valid URL
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return fallback;
  }
};

/**
 * Handle image load error by setting fallback
 * @param {Event} event - Image error event
 */
export const handleImageError = (event) => {
  if (event.target.src !== DEFAULT_EVENT_IMAGE) {
    event.target.src = DEFAULT_EVENT_IMAGE;
  }
};
