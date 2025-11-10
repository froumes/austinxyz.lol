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

// Nozomi UI interactive preview
const initializeNozomiPreview = () => {
  const uiRoot = document.querySelector('[data-nozomi-ui]');
  if (!uiRoot) {
    return;
  }

  const toggleButtons = uiRoot.querySelectorAll('[data-toggle]');
  toggleButtons.forEach((button) => {
    const setState = (isOn) => {
      button.classList.toggle('is-on', isOn);
      button.setAttribute('aria-pressed', String(isOn));
    };

    setState(button.classList.contains('is-on'));

    button.addEventListener('click', () => {
      const nextState = !button.classList.contains('is-on');
      setState(nextState);
    });
  });

  const rangeInputs = uiRoot.querySelectorAll('[data-range-input]');
  rangeInputs.forEach((input) => {
    const wrapper = input.closest('[data-range]');
    const valueEl = wrapper?.querySelector('[data-range-value]');
    const precision = Number(wrapper?.dataset.rangePrecision ?? '0');
    const suffix = wrapper?.dataset.rangeSuffix ?? '';

    const formatValue = (value) => {
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        return value;
      }
      return `${numeric.toFixed(Math.max(0, precision))}${suffix}`;
    };

    const update = () => {
      const min = Number(input.min ?? 0);
      const max = Number(input.max ?? 100);
      const value = Number(input.value);
      const percent = max - min === 0 ? 0 : ((value - min) / (max - min)) * 100;
      input.style.setProperty('--percent', percent.toString());
      if (valueEl) {
        valueEl.textContent = formatValue(value);
      }
    };

    input.addEventListener('input', update);
    update();
  });

  const selects = uiRoot.querySelectorAll('[data-select]');

  const closeAllSelects = () => {
    selects.forEach((select) => select.classList.remove('is-open'));
  };

  selects.forEach((select) => {
    const trigger = select.querySelector('[data-select-trigger]');
    const valueEl = select.querySelector('[data-select-value]');
    const options = select.querySelectorAll('[data-select-option]');

    trigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = select.classList.contains('is-open');
      closeAllSelects();
      select.classList.toggle('is-open', !isOpen);
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const optionValue = option.dataset.selectOption || option.textContent?.trim() || '';
        if (valueEl) {
          valueEl.textContent = optionValue;
        }
        select.classList.remove('is-open');
      });
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-select]')) {
      closeAllSelects();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllSelects();
    }
  });

  const sidebarButtons = uiRoot.querySelectorAll('[data-tab-trigger]');
  sidebarButtons.forEach((button) => {
    button.addEventListener('click', () => {
      sidebarButtons.forEach((btn) => btn.classList.remove('is-active'));
      button.classList.add('is-active');
    });
  });
};

initializeNozomiPreview();
