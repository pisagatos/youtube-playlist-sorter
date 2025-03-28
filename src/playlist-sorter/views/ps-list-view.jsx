import React from "react";
import PlaylistActionsButtons from "../ps-actions-buttons.jsx";


export const PlaylistListView = ({ playlist, videoCountText, onOpenModal }) => {
  return (
    <li className="list-group-item d-flex align-items-center justify-content-between">
      <span className="fw-bold">
        {playlist.snippet.title}
        <span className="fs-6 lead"> ({videoCountText})</span>
      </span>

      <PlaylistActionsButtons playlist={playlist} onOpenModal={onOpenModal} />
    </li>
  );
};

export default PlaylistListView;