(function () {
  'use strict';

  /* ==========================
     LOADER
  ========================== */
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loaderProgress');
  let loadPct = 0;
  const loadInterval = setInterval(function () {
    loadPct += Math.random() * 18 + 4;
    if (loadPct >= 100) {
      loadPct = 100;
      clearInterval(loadInterval);
      setTimeout(function () {
        loader.classList.add('hidden');
      }, 400);
    }
    loaderProgress.style.width = loadPct + '%';
  }, 180);

  /* ==========================
     SOUND EFFECTS (Web Audio)
  ========================== */
  let audioCtx = null;
  let soundEnabled = false;

  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, dur, vol) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = vol || 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.stop(ctx.currentTime + dur);
    } catch (e) { /* silent */ }
  }

  function playClick() { playTone(1200, 0.08, 0.03); }
  function playHover() { playTone(800, 0.05, 0.02); }
  function playSuccess() {
    playTone(523, 0.15, 0.04);
    setTimeout(function () { playTone(659, 0.15, 0.04); }, 100);
    setTimeout(function () { playTone(784, 0.2, 0.04); }, 200);
  }

  /* ==========================
     THEME TOGGLE
  ========================== */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    playClick();
  });

  /* ==========================
     SOUND TOGGLE
  ========================== */
  const soundToggle = document.getElementById('soundToggle');
  soundToggle.addEventListener('click', function () {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('muted', !soundEnabled);
    if (soundEnabled) {
      getAudio();
      playClick();
    }
  });

  /* ==========================
     CUSTOM CURSOR
  ========================== */
  const cursorRing = document.getElementById('cursorRing');
  const cursorDot = document.getElementById('cursorDot');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  if (window.innerWidth > 900) {
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    (function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    // Hover detection
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, .tag, .social-link, .project-card, .hud-card, .achievement-card, .dot, .char-stat')) {
        cursorRing.classList.add('hover');
        playHover();
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, .tag, .social-link, .project-card, .hud-card, .achievement-card, .dot, .char-stat')) {
        cursorRing.classList.remove('hover');
      }
    });
  }

  /* ==========================
     CURSOR TRAIL
  ========================== */
  let lastTrailTime = 0;
  if (window.innerWidth > 900) {
    document.addEventListener('mousemove', function (e) {
      const now = Date.now();
      if (now - lastTrailTime < 50) return;
      lastTrailTime = now;
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = e.clientX + 'px';
      trail.style.top = e.clientY + 'px';
      document.body.appendChild(trail);
      setTimeout(function () { trail.remove(); }, 600);
    });
  }

  /* ==========================
     BACK TO TOP
  ========================== */
  const backToTop = document.getElementById('backToTop');
  const bttProgress = document.querySelector('.btt-progress');
  const bttCircumference = 2 * Math.PI * 16; // r=16
  bttProgress.style.strokeDasharray = bttCircumference;

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / docHeight, 1);

    if (scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
    bttProgress.style.strokeDashoffset = bttCircumference * (1 - progress);
  });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playClick();
  });

  /* ==========================
     TYPING EFFECT
  ========================== */
  const typedEl = document.getElementById('typedText');
  const phrases = [
        'AI / ML Enthusiast',
  
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function typeStep() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(typeStep, 2000);
        return;
      }
      setTimeout(typeStep, 80 + Math.random() * 40);
    } else {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(typeStep, 400);
        return;
      }
      setTimeout(typeStep, 40);
    }
  }
  setTimeout(typeStep, 1200);

  /* ==========================
     SCROLL REVEAL
  ========================== */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ==========================
     COUNTER ANIMATION
  ========================== */
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function isElementVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
  }

  function animateCounterTo(el, target) {
    if (!el) return;
    const safeTarget = Math.max(0, parseInt(target, 10) || 0);
    if (prefersReducedMotion) {
      el.textContent = formatNumber(safeTarget);
      el.dataset.animated = 'true';
      return;
    }

    const currentValue = parseInt(String(el.textContent).replace(/,/g, ''), 10) || 0;
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(currentValue + (safeTarget - currentValue) * eased);
      el.textContent = formatNumber(value);
      if (progress < 1) requestAnimationFrame(update);
      else {
        el.textContent = formatNumber(safeTarget);
        el.dataset.animated = 'true';
      }
    }

    requestAnimationFrame(update);
  }

  function setCounterValue(el, value) {
    if (!el) return;
    const safeValue = Math.max(0, parseInt(value, 10) || 0);
    el.setAttribute('data-target', String(safeValue));
    if (isElementVisible(el)) {
      animateCounterTo(el, safeValue);
    }
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      animateCounterTo(el, target);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(function (el) { counterObserver.observe(el); });

  /* ==========================
     PROGRESS / XP BARS
  ========================== */
  const progressFills = document.querySelectorAll('.progress-fill[data-width]');
  const progressObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const width = el.getAttribute('data-width');
      setTimeout(function () { el.style.width = width + '%'; }, 200);
      progressObserver.unobserve(el);
    });
  }, { threshold: 0.3 });

  progressFills.forEach(function (el) { progressObserver.observe(el); });

  /* ==========================
     CHARACTER STAT BARS
  ========================== */
  const charFills = document.querySelectorAll('.char-stat-fill[data-width]');
  const charObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const width = el.getAttribute('data-width');
      setTimeout(function () { el.style.width = width + '%'; }, 300);
      charObserver.unobserve(el);
    });
  }, { threshold: 0.3 });

  charFills.forEach(function (el) { charObserver.observe(el); });

  /* ==========================
     POWER LEVEL BAR
  ========================== */
  const powerFill = document.querySelector('.power-fill[data-width]');
  if (powerFill) {
    const powerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const w = entry.target.getAttribute('data-width');
        setTimeout(function () { entry.target.style.width = w + '%'; }, 400);
        powerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    powerObserver.observe(powerFill);
  }

  /* ==========================
     ACHIEVEMENT UNLOCK ANIMATION
  ========================== */
  const achievementCards = document.querySelectorAll('.achievement-card');
  const achieveObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      setTimeout(function () {
        card.classList.add('unlocked');
        playSuccess();
        // Particle burst
        for (let i = 0; i < 8; i++) {
          const p = document.createElement('div');
          p.style.cssText =
            'position:absolute;width:4px;height:4px;border-radius:50%;pointer-events:none;z-index:10;' +
            'background:' + ['#ffb800','#39ff14','#00f0ff','#ff2d75','#7b61ff'][Math.floor(Math.random()*5)] + ';' +
            'left:50%;top:50%;';
          card.style.position = 'relative';
          card.appendChild(p);
          const angle = (Math.PI * 2 / 8) * i;
          const dist = 40 + Math.random() * 30;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist;
          p.animate([
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(0)', opacity: 0 }
          ], { duration: 700, easing: 'ease-out', fill: 'forwards' });
          setTimeout(function () { p.remove(); }, 750);
        }
      }, 300);
      achieveObserver.unobserve(card);
    });
  }, { threshold: 0.5 });

  achievementCards.forEach(function (card) { achieveObserver.observe(card); });

  /* ==========================
     NAVBAR SCROLL STATE
  ========================== */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ==========================
     MOBILE MENU
  ========================== */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  navToggle.addEventListener('click', function () {
    mobileMenu.classList.toggle('open');
    playClick();
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
    });
  });

  /* ==========================
     ACTIVE NAV LINK
  ========================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        const id = entry.target.getAttribute('id');
        const activeLink = document.querySelector('.nav-link[href="#' + id + '"]');
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(function (s) { navObserver.observe(s); });

  /* ==========================
     SMOOTH SCROLL
  ========================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        playClick();
      }
    });
  });

  /* ==========================
     PARALLAX (Hero Image)
  ========================== */
  const heroSection = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');
  const heroImgWrap = document.querySelector('.hero-img-wrap');
  const heroImg = document.querySelector('.hero-img');
  const heroStatus = document.querySelector('.hero-status');
  const heroSocial = document.querySelector('.hero-social');
  const heroCta = document.querySelector('.hero-cta');
  const heroStats = document.querySelector('.hero-stats');

  if (heroSection && heroImgWrap && window.innerWidth > 900 && !prefersReducedMotion) {
    let heroTicking = false;

    function updateHeroParallax() {
      heroTicking = false;

      const rect = heroSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return;
      }

      const progress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1);
      const drift = (progress - 0.5) * 2;

      if (heroImage) {
        heroImage.style.transform = 'translate3d(' + (drift * 10).toFixed(2) + 'px,' + (drift * -12).toFixed(2) + 'px,0)';
      }

      heroImgWrap.style.transform = 'translate3d(0,' + (drift * 28).toFixed(2) + 'px,0) rotate(' + (drift * -3).toFixed(2) + 'deg) scale(' + (1 + progress * 0.03).toFixed(3) + ')';

      if (heroImg) {
        heroImg.style.transform = 'translate3d(0,' + (drift * -18).toFixed(2) + 'px,0) scale(' + (1.03 + progress * 0.04).toFixed(3) + ')';
      }

      if (heroStatus) {
        heroStatus.style.transform = 'translate3d(' + (drift * 14).toFixed(2) + 'px,' + (drift * -8).toFixed(2) + 'px,0)';
      }

      if (heroSocial) {
        heroSocial.style.transform = 'translate3d(' + (drift * -18).toFixed(2) + 'px,' + (drift * 8).toFixed(2) + 'px,0)';
      }

      if (heroCta) {
        heroCta.style.transform = 'translate3d(' + (drift * -10).toFixed(2) + 'px,' + (drift * 10).toFixed(2) + 'px,0)';
      }

      if (heroStats) {
        heroStats.style.transform = 'translate3d(' + (drift * 16).toFixed(2) + 'px,' + (drift * 14).toFixed(2) + 'px,0)';
      }
    }

    function requestHeroParallax() {
      if (heroTicking) return;
      heroTicking = true;
      requestAnimationFrame(updateHeroParallax);
    }

    window.addEventListener('scroll', requestHeroParallax, { passive: true });
    window.addEventListener('resize', requestHeroParallax);
    requestHeroParallax();
  }

  /* ==========================
     TESTIMONIALS SLIDER
  ========================== */
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const dots = document.querySelectorAll('#testimonialDots .dot');
  let slideIdx = 0;
  const slideCount = dots.length;

  function goToSlide(idx) {
    slideIdx = idx;
    track.style.transform = 'translateX(-' + (slideIdx * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === slideIdx); });
    playClick();
  }

  prevBtn.addEventListener('click', function () { goToSlide((slideIdx - 1 + slideCount) % slideCount); });
  nextBtn.addEventListener('click', function () { goToSlide((slideIdx + 1) % slideCount); });
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { goToSlide(i); });
  });

  // Auto-advance
  setInterval(function () { goToSlide((slideIdx + 1) % slideCount); }, 6000);

  /* ==========================
     GITHUB API
  ========================== */
  const GH_USER = 'sharath2004-tech';
  const contributionEl = document.getElementById('ghContributions');
  const heroContributionEl = document.getElementById('heroContributions');
  const heroReposEl = document.getElementById('heroRepos');
  const calendarLabel = document.getElementById('calendarLabel');

  function setupProfileImages() {
    document.querySelectorAll('.hero-img[data-fallback]').forEach(function (img) {
      function applyFallback() {
        const fallback = img.getAttribute('data-fallback');
        if (!fallback || img.dataset.fallbackApplied === 'true') return;
        img.dataset.fallbackApplied = 'true';
        img.classList.add('hero-img--fallback');
        img.src = fallback;
      }

      img.addEventListener('error', applyFallback);
      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      }
    });
  }

  setupProfileImages();

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return seconds + 's ago';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
  }

  // Fetch user data
  fetch('https://api.github.com/users/' + encodeURIComponent(GH_USER))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var el;
      el = document.getElementById('ghRepos');
      if (el && data.public_repos != null) el.textContent = formatNumber(data.public_repos);
      el = document.getElementById('ghFollowers');
      if (el && data.followers != null) el.textContent = formatNumber(data.followers);
      el = document.getElementById('ghFollowing');
      if (el && data.following != null) el.textContent = formatNumber(data.following);
      if (heroReposEl && data.public_repos != null) setCounterValue(heroReposEl, data.public_repos);
    })
    .catch(function () { /* silent */ });

  fetch('https://github-contributions-api.deno.dev/' + encodeURIComponent(GH_USER) + '.json')
    .then(function (r) {
      if (!r.ok) throw new Error('Contribution API unavailable');
      return r.json();
    })
    .then(function (data) {
      var weeks = Array.isArray(data.contributions) ? data.contributions : [];
      var total = 0;
      weeks.forEach(function (week) {
        week.forEach(function (day) {
          total += Number(day.contributionCount) || 0;
        });
      });

      if (heroContributionEl) setCounterValue(heroContributionEl, total);
      if (contributionEl) contributionEl.textContent = formatNumber(total);
      if (calendarLabel) {
        calendarLabel.textContent = formatNumber(total) + ' contributions in the last 12 months';
      }
      buildCalendar(weeks);
    })
    .catch(function () {
      fetch('https://github-contributions.vercel.app/api/v1/' + encodeURIComponent(GH_USER))
        .then(function (r) {
          if (!r.ok) throw new Error('Fallback contribution API unavailable');
          return r.json();
        })
        .then(function (data) {
          var total = 0;
          if (Array.isArray(data.years)) {
            data.years.forEach(function (year) { total += Number(year.total) || 0; });
          }
          if (heroContributionEl) setCounterValue(heroContributionEl, total);
          if (contributionEl) contributionEl.textContent = formatNumber(total);
          if (calendarLabel) {
            calendarLabel.textContent = formatNumber(total) + ' public contributions tracked';
          }
        })
        .catch(function () { /* silent */ });
    });

  // Fetch events
  fetch('https://api.github.com/users/' + encodeURIComponent(GH_USER) + '/events/public?per_page=5')
    .then(function (r) { return r.json(); })
    .then(function (events) {
      const list = document.getElementById('recentList');
      if (!list || !Array.isArray(events) || events.length === 0) return;
      list.innerHTML = '';
      events.slice(0, 5).forEach(function (ev) {
        var icon = '📌', text = '';
        var repoName = ev.repo ? escapeHtml(ev.repo.name) : '';
        switch (ev.type) {
          case 'PushEvent':
            icon = '⬆️';
            var commits = ev.payload && ev.payload.commits ? ev.payload.commits.length : 0;
            text = 'Pushed ' + commits + ' commit' + (commits !== 1 ? 's' : '') + ' to <strong>' + repoName + '</strong>';
            break;
          case 'CreateEvent':
            icon = '🆕';
            text = 'Created ' + escapeHtml(ev.payload.ref_type || 'repo') + ' in <strong>' + repoName + '</strong>';
            break;
          case 'WatchEvent':
            icon = '⭐';
            text = 'Starred <strong>' + repoName + '</strong>';
            break;
          case 'ForkEvent':
            icon = '🍴';
            text = 'Forked <strong>' + repoName + '</strong>';
            break;
          case 'IssuesEvent':
            icon = '🐛';
            text = escapeHtml((ev.payload.action || 'opened')) + ' issue in <strong>' + repoName + '</strong>';
            break;
          case 'PullRequestEvent':
            icon = '🔀';
            text = escapeHtml((ev.payload.action || 'opened')) + ' PR in <strong>' + repoName + '</strong>';
            break;
          default:
            text = escapeHtml(ev.type.replace('Event', '')) + ' in <strong>' + repoName + '</strong>';
        }
        var item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML =
          '<div class="recent-icon">' + icon + '</div>' +
          '<div><div class="recent-text">' + text + '</div>' +
          '<div class="recent-time">' + escapeHtml(timeAgo(ev.created_at)) + '</div></div>';
        list.appendChild(item);
      });
    })
    .catch(function () {
      var list = document.getElementById('recentList');
      if (list) list.innerHTML = '<p class="loading-text">Unable to load activity.</p>';
    });

  /* ==========================
     CALENDAR GRID
  ========================== */
  function buildCalendar(weeks) {
    var grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!Array.isArray(weeks) || !weeks.length) return;

    weeks.forEach(function (week) {
      week.forEach(function (day) {
        var cell = document.createElement('div');
        var count = Number(day.contributionCount) || 0;
        var opacity = count === 0 ? 0.12 : count < 2 ? 0.28 : count < 5 ? 0.48 : count < 10 ? 0.7 : 1;
        cell.className = 'cal-cell' + (count === 0 ? ' is-empty' : '');
        cell.style.opacity = opacity;
        cell.title = count + ' contribution' + (count === 1 ? '' : 's') + ' on ' + day.date;
        grid.appendChild(cell);
      });
    });
  }

  /* ==========================
     CONTACT FORM
  ========================== */
  var form = document.getElementById('contactForm');
  var formSubmit = document.getElementById('formSubmit');

  function showError(inputId, msg) {
    var input = document.getElementById(inputId);
    var errorEl = input.parentElement.querySelector('.form-error');
    input.classList.add('error');
    if (errorEl) errorEl.textContent = msg;
  }

  function clearError(inputId) {
    var input = document.getElementById(inputId);
    var errorEl = input.parentElement.querySelector('.form-error');
    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  ['formName', 'formEmail', 'formSubject', 'formMessage'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { clearError(id); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    var name = document.getElementById('formName').value.trim();
    var email = document.getElementById('formEmail').value.trim();
    var subject = document.getElementById('formSubject').value.trim();
    var message = document.getElementById('formMessage').value.trim();

    if (!name) { showError('formName', 'Name is required'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('formEmail', 'Valid email required'); valid = false; }
    if (!subject) { showError('formSubject', 'Subject is required'); valid = false; }
    if (!message) { showError('formMessage', 'Message is required'); valid = false; }

    if (!valid) return;

    formSubmit.classList.add('loading');
    setTimeout(function () {
      formSubmit.classList.remove('loading');
      formSubmit.classList.add('success');
      playSuccess();

      var mailtoLink = 'mailto:2004sharath@gmail.com?subject=' +
        encodeURIComponent(subject) +
        '&body=' + encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message);
      window.location.href = mailtoLink;

      setTimeout(function () {
        formSubmit.classList.remove('success');
        form.reset();
      }, 3000);
    }, 1200);
  });

  /* ==========================
     GLITCH TEXT EFFECT
  ========================== */
  var glitchEl = document.querySelector('.glitch-text');
  if (glitchEl) {
    setInterval(function () {
      glitchEl.style.textShadow =
        (Math.random() * 4 - 2) + 'px 0 var(--neon-cyan), ' +
        (Math.random() * 4 - 2) + 'px 0 var(--neon-pink)';
      setTimeout(function () {
        glitchEl.style.textShadow = '';
      }, 80);
    }, 4000);
  }

  /* ==========================
     HOLOGRAPHIC TILT
  ========================== */
  if (window.innerWidth > 900) {
    document.querySelectorAll('.holo-tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ==========================
     PROFILE VIEWS COUNTER
  ========================== */
  (function initProfileViews() {
    var heroEl   = document.getElementById('profileViewsHero');
    var footerEl = document.getElementById('footerViews');

    function setViews(n) {
      var formatted = Number(n).toLocaleString();
      if (heroEl)   heroEl.textContent   = formatted;
      if (footerEl) footerEl.textContent = formatted;
    }

    // Increment local session count (localStorage)
    var stored = parseInt(localStorage.getItem('pv_count') || '0', 10);
    var lastVisit = localStorage.getItem('pv_last');
    var now = Date.now();
    // Count once per 30-minute window to avoid inflating on refresh
    if (!lastVisit || now - parseInt(lastVisit, 10) > 1800000) {
      stored += 1;
      localStorage.setItem('pv_count', stored);
      localStorage.setItem('pv_last', now);
    }
    setViews(stored);

    // Try countapi.xyz for cross-device real count
    fetch('https://api.countapi.xyz/hit/sharath2004-tech-portfolio/visits')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.value) {
          // Use the larger of remote vs local to avoid going backward
          var remote = parseInt(d.value, 10);
          var display = Math.max(remote, stored);
          setViews(display);
        }
      })
      .catch(function() { /* fallback already set from localStorage */ });
  })();

})();