import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { setAccessToken } from "./playlist-manager-fetch.jsx";
import { PlaylistGridView } from "./playlist-grid-view.jsx";
import { PlaylistListView } from "./playlist-list-view.jsx";


const PlaylistComponent = ({ accessToken, playlists, onOpenModal }) => {
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const getVideoCountText = (playlist) => {
    const itemCount = playlist.contentDetails.itemCount;
    return `${itemCount} ${itemCount === 1 ? "video" : "videos"}`;
  };


  // Se ejecuta al montar el componente y cambia el accessToken globalmente
  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  return (
    <>
      {/* Renderiza la vista según el estado */}
      {viewMode === "grid" ? (
        <div className="row row-cols-4">
          {playlists.map((playlist) => (
            <PlaylistGridView
              key={playlist.id}
              playlist={playlist}
              videoCountText={getVideoCountText(playlist)}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="row mb-3">
            <ul className="list-group">
              {playlists.map((playlist) => (
                <PlaylistListView
                  key={playlist.id}
                  playlist={playlist}
                  videoCountText={getVideoCountText(playlist)}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

PlaylistComponent.propTypes = {
  playlists: PropTypes.array.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default PlaylistComponent;