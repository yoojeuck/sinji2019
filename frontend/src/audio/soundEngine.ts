// Web Audio API 사운드 엔진 - 외부 파일 없이 프로그래밍으로 생성

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let beatTimerId: ReturnType<typeof setInterval> | null = null;
let beatScheduler: ReturnType<typeof setInterval> | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function master() {
  getCtx();
  return masterGain!;
}

// ── 타격 사운드 ──────────────────────────────
export function playPerfect() {
  try {
    const c = getCtx();
    const t = c.currentTime;

    // 맑은 종소리 두 음 (화음)
    [880, 1108].forEach((freq, i) => {
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.28 - i * 0.06, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(g);
      g.connect(master());
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch (_) {}
}

export function playGood() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.linearRampToValueAtTime(440, t + 0.08);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(master());
    osc.start(t);
    osc.stop(t + 0.12);
  } catch (_) {}
}

export function playMiss() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    const bufSize = Math.floor(c.sampleRate * 0.06);
    const buf  = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src  = c.createBufferSource();
    const filt = c.createBiquadFilter();
    const g    = c.createGain();
    filt.type = 'lowpass';
    filt.frequency.value = 300;
    src.buffer = buf;
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    src.connect(filt);
    filt.connect(g);
    g.connect(master());
    src.start(t);
  } catch (_) {}
}

// ── 배경 비트 ────────────────────────────────
function makeKick(c: AudioContext, when: number) {
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.frequency.setValueAtTime(160, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + 0.12);
  g.gain.setValueAtTime(0.9, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  osc.connect(g);
  g.connect(master());
  osc.start(when);
  osc.stop(when + 0.18);
}

function makeSnare(c: AudioContext, when: number) {
  // 노이즈
  const bufSize = Math.floor(c.sampleRate * 0.1);
  const buf  = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src  = c.createBufferSource();
  const filt = c.createBiquadFilter();
  const g    = c.createGain();
  filt.type = 'bandpass';
  filt.frequency.value = 2400;
  src.buffer = buf;
  g.gain.setValueAtTime(0.5, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.1);
  src.connect(filt);
  filt.connect(g);
  g.connect(master());
  src.start(when);
}

function makeHihat(c: AudioContext, when: number, vol = 0.18) {
  const bufSize = Math.floor(c.sampleRate * 0.04);
  const buf  = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src  = c.createBufferSource();
  const filt = c.createBiquadFilter();
  const g    = c.createGain();
  filt.type = 'highpass';
  filt.frequency.value = 8000;
  src.buffer = buf;
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.03);
  src.connect(filt);
  filt.connect(g);
  g.connect(master());
  src.start(when);
}

function makeBass(c: AudioContext, when: number, freq: number) {
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  const filt = c.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 300;
  g.gain.setValueAtTime(0.35, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.22);
  osc.connect(filt);
  filt.connect(g);
  g.connect(master());
  osc.start(when);
  osc.stop(when + 0.22);
}

const BASS_NOTES = [110, 110, 87.3, 98]; // A2, A2, F2, G2

export function startBeat(bpm: number) {
  stopBeat();
  try {
    getCtx();
    let step = 0;
    const STEPS = 8; // 8th notes per bar

    const schedule = () => {
      const c = getCtx();
      const now = c.currentTime;
      const when = now + 0.04; // tiny lookahead

      const beat = step % STEPS;
      // Kick: beat 0, 4 (1 and 3 of 4/4)
      if (beat === 0 || beat === 4) makeKick(c, when);
      // Snare: beat 2, 6 (2 and 4 of 4/4)
      if (beat === 2 || beat === 6) makeSnare(c, when);
      // Hi-hat: every 8th note
      makeHihat(c, when, beat % 2 === 0 ? 0.22 : 0.12);
      // Bass: on kick beats
      if (beat === 0 || beat === 4) {
        makeBass(c, when, BASS_NOTES[Math.floor((step / 8) % BASS_NOTES.length)]);
      }
      step++;
    };

    schedule(); // immediate first hit
    beatScheduler = setInterval(schedule, (60 / bpm / 2) * 1000); // every 8th note
  } catch (_) {}
}

export function stopBeat() {
  if (beatScheduler) { clearInterval(beatScheduler); beatScheduler = null; }
  if (beatTimerId)   { clearInterval(beatTimerId);   beatTimerId   = null; }
}
