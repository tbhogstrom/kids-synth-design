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

// Add new bass pads at the beginning
const BASS_PADS = [
  // Bass notes (lower octave)
  { note: 'C3', frequency: 65.41, color: 'bg-cyan-600' },
  { note: 'D3', frequency: 73.42, color: 'bg-teal-600' },
  { note: 'E3', frequency: 82.41, color: 'bg-green-600' },
  { note: 'G3', frequency: 98.00, color: 'bg-emerald-600' },
  { note: 'A3', frequency: 110.00, color: 'bg-lime-600' },
  { note: 'C2', frequency: 130.81, color: 'bg-cyan-700' },
  
  // Add some simple drum pads
  { note: 'Kick', frequency: 100, color: 'bg-red-600', isDrum: true },
  { note: 'Snare', frequency: 200, color: 'bg-rose-600', isDrum: true },
];

// Keep the original PADS array as MELODY_PADS
const MELODY_PADS = [
  // Chord pads (top row)
  { note: 'C', frequency: 261.63, color: 'bg-blue-500' },
  { note: 'F', frequency: 349.23, color: 'bg-indigo-500' },
  { note: 'G', frequency: 392.00, color: 'bg-violet-500' },
  { note: 'Am', frequency: 440.00, color: 'bg-purple-500' },

  // Middle notes (rows 2-3)
  { note: 'C4', frequency: 261.63, color: 'bg-cyan-500' },
  { note: 'D4', frequency: 293.66, color: 'bg-teal-500' },
  { note: 'E4', frequency: 329.63, color: 'bg-green-500' },
  { note: 'G4', frequency: 392.00, color: 'bg-emerald-500' },
  { note: 'A4', frequency: 440.00, color: 'bg-lime-500' },
  { note: 'C5', frequency: 523.25, color: 'bg-yellow-500' },
  { note: 'D5', frequency: 587.33, color: 'bg-amber-500' },
  { note: 'E5', frequency: 659.25, color: 'bg-orange-500' },

  // Drum pads (bottom row)
  { note: 'Kick', frequency: 100, color: 'bg-red-500', isDrum: true },
  { note: 'Snare', frequency: 200, color: 'bg-rose-500', isDrum: true },
  { note: 'Hat', frequency: 300, color: 'bg-pink-500', isDrum: true },
  { note: 'Clap', frequency: 400, color: 'bg-fuchsia-500', isDrum: true },
];

interface RecordedNote {
  padIndex: number;
  timestamp: number;
  bar: number;
}

// Ocean Friends sequence - a playful melody about sea creatures
const MELODY_SEQUENCE: Record<number, RecordedNote[]> = {
  // Verse 1: "Swimming in the sea" theme
  0: [
    { padIndex: 4, timestamp: 0, bar: 0 },    // C4
    { padIndex: 4, timestamp: 1000, bar: 0 }, // C4
  ],
  1: [
    { padIndex: 6, timestamp: 0, bar: 1 },    // E4
    { padIndex: 7, timestamp: 1000, bar: 1 }, // G4
  ],
  2: [
    { padIndex: 7, timestamp: 0, bar: 2 },    // G4
    { padIndex: 6, timestamp: 1000, bar: 2 }, // E4
  ],
  3: [
    { padIndex: 4, timestamp: 0, bar: 3 },    // C4
    { padIndex: 4, timestamp: 1500, bar: 3 }, // C4
  ],
  // Verse 2: "Playing with friends" theme
  4: [
    { padIndex: 7, timestamp: 0, bar: 4 },    // G4
    { padIndex: 7, timestamp: 1000, bar: 4 }, // G4
  ],
  5: [
    { padIndex: 8, timestamp: 0, bar: 5 },    // A4
    { padIndex: 7, timestamp: 1000, bar: 5 }, // G4
  ],
  6: [
    { padIndex: 6, timestamp: 0, bar: 6 },    // E4
    { padIndex: 6, timestamp: 1000, bar: 6 }, // E4
  ],
  7: [
    { padIndex: 4, timestamp: 0, bar: 7 },    // C4
  ],
  // Bridge: "Jumping waves" theme
  8: [
    { padIndex: 6, timestamp: 0, bar: 8 },    // E4
    { padIndex: 7, timestamp: 500, bar: 8 },  // G4
    { padIndex: 8, timestamp: 1000, bar: 8 }, // A4
  ],
  9: [
    { padIndex: 7, timestamp: 0, bar: 9 },    // G4
    { padIndex: 6, timestamp: 1000, bar: 9 }, // E4
  ],
  10: [
    { padIndex: 6, timestamp: 0, bar: 10 },   // E4
    { padIndex: 4, timestamp: 1000, bar: 10 }, // C4
  ],
  11: [
    { padIndex: 4, timestamp: 0, bar: 11 },   // C4
  ],
  // Ending: "Happy ending" theme
  12: [
    { padIndex: 4, timestamp: 0, bar: 12 },   // C4
    { padIndex: 6, timestamp: 500, bar: 12 }, // E4
  ],
  13: [
    { padIndex: 7, timestamp: 0, bar: 13 },   // G4
    { padIndex: 8, timestamp: 500, bar: 13 }, // A4
  ],
  14: [
    { padIndex: 7, timestamp: 0, bar: 14 },   // G4
    { padIndex: 6, timestamp: 500, bar: 14 }, // E4
  ],
  15: [
    { padIndex: 4, timestamp: 0, bar: 15 },   // C4
  ],
};

