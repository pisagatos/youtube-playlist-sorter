import React from "react"
import PropTypes from "prop-types"
import clientId from "./client-id"

const redirectUri = "http://localhost/playlist-sorter/oauth-callback"
const scope = "https://www.googleapis.com/auth/youtube"

class LoginPanel extends React.Component {
  constructor(props) {
    super(props)
    this.handleLoginClicked = this.handleLoginClicked.bind(this)
    this.handleOauthCallback = this.handleOauthCallback.bind(this)
    this.validateToken = this.validateToken.bind(this)
    this.handleBeforeNavigate = this.handleBeforeNavigate.bind(this)

    this.state = {
      loginError: null
    }
  }

  componentDidMount() {
    chrome.webNavigation.onBeforeNavigate.addListener(this.handleBeforeNavigate)
    chrome.webNavigation.onCompleted.addListener(this.handleBeforeNavigate)
  }

  componentWillUnmount() {
    chrome.webNavigation.onBeforeNavigate.removeListener(this.handleBeforeNavigate)
    chrome.webNavigation.onCompleted.removeListener(this.handleBeforeNavigate)
  }

  render() {
    let errorDiv = <div />
    if (this.state.loginError) {
      errorDiv =
        <div className={this.state.loginError ? "" : "hidden"}>
          Login failed: {this.state.loginError}
        </div>
    }

    return (
      <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-5 mb-3 fw-bold text-body-emphasis pb-4">Playlist Sorter for YouTube&trade;</h1>
        <div className="col-lg-6 mx-auto">
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <button type="button" className="btn btn-primary btn-lg px-4 gap-3" onClick={this.handleLoginClicked}>Login with YouTube</button>
          </div>
        </div>
        {errorDiv}
      </div>
    )
  }

  handleBeforeNavigate(details) {
    if (this.handleOauthCallback(details.url)) {
      // Close the login window
      chrome.tabs.remove(details.tabId)
    }
  }

  handleLoginFailed(error) {
    this.setState({ loginError: error })
  }

  handleLoginClicked() {
    let authUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
      "?client_id=" + clientId +
      "&redirect_uri=" + encodeURIComponent(redirectUri) +
      "&scope=" + encodeURIComponent(scope) +
      "&response_type=token"

    let width = 600
    let height = 600
    let left = (screen.width / 2) - (width / 2)
    let top = (screen.height / 2) - (height / 2)

    let options = {
      "url": authUrl,
      "width": width,
      "height": height,
      "left": Math.round(left),
      "top": Math.round(top),
      "type": "popup"
    }

    chrome.windows.create(options, () => { })
  }

  handleOauthCallback(url) {
    // Expecting something like:
    // http://localhost/playlist-sorter/oauth-callback#access_token=ya29.CiqvkQSLDvp28N_w&token_type=Bearer&expires_in=3600

    if (url.startsWith(redirectUri)) {
      let accessTokenParam = "access_token="
      let index = url.indexOf(accessTokenParam)
      let params = url.substring(index + accessTokenParam.length).split("&")
      let token = params[0]

      this.validateToken(token, (error) => {
        if (!error) {
          this.props.onLoginSuccess(token)
        } else {
          this.handleLoginFailed(error)
        }
      })

      return true
    }

    return false
  }

  // See https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps
  validateToken(token, callback) {
    let url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`

    fetch(url)
      .then((response) => {
        if (response.status != 200) {
          callback(false)
          return
        }

        response.json().then((data) => {
          callback(data.audience == clientId ? null : "Mismatched client ID")
        })
      })
      .catch((error) => callback(error))
  }
}

LoginPanel.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired
}

export default LoginPanel
