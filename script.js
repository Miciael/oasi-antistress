// --- NAVIGAZIONE SCHEDE ---
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(item.dataset.tab).classList.add('active');
  });
});

// --- AUDIO CONTEXT GLOBALE E SBLOCCO iOS ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function resumeAudio() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

['click', 'touchstart'].forEach(eventType => {
  document.addEventListener(eventType, () => {
    resumeAudio();
  }, { once: false });
});

// ==========================================
// SINTETIZZATORI AUDIO PROCEDURALI
// ==========================================

function playSquishySound() {
  resumeAudio();
  const now = audioCtx.currentTime;
  const duration = 0.75;

  const bufferSize = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.04 * white)) / 1.04;
    lastOut = data[i];
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 2.5;
  filter.frequency.setValueAtTime(750, now);
  filter.frequency.exponentialRampToValueAtTime(150, now + duration - 0.1);

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.001, now);
  noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.1);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + duration - 0.15);

  oscGain.gain.setValueAtTime(0.2, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.1);

  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);

  for (let i = 0; i < 5; i++) {
    const popTime = now + 0.05 + (i * 0.12) + Math.random() * 0.05;
    const popOsc = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(900 + Math.random() * 500, popTime);
    popOsc.frequency.exponentialRampToValueAtTime(250, popTime + 0.02);

    popGain.gain.setValueAtTime(0.05, popTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.02);

    popOsc.connect(popGain);
    popGain.connect(audioCtx.destination);
    popOsc.start(popTime);
    popOsc.stop(popTime + 0.02);
  }

  noise.start(now);
  osc.start(now);
  noise.stop(now + duration);
  osc.stop(now + duration);
}

function playSoftThock() {
  resumeAudio();
  const now = audioCtx.currentTime;

  const creamOsc = audioCtx.createOscillator();
  const creamFilter = audioCtx.createBiquadFilter();
  const creamGain = audioCtx.createGain();

  creamOsc.type = 'sine';
  creamOsc.frequency.setValueAtTime(540, now);
  creamOsc.frequency.exponentialRampToValueAtTime(130, now + 0.05);

  creamFilter.type = 'bandpass';
  creamFilter.frequency.setValueAtTime(450, now);
  creamFilter.Q.value = 3.8;

  creamGain.gain.setValueAtTime(0.55, now);
  creamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  creamOsc.connect(creamFilter);
  creamFilter.connect(creamGain);

  const bottomOsc = audioCtx.createOscillator();
  const bottomGain = audioCtx.createGain();

  bottomOsc.type = 'triangle';
  bottomOsc.frequency.setValueAtTime(175, now);
  bottomOsc.frequency.exponentialRampToValueAtTime(40, now + 0.065);

  bottomGain.gain.setValueAtTime(0.45, now);
  bottomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

  bottomOsc.connect(bottomGain);

  const bufSize = Math.floor(audioCtx.sampleRate * 0.025);
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const lubeNoise = audioCtx.createBufferSource();
  lubeNoise.buffer = buf;

  const lubeFilter = audioCtx.createBiquadFilter();
  lubeFilter.type = 'bandpass';
  lubeFilter.frequency.setValueAtTime(500, now);
  lubeFilter.Q.value = 2.5;

  const lubeGain = audioCtx.createGain();
  lubeGain.gain.setValueAtTime(0.25, now);
  lubeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  lubeNoise.connect(lubeFilter);
  lubeFilter.connect(lubeGain);

  creamGain.connect(audioCtx.destination);
  bottomGain.connect(audioCtx.destination);
  lubeGain.connect(audioCtx.destination);

  creamOsc.start(now);
  bottomOsc.start(now);
  lubeNoise.start(now);

  creamOsc.stop(now + 0.05);
  bottomOsc.stop(now + 0.065);
  lubeNoise.stop(now + 0.025);
}

