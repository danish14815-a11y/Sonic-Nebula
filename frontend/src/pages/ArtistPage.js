import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArtist, getArtistSongs, getArtistAlbums } from '@/services/api';
import { TrackList } from '@/components/TrackList';
import { AlbumCard } from '@/components/Cards';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Music, Disc } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';
import { decodeHtmlEntities } from '@/lib/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1759771963975-8a4885bc6f1f?w=300&h=300&fit=crop';

export default function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistRes, songsRes, albumsRes] = await Promise.allSettled([
          getArtist(id),
          getArtistSongs(id),
          getArtistAlbums(id),
        ]);

        if (artistRes.status === 'fulfilled' && artistRes.value?.data) {
          setArtist(artistRes.value.data);
        }
        if (songsRes.status === 'fulfilled' && songsRes.value?.data?.songs) {
          setTopSongs(songsRes.value.data.songs);
        }
        if (albumsRes.status === 'fulfilled' && albumsRes.value?.data?.albums) {
          setArtistAlbums(albumsRes.value.data.albums);
        }
      } catch (e) {
        console.error('Artist fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col items-center gap-6 mb-12">
          <Skeleton className="w-48 h-48 rounded-full bg-white/5" />
          <Skeleton className="h-10 w-56 bg-white/5" />
          <Skeleton className="h-5 w-32 bg-white/5" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
        <p className="text-white/40 text-lg">Artist not found</p>
      </div>
    );
  }

  const imgs = artist.image;
  const imgUrl = Array.isArray(imgs) ? (imgs.find(i => i.quality === '500x500') || imgs[imgs.length - 1])?.url : FALLBACK_IMG;

  const formatFollowers = (n) => {
    if (!n) return '';
    const num = parseInt(n, 10);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M followers`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K followers`;
    return `${num} followers`;
  };

  return (
    <div data-testid="artist-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Artist header */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-8 sm:p-12 mb-12">
        {/* Bg blur */}
        <div className="absolute inset-0 z-0">
          <img src={imgUrl} alt="" className="w-full h-full object-cover opacity-15 blur-2xl scale-125" loading="lazy" />
          <div className="absolute inset-0 bg-[#020204]/70" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-2 border-violet-500/30 shadow-2xl shadow-violet-500/20 shrink-0">
            <img
              src={imgUrl || FALLBACK_IMG}
              alt={artist.name || 'Artist'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
              <span className="text-xs text-cyan-400 uppercase tracking-wider font-medium">Artist</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2"
              style={{ fontFamily: 'Outfit' }}
              data-testid="artist-name"
            >
              {decodeHtmlEntities(artist.name) || 'Unknown'}
            </h1>
            {artist.followerCount && (
              <p className="text-white/40 text-sm">{formatFollowers(artist.followerCount)}</p>
            )}
            {topSongs.length > 0 && (
              <button
                data-testid="play-top-songs-btn"
                onClick={() => playTrack(topSongs[0], topSongs)}
                className="mt-4 px-8 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-[0_0_24px_rgba(124,58,237,0.3)] hover:shadow-[0_0_32px_rgba(124,58,237,0.5)] transition-colors"
              >
                Play Top Songs
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Songs */}
      {topSongs.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Music className="w-5 h-5 text-violet-400" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit' }}>Top Songs</h2>
          </div>
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <TrackList tracks={topSongs.slice(0, 20)} />
          </div>
        </section>
      )}

      {/* Albums */}
      {artistAlbums.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Disc className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit' }}>Albums</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-in">
            {artistAlbums.map(a => <AlbumCard key={a.id} album={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}
