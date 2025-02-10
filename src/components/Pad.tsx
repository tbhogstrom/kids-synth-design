import React from 'react';
import { createOscillator, createDrumSound } from '../lib/audioContext';

interface PadProps {
  note: string;
  frequency: number;
  color: string;
  type?: OscillatorType;
  isDrum?: boolean;
  onPress?: () => void;
}

export const Pad: React.FC<PadProps> = ({
  note,
  frequency,
  color,
  type = 'sine',
  isDrum = false,
  onPress,
}) => {
  const handlePress = () => {
    if (isDrum) {
      const { osc, gain } = createDrumSound(frequency);
      osc.start();
      setTimeout(() => {
        osc.stop();
        gain.disconnect();
      }, 100);
    } else {
      const { osc, gain } = createOscillator(frequency, type);
      osc.start();
      setTimeout(() => {
        osc.stop();
        gain.disconnect();
      }, 500);
    }
    onPress?.();
  };

  return (
    <button
      className={`${color} w-full h-24 rounded-xl shadow-lg transform active:scale-95 transition-transform duration-100 font-bold text-white`}
      onMouseDown={handlePress}
      onTouchStart={(e) => {
        e.preventDefault();
        handlePress();
      }}
    >
      {note}
    </button>
  );
};