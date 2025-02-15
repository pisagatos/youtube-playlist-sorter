import React from "react"
import PropTypes from "prop-types"

const Header = (props) => {
  return (
    <header class="d-flex flex-wrap justify-content-center py-3">
      <a class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
        <span class="fs-4">Playlist Sorter for YouTube&trade;</span>
      </a>
      <div class="col-md-3 text-center" dangerouslySetInnerHTML={{ __html: props.statusMessage }}></div>
      <div class="col-md-3 text-end">
        <button className="btn btn-info pull-right header-logout" onClick={() => props.onLogout()}>Logout</button>
      </div>
    </header>
  )
}

Header.propTypes = {
  statusMessage: PropTypes.string,
  onLogout: PropTypes.func.isRequired
}

export default Header
