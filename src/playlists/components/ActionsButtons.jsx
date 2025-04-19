import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { isSort, removeDeletedAndDuplicatesVideos, handleUnsortedVideosClicked, handleSortClicked } from "../utils/Manager.jsx";
import { loadPlaylistItems } from "../../fetch/FetchData.jsx";
import { addPlaylist, getPlaylist, deletePlaylist } from '../utils/PlayListArray.js';

const ActionsButtons = ({ playlist, onOpenModal }) => {
    const [buttonsVisible, setButtonsVisible] = useState(false); // Mostrar o no los botones de acciones
    const [downloaded, setDownloaded] = useState(false); // Indica si la playlist ha sido descargada
    const [loading, setLoading] = useState(false); // Mostrar o no el botón de loading
    const [btnSortBgColor, setBtnSortBgColor] = useState(null); // Color de fondo del botón de ordenar
    const [btnRemoveBgColor, setBtnRemoveBgColor] = useState(null); // Color de fondo del botón de eliminar

    const download = useCallback(async () => {
        try {
            console.log(`Downloading playlist: ${playlist.id}`);
            setLoading(true);

            let playlistItems = await loadPlaylistItems(playlist.id);
            await addPlaylist(playlist.id, playlistItems);

            setDownloaded(true);
            setButtonsVisible(true);

            setLoading(false);
            console.log("Playlist downloaded successfully");
        } catch (error) {
            console.error("Error downloading playlist:", error);
        }
    }, [playlist.id]);

    const update = async () => {
        try {
            console.log(`Updating playlist: ${playlist.id}`);
            setLoading(true);

            await deletePlaylist(playlist.id);
            await download();

            setLoading(false);
            console.log("Playlist updated successfully");
        } catch (error) {
            console.error("Error updating playlist:", error);
        }
    };

    const checkSort = async () => {
        try {
            console.log(`Checking sort playlist: ${playlist.id}`);
            setLoading(true);

            let isSorted = await isSort(getPlaylist(playlist.id));

            if (isSorted) {
                setBtnSortBgColor("btn-success");
                console.log("Playlist is sorted correctly.");
            } else {
                setBtnSortBgColor("btn-danger");
                console.log("Playlist is NOT sorted correctly.");
            }

            setLoading(false);
            console.log("Playlist checked sort successfully");
        } catch (error) {
            console.error("Error checking if playlist is sorted:", error);
        }
    };

    const removeDuplicatesDeleted = async () => {
        console.log(`Removing duplicates and deleted videos: ${playlist.id}`);
        setLoading(true);

        try {
            let response = await removeDeletedAndDuplicatesVideos(getPlaylist(playlist.id));
            if (response) {
                console.log("Duplicates and deleted videos removed successfully");
                setBtnRemoveBgColor("btn-warning");
                update();
            } else {
                console.log("No duplicates or deleted videos found.");
                setBtnRemoveBgColor("btn-success");
            }

        } catch (error) {
            console.error("Error removing deleted videos:", error);
        }

        setLoading(false);
    };

    return (

        <div className="btn-toolbar icon-link" role="toolbar" aria-label="Toolbar actions">
            {loading && (
                <div className="loading spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
            {!downloaded && (
                <div className="btn-group actions-buttons" role="group" aria-label="Playlist actions">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Download playlist"
                        onClick={download}
                    >
                        <i className="bi bi-cloud-arrow-down"></i>
                    </button>
                </div>
            )}

            {buttonsVisible && (
                <>
                    <div className="btn-group actions-buttons me-1" role="group" aria-label="Playlist actions">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="View playlist"
                            onClick={() => onOpenModal(playlist)}
                        >
                            <i className="bi bi-eye"></i>
                        </button>
                    </div>
                    <div className="btn-group actions-buttons me-1" role="group" aria-label="Playlist actions">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            title="Update playlist"
                            onClick={update}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                        <button
                            type="button"
                            className={`btn btn-primary btn-sm ${btnSortBgColor !== null ? btnSortBgColor : ""}`}
                            title="Check sorted playlist"
                            onClick={checkSort}
                        >
                            <i className="bi bi-question-circle"></i>
                        </button>
                        <button
                            type="button"
                            className={`btn btn-primary btn-sm ${btnRemoveBgColor !== null ? btnRemoveBgColor : ""}`}
                            title="Remove duplicates and deleted videos"
                            onClick={removeDuplicatesDeleted}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                    <div className="btn-group actions-buttons me-1" role="group" aria-label="Sort actions">
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            title="Sort only unsorted playlist"
                            onClick={handleUnsortedVideosClicked}
                        >
                            <i className="bi bi-sort-down-alt"></i>
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            title="Sort entire playlist"
                            onClick={() => handleSortClicked({ descending: false })}
                        >
                            <i className="bi bi-sort-alpha-down"></i>
                        </button>
                    </div>
                </>
            )}
        </div>

    );
}

ActionsButtons.propTypes = {
    playlist: PropTypes.object.isRequired,
};

export default ActionsButtons;
