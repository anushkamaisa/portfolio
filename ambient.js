/**
 * Ambient Background Motion — Real-Time Canvas Rendering
 * Flowing particle mesh with organic, slow-moving connections
 */
(function () {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles, mouse, animationId, floatingOrbs, shootingStars;
  const PARTICLE_COUNT_FACTOR = 0.00004; // particles per px²
  const MAX_PARTICLES = 120;
  const MIN_PARTICLES = 30;
  const CONNECTION_DIST = 150;
  const MOUSE_RADIUS = 200;
  const ORB_COUNT = 3;

  mouse = { x: -1000, y: -1000 };
  shootingStars = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.5;
      this.baseAlpha = Math.random() * 0.4 + 0.1;
      this.alpha = this.baseAlpha;

      // Slow organic drift
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.25 + 0.08;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Subtle oscillation
      this.oscillateSpeed = Math.random() * 0.002 + 0.001;
      this.oscillateAmp = Math.random() * 0.3 + 0.1;
      this.phase = Math.random() * Math.PI * 2;

      // Color — subtle indigo/purple palette
      const hue = 235 + Math.random() * 30; // 235–265
      const sat = 50 + Math.random() * 30;
      const lit = 55 + Math.random() * 20;
      this.color = `hsla(${hue}, ${sat}%, ${lit}%, `;
    }

    update(time) {
      // Organic oscillation
      this.x += this.vx + Math.sin(time * this.oscillateSpeed + this.phase) * this.oscillateAmp * 0.3;
      this.y += this.vy + Math.cos(time * this.oscillateSpeed + this.phase) * this.oscillateAmp * 0.3;

      // Mouse interaction — gentle repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.015;
        this.x += dx * force;
        this.y += dy * force;
        this.alpha = Math.min(this.baseAlpha + 0.3, 0.7);
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.02;
      }

      // Wrap edges
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  class FloatingOrb {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 80 + 60;
      this.baseAlpha = Math.random() * 0.03 + 0.02;
      this.alpha = this.baseAlpha;
      
      const speed = Math.random() * 0.15 + 0.05;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      
      this.hue = 235 + Math.random() * 30;
      this.pulseSpeed = Math.random() * 0.001 + 0.0005;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.x += this.vx;
      this.y += this.vy;
      
      // Pulse effect
      this.alpha = this.baseAlpha + Math.sin(time * this.pulseSpeed + this.pulsePhase) * this.baseAlpha * 0.5;
      
      // Wrap edges
      if (this.x < -this.size) this.x = width + this.size;
      if (this.x > width + this.size) this.x = -this.size;
      if (this.y < -this.size) this.y = height + this.size;
      if (this.y > height + this.size) this.y = -this.size;
    }

    draw() {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${this.alpha})`);
      gradient.addColorStop(0.5, `hsla(${this.hue}, 60%, 50%, ${this.alpha * 0.3})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    }
  }

  class ShootingStar {
    constructor() {
      this.reset();
      this.active = false;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height * 0.3;
      this.length = Math.random() * 60 + 40;
      this.speed = Math.random() * 3 + 2;
      this.angle = Math.PI / 4 + Math.random() * 0.5;
      this.opacity = 1;
      this.active = true;
    }

    update() {
      if (!this.active) return;
      
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.opacity -= 0.01;
      
      if (this.opacity <= 0 || this.x > width || this.y > height) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active) return;
      
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;
      
      const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(99, 102, 241, ${this.opacity * 0.4})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    spawn() {
      this.reset();
    }
  }

  function initFloatingOrbs() {
    floatingOrbs = [];
    for (let i = 0; i < ORB_COUNT; i++) {
      floatingOrbs.push(new FloatingOrb());
    }
  }

  function initParticles() {
    const count = Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, Math.floor(width * height * PARTICLE_COUNT_FACTOR)));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Flowing gradient wave overlay
  function drawWave(time) {
    const gradient = ctx.createLinearGradient(0, height * 0.6, width, height);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.015)');
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 4) {
      const y = height * 0.7
        + Math.sin(x * 0.003 + time * 0.0004) * 40
        + Math.sin(x * 0.007 + time * 0.0006) * 20
        + Math.cos(x * 0.001 + time * 0.0003) * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  function animate(time) {
    ctx.clearRect(0, 0, width, height);

    // Subtle radial glow at center
    const glow = ctx.createRadialGradient(width * 0.5, height * 0.35, 0, width * 0.5, height * 0.35, width * 0.5);
    glow.addColorStop(0, 'rgba(99, 102, 241, 0.04)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Floating orbs
    for (const orb of floatingOrbs) {
      orb.update(time);
      orb.draw();
    }

    // Wave
    drawWave(time);

    // Shooting stars (spawn randomly)
    if (Math.random() < 0.008 && shootingStars.filter(s => s.active).length < 2) {
      const star = shootingStars.find(s => !s.active);
      if (star) star.spawn();
    }
    
    for (const star of shootingStars) {
      star.update();
      star.draw();
    }

    // Particles
    for (const p of particles) {
      p.update(time);
      p.draw();
    }

    // Connections
    drawConnections();

    animationId = requestAnimationFrame(animate);
  }

  // Event listeners
  window.addEventListener('resize', () => {
    resize();
    initParticles();
    initFloatingOrbs();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Reduce work when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animationId = requestAnimationFrame(animate);
    }
  });

  // Init
  resize();
  initParticles();
  initFloatingOrbs();
  
  // Initialize shooting stars pool
  for (let i = 0; i < 3; i++) {
    shootingStars.push(new ShootingStar());
    shootingStars[i].active = false;
  }
  
  animationId = requestAnimationFrame(animate);
})();