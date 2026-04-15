document.addEventListener('DOMContentLoaded', () => {
    // === GSAP Text Reveal & Parallax (Section: Sobre Nós / Services) ===
    const animatedText = document.getElementById('animated-text');
    if (animatedText && typeof gsap !== 'undefined') {
        const textStr = animatedText.innerText.trim();
        animatedText.innerHTML = ''; // Limpa o conteúdo atual
        
        // Separa a frase principal da frase em destaque
        const textParts = textStr.split('soluções reais."');
        const normalWords = textParts[0].trim().split(' ');
        const highlightWords = 'soluções reais."'.split(' ');

        // Adiciona as palavras normais
        normalWords.forEach(word => {
            if(!word) return;
            const span = document.createElement('span');
            span.className = 'word word-normal';
            span.innerText = word;
            animatedText.appendChild(span);
            animatedText.appendChild(document.createTextNode(' ')); // Espaço explícito entre as palavras
        });

        // Adiciona o bloco com "soluções reais." (itálico e destaque)
        const serifWrapper = document.createElement('span');
        serifWrapper.className = 'serif-italic';
        highlightWords.forEach((word, idx) => {
            if(!word) return;
            const span = document.createElement('span');
            span.className = 'word word-highlight';
            span.innerText = word;
            serifWrapper.appendChild(span);
            if (idx < highlightWords.length - 1) {
                serifWrapper.appendChild(document.createTextNode(' '));
            }
        });
        animatedText.appendChild(serifWrapper);

        // Fixando (Pin) a secção no meio da tela enquanto o texto revela
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.quote-section',
                start: "center center", // Prende quando a secção atingir o centro
                end: "+=200%", // Aumentado de 150% para 200% para dar mais espaço de scroll total
                pin: true,
                scrub: 1
            }
        });

        // Revela as palavras na ordem natural do DOM (stagger) 
        tl.to('.word', {
            color: (index, target) => target.classList.contains('word-highlight') ? "#7c300c" : "#ffffff",
            filter: (index, target) => target.classList.contains('word-highlight') ? "saturate(1)" : "none",
            stagger: 0.1,
            ease: "none"
        })
        .to('.author-info', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        }, "+=0.1")
        .to({}, { duration: 1 }); // Adiciona um "tempo morto" no final da timeline para travar o scroll após revelar tudo
    }

    // Scroll Suave para Links Internos (Navbar)
    // Substitui o scroll-behavior: smooth do CSS que conflita com o GSAP
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const val = this.getAttribute('href');
            if(val !== '#' && val !== '') {
                e.preventDefault();
                const target = document.querySelector(val);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

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
            } else {
                if(entry.target.classList.contains('reveal-repeat')) {
                    entry.target.classList.remove('visible');
                }
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Animações de revelação dos cards removidas a pedido; aparecem imediatamente na carga.
    
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
        const triggerPoint = viewHeight / 2;
        
        // Progress starts when top of timeline hits middle of screen
        const startScroll = rect.top - triggerPoint;
        const totalHeight = rect.height;
        
        let progress = 0;
        if (startScroll < 0) {
            progress = Math.min(Math.max((Math.abs(startScroll) / totalHeight) * 100, 0), 100);
            progressLine.style.height = `${progress}%`;
        }

        // Ativação dos anos e bolinhas (Saturation effect)
        const timelineItems = document.querySelectorAll('.timeline-item-wrapper');
        timelineItems.forEach(item => {
            const dot = item.querySelector('.timeline-v-dot');
            const year = item.querySelector('.timeline-v-year');
            if (!dot || !year) return;
            
            const dotRect = dot.getBoundingClientRect();
            
            // Se o dot passou do ponto de gatilho (meio da tela)
            if (dotRect.top <= triggerPoint) {
                dot.classList.add('active');
                year.classList.add('active');
            } else {
                dot.classList.remove('active');
                year.classList.remove('active');
            }
        });
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

    // --- Stacking Cards Effect ---
    const initStackingCards = () => {
        const parent = document.querySelector('.projects-grid');
        const cards = document.querySelectorAll('.project-card');
        if (!parent || cards.length === 0) return;

        // Envolve as classes visuais num wrapper limpo para evitar conflitos de tilt hover ou entrance CSS
        cards.forEach((card) => {
            const visual = card.querySelector('.project-card-visual');
            if (visual) {
                const stackWrapper = document.createElement('div');
                stackWrapper.className = 'project-stack-wrapper';
                card.appendChild(stackWrapper);
                stackWrapper.appendChild(visual);
            }
        });

        const updateStack = () => {
            const stickyTop = window.innerHeight * 0.20;
            const gap = window.innerHeight * 0.30;
            
            cards.forEach((card, index) => {
                const stackWrapper = card.querySelector('.project-stack-wrapper');
                if (!stackWrapper) return;
                
                let scale = 1;
                let brightness = 1;
                let yOffset = 0;
                
                if (index < cards.length - 1) {
                    const nextCard = cards[index + 1];
                    // Calcula a distância exata até o proximo card
                    const distanceToNext = card.getBoundingClientRect().height + gap;
                    
                    // A distância que o PRÓXIMO card está do ponto de ancoragem (stickyTop)
                    const distanceToStick = nextCard.getBoundingClientRect().top - stickyTop;
                    
                    // levels -> fração do percurso já feito pelo próximo card rumo ao topo do atual
                    // Se distanceToStick = distanceToNext (ta na base), levels = 0
                    // Se distanceToStick = 0 (ta no topo), levels = 1
                    let levels = 1 - (distanceToStick / distanceToNext);
                    levels = Math.max(0, Math.min(1, levels)); // Força limites de 0 a 1
                    
                    if (levels > 0) {
                        scale = 1 - (levels * 0.15); // Encolhimento super perceptivo de 15%
                        
                        yOffset = -(levels * 40); // Move 40px PARA CIMA para criar o degrau visual
                        
                        brightness = 1 - (levels * 0.5); 
                        brightness = Math.max(0.3, brightness); // Teto de iluminação
                    }
                }
                
                stackWrapper.style.transform = `translateY(${yOffset}px) scale(${scale})`;
                stackWrapper.style.filter = `brightness(${brightness})`;
            });
        };

        window.addEventListener('scroll', () => requestAnimationFrame(updateStack), { passive: true });
        window.addEventListener('resize', () => requestAnimationFrame(updateStack), { passive: true });
        updateStack();
    };

    initStackingCards();
});

