import React, { useState } from 'react';
import '../styles/DisplaySettings.css';

function DisplaySettings({ settings, onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };
  
  const handleChange = (setting, value) => {
    onSettingsChange({ ...settings, [setting]: value });
  };
  
  const handleCheckboxChange = (setting) => {
    onSettingsChange({ ...settings, [setting]: !settings[setting] });
  };
  
  const handleColorChange = (setting, value) => {
    onSettingsChange({ 
      ...settings, 
      colors: { ...settings.colors, [setting]: value } 
    });
  };

  return (
    <div className="display-settings">
      <button 
        className="settings-toggle" 
        onClick={toggleSettings}
        title="Display Settings"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="white" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="settings-panel">
          <h3>Display Settings</h3>
          
          <div className="settings-section">
            <h4>Trails</h4>
            
            <div className="setting-group">
              <label htmlFor="trailThickness">Thickness</label>
              <input 
                type="range" 
                id="trailThickness" 
                min="0.00" 
                max="1.00" 
                step="0.01" 
                value={settings.trailThickness} 
                onChange={(e) => handleChange('trailThickness', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="setting-group">
              <label htmlFor="trailType">Type</label>
              <select 
                id="trailType" 
                value={settings.trailType} 
                onChange={(e) => handleChange('trailType', e.target.value)}
              >
                <option value="line">Solid Line</option>
                <option value="dashed">Dashed Line</option>
                <option value="dotted">Dotted Line</option>
                <option value="points">Points</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label>Colors</label>
              <div className="color-options">
                <div className="color-option">
                  <label htmlFor="colorMode">Mode</label>
                  <select 
                    id="colorMode" 
                    value={settings.colorMode} 
                    onChange={(e) => handleChange('colorMode', e.target.value)}
                  >
                    <option value="single">Single</option>
                    <option value="random">Random</option>
                    <option value="gradient">Gradient</option>
                  </select>
                </div>
                
                {settings.colorMode === 'single' && (
                  <div className="color-option">
                    <label htmlFor="mainColor">Color</label>
                    <input 
                      type="color" 
                      id="mainColor" 
                      value={settings.colors.main} 
                      onChange={(e) => handleColorChange('main', e.target.value)}
                    />
                  </div>
                )}
                
                {settings.colorMode === 'gradient' && (
                  <>
                    <div className="color-option">
                      <label htmlFor="startColor">Start</label>
                      <input 
                        type="color" 
                        id="startColor" 
                        value={settings.colors.start} 
                        onChange={(e) => handleColorChange('start', e.target.value)}
                      />
                    </div>
                    <div className="color-option">
                      <label htmlFor="endColor">End</label>
                      <input 
                        type="color" 
                        id="endColor" 
                        value={settings.colors.end} 
                        onChange={(e) => handleColorChange('end', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h4>Agents</h4>
            
            <div className="setting-group">
              <label htmlFor="agentShape">Shape</label>
              <select 
                id="agentShape" 
                value={settings.agentShape} 
                onChange={(e) => handleChange('agentShape', e.target.value)}
              >
                <option value="triangle">Triangle</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label htmlFor="agentSize">Size</label>
              <input 
                type="range" 
                id="agentSize" 
                min="0.00" 
                max="2.00" 
                step="0.01" 
                value={settings.agentSize} 
                onChange={(e) => handleChange('agentSize', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="setting-group">
              <label htmlFor="agentColor">Color</label>
              <input 
                type="color" 
                id="agentColor" 
                value={settings.colors.agent} 
                onChange={(e) => handleColorChange('agent', e.target.value)}
              />
            </div>
          </div>
          
          <div className="settings-section">
            <h4>Background</h4>
            
            <div className="setting-group">
              <label htmlFor="fadeAmount">Fade Amount</label>
              <input 
                type="range" 
                id="fadeAmount" 
                min="5" 
                max="100" 
                value={settings.fadeAmount} 
                onChange={(e) => handleChange('fadeAmount', parseInt(e.target.value))}
              />
            </div>
            
            <div className="setting-group">
              <label htmlFor="bgColor">Color</label>
              <input 
                type="color" 
                id="bgColor" 
                value={settings.colors.background} 
                onChange={(e) => handleColorChange('background', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplaySettings; 