function playPopItSound() {
  resumeAudio();
  const now = audioCtx.currentTime;

  const bufSize = Math.floor(audioCtx.sampleRate * 0.006);
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const siliconeSnap = audioCtx.createBufferSource();
  siliconeSnap.buffer = buf;

  const snapFilter = audioCtx.createBiquadFilter();
  snapFilter.type = 'bandpass';
  snapFilter.frequency.setValueAtTime(2400, now);
  snapFilter.Q.value = 3.0;

  const snapGain = audioCtx.createGain();
  snapGain.gain.setValueAtTime(0.4, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.006);

  siliconeSnap.connect(snapFilter);
  snapFilter.connect(snapGain);
  snapGain.connect(audioCtx.destination);

  const popOsc = audioCtx.createOscillator();
  const popFilter = audioCtx.createBiquadFilter();
  const popGain = audioCtx.createGain();

  popOsc.type = 'sine';
  const popPitch = 780 + Math.random() * 100;
  popOsc.frequency.setValueAtTime(popPitch, now);
  popOsc.frequency.exponentialRampToValueAtTime(160, now + 0.03);

  popFilter.type = 'bandpass';
  popFilter.frequency.setValueAtTime(450, now);
  popFilter.Q.value = 6.0;

  popGain.gain.setValueAtTime(0.7, now);
  popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  popOsc.connect(popFilter);
  popFilter.connect(popGain);
  popGain.connect(audioCtx.destination);

  siliconeSnap.start(now);
  popOsc.start(now);

  siliconeSnap.stop(now + 0.006);
  popOsc.stop(now + 0.03);
}

// --- SQUISHY ---
const canvas = document.getElementById('squishy-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = 260;
  canvas.height = 260;

  const numPoints = 24;
  const baseRadius = 65;
  const center = { x: 130, y: 130 };
  let points = [];
  let isDraggingSquishy = false;
  let currentFace = '😌';
  let mousePos = { x: 130, y: 130 };

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    points.push({
      x: center.x + Math.cos(angle) * baseRadius,
      y: center.y + Math.sin(angle) * baseRadius,
      ox: center.x + Math.cos(angle) * baseRadius,
      oy: center.y + Math.sin(angle) * baseRadius
    });
  }

  document.querySelectorAll('.face-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.face-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFace = btn.innerText.split(' ')[0];
    });
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    isDraggingSquishy = true;
    updateMousePos(e.clientX - rect.left, e.clientY - rect.top);
    playSquishySound();
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDraggingSquishy) {
      const rect = canvas.getBoundingClientRect();
      updateMousePos(e.clientX - rect.left, e.clientY - rect.top);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingSquishy) {
      isDraggingSquishy = false;
      mousePos = { x: center.x, y: center.y };
      playSquishySound();
    }
  });

  canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    isDraggingSquishy = true;
    const touch = e.touches[0];
    updateMousePos(touch.clientX - rect.left, touch.clientY - rect.top);
    playSquishySound();
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (isDraggingSquishy) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      updateMousePos(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (isDraggingSquishy) {
      isDraggingSquishy = false;
      mousePos = { x: center.x, y: center.y };
      playSquishySound();
    }
  });

  function updateMousePos(mx, my) {
    const pullX = mx - center.x;
    const pullY = my - center.y;
    let pullDist = Math.sqrt(pullX * pullX + pullY * pullY);
    
    const maxLimit = 65;
    if (pullDist > maxLimit) {
      const angle = Math.atan2(pullY, pullX);
      mousePos.x = center.x + Math.cos(angle) * maxLimit;
      mousePos.y = center.y + Math.sin(angle) * maxLimit;
    } else {
      mousePos.x = mx;
      mousePos.y = my;
    }
  }

  function animateSquishy() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pullX = mousePos.x - center.x;
    const pullY = mousePos.y - center.y;
    const pullDist = Math.sqrt(pullX * pullX + pullY * pullY);
    const pullAngle = Math.atan2(pullY, pullX);

    points.forEach((p, i) => {
      const angle = (i / numPoints) * Math.PI * 2;
      let targetX = p.ox;
      let targetY = p.oy;

      if (isDraggingSquishy && pullDist > 1) {
        const angleDiff = Math.abs(Math.atan2(Math.sin(angle - pullAngle), Math.cos(angle - pullAngle)));
        
        if (angleDiff < Math.PI / 2) {
          const factor = 1 - (angleDiff / (Math.PI / 2));
          targetX += Math.cos(pullAngle) * (pullDist * factor * 0.9);
          targetY += Math.sin(pullAngle) * (pullDist * factor * 0.9);
        } else {
          const factor = (angleDiff - Math.PI / 2) / (Math.PI / 2);
          targetX -= Math.cos(pullAngle) * (pullDist * factor * 0.2);
          targetY -= Math.sin(pullAngle) * (pullDist * factor * 0.2);
        }
      }

      p.x += (targetX - p.x) * 0.25;
      p.y += (targetY - p.y) * 0.25;
    });

    ctx.beginPath();
    const shadowScale = isDraggingSquishy ? 0.85 : 1.0;
    ctx.ellipse(center.x, center.y + 70, 55 * shadowScale, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo((points[0].x + points[numPoints - 1].x) / 2, (points[0].y + points[numPoints - 1].y) / 2);

    for (let i = 0; i < numPoints; i++) {
      const current = points[i];
      const next = points[(i + 1) % numPoints];
      const xc = (current.x + next.x) / 2;
      const yc = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, xc, yc);
    }

    const grad = ctx.createRadialGradient(center.x - 20, center.y - 20, 10, center.x, center.y, 75);
    grad.addColorStop(0, '#fbcfe8');
    grad.addColorStop(0.6, '#ec4899');
    grad.addColorStop(1, '#be123d');

    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(236, 72, 153, 0.45)';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.ellipse(center.x - 25, center.y - 25, 16, 9, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    const faceOffsetX = (mousePos.x - center.x) * 0.15;
    const faceOffsetY = (mousePos.y - center.y) * 0.15;

    ctx.font = '36px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentFace, center.x + faceOffsetX, center.y + faceOffsetY);

    requestAnimationFrame(animateSquishy);
  }
  animateSquishy();
}

