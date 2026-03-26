/* ===================================================
   Dr. Kaiser's Dental Clinic – Interactive Script
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM References ----
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const stickyBar = document.getElementById('stickyBar');
    const faqItems = document.querySelectorAll('.faq__item');
    const navLinks = document.querySelectorAll('.header__link');

    // ---- Mobile Nav Overlay ----
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    // ---- Mobile Menu Toggle ----
    function toggleMenu() {
        const isOpen = nav.classList.toggle('is-open');
        menuToggle.classList.toggle('is-active', isOpen);
        overlay.classList.toggle('is-active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu on nav link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('is-open')) {
                toggleMenu();
            }
        });
    });

    // ---- Header Scroll Effect ----
    let lastScrollY = 0;

    function onScroll() {
        const scrollY = window.scrollY;

        // Header scroll state
        header.classList.toggle('is-scrolled', scrollY > 50);

        // Sticky bar visibility (only on mobile)
        if (window.innerWidth < 1024) {
            stickyBar.classList.toggle('is-visible', scrollY > 500);
        }

        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run on load

    // ---- FAQ Accordion ----
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq__question');
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Close all others
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('is-open');
                other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            item.classList.toggle('is-open', !isOpen);
            btn.setAttribute('aria-expanded', !isOpen);
        });
    });

    // ---- Scroll Animations (Intersection Observer) ----
    const animatedElements = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -60px 0px'
            }
        );

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback: show all immediately
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

    // ---- Smooth Scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ---- Active Nav Link Highlight ----
    const sections = document.querySelectorAll('section[id]');

    function highlightNav() {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('is-active-link');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('is-active-link');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
});
