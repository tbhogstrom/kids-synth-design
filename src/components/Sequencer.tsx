import React from 'react';
import { Play, Square } from 'lucide-react';

interface SequencerProps {
  currentBar: number;
  isPlaying: boolean;
  isRecording: boolean;
  bars: number[];
  onBarClick: (bar: number) => void;
  bpm: number;
  sequences?: Record<number, { padIndex: number }[]>;
  pads?: { color: string }[];
}

export const Sequencer: React.FC<SequencerProps> = ({
  currentBar,
  isPlaying,
  isRecording,
  bars,
  onBarClick,
  bpm,
  sequences = {},
  pads = [],
}) => {
  const getBarColor = (barIndex: number) => {
    if (sequences[barIndex % 4]?.[0]) {
      return pads[sequences[barIndex % 4][0].padIndex]?.color || 'bg-gray-700';
    }
    return 'bg-gray-700';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm">BPM: {bpm}</span>
        <span className="text-white text-sm">
          Bar: {currentBar + 1} / 16
        </span>
      </div>
      
      <div className="grid grid-cols-8 gap-2 mb-2">
        {Array.from({ length: 16 }).map((_, index) => (
          <button
            key={index}
            onClick={() => onBarClick(index)}
            className={`
              h-16 rounded-lg border-2 transition-all duration-150
              ${currentBar === index ? 'border-yellow-400' : 'border-gray-600'}
              ${bars[index] ? getBarColor(index) : 'bg-gray-700'}
              ${isRecording && currentBar === index ? 'bg-red-500' : ''}
              hover:border-yellow-400
            `}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-white text-xs mb-1">{index + 1}</span>
              {bars[index] ? (
                <Play size={16} className="text-white" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};