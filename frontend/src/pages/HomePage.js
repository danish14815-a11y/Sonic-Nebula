import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, Music, Disc3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTrending, searchSongs } from '@/services/api';
import { SongCard } from '@/components/Cards';
import usePlayerStore from '@/store/playerStore';
import { Skeleton } from '@/components/ui/skeleton';

const QUICK_TAGS = ['Arijit Singh', 'AP Dhillon', 'Bollywood', 'Romantic', 'Punjabi', 'Party', 'Diljit Dosanjh', 'KK'];

export default function HomePage() {
  const [trending, setTrending] = useState({});
  const [loading, setLoading] = useState(true);
  const [quickResults, setQuickResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrending();
        if (data.success) setTrending(data.data);
      } catch (e) {
        console.error('Trending fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleQuickSearch = useCallback(async (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  }, [navigate]);

  const trendingKeys = Object.keys(trending);

  return (
    <div data-testid="home-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Hero */}
      <section className="mb-16">
        <div className="relative overflow-hidden rounded-3xl glass-card p-8 sm:p-12 lg:p-16">
          {/* Bg image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1612035724301-ab1e8e83f1ce?w=1200&q=60"
              alt=""
              className="w-full h-full object-cover opacity-20"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020204] via-[#020204]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Disc3 className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
              <span className="text-sm text-cyan-400 font-medium tracking-wide uppercase">Sonic Nebula</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Outfit' }}>
              Feel the Music,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
                See the Rhythm
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/50 mb-8 max-w-lg">
              Immerse yourself in a visual music experience. Search millions of tracks, watch the beats come alive.
            </p>

            {/* Quick tags */}
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  data-testid={`quick-tag-${tag.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => handleQuickSearch(tag)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-violet-600/20 border border-white/8 hover:border-violet-500/40 text-sm text-white/70 hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending sections */}
      {loading ? (
        <div className="space-y-12">
          {[1, 2].map(s => (
            <div key={s}>
              <Skeleton className="h-8 w-48 mb-6 bg-white/5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="aspect-square rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-14">
          {trendingKeys.map(key => {
            const tracks = trending[key];
            if (!tracks || tracks.length === 0) return null;
            const label = key.charAt(0).toUpperCase() + key.slice(1);

            return (
              <section key={key} data-testid={`trending-section-${key}`}>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-violet-400" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit' }}>
                    {label}
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-in">
                  {tracks.slice(0, 10).map(track => (
                    <SongCard key={track.id} track={track} trackList={tracks} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
