import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  timeout: 15000,
});

export const searchAll = (query) => api.get('/search', { params: { query } }).then(r => r.data);
export const searchSongs = (query, page = 0, limit = 20) => api.get('/search/songs', { params: { query, page, limit } }).then(r => r.data);
export const searchAlbums = (query, page = 0, limit = 20) => api.get('/search/albums', { params: { query, page, limit } }).then(r => r.data);
export const searchArtists = (query, page = 0, limit = 20) => api.get('/search/artists', { params: { query, page, limit } }).then(r => r.data);
export const searchPlaylists = (query, page = 0, limit = 20) => api.get('/search/playlists', { params: { query, page, limit } }).then(r => r.data);

export const getSong = (id) => api.get(`/songs/${id}`).then(r => r.data);
export const getSongSuggestions = (id, limit = 10) => api.get(`/songs/${id}/suggestions`, { params: { limit } }).then(r => r.data);

export const getAlbum = (id) => api.get('/albums', { params: { id } }).then(r => r.data);

export const getArtist = (id) => api.get('/artists', { params: { id } }).then(r => r.data);
export const getArtistSongs = (id, page = 0) => api.get(`/artists/${id}/songs`, { params: { page } }).then(r => r.data);
export const getArtistAlbums = (id, page = 0) => api.get(`/artists/${id}/albums`, { params: { page } }).then(r => r.data);

export const getPlaylist = (id) => api.get('/playlists', { params: { id } }).then(r => r.data);

export const getTrending = () => api.get('/trending').then(r => r.data);

export default api;
