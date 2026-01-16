
// Simple audio synthesis to avoid external asset loading issues
// and to strictly adhere to the "wood/boot" sound requirement.

let audioCtx: AudioContext | null = null;
let waterSource: AudioBufferSourceNode | null = null;
let waterGain: GainNode | null = null;

// News Audio Loop Variable
let newsInterval: any = null;
let newsMasterGain: GainNode | null = null; 

// Phone Ring Interval
let ringInterval: any = null;

// Music Interval
let musicInterval: any = null;
let musicGain: GainNode | null = null;

// Tutorial Song Interval
let tutorialInterval: any = null;
let tutorialGain: GainNode | null = null;

// Credits Music Interval
let creditsInterval: any = null;
let creditsGain: GainNode | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// --- MENU MUSIC (Fade To Black Style Intro) ---
export const playMenuMusic = () => {
    const ctx = getAudioContext();
    if (musicInterval) return; // Already playing

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.3;
    musicGain.connect(ctx.destination);

    // Notes for the acoustic arpeggio (Approximate Fade To Black Intro)
    // B minor arpeggio sequence
    const sequence = [
        { note: 146.83, time: 0 },   // D3
        { note: 220.00, time: 0.5 }, // A3
        { note: 293.66, time: 1.0 }, // D4
        { note: 220.00, time: 1.5 }, // A3
        { note: 293.66, time: 2.0 }, // D4
        { note: 220.00, time: 2.5 }, // A3
        // Change root
        { note: 130.81, time: 3.0 }, // C3
        { note: 220.00, time: 3.5 }, // A3
        { note: 293.66, time: 4.0 }, // D4
        { note: 220.00, time: 4.5 }, // A3
    ];

    const playNote = (freq: number, t: number) => {
        if (!musicGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Acoustic Guitar Simulation (Sawtooth + Lowpass)
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800; // Mellow tone
        filter.Q.value = 0.5;

        // Pluck envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, t + 3.0); // Long Decay

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(musicGain);

        osc.start(t);
        osc.stop(t + 3.5);
    };

    const loopLength = 5.0; // Seconds

    const playLoop = () => {
        const now = ctx.currentTime;
        sequence.forEach(step => {
            playNote(step.note, now + step.time);
        });
    };

    playLoop();
    musicInterval = setInterval(playLoop, loopLength * 1000);
};

export const stopMenuMusic = () => {
    const ctx = getAudioContext();
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
    if (musicGain) {
        musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
        setTimeout(() => {
            musicGain?.disconnect();
            musicGain = null;
        }, 600);
    }
};

// --- CREDITS MUSIC (Epic/Sad Ending) ---
export const playCreditsMusic = () => {
    const ctx = getAudioContext();
    if (creditsInterval) return;

    creditsGain = ctx.createGain();
    creditsGain.gain.value = 0.4;
    creditsGain.connect(ctx.destination);

    // Simple emotional chord progression (Am - F - C - G)
    const chords = [
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63], // F
        [261.63, 329.63, 392.00], // C
        [196.00, 246.94, 293.66]  // G
    ];

    let chordIndex = 0;

    const playChord = () => {
        const now = ctx.currentTime;
        const currentChord = chords[chordIndex % chords.length];
        
        currentChord.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle'; // Softer sound
            osc.frequency.value = freq;
            
            // Long swelling pad sound
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 1.0);
            gain.gain.linearRampToValueAtTime(0.1, now + 3.0);
            gain.gain.linearRampToValueAtTime(0, now + 4.0);
            
            osc.connect(gain);
            gain.connect(creditsGain!);
            osc.start(now);
            osc.stop(now + 4.0);
        });

        chordIndex++;
    };

    playChord();
    creditsInterval = setInterval(playChord, 4000);
};

export const stopCreditsMusic = () => {
    if (creditsInterval) {
        clearInterval(creditsInterval);
        creditsInterval = null;
    }
    if (creditsGain) {
        creditsGain.disconnect();
        creditsGain = null;
    }
};

