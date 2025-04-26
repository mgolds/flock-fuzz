export const flockingSketch = (p, initialParams) => {
  let boids = [];
  let params = { ...initialParams };
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let addCooldown = 0;
  
  // Method to update params from outside
  p.updateParams = (newParams) => {
    params = { ...newParams };
  };
  
  p.setup = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight - 200; // Account for controls
    p.createCanvas(canvasWidth, canvasHeight);
    
    // Initialize with some boids
    for (let i = 0; i < 50; i++) {
      boids.push(new Boid(p.random(p.width), p.random(p.height)));
    }
  };
  
  p.windowResized = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight - 200;
    p.resizeCanvas(canvasWidth, canvasHeight);
  };
  
  p.mousePressed = () => {
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
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
    if (isDragging && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
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
  
  const addBoidsAtPosition = (x, y) => {
    const count = params.newAgents || 5;
    for (let i = 0; i < count; i++) {
      const boid = new Boid(
        x + p.random(-10, 10),
        y + p.random(-10, 10)
      );
      boids.push(boid);
    }
  };
  
  p.draw = () => {
    p.background(0);
    
    for (let boid of boids) {
      boid.flock(boids, params);
      boid.update();
      boid.edges();
      boid.show();
    }
    
    // Draw cursor trail when dragging
    if (isDragging && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      p.stroke(100, 200, 255, 100);
      p.strokeWeight(2);
      p.line(lastMouseX, lastMouseY, p.mouseX, p.mouseY);
    }
  };
  
  class Boid {
    constructor(x, y) {
      // Create position vector
      this.position = p.createVector(x, y);
      
      // Create velocity vector directly (no need for random2D)
      const angle = p.random(p.TWO_PI);
      const magnitude = p.random(2, 4);
      this.velocity = p.createVector(
        p.cos(angle) * magnitude,
        p.sin(angle) * magnitude
      );
      
      // Create acceleration vector
      this.acceleration = p.createVector(0, 0);
      this.maxForce = 0.2;
      this.maxSpeed = 5;
      this.size = p.random(3, 6);
    }
    
    flock(boids, params) {
      this.acceleration.mult(0);
      
      const separation = this.separate(boids);
      const alignment = this.align(boids);
      const cohesion = this.cohere(boids);
      
      // Apply forces with parameters
      separation.mult(params.separation || 1.5);
      alignment.mult(params.alignment || 1.0);
      cohesion.mult(params.cohesion || 1.0);
      
      this.acceleration.add(separation);
      this.acceleration.add(alignment);
      this.acceleration.add(cohesion);
    }
    
    update() {
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.position.add(this.velocity);
    }
    
    edges() {
      if (this.position.x > p.width) this.position.x = 0;
      if (this.position.x < 0) this.position.x = p.width;
      if (this.position.y > p.height) this.position.y = 0;
      if (this.position.y < 0) this.position.y = p.height;
    }
    
    show() {
      // Calculate heading angle
      const theta = this.velocity.heading() + p.PI/2;
      
      p.push();
      p.translate(this.position.x, this.position.y);
      p.rotate(theta);
      
      // Draw a triangle for each boid
      p.fill(255);
      p.noStroke();
      p.beginShape();
      p.vertex(0, -this.size*2);
      p.vertex(-this.size, this.size*2);
      p.vertex(this.size, this.size*2);
      p.endShape(p.CLOSE);
      
      p.pop();
    }
    
    align(boids) {
      let perceptionRadius = 50;
      let steering = p.createVector();
      let total = 0;
      
      for (let other of boids) {
        let d = p.dist(
          this.position.x, this.position.y,
          other.position.x, other.position.y
        );
        
        if (other !== this && d < perceptionRadius) {
          steering.add(other.velocity);
          total++;
        }
      }
      
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      
      return steering;
    }
    
    cohere(boids) {
      let perceptionRadius = 80;
      let steering = p.createVector();
      let total = 0;
      
      for (let other of boids) {
        let d = p.dist(
          this.position.x, this.position.y,
          other.position.x, other.position.y
        );
        
        if (other !== this && d < perceptionRadius) {
          steering.add(other.position);
          total++;
        }
      }
      
      if (total > 0) {
        steering.div(total);
        steering.sub(this.position);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      
      return steering;
    }
    
    separate(boids) {
      let perceptionRadius = 40;
      let steering = p.createVector();
      let total = 0;
      
      for (let other of boids) {
        let d = p.dist(
          this.position.x, this.position.y,
          other.position.x, other.position.y
        );
        
        if (other !== this && d < perceptionRadius) {
          // Create diff vector directly instead of using Vector.sub
          let diff = p.createVector(
            this.position.x - other.position.x,
            this.position.y - other.position.y
          );
          diff.div(d); // Weight by distance
          steering.add(diff);
          total++;
        }
      }
      
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.velocity);
        steering.limit(this.maxForce);
      }
      
      return steering;
    }
  }
}; 