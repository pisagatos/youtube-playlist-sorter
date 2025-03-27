import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { orderBy } from "natural-orderby";

import { getPlaylist } from './playlist-array.jsx';
import ModalComponent from "./playlist-modal.jsx";
import { setAccessToken } from "./playlist-manager-fetch.jsx";
import { PlaylistGridView } from "./playlist-grid-view.jsx";
import { PlaylistListView } from "./playlist-list-view.jsx";

const PlaylistPanel = ({ accessToken, onProgressStart, onProgressStop, onPlaylistSelected, onError }) => {

    const [buttonsVisible, setButtonsVisible] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [filterPlaylists, setFilterPlaylists] = useState("");
    const [filterItems, setFilterItems] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const sortPlaylists = (playlists) => orderBy(playlists, v => v.snippet.title, collator.compare);
    const [viewModePlaylist, setViewPlaylist] = useState("list"); // "grid" o "list"
    const [viewModeItems, setViewItems] = useState("list"); // "grid" o "list"
    const collator = new Intl.Collator("es", { sensitivity: "base" });

    {/* Función para obtener el texto de la cantidad de videos */ }
    const getVideoCountText = (playlist) => {
        const itemCount = playlist.contentDetails.itemCount;
        return `${itemCount} ${itemCount === 1 ? "video" : "videos"}`;
    };

    {/* Se ejecuta al montar el componente y cambia el accessToken globalmente */ }
    useEffect(() => {
        setAccessToken(accessToken);
    }, [accessToken]);

    {/* Se ejecuta al montar el componente y carga las playlists */ }
    useEffect(() => {
        onProgressStart("Loading playlists...");
        loadPlaylists();
    }, []);

    {/* Función para abrir el modal */ }
    const handleOpenModal = (playlist) => {
        setSelectedPlaylist(playlist);
        setShowModal(true);
    };

    {/* Función para cargar las playlists */ }
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

    {/* Función para obtener las playlists */ }
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

    {/* Función para buscar con acentos */ }
    const normalizeText = (text) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Función de búsqueda genérica
    const handleFilterChange = (setter) =>
        (event) => setter(normalizeText(event.target.value));

    const filteredPlaylists = playlists.filter((playlist) =>
        normalizeText(playlist.snippet.title).includes(filterPlaylists)
    );

    const filteredItems = (items) =>
        items.filter((item) => normalizeText(item.snippet.title).includes(filterItems)
        );

    return (
        <>
            <div className="sticky-top bg-white z-3 pb-2">
                <div className="row mb-3">
                    <div className="col-11">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Search..."
                            onKeyUp={handleFilterChange(setFilterPlaylists)}
                            autoFocus={true}
                        />
                    </div>
                    <div className="col-1">
                        <div className="btn-group" role="group">
                            <button type="button" className={`btn btn-outline-secondary ${viewModePlaylist === "list" ? "active" : ""}`} onClick={() => setViewPlaylist("list")}>
                                <i className="bi bi-list-ul"></i>
                            </button>
                            <button type="button" className={`btn btn-outline-secondary ${viewModePlaylist === "grid" ? "active" : ""}`} onClick={() => setViewPlaylist("grid")}>
                                <i className="bi bi-grid-3x3-gap-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Renderiza la vista según el estado */}
            {
                viewModePlaylist === "grid" ? (
                    <div className="row row-cols-4">
                        {filteredPlaylists.map((playlist) => (
                            <PlaylistGridView
                                key={playlist.id}
                                playlist={playlist}
                                videoCountText={getVideoCountText(playlist)}
                                onOpenModal={handleOpenModal}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="row mb-3">
                            <div className="col">
                                <ul className="list-group">
                                    {filteredPlaylists.map((playlist) => (
                                        <PlaylistListView
                                            key={playlist.id}
                                            playlist={playlist}
                                            videoCountText={getVideoCountText(playlist)}
                                            onOpenModal={handleOpenModal}
                                        />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )
            }
            {
                showModal && selectedPlaylist && (
                    <ModalComponent
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        title={selectedPlaylist.snippet.title}
                        items={filteredItems(getPlaylist(selectedPlaylist.id))}
                        handleFilterChange={handleFilterChange}
                        setFilterItems={setFilterItems}
                        setViewItems={setViewItems}
                        viewModeItems={viewModeItems}
                    />
                )
            }

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