// --- TUTORIAL SONG (Funky Guide Music) ---
export const playTutorialMusic = () => {
    const ctx = getAudioContext();
    if (tutorialInterval) return;

    tutorialGain = ctx.createGain();
    tutorialGain.gain.value = 0.4;
    tutorialGain.connect(ctx.destination);

    const tempo = 120;
    const beatTime = 60 / tempo;

    const playBeat = () => {
        const t = ctx.currentTime;
        // Kick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.connect(gain);
        gain.connect(tutorialGain!);
        osc.start(t);
        osc.stop(t + 0.5);

        // HiHat
        const noise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;
        const hatGain = ctx.createGain();
        hatGain.gain.value = 0.3;
        const hatFilter = ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.value = 5000;
        noise.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(tutorialGain!);
        noise.start(t + beatTime / 2); // Offbeat

        // Cheesy Synth Melody
        const synthOsc = ctx.createOscillator();
        const synthGain = ctx.createGain();
        synthOsc.type = 'square';
        // Simple C Major pentatonic random
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; 
        const note = notes[Math.floor(Math.random() * notes.length)];
        synthOsc.frequency.value = note;
        synthGain.gain.setValueAtTime(0.1, t);
        synthGain.gain.linearRampToValueAtTime(0, t + 0.2);
        synthOsc.connect(synthGain);
        synthGain.connect(tutorialGain!);
        synthOsc.start(t);
        synthOsc.stop(t + 0.3);
    };

    playBeat();
    tutorialInterval = setInterval(playBeat, beatTime * 1000);
};

export const stopTutorialMusic = () => {
    if (tutorialInterval) {
        clearInterval(tutorialInterval);
        tutorialInterval = null;
    }
    if (tutorialGain) {
        tutorialGain.disconnect();
        tutorialGain = null;
    }
};

// --- RETRO SPEECH SOUND (Classic "Beep Beep") ---
export const playPhoneGarble = (durationSeconds: number = 2) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // Classic Retro RPG Text Sound
    // Fast, short square waves
    const beepCount = Math.floor(durationSeconds * 10); 
    const interval = 0.1; 

    for(let i=0; i<beepCount; i++) {
        // Random gaps for rhythm
        if (Math.random() > 0.85) continue;

        const t = now + i * interval;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square'; // 8-bit sound
        
        // Random pitch in a specific range
        osc.frequency.setValueAtTime(200 + Math.random() * 150, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.01); 
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.1);
    }
};

export const speakHebrew = (text: string, isFemale: boolean = false) => {};

export const playBarricadeSound = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    // Play 3 heavy thuds
    [0, 0.4, 0.8].forEach(time => {
        const t = ctx.currentTime + time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);
        
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.3);
    });
};

export const playHeavyKnock = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    // 3 Loud Knocks
    [0, 0.6, 1.2].forEach(offset => {
        const t = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Wooden impact sound
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
        
        gain.gain.setValueAtTime(1.0, t); // Loud
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
    });
};

export const playFootstep = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const t = ctx.currentTime;

  // 1. The "Thud" (Low frequency impact)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Noise buffer for texture
  const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();

  // Setup "Body" of the sound (The wood resonance)
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15); // Short decay (Dry)

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(150, t);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.15);

  // Setup "Click/Impact" of the boot (The sole hitting)
  // Filtered noise to sound like a heavy boot, not a high heel
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(400, t); // Cut off high frequencies (no clicks)
  
  noiseGain.gain.setValueAtTime(0.5, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  // Randomize pitch slightly for realism
  noise.playbackRate.value = 0.8 + Math.random() * 0.4;

  noise.start(t);
};

export const toggleWaterSound = (shouldPlay: boolean) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  if (shouldPlay) {
    if (waterSource) return; // Already playing

    const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    waterSource = ctx.createBufferSource();
    waterSource.buffer = buffer;
    waterSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Muffled water sound

    waterGain = ctx.createGain();
    waterGain.gain.setValueAtTime(0, ctx.currentTime);
    waterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);

    waterSource.connect(filter);
    filter.connect(waterGain);
    waterGain.connect(ctx.destination);
    
    waterSource.start();

  } else {
    if (waterSource && waterGain) {
      // Fade out
      const stopTime = ctx.currentTime + 0.5;
      waterGain.gain.linearRampToValueAtTime(0, stopTime);
      waterSource.stop(stopTime);
      
      // Cleanup after fade
      const oldSource = waterSource;
      setTimeout(() => {
        oldSource.disconnect();
      }, 550);
      
      waterSource = null;
      waterGain = null;
    }
  }
};

