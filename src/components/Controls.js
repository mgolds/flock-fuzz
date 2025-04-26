import React, { useState } from 'react';
import '../styles/Controls.css';

function Controls({ params, onParamChange, isPaused, onTogglePause, onDownloadSVG }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    onParamChange(name, numValue);
  };

  const toggleCollapse = (e) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  return (
    <div className={`controls ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-toggle" 
        onClick={toggleCollapse}
        onMouseDown={(e) => e.stopPropagation()}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d={collapsed ? 
            "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" : 
            "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"} />
        </svg>
      </button>
      
      <div className="controls-content">
        <div className="control-group">
          <label>Separation</label>
          <input 
            type="range" 
            name="separation" 
            min="0" 
            max="5" 
            step="0.1" 
            value={params.separation} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="control-group">
          <label>Alignment</label>
          <input 
            type="range" 
            name="alignment" 
            min="0" 
            max="5" 
            step="0.1" 
            value={params.alignment} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="control-group">
          <label>Cohesion</label>
          <input 
            type="range" 
            name="cohesion" 
            min="0" 
            max="5" 
            step="0.1" 
            value={params.cohesion} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="control-group">
          <label>Trail Length</label>
          <input 
            type="range" 
            name="trailLength" 
            min="0" 
            max="500" 
            step="10" 
            value={params.trailLength} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="control-group">
          <label>Simulation Speed</label>
          <input 
            type="range" 
            name="simulationSpeed" 
            min="0.1" 
            max="3" 
            step="0.1" 
            value={params.simulationSpeed} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="control-group">
          <label>New Agents</label>
          <input 
            type="range" 
            name="newAgents" 
            min="1" 
            max="20" 
            step="1" 
            value={params.newAgents} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="action-buttons">
          <button 
            className={`pause-button ${isPaused ? 'paused' : ''}`} 
            onClick={onTogglePause}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
              </svg>
            )}
          </button>
          
          <button 
            className="download-button" 
            onClick={onDownloadSVG}
            title="Download"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Controls; 