import React from "react"
import PropTypes from "prop-types"

const Sidebar = (props) => {
  return (
  <div className="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
      <div className="offcanvas-md offcanvas-end bg-body-tertiary" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="sidebarMenuLabel">YouTube&trade; Tools</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close">x</button>
        </div>
        <div className="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto">
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link d-flex align-items-center gap-2 active" aria-current="page" href="#">
                <svg className="bi" aria-hidden="true"><use xlink:href="#house-fill"></use></svg>
                Playlists Sorter
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link d-flex align-items-center gap-2" href="#">
                <svg className="bi" aria-hidden="true"><use xlink:href="#file-earmark"></use></svg>
                Database
              </a>
            </li>
          </ul>

          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-body-secondary text-uppercase">
            <span>Playlists</span>
            <a className="link-secondary" href="#" aria-label="Add a new report">
              <svg className="bi" aria-hidden="true"><use xlink:href="#plus-circle"></use></svg>
            </a>
          </h6>
          <ul className="nav flex-column mb-auto">
            <li className="nav-item">
              <a className="nav-link d-flex align-items-center gap-2" href="#">
                <svg className="bi" aria-hidden="true"><use xlink:href="#file-earmark-text"></use></svg>
                Current month
              </a>
            </li>
          </ul>

          <hr className="my-3">

          <ul className="nav flex-column mb-auto">
            <li className="nav-item">
              <a className="nav-link d-flex align-items-center gap-2" href="#">
                <svg className="bi" aria-hidden="true"><use xlink:href="#gear-wide-connected"></use></svg>
                Settings
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link d-flex align-items-center gap-2" href="#">
                <svg className="bi" aria-hidden="true"><use xlink:href="#door-closed"></use></svg>
                <button className="btn btn-info pull-right header-logout" onClick={() => props.onLogout()}>Logout</button>              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>




    <div className="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
      <div className="col">
        <header className="d-flex flex-wrap justify-content-center py-3">
          <a className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
            <span className="fs-4">YouTube&trade; Tools</span>
          </a>
          {/** Envolver en un menú, con el botón de cerrar sesión y el menú con las herramientas */}
          <div className="col-md-3 text-end">
            
          </div>
        </header>
      </div>
    </div>
  )
}

Sidebar.propTypes = {
  onLogout: PropTypes.func.isRequired
}

export default Sidebar
