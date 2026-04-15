import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlbum } from '@/services/api';
import { TrackList } from '@/components/TrackList';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Disc3 } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1759771963975-8a4885bc6f1f?w=300&h=300&fit=crop';

export default function AlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAlbum(id);
        if (data?.data) setAlbum(data.data);
      } catch (e) {
        console.error('Album fetch error:', e);
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
            <Skeleton className="h-5 w-32 bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
        <p className="text-white/40 text-lg">Album not found</p>
      </div>
    );
  }

  const imgs = album.image;
  const imgUrl = Array.isArray(imgs) ? (imgs.find(i => i.quality === '500x500') || imgs[imgs.length - 1])?.url : FALLBACK_IMG;
  const tracks = album.songs || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) playTrack(tracks[0], tracks);
  };

  return (
    <div data-testid="album-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Album art */}
        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shrink-0 border border-white/8 shadow-2xl shadow-violet-500/10">
          <img
            src={imgUrl || FALLBACK_IMG}
            alt={album.name || 'Album'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            <Disc3 className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
            <span className="text-xs text-violet-400 uppercase tracking-wider font-medium">Album</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: 'Outfit' }}
            data-testid="album-title"
            dangerouslySetInnerHTML={{ __html: album.name || 'Unknown' }}
          />
          <p className="text-white/50 mb-4">
            {album.artists?.primary?.map((a, i) => (
              <span key={a.id || i}>
                {i > 0 && ', '}
                <Link to={`/artist/${a.id}`} className="hover:text-violet-400 transition-colors">{a.name}</Link>
              </span>
            )) || album.artist || ''}
          </p>
          <div className="flex items-center gap-4 text-sm text-white/30">
            {album.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} /> {album.year}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> {tracks.length} tracks
            </span>
          </div>
          <button
            data-testid="play-all-btn"
            onClick={handlePlayAll}
            className="mt-6 px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-[0_0_24px_rgba(124,58,237,0.3)] hover:shadow-[0_0_32px_rgba(124,58,237,0.5)] transition-colors w-fit"
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