const BASS_SEQUENCE: Record<number, RecordedNote[]> = {
  // Verse 1: Simple I-V pattern
  0: [ 
    { padIndex: 0, timestamp: 0, bar: 0 },    // C2
    { padIndex: 0, timestamp: 1000, bar: 0 }, // C2
  ],
  1: [
    { padIndex: 3, timestamp: 0, bar: 1 },    // G2
    { padIndex: 3, timestamp: 1000, bar: 1 }, // G2
  ],
  2: [
    { padIndex: 0, timestamp: 0, bar: 2 },    // C2
    { padIndex: 0, timestamp: 1000, bar: 2 }, // C2
  ],
  3: [
    { padIndex: 3, timestamp: 0, bar: 3 },    // G2
    { padIndex: 3, timestamp: 1000, bar: 3 }, // G2
  ],
  // Verse 2: I-IV-V pattern
  4: [
    { padIndex: 0, timestamp: 0, bar: 4 },    // C2
    { padIndex: 0, timestamp: 1000, bar: 4 }, // C2
  ],
  5: [
    { padIndex: 2, timestamp: 0, bar: 5 },    // F2
    { padIndex: 2, timestamp: 1000, bar: 5 }, // F2
  ],
  6: [
    { padIndex: 3, timestamp: 0, bar: 6 },    // G2
    { padIndex: 3, timestamp: 1000, bar: 6 }, // G2
  ],
  7: [
    { padIndex: 0, timestamp: 0, bar: 7 },    // C2
  ],
  // Bridge: Walking bass line
  8: [
    { padIndex: 0, timestamp: 0, bar: 8 },    // C2
    { padIndex: 1, timestamp: 500, bar: 8 },  // D2
    { padIndex: 2, timestamp: 1000, bar: 8 }, // E2
    { padIndex: 3, timestamp: 1500, bar: 8 }, // G2
  ],
  9: [
    { padIndex: 3, timestamp: 0, bar: 9 },    // G2
    { padIndex: 3, timestamp: 1000, bar: 9 }, // G2
  ],
  10: [
    { padIndex: 2, timestamp: 0, bar: 10 },   // F2
    { padIndex: 2, timestamp: 1000, bar: 10 }, // F2
  ],
  11: [
    { padIndex: 0, timestamp: 0, bar: 11 },   // C2
  ],
  // Ending: Resolving pattern
  12: [
    { padIndex: 0, timestamp: 0, bar: 12 },   // C2
    { padIndex: 3, timestamp: 1000, bar: 12 }, // G2
  ],
  13: [
    { padIndex: 2, timestamp: 0, bar: 13 },   // F2
    { padIndex: 3, timestamp: 1000, bar: 13 }, // G2
  ],
  14: [
    { padIndex: 0, timestamp: 0, bar: 14 },   // C2
    { padIndex: 3, timestamp: 1000, bar: 14 }, // G2
  ],
  15: [
    { padIndex: 0, timestamp: 0, bar: 15 },   // C2
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
  const [sequences, setSequences] = useState<Record<number, RecordedNote[]>>(BASS_SEQUENCE);
  const [metronomeInterval, setMetronomeInterval] = useState<number | null>(null);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [showBassPads, setShowBassPads] = useState(true);
  const [isCountingIn, setIsCountingIn] = useState(false);

  // Initialize recordedBars with our pre-made sequence
  useEffect(() => {
    setRecordedBars(prev => {
      const newBars = [...prev];
      Object.keys(BASS_SEQUENCE).forEach(bar => {
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
    const sequence = sequences[bar];
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
        setIsPlaying(prev => !prev);
        break;
      case 'record':
        if (!isRecording && !isPlaying) {
          // Start count-in when recording is initiated
          setIsCountingIn(true);
          let count = 0;
          const countInInterval = setInterval(() => {
            if (count < 3) {
              const { osc, gain } = createMetronomeClick(false);
              osc.start();
              setTimeout(() => {
                osc.stop();
                gain.disconnect();
              }, 100);
              count++;
            } else {
              clearInterval(countInInterval);
              setIsCountingIn(false);
              setIsRecording(true);
              setIsPlaying(true);
            }
          }, (60000 / bpm));
        } else {
          setIsRecording(false);
        }
        break;
      case 'loop':
        setIsLooping(prev => !prev);
        break;
    }
  }, [isPlaying, isRecording, bpm]);

  const togglePads = useCallback(() => {
    setShowBassPads(prev => !prev);
  }, []);

  // Add these handler functions (lines 253-268)
  const handleReset = useCallback(() => {
    setSequences({});
    setRecordedBars(new Array(16).fill(0));
    setCurrentBar(0);
  }, []);

  const handleLoadOceanFriends = useCallback(() => {
    if (showBassPads) {
      setSequences(BASS_SEQUENCE);
    } else {
      setSequences(MELODY_SEQUENCE);
    }
    setRecordedBars(prev => {
      const newBars = new Array(16).fill(0);
      Object.keys(showBassPads ? BASS_SEQUENCE : MELODY_SEQUENCE).forEach(bar => {
        newBars[parseInt(bar)] = 1;
      });
      return newBars;
    });
  }, [showBassPads]);

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
          <div className="flex justify-center gap-2 mb-4">
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={handleLoadOceanFriends}
              className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
            >
              Load Ocean Friends
            </button>
            <button 
              onClick={togglePads}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
            >
              {showBassPads ? 'Show Melody' : 'Show Bass'}
            </button>
          </div>

          <div className="text-center mb-4">
            <p className="text-white text-sm">
              {isCountingIn ? 
                'Get ready...' : 
                isRecording ? 
                  selectedBar !== null ? 
                    `Recording bar ${selectedBar + 1}...` : 
                    'Click a bar to record' : 
                  'Press Play to hear the sequence!'}
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
            {(showBassPads ? BASS_PADS : MELODY_PADS).map((pad, index) => (
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