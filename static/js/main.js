/* ============================================================
   ADAM GROUP — Main JavaScript
   ============================================================ */

   document.addEventListener('DOMContentLoaded', () => {

  /* ── Startup Loader ── */
  const startupLoader = document.getElementById('startup-loader');
  if (startupLoader) {
    document.body.classList.add('loading-active');
    window.addEventListener('load', () => {
      setTimeout(() => {
        startupLoader.classList.add('hidden');
        document.body.classList.remove('loading-active');
      }, 650);
    });
  }

    /* ── Navbar Show/Hide on Scroll ── */
    const navbar = document.getElementById('navbar');
    const hero   = document.getElementById('hero');
    let lastScroll = 0;
  
    const handleScroll = () => {
      const heroH = hero ? hero.offsetHeight : window.innerHeight;
      const currentScroll = window.pageYOffset;
  
      if (currentScroll > heroH * 0.6) {
        navbar.classList.add('visible');
      } else {
        navbar.classList.remove('visible');
      }
      lastScroll = currentScroll;
    };
  
    window.addEventListener('scroll', handleScroll, { passive: true });
  
    /* ── Mobile Menu Toggle ── */
    const menuBtn    = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
  
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        }
      });
  
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          const icon = menuBtn.querySelector('i');
          if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
        });
      });
    }
  
    /* ── Smooth Scroll for anchor links ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = navbar ? navbar.offsetHeight : 0;
          const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      });
    });
  
    /* ── Scroll Reveal ── */
    const revealEls = document.querySelectorAll('.reveal');
  
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  
    revealEls.forEach(el => revealObserver.observe(el));
  
    /* ── Parallax on Hero ── */
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        heroVideo.style.transform = `translateY(${scrolled * 0.25}px)`;
      }, { passive: true });
    }
  
    /* ── Contact Form Submission ── */
    const contactForm = document.getElementById('contact-form');
    const submitBtn   = document.getElementById('submit-btn');
    const toast       = document.getElementById('toast');
  const serviceSelect = document.getElementById('service');
  const cateringTypeWrap = document.getElementById('catering-type-wrap');
  const cateringTypeSelect = document.getElementById('catering_type');
  const eventDateInput = document.getElementById('event_date');
  const messageInput = document.getElementById('message');

  const updateServiceFlow = () => {
    if (!serviceSelect || !cateringTypeWrap || !eventDateInput) return;
    const selectedService = serviceSelect.value;

    if (selectedService === 'adam-catering') {
      cateringTypeWrap.classList.remove('hidden');
      cateringTypeSelect.required = true;
      eventDateInput.required = true;
      if (messageInput && !messageInput.value.trim()) {
        messageInput.value = 'I am interested in Adam Catering.';
      }
    } else if (selectedService === 'adam-kitchen') {
      cateringTypeWrap.classList.add('hidden');
      cateringTypeSelect.required = false;
      cateringTypeSelect.value = '';
      eventDateInput.required = true;
      if (messageInput) {
        messageInput.value = 'I am interested in Adam Kitchen rental.';
      }
    } else {
      cateringTypeWrap.classList.add('hidden');
      cateringTypeSelect.required = false;
      cateringTypeSelect.value = '';
      eventDateInput.required = false;
      if (messageInput) {
        messageInput.value = '';
      }
    }
  };

  if (serviceSelect) {
    serviceSelect.addEventListener('change', updateServiceFlow);
    updateServiceFlow();
  }
  
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const formData = {
          name:       contactForm.querySelector('#name').value.trim(),
          phone:      contactForm.querySelector('#phone').value.trim(),
          email:      contactForm.querySelector('#email').value.trim(),
          event_date: contactForm.querySelector('#event_date').value,
          service:    contactForm.querySelector('#service').value,
          catering_type: contactForm.querySelector('#catering_type')?.value || '',
          message:    contactForm.querySelector('#message').value.trim(),
        };
  
        // Basic validation
        if (!formData.name || !formData.phone || !formData.email || !formData.service) {
          showToast('Please fill in all required fields.', true);
          return;
        }

        if (formData.service === 'adam-catering' && !formData.catering_type) {
          showToast('Please select a catering type.', true);
          return;
        }

        if ((formData.service === 'adam-catering' || formData.service === 'adam-kitchen') && !formData.event_date) {
          showToast('Please select an event date.', true);
          return;
        }
  
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Sending…';
  
        try {
          const res = await fetch('/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
  
          if (data.success) {
            showToast(data.message);
            contactForm.reset();
            updateServiceFlow();
          } else {
            showToast(data.message || 'Something went wrong. Please try again.', true);
          }
        } catch {
          showToast('Network error. Please call us directly.', true);
        } finally {
          submitBtn.disabled = false;
          submitBtn.querySelector('span').textContent = 'Send Enquiry';
        }
      });
    }
  
    function showToast(msg, isError = false) {
      if (!toast) return;
      toast.textContent = msg;
      toast.style.borderColor = isError ? 'rgba(200,60,60,0.5)' : 'rgba(201,168,76,0.35)';
      toast.style.color = isError ? '#f5a0a0' : '#F5E6C0';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4500);
    }
  
    /* ── Active Nav Highlight ── */
    const navLinks  = document.querySelectorAll('.nav-link[data-section]');
    // Observe only the elements the nav links actually target.
    const observedTargets = Array.from(navLinks)
      .map(link => document.getElementById(link.dataset.section))
      .filter(Boolean);
  
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.style.color = link.dataset.section === entry.target.id
              ? 'var(--gold)'
              : '';
          });
        }
      });
    }, { threshold: 0.4 });
  
    observedTargets.forEach(target => sectionObserver.observe(target));
  
    /* ── Number Counter Animation ── */
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.counted) return;
        entry.target.dataset.counted = 'true';
        const target = +entry.target.dataset.count;
        let current = 0;
        const step = target / 50;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            entry.target.textContent = target + (entry.target.dataset.suffix || '');
            clearInterval(timer);
          } else {
            entry.target.textContent = Math.floor(current) + (entry.target.dataset.suffix || '');
          }
        }, 28);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  
  });