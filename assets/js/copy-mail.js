let pressTimer;
let popupShown = false;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let autoHideTimeout;
const emailLink = document.getElementById('email-link');

function handleTouchStart(event) {
    if (!isMobile) return;

    // Store touch start time and position
    const target = event.currentTarget;
    target._touchStartTime = Date.now();
    target._touchY = event.touches[0].clientY;

    pressTimer = setTimeout(() => {
        showCopyPopup();
        popupShown = true;
        document.addEventListener('touchstart', handleOutsideTouch, { once: true });
    }, 600);
}

function handleTouchEnd(event) {
    if (!isMobile) return;

    clearTimeout(pressTimer);

    const target = event.currentTarget;
    const touchEndY = event.changedTouches[0].clientY;
    const touchDuration = Date.now() - target._touchStartTime;

    // If it's a short tap (not long press) and minimal vertical movement
    if (!popupShown && touchDuration < 500 && Math.abs(target._touchY - touchEndY) < 10) {
        // Will be handled by the click event
        return;
    }
}

function handleClick(event) {
    if (isMobile && popupShown) {
        // If popup is shown, this was a long press - prevent default
        event.preventDefault();
        event.stopPropagation();
    }
    // Otherwise, let the default mailto: behavior happen
}

function handleTouchCancel() {
    if (!isMobile) return;
    clearTimeout(pressTimer);
}

function handleOutsideTouch(event) {
    if (!event.target.closest('.group\\/email')) {
        hideCopyPopup();
    }
}

function showCopyPopup() {
    const popup = document.getElementById("copy-popup");
    if (popup) {
        clearTimeout(autoHideTimeout);
        popup.classList.add("opacity-100");
    }
}

function hideCopyPopup() {
    const popup = document.getElementById("copy-popup");
    if (popup) {
        popup.classList.remove("opacity-100");
        popupShown = false;
    }
}

function copyEmail() {
    const email = "kanna1304@proton.me";
    navigator.clipboard.writeText(email).then(() => {
        const msg = document.getElementById("copied-msg");
        hideCopyPopup();

        if (msg) {
            msg.classList.remove("hidden");
            setTimeout(() => msg.classList.add("hidden"), 1500);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Desktop hover behavior
if (!isMobile) {
    const emailGroup = document.querySelector('.group\\/email');
    emailGroup.addEventListener('mouseenter', () => {
        clearTimeout(autoHideTimeout);
    });

    emailGroup.addEventListener('mouseleave', () => {
        if (document.getElementById("copy-popup").classList.contains("opacity-100")) {
            autoHideTimeout = setTimeout(hideCopyPopup, 2000);
        }
    });
}