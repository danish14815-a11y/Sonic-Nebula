import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';
import { decodeHtmlEntities } from '@/lib/utils';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1759771963975-8a4885bc6f1f?w=300&h=300&fit=crop';

export const SongCard = ({ track, trackList = [] }) => {
  const { playTrack } = usePlayerStore();
  const imgs = track.image;
  const imgUrl = Array.isArray(imgs) ? (imgs.find(i => i.quality === '500x500') || imgs[imgs.length - 1])?.url : FALLBACK_IMG;
  const artistsRaw = track.artists?.primary?.map(a => a.name).join(', ') || track.artist || '';
  const artists = decodeHtmlEntities(artistsRaw);

  return (
    <div
      data-testid={`song-card-${track.id}`}
      className="song-card group cursor-pointer bg-[#0A0A0E] hover:bg-[#18181B] transition-colors"
      onClick={() => playTrack(track, trackList.length > 0 ? trackList : [track])}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imgUrl || FALLBACK_IMG}
          alt={track.name || 'Song'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-3">
        {/* Play button overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.5)]">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
        <p className="text-sm font-medium text-white truncate">{decodeHtmlEntities(track.name) || 'Unknown'}</p>
        <p className="text-xs text-white/50 truncate">{artists}</p>
      </div>
    </div>
  );
};

export const AlbumCard = ({ album }) => {
  const imgs = album.image;
  const imgUrl = Array.isArray(imgs) ? (imgs.find(i => i.quality === '500x500') || imgs[imgs.length - 1])?.url : FALLBACK_IMG;

  return (
    <Link
      to={`/album/${album.id}`}
      data-testid={`album-card-${album.id}`}
      className="song-card group cursor-pointer bg-[#0A0A0E] hover:bg-[#18181B] transition-colors block"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imgUrl || FALLBACK_IMG}
          alt={album.name || 'Album'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-3">
        <p className="text-sm font-medium text-white truncate">{decodeHtmlEntities(album.name) || 'Unknown'}</p>
        <p className="text-xs text-white/50 truncate">{album.artist || album.subtitle || ''}</p>
      </div>
    </Link>
  );
};

export const ArtistCard = ({ artist }) => {
  const imgs = artist.image;
  const imgUrl = Array.isArray(imgs) ? (imgs.find(i => i.quality === '500x500') || imgs[imgs.length - 1])?.url : FALLBACK_IMG;

  return (
    <Link
      to={`/artist/${artist.id}`}
      data-testid={`artist-card-${artist.id}`}
      className="flex flex-col items-center gap-3 group cursor-pointer"
    >
      <div className="w-full aspect-square rounded-full overflow-hidden border-2 border-transparent group-hover:border-violet-500 transition-colors">
        <img
          src={imgUrl || FALLBACK_IMG}
          alt={artist.name || 'Artist'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
      <p className="text-sm font-medium text-white text-center truncate w-full">{decodeHtmlEntities(artist.name) || 'Unknown'}</p>
    </Link>
  );
};

export const PlaylistCard = ({ playlist }) => {
  const imgs = playlist.image;
  const imgUrl = Array.isArray(imgs) ? (imgs.find(i => i.quality === '500x500') || imgs[imgs.length - 1])?.url : FALLBACK_IMG;

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      data-testid={`playlist-card-${playlist.id}`}
      className="song-card group cursor-pointer bg-[#0A0A0E] hover:bg-[#18181B] transition-colors block"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={imgUrl || FALLBACK_IMG}
          alt={playlist.name || 'Playlist'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-3">
        <p className="text-sm font-medium text-white truncate">{decodeHtmlEntities(playlist.name) || 'Unknown'}</p>
        <p className="text-xs text-white/50 truncate">{playlist.subtitle || ''}</p>
      </div>
    </Link>
  );
};
