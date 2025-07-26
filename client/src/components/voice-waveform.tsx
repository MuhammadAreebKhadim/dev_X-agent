interface VoiceWaveformProps {
  isActive: boolean;
}

export default function VoiceWaveform({ isActive }: VoiceWaveformProps) {
  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {[4, 6, 8, 6, 4].map((height, index) => (
        <div
          key={index}
          className={`w-1 bg-blue-400 wave-bar ${isActive ? '' : 'opacity-30'}`}
          style={{ height: `${height * 4}px` }}
        />
      ))}
    </div>
  );
}
