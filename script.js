// ===== DOM Elements =====
const thrButton = document.getElementById('thrButton');
const thrModal = document.getElementById('thrModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const claimBtn = document.getElementById('claimBtn');
const shareBtn = document.getElementById('shareBtn');
const thrAmount = document.getElementById('thrAmount');
const thrMessage = document.getElementById('thrMessage');
const thrCounter = document.getElementById('thrCounter');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
const hiddenUploadTrigger = document.getElementById('hiddenUploadTrigger');
const hiddenTxtInput = document.getElementById('hiddenTxtInput');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

// Envelope overlay elements
const envelopeOverlay = document.getElementById('envelopeOverlay');
const envelopeFlipCard = document.getElementById('envelopeFlipCard');
const envelopeFlipInner = document.getElementById('envelopeFlipInner');
const lightRays = document.getElementById('lightRays');
const sparkleContainer = document.getElementById('sparkleContainer');
const openingText = document.getElementById('openingText');

// Card modal elements
const generateCardBtn = document.getElementById('generateCardBtn');
const cardModal = document.getElementById('cardModal');
const cardModalBackdrop = document.getElementById('cardModalBackdrop');
const cardModalContent = document.getElementById('cardModalContent');
const closeCardModal = document.getElementById('closeCardModal');
const cardCanvas = document.getElementById('cardCanvas');
const cardCtx = cardCanvas.getContext('2d');
const downloadCardBtn = document.getElementById('downloadCardBtn');
const shareCardBtn = document.getElementById('shareCardBtn');
const cardStyleSelector = document.getElementById('cardStyleSelector');

// ===== State =====
let counter = 0;
let confettiPieces = [];
let animationId = null;
let isAnimating = false;
let selectedCardStyle = 'green';
let customThrEntries = [];
let customThrIndex = 0;
let customThrLoadPromise = null;
let currentReward = null;
let hasOpenedThr = localStorage.getItem('thrOpenedLock') === 'true';

const thrMessages = [
    '"Taqabbalallahu minna wa minkum. Semoga THR ini membawa berkah untuk kamu dan keluarga. Selamat Hari Raya Idul Fitri!"',
    '"Selamat Idul Fitri! Semoga amal ibadah kita diterima Allah SWT. Gunakan THR ini dengan bijak ya!"',
    '"Mohon maaf lahir dan batin. Semoga THR ini bisa membuat Lebaranmu lebih bahagia!"',
    '"Eid Mubarak! Semoga rezeki ini menjadi pembuka pintu kebaikan lainnya. Barakallahu fiik!"',
    '"Alhamdulillah, THR sudah cair! Jangan lupa sedekah dan berbagi kebahagiaan ya!"',
    '"Selamat merayakan kemenangan setelah sebulan penuh berpuasa. THR ini untukmu!"',
    '"Minal Aidin Wal Faizin. Semoga THR ini menambah kebahagiaan di hari yang fitri!"',
    '"Happy Eid! Semoga tahun ini penuh berkah dan kebahagiaan. Nikmati THR-mu!"',
    '"Semoga hari kemenangan ini membawa kedamaian, kesehatan, dan rezeki berlimpah untukmu!"',
    '"THR ini mungkin sederhana, tapi semoga bikin senyummu makin lebar di hari Lebaran!"',
    '"Selamat Lebaran! Semoga kebahagiaan dan keberkahan selalu mengiringi langkahmu."',
    '"Semoga semua doa baikmu di hari fitri ini Allah kabulkan satu per satu."',
    '"Hari yang suci, hati yang bersih. Semoga THR ini menambah manis momen Lebaranmu!"',
    '"Jangan lupa bahagia hari ini. Semoga THR dan rezekimu terus bertambah, aamiin!"',
    '"Semoga silaturahmi makin erat, hati makin lapang, dan dompet juga ikut senang!"',
    '"Lebaran adalah waktu terbaik untuk berbagi. Semoga bagian kecil ini membawa berkah besar."',
    '"Semoga rumahmu dipenuhi tawa, meja makanmu dipenuhi nikmat, dan hatimu dipenuhi syukur."',
    '"Selamat Idul Fitri! Semoga setiap rupiah yang datang menjadi rezeki yang halal dan berkah."',
    '"Semoga setelah Ramadan, hidupmu dipenuhi semangat baru, hati baru, dan rezeki baru."',
    '"Terima THR-nya, simpan senyumnya, dan rayakan Lebaran dengan hati yang paling hangat!"',
];

const CUSTOM_THR_STORAGE_KEY = 'customThrEntries';
const CUSTOM_THR_INDEX_STORAGE_KEY = 'customThrIndex';
const THR_OPEN_LOCK_KEY = 'thrOpenedLock';
const CUSTOM_THR_EMPTY_MESSAGE = 'Yang dapat THR, maaf THR sudah habis.';
const CUSTOM_THR_EMPTY_SECONDARY_MESSAGE = '"Coba lagi tahun depan, semoga beruntung."';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyiu8Nm7OlWwKxHnTQI6ZnBmY-R2rpiQp6or-yIcGJJeex_HRoUpv8z7VpZB6GC6PTWLg/exec';

function parseCustomThrText(text) {
    const lines = text.split(/\r?\n/);
    const entries = [];
    let currentEntry = [];

    lines.forEach((line) => {
        const numberedMatch = line.match(/^\s*(\d+)\s*[\.\-:)]\s*(.*)$/);

        if (numberedMatch) {
            if (currentEntry.length > 0) {
                entries.push(currentEntry.join('\n').trim());
            }

            const firstLine = numberedMatch[2].trim();
            currentEntry = firstLine ? [firstLine] : [];
            return;
        }

        if (currentEntry.length > 0) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                currentEntry.push(trimmedLine);
            }
        }
    });

    if (currentEntry.length > 0) {
        entries.push(currentEntry.join('\n').trim());
    }

    return entries.filter(Boolean);
}

