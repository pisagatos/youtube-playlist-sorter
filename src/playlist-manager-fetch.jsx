let ACCESS_TOKEN = "";

export const setAccessToken = (token) => {
  ACCESS_TOKEN = token;
};

export const loadPlaylistItems = async (playlistId, onError, onProgressStop) => {
  try {
    let playlistItems = [];
    await getPlaylistItems(null, playlistId, playlistItems);
    //onProgressStop();
    return playlistItems;
  } catch (error) {
    console.log(`Error retrieving playlist details: ${error}`);
    throw error;
  }
};

export const getPlaylistItems = async (pageToken, playlistId, playlistItems) => {
  let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&part=contentDetails&playlistId=${playlistId}&maxResults=50`;
  if (pageToken) {
    url += "&pageToken=" + pageToken;
  }

  let options = {
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`
    }
  };

  try {
    let response = await fetch(url, options);
    if (!response.ok) {
      callback(response.status);
      return;
    }
    
    let data = await response.json();
    data.items.forEach(playlistItem => {
      if (!playlistItem.snippet.thumbnails || !playlistItem.snippet.thumbnails.default) {
        playlistItem.snippet.thumbnails = {
          default: {
            url: "https://i.ytimg.com/img/no_thumbnail.jpg",
            width: 120,
            height: 90
          }
        };
      }
      playlistItems.push(playlistItem);
    });

    if (data.nextPageToken) {
      await getPlaylistItems(data.nextPageToken, playlistId, playlistItems);
    } else {
      //callback();
    }
  } catch (error) {
    //callback(error);
    console.error("Error retrieving playlist items:", error);
    throw error;    
  }
};

export const sortPlaylistItems = (playlistItems, isDescending) => {
  return [...playlistItems].sort((a, b) =>
    isDescending ? b.snippet.title.localeCompare(a.snippet.title) : a.snippet.title.localeCompare(b.snippet.title)
  );
};

export const shufflePlaylistItems = (playlistItems) => {
  return playlistItems.sort(() => Math.random() - 0.5);
};

export const updatePlaylistItem = async (playlistItem) => {
  const url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet";
  const updateItem = {
    id: playlistItem.id,
    snippet: {
      playlistId: playlistItem.snippet.playlistId,
      resourceId: playlistItem.snippet.resourceId,
      position: playlistItem.snippet.position
    }
  };

  const options = {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updateItem)
  };

  try {
    let response = await fetch(url, options);
    if (!response.ok) {
      let data = await response.json();
      throw new Error(`Error updating playlist item: ${data.error?.message || response.status}`);
    }
  } catch (error) {
    console.error("Error updating playlist item:", error);
    throw error;
  }
};

export const deletePlaylistItems = async (itemsRemaining, updatePercentComplete) => {
  updatePercentComplete(itemsRemaining);
  let toUpdate = itemsRemaining.shift();
  await deletePlaylistItem(toUpdate.id);
  if (itemsRemaining.length > 0) {
    return deletePlaylistItems(itemsRemaining, updatePercentComplete);
  }
};

export const deletePlaylistItem = async (playlistItemId) => {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?id=${playlistItemId}`;
  const options = {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    }
  };

  try {
    let response = await fetch(url, options);
    if (!response.ok) {
      let data = await response.json();
      throw new Error(`Error deleting playlist item: ${data.error?.message || response.status}`);
    }
  } catch (error) {
    console.error("Error deleting playlist item:", error);
    throw error;
  }
};
