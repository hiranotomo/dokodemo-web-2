// au Official Visual Identity JavaScript - SIMPLE Principle
// WCAG 2.1 AA compliant, keyboard navigation support

class AuSiteManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupKeyboardNavigation();
    this.setupAccessibility();
    this.setupFormValidation();
    this.handleReducedMotion();
    this.setupScrollAnimations();
  }

  // Navigation - Right slide panel with backdrop blur
  setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const menuPanel = document.querySelector('.menu-panel');
    const backdrop = document.querySelector('.backdrop');
    const menuLinks = document.querySelectorAll('.menu-list a');

    if (!hamburger || !menuPanel) return;

    // Toggle menu
    const toggleMenu = () => {
      const isOpen = document.body.classList.toggle('menu-open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
      
      // Focus management
      if (isOpen) {
        menuPanel.focus();
        this.trapFocus(menuPanel);
      } else {
        hamburger.focus();
      }
    };

    // Close menu
    const closeMenu = () => {
      document.body.classList.remove('menu-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'メニューを開く');
      hamburger.focus();
    };

    // Event listeners
    hamburger.addEventListener('click', toggleMenu);
    
    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    // Close menu on menu link click
    menuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // ESC key to close menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMenu();
      }
    });
  }

  // Keyboard Navigation Support
  setupKeyboardNavigation() {
    // Tab navigation for menu
    const menuItems = document.querySelectorAll('.menu-list a');
    
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (index + 1) % menuItems.length;
          menuItems[nextIndex].focus();
        }
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
          menuItems[prevIndex].focus();
        }
      });
    });

    // Button keyboard support
    document.querySelectorAll('.btn[role="button"]').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  // Focus trap for modals and navigation
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }

  // Accessibility features
  setupAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // ARIA live region updates
    this.setupLiveRegions();

    // High contrast mode detection
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }

    // Focus visible polyfill for older browsers
    this.setupFocusVisible();
  }

  // Live regions for dynamic content
  setupLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);

    // Announce method
    window.announce = (message) => {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    };
  }

  // Focus visible support
  setupFocusVisible() {
    if (!('focus-visible' in document.documentElement.style)) {
      // Simple focus-visible polyfill
      let hadKeyboardEvent = false;

      const onKeyDown = () => {
        hadKeyboardEvent = true;
      };

      const onPointerDown = () => {
        hadKeyboardEvent = false;
      };

      const onFocus = (e) => {
        if (hadKeyboardEvent) {
          e.target.classList.add('focus-visible');
        }
      };

      const onBlur = (e) => {
        e.target.classList.remove('focus-visible');
      };

      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('mousedown', onPointerDown);
      document.addEventListener('focus', onFocus, true);
      document.addEventListener('blur', onBlur, true);
    }
  }

  // Form validation with WCAG compliance
  setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearErrors(input));
        
        // ARIA attributes
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (label && input.hasAttribute('required')) {
          input.setAttribute('aria-required', 'true');
        }
      });

      // Form submission
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
          this.focusFirstError(form);
        }
      });
    });
  }

  // Field validation
  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    let isValid = true;
    let message = '';

    // Required check
    if (required && !value) {
      isValid = false;
      message = 'この項目は必須です';
    }

    // Type-specific validation
    if (value && type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = '有効なメールアドレスを入力してください';
      }
    }

    if (value && type === 'tel') {
      const phoneRegex = /^[\d\-\+\(\)\s]+$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = '有効な電話番号を入力してください';
      }
    }

    // Length validation
    const minLength = field.getAttribute('minlength');
    if (value && minLength && value.length < parseInt(minLength)) {
      isValid = false;
      message = `${minLength}文字以上で入力してください`;
    }

    this.updateFieldValidation(field, isValid, message);
    return isValid;
  }

  // Update field validation UI
  updateFieldValidation(field, isValid, message) {
    const errorId = `${field.id}-error`;
    let errorElement = document.getElementById(errorId);

    if (!isValid) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('error');

      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'form-error';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);
        field.setAttribute('aria-describedby', errorId);
      }

      errorElement.textContent = message;
    } else {
      field.setAttribute('aria-invalid', 'false');
      field.classList.remove('error');
      
      if (errorElement) {
        errorElement.textContent = '';
      }
    }
  }

  // Clear errors on input
  clearErrors(field) {
    if (field.classList.contains('error') && field.value.trim()) {
      this.validateField(field);
    }
  }

  // Validate entire form
  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isFormValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  // Focus first error
  focusFirstError(form) {
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Handle reduced motion preference
  handleReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionPreference = (mq) => {
      if (mq.matches) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }
    };

    handleMotionPreference(mediaQuery);
    mediaQuery.addEventListener('change', handleMotionPreference);
  }

  // Smooth scroll with reduced motion support
  smoothScroll(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = isReducedMotion ? 'auto' : 'smooth';

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: elementPosition,
      behavior: behavior
    });
  }

  // Utility: Announce to screen readers
  announce(message) {
    if (window.announce) {
      window.announce(message);
    }
  }

  // Utility: debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Setup scroll animations
  setupScrollAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe interview sections in CEO column
    const interviewSections = document.querySelectorAll('.interview-section');
    interviewSections.forEach(section => {
      observer.observe(section);
    });

    // Observe benefit cards and other animated elements
    const animatedElements = document.querySelectorAll('.benefit-card, .power-item, .case-item');
    animatedElements.forEach((element, index) => {
      // Add staggered animation delay
      element.style.transitionDelay = `${index * 100}ms`;
      observer.observe(element);
    });

    // Setup navigation highlighting based on scroll position
    this.setupScrollNavigation();
  }

  // Setup scroll-based navigation highlighting
  setupScrollNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.menu-list a[href^="#"]');

    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-64px 0px -50% 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          
          // Remove active class from all nav links
          navLinks.forEach(link => link.classList.remove('active'));
          
          // Add active class to current section link
          const activeLink = document.querySelector(`.menu-list a[href="#${id}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AuSiteManager();
  });
} else {
  new AuSiteManager();
}

// Global utilities
window.AuUtils = {
  // Smooth scroll with au motion guidelines
  scrollTo: (target, offset = 64) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = isReducedMotion ? 'auto' : 'smooth';

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: elementPosition,
      behavior: behavior
    });
  },

  // Format phone number
  formatPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
  },

  // Validate email
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
};

// CSS class for screen reader only content
const srOnlyStyles = `
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
`;

// Inject screen reader only styles
const styleSheet = document.createElement('style');
styleSheet.textContent = srOnlyStyles;
document.head.appendChild(styleSheet);

// au Visual Identity - Enhanced Hero Effects
function createParticleEffect() {
    const hero = document.querySelector('.hero');
    const particleCount = window.innerWidth > 768 ? 8 : 4;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 20 + 10}px;
            height: ${Math.random() * 20 + 10}px;
            background: var(--au-brand);
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.2};
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: particle-float ${Math.random() * 10 + 15}s linear infinite;
            z-index: 1;
        `;
        hero.appendChild(particle);
    }
}

