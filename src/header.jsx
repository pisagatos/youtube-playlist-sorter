import React from "react"
import PropTypes from "prop-types"

const Header = (props) => {
  return (
    <div className="row">
      <div className="col">
        <header className="d-flex flex-wrap justify-content-center py-3">
          <a className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
            <span className="fs-4">YouTube&trade; Tools</span>
          </a>
          <div className="col-md-5 text-center" dangerouslySetInnerHTML={{ __html: props.statusMessage }}></div>
          {/** Envolver en un menú, con el botón de cerrar sesión y el menú con las herramientas */}
          <div className="col-md-3 text-end">
            <button className="btn btn-info pull-right header-logout" onClick={() => props.onLogout()}>Logout</button>
          </div>
        </header>
      </div>
    </div>
  )
}

Header.propTypes = {
  statusMessage: PropTypes.string,
  onLogout: PropTypes.func.isRequired
}

export default Header