// --- TASTIERA ---
const virtualKeyboard = document.getElementById('virtual-keyboard');
if (virtualKeyboard) {
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  let isMouseDown = false;

  document.addEventListener('mousedown', () => isMouseDown = true);
  document.addEventListener('mouseup', () => isMouseDown = false);

  rows.forEach(rowStr => {
    const row = document.createElement('div');
    row.className = 'key-row';
    rowStr.split('').forEach(char => {
      const key = document.createElement('div');
      key.className = 'key';
      key.innerText = char;
      key.id = `key-${char}`;

      const trigger = () => {
        key.classList.add('pressed');
        playSoftThock();
        setTimeout(() => key.classList.remove('pressed'), 100);
      };

      key.addEventListener('mousedown', trigger);
      key.addEventListener('touchstart', (e) => { e.preventDefault(); trigger(); });
      key.addEventListener('mouseenter', () => { if (isMouseDown) trigger(); });
      row.appendChild(key);
    });
    virtualKeyboard.appendChild(row);
  });

  document.addEventListener('keydown', (e) => {
    const k = document.getElementById(`key-${e.key.toUpperCase()}`);
    if (k) { k.classList.add('pressed'); playSoftThock(); }
  });
  document.addEventListener('keyup', (e) => {
    const k = document.getElementById(`key-${e.key.toUpperCase()}`);
    if (k) k.classList.remove('pressed');
  });
}

// --- ACQUA ---
const dispenserBtn = document.getElementById('dispenser-btn');
const resetWaterBtn = document.getElementById('reset-water-btn');
const waterFill = document.getElementById('water-fill');
const waterStream = document.getElementById('water-stream');

let waterLevel = 0;
let fillInterval = null;
let streamAudioNode = null;
let streamGainNode = null;