function saveCustomThrState() {
    localStorage.setItem(CUSTOM_THR_STORAGE_KEY, JSON.stringify(customThrEntries));
    localStorage.setItem(CUSTOM_THR_INDEX_STORAGE_KEY, String(customThrIndex));
}

function loadCustomThrState() {
    try {
        const savedEntries = JSON.parse(localStorage.getItem(CUSTOM_THR_STORAGE_KEY) || '[]');
        const savedIndex = Number(localStorage.getItem(CUSTOM_THR_INDEX_STORAGE_KEY) || '0');

        if (Array.isArray(savedEntries)) {
            customThrEntries = savedEntries.filter(entry => typeof entry === 'string' && entry.trim());
        }

        if (Number.isFinite(savedIndex) && savedIndex >= 0) {
            customThrIndex = savedIndex;
        }
    } catch (error) {
        customThrEntries = [];
        customThrIndex = 0;
    }
}

function setThrAmountDisplay(value, isCustomText = false) {
    thrAmount.textContent = value;
    thrAmount.classList.remove('text-4xl', 'md:text-5xl', 'text-2xl', 'md:text-3xl', 'text-xl', 'md:text-2xl', 'text-lg', 'md:text-xl', 'leading-tight', 'leading-snug', 'whitespace-normal', 'whitespace-pre-line', 'break-words');

    if (!isCustomText) {
        thrAmount.classList.add('text-4xl', 'md:text-5xl');
        return;
    }

    const contentLength = value.length;
    const lineCount = value.split('\n').length;

    if (contentLength > 110 || lineCount >= 5) {
        thrAmount.classList.add('text-lg', 'md:text-xl', 'leading-snug');
    } else if (contentLength > 70 || lineCount >= 4) {
        thrAmount.classList.add('text-xl', 'md:text-2xl', 'leading-tight');
    } else {
        thrAmount.classList.add('text-2xl', 'md:text-3xl', 'leading-tight');
    }

    thrAmount.classList.add('whitespace-pre-line', 'break-words');
}

