// Class for representing a single boid
class SimpleBoid {
  constructor(p, x, y, settings, id) {
    // Store p5 instance
    this.p = p;
    this.id = id || 0;
    
    // Position
    this.x = x;
    this.y = y;
    
    // Generate random velocity
    const angle = p.random(p.TWO_PI);
    const speed = p.random(2, 4);
    this.vx = p.cos(angle) * speed;
    this.vy = p.sin(angle) * speed;
    
    // Acceleration
    this.ax = 0;
    this.ay = 0;
    
    // Properties
    this.maxSpeed = 5;
    this.maxForce = 0.2;
    this.size = p.random(3, 6);
    
    // Trail history
    this.trail = []; // Array to store position history
    
    // Generate a consistent random color for this boid
    this.randomColor = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
    
    // Apply settings
    this.updateSettings(settings);
  }
  
  updateSettings(settings) {
    if (!settings) return;
    
    // Store settings
    this.settings = settings;
    
    // Trail settings
    this.maxTrailLength = settings.trailLength || 50;
    this.trailOpacity = this.p.random(40, 80); // For variety
    
    // Size multiplier
    this.sizeMultiplier = settings.agentSize || 1;
  }
  
  // Generate a random color
  generateRandomColor() {
    // Return the stored random color to maintain consistency
    return this.randomColor;
  }
  
  // Apply flocking behavior
  flock(boids, params) {
    // Reset acceleration
    this.ax = 0;
    this.ay = 0;
    
    // Calculate forces
    const separation = this.separate(boids);
    const alignment = this.align(boids);
    const cohesion = this.cohere(boids);
    
    // Apply weights from params
    separation.x *= params.separation || 1.5;
    separation.y *= params.separation || 1.5;
    
    alignment.x *= params.alignment || 1.0;
    alignment.y *= params.alignment || 1.0;
    
    cohesion.x *= params.cohesion || 1.0;
    cohesion.y *= params.cohesion || 1.0;
    
    // Add all forces to acceleration
    this.ax += separation.x + alignment.x + cohesion.x;
    this.ay += separation.y + alignment.y + cohesion.y;
  }
  
  // Update position and velocity
  update() {
    // Get simulation speed from params (default to 1.0 if not provided)
    const speed = this.settings.simulationSpeed || 1.0;
    
    // Update velocity with acceleration
    this.vx += this.ax;
    this.vy += this.ay;
    
    // Limit speed
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > this.maxSpeed) {
      this.vx = (this.vx / currentSpeed) * this.maxSpeed;
      this.vy = (this.vy / currentSpeed) * this.maxSpeed;
    }
    
    // Add current position to trail before updating
    this.addToTrail(this.x, this.y);
    
