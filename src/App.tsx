import React, { useState, useCallback, useEffect } from 'react';
import { Pad } from './components/Pad';
import { TransportControls } from './components/TransportControls';
import { Sequencer } from './components/Sequencer';
import { Music } from 'lucide-react';
import { createOscillator, createDrumSound, createMetronomeClick } from './lib/audioContext';

// Define notes and frequencies
const PADS = [
  // Top row - Chords
  { note: 'C', frequency: 261.63, color: 'bg-pink-500' },
  { note: 'F', frequency: 349.23, color: 'bg-purple-500' },
  { note: 'G', frequency: 392.00, color: 'bg-indigo-500' },
  { note: 'Am', frequency: 440.00, color: 'bg-blue-500' },
  
  // Middle rows - Pentatonic scale
  { note: 'C4', frequency: 261.63, color: 'bg-cyan-500' },
  { note: 'D4', frequency: 293.66, color: 'bg-teal-500' },
  { note: 'E4', frequency: 329.63, color: 'bg-green-500' },
  { note: 'G4', frequency: 392.00, color: 'bg-emerald-500' },
  
  { note: 'A4', frequency: 440.00, color: 'bg-lime-500' },
  { note: 'C5', frequency: 523.25, color: 'bg-yellow-500' },
  { note: 'D5', frequency: 587.33, color: 'bg-amber-500' },
  { note: 'E5', frequency: 659.25, color: 'bg-orange-500' },
  
  // Bottom row - Drums and controls
  { note: 'Kick', frequency: 100, color: 'bg-red-500', isDrum: true },
  { note: 'Snare', frequency: 200, color: 'bg-rose-500', isDrum: true },
  { note: 'Hat', frequency: 1000, color: 'bg-pink-600', isDrum: true },
  { note: 'Clap', frequency: 300, color: 'bg-fuchsia-500', isDrum: true },
];

interface RecordedNote {
  padIndex: number;
  timestamp: number;
  bar: number;
}

