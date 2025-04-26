import React, { useState } from 'react';
import Flocking from './components/Flocking';
import Controls from './components/Controls';
import DisplaySettings from './components/DisplaySettings';
import DownloadDialog from './components/DownloadDialog';
import './styles/App.css';

function App() {
  const [params, setParams] = useState({
    separation: 1.5,
    alignment: 1.0,
    cohesion: 1.0,
    newAgents: 5,
    trailLength: 200,
    colorRandomness: 0, // Percentage of random colors (0-100)
    simulationSpeed: 1.0 // Default speed multiplier
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    trailLength: 200,
    trailThickness: 0.5,
    trailType: 'line',
    colorMode: 'single',
    agentShape: 'triangle',
    agentSize: 1,
    fadeAmount: 25,
    colors: {
      main: '#ffffff',
      start: '#ff0000',
      end: '#0000ff',
      agent: '#ffffff',
      background: '#000000'
    }
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  
  const handleParamChange = (param, value) => {
    setParams(prev => ({
      ...prev,
      [param]: value
    }));
    
    // Special case for trailLength to update displaySettings as well
    if (param === 'trailLength') {
      setDisplaySettings(prev => ({
        ...prev,
        trailLength: value
      }));
    }
  };
  
  const handleDisplaySettingsChange = (newSettings) => {
    setDisplaySettings(newSettings);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  const openDownloadDialog = () => {
    setIsDownloadDialogOpen(true);
  };
  
  const closeDownloadDialog = () => {
    setIsDownloadDialogOpen(false);
  };
  
  const handleDownload = (format) => {
    if (format === 'svg') {
      downloadSVG();
    } else if (format === 'png') {
      downloadPNG();
    }
    closeDownloadDialog();
  };
  
  const downloadSVG = () => {
    // Get the canvas dimensions
    const canvas = document.querySelector('.canvas-container canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Create an SVG element
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.setAttribute("version", "1.1");
    svgElement.setAttribute("width", width);
    svgElement.setAttribute("height", height);
    svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    
    // Create background rectangle with current background color
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgRect.setAttribute("width", width);
    bgRect.setAttribute("height", height);
    bgRect.setAttribute("fill", displaySettings.colors.background || '#000000');
    svgElement.appendChild(bgRect);
    
    // Get boids from the p5 instance
    const p5Instance = document.querySelector('.canvas-container').p5;
    if (!p5Instance) {
      console.error('p5 instance not found');
      return;
    }
    
    try {
      // Create a group for boids
      const boidsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      
      // Access the internal boids array through the p5 instance's getBoids method
      const boids = p5Instance.getBoids ? p5Instance.getBoids() : [];
      if (!boids || boids.length === 0) {
        console.warn('No boids found for SVG export');
      }
      
      // Loop through all boids and create SVG paths for them
      boids.forEach(boid => {
        if (displaySettings.agentShape === 'triangle') {
          // Create a triangle for each boid
          const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          
          // Calculate points for triangle based on boid's position and direction
          const theta = Math.atan2(boid.vy, boid.vx) + Math.PI/2;
          const size = displaySettings.agentSize * 5 || 5;
          
          const x1 = boid.x;
          const y1 = boid.y - size*2;
          const x2 = boid.x - size;
          const y2 = boid.y + size*2;
          const x3 = boid.x + size;
          const y3 = boid.y + size*2;
          
          // Apply rotation
          const transformedPoints = [
            rotatePoint(x1, y1, boid.x, boid.y, theta),
            rotatePoint(x2, y2, boid.x, boid.y, theta),
            rotatePoint(x3, y3, boid.x, boid.y, theta)
          ];
          
          const pointsString = transformedPoints
            .map(p => `${p.x},${p.y}`)
            .join(' ');
            
          triangle.setAttribute("points", pointsString);
          triangle.setAttribute("fill", displaySettings.colors.agent || 'white');
          
          boidsGroup.appendChild(triangle);
        } else {
          // Create a circle for each boid
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", boid.x);
          circle.setAttribute("cy", boid.y);
          circle.setAttribute("r", displaySettings.agentSize * 5 || 5);
          circle.setAttribute("fill", displaySettings.colors.agent || 'white');
          
          boidsGroup.appendChild(circle);
        }
        
        // Add trails if needed
        if (boid.trail && boid.trail.length > 1) {
          const trail = document.createElementNS("http://www.w3.org/2000/svg", "path");
          
          let pathData = `M ${boid.trail[0].x} ${boid.trail[0].y}`;
          for (let i = 1; i < boid.trail.length; i++) {
            pathData += ` L ${boid.trail[i].x} ${boid.trail[i].y}`;
          }
          
          trail.setAttribute("d", pathData);
          trail.setAttribute("fill", "none");
          trail.setAttribute("stroke", displaySettings.colors.main || 'white');
          trail.setAttribute("stroke-width", displaySettings.trailThickness || 0.5);
          if (displaySettings.trailType === 'dashed') {
            trail.setAttribute("stroke-dasharray", "4,4");
          }
          
          boidsGroup.appendChild(trail);
        }
      });
      
      svgElement.appendChild(boidsGroup);
      
      // Helper function to rotate a point around a center
      function rotatePoint(x, y, cx, cy, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const nx = (cos * (x - cx)) - (sin * (y - cy)) + cx;
        const ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
        return { x: nx, y: ny };
      }
      
      // Convert the SVG to a string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([
        '<?xml version="1.0" standalone="no"?>\r\n',
        svgData
      ], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = svgUrl;
      link.download = 'flocking-simulation.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(svgUrl);
    } catch (e) {
      console.error('Error generating SVG:', e);
      alert('Could not generate SVG. Falling back to PNG download.');
      downloadPNG();
    }
  };
  
  const downloadPNG = () => {
    const canvas = document.querySelector('.canvas-container canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.download = 'flocking-simulation.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error converting canvas to PNG:', e);
      alert('Failed to download PNG. Please try again later.');
    }
  };

  return (
    <div className="App">
      <div className="simulation-container">
        <Flocking 
          params={params} 
          displaySettings={displaySettings}
          isPaused={isPaused}
        />
        <Controls 
          params={params} 
          onParamChange={handleParamChange}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onDownloadSVG={openDownloadDialog}
        />
        <DisplaySettings 
          settings={displaySettings} 
          onSettingsChange={handleDisplaySettingsChange} 
        />
        <DownloadDialog 
          isOpen={isDownloadDialogOpen}
          onClose={closeDownloadDialog}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}

export default App; 