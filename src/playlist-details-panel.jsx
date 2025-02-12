import React from "react"
import PropTypes from "prop-types"
import CircularProgressbar from "react-circular-progressbar"
import { compare, orderBy } from "natural-orderby"
const collator = new Intl.Collator("es", { sensitivity: "base" });

class PlaylistDetailsPanel extends React.Component {
  constructor(props) {
    super(props)

    this.handleSortClicked = this.handleSortClicked.bind(this)

    this.state = {
      playlistItems: null,
      percentComplete: 100,
      currentlySortingVideoTitle: "",
      deletedCount: 0
    }
  }

  componentDidMount() {
    this.props.onProgressStart("Loading videos...")
    this.loadPlaylistItems()
  }

  render() {
    let videoCountText = ""
    let items = []

    if (this.state.playlistItems) {
      items = this.state.playlistItems.map((playlistItem) =>
        <li key={playlistItem.id}>
          <div className="item video-item">
            <a href={`https://www.youtube.com/watch?v=${playlistItem.snippet.resourceId.videoId}`} target="_blank">
              <img src={playlistItem.snippet.thumbnails.default.url} />
              <div className="info">
                <div className="title">{playlistItem.snippet.title}</div>
              </div>
            </a>
          </div>
        </li>
      )

      /*
      let itemCount = this.props.itemCount
      let validItemCount = this.state.playlistItems.length
      let deletedCount = itemCount - validItemCount
      let deletedText = deletedCount > 0 ? `, including ${deletedCount} deleted` : ""
      videoCountText = `(${validItemCount} ${validItemCount == 1 ? "video" : "videos"}${deletedText})`
      */

      let playlistItemsLength = this.state.playlistItems.length
      let deletedText = this.deletedCount > 0 ? `, including ${this.deletedCount} deleted` : ""
      videoCountText = `(${playlistItemsLength} ${playlistItemsLength == 1 ? "video" : "videos"}${deletedText})`
    }

    let playlistUrl = `https://www.youtube.com/playlist?list=${this.props.playlist.id}`
    let progressCircle = null
    if (this.state.percentComplete != 100) {
      progressCircle = <CircularProgressbar percentage={this.state.percentComplete} textForPercentage={() => ""} />
    }

    const helpText = "note: once sorting is complete, it can take a few minutes before the playlist is fully updated on YouTube"

    return (
      <div className="content-panel container">
        <div className="row">
          <div className="col-xs-4 back-link">
            <a href="#" onClick={() => this.props.onBackToPlaylists()}>&larr; Back to Playlists</a>
          </div>
          <div className="col-xs-4 playlist-title center-text">
            {this.props.playlist.snippet.title} {videoCountText}
          </div>
          <div className="col-xs-4 youtube-nav-link">
            <a className="pull-right" href={playlistUrl} target="_blank">Go to this playlist on YouTube</a>
          </div>
        </div>
        <div className="action-row">
          <div>Actions:</div>
          <div>
            <a href="#" className="sort-link" title={helpText} onClick={() => this.update()}>Update</a>
            <a href="#" className="sort-link" title={helpText} onClick={() => this.isSort()}>Is sort?</a>
            <a href="#" className="sort-link" title={helpText} onClick={() => this.findDuplicates()}>Find Duplicates</a>
            <a href="#" className="sort-link" title={helpText} onClick={() => this.removeDeletedVideos()}>Remove deleted videos</a>
          </div>
        </div>
        <div className="action-row">
          <div>Sort: </div>
          <div>
            <a href="#" className="sort-link" title={helpText} onClick={() => this.handleUnsortedVideosClicked()}>A-Z (only unsorted videos)</a>
            <a href="#" className="sort-link" title={helpText} onClick={() => this.handleSortClicked({ descending: false })}>A-Z (all playlist)</a>
            {/*<a href="#" className="sort-link" title={helpText} onClick={() => this.handleSortClicked({descending: true})}>Z-A</a>
            <a href="#" className="sort-link" title={helpText} onClick={() => this.handleSortClicked({shuffle: true})}>Shuffle</a>*/}
          </div>
          <div className="sort-progress-bar">
            {progressCircle}
          </div>
          <div className="sort-video-title">
            {this.state.currentlySortingVideoTitle}
          </div>
        </div>
        <div className="playlist-items">
          <ul className="item-list">{items}</ul>
        </div>
      </div>
    )
  }

