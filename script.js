// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(function (error) {
            console.error('Service Worker registration failed:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired. Initializing script...');
    // Ensure GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.error('GSAP not loaded! Make sure the CDN link is correct and loads before this script.');
        return;
    }

    // GSAP Card Animations
    const allCards = gsap.utils.toArray('.card-blue-med, .card-gray-lg, .card-teal-lg, .card-coral-med');

    if (allCards.length > 0) {
        gsap.from(allCards, {
            duration: 0.8,      // Animation duration for each card
            opacity: 0,         // Start with opacity 0
            y: 50,              // Start 50px down
            stagger: 0.2,       // Delay between each card's animation
            ease: "power2.out", // Easing function for a smooth effect
            delay: 0.3          // Optional: delay before the first card starts animating
        });
    }

    // --- Helper functions for auto-close on max scroll ---
    const scrollListenerKey = '_autoCloseScrollListener';

    function addAutoCloseScrollListener(modalElement, closeCallback) {
        console.log(`Attempting to add scroll listener to:`, modalElement ? modalElement.id : 'undefined modalElement', modalElement);
        if (!modalElement || typeof closeCallback !== 'function') {
            console.error("addAutoCloseScrollListener: Invalid arguments", modalElement, closeCallback);
            return;
        }

        const modalContentElement = modalContentElements[modalElement.id]; // Get the corresponding content element
        if (!modalContentElement) {
            console.error(`No modalContentElement found for ${modalElement.id} in modalContentElements map.`);
            return;
        }

        // Diagnostic: Check if the element is even considered scrollable by the browser
        if (modalElement.scrollHeight <= modalElement.clientHeight) {
            console.warn(`Modal ${modalElement.id} is NOT initially scrollable (scrollHeight: ${modalElement.scrollHeight} <= clientHeight: ${modalElement.clientHeight}). Auto-close on max scroll might not trigger if content doesn't make it scrollable later.`);
        } else {
            console.log(`Modal ${modalElement.id} IS initially scrollable (scrollHeight: ${modalElement.scrollHeight} > clientHeight: ${modalElement.clientHeight}).`);
        }
        // Remove any existing listener first to prevent duplicates
        removeAutoCloseScrollListener(modalElement);

        const handleScroll = () => {
            // console.log(`SCROLL EVENT on ${modalElement.id}`); // Basic check: Is the scroll event firing?
            const scrollTop = modalElement.scrollTop;
            const scrollHeight = modalElement.scrollHeight;
            const clientHeight = modalElement.clientHeight;
            const tolerance = 5; // Tolerance for sub-pixel rendering
            const maxScroll = scrollHeight - clientHeight - tolerance;

            // console.log(`Modal ID: ${modalElement.id}, ScrollTop: ${scrollTop}, ScrollHeight: ${scrollHeight}, ClientHeight: ${clientHeight}, Target: ${maxScroll}`);
            if (scrollTop >= maxScroll) {
                console.log(`Modal ${modalElement.id} reached max scroll. Auto-closing.`);
                closeCallback(); 
            }
        };

        modalElement.addEventListener('scroll', handleScroll);
        modalElement[scrollListenerKey] = handleScroll; 
        console.log(`ADD: Listener for ${modalElement.id} supposedly added. Handler function:`, handleScroll);
    }

    function removeAutoCloseScrollListener(modalElement) {
        if (modalElement && modalElement[scrollListenerKey]) {
            modalElement.removeEventListener('scroll', modalElement[scrollListenerKey]);
            delete modalElement[scrollListenerKey]; 
            // console.log(`Removed scroll listener from ${modalElement.id}`);
        }
    }

    // --- DOM Element Selections ---
    // const mainContentElement = document.querySelector('main'); // Selected but not used for opacity animations

    // Scores Modal Elements
    const scoresModal = document.getElementById('scoresModal');
    const scoresModalContent = scoresModal ? scoresModal.querySelector('.modal-content') : null;
    const closeModalButtonScores = scoresModal ? scoresModal.querySelector('.close-button') : null;
    const scoresLink = document.querySelector('a[href="scores.html"]');

    // Handicaps Modal Elements
    const handicapsModal = document.getElementById('handicapsModal');
    const handicapsModalContent = handicapsModal ? handicapsModal.querySelector('.modal-content') : null;
    const closeModalButtonHandicaps = handicapsModal ? handicapsModal.querySelector('.close-button') : null;
    const handicapsLink = document.querySelector('a[href="#handicaps-modal-trigger"]');

    // Best 14 Modal Elements
    const best14Modal = document.getElementById('best14Modal');
    const best14ModalContent = best14Modal ? best14Modal.querySelector('.modal-content') : null;
    const closeModalButtonBest14 = best14Modal ? best14Modal.querySelector('.close-button') : null;
    const best14Link = document.querySelector('a[href="#best14-modal-trigger"]');

    // Leagues Modal Elements
    const leaguesModal = document.getElementById('leaguesModal');
    const leaguesModalContent = leaguesModal ? leaguesModal.querySelector('.modal-content') : null;
    const closeModalButtonLeagues = leaguesModal ? leaguesModal.querySelector('.close-button') : null;
    const leaguesLink = document.querySelector('a[href="#leagues-modal-trigger"]');

    // Map modal IDs to their content elements for easier access in scroll handler
    const modalContentElements = {
        scoresModal: scoresModalContent,
        handicapsModal: handicapsModalContent,
        best14Modal: best14ModalContent,
        leaguesModal: leaguesModalContent
    };

    // --- Modal Logic ---

    // Scores Modal
    if (scoresLink && scoresModal && scoresModalContent && closeModalButtonScores) {
        console.log('Scores modal elements found. Attaching event listener to scoresLink.');
        scoresLink.addEventListener('click', function(event) {
            console.log('Scores link clicked. Preventing default navigation.');
            event.preventDefault();
            if (scoresModal) scoresModal.scrollTop = 0;
            window.scrollTo(0, 0);
            document.body.classList.add('modal-open-no-scroll');

            gsap.set(scoresModalContent, { x: '100vw', autoAlpha: 0 });
            gsap.to(scoresModal, {
                duration: 0.3,
                autoAlpha: 1,
                ease: "power2.out",
                onComplete: addAutoCloseScrollListener,
                onCompleteParams: [scoresModal, closeScoresModal]
            });
            gsap.to(scoresModalContent, {
                duration: 0.5,
                x: 0,
                autoAlpha: 1,
                ease: "power2.out",
                delay: 0.1,
            });
        });

        function closeScoresModal() {
            removeAutoCloseScrollListener(scoresModal);
            gsap.to(scoresModalContent, {
                duration: 0.4, 
                x: '100vw',
                autoAlpha: 0,
                ease: "power2.in"
            });
            gsap.to(scoresModal, { 
                duration: 0.3, 
                autoAlpha: 0,
                ease: "power2.in",
                delay: 0.1, 
                onComplete: () => {
                    document.body.classList.remove('modal-open-no-scroll');
                }
            });
        }
        closeModalButtonScores.addEventListener('click', closeScoresModal);
        scoresModal.addEventListener('click', function(event) {
            if (event.target === scoresModal) {
                closeScoresModal();
            }
        });
    } else {
        console.error('One or more Scores modal elements NOT found. scoresLink:', scoresLink, 'scoresModal:', scoresModal, 'scoresModalContent:', scoresModalContent, 'closeModalButtonScores:', closeModalButtonScores);
    }

    // Handicaps Modal
    if (handicapsLink && handicapsModal && handicapsModalContent && closeModalButtonHandicaps) {
        handicapsLink.addEventListener('click', function(event) {
            event.preventDefault();
            if (handicapsModal) handicapsModal.scrollTop = 0;
            window.scrollTo(0, 0);
            document.body.classList.add('modal-open-no-scroll');

            gsap.set(handicapsModalContent, { x: '100vw', autoAlpha: 0 });
            gsap.to(handicapsModal, {
                duration: 0.3,
                autoAlpha: 1,
                ease: "power2.out",
                onComplete: addAutoCloseScrollListener,
                onCompleteParams: [handicapsModal, closeHandicapsModal]
            });
            gsap.to(handicapsModalContent, {
                duration: 0.5,
                x: 0,
                autoAlpha: 1,
                ease: "power2.out",
                delay: 0.1
            });
        });

        function closeHandicapsModal() {
            removeAutoCloseScrollListener(handicapsModal); 
            gsap.to(handicapsModalContent, {
                duration: 0.4,
                x: '100vw',
                autoAlpha: 0,
                ease: "power2.in"
            });
            gsap.to(handicapsModal, {
                duration: 0.3,
                autoAlpha: 0,
                ease: "power2.in",
                delay: 0.1,
                onComplete: () => {
                    document.body.classList.remove('modal-open-no-scroll');
                }
            });
        }
        closeModalButtonHandicaps.addEventListener('click', closeHandicapsModal);
        handicapsModal.addEventListener('click', function(event) {
            if (event.target === handicapsModal) {
                closeHandicapsModal();
            }
        });
    } else {
        // Error logging for missing Handicaps Modal elements
    }

    // Best 14 Modal
    if (best14Link && best14Modal && best14ModalContent && closeModalButtonBest14) {
        best14Link.addEventListener('click', function(event) {
            event.preventDefault();
            if (best14Modal) best14Modal.scrollTop = 0;
            window.scrollTo(0, 0);
            document.body.classList.add('modal-open-no-scroll');

            gsap.set(best14ModalContent, { x: '100vw', autoAlpha: 0 });
            gsap.to(best14Modal, {
                duration: 0.3,
                autoAlpha: 1,
                ease: "power2.out",
                onComplete: addAutoCloseScrollListener,
                onCompleteParams: [best14Modal, closeBest14Modal]
            });
            gsap.to(best14ModalContent, {
                duration: 0.5,
                x: 0,
                autoAlpha: 1,
                ease: "power2.out",
                delay: 0.1
            });
        });

        function closeBest14Modal() {
            removeAutoCloseScrollListener(best14Modal); 
            gsap.to(best14ModalContent, {
                duration: 0.4,
                x: '100vw',
                autoAlpha: 0,
                ease: "power2.in"
            });
            gsap.to(best14Modal, {
                duration: 0.3,
                autoAlpha: 0,
                ease: "power2.in",
                delay: 0.1,
                onComplete: () => {
                    document.body.classList.remove('modal-open-no-scroll');
                }
            });
        }
        closeModalButtonBest14.addEventListener('click', closeBest14Modal);
        best14Modal.addEventListener('click', function(event) {
            if (event.target === best14Modal) {
                closeBest14Modal();
            }
        });
    } else {
        // Error logging for missing Best 14 Modal elements
    }

    // Leagues Modal
    if (leaguesLink && leaguesModal && leaguesModalContent && closeModalButtonLeagues) {
        leaguesLink.addEventListener('click', function(event) {
            event.preventDefault();
            if (leaguesModal) leaguesModal.scrollTop = 0;
            window.scrollTo(0, 0);
            document.body.classList.add('modal-open-no-scroll');

            gsap.set(leaguesModalContent, { x: '100vw', autoAlpha: 0 });
            gsap.to(leaguesModal, {
                duration: 0.3,
                autoAlpha: 1,
                ease: "power2.out",
                onComplete: addAutoCloseScrollListener,
                onCompleteParams: [leaguesModal, closeLeaguesModal]
            });
            gsap.to(leaguesModalContent, {
                duration: 0.5,
                x: 0,
                autoAlpha: 1,
                ease: "power2.out",
                delay: 0.1
            });
        });

        function closeLeaguesModal() {
            removeAutoCloseScrollListener(leaguesModal); 
            gsap.to(leaguesModalContent, {
                duration: 0.4,
                x: '100vw',
                autoAlpha: 0,
                ease: "power2.in"
            });
            gsap.to(leaguesModal, {
                duration: 0.3,
                autoAlpha: 0,
                ease: "power2.in",
                delay: 0.1,
                onComplete: () => {
                    document.body.classList.remove('modal-open-no-scroll');
                }
            });
        }
        closeModalButtonLeagues.addEventListener('click', closeLeaguesModal);
        leaguesModal.addEventListener('click', function(event) {
            if (event.target === leaguesModal) {
                closeLeaguesModal();
            }
        });
    } else {
        // Error logging for missing Leagues Modal elements
    }

        // GSAP WAGS Logo Animation (Drop from top with bounce)
        const wagsLogo = document.querySelector('.logo-large');
        if (wagsLogo) {
            gsap.from(wagsLogo, {
                duration: 1.5, // How long the animation takes (including bounces)
                y: -100,       // Start 100 pixels above its final position
                autoAlpha: 0,  // Start completely invisible
                ease: "bounce.out", // The bounce effect
                delay: 0.5     // Wait 0.5 seconds before starting
            });
        } else {
            console.warn('WAGS logo element (.logo-large) not found. Animation skipped.');
        }
    

    // --- Close active modal with Escape key ---
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (scoresModal && gsap.getProperty(scoresModal, "autoAlpha") === 1) {
                closeScoresModal();
            } else if (handicapsModal && gsap.getProperty(handicapsModal, "autoAlpha") === 1) {
                closeHandicapsModal();
            } else if (best14Modal && gsap.getProperty(best14Modal, "autoAlpha") === 1) {
                closeBest14Modal();
            } else if (leaguesModal && gsap.getProperty(leaguesModal, "autoAlpha") === 1) {
                closeLeaguesModal();
            }
        }
    });

    // The mainContentElement is selected but no longer has its opacity/autoAlpha set by JS here.
    // If it appears faded, that styling is coming from your CSS.
});
