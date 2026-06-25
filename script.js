/* ─── Customize ─── */
const CONFIG = {
  sisterName: 'Sister',
  birthdayMessage: 'Wishing you a day full of smiles, cake, and everything you love.',
  secretMessage: "You're my favourite person — today and every day. Never forget that. ♡",
  musicVolume: 0.45,
  micBlowThreshold: 0.14,
  micBlowFrames: 4,
  secretTapsNeeded: 5,
};

/* ─── DOM ─── */
const candleScreen = document.getElementById('candle-screen');
const mainScreen = document.getElementById('main-screen');
const flame = document.getElementById('flame');
const wick = document.getElementById('wick');
const cakeWrapper = document.getElementById('cake-wrapper');
const blowBtn = document.getElementById('blow-btn');
const micBtn = document.getElementById('mic-btn');
const micLabel = document.getElementById('mic-label');
const micMeter = document.getElementById('mic-meter');
const micMeterBar = document.getElementById('mic-meter-bar');
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const musicBars = document.getElementById('music-bars');
const musicLabel = document.getElementById('music-label');
const sisterNameEl = document.getElementById('sister-name');
const balloonsLayer = document.getElementById('balloons-layer');
const bgImageSecond = document.getElementById('bg-image-second');
const bgSwitchBtn = document.getElementById('bg-switch-btn');
const cardMessage = document.getElementById('card-message');
const birthdayCard = document.getElementById('birthday-card');
const photoTrigger = document.getElementById('photo-trigger');
const sisterPhoto = document.getElementById('sister-photo');
const photoPlaceholder = document.getElementById('photo-placeholder');
const photoLightbox = document.getElementById('photo-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
const secretModal = document.getElementById('secret-modal');
const secretText = document.getElementById('secret-text');
const secretClose = document.getElementById('secret-close');
const wishBtn = document.getElementById('wish-btn');
const wishCount = document.getElementById('wish-count');
const loveCounter = document.getElementById('love-counter');
const loveScore = document.getElementById('love-score');
const fireworksCanvas = document.getElementById('fireworks');
const cursorTrail = document.getElementById('cursor-trail');
const noteBtn = document.getElementById('note-btn');
const sweetNote = document.getElementById('sweet-note');
const photoMemory = document.getElementById('photo-memory');

let candleBlown = false;
let musicPlaying = false;
let usingMelody = false;
let melodyCtx = null;
let melodyTimer = null;
let audioContext = null;
let micStream = null;
let micActive = false;
let blowFrames = 0;
let micBaseline = 0.02;
let analyser = null;
let micData = null;
let micRaf = null;
let nameTaps = 0;
let lovePoints = 0;
let wishesSent = 0;
let mainEffectsOn = false;
let fwCtx = null;
let fwRaf = null;
const fwParticles = [];
let secondBgActive = false;
let bgSwitchTimer = null;
let activePhotoIndex = 0;

const PHOTO_SET = [
  {
    src: 'img.jpg',
    memory: 'Two beautiful moments, one beautiful sister.',
    switchLabel: '🖼️ Photo 1',
  },
  {
    src: 'img2.jpg',
    memory: 'Another favorite memory, same beautiful smile.',
    switchLabel: '🖼️ Photo 2',
  },
];

/* ─── Init ─── */
function init() {
  sisterNameEl.textContent = CONFIG.sisterName;
  document.title = `happy birthday ${CONFIG.sisterName} 🎂`;
  bgMusic.volume = CONFIG.musicVolume;

  cakeWrapper.addEventListener('click', blowCandle);
  blowBtn.addEventListener('click', (e) => { e.stopPropagation(); blowCandle(); });
  micBtn.addEventListener('click', toggleMicrophone);
  musicBtn.addEventListener('click', toggleMusic);

  createCandleStars();
  createShootingStars();
  createFloatingHearts();
  createSparkles();
  createBalloons();
  checkCustomMusic();
  setupSecretTap();
  setupPhotoLightbox();
  setupWishJar();
  setupCardTilt();
  setupBackgroundSwitcher();
  setupSweetNoteButton();
}

const SWEET_LINES = [
  'You make every normal day feel special.',
  'Your smile is literally my favorite thing.',
  'The world is brighter because you are in it.',
  'You deserve every beautiful moment today.',
  'Stay exactly this kind, this strong, this magical.',
];

function setupSweetNoteButton() {
  if (!noteBtn || !sweetNote) return;
  noteBtn.addEventListener('click', () => {
    const line = SWEET_LINES[Math.floor(Math.random() * SWEET_LINES.length)];
    sweetNote.style.opacity = '0';
    setTimeout(() => {
      sweetNote.textContent = line;
      sweetNote.style.opacity = '1';
    }, 180);
  });
}

function updateDisplayedPhoto() {
  const current = PHOTO_SET[activePhotoIndex];
  if (sisterPhoto) {
    sisterPhoto.src = current.src;
    sisterPhoto.style.display = 'block';
  }
  if (lightboxImg) {
    lightboxImg.src = current.src;
  }
  if (photoPlaceholder) {
    photoPlaceholder.style.display = 'none';
  }
  if (photoMemory) {
    photoMemory.textContent = current.memory;
  }
  if (bgSwitchBtn) {
    bgSwitchBtn.textContent = current.switchLabel;
  }
}

function launchPhotoSwitchBurst() {
  const rect = photoTrigger?.getBoundingClientRect();
  if (!rect) return;
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const spark = document.createElement('span');
      spark.className = 'wish-star';
      spark.textContent = WISH_EMOJIS[Math.floor(Math.random() * WISH_EMOJIS.length)];
      spark.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 90}px`;
      spark.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 1800);
    }, i * 45);
  }
}

function switchBackgroundPhoto(forceState) {
  if (!bgImageSecond) return;
  secondBgActive = typeof forceState === 'boolean' ? forceState : !secondBgActive;
  activePhotoIndex = secondBgActive ? 1 : 0;
  bgImageSecond.classList.toggle('active', secondBgActive);
  updateDisplayedPhoto();
  launchPhotoSwitchBurst();
}

function setupBackgroundSwitcher() {
  if (!bgImageSecond) return;

  const testImg = new Image();
  testImg.onload = () => {
    updateDisplayedPhoto();
    bgSwitchTimer = setInterval(() => switchBackgroundPhoto(), 9000);
  };
  testImg.onerror = () => {
    updateDisplayedPhoto();
    if (bgSwitchBtn) {
      bgSwitchBtn.textContent = 'Add img2.jpg';
      bgSwitchBtn.disabled = true;
      bgSwitchBtn.style.opacity = '0.7';
      bgSwitchBtn.style.cursor = 'not-allowed';
    }
  };
  testImg.src = 'img2.jpg';

  bgSwitchBtn?.addEventListener('click', () => switchBackgroundPhoto());
}

function checkCustomMusic() {
  bgMusic.addEventListener('error', () => { usingMelody = true; });
  fetch('assets/birthday-song.mp3', { method: 'HEAD' })
    .then(r => { if (!r.ok) usingMelody = true; })
    .catch(() => { usingMelody = true; });
}

/* ─── Blow Candle ─── */
function blowCandle() {
  if (candleBlown) return;
  candleBlown = true;
  stopMicrophone();

  flame.classList.add('extinguished');
  wick.classList.add('extinguished');
  createSmoke();
  createBlowParticles();

  setTimeout(() => {
    candleScreen.classList.add('fade-out');
    candleScreen.classList.remove('active');

    setTimeout(() => {
      mainScreen.classList.add('active');
      document.body.style.overflow = 'auto';
      launchConfetti();
      launchBalloonBurst();
      startFireworks();
      startMusic();
      triggerReveals();
      startMainEffects();
    }, 900);
  }, 1400);
}

function triggerReveals() {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  typewriterMessage(CONFIG.birthdayMessage);
}

/* ─── Typewriter Message ─── */
function typewriterMessage(text) {
  if (!cardMessage) return;
  cardMessage.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor-blink';
  cardMessage.appendChild(cursor);
  let i = 0;
  function type() {
    if (i < text.length) {
      cardMessage.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, 38 + Math.random() * 25);
    } else {
      setTimeout(() => cursor.remove(), 1200);
    }
  }
  setTimeout(type, 600);
}

/* ─── Secret Tap on Name ─── */
function setupSecretTap() {
  sisterNameEl?.addEventListener('click', () => {
    sisterNameEl.classList.add('tapped');
    setTimeout(() => sisterNameEl.classList.remove('tapped'), 500);
    nameTaps++;
    if (nameTaps >= CONFIG.secretTapsNeeded) {
      secretText.textContent = CONFIG.secretMessage;
      secretModal.hidden = false;
      sisterNameEl.classList.add('glow');
      launchConfetti();
    }
  });
  secretClose?.addEventListener('click', () => { secretModal.hidden = true; });
}

/* ─── Photo Lightbox ─── */
function setupPhotoLightbox() {
  photoTrigger?.addEventListener('click', () => {
    const img = document.getElementById('sister-photo');
    if (img?.style.display !== 'none') {
      photoLightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }
  });
  const close = () => {
    photoLightbox.hidden = true;
    document.body.style.overflow = 'auto';
  };
  lightboxClose?.addEventListener('click', close);
  lightboxCloseBtn?.addEventListener('click', close);
}

/* ─── Wish Jar ─── */
const WISH_EMOJIS = ['✨', '🌟', '💫', '⭐', '🎀', '💕'];

function setupWishJar() {
  wishBtn?.addEventListener('click', (e) => {
    wishesSent++;
    wishCount.textContent = `${wishesSent} wish${wishesSent > 1 ? 'es' : ''} sent`;
    const rect = wishBtn.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const star = document.createElement('span');
        star.className = 'wish-star';
        star.textContent = WISH_EMOJIS[Math.floor(Math.random() * WISH_EMOJIS.length)];
        star.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 60}px`;
        star.style.top = `${rect.top}px`;
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 1800);
      }, i * 80);
    }
    if (wishesSent === 3) {
      wishCount.textContent = 'the universe heard you ✨';
    }
  });
}

