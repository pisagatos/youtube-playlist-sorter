import React from "react"
import PropTypes from "prop-types"

class PlaylistManagerSort extends React.Component {

  constructor(props, state) {
    super(props)
    this.props = props;
    this.state = state;
  }

  // Función para ordenar la playlist
  handleSortClicked(options) {
    let confirmation = confirm("Are you sure you want to sort the playlist? Spend a lot of quota API")
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

  // Función para ordenar los vídeos no ordenados de la playlist
  handleUnsortedVideosClicked() {
    this.props.onProgressStart("Sorting videos...");

    // 1. Lista de vídeos en la playlist
    let playlist = Array.from(this.state.playlistItems);

    // 2. Calcular el orden correcto (alfabético)
    let sortedPlaylist = this.sortPlaylistItems(playlist, false)

    // 5. Buscamos el video cuyo título contiene 'zzzz' fuera de posición 
    // y ordenamos los últimos añadidos en lista (caen por debajo del vídeo Z)
    let zVideo = playlist.find(video => video.snippet.title.toLowerCase().includes('zzzz'));
    let lastVideo = playlist[playlist.length - 1];

    let unsortedVideos = [];

    // Si se encuentra el vídeo Z, se ordena la lista de manera normal
    if (lastVideo.snippet.title.toLowerCase().includes('zzzz')) {
      // No hacemos nada aquí y seguimos ordenando la lista de manera normal
    } else {
      // Si no se encuentra en la última posición, 
      // empezamos a recorrer la playlist por el final de la lista hasta que lo encontremos
      playlist.slice().reverse().forEach((video, index) => {
        if (video.snippet.title.toLowerCase().includes('zzzz')) {
          // Ponemos el video de zzzz a su posición al final
          video.snippet.position = (playlist.length - 1);
          unsortedVideos.push(video);

          // Salimos del foreach
          return;
        } else {
          // Si no es un video de zzzz, lo ponemos en la posición que le corresponde
          // Buscamos el índice correcto en la lista ordenada por título
          let indexSortVideo = sortedPlaylist.findIndex(v => v.snippet.title == video.snippet.title);

          // Si el índice actual no coincide con el índice correcto, lo añadimos a la lista de vídeos a actualizar
          if (index != indexSortVideo) {
            video.snippet.position = indexSortVideo;
            unsortedVideos.push(video);
          }
        }
      });
    }

    // 6. Actualizar los vídeos no ordenados directamente en Youtube
    if (unsortedVideos.length > 0) {
      // Actualizamos los vídeos no ordenados directamente en Youtube
      this.updatePlaylistItems(Array.from(unsortedVideos)).then(() => {
      }).catch((error) => {
        this.props.onError(error.message)
      }).then(() => {
        // Obtenemos de nuevo la lista y ahora sí, hacemos la ordenación normal
        // de aquellos vídeos que no estén en su posición correcta
        this.loadPlaylistItems().then(() => {
          this.props.onProgressStop()
          this.render();
        });
        this.props.onProgressStop()
      })
    }

    // . Crear un mapa de título a índice en el orden correcto
    const titleToSortedIndex = {};
    sortedPlaylist.forEach((video, index) => {
      titleToSortedIndex[video.snippet.title] = index;
    });

    // . Mapear la lista original a una secuencia de índices según el orden correcto
    const indices = playlist.map(video => titleToSortedIndex[video.snippet.title]);

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
}

PlaylistManagerSort.propTypes = {
  accessToken: PropTypes.string.isRequired,
  playlist: PropTypes.object.isRequired,
  itemCount: PropTypes.number.isRequired,
  onProgressStart: PropTypes.func.isRequired,
  onProgressStop: PropTypes.func.isRequired,
  onBackToPlaylists: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default PlaylistManagerSort