// Allows the TV component to "cut" the audio for glitch effect
export const setNewsVolume = (volume: number) => {
    if (newsMasterGain) {
        // Instant change for stutter effect
        newsMasterGain.gain.setValueAtTime(volume * 0.25, getAudioContext().currentTime); 
    }
};

export const playStaticBurst = () => {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    
    const bufferSize = ctx.sampleRate * 0.2; // Short burst
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(t);
};

export const toggleNewsSound = (shouldPlay: boolean) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  if (shouldPlay) {
    if (newsInterval) return; // Already playing

    // Create a master gain for the news channel
    newsMasterGain = ctx.createGain();
    newsMasterGain.gain.value = 0.25;
    newsMasterGain.connect(ctx.destination);

    const tempo = 110; // BPM
    const beatTime = 60 / tempo;
    const barTime = beatTime * 4; // 4/4 time

    const playOrchestraHit = (time: number, freq: number, duration: number = 0.3) => {
        if (!newsMasterGain) return;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Detuned saws for thick brass sound
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = freq;
        osc2.frequency.value = freq * 0.99; // Detuned

        // Filter envelope for "Bwaaa" sound
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.linearRampToValueAtTime(3000, time + 0.05); // Attack
        filter.frequency.exponentialRampToValueAtTime(600, time + duration); // Decay

        // Amp envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.25, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration + 0.1);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(newsMasterGain); // Connect to master news gain

        osc1.start(time);
        osc1.stop(time + duration + 0.2);
        osc2.start(time);
        osc2.stop(time + duration + 0.2);
    };

    const scheduleLoop = () => {
        if (!newsMasterGain) return;
        const t = ctx.currentTime;

        // 1. High Tech Ticker (16th notes)
        // Fast repeating high pitch blips
        for(let i=0; i<16; i++) {
            const time = t + i * (beatTime / 4);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Alternating pitch slightly for groove
            osc.frequency.value = i % 4 === 0 ? 1200 : 1000; 
            osc.type = 'square';
            
            gain.gain.setValueAtTime(0.015, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
            
            osc.connect(gain);
            gain.connect(newsMasterGain);
            
            osc.start(time);
            osc.stop(time + 0.04);
        }

        // 2. Bass Pulse (Quarter notes)
        for(let i=0; i<4; i++) {
            const time = t + i * beatTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.frequency.value = 60; // Low C
            osc.type = 'sawtooth'; // Aggressive bass
            
            // Quick decay per beat
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
            
            osc.connect(gain);
            gain.connect(newsMasterGain);
            
            osc.start(time);
            osc.stop(time + 0.2);
        }

        // 3. Dramatic Hits (The "News" Melody)
        // Hit on 1
        playOrchestraHit(t, 261.63); // C4
        // Hit on 2.5 (The "and" of 2)
        playOrchestraHit(t + 1.5 * beatTime, 261.63); // C4
        // Hit on 3.5 (The "and" of 3)
        playOrchestraHit(t + 2.5 * beatTime, 261.63); // C4
        // Hit on 4 (Anticipation) -> Eb (Minor feel)
        playOrchestraHit(t + 3.0 * beatTime, 311.13, 0.4); // Eb4
        
        // Deep Impact on 1
        const boomOsc = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boomOsc.frequency.setValueAtTime(80, t);
        boomOsc.frequency.exponentialRampToValueAtTime(20, t + 0.5);
        boomGain.gain.setValueAtTime(0.4, t);
        boomGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        boomOsc.connect(boomGain);
        boomGain.connect(newsMasterGain);
        boomOsc.start(t);
        boomOsc.stop(t+0.6);
    };

    // Start immediately
    scheduleLoop();
    // Schedule repeats
    newsInterval = setInterval(scheduleLoop, barTime * 1000);

  } else {
    // Stop
    if (newsInterval) {
      clearInterval(newsInterval);
      newsInterval = null;
    }
    if (newsMasterGain) {
        // Fade out slightly before disconnecting
        newsMasterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
        const oldGain = newsMasterGain;
        setTimeout(() => oldGain.disconnect(), 200);
        newsMasterGain = null;
    }
  }
};

export const playGuitarStrum = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const frequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];

    frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const delay = index * 0.05; 
        const startTime = now + delay;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(3000, startTime);
        filter.frequency.exponentialRampToValueAtTime(200, startTime + 2.0);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 3.1);
    });
};

