const pageKey = document.body.dataset.page;
const navLinks = document.querySelectorAll(".nav-links a");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const yearNode = document.querySelector("[data-year]");

navLinks.forEach((link) => {
  if (link.dataset.page === pageKey) {
    link.classList.add("active");
  }

  link.addEventListener("click", () => {
    navMenu?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu?.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const canvas = document.getElementById("particles");
const context = canvas?.getContext("2d");

if (canvas && context) {
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;
  let lastRender = 0;
  const isCompactScreen = () => window.innerWidth < 900;
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const createParticles = () => {
    const baseDensity = isCompactScreen() ? 32000 : 42000;
    const count = reduceMotionQuery.matches ? 0 : Math.max(18, Math.floor((width * height) / baseDensity));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.7,
      speedX: (Math.random() - 0.5) * 0.16,
      speedY: (Math.random() - 0.5) * 0.16,
      alpha: Math.random() * 0.35 + 0.1,
    }));
  };

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  };

  const drawConnections = (particle, index) => {
    if (isCompactScreen()) return;

    for (let i = index + 1; i < particles.length; i += 1) {
      const other = particles[i];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 90) {
        context.strokeStyle = `rgba(111, 247, 255, ${0.05 * (1 - distance / 90)})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }
  };

  const animate = (timestamp) => {
    if (timestamp - lastRender < 32) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    lastRender = timestamp;
    context.clearRect(0, 0, width, height);
    context.shadowBlur = 0;

    particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > height) particle.speedY *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(111, 247, 255, ${particle.alpha})`;
      context.fill();
      drawConnections(particle, index);
    });

    animationFrame = requestAnimationFrame(animate);
  };

  resize();
  animationFrame = requestAnimationFrame(animate);
  window.addEventListener("resize", resize);
  reduceMotionQuery.addEventListener("change", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      return;
    }

    if (!animationFrame) {
      lastRender = 0;
      animationFrame = requestAnimationFrame(animate);
    }
  });
}
