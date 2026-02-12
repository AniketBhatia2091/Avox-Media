/* ========================================
   Apex Studio — Main JavaScript
   Pure vanilla JS, no dependencies
   ======================================== */

(function () {
  'use strict';

  // --- Scroll Progress Bar ---
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = percent + '%';
    }, { passive: true });
  }

  // --- Sticky Header ---
  function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('header--scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // --- Mobile Menu ---
  function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('hamburger--open');
      mobileMenu.classList.toggle('mobile-menu--open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('hamburger--open');
        mobileMenu.classList.remove('mobile-menu--open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth Scroll for Anchor Links ---
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var offset = 80;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  // --- Scroll Reveal Animations ---
  function initRevealAnimations() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('reveal--visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // --- Accordion ---
  function initAccordion() {
    document.querySelectorAll('.accordion__trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = trigger.closest('.accordion__item');
        var body = item.querySelector('.accordion__body');
        var isOpen = item.classList.contains('accordion__item--open');

        // Close all siblings in the same accordion
        var accordion = item.closest('.accordion');
        if (accordion) {
          accordion.querySelectorAll('.accordion__item--open').forEach(function (openItem) {
            if (openItem !== item) {
              openItem.classList.remove('accordion__item--open');
              openItem.querySelector('.accordion__body').style.maxHeight = '0';
            }
          });
        }

        // Toggle current
        if (isOpen) {
          item.classList.remove('accordion__item--open');
          body.style.maxHeight = '0';
        } else {
          item.classList.add('accordion__item--open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  // --- Contact Form Submission ---
  function initFormValidation() {
    var form = document.querySelector('.form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      form.querySelectorAll('.form__group[data-required]').forEach(function (group) {
        var input = group.querySelector('.form__input, .form__textarea');
        var errorEl = group.querySelector('.form__error');

        group.classList.remove('form__group--error');

        if (!input.value.trim()) {
          group.classList.add('form__group--error');
          valid = false;
          return;
        }

        if (input.type === 'email' && input.value.trim()) {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            group.classList.add('form__group--error');
            if (errorEl) errorEl.textContent = 'Please enter a valid email address';
            valid = false;
          }
        }
      });

      if (!valid) return;

      var btn = form.querySelector('.btn');
      var originalHTML = btn.innerHTML;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      var payload = {
        name: (form.querySelector('#contact-name') || {}).value || '',
        email: (form.querySelector('#contact-email') || {}).value || '',
        phone: (form.querySelector('#contact-phone') || {}).value || '',
        company: (form.querySelector('#contact-company') || {}).value || '',
        message: (form.querySelector('#contact-message') || {}).value || '',
      };

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            btn.textContent = '✓ Message sent!';
            btn.style.background = 'var(--success)';
            btn.style.opacity = '1';
            setTimeout(function () {
              btn.innerHTML = originalHTML;
              btn.style.background = '';
              btn.disabled = false;
              form.reset();
            }, 3000);
          } else {
            btn.textContent = data.error || 'Something went wrong';
            btn.style.background = '#ef4444';
            btn.style.opacity = '1';
            setTimeout(function () {
              btn.innerHTML = originalHTML;
              btn.style.background = '';
              btn.disabled = false;
            }, 3000);
          }
        })
        .catch(function () {
          btn.textContent = 'Network error — try again';
          btn.style.background = '#ef4444';
          btn.style.opacity = '1';
          setTimeout(function () {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        });
    });
  }

  // --- Newsletter Signup ---
  function initNewsletter() {
    document.querySelectorAll('.footer__newsletter').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var input = form.querySelector('.footer__newsletter-input');
        var btn = form.querySelector('.footer__newsletter-btn');
        var email = input.value.trim();

        if (!email) return;

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          input.style.borderColor = '#ef4444';
          setTimeout(function () { input.style.borderColor = ''; }, 2000);
          return;
        }

        var originalText = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;

        fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email }),
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.success) {
              btn.textContent = '✓';
              btn.style.background = 'var(--success)';
              input.value = '';
              input.placeholder = data.message;
              setTimeout(function () {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
                input.placeholder = 'Your email';
              }, 3000);
            } else {
              btn.textContent = '✗';
              btn.style.background = '#ef4444';
              setTimeout(function () {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
              }, 2000);
            }
          })
          .catch(function () {
            btn.textContent = '✗';
            btn.style.background = '#ef4444';
            setTimeout(function () {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.disabled = false;
            }, 2000);
          });
      });
    });
  }

  // --- Active Nav Link ---
  function initActiveNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link, .mobile-menu__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('nav__link--active');
      }
    });
  }

  // --- Initialize Everything ---
  function init() {
    initScrollProgress();
    initStickyHeader();
    initMobileMenu();
    initSmoothScroll();
    initRevealAnimations();
    initAccordion();
    initFormValidation();
    initNewsletter();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