function downloadThrTxtFile(reward) {
    if (!reward || reward.isEmpty) {
        return;
    }

    const blob = new Blob([reward.amount], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

    link.href = url;
    link.download = `thr-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

function createRewardResult(amount, message, isCustomText, isEmpty = false) {
    return {
        amount,
        message,
        isCustomText,
        isEmpty,
    };
}

function getRandomThrMessage() {
    return thrMessages[Math.floor(Math.random() * thrMessages.length)];
}

function hasRemoteThrSource() {
    return Boolean(APPS_SCRIPT_URL.trim());
}

async function fetchRemoteThrReward() {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=claim`, {
        method: 'GET',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Gagal mengambil THR dari server (${response.status})`);
    }

    const payload = await response.json();

    if (!payload || payload.success !== true) {
        throw new Error(payload?.message || 'Respons server tidak valid');
    }

    if (payload.empty) {
        return createRewardResult(
            CUSTOM_THR_EMPTY_MESSAGE,
            CUSTOM_THR_EMPTY_SECONDARY_MESSAGE,
            true,
            true
        );
    }

    const rewardText = String(payload.reward || '').trim();

    if (!rewardText) {
        throw new Error('Data THR dari server kosong');
    }

    return createRewardResult(rewardText, getRandomThrMessage(), true, false);
}

function getNextThrReward() {
    const randomMessage = getRandomThrMessage();

    if (customThrEntries.length > 0) {
        if (customThrIndex < customThrEntries.length) {
            const customText = customThrEntries[customThrIndex];
            customThrIndex += 1;
            saveCustomThrState();

            return createRewardResult(customText, randomMessage, true, false);
        }

        return createRewardResult(
            CUSTOM_THR_EMPTY_MESSAGE,
            CUSTOM_THR_EMPTY_SECONDARY_MESSAGE,
            true,
            true
        );
    }

    return createRewardResult(
        thrAmounts[Math.floor(Math.random() * thrAmounts.length)],
        randomMessage,
        false,
        false
    );
}

loadCustomThrState();

// ===== Card Style Themes =====
const cardThemes = {
    green: {
        bgGradient1: '#0D3B0E',
        bgGradient2: '#1B5E20',
        bgGradient3: '#0A2E0B',
        accentColor: '#FFD700',
        accentColor2: '#F57F17',
        textPrimary: '#FFD700',
        textSecondary: '#FFFFFF',
        textMuted: 'rgba(255,255,255,0.6)',
        ornamentColor: 'rgba(255,215,0,0.15)',
        ornamentColor2: 'rgba(255,215,0,0.08)',
        borderColor: 'rgba(255,215,0,0.3)',
    },
    gold: {
        bgGradient1: '#B8860B',
        bgGradient2: '#DAA520',
        bgGradient3: '#8B6914',
        accentColor: '#FFFFFF',
        accentColor2: '#FFF8DC',
        textPrimary: '#FFFFFF',
        textSecondary: '#FFF8DC',
        textMuted: 'rgba(255,255,255,0.7)',
        ornamentColor: 'rgba(255,255,255,0.15)',
        ornamentColor2: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.3)',
    },
    purple: {
        bgGradient1: '#2D1B69',
        bgGradient2: '#4A148C',
        bgGradient3: '#1A0A3E',
        accentColor: '#FFD700',
        accentColor2: '#E1BEE7',
        textPrimary: '#FFD700',
        textSecondary: '#E1BEE7',
        textMuted: 'rgba(225,190,231,0.6)',
        ornamentColor: 'rgba(255,215,0,0.12)',
        ornamentColor2: 'rgba(225,190,231,0.08)',
        borderColor: 'rgba(255,215,0,0.3)',
    },
};

// ===== Canvas Setup =====
function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== Confetti System =====
class ConfettiPiece {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.opacity = 1;
        this.color = this.getRandomColor();
        this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    }

    getRandomColor() {
        const colors = ['#FFD700', '#F57F17', '#FF6F00', '#FFC107', '#FFEB3B', '#E91E63', '#4CAF50', '#2196F3', '#FF5722', '#9C27B0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.speedX *= 0.99;
        this.opacity -= 0.003;
        return this.y < confettiCanvas.height + 20 && this.opacity > 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (this.shape === 'rect') {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function launchConfetti() {
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            confettiPieces.push(new ConfettiPiece());
        }, i * 20);
    }

    if (!animationId) {
        animateConfetti();
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces = confettiPieces.filter(piece => {
        piece.draw();
        return piece.update();
    });

    if (confettiPieces.length > 0) {
        animationId = requestAnimationFrame(animateConfetti);
    } else {
        animationId = null;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// ===== Stars Background =====
function createStars() {
    const body = document.body;
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        star.style.width = (Math.random() * 3 + 2) + 'px';
        star.style.height = star.style.width;
        body.appendChild(star);
    }
}
createStars();

// ===== Sparkle Particles =====
function createSparkles() {
    sparkleContainer.innerHTML = '';
    const colors = ['#FFD700', '#FFC107', '#FFEB3B', '#FF9800', '#FFFFFF'];

    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 80 + Math.random() * 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        sparkle.style.cssText = `
            left: 50%;
            top: 50%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            --tx: ${tx}px;
            --ty: ${ty}px;
            animation: sparkleFloat ${0.8 + Math.random() * 0.6}s ease-out ${Math.random() * 0.3}s forwards;
            box-shadow: 0 0 6px currentColor;
        `;
        sparkleContainer.appendChild(sparkle);
    }
}

// ===== Envelope Opening Animation =====
function playEnvelopeAnimation() {
    return new Promise((resolve) => {
        isAnimating = true;

        envelopeOverlay.classList.remove('hidden');
        envelopeOverlay.classList.add('flex');

        envelopeFlipInner.classList.remove('flipped');
        envelopeFlipCard.classList.remove('envelope-shaking', 'envelope-zoom-in', 'envelope-fade-out');
        lightRays.classList.remove('visible', 'light-rays-pulse');
        lightRays.style.opacity = '0';
        openingText.style.opacity = '0';
        openingText.classList.remove('text-fade-in', 'text-pulse');
        sparkleContainer.innerHTML = '';

        envelopeFlipCard.classList.add('envelope-zoom-in');

        setTimeout(() => {
            envelopeFlipCard.classList.add('envelope-shaking');
            openingText.classList.add('text-fade-in');
            openingText.textContent = 'Membuka amplop...';
            setTimeout(() => {
                openingText.classList.add('text-pulse');
            }, 400);
        }, 500);

        setTimeout(() => {
            envelopeFlipCard.classList.remove('envelope-shaking');
            envelopeFlipInner.classList.add('flipped');
            lightRays.classList.add('visible', 'light-rays-pulse');
            createSparkles();
            openingText.textContent = '✨ THR Terbuka! ✨';
            openingText.classList.remove('text-pulse');
        }, 1300);

        setTimeout(() => {
            envelopeFlipCard.classList.add('envelope-fade-out');
            lightRays.classList.remove('visible');
            const overlayBg = envelopeOverlay.querySelector('.envelope-overlay-bg');
            if (overlayBg) {
                overlayBg.classList.add('envelope-overlay-bg-out');
            }
            openingText.style.transition = 'opacity 0.3s';
            openingText.style.opacity = '0';
        }, 2300);

        setTimeout(() => {
            envelopeOverlay.classList.add('hidden');
            envelopeOverlay.classList.remove('flex');
            const overlayBg = envelopeOverlay.querySelector('.envelope-overlay-bg');
            if (overlayBg) {
                overlayBg.classList.remove('envelope-overlay-bg-out');
            }
            isAnimating = false;
            resolve();
        }, 2800);
    });
}

// ===== Modal Functions =====
async function openModal() {
    if (isAnimating) return;
    if (hasOpenedThr) {
        handleThrLocked();
        return;
    }

    const animationPromise = playEnvelopeAnimation();
    const rewardPromise = hasRemoteThrSource()
        ? fetchRemoteThrReward()
        : ensureThrDataLoaded().then(() => getNextThrReward());

    let nextReward = null;

    try {
        nextReward = await rewardPromise;
    } catch (error) {
        showToast('Gagal terhubung ke Google Sheets. Coba lagi sebentar.');
        currentReward = null;
        return;
    }

    currentReward = nextReward;
    if (!nextReward.isEmpty) {
        markThrAsOpened();
    }

    setThrAmountDisplay(nextReward.amount, nextReward.isCustomText);
    thrMessage.textContent = nextReward.message;
    modalTitle.textContent = nextReward.isEmpty ? 'Yah!' : 'Selamat!';
    modalSubtitle.textContent = nextReward.isEmpty
        ? 'Kamu gagal mendapatkan THR Lebaran!'
        : 'Kamu mendapatkan THR Lebaran!';

    thrAmount.style.animation = 'none';
    thrAmount.offsetHeight;
    thrAmount.style.animation = '';

    counter++;
    thrCounter.textContent = counter;

    await animationPromise;

    thrModal.classList.remove('hidden');
    thrModal.classList.add('flex');

    modalContent.classList.remove('modal-exit');
    modalContent.classList.add('modal-enter');

    if (!nextReward.isEmpty) {
        launchConfetti();
    }
}

function applyCustomThrEntries(entries, resetIndex = false) {
    customThrEntries = entries;

    if (resetIndex || customThrIndex > customThrEntries.length) {
        customThrIndex = 0;
    }

    saveCustomThrState();
}

async function loadDefaultThrEntries() {
    const response = await fetch('./akun.txt', { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Gagal memuat akun.txt (${response.status})`);
    }

    const text = await response.text();
    const entries = parseCustomThrText(text);

    if (entries.length === 0) {
        throw new Error('akun.txt kosong');
    }

    return entries;
}

