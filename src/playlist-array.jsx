const playlists = {}; // Objeto donde guardaremos las playlists

// Función para agregar una playlist
export const addPlaylist = (id, items) => {
  playlists[id] = items;
};

// Función para obtener una playlist por su ID
export const getPlaylist = (id) => {
  return playlists[id] || null;
};

// Función para obtener todas las playlists
export const getAllPlaylists = () => {
  return playlists;
};