function startWaterFlowSound() {
  resumeAudio();
  if (streamAudioNode) return;

  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  streamAudioNode = audioCtx.createBufferSource();
  streamAudioNode.buffer = buffer;
  streamAudioNode.loop = true;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 950;
  bandpass.Q.value = 1.4;

  streamGainNode = audioCtx.createGain();
  streamGainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
  streamGainNode.gain.linearRampToValueAtTime(0.16, audioCtx.currentTime + 0.1);

  streamAudioNode.connect(bandpass);
  bandpass.connect(streamGainNode);
  streamGainNode.connect(audioCtx.destination);

  streamAudioNode.start();
}

function stopWaterFlowSound() {
  if (streamGainNode && streamAudioNode) {
    streamGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    setTimeout(() => {
      if (streamAudioNode) {
        streamAudioNode.stop();
        streamAudioNode.disconnect();
        streamAudioNode = null;
        streamGainNode = null;
      }
    }, 100);
  }
}

function playWaterPouringSplash(currentLevel) {
  if (audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;

  const fillPitch = 280 + (currentLevel * 11);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(fillPitch, now);
  osc.frequency.exponentialRampToValueAtTime(fillPitch + 180, now + 0.04);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

function startPouring() {
  resumeAudio();
  if (waterStream) waterStream.classList.add('flowing');
  startWaterFlowSound();

  if (fillInterval) clearInterval(fillInterval);
  fillInterval = setInterval(() => {
    if (waterLevel < 100) {
      waterLevel += 1.2;
      if (waterFill) waterFill.style.height = `${waterLevel}%`;

      if (Math.random() < 0.8) {
        playWaterPouringSplash(waterLevel);
      }
    }
  }, 45);
}

function stopPouring() {
  if (waterStream) waterStream.classList.remove('flowing');
  stopWaterFlowSound();
  if (fillInterval) {
    clearInterval(fillInterval);
    fillInterval = null;
  }
}

if (dispenserBtn) {
  dispenserBtn.addEventListener('mousedown', startPouring);
  dispenserBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startPouring(); }, { passive: false });
}
window.addEventListener('mouseup', stopPouring);
window.addEventListener('touchend', stopPouring);

if (resetWaterBtn) {
  resetWaterBtn.addEventListener('click', () => {
    waterLevel = 0;
    if (waterFill) waterFill.style.height = '0%';
    playPopItSound();
  });
}

// --- POP-IT ---
const bubbleGrid = document.getElementById('bubble-grid');
const popCountEl = document.getElementById('pop-count');
let popTotal = 0;

function generateBubbles() {
  if (!bubbleGrid) return;
  bubbleGrid.innerHTML = '';
  for (let i = 0; i < 32; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    
    const popAction = (e) => {
      e.preventDefault();
      if (!b.classList.contains('popped')) {
        b.classList.add('popped');
        popTotal++;
        if (popCountEl) popCountEl.innerText = popTotal;
        playPopItSound();
      }
    };

    b.addEventListener('click', popAction);
    b.addEventListener('touchstart', popAction, { passive: false });
    bubbleGrid.appendChild(b);
  }
}
generateBubbles();
document.getElementById('reset-bubbles')?.addEventListener('click', generateBubbles);

// --- AMBIENT SOUNDS ---
const ambientNodes = {};
let rainLoopInterval = null;
let fireLoopInterval = null;

function createNoiseBuffer() {
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playRainDrop() {
  if (audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  const startFreq = 1400 + Math.random() * 1600;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(450 + Math.random() * 300, now + 0.012);

  const vol = 0.03 + Math.random() * 0.07;
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.012);
}

function playFirePop() {
  if (audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1100 + Math.random() * 1400, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.01);

  const vol = 0.04 + Math.random() * 0.1;
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.01);
}

