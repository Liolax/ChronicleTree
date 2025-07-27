// Full-featured sharing modal with platform selection and content customization
import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './ShareModal.css';

const ShareModal = ({ 
  isOpen, 
  onClose, 
  personId, 
  shareType = 'profile',
  initialGenerations = 3 
}) => {
  const [shareData, setShareData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generations, setGenerations] = useState(initialGenerations);
  const [currentShareType, setCurrentShareType] = useState(shareType);
  const [includeStepRelationships, setIncludeStepRelationships] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    if (isOpen && personId) {
      // Validates API connectivity before generating share content
      testApiConnection();
      generateShareContent();
    }
  }, [isOpen, personId, currentShareType, generations, includeStepRelationships]);

  const testApiConnection = async () => {
    try {
      const response = await api.get('/people');
    } catch (error) {
      // Handles API connection failures gracefully
    }
  };

  const generateShareContent = async () => {
    setIsGenerating(true);
    setShareData(null);
    
    try {
      const endpoint = currentShareType === 'profile' 
        ? `/share/profile/${personId}?include_step_relationships=${includeStepRelationships}`
        : `/share/tree/${personId}?generations=${generations}&include_step_relationships=${includeStepRelationships}`;

      const response = await api.get(endpoint);
      setShareData(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to generate shareable content';
      alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWebShare = async () => {
    if (!shareData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.share_url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          await copyToClipboard(shareData.share_url);
        }
      }
    } else {
      await copyToClipboard(shareData.share_url);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (error) {
      alert('Failed to copy link');
    }
  };

  const copyImageUrl = async () => {
    if (!shareData?.image_url) return;
    await copyToClipboard(shareData.image_url);
  };

  const downloadImage = () => {
    if (!shareData?.image_url) return;
    
    const link = document.createElement('a');
    link.href = shareData.image_url;
    link.download = `${currentShareType}-${personId}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToSocial = (platform) => {
    if (!shareData) return;

    const { title, description, share_url } = shareData;
    const encodedUrl = encodeURIComponent(share_url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedDescription}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedDescription}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share Family {currentShareType === 'profile' ? 'Profile' : 'Tree'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="share-modal-content">
          {/* Share Type Toggle */}
          <div className="share-type-toggle">
            <button 
              className={`toggle-button ${currentShareType === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentShareType('profile')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Profile Card
            </button>
            <button 
              className={`toggle-button ${currentShareType === 'tree' ? 'active' : ''}`}
              onClick={() => setCurrentShareType('tree')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"/>
              </svg>
              Family Tree
            </button>
          </div>

          {/* Tree Options */}
          {currentShareType === 'tree' && (
            <div className="tree-options">
              <label htmlFor="generations">Generations to show:</label>
              <select 
                id="generations"
                value={generations} 
                onChange={(e) => setGenerations(Number(e.target.value))}
                className="generations-select"
              >
                <option value={1}>1 Generation</option>
                <option value={2}>2 Generations</option>
                <option value={3}>3 Generations</option>
                <option value={4}>4 Generations</option>
                <option value={5}>5 Generations</option>
              </select>
            </div>
          )}

          {/* Advanced Options */}
          <div className="advanced-options-section">
            <button 
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="advanced-options-toggle"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d={showAdvancedOptions ? "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" : "M7.41 8.84L12 13.42l4.59-4.58L18 10l-6 6-6-6z"}/>
              </svg>
              Advanced Options
            </button>
            
            {showAdvancedOptions && (
              <div className="advanced-options-content">
                <div className="option-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeStepRelationships}
                      onChange={(e) => setIncludeStepRelationships(e.target.checked)}
                      className="option-checkbox"
                    />
                    <span className="checkmark"></span>
                    Include step-relationships (step-parents, step-children, step-siblings)
                  </label>
                  <small className="option-description">
                    Shows step-family connections in addition to biological relationships
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Generating shareable content...</p>
            </div>
          )}

          {/* Preview */}
          {shareData && !isGenerating && (
            <div className="share-preview">
              <div className="preview-image">
                <img src={shareData.image_url} alt={shareData.title} />
                <div className="image-actions">
                  <button onClick={downloadImage} className="action-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download
                  </button>
                  <button onClick={copyImageUrl} className="action-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy URL
                  </button>
                </div>
              </div>

              <div className="share-details">
                <h3>{shareData.title}</h3>
                <p>{shareData.description}</p>
              </div>
            </div>
          )}

          {/* Sharing Options */}
          {shareData && !isGenerating && (
            <div className="sharing-options">
              <h4>Share via:</h4>
              
              {/* Quick Share Button */}
              <button onClick={handleWebShare} className="quick-share-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                {navigator.share ? 'Share' : 'Copy Link'}
              </button>

              {/* Social Media Options */}
              <div className="social-options">
                <button onClick={() => shareToSocial('twitter')} className="social-button x">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 2h3.5l-7.1 9.1L22 22h-7.2l-5.1-6.7L4.5 22H1l7.5-9.6L2 2h7.4l4.7 6.2L17.5 2zm-1.2 17.5h2.1L8.8 4.5H6.6l9.7 15z" fill="currentColor" />
                  </svg>
                  X
                </button>

                <button onClick={() => shareToSocial('facebook')} className="social-button facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                <button onClick={() => shareToSocial('linkedin')} className="social-button linkedin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>

                <button onClick={() => shareToSocial('whatsapp')} className="social-button whatsapp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                  </svg>
                  WhatsApp
                </button>

                <button onClick={() => shareToSocial('email')} className="social-button email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email
                </button>

                <button onClick={() => shareToSocial('reddit')} className="social-button reddit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  Reddit
                </button>
              </div>
            </div>
          )}

          {/* Metadata */}
          {shareData && !isGenerating && (
            <div className="share-metadata">
              <small>
                Generated in {shareData.generation_time_ms}ms • 
                Expires {new Date(shareData.expires_at).toLocaleDateString()}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;