import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylist } from '@/services/api';
import { TrackList } from '@/components/TrackList';
import { Skeleton } from '@/components/ui/skeleton';
import { ListMusic, Clock, Music } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1759771963975-8a4885bc6f1f?w=300&h=300&fit=crop';

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPlaylist(id);
        if (data?.data) setPlaylist(data.data);
      } catch (e) {
        console.error('Playlist fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row gap-8">
          <Skeleton className="w-64 h-64 rounded-2xl bg-white/5 shrink-0" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-10 w-72 bg-white/5" />
            <Skeleton className="h-5 w-48 bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
        <p className="text-white/40 text-lg">Playlist not found</p>
      </div>
    );
  }

  const imgs = playlist.image;
  const imgUrl = Array.isArray(imgs) ? (imgs.find(i => i.quality === '500x500') || imgs[imgs.length - 1])?.url : FALLBACK_IMG;
  const tracks = playlist.songs || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) playTrack(tracks[0], tracks);
  };

  return (
    <div data-testid="playlist-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shrink-0 border border-white/8 shadow-2xl shadow-cyan-500/10">
          <img
            src={imgUrl || FALLBACK_IMG}
            alt={playlist.name || 'Playlist'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            <ListMusic className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
            <span className="text-xs text-cyan-400 uppercase tracking-wider font-medium">Playlist</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: 'Outfit' }}
            data-testid="playlist-title"
            dangerouslySetInnerHTML={{ __html: playlist.name || 'Unknown' }}
          />
          {playlist.description && (
            <p className="text-white/40 text-sm mb-4 max-w-lg" dangerouslySetInnerHTML={{ __html: playlist.description }} />
          )}
          <div className="flex items-center gap-4 text-sm text-white/30">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" strokeWidth={1.5} /> {tracks.length} tracks
            </span>
          </div>
          <button
            data-testid="playlist-play-all-btn"
            onClick={handlePlayAll}
            className="mt-6 px-8 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-[0_0_24px_rgba(6,182,212,0.3)] hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] transition-colors w-fit"
          >
            Play All
          </button>
        </div>
      </div>

      {/* Tracks */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <TrackList tracks={tracks} />
      </div>
    </div>
  );
}
