import React, { useEffect, useRef } from 'react';
import '../styles/DownloadDialog.css';

function DownloadDialog({ isOpen, onClose, onDownload }) {
  const dialogRef = useRef(null);

  // Handle click outside to close dialog
  useEffect(() => {
    function handleClickOutside(event) {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close dialog
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="download-dialog-overlay">
      <div className="download-dialog" ref={dialogRef}>
        <div className="download-dialog-header">
          <h3>Download Options</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="download-dialog-content">
          <p>Select a format to download your flocking simulation:</p>
          
          <div className="download-options">
            <button 
              className="format-button svg-button"
              onClick={() => onDownload('svg')}
            >
              <div className="format-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                </svg>
              </div>
              <div className="format-info">
                <span className="format-name">SVG</span>
                <span className="format-description">Vector graphics, ideal for scaling</span>
              </div>
            </button>
            
            <button 
              className="format-button png-button"
              onClick={() => onDownload('png')}
            >
              <div className="format-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                </svg>
              </div>
              <div className="format-info">
                <span className="format-name">PNG</span>
                <span className="format-description">Raster image with transparency</span>
              </div>
            </button>
          </div>
        </div>
        <div className="download-dialog-footer">
          <p className="dialog-note">* More options coming soon</p>
        </div>
      </div>
    </div>
  );
}

export default DownloadDialog; 