async function ensureThrDataLoaded() {
    if (customThrEntries.length > 0) {
        return true;
    }

    if (!customThrLoadPromise) {
        customThrLoadPromise = loadDefaultThrEntries()
            .then((entries) => {
                applyCustomThrEntries(entries, false);
                return true;
            })
            .catch(() => false)
            .finally(() => {
                customThrLoadPromise = null;
            });
    }

    return customThrLoadPromise;
}

function closeModalFn() {
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-exit');

    setTimeout(() => {
        thrModal.classList.add('hidden');
        thrModal.classList.remove('flex');
    }, 300);
}

function showToast(message) {
    toastText.innerHTML = message;
    toast.classList.add('toast-show');

    setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 3000);
}

function markThrAsOpened() {
    hasOpenedThr = true;
    localStorage.setItem(THR_OPEN_LOCK_KEY, 'true');
    updateThrButtonState();
}

function handleThrLocked() {
    showToast('Hayo mau ngapainnn? 1 orang 1 yaaaa');
}

function updateThrButtonState() {
    if (!thrButton) return;

    if (hasOpenedThr) {
        thrButton.disabled = true;
        thrButton.classList.add('thr-button-locked');
        thrButton.setAttribute('aria-disabled', 'true');
        const label = thrButton.querySelector('span');
        if (label) {
            label.textContent = 'THR Sudah Diambil';
        }
        return;
    }

    thrButton.disabled = false;
    thrButton.classList.remove('thr-button-locked');
    thrButton.removeAttribute('aria-disabled');
    const label = thrButton.querySelector('span');
    if (label) {
        label.textContent = '🎁 Buka Amplop THR!';
    }
}

