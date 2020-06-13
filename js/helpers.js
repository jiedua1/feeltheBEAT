/* Contains basic helper functions for fancy animations
   Like particle system and wavy tentacle thingies
   dependencies: p5.js
*/

function createExplosion(x, y, particles, gravity = 30, max_vel = 20) {
    let max_particles = max_vel / 3; // scales to force of explosion...
    let max_size = 60;
    let prob = 0.5;
    for (let i = 0; i < max_particles; i++) {
        if (Math.random() < prob) {
            let part = new Particle(x, y, max_size * Math.random());
            part.setGravity(gravity).randomVelocity(max_vel);
            particles.push(part);
        }
    }
    
}

class Particle {
    constructor(x, y, size) {
        this.color = color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
        this.x = x;
        this.y = y;
        this.lifespan = random(30, 80); // Frames
        this.frmult = 1/60
        this.size = size;
        this.gravity = 0;
    }

    setGravity(dy) {
        this.gravity = dy; 
        return this;
    }

    setVelocity(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        return this;
    }

    randomVelocity(n) {
        this.dx = random(-n, n);
        this.dy = random(-n, n);
        return this;
    }
    
    draw() {
        push();
        this.color.setAlpha(map(this.lifespan, 0, 80, 0, 255));
        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);
        pop();
        this.lifespan -= 1;
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.gravity * this.frmult;
    }
}

/* Draws particles; destroys ones that should be dead */
function drawParticles(particles) {
    for(let i = 0; i < particles.length; i++) {
        particles[i].draw();
        // Remove dead particles
        if (particles[i].lifespan < 0) {
            particles.splice(i, 1);
            i -= 1;
        }
    }
}