document.querySelectorAll('.volume-slider').forEach(slider => {
  slider.addEventListener('input', (e) => {
    resumeAudio();
    const sound = e.target.dataset.sound;
    const val = parseFloat(e.target.value);

    if (!ambientNodes[sound]) {
      const src = audioCtx.createBufferSource();
      src.buffer = createNoiseBuffer();
      src.loop = true;

      const gain = audioCtx.createGain();
      gain.gain.value = 0;

      const filter = audioCtx.createBiquadFilter();

      if (sound === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 850;
      } else if (sound === 'fire') {
        filter.type = 'bandpass';
        filter.frequency.value = 240;
        filter.Q.value = 1.5;
      } else if (sound === 'wind') {
        filter.type = 'lowpass';
        filter.frequency.value = 320;
      } else if (sound === 'leaves') {
        filter.type = 'highpass';
        filter.frequency.value = 2000;
      }

      src.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      src.start();

      ambientNodes[sound] = gain;
    }

    ambientNodes[sound].gain.setValueAtTime(val * 0.35, audioCtx.currentTime);

    if (sound === 'rain') {
      if (val > 0 && !rainLoopInterval) {
        rainLoopInterval = setInterval(() => {
          const rainSlider = document.querySelector('[data-sound="rain"]');
          if (!rainSlider) return;
          const rVal = parseFloat(rainSlider.value);
          if (rVal > 0 && Math.random() < rVal * 0.9) {
            playRainDrop();
          }
        }, 35);
      } else if (val === 0 && rainLoopInterval) {
        clearInterval(rainLoopInterval);
        rainLoopInterval = null;
      }
    }

    if (sound === 'fire') {
      if (val > 0 && !fireLoopInterval) {
        fireLoopInterval = setInterval(() => {
          const fireSlider = document.querySelector('[data-sound="fire"]');
          if (!fireSlider) return;
          const fVal = parseFloat(fireSlider.value);
          if (fVal > 0 && Math.random() < fVal * 0.7) {
            playFirePop();
          }
        }, 50);
      } else if (val === 0 && fireLoopInterval) {
        clearInterval(fireLoopInterval);
        fireLoopInterval = null;
      }
    }
  });
});

// --- RESPIRAZIONE ---
const breathCircle = document.getElementById('breath-circle');
const breathText = document.getElementById('breath-text');
const startBreathBtn = document.getElementById('start-breath');
let isBreathing = false;

if (startBreathBtn) {
  startBreathBtn.addEventListener('click', () => {
    isBreathing = !isBreathing;
    if (isBreathing) {
      startBreathBtn.innerText = 'Interrompi';
      cycleBreath();
    } else {
      startBreathBtn.innerText = 'Avvia Esercizio';
      if (breathCircle) breathCircle.classList.remove('expand');
      if (breathText) breathText.innerText = 'Inizia';
    }
  });
}

function cycleBreath() {
  if (!isBreathing) return;
  if (breathText) breathText.innerText = 'Inspira...';
  if (breathCircle) breathCircle.classList.add('expand');

  setTimeout(() => {
    if (!isBreathing) return;
    if (breathText) breathText.innerText = 'Espira...';
    if (breathCircle) breathCircle.classList.remove('expand');

    setTimeout(() => {
      if (isBreathing) cycleBreath();
    }, 4000);
  }, 4000);
}

// --- GIARDINO ZEN ---
const zenCanvas = document.getElementById('zen-canvas');
if (zenCanvas) {
  const zenCtx = zenCanvas.getContext('2d');
  zenCanvas.width = 280;
  zenCanvas.height = 280;

  zenCtx.fillStyle = '#fde68a';
  zenCtx.fillRect(0, 0, zenCanvas.width, zenCanvas.height);
  
  zenCtx.strokeStyle = '#f59e0b';
  zenCtx.lineWidth = 3;
  for (let y = 30; y < zenCanvas.height; y += 30) {
    zenCtx.beginPath();
    zenCtx.moveTo(0, y);
    zenCtx.bezierCurveTo(70, y - 15, 210, y + 15, 280, y);
    zenCtx.stroke();
  }

  let isRaking = false;
  
  function startRake(clientX, clientY) {
    isRaking = true;
    rakeAt(clientX, clientY);
  }

  function moveRake(clientX, clientY) {
    if (isRaking) rakeAt(clientX, clientY);
  }

  function rakeAt(clientX, clientY) {
    const rect = zenCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    zenCtx.strokeStyle = '#d97706';
    zenCtx.lineWidth = 5;
    zenCtx.beginPath();
    zenCtx.arc(x, y, 12, 0, Math.PI * 2);
    zenCtx.stroke();
  }

  zenCanvas.addEventListener('mousedown', (e) => startRake(e.clientX, e.clientY));
  zenCanvas.addEventListener('mousemove', (e) => moveRake(e.clientX, e.clientY));
  window.addEventListener('mouseup', () => isRaking = false);

  zenCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) startRake(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  zenCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) moveRake(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  window.addEventListener('touchend', () => isRaking = false);

  document.getElementById('reset-zen')?.addEventListener('click', () => {
    zenCtx.fillStyle = '#fde68a';
    zenCtx.fillRect(0, 0, zenCanvas.width, zenCanvas.height);
    zenCtx.strokeStyle = '#f59e0b';
    zenCtx.lineWidth = 3;
    for (let y = 30; y < zenCanvas.height; y += 30) {
      zenCtx.beginPath();
      zenCtx.moveTo(0, y);
      zenCtx.bezierCurveTo(70, y - 15, 210, y + 15, 280, y);
      zenCtx.stroke();
    }
    playPopItSound();
  });
}