// ===== Card Canvas Drawing =====
function drawCardCanvas() {
    const W = cardCanvas.width;
    const H = cardCanvas.height;
    const theme = cardThemes[selectedCardStyle];
    const amount = thrAmount.textContent;
    const message = thrMessage.textContent.replace(/"/g, '');

    // Clear canvas
    cardCtx.clearRect(0, 0, W, H);

    // === Background Gradient ===
    const bgGrad = cardCtx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, theme.bgGradient1);
    bgGrad.addColorStop(0.5, theme.bgGradient2);
    bgGrad.addColorStop(1, theme.bgGradient3);
    cardCtx.fillStyle = bgGrad;
    cardCtx.fillRect(0, 0, W, H);

    // === Decorative Circles (background ornaments) ===
    cardCtx.globalAlpha = 1;

    // Large circle top-right
    cardCtx.beginPath();
    cardCtx.arc(W + 40, -40, 200, 0, Math.PI * 2);
    cardCtx.fillStyle = theme.ornamentColor;
    cardCtx.fill();

    // Medium circle bottom-left
    cardCtx.beginPath();
    cardCtx.arc(-60, H + 30, 180, 0, Math.PI * 2);
    cardCtx.fillStyle = theme.ornamentColor;
    cardCtx.fill();

    // Small circle center-left
    cardCtx.beginPath();
    cardCtx.arc(80, H * 0.4, 100, 0, Math.PI * 2);
    cardCtx.fillStyle = theme.ornamentColor2;
    cardCtx.fill();

    // Small circle right
    cardCtx.beginPath();
    cardCtx.arc(W - 60, H * 0.6, 80, 0, Math.PI * 2);
    cardCtx.fillStyle = theme.ornamentColor2;
    cardCtx.fill();

    // === Stars / Sparkles ===
    const starPositions = [
        { x: 100, y: 80, s: 12 }, { x: 680, y: 120, s: 10 }, { x: 200, y: 200, s: 8 },
        { x: 600, y: 250, s: 14 }, { x: 150, y: 850, s: 10 }, { x: 650, y: 800, s: 12 },
        { x: 400, y: 100, s: 6 }, { x: 50, y: 500, s: 8 }, { x: 750, y: 500, s: 10 },
        { x: 300, y: 900, s: 8 }, { x: 500, y: 50, s: 10 }, { x: 720, y: 900, s: 6 },
    ];

    starPositions.forEach(star => {
        drawStar(cardCtx, star.x, star.y, star.s, theme.accentColor);
    });

    // === Crescent Moon ===
    drawCrescentMoon(cardCtx, W / 2, 130, 60, theme.accentColor);

    // === Top ornamental line ===
    cardCtx.strokeStyle = theme.borderColor;
    cardCtx.lineWidth = 2;
    cardCtx.beginPath();
    cardCtx.moveTo(100, 220);
    cardCtx.lineTo(W - 100, 220);
    cardCtx.stroke();

    // Small diamond at center of line
    drawDiamond(cardCtx, W / 2, 220, 10, theme.accentColor);

    // === "Selamat Hari Raya" Header ===
    cardCtx.textAlign = 'center';
    cardCtx.fillStyle = theme.textMuted;
    cardCtx.font = '600 24px Poppins, sans-serif';
    cardCtx.fillText('Selamat Hari Raya', W / 2, 275);

    // === "Idul Fitri" Title ===
    cardCtx.fillStyle = theme.textPrimary;
    cardCtx.font = '900 56px Poppins, sans-serif';
    cardCtx.fillText('Idul Fitri', W / 2, 340);

    // === "1447 H" Year ===
    cardCtx.fillStyle = theme.textSecondary;
    cardCtx.font = '700 28px Poppins, sans-serif';
    cardCtx.fillText('1447 H', W / 2, 385);

    // === Decorative line below title ===
    cardCtx.strokeStyle = theme.borderColor;
    cardCtx.lineWidth = 1.5;
    cardCtx.beginPath();
    cardCtx.moveTo(250, 410);
    cardCtx.lineTo(W - 250, 410);
    cardCtx.stroke();

    // === THR Label ===
    cardCtx.fillStyle = theme.textMuted;
    cardCtx.font = '600 20px Poppins, sans-serif';
    cardCtx.letterSpacing = '4px';
    cardCtx.fillText('THR', W / 2, 470);

    // === THR Amount Box ===
    const boxX = 80;
    const boxY = 490;
    const boxW = W - 160;
    const boxRadius = 20;
    const isLongAmount = amount.length > 110 || amount.split('\n').length >= 5;
    const boxH = isLongAmount ? 165 : amount.length > 24 ? 140 : 120;

    // Box background
    cardCtx.fillStyle = theme.ornamentColor;
    roundRect(cardCtx, boxX, boxY, boxW, boxH, boxRadius);
    cardCtx.fill();

    // Box border
    cardCtx.strokeStyle = theme.borderColor;
    cardCtx.lineWidth = 2;
    roundRect(cardCtx, boxX, boxY, boxW, boxH, boxRadius);
    cardCtx.stroke();

    // THR Amount text
    cardCtx.fillStyle = theme.textPrimary;
    if (amount.length > 24) {
        cardCtx.font = isLongAmount ? '900 20px Poppins, sans-serif' : '900 24px Poppins, sans-serif';

        const wrappedLines = amount.includes('\n')
            ? amount.split('\n').flatMap(line => wrapText(cardCtx, line, boxW - 50))
            : wrapText(cardCtx, amount, boxW - 50);
        let amountY = isLongAmount ? boxY + 32 : boxY + 38;
        wrappedLines.slice(0, 5).forEach(line => {
            cardCtx.fillText(line, W / 2, amountY);
            amountY += isLongAmount ? 24 : 24;
        });
    } else {
        cardCtx.font = '900 52px Poppins, sans-serif';
        cardCtx.fillText(amount, W / 2, boxY + 75);
    }

    // === Message ===
    cardCtx.fillStyle = theme.textSecondary;
    cardCtx.font = 'italic 400 20px Poppins, sans-serif';
    const messageLines = wrapText(cardCtx, message, W - 160, 20);
    let messageY = boxY + boxH + 55;
    messageLines.forEach(line => {
        cardCtx.fillText(line, W / 2, messageY);
        messageY += 30;
    });

    // === Bottom ornamental line ===
    cardCtx.strokeStyle = theme.borderColor;
    cardCtx.lineWidth = 2;
    cardCtx.beginPath();
    cardCtx.moveTo(100, H - 120);
    cardCtx.lineTo(W - 100, H - 120);
    cardCtx.stroke();

    drawDiamond(cardCtx, W / 2, H - 120, 10, theme.accentColor);

    // === Footer ===
    cardCtx.fillStyle = theme.textMuted;
    cardCtx.font = '400 16px Poppins, sans-serif';
    cardCtx.fillText('Mohon Maaf Lahir dan Batin dari gua Fajar Mustofa', W / 2, H - 70);

    // === Decorative border ===
    cardCtx.strokeStyle = theme.borderColor;
    cardCtx.lineWidth = 3;
    roundRect(cardCtx, 20, 20, W - 40, H - 40, 30);
    cardCtx.stroke();

    // Inner border
    cardCtx.strokeStyle = theme.ornamentColor2;
    cardCtx.lineWidth = 1;
    roundRect(cardCtx, 35, 35, W - 70, H - 70, 25);
    cardCtx.stroke();
}

