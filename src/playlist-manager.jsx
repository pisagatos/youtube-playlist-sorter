import React from "react"
import PropTypes from "prop-types"

// Fichero de funciones compartidas entre componentes
class PlaylistManager extends React.Component {

    constructor(props, state) {
        super(props)
        this.props = props;
        this.state = state;
        this.download = this.download.bind(this);
        this.update = this.update.bind(this);
        this.isSort = this.isSort.bind(this);
        this.findDuplicates = this.findDuplicates.bind(this);
        this.removeDeletedVideos = this.removeDeletedVideos.bind(this);
    }

    // Download playlist items
    download(id) {
        this.props.onProgressStart("Download playlist...")

        return new Promise((resolve, reject) => {
            this.loadPlaylistItems().then(() => {
                this.props.onProgressStop();
                this.render();
                resolve();
            }).catch(reject);
        });
    }

    // Update playlist items
    update() {
        this.props.onProgressStart("Updating playlist...")
        this.loadPlaylistItems().then(() => {
            this.props.onProgressStop();
            this.render();
        })
    }

    // Comprobar si la playlist está ordenada
    isSort() {
        this.props.onProgressStart("Comparing playlist...");

        let playlist = Array.from(this.state.playlistItems);
        let sortedPlaylist = this.sortPlaylistItems(playlist, false);
        let isSorted = true;

        for (let i = 0; i < playlist.length; i++) {
            if (playlist[i].snippet.title != sortedPlaylist[i].snippet.title) {
                isSorted = false;
                break;
            }
        }

        if (isSorted) {
            this.props.onError("Playlist is sorted correctly.");
        } else {
            this.props.onError("Playlist is NOT sorted correctly.");
        }

        this.props.onProgressStop();
    }

    // Find duplicates
    findDuplicates() {
        this.props.onProgressStart("Finding duplicates...");

        let playlist = Array.from(this.state.playlistItems);
        let isSorted = true;
        let duplicatesRealTitle = [];

        var duplicates = playlist.map(function (video) {
            return {
                title: video.snippet.title.toLowerCase(),
                titleReal: video.snippet.title,
                id: video.snippet.resourceId.videoId
            };
        }).reduce(function (acc, video, i, array) {
            // Verificar si el título está duplicado en el array
            if (array.some((v, index) => v.title === video.title && index !== i) &&
                !acc.includes(video.title)) {
                acc.push(video.title); // Agregar el título en minúsculas si es duplicado y no está en la lista
                duplicatesRealTitle.push(video.titleReal); // Agregar el título real correspondiente
            }

            return acc; // Devolver el acumulador
        }, []);

        if (duplicates.length > 0) {
            this.props.onError("Duplicates found: " + '<br>' + duplicatesRealTitle.join(",<br> "));
            console.log("Duplicates found: " + duplicatesRealTitle.join(" ||| "));
        } else {
            this.props.onError("No duplicates found.");
        }

        this.props.onProgressStop();
    }

    // Eliminar vídeos eliminados de la playlist
    removeDeletedVideos() {
        this.props.onProgressStart("Removing deleted videos...");

        let playlist = Array.from(this.state.playlistItems);
        let deletedVideos = playlist.filter(video => (video.snippet.title == "Deleted video" && video.snippet.description == "This video is unavailable.") || video.snippet.title == "Private video");

        if (deletedVideos.length > 0) {
            this.deletePlaylistItems(Array.from(deletedVideos)).then(() => {
            }).catch((error) => {
                this.props.onError(error.message)
            }).then(() => {
                this.props.onProgressStop()
                this.setState({
                    percentComplete: 100,
                    currentlySortingVideoTitle: ""
                });

                this.update();

            });
        } else {
            this.props.onError("No deleted videos found.");
        }

        this.props.onProgressStop();
    }

    // Función para calcular la Longest Increasing Subsequence (LIS) de una secuencia de índices con Binary Search + Patience Sorting
    computeLISIndices(sequence) {
        const n = sequence.length;
        const dp = new Array(n).fill(1);    // dp[i]: longitud de la LIS que termina en i
        const prev = new Array(n).fill(-1);   // Para reconstruir la secuencia
        let maxLen = 0;
        let maxIndex = 0;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < i; j++) {
                if (sequence[j] < sequence[i] && dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                    prev[i] = j;
                }
            }
            if (dp[i] > maxLen) {
                maxLen = dp[i];
                maxIndex = i;
            }
        }

        // Reconstruir la LIS (en términos de índices en la secuencia original)
        const lisIndices = [];
        let i = maxIndex;
        while (i !== -1) {
            lisIndices.push(i);
            i = prev[i];
        }
        lisIndices.reverse();
        return { lisIndices, length: maxLen };
    }
}

PlaylistManager.propTypes = {
    accessToken: PropTypes.string.isRequired,
    playlist: PropTypes.object.isRequired,
    itemCount: PropTypes.number.isRequired,
    onProgressStart: PropTypes.func.isRequired,
    onProgressStop: PropTypes.func.isRequired,
    onBackToPlaylists: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
}

// Exporta la clase por defecto
export default PlaylistManager;

// Exportar las funciones para uso nombrado
export { PlaylistManager };
