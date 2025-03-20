import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import PlaylistComponent from "./playlist-component";
import { orderBy } from "natural-orderby";
import ModalComponent from "./playlist-modal.jsx";

const collator = new Intl.Collator("es", { sensitivity: "base" });

const PlaylistPanel = ({ accessToken, onProgressStart, onProgressStop, onPlaylistSelected, onError }) => {
    const [playlists, setPlaylists] = useState([]);
    const [filter, setFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);

    useEffect(() => {
        onProgressStart("Loading playlists...");
        loadPlaylists();
    }, []);

    const handleOpenModal = (playlist) => {
        setSelectedPlaylist(playlist);
        setShowModal(true);
    };

    const loadPlaylists = async () => {
        try {
            let playlists = [];
            await getPlaylists(null, playlists);
            setPlaylists(sortPlaylists(playlists));
            onProgressStop();
        } catch (error) {
            onError(`Error retrieving playlists: ${error}`);
        }
    };

    const getPlaylists = async (pageToken, playlists) => {
        let url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true";
        if (pageToken) url += "&pageToken=" + pageToken;

        const options = {
            headers: { "Authorization": "Bearer " + accessToken }
        };

        const response = await fetch(url, options);
        if (!response.ok) throw new Error(response.status);

        const data = await response.json();
        playlists.push(...data.items);

        if (data.nextPageToken) {
            await getPlaylists(data.nextPageToken, playlists);
        }
    };

    const sortPlaylists = (playlists) => orderBy(playlists, v => v.snippet.title, collator.compare);

    const handleFilterChange = (event) => setFilter(event.target.value.toLowerCase());

    const filteredPlaylists = playlists.filter((playlist) =>
        playlist.snippet.title.toLowerCase().includes(filter)
    );

    return (
        <>
            <div className="row">
                <div className="col mb-3">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Search..."
                        value={filter}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>
            <div className="row row-cols-4">
                {filteredPlaylists.map((playlist) => (
                    <PlaylistComponent
                        key={playlist.id}
                        accessToken={accessToken}
                        playlist={playlist}
                        onPlaylistSelected={onPlaylistSelected}
                        onOpenModal={handleOpenModal}
                    />
                ))}
            </div>
            {showModal && selectedPlaylist && (
                <ModalComponent
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    title={playlist.snippet.title}
                    items={getPlaylist(playlist.id)}
                />
            )}

        </>
    );
};

PlaylistPanel.propTypes = {
    accessToken: PropTypes.string.isRequired,
    onProgressStart: PropTypes.func.isRequired,
    onProgressStop: PropTypes.func.isRequired,
    onPlaylistSelected: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
};

export default PlaylistPanel;