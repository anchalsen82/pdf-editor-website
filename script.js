// ============================================
// NextGen Tutorials - Website Script
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a nav link is clicked
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                var navHeight = navbar ? navbar.offsetHeight : 0;
                var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll-based fade-in animations
    var fadeElements = document.querySelectorAll(
        '.subject-card, .board-card, .feature-card, .about-grid, .contact-wrapper'
    );

    fadeElements.forEach(function (el) {
        el.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(function (el) {
        observer.observe(el);
    });

    // Contact form handling
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = document.getElementById('name').value.trim();
            var phone = document.getElementById('phone').value.trim();
            var classSelect = document.getElementById('class-select').value;

            if (!name || !phone || !classSelect) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            // Show success message
            showToast('Thank you! We will contact you shortly to schedule your free demo class.', 'success');
            contactForm.reset();
        });
    }

    // Toast notification
    function showToast(message, type) {
        // Remove existing toast
        var existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + (type || 'success');
        toast.textContent = message;

        toast.style.cssText = [
            'position: fixed',
            'bottom: 2rem',
            'right: 2rem',
            'padding: 1rem 1.5rem',
            'border-radius: 8px',
            'color: #fff',
            'font-size: 0.95rem',
            'font-family: inherit',
            'max-width: 400px',
            'z-index: 9999',
            'box-shadow: 0 4px 16px rgba(0,0,0,0.2)',
            'animation: toastIn 0.3s ease'
        ].join(';');

        if (type === 'error') {
            toast.style.background = '#dc2626';
        } else {
            toast.style.background = '#059669';
        }

        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }

    // Add toast animation keyframes
    var style = document.createElement('style');
    style.textContent = '@keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }';
    document.head.appendChild(style);
});
