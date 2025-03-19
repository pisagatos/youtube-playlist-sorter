import React from "react"
import PropTypes from "prop-types"

const Header = (props) => {
  return (
    <header className="d-flex flex-wrap justify-content-center py-3">
      <a className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
        <span className="fs-4">Playlist Sorter for YouTube&trade;</span>
      </a>
      <div className="col-md-5 text-center" dangerouslySetInnerHTML={{ __html: props.statusMessage }}></div>
      <div className="col-md-3 text-end">
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
