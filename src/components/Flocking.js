import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { simpleFlockingSketch } from '../sketches/simpleFlockingSketch';

function Flocking({ params, displaySettings, isPaused }) {
  const canvasRef = useRef();
  const p5Instance = useRef(null);
  const sketchInitialized = useRef(false);

  useEffect(() => {
    // Only create the p5 instance once
    if (!sketchInitialized.current) {
      // Create new p5 instance with the simple sketch
      p5Instance.current = new p5(simpleFlockingSketch, canvasRef.current);
      sketchInitialized.current = true;
      
      // Expose p5 instance to the parent element for SVG export
      if (canvasRef.current) {
        canvasRef.current.p5 = p5Instance.current;
      }
    }
    
    // Always update parameters when they change (including on initial mount)
    if (p5Instance.current) {
      p5Instance.current.updateParams(params);
    }
    
    // Handle window resizing
    const handleResize = () => {
      if (p5Instance.current) {
        p5Instance.current.windowResized();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (p5Instance.current && !sketchInitialized.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, [params]); // Include params in the dependency array
  
  // Effect for display settings changes
  useEffect(() => {
    if (p5Instance.current && displaySettings) {
      p5Instance.current.updateDisplaySettings(displaySettings);
    }
  }, [displaySettings]);

  // Effect for pause state changes
  useEffect(() => {
    if (p5Instance.current) {
      p5Instance.current.setPaused(isPaused);
    }
  }, [isPaused]);

  return <div ref={canvasRef} className="canvas-container"></div>;
}

export default Flocking; 