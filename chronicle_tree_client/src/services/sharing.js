// Social media sharing service with platform-specific content generation
import api from '../api/api';

/**
 * Creates shareable links for family tree content across different platforms
 * @param {Object} shareData - Share configuration object
 * @param {string} shareData.content_type - Type of content ('tree' or 'profile')
 * @param {number} shareData.content_id - Content identifier
 * @param {string} shareData.platform - Target sharing platform
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
    throw error;
  }
};

/**
 * Retrieves existing share information using unique share token
 * @param {string} shareToken - Unique share identifier
 * @returns {Promise} - Promise resolving to share information
 */
export const getShare = async (shareToken) => {
  try {
    const response = await api.get(`/shares/${shareToken}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Generates shareable content for family tree visualization
 * @param {number} rootPersonId - Root person ID (optional, null for full tree)
 * @param {string} caption - Optional caption
 * @returns {Object} - Share content object
 */

// Utility function to get the current site origin for URL generation
const getSiteOrigin = () => window?.location?.origin || 'https://chronicle-tree.app';

// Utility function to extract person name with fallback handling
const getPersonName = (person) => {
  if (!person) return 'this family';
  return `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'this family';
};

export const generateTreeShareContent = (rootPersonId, caption = '', person = null) => {
  const name = getPersonName(person);
  const url = rootPersonId
    ? `${getSiteOrigin()}/tree?root=${rootPersonId}`
    : `${getSiteOrigin()}/tree`;
  return {
    content_type: 'tree',
    content_id: rootPersonId,
    caption: caption || `Explore the family tree of ${name}: ${url}`,
    share_url: url
  };
};

/**
 * Generates shareable content for individual person profiles
 * @param {number} personId - Person ID
 * @param {string} caption - Optional caption
 * @returns {Object} - Share content object
 */
export const generateProfileShareContent = (personId, caption = '', person = null) => {
  const name = getPersonName(person);
  const url = `${getSiteOrigin()}/profile/${personId}`;
  return {
    content_type: 'profile',
    content_id: personId,
    caption: caption || `See the profile of ${name}: ${url}`,
    share_url: url
  };
};

/**
 * Handles social media sharing across different platforms with URL generation
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
        // Clipboard copy functionality for link sharing
        await navigator.clipboard.writeText(response.share_url);
        return { success: true, message: 'Link copied to clipboard!' };
      } else {
        // Opens platform-specific sharing window in new tab
        window.open(response.share_url, '_blank');
        return { success: true, message: 'Share window opened!' };
      }
    } else {
      throw new Error(response.error || 'Failed to create share');
    }
  } catch (error) {
    throw error;
  }
};