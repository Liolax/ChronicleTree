// src/services/sharing.js
import api from '../api/api';

/**
 * Create a share for tree content
 * @param {Object} shareData - Share data object
 * @param {string} shareData.content_type - Type of content ('tree' or 'profile')
 * @param {number} shareData.content_id - ID of the content (person ID for tree root or profile)
 * @param {string} shareData.platform - Platform to share to ('facebook', 'twitter', 'whatsapp', 'email', 'copy')
 * @param {string} shareData.caption - Optional caption for the share
 * @returns {Promise} - Promise resolving to share response
 */
export const createShare = async (shareData) => {
  try {
    const response = await api.post('/shares', {
      share: shareData
    });
    return response.data;
  } catch (error) {
    console.error('Error creating share:', error);
    throw error;
  }
};

/**
 * Get share information by token
 * @param {string} shareToken - Share token
 * @returns {Promise} - Promise resolving to share information
 */
export const getShare = async (shareToken) => {
  try {
    const response = await api.get(`/shares/${shareToken}`);
    return response.data;
  } catch (error) {
    console.error('Error getting share:', error);
    throw error;
  }
};

/**
 * Generate share content for tree
 * @param {number} rootPersonId - Root person ID (optional, null for full tree)
 * @param {string} caption - Optional caption
 * @returns {Object} - Share content object
 */
export const generateTreeShareContent = (rootPersonId, caption = '') => {
  return {
    content_type: 'tree',
    content_id: rootPersonId,
    caption: caption
  };
};

/**
 * Generate share content for profile
 * @param {number} personId - Person ID
 * @param {string} caption - Optional caption
 * @returns {Object} - Share content object
 */
export const generateProfileShareContent = (personId, caption = '') => {
  return {
    content_type: 'profile',
    content_id: personId,
    caption: caption
  };
};

/**
 * Handle social media sharing
 * @param {string} platform - Platform to share to
 * @param {Object} shareContent - Share content object
 * @returns {Promise} - Promise resolving to share URL
 */
export const handleSocialShare = async (platform, shareContent) => {
  try {
    const shareData = {
      ...shareContent,
      platform: platform
    };
    
    const response = await createShare(shareData);
    
    if (response.success) {
      if (platform === 'copy') {
        // For copy, we handle it differently
        await navigator.clipboard.writeText(response.share_url);
        return { success: true, message: 'Link copied to clipboard!' };
      } else {
        // For other platforms, open the share URL
        window.open(response.share_url, '_blank');
        return { success: true, message: 'Share window opened!' };
      }
    } else {
      throw new Error(response.error || 'Failed to create share');
    }
  } catch (error) {
    console.error('Error in social share:', error);
    throw error;
  }
};