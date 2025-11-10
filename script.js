const body = document.body;
const themeToggle = document.querySelector('[data-toggle-theme]');
const storedTheme = localStorage.getItem('austinxyz-theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const animatedTargets = Array.from(document.querySelectorAll('[data-animate]'));
const typewriterTargets = Array.from(document.querySelectorAll('[data-typewriter]'));
const typewriterStates = new WeakMap();

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

let animationObserver = null;

const showAnimatedElement = (element) => {
  const delay = parseFloat(element.dataset.animateDelay || '0');
  element.style.setProperty('--animate-delay', `${delay}s`);
  element.classList.add('is-visible');
};

const setupAnimationObserver = () => {
  if (!animatedTargets.length) {
    return;
  }

  if (animationObserver) {
    animationObserver.disconnect();
    animationObserver = null;
  }

  if (prefersReducedMotion.matches) {
    animatedTargets.forEach(showAnimatedElement);
    return;
  }

  animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showAnimatedElement(entry.target);
          if (animationObserver) {
            animationObserver.unobserve(entry.target);
          }
        }
      });
    },
    {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  animatedTargets
    .filter((element) => !element.classList.contains('is-visible'))
    .forEach((element) => animationObserver.observe(element));
};

const ensureTypewriterText = (element) => {
  if (element.dataset.typeText && element.dataset.typeText.trim().length) {
    return;
  }

  const fallbackText = element.textContent.trim();
  if (fallbackText.length) {
    element.dataset.typeText = fallbackText;
  }
};

const cancelTypewriter = (element) => {
  const state = typewriterStates.get(element);
  if (state?.timeoutId) {
    clearTimeout(state.timeoutId);
  }
  typewriterStates.delete(element);
};

const runTypewriter = (element) => {
  const text = (element.dataset.typeText || '').trim();

  if (!text.length) {
    element.textContent = '';
    element.dataset.typeComplete = 'true';
    element.classList.remove('is-typing');
    return;
  }

  const speed = Math.max(30, parseInt(element.dataset.typeSpeed || '85', 10));
  const startDelay = Math.max(0, parseInt(element.dataset.typeDelay || '160', 10));

  element.textContent = '';
  element.dataset.typeComplete = 'false';
  element.classList.add('is-typing');

  const state = { timeoutId: null };
  typewriterStates.set(element, state);

  const step = (index) => {
    element.textContent = text.slice(0, index);

    if (index >= text.length) {
      element.classList.remove('is-typing');
      element.dataset.typeComplete = 'true';
      typewriterStates.delete(element);
      return;
    }

    const variance = Math.floor(Math.random() * 60);
    state.timeoutId = window.setTimeout(() => step(index + 1), speed + variance);
  };

  state.timeoutId = window.setTimeout(() => step(1), startDelay);
};

const initializeTypewriters = () => {
  if (!typewriterTargets.length) {
    return;
  }

  typewriterTargets.forEach((element) => {
    // Skip if typewriter has already completed
    if (element.dataset.typeComplete === 'true') {
      return;
    }

    ensureTypewriterText(element);
    cancelTypewriter(element);

    const text = element.dataset.typeText || '';

    if (prefersReducedMotion.matches) {
      element.textContent = text;
      element.dataset.typeComplete = 'true';
      element.classList.remove('is-typing');
      return;
    }

    runTypewriter(element);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      body.classList.add('animation-ready');
      setupAnimationObserver();
      initializeTypewriters();
    });
  });
} else {
  requestAnimationFrame(() => {
    body.classList.add('animation-ready');
    setupAnimationObserver();
    initializeTypewriters();
  });
}

prefersReducedMotion.addEventListener('change', () => {
  animatedTargets.forEach((element) => element.classList.remove('is-visible'));
  setupAnimationObserver();
  initializeTypewriters();
});

const yearEl = document.querySelector('#year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

window.addEventListener('beforeunload', () => {
  typewriterTargets.forEach(cancelTypewriter);
});

