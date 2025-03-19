import React from "react"
import PropTypes from "prop-types"
import CircularProgressbar from "react-circular-progressbar"
import { compare, orderBy } from "natural-orderby"

import { update, isSort, findDuplicates } from "./playlist-manager"
import { getPlaylistItems, sortPlaylistItems, shufflePlaylistItems, updatePercentComplete, updatePlaylistItems, updatePlaylistItem } from "./playlist-manager-fetch"
import { handleUnsortedVideosClicked, handleSortClicked } from "./playlist-manager-sort"

const collator = new Intl.Collator("es", { sensitivity: "base" });

class PlaylistDetailsPanel extends React.Component {
  constructor(props) {
    super(props)

    // Bind the event handlers
    this.handleSortClicked = this.handleSortClicked.bind(this)
    this.handleUnsortedVideosClicked = this.handleUnsortedVideosClicked.bind(this)

    this.state = {
      playlistItems: null,
      percentComplete: 100,
      currentlySortingVideoTitle: "",
      deletedCount: null
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
                <div className="title" data-position={playlistItem.snippet.position} data-idonplaylist={playlistItem.id} data-idvideo={playlistItem.contentDetails.videoId}>{playlistItem.snippet.title}</div>
              </div>
            </a>
          </div>
        </li>
      )

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
            <a href="#" className="sort-link" title="Update changes's playlist" onClick={() => this.update()}>Update</a>
            <a href="#" className="sort-link" title="Figure out if the playlist is sorted" onClick={() => this.isSort()}>Is sort?</a>
            <a href="#" className="sort-link" title="Find duplicates on playlist" onClick={() => this.findDuplicates()}>Find duplicates</a>
            <a href="#" className="sort-link" title="Remove deleted videos on playlist" onClick={() => this.removeDeletedVideos()}>Remove deleted videos</a>
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

  getErrorMessage(data) {
    let error = data.error

    if (error) {
      if (error.errors && error.errors.length > 0) {
        if (error.errors[0].reason == "manualSortRequired") {
          let url = `https://www.youtube.com/playlist?list=${this.props.playlist.id}`
          let PlaylistComponent = `<a href="${url}" target="_blank">here</a>`
          return `You must first change the playlist to manual ordering by dragging a video to a different position ${PlaylistComponent}.`
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
