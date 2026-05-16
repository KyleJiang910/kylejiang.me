/* ========== DARK MODE ========== */
const THEME_KEY = 'theme';

function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem(THEME_KEY, theme);
}

setTheme(getTheme());

function toggleTheme() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  setTheme(next);
  lucide.createIcons();
  updateActiveLink();
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('themeToggleMobile').addEventListener('click', () => {
  toggleTheme();
  closeMobileMenu();
});


/* ========== MOBILE MENU ========== */
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

function closeMobileMenu() {
  mobileMenu.classList.add('hidden');
}


/* ========== EMAIL TOOLTIP ========== */
const emailIcon = document.getElementById('emailIcon');
const emailTooltip = document.getElementById('emailTooltip');

emailIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  emailTooltip.classList.toggle('show');
});

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});


/* ========== NAVBAR SCROLL EFFECT ========== */
const navbar = document.getElementById('navbar');
const heroSection = document.getElementById('hero');

function updateNavbar() {
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  const glassBorder = getComputedStyle(document.documentElement).getPropertyValue('--glass-border').trim();

  if (heroBottom < 64) {
    navbar.style.borderBottomColor = glassBorder || 'rgba(255,255,255,0.08)';
    navbar.style.boxShadow = '0 1px 16px rgba(0,0,0,0.06)';
  } else {
    navbar.style.borderBottomColor = 'transparent';
    navbar.style.boxShadow = 'none';
  }
}

window.addEventListener('scroll', updateNavbar, { passive: true });


/* ========== ACTIVE SECTION HIGHLIGHT ========== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= 120) {
      current = section.getAttribute('id');
    }
  });

  const activeColor = '#6366f1';
  const isDark = document.documentElement.classList.contains('dark');
  const defaultColor = isDark ? '#94a3b8' : '#1e293b';

  navLinks.forEach(link => {
    link.style.color = defaultColor;
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = activeColor;
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });


/* ========== REVEAL ANIMATIONS ========== */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});


/* ========== EXPERIENCE CAROUSEL ========== */
(function () {
  const track = document.getElementById('carouselTrack');
  const viewport = document.querySelector('.carousel-viewport');
  const cards = track ? track.querySelectorAll('.carousel-card') : [];
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let cardWidth, gap, viewportWidth;

  function measure() {
    cardWidth = cards[0].offsetWidth;
    gap = parseFloat(getComputedStyle(track).gap) || 16;
    viewportWidth = viewport.offsetWidth;
  }

  function updateCarousel(index, animate) {
    if (animate === false) {
      track.style.transition = 'none';
    } else {
      track.style.transition = '';
    }

    measure();
    const offset = (viewportWidth - cardWidth) / 2 - index * (cardWidth + gap);
    track.style.transform = 'translateX(' + offset + 'px)';

    if (animate === false) {
      track.offsetHeight; // force reflow
      track.style.transition = '';
    }

    cards.forEach(function (card, i) {
      card.classList.toggle('active', i === index);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });

    // Hide arrow at boundaries
    prevBtn.style.visibility = index === 0 ? 'hidden' : '';
    nextBtn.style.visibility = index === cards.length - 1 ? 'hidden' : '';

    currentIndex = index;
  }

  function goNext() {
    if (currentIndex < cards.length - 1) {
      updateCarousel(currentIndex + 1, true);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      updateCarousel(currentIndex - 1, true);
    }
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-index'), 10);
      if (idx !== currentIndex) {
        updateCarousel(idx, true);
      }
    });
  });

  // Keyboard navigation when this section is in view
  document.addEventListener('keydown', function (e) {
    var expSection = document.getElementById('experience');
    if (!expSection) return;
    var rect = expSection.getBoundingClientRect();
    var inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
  });

  // Touch swipe support
  var touchStartX = 0;
  track.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    var diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goNext();
      else goPrev();
    }
  });

  // Recalculate on resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      updateCarousel(currentIndex, false);
    }, 150);
  });

  // Init
  updateCarousel(0, false);
})();

/* ========== SKILL CAROUSEL ========== */
(function () {
  var carousels = document.querySelectorAll('.skill-carousel[data-skills]');
  if (carousels.length === 0) return;

  var items = [];

  carousels.forEach(function (carousel) {
    var skills = carousel.dataset.skills.split(',').map(function (s) { return s.trim(); });
    var display = carousel.querySelector('.skill-carousel-text');
    var dotsContainer = carousel.querySelector('.skill-carousel-dots');

    // Create dot indicators
    var dots = [];
    skills.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'skill-carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', skills[i]);
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });

    items.push({
      skills: skills,
      display: display,
      dots: dots
    });
  });

  var currentIndex = 0;
  var maxLen = Math.max.apply(null, items.map(function (item) { return item.skills.length; }));

  function updateAll() {
    items.forEach(function (item) {
      var idx = currentIndex % item.skills.length;

      // Fade out
      item.display.classList.add('fade-out');

      // Update dots
      item.dots.forEach(function (dot, j) {
        dot.classList.toggle('active', j === idx);
      });
    });

    // After fade-out, swap text and fade in
    setTimeout(function () {
      items.forEach(function (item) {
        var idx = currentIndex % item.skills.length;
        item.display.textContent = item.skills[idx];
        item.display.classList.remove('fade-out');
      });
    }, 350);

    currentIndex++;
  }

  // Kick off
  setInterval(updateAll, 1800);
})();

/* ========== SKILL DETAIL EXPAND ========== */
(function () {
  var pairs = [
    { trigger: document.getElementById('skillProductCard'), detail: document.getElementById('skillDetailCard') },
    { trigger: document.getElementById('skillAICard'), detail: document.getElementById('skillAIDetailCard') },
    { trigger: document.getElementById('skillEnglishCard'), detail: document.getElementById('skillEnglishDetailCard') }
  ];

  pairs.forEach(function (pair) {
    if (!pair.trigger || !pair.detail) return;

    var expanded = false;

    pair.trigger.addEventListener('click', function () {
      expanded = !expanded;
      if (expanded) {
        pair.detail.classList.add('expanded');
        pair.trigger.style.boxShadow = '0 0 24px var(--glow-blue), 0 0 48px var(--glow-purple)';
      } else {
        pair.detail.classList.remove('expanded');
        pair.trigger.style.boxShadow = '';
      }
    });
  });
})();

/* ========== INITIAL CALLS ========== */
updateNavbar();
updateActiveLink();
