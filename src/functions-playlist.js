



export function loadPlaylistItems() {
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

export function getPlaylistItems(pageToken, playlistId, playlistItems, callback) {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&part=contentDetails&playlistId=${playlistId}&maxResults=50`

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
                    this.deletedCount = 0;
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

export function sortPlaylistItems(playlistItems, isDescending) {
    return orderBy(playlistItems, v => v.snippet.title, isDescending ? "desc" : "asc", collator.compare)
}

export function shufflePlaylistItems(playlistItems) {
    for (let i = playlistItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // semi-colon here to keep eslint no-unexpected-multiline quiet
        [playlistItems[i], playlistItems[j]] = [playlistItems[j], playlistItems[i]]
    }

    return playlistItems
}

export function updatePercentComplete(itemsRemaining) {
    let complete = this.state.playlistItems.length - itemsRemaining.length
    let percentComplete = Math.floor(complete / this.state.playlistItems.length * 100)
    this.setState({
        percentComplete: percentComplete
    })
}

export function updatePlaylistItems(itemsRemaining) {
    this.updatePercentComplete(itemsRemaining)

    let toUpdate = itemsRemaining.shift()
    //console.log("toUpdate: " + toUpdate.snippet.title + " a la posición " + toUpdate.snippet.position);
    this.setState({
        currentlySortingVideoTitle: toUpdate.snippet.title
    })

    return this.updatePlaylistItem(toUpdate).then(() => {
        if (itemsRemaining.length > 0) {
            return this.updatePlaylistItems(itemsRemaining)
        }
    })
}

export function updatePlaylistItem(playlistItem) {
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

export function deletePlaylistItems(itemsRemaining) {
    this.updatePercentComplete(itemsRemaining);

    let toUpdate = itemsRemaining.shift();

    return this.deletePlaylistItem(toUpdate).then(() => {
        if (itemsRemaining.length > 0) {
            return this.deletePlaylistItems(itemsRemaining)
        }
    })
}

export function deletePlaylistItem(playlistItem) {
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
