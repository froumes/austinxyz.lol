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