export const playOvenDing = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1500, now);
  osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
  osc.frequency.exponentialRampToValueAtTime(500, now + 2.0);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 2.0);
};

export const playEatSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.1;
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let j = 0; j < bufferSize; j++) {
      data[j] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
  }
};

export const playDrinkSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  
  // Gulp sound (Sine sweep down)
  for(let i=0; i<3; i++) {
      const t = now + i * 0.3;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.linearRampToValueAtTime(200, t + 0.15);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.6, t + 0.05);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t+0.3);
  }
};

export const playFlushSound = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 3.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 3.0);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(800, now + 0.5);
    filter.frequency.linearRampToValueAtTime(100, now + 3.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
};

export const playChopSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 800;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
};

export const playSizzleSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  
  const bufferSize = ctx.sampleRate * 1.0;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.linearRampToValueAtTime(0, now + 1.0);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
};

export const playCoffeeSound = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    
    // Low rumble bubbling
    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
};

export const playHeavyBreathing = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;

    // Filtered pink noise for breathy sound
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pink noise approximation
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // compensate for gain
        b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    // Swell in and out
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.6);
    gain.gain.linearRampToValueAtTime(0, t + 1.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
};

export const playWhisper = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.5);
    gain.gain.linearRampToValueAtTime(0, t + 1.5);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.value = 1;
    
    // Pan randomly left/right/center to disorient
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime((Math.random() * 2) - 1, t);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    
    noise.start(t);
};

// --- KEYBOARD TYPING SOUND ---
export const playTypingSound = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;

    // Simulate mechanical key click (Short high burst)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000 + Math.random() * 500, t);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.05);
};

export const playUltimateJumpscare = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    
    // --- 1. SUB BASS IMPACT (The Boom) ---
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, t);
    subOsc.frequency.exponentialRampToValueAtTime(10, t + 0.5); // Drop fast
    
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(1.0, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.5);

    // --- 2. DISTORTED SCREECH (The Fear) ---
    // We create a Master Gain for the scream -> WaveShaper (Distortion) -> Destination
    const masterScreamGain = ctx.createGain();
    masterScreamGain.gain.setValueAtTime(1.0, t); // Max volume
    masterScreamGain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

    const distortion = ctx.createWaveShaper();
    // Create a harsh distortion curve
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i ) {
      const x = i * 2 / n_samples - 1;
      // Hard clipping curve
      curve[i] = ( 3 + 100 ) * x * 20 * deg / ( Math.PI + 100 * Math.abs(x) );
    }
    distortion.curve = curve;
    distortion.oversample = '4x';

    masterScreamGain.connect(distortion);
    distortion.connect(ctx.destination);

    // Source A: Sawtooth Dissonance
    const oscA = ctx.createOscillator();
    oscA.type = 'sawtooth';
    oscA.frequency.setValueAtTime(400, t);
    oscA.frequency.linearRampToValueAtTime(100, t + 1.0); // Pitch drop
    
    // Source B: Square wave screaming high
    const oscB = ctx.createOscillator();
    oscB.type = 'square';
    oscB.frequency.setValueAtTime(1500, t);
    oscB.frequency.exponentialRampToValueAtTime(500, t + 0.2); // Fast drop modulation

    // Add vibrato to oscB
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 30; // Fast Hz
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(oscB.frequency);
    lfo.start(t);
    lfo.stop(t+1);

    // Source C: White Noise Burst
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Connect sources to distortion chain
    oscA.connect(masterScreamGain);
    oscB.connect(masterScreamGain);
    noise.connect(masterScreamGain);

    oscA.start(t);
    oscA.stop(t + 1.2);
    oscB.start(t);
    oscB.stop(t + 1.2);
    noise.start(t);
};

