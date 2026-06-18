document.addEventListener('DOMContentLoaded', () => {
    initTimer();
    initFAQ();
    initUpsellModal();
    initSmoothScroll();
    initUtmTracking();
});

/* ==========================================================================
   1. COUNTDOWN TIMER
   ========================================================================== */
function initTimer() {
    const timerDisplay = document.getElementById('countdown-timer');
    const hoursDisplay = document.getElementById('hours-val');
    const minutesDisplay = document.getElementById('minutes-val');
    const secondsDisplay = document.getElementById('seconds-val');

    if (!timerDisplay && !hoursDisplay) return;

    const STORAGE_KEY = 'sales_page_timer_endtime';
    const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes in ms

    let endTime = localStorage.getItem(STORAGE_KEY);
    const now = new Date().getTime();

    if (!endTime || parseInt(endTime) < now) {
        // Create a new end time 15 minutes from now
        endTime = now + SESSION_DURATION;
        localStorage.setItem(STORAGE_KEY, endTime.toString());
    } else {
        endTime = parseInt(endTime);
    }

    function updateTimer() {
        const currentTime = new Date().getTime();
        let timeLeft = endTime - currentTime;

        if (timeLeft <= 0) {
            // Loop/Reset the timer to give a persistent sense of urgency
            const newEndTime = currentTime + SESSION_DURATION;
            localStorage.setItem(STORAGE_KEY, newEndTime.toString());
            endTime = newEndTime;
            timeLeft = SESSION_DURATION;
        }

        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');

        if (timerDisplay) {
            timerDisplay.textContent = `${minutesStr}:${secondsStr}`;
        }

        if (hoursDisplay && minutesDisplay && secondsDisplay) {
            hoursDisplay.textContent = '00';
            minutesDisplay.textContent = minutesStr;
            secondsDisplay.textContent = secondsStr;
        }
    }

    // Run immediately
    updateTimer();
    // Update every second
    setInterval(updateTimer, 1000);
}

/* ==========================================================================
   2. FAQ ACCORDION
   ========================================================================== */
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
            });

            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   3. UPSELL MODAL
   ========================================================================== */
function initUpsellModal() {
    const buyBasicBtn = document.getElementById('buy-basic-btn');
    const modal = document.getElementById('upsell-modal');
    const closeX = document.getElementById('close-modal-x');

    if (!buyBasicBtn || !modal) return;

    // Open Modal when clicking "Adquirir Plano Básico"
    buyBasicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
    });

    // Function to close modal
    function closeModal() {
        modal.classList.remove('open');
    }

    // Close on X click
    if (closeX) {
        closeX.addEventListener('click', closeModal);
    }

    // Close on overlay background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   4. SMOOTH SCROLL FOR HERO BUTTON
   ========================================================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ==========================================================================
   5. PASS UTM PARAMETERS TO CHECKOUT
   ========================================================================== */
function initUtmTracking() {
    // Executa na inicialização para os links já presentes no HTML
    passUtms();

    // Garante o repasse em eventos de clique nos links da ggcheckout
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.href.includes('ggcheckout.app')) {
            passUtms();
        }
    });

    function passUtms() {
        const params = window.location.search;
        if (!params) return;
        
        document.querySelectorAll('a').forEach(link => {
            if (link.href && link.href.includes('ggcheckout.app')) {
                try {
                    const url = new URL(link.href);
                    const searchParams = new URLSearchParams(params);
                    searchParams.forEach((value, key) => {
                        url.searchParams.set(key, value);
                    });
                    link.href = url.toString();
                } catch (err) {
                    console.error("Erro ao injetar UTMs no link:", err);
                }
            }
        });
    }
}
