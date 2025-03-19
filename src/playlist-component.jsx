import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { update, isSort, findDuplicates, removeDeletedVideos } from "./playlist-manager.jsx";
import { setAccessToken, loadPlaylistItems, getPlaylistItems, sortPlaylistItems, shufflePlaylistItems } from "./playlist-manager-fetch.jsx";
import { handleUnsortedVideosClicked, handleSortClicked } from "./playlist-manager-sort.jsx";
import { usePlaylist, addPlaylist } from './playlist-array.jsx';

const PlaylistComponent = ({ playlist, accessToken }) => {
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const itemCount = playlist.contentDetails.itemCount;
  const videoCountText = `${itemCount} ${itemCount === 1 ? "video" : "videos"}`;

  // Se ejecuta al montar el componente y cambia el accessToken globalmente
  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  const download = useCallback(async () => {
    try {
      console.log(`Downloading playlist: ${playlist.id}`);

      let playlistItems = await loadPlaylistItems(playlist.id);
      addPlaylist(playlist.id, playlistItems);

      setDownloaded(true);
      setButtonsVisible(true);
    } catch (error) {
      console.error("Error downloading playlist:", error);
    }
  }, [playlist.id]);

  const updatePlaylist = async () => {
    try {
      await update();
      console.log("Playlist updated successfully");
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const checkSort = () => {
    try {
      isSort();
    } catch (error) {
      console.error("Error checking if playlist is sorted:", error);
    }
  };

  const findDuplicateVideos = () => {
    try {
      findDuplicates();
    } catch (error) {
      console.error("Error finding duplicates:", error);
    }
  };

  const removeDeleted = () => {
    try {
      removeDeletedVideos();
    } catch (error) {
      console.error("Error removing deleted videos:", error);
    }
  };

  return (
    <div className="col">
      <div className="card h-100">
        <img src={playlist.snippet.thumbnails.default.url} className="card-img-top" alt={playlist.snippet.title} />
        <div className="card-body">
          <h5 className="card-title">{playlist.snippet.title}</h5>
          <p className="card-text">{videoCountText}</p>
          <div className="btn-toolbar" role="toolbar" aria-label="Toolbar actions">
            {!downloaded && (
              <div className="btn-group actions-buttons" role="group" aria-label="Playlist actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm me-2"
                  title="Download playlist"
                  onClick={download}
                >
                  <i className="bi bi-cloud-arrow-down"></i>
                </button>
              </div>
            )}
            {buttonsVisible && (
              <>
                <div className="btn-group actions-buttons me-2" role="group" aria-label="Playlist actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    title="View playlist"
                    onClick={handleUnsortedVideosClicked}
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                </div>
                <div className="btn-group actions-buttons me-2" role="group" aria-label="Playlist actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    title="Update playlist"
                    onClick={updatePlaylist}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    title="Check sorted playlist"
                    onClick={checkSort}
                  >
                    <i className="bi bi-question-circle"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    title="Find duplicates"
                    onClick={findDuplicateVideos}
                  >
                    <i className="bi bi-copy"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    title="Remove deleted videos"
                    onClick={removeDeleted}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                <div className="btn-group actions-buttons me-2" role="group" aria-label="Sort actions">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    title="Sort unsorted playlist"
                    onClick={handleUnsortedVideosClicked}
                  >
                    <i className="bi bi-sort-down-alt"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    title="Sort entire playlist"
                    onClick={() => handleSortClicked({ descending: false })}
                  >
                    <i className="bi bi-sort-alpha-down"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

PlaylistComponent.propTypes = {
  playlist: PropTypes.object.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default PlaylistComponent;