// Pre-made pop song sequence (2-5-1 progression with basic beat)
const POP_SEQUENCE: Record<number, RecordedNote[]> = {
  // Bar 1: Dm (ii) with basic beat
  0: [
    { padIndex: 1, timestamp: 0, bar: 0 }, // F chord
    { padIndex: 12, timestamp: 0, bar: 0 }, // Kick
    { padIndex: 13, timestamp: 500, bar: 0 }, // Snare
    { padIndex: 14, timestamp: 250, bar: 0 }, // Hat
    { padIndex: 14, timestamp: 750, bar: 0 }, // Hat
  ],
  // Bar 2: G7 (V7)
  1: [
    { padIndex: 2, timestamp: 0, bar: 1 }, // G chord
    { padIndex: 12, timestamp: 0, bar: 1 }, // Kick
    { padIndex: 13, timestamp: 500, bar: 1 }, // Snare
    { padIndex: 14, timestamp: 250, bar: 1 }, // Hat
    { padIndex: 14, timestamp: 750, bar: 1 }, // Hat
  ],
  // Bar 3: C (I)
  2: [
    { padIndex: 0, timestamp: 0, bar: 2 }, // C chord
    { padIndex: 12, timestamp: 0, bar: 2 }, // Kick
    { padIndex: 13, timestamp: 500, bar: 2 }, // Snare
    { padIndex: 14, timestamp: 250, bar: 2 }, // Hat
    { padIndex: 14, timestamp: 750, bar: 2 }, // Hat
  ],
  // Bar 4: C (I) with fill
  3: [
    { padIndex: 0, timestamp: 0, bar: 3 }, // C chord
    { padIndex: 12, timestamp: 0, bar: 3 }, // Kick
    { padIndex: 13, timestamp: 250, bar: 3 }, // Snare
    { padIndex: 13, timestamp: 500, bar: 3 }, // Snare
    { padIndex: 13, timestamp: 750, bar: 3 }, // Snare
  ],
};

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(true); // Start with looping enabled
  const [volume, setVolume] = useState(75);
  const [bpm, setBpm] = useState(100); // Slower tempo for easier listening
  const [currentBar, setCurrentBar] = useState(0);
  const [recordedBars, setRecordedBars] = useState<number[]>(new Array(16).fill(0));
  const [sequences, setSequences] = useState<Record<number, RecordedNote[]>>(POP_SEQUENCE);
  const [metronomeInterval, setMetronomeInterval] = useState<number | null>(null);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  // Initialize recordedBars with our pre-made sequence
  useEffect(() => {
    setRecordedBars(prev => {
      const newBars = [...prev];
      Object.keys(POP_SEQUENCE).forEach(bar => {
        newBars[parseInt(bar)] = 1;
      });
      return newBars;
    });
  }, []);

  const barDuration = (60 / bpm) * 4 * 1000;

  const startMetronome = useCallback(() => {
    if (metronomeInterval) return;

    let tick = 0;
    const interval = window.setInterval(() => {
      const isBarStart = tick % 4 === 0;
      const { osc, gain } = createMetronomeClick(isBarStart);
      osc.start();
      setTimeout(() => {
        osc.stop();
        gain.disconnect();
      }, 50);

      if (isBarStart) {
        setCurrentBar(prev => (prev + 1) % (isLooping ? 4 : 16)); // Only loop first 4 bars
      }

      tick = (tick + 1) % 16;
    }, barDuration / 4);

    setMetronomeInterval(interval);
  }, [barDuration, metronomeInterval, isLooping]);

  const stopMetronome = useCallback(() => {
    if (metronomeInterval) {
      clearInterval(metronomeInterval);
      setMetronomeInterval(null);
    }
    setCurrentBar(0);
  }, [metronomeInterval]);

  const handleBarClick = useCallback((bar: number) => {
    if (isPlaying) return;
    
    setSelectedBar(bar);
    setCurrentBar(bar);
    
    if (isRecording) {
      setSequences(prev => ({
        ...prev,
        [bar]: []
      }));
      setRecordedBars(prev => {
        const newBars = [...prev];
        newBars[bar] = 1;
        return newBars;
      });
    }
  }, [isPlaying, isRecording]);

  const handlePadPress = useCallback((padIndex: number) => {
    if (isRecording && selectedBar !== null) {
      setSequences(prev => ({
        ...prev,
        [selectedBar]: [
          ...(prev[selectedBar] || []),
          {
            padIndex,
            timestamp: Date.now(),
            bar: selectedBar
          }
        ]
      }));
    }
  }, [isRecording, selectedBar]);

  const playBar = useCallback((bar: number) => {
    const sequence = sequences[bar % 4]; // Use modulo to repeat the 4-bar pattern
    if (!sequence) return;

    sequence.forEach(note => {
      const pad = PADS[note.padIndex];
      if (pad.isDrum) {
        const { osc, gain } = createDrumSound(pad.frequency);
        osc.start();
        setTimeout(() => {
          osc.stop();
          gain.disconnect();
        }, 100);
      } else {
        const { osc, gain } = createOscillator(pad.frequency);
        osc.start();
        setTimeout(() => {
          osc.stop();
          gain.disconnect();
        }, 500);
      }
    });
  }, [sequences]);

  useEffect(() => {
    if (isPlaying) {
      playBar(currentBar);
    }
  }, [currentBar, isPlaying, playBar]);

  useEffect(() => {
    if (isPlaying) {
      startMetronome();
    } else {
      stopMetronome();
    }
    return () => stopMetronome();
  }, [isPlaying, startMetronome, stopMetronome]);

  const handleTransportAction = useCallback((action: 'play' | 'record' | 'loop') => {
    switch (action) {
      case 'play':
        setIsPlaying(!isPlaying);
        break;
      case 'record':
        setIsRecording(!isRecording);
        break;
      case 'loop':
        setIsLooping(!isLooping);
        break;
    }
  }, [isPlaying, isRecording]);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Music className="text-white" size={32} />
          <h1 className="text-3xl font-bold text-white text-center">
            KidSynth Pad
          </h1>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-4">
            <p className="text-white text-sm">
              {isRecording ? 
                selectedBar !== null ? 
                  `Recording bar ${selectedBar + 1}...` : 
                  'Click a bar to record' : 
                'Press Play to hear the pop song pattern!'}
            </p>
          </div>

          <Sequencer
            currentBar={currentBar}
            isPlaying={isPlaying}
            isRecording={isRecording}
            bars={recordedBars}
            onBarClick={handleBarClick}
            bpm={bpm}
            sequences={sequences}
            pads={PADS}
          />

          <TransportControls
            isPlaying={isPlaying}
            isRecording={isRecording}
            isLooping={isLooping}
            onPlayPause={() => handleTransportAction('play')}
            onRecord={() => handleTransportAction('record')}
            onLoop={() => handleTransportAction('loop')}
          />

          <div className="grid grid-cols-4 gap-4 mb-6">
            {PADS.map((pad, index) => (
              <Pad
                key={index}
                note={pad.note}
                frequency={pad.frequency}
                color={pad.color}
                isDrum={pad.isDrum}
                onPress={() => handlePadPress(index)}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white">Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white w-8">{volume}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;