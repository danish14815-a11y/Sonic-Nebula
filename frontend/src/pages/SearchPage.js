import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchSongs, searchAlbums, searchArtists, searchPlaylists } from '@/services/api';
import { SongCard, AlbumCard, ArtistCard, PlaylistCard } from '@/components/Cards';
import { TrackList } from '@/components/TrackList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, Disc, User, ListMusic } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('songs');
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    const fetchAll = async () => {
      try {
        const [songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.allSettled([
          searchSongs(query),
          searchAlbums(query),
          searchArtists(query),
          searchPlaylists(query),
        ]);

        if (songsRes.status === 'fulfilled' && songsRes.value?.data?.results) {
          setSongs(songsRes.value.data.results);
        }
        if (albumsRes.status === 'fulfilled' && albumsRes.value?.data?.results) {
          setAlbums(albumsRes.value.data.results);
        }
        if (artistsRes.status === 'fulfilled' && artistsRes.value?.data?.results) {
          setArtists(artistsRes.value.data.results);
        }
        if (playlistsRes.status === 'fulfilled' && playlistsRes.value?.data?.results) {
          setPlaylists(playlistsRes.value.data.results);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [query]);

  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <Skeleton key={i} className="aspect-square rounded-2xl bg-white/5" />
      ))}
    </div>
  );

  return (
    <div data-testid="search-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Search header */}
      <div className="mb-8">
        <p className="text-sm text-white/40 mb-1">Search results for</p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-white"
          style={{ fontFamily: 'Outfit' }}
          data-testid="search-query-title"
        >
          "{query}"
        </h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/8 rounded-xl p-1 h-auto">
          <TabsTrigger
            value="songs"
            data-testid="tab-songs"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/50 gap-1.5"
          >
            <Music className="w-3.5 h-3.5" strokeWidth={1.5} /> Songs ({songs.length})
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            data-testid="tab-albums"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/50 gap-1.5"
          >
            <Disc className="w-3.5 h-3.5" strokeWidth={1.5} /> Albums ({albums.length})
          </TabsTrigger>
          <TabsTrigger
            value="artists"
            data-testid="tab-artists"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/50 gap-1.5"
          >
            <User className="w-3.5 h-3.5" strokeWidth={1.5} /> Artists ({artists.length})
          </TabsTrigger>
          <TabsTrigger
            value="playlists"
            data-testid="tab-playlists"
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/50 gap-1.5"
          >
            <ListMusic className="w-3.5 h-3.5" strokeWidth={1.5} /> Playlists ({playlists.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          {loading ? <SkeletonGrid /> : (
            songs.length > 0 ? (
              <div className="glass-card rounded-2xl p-4">
                <TrackList tracks={songs} />
              </div>
            ) : <p className="text-white/30 py-12 text-center">No songs found</p>
          )}
        </TabsContent>

        <TabsContent value="albums">
          {loading ? <SkeletonGrid /> : (
            albums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-in">
                {albums.map(a => <AlbumCard key={a.id} album={a} />)}
              </div>
            ) : <p className="text-white/30 py-12 text-center">No albums found</p>
          )}
        </TabsContent>

        <TabsContent value="artists">
          {loading ? <SkeletonGrid /> : (
            artists.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 stagger-in">
                {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
              </div>
            ) : <p className="text-white/30 py-12 text-center">No artists found</p>
          )}
        </TabsContent>

        <TabsContent value="playlists">
          {loading ? <SkeletonGrid /> : (
            playlists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-in">
                {playlists.map(p => <PlaylistCard key={p.id} playlist={p} />)}
              </div>
            ) : <p className="text-white/30 py-12 text-center">No playlists found</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
