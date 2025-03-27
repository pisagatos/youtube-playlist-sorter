import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";

const PlaylistManagerSort = ({ accessToken, playlist, itemCount, onProgressStart, onProgressStop, onBackToPlaylists, onError }) => {
  const [playlistItems, setPlaylistItems] = useState(playlist.items || []);
  const [percentComplete, setPercentComplete] = useState(0);
  const [currentlySortingVideoTitle, setCurrentlySortingVideoTitle] = useState("");

  // Función para ordenar la playlist
  const handleSortClicked = useCallback((options) => {
    let confirmation = confirm("Are you sure you want to sort the playlist? Spend a lot of quota API");
    if (!confirmation) return;

    onProgressStart("Sorting videos...");

    let itemsCopy = [...playlistItems];
    if (options.shuffle) {
      itemsCopy = shufflePlaylistItems(itemsCopy);
    } else {
      itemsCopy = sortPlaylistItems(itemsCopy, options.descending);
    }

    itemsCopy.forEach((item, index) => {
      item.snippet.position = index;
    });

    updatePlaylistItems(itemsCopy)
      .then(() => setPlaylistItems(itemsCopy))
      .catch((error) => onError(error.message))
      .finally(() => {
        onProgressStop();
        setPercentComplete(100);
        setCurrentlySortingVideoTitle("");
      });
  }, [playlistItems, onProgressStart, onProgressStop, onError]);

  // Función para ordenar los vídeos no ordenados de la playlist
  const handleUnsortedVideosClicked = useCallback(() => {
    onProgressStart("Sorting videos...");

    let sortedPlaylist = sortPlaylistItems([...playlistItems], false);
    let moves = computeMinimalMoves(playlistItems, sortedPlaylist);

    if (moves.length > 0) {
      updatePlaylistItems(moves.map(move => move.video))
        .then(() => setPlaylistItems(sortedPlaylist))
        .catch((error) => onError(error.message))
        .finally(() => {
          onProgressStop();
          setPercentComplete(100);
          setCurrentlySortingVideoTitle("");
        });
    }
  }, [playlistItems, onProgressStart, onProgressStop, onError]);

  return (
    <div>
      <button onClick={() => handleSortClicked({ shuffle: false })}>Sort Playlist</button>
      <button onClick={handleUnsortedVideosClicked}>Sort Unsorted Videos</button>
    </div>
  );
};

PlaylistManagerSort.propTypes = {
  accessToken: PropTypes.string.isRequired,
  playlist: PropTypes.object.isRequired,
  itemCount: PropTypes.number.isRequired,
  onProgressStart: PropTypes.func.isRequired,
  onProgressStop: PropTypes.func.isRequired,
  onBackToPlaylists: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default PlaylistManagerSort;