    // Update position with speed multiplier
    this.x += this.vx * speed;
    this.y += this.vy * speed;
  }
  
  // Add current position to the trail
  addToTrail(x, y) {
    // Only add if we want trails
    if (this.maxTrailLength <= 0) return;
    
    this.trail.push({x, y});
    // Keep trail at maximum length
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift(); // Remove the oldest position
    }
  }
  
  // Wrap around edges
  edges() {
    const p = this.p;
    
    // Always clear the trail when wrapping around edges
    if (this.x > p.width) {
      this.x = 0;
      this.clearTrail();
    }
    if (this.x < 0) {
      this.x = p.width;
      this.clearTrail();
    }
    if (this.y > p.height) {
      this.y = 0;
      this.clearTrail();
    }
    if (this.y < 0) {
      this.y = p.height;
      this.clearTrail();
    }
  }
  
  // Clear the trail when wrapping around screen edges
  clearTrail() {
    this.trail = [];
  }
  
  // Draw the boid
  show() {
    const p = this.p;
    const settings = this.settings || {};
    
    // Draw the trail first
    this.drawTrail();
    
    // Calculate heading angle
    const angle = Math.atan2(this.vy, this.vx) + p.HALF_PI;
    
    // Get agent color
    let agentColor;
    if (settings.colors && settings.colors.agent) {
      // Convert hex to RGB
      agentColor = this.hexToRgb(settings.colors.agent);
    } else {
      agentColor = { r: 255, g: 255, b: 255 };
    }
    
    p.push();
    p.translate(this.x, this.y);
    p.rotate(angle);
    
    // Set the fill color
    p.fill(agentColor.r, agentColor.g, agentColor.b);
    p.noStroke();
    
    // Size based on settings
    const size = this.size * this.sizeMultiplier;
    
    // Draw the appropriate shape based on settings
    const shape = settings.agentShape || 'triangle';
    switch (shape) {
      case 'circle':
        p.ellipse(0, 0, size * 2);
        break;
      case 'square':
        p.rectMode(p.CENTER);
        p.rect(0, 0, size * 2, size * 2);
        break;
      case 'custom':
        // Example custom shape - could be customized more
        p.beginShape();
        p.vertex(0, -size * 2);
        p.vertex(-size, size);
        p.vertex(0, 0);
        p.vertex(size, size);
        p.endShape(p.CLOSE);
        break;
      case 'triangle':
      default:
        // Triangle is the default shape
        p.beginShape();
        p.vertex(0, -size * 2);
        p.vertex(-size, size * 2);
        p.vertex(size, size * 2);
        p.endShape(p.CLOSE);
    }
    
    p.pop();
  }
  
  // Draw the trail for this boid
  drawTrail() {
    const p = this.p;
    const settings = this.settings || {};
    
    if (this.trail.length < 2) return;
    
    // Get color based on color mode settings
    let trailColor;
    const colorMode = settings.colorMode || 'single';
    
    switch (colorMode) {
      case 'random':
        // Use the boid's consistent random color
        trailColor = this.randomColor;
        break;
      case 'gradient':
        // Use gradient colors if available
        if (settings.colors && settings.colors.start && settings.colors.end) {
          const startColor = this.hexToRgb(settings.colors.start);
          const endColor = this.hexToRgb(settings.colors.end);
          
          // Create a gradient based on the boid's position in the trail
          const position = Math.min(1, this.trail.length / (this.maxTrailLength || 50));
          
          trailColor = {
            r: Math.round(startColor.r + (endColor.r - startColor.r) * position),
            g: Math.round(startColor.g + (endColor.g - startColor.g) * position),
            b: Math.round(startColor.b + (endColor.b - startColor.b) * position)
          };
        } else {
          // Fallback to main color if gradient colors aren't set
          trailColor = settings.colors && settings.colors.main ? 
            this.hexToRgb(settings.colors.main) : 
            { r: 255, g: 255, b: 255 };
        }
        break;
      case 'single':
      default:
        // Use the main color from settings
        trailColor = settings.colors && settings.colors.main ? 
          this.hexToRgb(settings.colors.main) : 
          { r: 255, g: 255, b: 255 };
    }
    
    // Set stroke attributes based on settings
    p.strokeWeight(settings.trailThickness || 0.5);
    
    // Set opacity
    const opacity = this.trailOpacity;
    p.stroke(trailColor.r, trailColor.g, trailColor.b, opacity);
    p.noFill();
    
    // Draw based on trail type
    switch (settings.trailType) {
      case 'dashed':
        this.drawDashedLine();
        break;
      case 'dotted':
        this.drawDottedLine();
        break;
      case 'points':
        this.drawPointsLine();
        break;
      case 'line':
      default:
        this.drawSolidLine();
    }
  }
  
  // Draw a solid line for the trail
  drawSolidLine() {
    const p = this.p;
    
    p.beginShape();
    for (const point of this.trail) {
      p.vertex(point.x, point.y);
    }
    p.endShape();
  }
  
  // Draw a dashed line for the trail
  drawDashedLine() {
    const p = this.p;
    
    for (let i = 1; i < this.trail.length; i++) {
      if (i % 2 === 0) continue; // Skip every other segment for dash effect
      
      const prev = this.trail[i-1];
      const curr = this.trail[i];
      p.line(prev.x, prev.y, curr.x, curr.y);
    }
  }
  
  // Draw a dotted line for the trail
  drawDottedLine() {
    const p = this.p;
    
    for (let i = 0; i < this.trail.length; i++) {
      if (i % 2 === 0) { // Draw dots at every other point
        const point = this.trail[i];
        p.ellipse(point.x, point.y, 2);
      }
    }
  }
  
  // Draw points for the trail
  drawPointsLine() {
    const p = this.p;
    
    for (const point of this.trail) {
      p.point(point.x, point.y);
    }
  }
  
  // Helper to convert hex to RGB
  hexToRgb(hex) {
    // Default to white if no hex provided
    if (!hex) return { r: 255, g: 255, b: 255 };
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }
  
  // Calculate separation force
  separate(boids) {
    const perception = 40;
    let steerX = 0;
    let steerY = 0;
    let count = 0;
    
    for (const other of boids) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      
      if (other !== this && d < perception) {
        // Weight by distance
        steerX += dx / d;
        steerY += dy / d;
        count++;
      }
    }
    
    if (count > 0) {
      steerX /= count;
      steerY /= count;
      
      // Set to max speed
      const mag = Math.sqrt(steerX * steerX + steerY * steerY);
      steerX = steerX / mag * this.maxSpeed;
      steerY = steerY / mag * this.maxSpeed;
      
      // Subtract current velocity
      steerX -= this.vx;
      steerY -= this.vy;
      
      // Limit force
      const forceMag = Math.sqrt(steerX * steerX + steerY * steerY);
      if (forceMag > this.maxForce) {
        steerX = (steerX / forceMag) * this.maxForce;
        steerY = (steerY / forceMag) * this.maxForce;
      }
    }
    
    return { x: steerX, y: steerY };
  }
  
  // Calculate alignment force
  align(boids) {
    const perception = 50;
    let steerX = 0;
    let steerY = 0;
    let count = 0;
    
    for (const other of boids) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      
      if (other !== this && d < perception) {
        steerX += other.vx;
        steerY += other.vy;
        count++;
      }
    }
    
    if (count > 0) {
      steerX /= count;
      steerY /= count;
      
      // Set to max speed
      const mag = Math.sqrt(steerX * steerX + steerY * steerY);
      steerX = steerX / mag * this.maxSpeed;
      steerY = steerY / mag * this.maxSpeed;
      
      // Subtract current velocity
      steerX -= this.vx;
      steerY -= this.vy;
      
      // Limit force
      const forceMag = Math.sqrt(steerX * steerX + steerY * steerY);
      if (forceMag > this.maxForce) {
        steerX = (steerX / forceMag) * this.maxForce;
        steerY = (steerY / forceMag) * this.maxForce;
      }
    }
    
    return { x: steerX, y: steerY };
  }
  
  // Calculate cohesion force
  cohere(boids) {
    const perception = 80;
    let targetX = 0;
    let targetY = 0;
    let count = 0;
    
    for (const other of boids) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      
      if (other !== this && d < perception) {
        targetX += other.x;
        targetY += other.y;
        count++;
      }
    }
    
    if (count > 0) {
      targetX /= count;
      targetY /= count;
      
      // Direction to target
      let steerX = targetX - this.x;
      let steerY = targetY - this.y;
      
      // Set to max speed
      const mag = Math.sqrt(steerX * steerX + steerY * steerY);
      if (mag > 0) {
        steerX = steerX / mag * this.maxSpeed;
        steerY = steerY / mag * this.maxSpeed;
      }
      
      // Subtract current velocity
      steerX -= this.vx;
      steerY -= this.vy;
      
      // Limit force
      const forceMag = Math.sqrt(steerX * steerX + steerY * steerY);
      if (forceMag > this.maxForce) {
        steerX = (steerX / forceMag) * this.maxForce;
        steerY = (steerY / forceMag) * this.maxForce;
      }
      
      return { x: steerX, y: steerY };
    } else {
      return { x: 0, y: 0 };
    }
  }
}

export default SimpleBoid; 