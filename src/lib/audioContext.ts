// Singleton AudioContext for the application
let audioContextInstance: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioContextInstance) {
    audioContextInstance = new AudioContext();
  }
  return audioContextInstance;
};

// Create oscillator with envelope
export const createOscillator = (
  frequency: number,
  type: OscillatorType = 'sine',
  duration = 0.5
) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.value = frequency;
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  return { osc, gain };
};

// Create drum sound
export const createDrumSound = (frequency: number, decay = 0.1) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1, ctx.currentTime + decay);
  
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + decay);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  return { osc, gain };
};

// Create metronome click
export const createMetronomeClick = (isAccent = false) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.value = isAccent ? 1000 : 800;
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(isAccent ? 0.3 : 0.2, ctx.currentTime + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  return { osc, gain };
};