/* ─── 3D Card Tilt ─── */
function setupCardTilt() {
  if (!birthdayCard || window.matchMedia('(pointer: coarse)').matches) return;
  birthdayCard.addEventListener('mousemove', (e) => {
    const rect = birthdayCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    birthdayCard.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  birthdayCard.addEventListener('mouseleave', () => {
    birthdayCard.style.transform = '';
  });
}

/* ─── Heart Collector ─── */
function startMainEffects() {
  if (mainEffectsOn) return;
  mainEffectsOn = true;
  if (loveCounter) {
    loveCounter.hidden = false;
    loveCounter.addEventListener('click', sendLoveFromButton);
  }
  setupClickableHearts();
  setupCursorTrail();
}

function setupClickableHearts() {
  const container = document.querySelector('.floating-hearts');
  if (!container) return;
  for (let i = 0; i < 8; i++) {
    const h = document.createElement('span');
    h.className = 'heart-particle clickable-heart';
    h.textContent = '♥';
    h.style.left = `${10 + Math.random() * 80}%`;
    h.style.top = `${20 + Math.random() * 60}%`;
    h.style.fontSize = `${1.2 + Math.random() * 0.8}rem`;
    h.style.color = '#ff6f61';
    h.style.animation = 'none';
    h.style.opacity = '0.7';
    h.style.pointerEvents = 'auto';
    h.addEventListener('click', (e) => collectHeart(e, h));
    container.appendChild(h);
  }
}

function collectHeart(e, el) {
  lovePoints++;
  loveScore.textContent = lovePoints;
  const pop = document.createElement('span');
  pop.className = 'heart-pop';
  pop.textContent = '+1 ♥';
  pop.style.left = `${e.clientX}px`;
  pop.style.top = `${e.clientY}px`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
  el.style.opacity = '0';
  setTimeout(() => {
    el.style.left = `${10 + Math.random() * 80}%`;
    el.style.top = `${20 + Math.random() * 60}%`;
    el.style.opacity = '0.7';
  }, 1200);
  if (lovePoints === 10) loveScore.textContent = '∞';
}

function sendLoveFromButton() {
  if (!loveCounter) return;
  lovePoints++;
  loveScore.textContent = lovePoints;

  const rect = loveCounter.getBoundingClientRect();
  const pop = document.createElement('span');
  pop.className = 'heart-pop';
  pop.textContent = '+1 ♥';
  pop.style.left = `${rect.left + rect.width / 2}px`;
  pop.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 800);

  if (lovePoints === 10) loveScore.textContent = '∞';
}

/* ─── Cursor Trail ─── */
function setupCursorTrail() {
  if (!cursorTrail || window.matchMedia('(pointer: coarse)').matches) return;
  const colors = ['#ff6f61', '#ffb347', '#ffc857', '#f48fb1'];
  mainScreen.addEventListener('mousemove', (e) => {
    if (!mainScreen.classList.contains('active')) return;
    const spark = document.createElement('div');
    spark.className = 'trail-spark';
    spark.style.left = `${e.clientX}px`;
    spark.style.top = `${e.clientY}px`;
    spark.style.background = colors[Math.floor(Math.random() * colors.length)];
    spark.style.width = spark.style.height = `${4 + Math.random() * 6}px`;
    cursorTrail.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  });
}

/* ─── Fireworks ─── */
function startFireworks() {
  if (!fireworksCanvas) return;
  fwCtx = fireworksCanvas.getContext('2d');
  resizeFireworks();
  window.addEventListener('resize', resizeFireworks);

  for (let i = 0; i < 6; i++) {
    setTimeout(() => launchFirework(), i * 400);
  }
  setTimeout(() => {
    const fwInterval = setInterval(() => launchFirework(), 2200);
    setTimeout(() => clearInterval(fwInterval), 25000);
  }, 3000);

  function loop() {
    if (!fwCtx) return;
    fwCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.life -= 0.012;
      if (p.life <= 0) { fwParticles.splice(i, 1); continue; }
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      fwCtx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life})`;
      fwCtx.fill();
    }
    fwRaf = requestAnimationFrame(loop);
  }
  loop();
}

function resizeFireworks() {
  if (!fireworksCanvas) return;
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}

function launchFirework() {
  if (!fireworksCanvas) return;
  const x = Math.random() * fireworksCanvas.width * 0.8 + fireworksCanvas.width * 0.1;
  const y = Math.random() * fireworksCanvas.height * 0.4 + fireworksCanvas.height * 0.1;
  const palette = [
    [255, 111, 97], [255, 179, 71], [255, 200, 87],
    [244, 143, 177], [206, 147, 216],
  ];
  const [r, g, b] = palette[Math.floor(Math.random() * palette.length)];
  for (let i = 0; i < 40; i++) {
    const angle = (Math.PI * 2 * i) / 40;
    const speed = 2 + Math.random() * 3;
    fwParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 2,
      life: 1,
      r, g, b,
    });
  }
}

/* ─── Shooting Stars ─── */
function createShootingStars() {
  const container = document.getElementById('shooting-stars');
  if (!container) return;
  for (let i = 0; i < 6; i++) {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = `${Math.random() * 70}%`;
    star.style.top = `${Math.random() * 50}%`;
    star.style.animationDelay = `${Math.random() * 8}s`;
    star.style.animationDuration = `${2.5 + Math.random() * 3}s`;
    container.appendChild(star);
  }
}

/* ─── Smoke & Particles ─── */
function createSmoke() {
  const stick = document.querySelector('.candle-stick');
  for (let i = 0; i < 6; i++) {
    const smoke = document.createElement('div');
    smoke.className = 'smoke';
    smoke.style.left = `${50 + (Math.random() - 0.5) * 24}%`;
    smoke.style.animationDelay = `${i * 0.25}s`;
    stick.appendChild(smoke);
    requestAnimationFrame(() => smoke.classList.add('active'));
  }
}

function createBlowParticles() {
  const rect = cakeWrapper.getBoundingClientRect();
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 16;
    const dist = 50 + Math.random() * 50;
    p.className = 'blow-particle';
    p.style.left = `${rect.left + rect.width / 2}px`;
    p.style.top = `${rect.top + 10}px`;
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * dist - 40}px`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

/* ─── Microphone (fixed) ─── */
async function toggleMicrophone() {
  if (candleBlown) return;

  if (micActive) {
    stopMicrophone();
    return;
  }

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      micLabel.textContent = 'Mic not supported';
      return;
    }

    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    const source = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);
    micData = new Uint8Array(analyser.fftSize);

    micActive = true;
    blowFrames = 0;
    micBaseline = 0.02;
    micBtn.classList.add('active');
    micLabel.textContent = 'Mic on — blow!';
    micMeter.hidden = false;
    listenForBlow();
  } catch {
      micLabel.textContent = 'Allow mic access';
    micBtn.classList.add('denied');
  }
}

