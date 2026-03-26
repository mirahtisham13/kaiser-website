/* === Dr. Kaiser Dental – JS === */
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const stickyBar = document.getElementById('stickyBar');
    const darkToggle = document.getElementById('darkToggle');

    // Nav overlay
    let overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // Mobile menu
    function toggleMenu() {
        const open = nav.classList.toggle('is-open');
        menuToggle.classList.toggle('is-active', open);
        overlay.classList.toggle('is-active', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    nav.querySelectorAll('.header__link').forEach(l => l.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) toggleMenu();
    }));

    // Sticky header + bar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 50);
        if (stickyBar) stickyBar.classList.toggle('is-visible', y > 400);
        lastScroll = y;
    }, { passive: true });

    // FAQ accordion
    document.querySelectorAll('.faq__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const wasOpen = item.classList.contains('is-open');
            document.querySelectorAll('.faq__item.is-open').forEach(i => i.classList.remove('is-open'));
            if (!wasOpen) item.classList.add('is-open');
            btn.setAttribute('aria-expanded', !wasOpen);
        });
    });

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // Dark mode
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') setTheme('dark');

    darkToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Before/After Image Sliders
    document.querySelectorAll('[data-slider]').forEach(slider => {
        const overlay = slider.querySelector('.img-slider__overlay');
        const handle = slider.querySelector('.img-slider__handle');
        const overlayImg = overlay.querySelector('img');
        let isDragging = false;

        function setPosition(x) {
            const rect = slider.getBoundingClientRect();
            let pct = ((x - rect.left) / rect.width) * 100;
            pct = Math.max(2, Math.min(98, pct));
            overlay.style.width = pct + '%';
            handle.style.left = pct + '%';
            // Keep overlay image at container width so it aligns with background
            overlayImg.style.width = rect.width + 'px';
        }

        function onStart(e) {
            isDragging = true;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            setPosition(cx);
        }
        function onMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            setPosition(cx);
        }
        function onEnd() { isDragging = false; }

        slider.addEventListener('mousedown', onStart);
        slider.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);

        // Init overlay image width on load/resize
        function initSize() {
            const w = slider.getBoundingClientRect().width;
            overlayImg.style.width = w + 'px';
        }
        const bgImg = slider.querySelector('.img-slider__bg');
        if (bgImg.complete) initSize();
        bgImg.addEventListener('load', initSize);
        window.addEventListener('resize', initSize);
    });
});
