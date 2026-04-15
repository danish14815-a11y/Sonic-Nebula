import { Play, Pause, Clock } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';

const formatDuration = (s) => {
  if (!s) return '--:--';
  const sec = parseInt(s, 10);
  const m = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
};

export const TrackList = ({ tracks, showIndex = true }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  if (!tracks || tracks.length === 0) {
    return <p className="text-white/30 text-sm py-8 text-center">No tracks found</p>;
  }

  return (
    <div data-testid="track-list" className="stagger-in">
      {/* Header */}
      {showIndex && (
        <div className="flex items-center gap-4 px-3 py-2 text-xs text-white/30 uppercase tracking-wider border-b border-white/5 mb-2">
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Title</span>
          <Clock className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
        </div>
      )}

      {tracks.map((track, i) => {
        const isActive = currentTrack?.id === track.id;
        const artists = track.artists?.primary?.map(a => a.name).join(', ')
          || track.artist || '';
        const img = track.image;
        const imgUrl = Array.isArray(img) ? (img.find(x => x.quality === '150x150') || img[0])?.url : '';

        return (
          <div
            key={track.id || i}
            data-testid={`track-row-${i}`}
            className={`track-row flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer group ${isActive ? 'is-active' : ''}`}
            onClick={() => {
              if (isActive) {
                togglePlay();
              } else {
                playTrack(track, tracks);
              }
            }}
          >
            {/* Index / Play icon */}
            {showIndex && (
              <span className="w-8 text-center shrink-0">
                <span className={`group-hover:hidden font-mono-ts ${isActive ? 'text-violet-400' : 'text-white/30'}`}>
                  {i + 1}
                </span>
                <span className="hidden group-hover:inline text-white">
                  {isActive && isPlaying
                    ? <Pause className="w-3.5 h-3.5 inline" fill="white" />
                    : <Play className="w-3.5 h-3.5 inline" fill="white" />
                  }
                </span>
              </span>
            )}

            {/* Image */}
            {imgUrl && (
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5">
                <img src={imgUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${isActive ? 'text-violet-400' : 'text-white'}`}
                dangerouslySetInnerHTML={{ __html: track.name || 'Unknown' }}
              />
              <p className="text-xs text-white/40 truncate">{artists}</p>
            </div>

            {/* Duration */}
            <span className="font-mono-ts text-white/30 shrink-0">
              {formatDuration(track.duration)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
