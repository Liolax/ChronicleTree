// Social sharing button component with multi-platform support and preview functionality
import React, { useState } from 'react';
import api from '../../api/api';
import './ShareButton.css';

const ShareButton = ({ 
  personId, 
  shareType = 'profile', 
  generations = 3,
  className = '',
  children
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareData, setShareData] = useState(null);

  const generateShareContent = async () => {
    setIsGenerating(true);
    try {
      const endpoint = shareType === 'profile' 
        ? `/share/profile/${personId}`
        : `/share/tree/${personId}?generations=${generations}`;

      const response = await api.get(endpoint);
      const data = response.data;
      
      setShareData(data);
      return data;
    } catch (error) {
      alert('Failed to generate shareable content');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWebShare = async (data) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.share_url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Falls back to clipboard copy when sharing is cancelled
          await copyToClipboard(data.share_url);
        }
      }
    } else {
      // Legacy browser compatibility fallback
      await copyToClipboard(data.share_url);
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

  const handleShare = async () => {
    try {
      const data = shareData || await generateShareContent();
      await handleWebShare(data);
    } catch (error) {
      // Error handling managed by generateShareContent function
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className={`share-button ${className} ${isGenerating ? 'loading' : ''}`}
        title={shareType === 'profile' ? 'Share Profile' : 'Share Family Tree'}
      >
        {isGenerating ? (
          <span className="loading-content">
            <div className="spinner" />
            Generating...
          </span>
        ) : (
          children || (
            <span className="share-content">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              Share {shareType === 'profile' ? 'Profile' : 'Tree'}
            </span>
          )
        )}
      </button>

      {shareData && (
        <SharePreview 
          shareData={shareData}
          onClose={() => setShareData(null)}
        />
      )}
    </>
  );
};

const SharePreview = ({ shareData, onClose }) => {
  const [showPreview, setShowPreview] = useState(true);

  if (!showPreview) return null;

  return (
    <div className="share-preview-overlay" onClick={onClose}>
      <div className="share-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="share-preview-header">
          <h3>Share Preview</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="share-preview-content">
          <div className="preview-image">
            <img src={shareData.image_url} alt={shareData.title} />
          </div>
          
          <div className="preview-details">
            <h4>{shareData.title}</h4>
            <p>{shareData.description}</p>
            
            <div className="share-options">
              <button 
                onClick={() => copyToClipboard(shareData.share_url)}
                className="share-option-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                Copy Link
              </button>
              
              <button 
                onClick={() => {
                  const subject = encodeURIComponent(shareData.title);
                  const body = encodeURIComponent(`${shareData.description}\n\n${shareData.share_url}`);
                  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
                  
                  // Opens default email client with pre-filled content
                  window.location.href = mailtoLink;
                }}
                className="share-option-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Email
              </button>
              
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.description)}&url=${encodeURIComponent(shareData.share_url)}`, '_blank')}
                className="share-option-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
                Twitter
              </button>
              
              <button 
                onClick={() => {
                  // Configures backend URL for proper Facebook Open Graph meta tag crawling
                  const backendUrl = shareData.share_url.replace('http://localhost:3000', 'http://localhost:3001');
                  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(backendUrl)}`;
                  window.open(fbUrl, '_blank', 'width=600,height=400');
                }}
                className="share-option-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button 
                onClick={() => {
                  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.share_url)}`;
                  window.open(linkedinUrl, '_blank', 'width=600,height=400');
                }}
                className="share-option-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
              
              <button 
                onClick={() => {
                  const whatsappText = `${shareData.title}\n\n${shareData.description}\n\n${shareData.share_url}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="share-option-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
        
        <div className="share-preview-footer">
          <small>Generated in {shareData.generation_time_ms}ms • Expires {new Date(shareData.expires_at).toLocaleDateString()}</small>
        </div>
      </div>
    </div>
  );
};

// Utility function for cross-browser clipboard functionality
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  } catch (error) {
    alert('Failed to copy link');
  }
};

export default ShareButton;