// ===== Canvas Helper Functions =====

function drawStar(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();

    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i;
        const x1 = cx + Math.cos(angle) * size;
        const y1 = cy + Math.sin(angle) * size;
        const x2 = cx + Math.cos(angle + Math.PI / 4) * (size * 0.35);
        const y2 = cy + Math.sin(angle + Math.PI / 4) * (size * 0.35);

        if (i === 0) {
            ctx.moveTo(x1, y1);
        } else {
            ctx.lineTo(x1, y1);
        }
        ctx.lineTo(x2, y2);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawCrescentMoon(ctx, cx, cy, radius, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Cut out inner circle to create crescent
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx + radius * 0.35, cy - radius * 0.15, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    // Small star next to crescent
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    drawStar(ctx, cx + radius * 1.2, cy - radius * 0.3, 10, color);

    ctx.restore();
}

function drawDiamond(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.6, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size * 0.6, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

// ===== Card Modal Functions =====
function openCardModal() {
    cardModal.classList.remove('hidden');
    cardModal.classList.add('flex');

    cardModalContent.classList.remove('modal-exit');
    cardModalContent.classList.add('modal-enter');

    drawCardCanvas();
}

function closeCardModalFn() {
    cardModalContent.classList.remove('modal-enter');
    cardModalContent.classList.add('modal-exit');

    setTimeout(() => {
        cardModal.classList.add('hidden');
        cardModal.classList.remove('flex');
    }, 300);
}

function downloadCard() {
    // Redraw at full resolution before download
    drawCardCanvas();

    const link = document.createElement('a');
    link.download = '/images/EidCard.jpg';
    link.href = cardCanvas.toDataURL('image/png', 1.0);
    link.click();

    showToast('📥 Kartu ucapan THR berhasil di-download!');
}

async function shareCard() {
    drawCardCanvas();

    try {
        const blob = await new Promise(resolve => {
            cardCanvas.toBlob(resolve, 'image/png', 1.0);
        });

        if (navigator.share && navigator.canShare) {
            const file = new File([blob], '/images/EidCard.jpg', { type: 'image/png' });
            const shareData = {
                title: 'Kartu Ucapan THR Lebaran',
                text: 'Selamat Hari Raya Idul Fitri 1447 H! Mohon Maaf Lahir dan Batin',
                files: [file],
            };

            if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return;
            }
        }

        // Fallback: download
        downloadCard();
    } catch (err) {
        if (err.name !== 'AbortError') {
            downloadCard();
        }
    }
}

async function handleTxtUpload(event) {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
        const text = await file.text();
        const entries = parseCustomThrText(text);

        if (entries.length === 0) {
            showToast('File txt kosong atau format kalimatnya tidak terbaca.');
            return;
        }

        applyCustomThrEntries(entries, true);
        showToast(`Daftar THR berhasil dimuat: ${entries.length} kalimat.`);
    } catch (error) {
        showToast('Gagal membaca file txt.');
    } finally {
        event.target.value = '';
    }
}

