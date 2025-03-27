import React from "react";
import PlaylistActionsButtons from "./playlist-sorter-actions-buttons.jsx";


export const PlaylistGridView = ({ playlist, videoCountText, onOpenModal}) => {
    return (
        <div className="col containerCard mb-3">
            <div className="card h-100">
                <img src={playlist.snippet.thumbnails.high.url} className="card-img-top" alt={playlist.snippet.title} />
                <div className="card-body">
                    <h5 className="card-title">{playlist.snippet.title}</h5>
                    <p className="card-text">{videoCountText}</p>
                </div>
                <div className="card-footer">
                    <PlaylistActionsButtons playlist={playlist} onOpenModal={onOpenModal} />
                </div>
            </div>
        </div>
    );
};

export default PlaylistGridView;