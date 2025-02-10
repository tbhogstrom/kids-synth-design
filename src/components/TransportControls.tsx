import React from 'react';
import { Play, Pause, SwordIcon as Record, Square, Repeat } from 'lucide-react';

interface TransportControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  onPlayPause: () => void;
  onRecord: () => void;
  onLoop: () => void;
}

export const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  isRecording,
  isLooping,
  onPlayPause,
  onRecord,
  onLoop,
}) => {
  return (
    <div className="flex gap-4 justify-center my-4">
      <button
        onClick={onPlayPause}
        className="p-3 bg-blue-500 rounded-full hover:bg-blue-600 text-white"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <button
        onClick={onRecord}
        className={`p-3 rounded-full hover:bg-red-600 text-white ${
          isRecording ? 'bg-red-600' : 'bg-red-500'
        }`}
      >
        <Record size={24} />
      </button>
      <button
        onClick={onLoop}
        className={`p-3 rounded-full hover:bg-purple-600 text-white ${
          isLooping ? 'bg-purple-600' : 'bg-purple-500'
        }`}
      >
        <Repeat size={24} />
      </button>
    </div>
  );
};