// --- GLOCKENSPIEL ---
function playGlockNote(freq) {
  resumeAudio();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.8);
}

document.querySelectorAll('.glock-key').forEach(key => {
  const triggerNote = () => {
    const freq = parseFloat(key.dataset.freq);
    playGlockNote(freq);
    key.style.transform = 'scale(0.95)';
    setTimeout(() => key.style.transform = 'scale(1)', 120);
  };
  key.addEventListener('mousedown', triggerNote);
  key.addEventListener('touchstart', (e) => { e.preventDefault(); triggerNote(); });
});

// --- CIELO STELLATO (Attivo solo nella scheda Cielo Magico) ---
const starCanvas = document.getElementById('star-canvas');
if (starCanvas) {
  const starCtx = starCanvas.getContext('2d');
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  let particles = [];

  window.addEventListener('resize', () => {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
  });

  function addParticles(x, y) {
    // Controlla se la scheda attiva è proprio quella del Cielo Magico
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab || activeTab.id !== 'stars') return;

    for (let i = 0; i < 3; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        alpha: 1,
        color: ['#f472b6', '#38bdf8', '#fbbf24', '#c084fc'][Math.floor(Math.random() * 4)]
      });
    }
  }

  window.addEventListener('mousemove', (e) => {
    addParticles(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      addParticles(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  function animateStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;

      if (p.alpha <= 0) {
        particles.splice(index, 1);
      } else {
        starCtx.save();
        starCtx.globalAlpha = p.alpha;
        starCtx.fillStyle = p.color;
        starCtx.beginPath();
        starCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        starCtx.fill();
        starCtx.restore();
      }
    });
    requestAnimationFrame(animateStars);
  }
  animateStars();
}

// --- AFFERMAZIONI E GRATITUDINE ---
const affirmations = [
  "Meriti pace, tranquillità e serenità in questo momento.",
  "Ogni respiro ti porta calma e leggerezza.",
  "Sei esattamente dove devi essere.",
  "Lascia andare ciò che non puoi controllare.",
  "Il tuo benessere è una priorità preziosa."
];

const affText = document.getElementById('affirmation-text');
document.getElementById('new-affirmation')?.addEventListener('click', () => {
  const randomAff = affirmations[Math.floor(Math.random() * affirmations.length)];
  if (affText) affText.innerText = randomAff;
  playPopItSound();
});

const gratInput = document.getElementById('gratitude-input');
document.getElementById('send-gratitude')?.addEventListener('click', () => {
  if (gratInput && gratInput.value.trim() !== '') {
    const container = document.getElementById('gratitude');
    if (container) {
      const bubble = document.createElement('div');
      bubble.className = 'floating-thought';
      bubble.innerText = gratInput.value;
      bubble.style.left = `${Math.random() * 60 + 20}%`;
      bubble.style.bottom = '50px';
      container.appendChild(bubble);
      
      setTimeout(() => bubble.remove(), 4000);
    }
    gratInput.value = '';
    playPopItSound();
  }
});