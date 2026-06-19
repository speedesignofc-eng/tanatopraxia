document.addEventListener('DOMContentLoaded', () => {
    initTimer();
    initFAQ();
    initUtmTracking();
});

/* ==========================================================================
   1. COUNTDOWN TIMER
   ========================================================================== */
function initTimer() {
    const timerDisplay = document.getElementById('countdown-timer');
    if (!timerDisplay) return;

    const STORAGE_KEY = 'retention_page_timer_endtime';
    const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in ms

    let endTime = localStorage.getItem(STORAGE_KEY);
    const now = new Date().getTime();

    if (!endTime || parseInt(endTime) < now) {
        // Create a new end time 10 minutes from now
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

        timerDisplay.textContent = `${minutesStr}:${secondsStr}`;
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
   3. PASS UTM PARAMETERS TO CHECKOUT
   ========================================================================== */
function initUtmTracking() {
    // Run immediately for pre-existing links
    passUtms();

    // Ensure UTM forwarding on dynamic click events for ggcheckout links
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
