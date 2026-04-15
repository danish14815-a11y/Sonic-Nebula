import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Music2, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, navigate]);

  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#020204]/80 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="logo-link">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-semibold text-white hidden sm:block" style={{ fontFamily: 'Outfit' }}>
              Sonic Nebula
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-violet-400 transition-colors"
                strokeWidth={1.5}
              />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Search songs, albums, artists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-white/5 border-white/8 rounded-xl text-white placeholder:text-white/30 focus:bg-white/8 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>
          </form>

          {/* Nav links */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to="/"
              data-testid="home-link"
              className="p-2.5 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