// ===== Event Listeners =====
thrButton.addEventListener('click', () => {
    if (isAnimating) return;
    if (hasOpenedThr) {
        handleThrLocked();
        return;
    }

    thrButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        thrButton.style.transform = '';
    }, 150);

    openModal();
});

closeModal.addEventListener('click', closeModalFn);
modalBackdrop.addEventListener('click', closeModalFn);
hiddenUploadTrigger.addEventListener('click', () => {
    hiddenTxtInput.click();
});
hiddenTxtInput.addEventListener('change', handleTxtUpload);
if (!hasRemoteThrSource()) {
    ensureThrDataLoaded();
}
updateThrButtonState();

claimBtn.addEventListener('click', () => {
    closeModalFn();

    if (currentReward && !currentReward.isEmpty) {
        downloadThrTxtFile(currentReward);
        showToast('THR berhasil diterima! File txt sedang di-download.');
        launchConfetti();
    } else {
        showToast('THR sudah habis.');
    }
});

shareBtn.addEventListener('click', () => {
    const amount = thrAmount.textContent;
    const text = `Aku baru dapat THR ${amount}
Selamat Hari Raya Idul Fitri 1447 H! Mohon Maaf Lahir dan Batin 🌙✨`;

    if (navigator.share) {
        navigator.share({
            title: 'THR Lebaran',
            text: text,
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('📋 Teks berhasil disalin ke clipboard!');
        }).catch(() => {
            showToast('📤 Bagikan: ' + text);
        });
    }
});