// Enhanced scroll reveal with au-style timing
function enhancedScrollReveal() {
    const revealElements = document.querySelectorAll('.card, .benefit-card, .power-item, .case-item, .interview-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered animation with au timing
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        observer.observe(el);
    });
}

// Dynamic organic shape morphing
function animateOrganicShapes() {
    const shapes = document.querySelectorAll('.hero-organic-shape');
    
    shapes.forEach((shape, index) => {
        setInterval(() => {
            const randomRadius = () => Math.random() * 30 + 30;
            shape.style.borderRadius = `${randomRadius()}% ${randomRadius()}% ${randomRadius()}% ${randomRadius()}%`;
        }, 3000 + index * 1000);
    });
}

// Mouse parallax effect for hero
function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const shapes = document.querySelectorAll('.hero-organic-shape, .hero::before, .hero::after');
    
    if (window.innerWidth > 768) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                const translateX = x * speed * 20;
                const translateY = y * speed * 20;
                
                if (shape.style) {
                    shape.style.transform = `translate(${translateX}px, ${translateY}px) ${shape.style.transform || ''}`;
                }
            });
        });
    }
}

// Initialize au-style effects
document.addEventListener('DOMContentLoaded', function() {
    // Menu functionality
    initializeMenu();
    
    // FAQ functionality
    initializeFAQ();
    
    // Form functionality
    initializeForm();
    
    // Scroll reveal animations
    initializeScrollReveal();
    
    // au Visual Identity Effects
    createParticleEffect();
    enhancedScrollReveal();
    animateOrganicShapes();
    initHeroParallax();
    
    // Navigation highlighting
    initializeNavigation();
}); 