  update() {
    this.props.onProgressStart("Updating playlist...")
    this.loadPlaylistItems().then(() => {
      this.props.onProgressStop();
      this.render();
    })
  }


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
    let deletedVideos = playlist.filter(video => video.snippet.title == "Deleted video" && video.snippet.description == "This video is unavailable.");

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

  handleSortClicked(options) {
    let confirmation = confirm("Are you sure you want to sort the playlist?")
    if (confirmation) {
      this.props.onProgressStart("Sorting videos...")

      let itemsCopy = Array.from(this.state.playlistItems)
      if (options.shuffle) {
        itemsCopy = this.shufflePlaylistItems(itemsCopy)
      } else {
        itemsCopy = this.sortPlaylistItems(itemsCopy, options.descending)
      }

      for (let [index, playlistItem] of itemsCopy.entries()) {
        playlistItem.snippet.position = index
      }

      this.updatePlaylistItems(Array.from(itemsCopy)).then(() => {
        this.setState({
          playlistItems: itemsCopy
        })
      }).catch((error) => {
        this.props.onError(error.message)
      }).then(() => {
        this.props.onProgressStop()
        this.setState({
          percentComplete: 100,
          currentlySortingVideoTitle: ""
        })
      })
    }
  }


  async handleUnsortedVideosClicked() {

    this.props.onProgressStart("Sorting videos...");

    // 1. Lista de vídeos en la playlist
    let playlist = Array.from(this.state.playlistItems);

    // 2. Calcular el orden correcto (alfabético)
    let sortedPlaylist = this.sortPlaylistItems(playlist, false)

    // 3. Crear un mapa de título a índice en el orden correcto
    const titleToSortedIndex = {};
    sortedPlaylist.forEach((video, index) => {
      titleToSortedIndex[video.snippet.title] = index;
    });

    // Buscamos el video cuyo título contiene 'zzzz'
    let lastVideo = playlist.find(video => video.snippet.title.toLowerCase().includes('zzzz'));

    // Si se encuentra, se ordena la lista de manera normal
    if (lastVideo) {
      // this.handleUnsortedVideosClicked();
    } else {
      // Si no se encuentra en la última posición, 
      // empezamos a recorrer la playlist por el final de la lista hasta que lo encontremos
      playlist.slice().reverse().forEach(video, index => {
        if (video.snippet.title.toLowerCase().includes('zzzz')) {
          // Ponemos su posición al final
          video.snippet.position = playlist.length - 1;
        }

        let indexSortVideo = titleToSortedIndex[video.snippet.title];
        let videosToUpdate = [];

        videosToUpdate.push(video);
      });
    }

    // 4. Mapear la lista original a una secuencia de índices según el orden correcto
    const indices = playlist.map(video => titleToSortedIndex[video.snippet.title]);

    // this.computeLISIndices
    const { lisIndices, length: lisLength } = this.computeLISIndices(indices);
    console.log("\nLongest Increasing Subsequence (LIS) de índices:", lisIndices);
    const minimalMoves = playlist.length - lisLength; // Cambio: Cálculo del número mínimo de movimientos
    console.log("Número mínimo de movimientos requeridos:", minimalMoves);

    // 6. Marcar los elementos que NO están en la LIS, pues estos son los que se moverán
    const lisSet = new Set(lisIndices);

    // Preparar la lista de movimientos: 
    // Cada movimiento se define como "mover un título que no está en la LIS a su posición final (según sortedTitles)"
    const moves = [];
    playlist.forEach((video, currentIndex) => {
      if (!lisSet.has(currentIndex)) { // Cambio: Solo se mueve el título si NO forma parte de la LIS
        const targetIndex = titleToSortedIndex[video.snippet.title]; // Su posición final en el orden alfabético

        if (currentIndex != targetIndex) {
          moves.push({
            video,
            currentIndex,
            targetIndex
          });
        }
      }
    });

    console.log("\nMovimientos a realizar (mover el título desde su índice actual a su índice final):");
    moves.forEach(move => {
      console.log(`Mover "${move.video.snippet.title}" desde índice ${move.currentIndex} a índice ${move.targetIndex}`);
    });



    // 7. (Opcional) Simular la ejecución de esos movimientos
    //     Se toma una copia de la lista y se aplican los movimientos en el orden obtenido.
    /*let simulated = Array.from(playlist);
    moves.forEach(move => {
      // Encontrar la posición actual del título (puede cambiar con cada movimiento)
      const currentPos = simulated.indexOf(move.video.snippet.title);
      // Quitar el elemento de su posición actual
      simulated.splice(currentPos, 1);
      // Insertarlo en la posición objetivo (la API reindexa el array automáticamente)
      simulated.splice(move.targetIndex, 0, move.video);
      //console.log(`Después de mover "${move.video.snippet.title}": [${simulated.join(", ")}]`);
    });

    console.log("\nLista final ordenada:", simulated);
    console.log("Orden correcto:", sortedPlaylist);
*/


    // 8. Realizarlo en YouTube
    let arrayEnd = [];
    let simulatedYT = Array.from(playlist);
    for (const move of moves) {
      // Encontrar la posición actual del título (puede cambiar con cada movimiento)
      const currentPos = simulatedYT.indexOf(move.video.snippet.title);
      // Quitar el elemento de su posición actual
      simulatedYT.splice(currentPos, 1);
      // Insertarlo en la posición objetivo (la API reindexa el array automáticamente)
      // simulatedYT.splice(move.targetIndex, 0, move.video);
      move.video.snippet.position = move.targetIndex;

      if (currentPos == move.targetIndex) {
        continue; // No es necesario hacer nada si la posición actual es la misma que la final
      }

      arrayEnd.push(move.video);
      //break; // The break exits the loop after processing only the first move
    }



    if (arrayEnd.length > 0) {
      console.log("array de actualización incluye: " + arrayEnd[0].snippet.title);
      this.updatePlaylistItems(Array.from(arrayEnd)).then(() => {
        this.setState({
          playlistItems: sortedPlaylist
        })
      }).catch((error) => {
        this.props.onError(error.message)
        console.log("Error de actualización: " + error.message);
      }).then(() => {
        this.props.onProgressStop()
        this.setState({
          percentComplete: 100,
          currentlySortingVideoTitle: ""
        });
        this.loadPlaylistItems().then(() => {
          this.props.onProgressStop()
          this.render();
          //this.handleUnsortedVideosClicked();
        });
      })


    }

    /*
        for (let swap of swaps) {
          //await updateVideoPosition(swap.playlistItemId, swap.to);
          // Añadimos a un array vacio swap.playlistItemId
          let swapArray = [];
          swapArray.push(swap.playlistItem);
          console.log(swapArray);
          await this.updatePlaylistItems(swapArray);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar para que YouTube actualice la lista
    
          if (swapArray.length > 0) {
            await this.loadPlaylistItems();
            videos = Array.from(this.state.playlistItems);
    
            //await this.render();
    
            // videos = await getPlaylistVideos(); // Obtener lista actualizada después de cada cambio
            //swaps = this.findMinimumSwaps(videos); // Recalcular swaps después de cada cambio
          }
        }
    
        console.log("Playlist ordenada con el mínimo de movimientos.");*/
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

  loadPlaylistItems() {
    return new Promise((resolve, reject) => {
      let playlistItems = []

      this.getPlaylistItems(null, this.props.playlist.id, playlistItems, (error) => {
        if (error) {
          this.props.onError(`Error retrieving playlist details: ${error}`)
          reject(error)
        } else {
          this.setState({
            playlistItems: playlistItems
          })

          this.props.onProgressStop()
          resolve()
        }
      })
    })
  }

  getPlaylistItems(pageToken, playlistId, playlistItems, callback) {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`

    if (pageToken) {
      url += "&pageToken=" + pageToken
    }

    let options = {
      headers: {
        "Authorization": "Bearer " + this.props.accessToken
      }
    }

    fetch(url, options)
      .then((response) => {
        if (response.status != 200) {
          callback(response.status)
          return
        }

        response.json().then((data) => {
          for (let playlistItem of data.items) {
            // Playlists can contain videos that have since been deleted. We want to omit
            // these items. The youtube API doesn't seem to indicate this in the playlist item.
            // The only way I can see to identify a deleted video (without trying to fetch it)
            // is if thumbnails is undefined or empty.

            // START JAVI **********************
            // Cambiamos el if temporalmente, para que se muestren los vídeos eliminados
            // END JAVI **********************
            if (!playlistItem.snippet.thumbnails || !playlistItem.snippet.thumbnails.default) {
              playlistItem.snippet.thumbnails = {
                default: {
                  url: "https://i.ytimg.com/img/no_thumbnail.jpg",
                  width: 120,
                  height: 90
                }
              }

              // Aumentamos el contador de vídeos eliminados para saber cuántos hay, lo pone arriba del todo
              this.deletedCount++;
            }

            playlistItems.push(playlistItem)

            /* if (playlistItem.snippet.thumbnails && playlistItem.snippet.thumbnails.default) {
              playlistItems.push(playlistItem)
            }*/

          }

          if (data.nextPageToken) {
            this.getPlaylistItems(data.nextPageToken, playlistId, playlistItems, callback)
          } else {
            callback()
          }
        })
      })
      .catch((error) => callback(error))
  }

  sortPlaylistItems(playlistItems, isDescending) {
    return orderBy(playlistItems, v => v.snippet.title, isDescending ? "desc" : "asc", collator.compare)
  }

  shufflePlaylistItems(playlistItems) {
    for (let i = playlistItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // semi-colon here to keep eslint no-unexpected-multiline quiet
      [playlistItems[i], playlistItems[j]] = [playlistItems[j], playlistItems[i]]
    }

    return playlistItems
  }

  updatePercentComplete(itemsRemaining) {
    let complete = this.state.playlistItems.length - itemsRemaining.length
    let percentComplete = Math.floor(complete / this.state.playlistItems.length * 100)
    this.setState({
      percentComplete: percentComplete
    })
  }

  updatePlaylistItems(itemsRemaining) {
    this.updatePercentComplete(itemsRemaining)

    let toUpdate = itemsRemaining.shift()
    console.log("toUpdate: " + toUpdate.snippet.title);
    this.setState({
      currentlySortingVideoTitle: toUpdate.snippet.title
    })

    return this.updatePlaylistItem(toUpdate).then(() => {
      if (itemsRemaining.length > 0) {
        return this.updatePlaylistItems(itemsRemaining)
      }
    })
  }

  updatePlaylistItem(playlistItem) {
    const url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet"

    // Update only the required properties, plus the new position.
    const updateItem = {
      id: playlistItem.id,
      snippet: {
        playlistId: playlistItem.snippet.playlistId,
        resourceId: playlistItem.snippet.resourceId,
        position: playlistItem.snippet.position
      }
    }

    const options = {
      method: "put",
      headers: {
        "Authorization": "Bearer " + this.props.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateItem)
    }

    return fetch(url, options).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          const message = this.getErrorMessage(data) || `updating playlistItem: ${response.status}`
          throw new Error(message)
        })
      }
    })
  }

  deletePlaylistItems(itemsRemaining) {
    this.updatePercentComplete(itemsRemaining);

    let toUpdate = itemsRemaining.shift();

    return this.deletePlaylistItem(toUpdate).then(() => {
      if (itemsRemaining.length > 0) {
        return this.deletePlaylistItems(itemsRemaining)
      }
    })
  }

  deletePlaylistItem(playlistItem) {
    const url = "https://www.googleapis.com/youtube/v3/playlistItems?id=" + playlistItem.id

    const options = {
      method: "delete",
      headers: {
        "Authorization": "Bearer " + this.props.accessToken,
        "Content-Type": "application/json"
      }
    }

    return fetch(url, options).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          const message = this.getErrorMessage(data) || `deleting playlistItem: ${response.status}`
          throw new Error(message)
        })
      }
    })
  }

  getErrorMessage(data) {
    let error = data.error

    if (error) {
      if (error.errors && error.errors.length > 0) {
        if (error.errors[0].reason == "manualSortRequired") {
          let url = `https://www.youtube.com/playlist?list=${this.props.playlist.id}`
          let playlistLink = `<a href="${url}" target="_blank">here</a>`
          return `You must first change the playlist to manual ordering by dragging a video to a different position ${playlistLink}.`
        }
      }

      return `${error.code}: ${error.message}`
    }

    return null
  }
}

PlaylistDetailsPanel.propTypes = {
  accessToken: PropTypes.string.isRequired,
  playlist: PropTypes.object.isRequired,
  itemCount: PropTypes.number.isRequired,
  onProgressStart: PropTypes.func.isRequired,
  onProgressStop: PropTypes.func.isRequired,
  onBackToPlaylists: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default PlaylistDetailsPanel
