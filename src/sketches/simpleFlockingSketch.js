import SimpleBoid from './simpleBoid';

export const simpleFlockingSketch = (p) => {
  let boids = [];
  let params = {
    separation: 1.5,
    alignment: 1.0,
    cohesion: 1.0,
    newAgents: 10
  };
  let displaySettings = {
    trailLength: 300,
    trailThickness: 0.3,
    trailType: 'line',
    colorMode: 'single',
    agentShape: 'triangle',
    agentSize: 0.7,
    fadeAmount: 25,
    colors: {
      main: '#ffffff',
      start: '#ff0000',
      end: '#0000ff',
      agent: '#ffffff',
      background: '#000000'
    }
  };
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let addCooldown = 0;
  let boidCounter = 0; // For assigning unique IDs to boids
  let isPaused = false;
  
  // External method to update parameters
  p.updateParams = (newParams) => {
    params = { ...params, ...newParams };
    
    // Pass colorRandomness parameter to displaySettings
    if (newParams.colorRandomness !== undefined) {
      displaySettings.colorRandomness = newParams.colorRandomness;
      
      // Update boids with modified settings
      for (const boid of boids) {
        boid.updateSettings(displaySettings);
      }
    }
    
    // Update simulation speed if changed
    if (newParams.simulationSpeed !== undefined) {
      displaySettings.simulationSpeed = newParams.simulationSpeed;
      
      // Update boids with the new simulation speed
      for (const boid of boids) {
        boid.updateSettings(displaySettings);
      }
    }
  };
  
  // External method to update display settings
  p.updateDisplaySettings = (newSettings) => {
    displaySettings = { ...displaySettings, ...newSettings };
    
    // Update existing boids with new settings
    for (const boid of boids) {
      boid.updateSettings(displaySettings);
    }
  };
  
  // External method to set paused state
  p.setPaused = (paused) => {
    isPaused = paused;
  };
  
  // Method to access boids array for SVG generation
  p.getBoids = () => {
    return boids;
  };
  
  p.setup = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent(p.canvas.parentElement);
    
    // Initialize with some boids
    for (let i = 0; i < 50; i++) {
      boidCounter++;
      boids.push(new SimpleBoid(
        p, 
        p.random(p.width), 
        p.random(p.height), 
        displaySettings,
        boidCounter
      ));
    }
  };
  
  p.windowResized = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    p.resizeCanvas(canvasWidth, canvasHeight);
  };
  
  p.mousePressed = () => {
    // Check if mouse is over the canvas and not over UI controls
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height && !isMouseOverControls()) {
      isDragging = true;
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
      
      // Add boids on initial click
      addBoidsAtPosition(p.mouseX, p.mouseY);
    }
  };
  
  p.mouseReleased = () => {
    isDragging = false;
    addCooldown = 0;
  };
  
  p.mouseDragged = () => {
    // Check if mouse is over the canvas and not over UI controls
    if (isDragging && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height && !isMouseOverControls()) {
      // Add boids when dragging with a cooldown to control rate
      if (addCooldown <= 0) {
        addBoidsAtPosition(p.mouseX, p.mouseY);
        addCooldown = 5; // Frames to wait before adding more boids
      } else {
        addCooldown--;
      }
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
    }
  };
  
  // Helper function to check if mouse is over UI controls
  const isMouseOverControls = () => {
    // Check for controls container DOM elements
    const controlsElements = document.querySelectorAll('.controls, .display-settings');
    for (const element of controlsElements) {
      const rect = element.getBoundingClientRect();
      if (
        p.mouseX >= rect.left && 
        p.mouseX <= rect.right && 
        p.mouseY >= rect.top && 
        p.mouseY <= rect.bottom
      ) {
        return true;
      }
    }
    return false;
  };
  
  const addBoidsAtPosition = (x, y) => {
    const count = params.newAgents || 5;
    for (let i = 0; i < count; i++) {
      boidCounter++;
      const boid = new SimpleBoid(
        p,
        x + p.random(-10, 10),
        y + p.random(-10, 10),
        displaySettings,
        boidCounter
      );
      boids.push(boid);
    }
  };
  
  p.draw = () => {
    // Get background color from settings
    const bgColor = displaySettings.colors.background || '#000000';
    const fadeAmount = displaySettings.fadeAmount || 25;
    
    // Convert hex background color to RGB
    const bg = hexToRgb(bgColor);
    
    // Set a semi-transparent background to create a fading trail effect
    p.background(bg.r, bg.g, bg.b, fadeAmount);
    
    // If paused, don't update boid positions
    if (!isPaused) {
      for (let boid of boids) {
        boid.flock(boids, params);
        boid.update();
        boid.edges();
      }
    }
    
    // Always draw boids even when paused
    for (let boid of boids) {
      boid.show();
    }
    
    // Draw cursor trail when dragging
    if (isDragging && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      p.stroke(100, 200, 255, 100);
      p.strokeWeight(2);
      p.line(lastMouseX, lastMouseY, p.mouseX, p.mouseY);
    }
  };
  
  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    // Default to black if no hex provided
    if (!hex) return { r: 0, g: 0, b: 0 };
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  };
}; 