import { create } from 'zustand';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1759771963975-8a4885bc6f1f?w=300&h=300&fit=crop';

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  audioRef: null,
  audioContext: null,
  analyser: null,
  sourceNode: null,

  setAudioRef: (ref) => set({ audioRef: ref }),

  getDownloadUrl: (track) => {
    if (!track) return null;
    const urls = track.downloadUrl;
    if (!urls || !Array.isArray(urls) || urls.length === 0) return null;
    const q320 = urls.find(u => u.quality === '320kbps');
    const q160 = urls.find(u => u.quality === '160kbps');
    const q96 = urls.find(u => u.quality === '96kbps');
    return (q320 || q160 || q96 || urls[urls.length - 1])?.url || null;
  },

  getImageUrl: (track) => {
    if (!track) return FALLBACK_IMG;
    const imgs = track.image;
    if (!imgs || !Array.isArray(imgs) || imgs.length === 0) return FALLBACK_IMG;
    const hq = imgs.find(i => i.quality === '500x500');
    const mq = imgs.find(i => i.quality === '150x150');
    return (hq || mq || imgs[imgs.length - 1])?.url || FALLBACK_IMG;
  },

  playTrack: (track, trackList = []) => {
    const state = get();
    const url = state.getDownloadUrl(track);
    if (!url) return;

    const newQueue = trackList.length > 0 ? trackList : [track];
    const idx = newQueue.findIndex(t => t.id === track.id);

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
    });

    if (state.audioRef) {
      state.audioRef.src = url;
      state.audioRef.play().catch(() => {});
    }
  },

  togglePlay: () => {
    const state = get();
    if (!state.audioRef || !state.currentTrack) return;
    if (state.isPlaying) {
      state.audioRef.pause();
    } else {
      state.audioRef.play().catch(() => {});
    }
    set({ isPlaying: !state.isPlaying });
  },

  nextTrack: () => {
    const state = get();
    if (state.queue.length === 0) return;
    const nextIdx = (state.queueIndex + 1) % state.queue.length;
    const next = state.queue[nextIdx];
    if (next) {
      state.playTrack(next, state.queue);
      set({ queueIndex: nextIdx });
    }
  },

  prevTrack: () => {
    const state = get();
    if (state.queue.length === 0) return;
    const prevIdx = state.queueIndex <= 0 ? state.queue.length - 1 : state.queueIndex - 1;
    const prev = state.queue[prevIdx];
    if (prev) {
      state.playTrack(prev, state.queue);
      set({ queueIndex: prevIdx });
    }
  },

  setVolume: (v) => {
    const state = get();
    set({ volume: v });
    if (state.audioRef) state.audioRef.volume = v;
  },

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (p) => set({ isPlaying: p }),

  seekTo: (t) => {
    const state = get();
    if (state.audioRef) {
      state.audioRef.currentTime = t;
      set({ currentTime: t });
    }
  },

  initAudioContext: () => {
    const state = get();
    if (state.audioContext || !state.audioRef) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaElementSource(state.audioRef);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      set({ audioContext: ctx, analyser, sourceNode: source });
    } catch (e) {
      console.warn('AudioContext init failed:', e);
    }
  },
}));

export default usePlayerStore;