function getMicVolume() {
  analyser.getByteTimeDomainData(micData);
  let sum = 0;
  for (let i = 0; i < micData.length; i++) {
    const sample = (micData[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.sqrt(sum / micData.length);
}

function listenForBlow() {
  if (!micActive || candleBlown) return;

  const volume = getMicVolume();

  if (volume < 0.06) {
    micBaseline = micBaseline * 0.92 + volume * 0.08;
  }

  const level = Math.min(100, (volume / 0.35) * 100);
  micMeterBar.style.width = `${level}%`;

  const threshold = Math.max(CONFIG.micBlowThreshold, micBaseline + 0.06);

  if (volume > threshold) {
    blowFrames++;
    micMeterBar.classList.add('hot');
    if (blowFrames >= CONFIG.micBlowFrames) {
      blowCandle();
      return;
    }
  } else {
    blowFrames = Math.max(0, blowFrames - 1);
    micMeterBar.classList.remove('hot');
  }

  micRaf = requestAnimationFrame(listenForBlow);
}

function stopMicrophone() {
  micActive = false;
  if (micRaf) cancelAnimationFrame(micRaf);
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  if (audioContext) audioContext.close().catch(() => {});
  micStream = null;
  audioContext = null;
  micBtn?.classList.remove('active');
  if (micMeter) micMeter.hidden = true;
  if (micLabel) micLabel.textContent = '🎤 Use mic';
}

/* ─── Music (fixed with fallback melody) ─── */
const MELODY = [
  { f: 392, d: 0.35 }, { f: 392, d: 0.15 }, { f: 440, d: 0.5 },
  { f: 392, d: 0.5 }, { f: 523.25, d: 0.5 }, { f: 493.88, d: 0.75 },
  { f: 392, d: 0.35 }, { f: 392, d: 0.15 }, { f: 440, d: 0.5 },
  { f: 392, d: 0.5 }, { f: 587.33, d: 0.5 }, { f: 523.25, d: 0.75 },
  { f: 392, d: 0.35 }, { f: 392, d: 0.15 }, { f: 783.99, d: 0.5 },
  { f: 659.25, d: 0.5 }, { f: 523.25, d: 0.5 }, { f: 493.88, d: 0.5 }, { f: 440, d: 0.75 },
  { f: 698.46, d: 0.35 }, { f: 698.46, d: 0.15 }, { f: 659.25, d: 0.5 },
  { f: 523.25, d: 0.5 }, { f: 587.33, d: 0.5 }, { f: 523.25, d: 0.9 },
];

function startMusic() {
  bgMusic.play().then(() => {
    musicPlaying = true;
    usingMelody = false;
    updateMusicUI();
  }).catch(() => {
    playMelodyLoop();
  });
}

function playMelodyLoop() {
  usingMelody = true;
  musicPlaying = true;
  updateMusicUI();

  if (!melodyCtx) {
    melodyCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (melodyCtx.state === 'suspended') melodyCtx.resume();

  let idx = 0;
  function playNote() {
    if (!musicPlaying || !usingMelody) return;
    const note = MELODY[idx % MELODY.length];
    const osc = melodyCtx.createOscillator();
    const gain = melodyCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = note.f;
    gain.gain.setValueAtTime(0, melodyCtx.currentTime);
    gain.gain.linearRampToValueAtTime(CONFIG.musicVolume * 0.35, melodyCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, melodyCtx.currentTime + note.d);
    osc.connect(gain);
    gain.connect(melodyCtx.destination);
    osc.start();
    osc.stop(melodyCtx.currentTime + note.d + 0.05);
    idx++;
    melodyTimer = setTimeout(playNote, note.d * 1000);
  }
  playNote();
}

function stopMelody() {
  if (melodyTimer) clearTimeout(melodyTimer);
  melodyTimer = null;
}

function toggleMusic() {
  if (musicPlaying) {
    bgMusic.pause();
    stopMelody();
    musicPlaying = false;
  } else {
    if (usingMelody) {
      playMelodyLoop();
    } else {
      bgMusic.play().then(() => { musicPlaying = true; updateMusicUI(); })
        .catch(() => playMelodyLoop());
      return;
    }
  }
  updateMusicUI();
}

function updateMusicUI() {
  musicBars.classList.toggle('playing', musicPlaying);
  musicLabel.textContent = musicPlaying ? 'Music on' : 'Music';
}

bgMusic.addEventListener('playing', () => { musicPlaying = true; usingMelody = false; updateMusicUI(); });
bgMusic.addEventListener('pause', () => { if (!usingMelody) { musicPlaying = false; updateMusicUI(); } });

/* ─── Balloons ─── */
const BALLOON_COLORS = ['#ff6f61', '#ffb347', '#ffc857', '#ff8a80', '#ffab91', '#f48fb1', '#ce93d8'];

function createBalloon(delay, left, duration) {
  const b = document.createElement('div');
  b.className = 'balloon';
  const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  b.style.setProperty('--balloon-color', color);
  b.style.left = `${left}%`;
  b.style.animationDuration = `${duration}s`;
  b.style.animationDelay = `${delay}s`;
  b.innerHTML = '<div class="balloon-body"></div><div class="balloon-string"></div>';
  balloonsLayer.appendChild(b);
}

function createBalloons() {
  for (let i = 0; i < 14; i++) {
    createBalloon(Math.random() * 8, 3 + Math.random() * 94, 14 + Math.random() * 10);
  }
}

function launchBalloonBurst() {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => createBalloon(0, 5 + Math.random() * 90, 8 + Math.random() * 4), i * 200);
  }
}

/* ─── Confetti ─── */
function launchConfetti() {
  const colors = ['#ff6f61', '#ffb347', '#ffc857', '#ff8a80', '#f48fb1', '#ce93d8'];
  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.top = '-12px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.width = `${5 + Math.random() * 9}px`;
      piece.style.height = `${5 + Math.random() * 9}px`;
      piece.style.animationDuration = `${2 + Math.random() * 2.5}s`;
      piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 200}px`);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4500);
    }, i * 25);
  }
}

/* ─── Hearts & Sparkles ─── */
function createFloatingHearts() {
  const container = document.querySelector('.floating-hearts');
  const icons = ['♥', '♡', '✨', '🎀'];
  for (let i = 0; i < 18; i++) {
    const h = document.createElement('span');
    h.className = 'heart-particle';
    h.textContent = icons[Math.floor(Math.random() * icons.length)];
    h.style.left = `${Math.random() * 100}%`;
    h.style.animationDuration = `${10 + Math.random() * 14}s`;
    h.style.animationDelay = `${Math.random() * 12}s`;
    h.style.fontSize = `${0.7 + Math.random() * 1.2}rem`;
    container.appendChild(h);
  }
}

function createSparkles() {
  const container = document.querySelector('.sparkles');
  for (let i = 0; i < 30; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 4}s`;
    s.style.animationDuration = `${1.5 + Math.random() * 3}s`;
    container.appendChild(s);
  }
}

function createCandleStars() {
  const container = document.querySelector('.candle-stars');
  for (let i = 0; i < 40; i++) {
    const star = document.createElement('div');
    star.className = 'candle-star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${2 + Math.random() * 3}s`;
    container.appendChild(star);
  }
}

init();
