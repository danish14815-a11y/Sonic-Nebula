import { useEffect, useRef, useState, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import usePlayerStore from "@/store/playerStore";
import { Player } from "@/components/Player";
import { Navbar } from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import AlbumPage from "@/pages/AlbumPage";
import ArtistPage from "@/pages/ArtistPage";
import PlaylistPage from "@/pages/PlaylistPage";
import { Toaster } from "@/components/ui/sonner";

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className={mounted ? "page-enter-active" : "page-enter"}>
      {children}
    </div>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const { currentTrack, isPlaying, getImageUrl } = usePlayerStore();
  const [glowColor, setGlowColor] = useState('#7C3AED');

  useEffect(() => {
    if (currentTrack) {
      const colors = ['#7C3AED', '#06B6D4', '#F43F5E', '#8B5CF6', '#14B8A6', '#EC4899'];
      const hash = currentTrack.id?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
      setGlowColor(colors[hash % colors.length]);
    }
  }, [currentTrack]);

  return (
    <div className="min-h-screen relative" style={{ background: '#020204' }}>
      {/* Ambient glow */}
      <div
        className={`ambient-glow ${isPlaying ? 'is-playing' : ''}`}
        style={{ '--glow-color': glowColor, '--glow-color-2': '#06B6D4' }}
      />

      {/* Main content */}
      <div className="relative z-10">
        <Navbar />
        <main className={`${currentTrack ? 'pb-36' : 'pb-8'}`}>
          <PageWrapper key={location.pathname}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/album/:id" element={<AlbumPage />} />
              <Route path="/artist/:id" element={<ArtistPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>

      {/* Player */}
      {currentTrack && <Player />}
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  const audioRef = useRef(null);
  const { setAudioRef, setCurrentTime, setDuration, setIsPlaying, nextTrack } = usePlayerStore();

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, [setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, [setDuration]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    nextTrack();
  }, [setIsPlaying, nextTrack]);

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
      audioRef.current.volume = usePlayerStore.getState().volume;
    }
  }, [setAudioRef]);

  return (
    <>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </>
  );
}

export default App;
