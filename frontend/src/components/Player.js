import { useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX
} from 'lucide-react';
import usePlayerStore from '@/store/playerStore';
import { Visualizer } from '@/components/Visualizer';
import { Slider } from '@/components/ui/slider';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export const Player = () => {
  const {
    currentTrack, isPlaying, volume, currentTime, duration,
    togglePlay, nextTrack, prevTrack, setVolume, seekTo,
    getImageUrl, initAudioContext, analyser
  } = usePlayerStore();

  const hasInitRef = useRef(false);

  const handleInteraction = useCallback(() => {
    if (!hasInitRef.current) {
      initAudioContext();
      hasInitRef.current = true;
    }
  }, [initAudioContext]);

  useEffect(() => {
    const handler = () => handleInteraction();
    document.addEventListener('click', handler, { once: true });
    return () => document.removeEventListener('click', handler);
  }, [handleInteraction]);

  if (!currentTrack) return null;

  const imgUrl = getImageUrl(currentTrack);
  const artists = currentTrack.artists?.primary?.map(a => a.name).join(', ')
    || currentTrack.artist || 'Unknown Artist';

  return (
    <div
      data-testid="audio-player"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl backdrop-blur-2xl bg-black/70 border border-white/8 shadow-2xl"
    >
      {/* Visualizer behind player */}
      {analyser && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30 pointer-events-none">
          <Visualizer analyser={analyser} />
        </div>
      )}

      <div className="relative flex items-center gap-4 px-4 py-3 sm:px-6">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-64">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
            <img
              src={imgUrl}
              alt={currentTrack.name || 'Album art'}
              className={`w-full h-full object-cover ${isPlaying ? 'vinyl-spin' : 'vinyl-spin paused'}`}
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p
              data-testid="player-track-name"
              className="text-sm font-medium text-white truncate"
              dangerouslySetInnerHTML={{ __html: currentTrack.name || 'Unknown' }}
            />
            <p className="text-xs text-white/50 truncate">{artists}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1 gap-1 max-w-md">
          <div className="flex items-center gap-3">
            <button
              data-testid="prev-track-btn"
              onClick={prevTrack}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              data-testid="play-pause-btn"
              onClick={() => { handleInteraction(); togglePlay(); }}
              className="p-3 rounded-full bg-white text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              {isPlaying ? <Pause className="w-5 h-5" fill="black" /> : <Play className="w-5 h-5" fill="black" />}
            </button>
            <button
              data-testid="next-track-btn"
              onClick={nextTrack}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 w-full">
            <span className="font-mono-ts text-white/40 w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              data-testid="progress-slider"
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={(v) => seekTo(v[0])}
              className="flex-1 [&_[data-radix-slider-track]]:h-1 [&_[data-radix-slider-track]]:bg-white/10 [&_[data-radix-slider-range]]:bg-gradient-to-r [&_[data-radix-slider-range]]:from-cyan-400 [&_[data-radix-slider-range]]:to-violet-500 [&_[data-radix-slider-thumb]]:w-3 [&_[data-radix-slider-thumb]]:h-3 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-0 [&_[data-radix-slider-thumb]]:opacity-0 hover:[&_[data-radix-slider-thumb]]:opacity-100"
            />
            <span className="font-mono-ts text-white/40 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2 w-32">
          <button
            data-testid="volume-btn"
            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" strokeWidth={1.5} /> : <Volume2 className="w-4 h-4" strokeWidth={1.5} />}
          </button>
          <Slider
            data-testid="volume-slider"
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0] / 100)}
            className="flex-1 [&_[data-radix-slider-track]]:h-1 [&_[data-radix-slider-track]]:bg-white/10 [&_[data-radix-slider-range]]:bg-white/60 [&_[data-radix-slider-thumb]]:w-2.5 [&_[data-radix-slider-thumb]]:h-2.5 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-0"
          />
        </div>
      </div>
    </div>
  );
};
