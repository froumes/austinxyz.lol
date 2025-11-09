const body = document.body;
const themeToggle = document.querySelector('[data-toggle-theme]');
const storedTheme = localStorage.getItem('austinxyz-theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

const applyTheme = (theme) => {
  if (theme === 'light') {
    body.dataset.theme = 'light';
  } else {
    delete body.dataset.theme;
  }
  localStorage.setItem('austinxyz-theme', theme);
};

if (storedTheme) {
  applyTheme(storedTheme);
} else if (prefersLight.matches) {
  applyTheme('light');
}

prefersLight.addEventListener('change', (event) => {
  if (!storedTheme) {
    applyTheme(event.matches ? 'light' : 'dark');
  }
});

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = body.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}

const island = document.querySelector('[data-island]');
const startDemoButton = island?.querySelector('[data-action="start-demo"]');
const statusText = island?.querySelector('[data-status-text]');
const progressFill = island?.querySelector('[data-progress-fill]');
const statsBlock = island?.querySelector('[data-stats]');
const pingLabel = island?.querySelector('[data-ping]');
const fpsLabel = island?.querySelector('[data-fps]');
const displayName = island?.querySelector('[data-display-name]');
const yearEl = document.querySelector('#year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const demoSteps = [
  { text: 'Initializing loader…', progress: 0.2 },
  { text: 'Checking LuaArmor key…', progress: 0.45 },
  { text: 'Fetching script from GitHub…', progress: 0.75 },
  { text: 'Applying Nozomi theme…', progress: 0.9 },
  { text: 'Complete! Showing telemetry.', progress: 1 },
];

let statsInterval = null;
let stepTimeout = null;

const resetDemo = () => {
  if (!island) return;
  clearInterval(statsInterval);
  clearTimeout(stepTimeout);
  island.querySelector('.island-demo').dataset.state = 'idle';
  statsBlock?.setAttribute('aria-hidden', 'true');
  statusText.textContent = 'Ready to demo';
  progressFill.style.width = '0%';
};

const startStatsLoop = () => {
  if (!pingLabel || !fpsLabel) return;
  let lastPing = 32;
  let lastFps = 60;

  statsInterval = setInterval(() => {
    lastPing = Math.max(12, Math.min(120, lastPing + (Math.random() * 12 - 6)));
    lastFps = Math.max(30, Math.min(144, lastFps + (Math.random() * 10 - 5)));

    pingLabel.textContent = `${Math.round(lastPing)}ms`;
    fpsLabel.textContent = `${Math.round(lastFps)} FPS`;
  }, 600);
};

const runDemo = () => {
  if (!island || !statusText || !progressFill) return;
  clearInterval(statsInterval);
  island.querySelector('.island-demo').dataset.state = 'loading';
  statsBlock?.setAttribute('aria-hidden', 'true');
  statsBlock?.parentElement?.classList.remove('island-demo__stats--visible');
  progressFill.style.width = '0%';

  let stepIndex = 0;

  const nextStep = () => {
    const step = demoSteps[stepIndex];
    statusText.textContent = step.text;
    progressFill.style.width = `${step.progress * 100}%`;

    if (stepIndex < demoSteps.length - 1) {
      stepIndex += 1;
      stepTimeout = setTimeout(nextStep, 900);
    } else {
      setTimeout(() => {
        island.querySelector('.island-demo').dataset.state = 'stats';
        statsBlock?.setAttribute('aria-hidden', 'false');
        startStatsLoop();
      }, 600);
    }
  };

  nextStep();
};

if (displayName) {
  const sampleNames = ['latte-soft', 'AustinXYZ', 'BadScriptsHub'];
  displayName.textContent =
    sampleNames[Math.floor(Math.random() * sampleNames.length)];
}

startDemoButton?.addEventListener('click', () => {
  resetDemo();
  runDemo();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(statsInterval);
  } else if (island?.querySelector('.island-demo')?.dataset.state === 'stats') {
    startStatsLoop();
  }
});

window.addEventListener('beforeunload', () => {
  clearInterval(statsInterval);
  clearTimeout(stepTimeout);
});

