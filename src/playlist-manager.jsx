import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";

// const [playlistItems, setPlaylistItems] = useState(playlist.items || []);

const sortPlaylistItems = (playlistItems, isDescending) => {

  const collator = new Intl.Collator("es", { sensitivity: "base" });

  return [...playlistItems].sort((a, b) =>
    isDescending ? collator.compare(b.snippet.title, a.snippet.title)
      : collator.compare(a.snippet.title, b.snippet.title)
  );

};

const shufflePlaylistItems = (playlistItems) => {
  return playlistItems.sort(() => Math.random() - 0.5);
};

// Comprobar si la playlist está ordenada
export const isSort = (playlist) => {
  console.log("Comparing playlist...");

  let sortedPlaylist = sortPlaylistItems([...playlist], false);
  let isSorted = playlist.every((item, i) => item.snippet.title === sortedPlaylist[i].snippet.title);

  if (isSorted) {
    console.log("Playlist is sorted correctly.");
  } else {
    console.log("Playlist is NOT sorted correctly.");
  }

  return isSorted;
};

/*
// Buscar duplicados en la playlist
export const findDuplicates = () => {
  onProgressStart("Finding duplicates...");
  let duplicates = {};

  playlistItems.forEach((video) => {
    let title = video.snippet.title.toLowerCase();
    if (duplicates[title]) {
      duplicates[title].push(video.snippet.title);
    } else {
      duplicates[title] = [video.snippet.title];
    }
  });

  let duplicateTitles = Object.values(duplicates).filter(v => v.length > 1).flat();
  onError(duplicateTitles.length > 0 ? "Duplicates found: " + duplicateTitles.join(", ") : "No duplicates found.");
  onProgressStop();
};
*/

/*
// Eliminar vídeos eliminados de la playlist
export const removeDeletedVideos = () => {
  onProgressStart("Removing deleted videos...");
  let deletedVideos = playlistItems.filter(video => video.snippet.title === "Deleted video" || video.snippet.title === "Private video");

  if (deletedVideos.length > 0) {
    deletePlaylistItems(deletedVideos)
      .catch((error) => onError(error.message))
      .finally(() => {
        onProgressStop();
        update();
      });
  } else {
    onError("No deleted videos found.");
    onProgressStop();
  }
};
*/

export const removeDeletedAndDuplicatesVideos = (playlist) => {
  console.log("Removing deleted and duplicates videos...");

  let selectedVideos = {};
  let duplicatesVideos = {};
  let repeatedTitles = {};
  let deletedVideos = {};

  playlist.forEach((video) => {
    let title = video.snippet.title.toLowerCase();

    // hacemos la comparación en minúsculas
    if (title === "deleted video" || title === "private video") {
      deletedVideos.push(video);
    }

    if (duplicatesVideos[title]) {
      duplicatesVideos[title].push(title);
    } else {
      duplicatesVideos[title] = [title];
    }
  });

  repeatedTitles = Object.keys(duplicatesVideos).filter(title => duplicatesVideos[title].length > 1);

  // Unimos el array de duplicatesVideos y deletedVideos y lo guardamos en selectedVideos
  selectedVideos = { ...deletedVideos, ...repeatedTitles };
  console.log("Selected videos:", selectedVideos);

  if (selectedVideos.length > 0) {
    deletePlaylistItems(selectedVideos)
      .catch((error) =>
        onError(error.message))
      .finally(() => {
        console.log("Deleted and duplicates videos removed successfully.");
        return true;
      });
  }
}

// Función para ordenar los vídeos no ordenados de la playlist
export const handleUnsortedVideosClicked = (playlist) => {
  console.log("Sorting videos...");

  let sortedPlaylist = sortPlaylistItems([...playlist], false);
  let moves = computeMinimalMoves(playlist, sortedPlaylist);

  if (moves.length > 0) {
    updatePlaylistItems(moves.map(move => move.video))
      .then(() => setPlaylistItems(sortedPlaylist))
      .catch((error) => onError(error.message))
      .finally(() => {
        console.log("Videos sorted successfully.");
      });
  }
};

// Función para ordenar TODA la playlist (Gasta mucha cuota de API)
export const handleSortClicked = (playlist, options) => {
  let confirmation = confirm("Are you sure you want to sort the playlist? Spend a lot of quota API");
  if (!confirmation) 
    return;

  console.log("Sorting videos...");

  let itemsCopy = [...playlist];
  if (options.shuffle) {
    itemsCopy = shufflePlaylistItems(itemsCopy);
  } else {
    itemsCopy = sortPlaylistItems(itemsCopy, options.descending);
  }

  itemsCopy.forEach((item, index) => {
    item.snippet.position = index;
  });

  /*updatePlaylistItems(itemsCopy)
    .then(() => setPlaylistItems(itemsCopy))
    .catch((error) => onError(error.message))
    .finally(() => {
    
    });*/
};