// --- THE ULTIMATE DEMON SCREAM (For the Power Fix Event) ---
export const playNevoDemonScream = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;

    const masterGain = ctx.createGain();
    // EXTREME VOLUME BOOST
    masterGain.gain.setValueAtTime(8.0, t); 
    masterGain.gain.exponentialRampToValueAtTime(0.01, t + 3.0);
    
    // Extreme Distortion
    const distortion = ctx.createWaveShaper();
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i ) {
      const x = i * 2 / n_samples - 1;
      curve[i] = (Math.PI + 50) * x / (Math.PI + 50 * Math.abs(x));
    }
    distortion.curve = curve;
    masterGain.connect(distortion);
    distortion.connect(ctx.destination);

    // 1. SUB BASS EARTHQUAKE
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sawtooth'; // Aggressive bass
    subOsc.frequency.setValueAtTime(60, t);
    subOsc.frequency.exponentialRampToValueAtTime(10, t + 2.0); // Slow heavy drop
    subOsc.connect(masterGain);
    subOsc.start(t);
    subOsc.stop(t+3.0);

    // 2. DISCORDANT SCREAMS (Shepard Tone style rising terror)
    [300, 400, 500, 800, 1500, 2000].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(freq, t);
        // Crazy vibrato
        osc.frequency.linearRampToValueAtTime(freq * (Math.random() * 2 + 0.5), t + 0.5);
        osc.frequency.linearRampToValueAtTime(freq * 0.2, t + 2.0);
        osc.connect(masterGain);
        osc.start(t);
        osc.stop(t+3.0);
    });

    // 3. WHITE NOISE BLAST (The impact)
    const bufferSize = ctx.sampleRate * 3.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.connect(masterGain);
    noise.start(t);
};

// --- CUTSCENE AUDIO ---

export const playPhoneRing = (shouldPlay: boolean) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    if (shouldPlay) {
        if (ringInterval) return;

        // Old phone ring pattern (Brrr-Brrr... pause)
        const playRingPulse = () => {
             const t = ctx.currentTime;
             const osc1 = ctx.createOscillator();
             const osc2 = ctx.createOscillator(); // Modulation
             const gain = ctx.createGain();
             
             // Base tone
             osc1.type = 'square';
             osc1.frequency.setValueAtTime(440, t);
             
             // Ring modulation (Tremolo)
             osc2.type = 'sine';
             osc2.frequency.value = 20; 
             const modGain = ctx.createGain();
             modGain.gain.value = 100; 
             osc2.connect(modGain);
             
             gain.gain.setValueAtTime(0.1, t);
             gain.gain.linearRampToValueAtTime(0.1, t + 1.5);
             gain.gain.linearRampToValueAtTime(0, t + 1.6);
             
             osc1.connect(gain);
             gain.connect(ctx.destination);
             
             osc1.start(t);
             osc1.stop(t + 1.6);
             osc2.start(t);
             osc2.stop(t + 1.6);
        };

        playRingPulse();
        ringInterval = setInterval(playRingPulse, 3000);

    } else {
        if (ringInterval) {
            clearInterval(ringInterval);
            ringInterval = null;
        }
    }
};

export const playCarSequence = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;

    // 1. Door Close
    const doorBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const doorData = doorBuffer.getChannelData(0);
    for(let i=0; i<doorData.length; i++) doorData[i] = Math.random() * 2 - 1;
    
    const doorSrc = ctx.createBufferSource();
    doorSrc.buffer = doorBuffer;
    const doorGain = ctx.createGain();
    doorGain.gain.setValueAtTime(1, t);
    doorGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    const doorFilter = ctx.createBiquadFilter();
    doorFilter.type = 'lowpass';
    doorFilter.frequency.value = 200;
    
    doorSrc.connect(doorFilter);
    doorFilter.connect(doorGain);
    doorGain.connect(ctx.destination);
    doorSrc.start(t);

    // 2. Engine Start (Delay 0.5s)
    setTimeout(() => {
        const startT = ctx.currentTime;
        const engineOsc = ctx.createOscillator();
        engineOsc.type = 'sawtooth';
        engineOsc.frequency.setValueAtTime(50, startT);
        engineOsc.frequency.linearRampToValueAtTime(150, startT + 0.5); // Rev up
        engineOsc.frequency.exponentialRampToValueAtTime(80, startT + 1.5); // Idle

        const engGain = ctx.createGain();
        engGain.gain.setValueAtTime(0, startT);
        engGain.gain.linearRampToValueAtTime(0.3, startT + 0.2);
        
        // Drive away (Fade out + Pitch up Doppler)
        engGain.gain.linearRampToValueAtTime(0.3, startT + 2.0);
        engGain.gain.exponentialRampToValueAtTime(0.001, startT + 5.0); // Fade out distance

        engineOsc.connect(engGain);
        engGain.connect(ctx.destination);
        engineOsc.start(startT);
        engineOsc.stop(startT + 5.0);
    }, 500);
};
