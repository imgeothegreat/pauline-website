/* ============================================================
   Sound — every effect is synthesized in the browser, no files.

   Want a real song instead of the music box? Put an mp3 in the
   project folder and set its file name here. If the file is
   missing, the built-in music box plays instead.
   ============================================================ */
const MUSIC_FILE = "music.mp3";
const MUSIC_VOLUME = 0.45; // 0 – 1

const Sound = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master, sfxBus, musicBus;
  let muted = false;
  try { muted = localStorage.getItem("pau-muted") === "1"; } catch (_) {}

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.55;
      sfxBus.connect(master);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);

      // a soft echo so everything sounds dreamy
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.32;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.3;
      const wet = ctx.createGain();
      wet.gain.value = 0.22;
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 2600;
      sfxBus.connect(delay);
      musicBus.connect(delay);
      delay.connect(tone);
      tone.connect(feedback);
      feedback.connect(delay);
      tone.connect(wet);
      wet.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // A music-box bell: sine + a quiet overtone, quick attack, long fade.
  function bell(note, delay = 0, dur = 1.2, vol = 0.2, bus) {
    const c = ensure();
    if (!c) return;
    const t = c.currentTime + Math.max(0, delay);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(bus || sfxBus);
    [[1, 1], [2.005, 0.22], [3.01, 0.06]].forEach(([mult, amp]) => {
      const o = c.createOscillator();
      const og = c.createGain();
      o.type = "sine";
      o.frequency.value = hz(note) * mult;
      og.gain.value = amp;
      o.connect(og);
      og.connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  // A tiny pitched "bloop".
  function blip(from, to, dur = 0.12, vol = 0.12, type = "sine", delay = 0) {
    const c = ensure();
    if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    o.connect(g);
    g.connect(sfxBus);
    o.start(t);
    o.stop(t + dur + 0.1);
  }

  // Soft paper rustle (filtered noise).
  function rustle(dur = 0.45, vol = 0.12) {
    const c = ensure();
    if (!c) return;
    const t = c.currentTime;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2400;
    f.Q.value = 0.8;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    src.start(t);
  }

  // Soft typewriter key: a tiny filtered click plus a faint sweet note.
  let clickBuf = null;
  function keyClick() {
    const c = ensure();
    if (!c) return;
    if (!clickBuf) {
      clickBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.03), c.sampleRate);
      const d = clickBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = clickBuf;
    src.playbackRate.value = 0.85 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 3000 + Math.random() * 1200;
    f.Q.value = 1.2;
    const g = c.createGain();
    g.gain.value = 0.18;
    src.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    src.start(t);
  }

  const PENTA = [72, 74, 76, 79, 81, 84, 86, 88];
  let keyStep = 0;
  let popStep = 0;

  const sfx = {
    pop() { blip(700, 1300, 0.07, 0.07); bell(PENTA[popStep++ % PENTA.length] + 12, 0.02, 0.5, 0.05); },
    tap() { blip(900, 1200, 0.05, 0.06); },
    key() { keyClick(); if (keyStep++ % 3 === 0) bell(PENTA[Math.floor(Math.random() * PENTA.length)] + 12, 0, 0.35, 0.025); },
    lineDone() { bell(84, 0, 1.2, 0.07); bell(91, 0.06, 1, 0.035); },
    flip(i = 0) { bell(PENTA[i % PENTA.length], 0, 1.4, 0.18); bell(PENTA[i % PENTA.length] + 7, 0.08, 1.2, 0.08); },
    chime() { [72, 76, 79, 84].forEach((n, i) => bell(n, i * 0.08, 1.6, 0.16)); },
    sparkle() { [84, 88, 91, 96, 100, 103].forEach((n, i) => bell(n, i * 0.045, 1.1, 0.08)); },
    win() { [72, 76, 79, 84, 88, 91].forEach((n, i) => bell(n, i * 0.09, 2, 0.15)); },
    lovesMe() { bell(84, 0, 1, 0.16); bell(88, 0.07, 1, 0.08); },
    lovesMeNot() { bell(77, 0, 0.9, 0.13); },
    plant() { blip(260, 620, 0.25, 0.1, "triangle"); bell(PENTA[Math.floor(Math.random() * PENTA.length)] + 12, 0.6, 1.2, 0.1); },
    nope() { bell(81, 0, 0.35, 0.1); bell(76, 0.13, 0.5, 0.1); },
    paper() { rustle(0.5, 0.14); bell(79, 0.35, 1.6, 0.12); bell(84, 0.45, 1.6, 0.1); },
  };

  // Rising tone while she holds the flower.
  let holdOsc = null, holdGain = null;
  function holdStart() {
    const c = ensure();
    if (!c || holdOsc) return;
    holdOsc = c.createOscillator();
    holdOsc.type = "triangle";
    holdOsc.frequency.value = hz(60);
    holdGain = c.createGain();
    holdGain.gain.value = 0.0001;
    holdOsc.connect(holdGain);
    holdGain.connect(sfxBus);
    holdOsc.start();
    holdGain.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.25);
  }
  function holdSet(p) {
    if (holdOsc) holdOsc.frequency.setTargetAtTime(hz(60 + p * 24), ctx.currentTime, 0.05);
  }
  function holdStop() {
    if (!holdOsc) return;
    const t = ctx.currentTime;
    holdGain.gain.cancelScheduledValues(t);
    holdGain.gain.setValueAtTime(Math.max(holdGain.gain.value, 0.0001), t);
    holdGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    holdOsc.stop(t + 0.35);
    holdOsc = null;
  }

  /* ---------- Background music ----------
     An original little lullaby in 3/4 on a music box. */
  const BPM = 80;
  const BEAT = 60 / BPM;
  const MELODY = [
    [76, 1], [79, 1], [84, 1],
    [83, 1], [81, 1], [76, 1],
    [77, 1], [81, 1], [84, 1],
    [83, 1.5], [79, 0.5], [74, 1],
    [76, 1], [79, 1], [84, 1],
    [83, 1], [79, 1], [76, 1],
    [81, 1], [77, 1], [72, 1],
    [74, 1], [79, 1], [null, 1],
  ];
  const CHORDS = [
    [48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59],
    [48, 55, 64], [40, 47, 55], [41, 48, 57], [43, 50, 59],
  ];
  const LOOP_BEATS = 24;

  let track = null;          // HTMLAudioElement when a music file exists
  let useFile = false;
  let playing = false;
  let nextLoopAt = 0, loopCount = 0, timer = null;

  function scheduleLoop(start) {
    let t = start;
    const sparkleOctave = loopCount % 2 === 1;
    MELODY.forEach(([n, beats]) => {
      if (n) {
        bell(n, t - ctx.currentTime, 2.2, 0.11, musicBus);
        if (sparkleOctave) bell(n + 12, t - ctx.currentTime + 0.01, 1.4, 0.025, musicBus);
      }
      t += beats * BEAT;
    });
    CHORDS.forEach((chord, bar) => {
      chord.forEach((n, i) => bell(n + 12, start + (bar * 3 + i) * BEAT - ctx.currentTime, 2.6, 0.05, musicBus));
    });
    loopCount++;
  }
  function scheduler() {
    if (!playing || useFile) return;
    while (nextLoopAt < ctx.currentTime + 1.5) {
      scheduleLoop(nextLoopAt);
      nextLoopAt += LOOP_BEATS * BEAT;
    }
  }

  function prepareFile() {
    if (track || !MUSIC_FILE) return;
    track = new Audio(MUSIC_FILE);
    track.loop = true;
    track.preload = "auto";
    track.volume = 0;
    track.addEventListener("error", () => { useFile = false; track = null; if (playing) startSynth(); });
  }

  function startSynth() {
    const c = ensure();
    if (!c) return;
    nextLoopAt = c.currentTime + 0.3;
    clearInterval(timer);
    timer = setInterval(scheduler, 250);
    scheduler();
    musicBus.gain.cancelScheduledValues(c.currentTime);
    musicBus.gain.setValueAtTime(0.0001, c.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(MUSIC_VOLUME * 1.6, c.currentTime + 3);
  }

  function fadeFile(to) {
    if (!track) return;
    const from = track.volume;
    const t0 = performance.now();
    (function step(now) {
      const k = Math.min(1, (now - t0) / 2500);
      track.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  const music = {
    // Call inside a tap/press so the browser allows audio.
    prime() {
      ensure();
      prepareFile();
      if (track) {
        track.muted = muted;
        const t = track;
        t.play().then(() => { if (track === t) useFile = true; }).catch(() => { useFile = false; });
      }
    },
    start() {
      if (playing) return;
      playing = true;
      if (track && useFile) fadeFile(MUSIC_VOLUME);
      else {
        if (track) { track.pause(); track = null; }
        startSynth();
      }
      document.dispatchEvent(new CustomEvent("sound:state"));
    },
  };

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem("pau-muted", m ? "1" : "0"); } catch (_) {}
    if (ctx) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.08);
    if (track) track.muted = m;
    document.dispatchEvent(new CustomEvent("sound:state"));
  }

  return {
    sfx, music, holdStart, holdSet, holdStop,
    unlock: ensure,
    isMuted: () => muted,
    isPlaying: () => playing,
    toggle() { ensure(); setMuted(!muted); if (!muted && !playing) music.start(); },
  };
})();
