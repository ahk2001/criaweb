document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations para itens gerais (Timeline, Títulos, etc)
    const revealElements = document.querySelectorAll('.reveal-item');
    
    const observerOptions = {
        threshold: 0.05, // Dispara rápido (5%) para containers gigantes não travarem a página
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Quote text specific highlight effect
                if(entry.target.classList.contains('text-reveal')) {
                    entry.target.classList.add('active');
                }
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Reveal animations ESPECÍFICO para os cards (Projetos)
    const cardElements = document.querySelectorAll('.reveal-left');
    const cardObserverOptions = {
        threshold: 0.4, // Dispara quando quase metade (40%) do card estiver visível
        rootMargin: "0px"
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, cardObserverOptions);

    cardElements.forEach(el => cardObserver.observe(el));
    
    // PRELOADER LOGIC & Hero Reveal
    const preloader = document.getElementById('preloader');
    const glitchWrapper = document.querySelector('.glitch-wrapper');

    if (preloader && glitchWrapper) {
        document.body.classList.add('no-scroll');

        // Para o glitch aos 2s
        setTimeout(() => {
            glitchWrapper.classList.add('glitch-fixed');
        }, 2000);

        // Fade-out do preloader aos 3s (2s glitch + 1s limpo)
        setTimeout(() => {
            preloader.classList.add('fade-out');

            preloader.addEventListener('transitionend', () => {
                preloader.remove();
                document.body.classList.remove('no-scroll');

                // Inicia animações hero APÓS remover preloader
                const heroElements = document.querySelectorAll('.hero .reveal-item');
                heroElements.forEach(el => {
                    el.classList.add('visible');
                });
            }, { once: true });
        }, 3000);
    } else {
        setTimeout(() => {
            const heroElements = document.querySelectorAll('.hero .reveal-item');
            heroElements.forEach(el => {
                el.classList.add('visible');
            });
        }, 100);
    }

    // --- Vertical Timeline Progress Line ---
    const progressLine = document.getElementById('timeline-progress-v');
    const timelineBody = document.querySelector('.timeline-body');

    const updateTimelineProgress = () => {
        if (!progressLine || !timelineBody) return;

        const rect = timelineBody.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        
        // Progress starts when top of timeline hits middle of screen
        const startScroll = rect.top - (viewHeight / 2);
        const totalHeight = rect.height;
        
        let progress = 0;
        if (startScroll < 0) {
            progress = Math.min(Math.max((Math.abs(startScroll) / totalHeight) * 100, 0), 100);
            progressLine.style.height = `${progress}%`;
        }
    };

    window.addEventListener('scroll', updateTimelineProgress);
    window.addEventListener('resize', updateTimelineProgress);
    updateTimelineProgress(); // Initial check

    // --- Project Card 3D Tilt & Mouse Interaction ---
    const cardTiltEffect = () => {
        const cards = document.querySelectorAll(".project-card");
        
        cards.forEach(card => {
            const visual = card.querySelector(".project-card-visual");
            if (!visual) return;
            
            let rect = null;

            card.addEventListener('mouseenter', () => {
                rect = card.getBoundingClientRect();
            });

            card.addEventListener('mousemove', e => {
                if (!rect) rect = card.getBoundingClientRect();
                
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Flashlight vars (passados para o visual)
                visual.style.setProperty("--mouse-x", `${x}px`);
                visual.style.setProperty("--mouse-y", `${y}px`);
                
                // 3D Tilt calculation
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -7; 
                const rotateY = ((x - centerX) / centerX) * 7;
                
                visual.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                rect = null;
                visual.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    };

    cardTiltEffect();
});
