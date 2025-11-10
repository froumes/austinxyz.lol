// Landing page navigation
const landingSection = document.querySelector('.hero');
const portfolioContent = document.querySelector('.portfolio-content');
const badscripthubContent = document.querySelector('.badscripthub-content');
const choiceCards = document.querySelectorAll('.choice-card');

const showContent = (contentType) => {
  // Hide landing page
  if (landingSection) {
    landingSection.style.display = 'none';
  }

  // Hide all content sections
  if (portfolioContent) {
    portfolioContent.style.display = 'none';
  }
  if (badscripthubContent) {
    badscripthubContent.style.display = 'none';
  }

  // Show selected content
  if (contentType === 'portfolio' && portfolioContent) {
    portfolioContent.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (contentType === 'badscripthub' && badscripthubContent) {
    badscripthubContent.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const showLanding = () => {
  if (landingSection) {
    landingSection.style.display = 'flex';
  }
  if (portfolioContent) {
    portfolioContent.style.display = 'none';
  }
  if (badscripthubContent) {
    badscripthubContent.style.display = 'none';
  }
};

// Handle choice card clicks
choiceCards.forEach((card) => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const choice = card.dataset.choice;
    if (choice) {
      showContent(choice);
      window.history.pushState({ section: choice }, '', `#${choice}`);
    }
  });
});

// Handle hash changes
const handleHashChange = () => {
  const hash = window.location.hash.slice(1);
  if (hash === 'portfolio' || hash === 'badscripthub') {
    showContent(hash);
  } else if (hash === '' || hash === 'home') {
    showLanding();
  }
};

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', () => {
  handleHashChange();
});

// Update year in footer
const yearEl = document.querySelector('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Logo click returns to home
const logo = document.querySelector('.logo');
if (logo) {
  logo.addEventListener('click', (e) => {
    e.preventDefault();
    showLanding();
    window.history.pushState({ section: 'home' }, '', '#home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '#home') {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  });
});

// Add fade-in animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe sections for fade-in
document.querySelectorAll('.section').forEach((section) => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// Nozomi UI interactive demo
const nozomiDemo = document.querySelector('[data-nozomi-demo]');
const demoStatus = nozomiDemo?.querySelector('[data-demo-status]');
const phaseChip = nozomiDemo?.querySelector('[data-demo-phase]');
const progressFill = nozomiDemo?.querySelector('[data-demo-progress]');
const statsPanel = nozomiDemo?.querySelector('[data-demo-stats]');
const playerLabel = nozomiDemo?.querySelector('[data-demo-player]');
const pingLabel = nozomiDemo?.querySelector('[data-demo-ping]');
const fpsLabel = nozomiDemo?.querySelector('[data-demo-fps]');
const demoStartButtons = document.querySelectorAll('[data-demo-start]');

const demoSteps = [
  { status: 'Initializing loader…', phase: 'Handshake', progress: 0.2 },
  { status: 'Validating LuaArmor key…', phase: 'Security', progress: 0.45 },
  { status: 'Fetching workspace script…', phase: 'Delivery', progress: 0.68 },
  { status: 'Applying Nozomi theme…', phase: 'Styling', progress: 0.85 },
  { status: 'Ready — telemetry live.', phase: 'Live', progress: 1 },
];

const samplePlayers = ['latte-soft', 'austinxyz', 'NozomiClient', 'ember-builds'];

let demoStepTimeout = null;
let statsInterval = null;

const updatePlayerLabel = () => {
  if (!playerLabel) return;
  const name = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
  playerLabel.textContent = name;
};

const resetDemo = () => {
  if (!nozomiDemo) return;
  window.clearTimeout(demoStepTimeout);
  window.clearInterval(statsInterval);
  nozomiDemo.dataset.state = 'idle';
  if (demoStatus) {
    demoStatus.textContent = 'Ready to initialize';
  }
  if (phaseChip) {
    phaseChip.textContent = 'Idle';
  }
  if (progressFill) {
    progressFill.style.width = '0%';
  }
  updatePlayerLabel();
};

const startStatsLoop = () => {
  if (!pingLabel || !fpsLabel) return;
  let ping = 32;
  let fps = 60;
  statsInterval = window.setInterval(() => {
    ping = Math.max(18, Math.min(110, ping + (Math.random() * 14 - 7)));
    fps = Math.max(45, Math.min(144, fps + (Math.random() * 10 - 5)));
    pingLabel.textContent = `${Math.round(ping)} ms`;
    fpsLabel.textContent = Math.round(fps);
  }, 600);
};

const runDemo = () => {
  if (!nozomiDemo || !demoStatus || !progressFill) return;
  resetDemo();
  nozomiDemo.dataset.state = 'running';
  let stepIndex = 0;

  const advance = () => {
    const step = demoSteps[stepIndex];
    demoStatus.textContent = step.status;
    if (phaseChip) {
      phaseChip.textContent = step.phase;
    }
    progressFill.style.width = `${Math.round(step.progress * 100)}%`;

    if (stepIndex < demoSteps.length - 1) {
      stepIndex += 1;
      demoStepTimeout = window.setTimeout(advance, 900);
    } else {
      demoStepTimeout = window.setTimeout(() => {
        nozomiDemo.dataset.state = 'complete';
        startStatsLoop();
      }, 500);
    }
  };

  advance();
};

demoStartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    runDemo();
  });
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.clearInterval(statsInterval);
  } else if (nozomiDemo?.dataset.state === 'complete') {
    startStatsLoop();
  }
});

window.addEventListener('beforeunload', () => {
  window.clearTimeout(demoStepTimeout);
  window.clearInterval(statsInterval);
});

// Initialize player label immediately
updatePlayerLabel();