// Card modal events
generateCardBtn.addEventListener('click', openCardModal);
closeCardModal.addEventListener('click', closeCardModalFn);
cardModalBackdrop.addEventListener('click', closeCardModalFn);
downloadCardBtn.addEventListener('click', downloadCard);
shareCardBtn.addEventListener('click', shareCard);

// Card style selector
cardStyleSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-style-btn');
    if (!btn) return;

    document.querySelectorAll('.card-style-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = '';
    });
    btn.classList.add('active');

    selectedCardStyle = btn.dataset.style;
    drawCardCanvas();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!cardModal.classList.contains('hidden')) {
            closeCardModalFn();
        } else {
            closeModalFn();
        }
    }
    if (e.key === 'Enter' && thrModal.classList.contains('hidden') && cardModal.classList.contains('hidden') && !isAnimating) {
        if (hasOpenedThr) {
            handleThrLocked();
            return;
        }
        openModal();
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        hiddenTxtInput.click();
    }
});

// Console Easter Egg
console.log('%c🎉 Selamat Hari Raya Idul Fitri! 🌙', 'font-size: 20px; color: #FFD700; background: #1B5E20; padding: 10px; border-radius: 8px;');
console.log('%cMohon Maaf Lahir dan Batin', 'font-size: 14px; color: #4CAF50;');
