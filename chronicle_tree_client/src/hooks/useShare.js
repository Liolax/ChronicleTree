import { useState, useCallback } from 'react';
import api from '../api/api';

export const useShare = () => {
  const [shareData, setShareData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateShareContent = useCallback(async (personId, shareType = 'profile', options = {}) => {
    setIsGenerating(true);
    setError(null);
    setShareData(null);

    try {
      const { generations = 3 } = options;
      const endpoint = shareType === 'profile' 
        ? `/share/profile/${personId}`
        : `/share/tree/${personId}?generations=${generations}`;

      const response = await api.get(endpoint);
      const data = response.data;
      
      setShareData(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate shareable content';
      setError(errorMessage);
      alert(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const shareViaWebAPI = useCallback(async (data) => {
    if (!data) {
      alert('No content to share');
      return false;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.share_url
        });
        return true;
      } catch (err) {
        if (err.name === 'AbortError') {
          // User cancelled sharing
          return false;
        }
        // Fallback to copying link
        return await copyToClipboard(data.share_url);
      }
    } else {
      // Fallback for browsers without Web Share API
      return await copyToClipboard(data.share_url);
    }
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
      return true;
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
        return true;
      } catch (fallbackErr) {
        alert('Failed to copy link');
        return false;
      }
    }
  }, []);

  const shareToSocial = useCallback((platform, data) => {
    if (!data) {
      alert('No content to share');
      return;
    }

    const { title, description, share_url, image_url } = data;
    const encodedUrl = encodeURIComponent(share_url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedImage = encodeURIComponent(image_url || '');

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedDescription}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedDescription}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedTitle}&caption=${encodedDescription}`,
      whatsapp: `https://wa.me/?text=${encodedDescription}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedDescription}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      sms: `sms:?body=${encodedDescription}%20${encodedUrl}`
    };

    const shareUrl = shareUrls[platform];
    
    if (!shareUrl) {
      alert('Unknown sharing platform');
      return;
    }

    try {
      if (platform === 'email' || platform === 'sms') {
        window.location.href = shareUrl;
      } else {
        const popup = window.open(
          shareUrl,
          '_blank',
          'width=600,height=400,scrollbars=yes,resizable=yes'
        );
        
        if (!popup) {
          alert('Please allow popups to share on social media');
        }
      }
    } catch (err) {
      alert('Failed to open sharing window');
    }
  }, []);

  const downloadImage = useCallback(async (data, filename) => {
    if (!data?.image_url) {
      alert('No image to download');
      return;
    }

    try {
      const response = await fetch(data.image_url);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `family-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download image');
    }
  }, []);

  const reset = useCallback(() => {
    setShareData(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    // State
    shareData,
    isGenerating,
    error,
    
    // Actions
    generateShareContent,
    shareViaWebAPI,
    shareToSocial,
    copyToClipboard,
    downloadImage,
    reset,
    
    // Utilities
    canShare: !!navigator.share,
    canCopy: !!navigator.clipboard
  };
};

export default useShare;