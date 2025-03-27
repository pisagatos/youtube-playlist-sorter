import React from "react";

const ModalComponent = ({ show, onClose, title, items, handleFilterChange, setFilterItems, viewModeItems, setViewItems }) => {
  return (
    <div className={`modal fade ${show ? "show d-block" : "d-none"}`} tabIndex="-1">
      <div className="modal-lg modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="container-fluid">
              <div className="row sticky-top bg-white p-2 z-3 mb-3">
                <div className="col-10">
                  {/* Buscador de items */}
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Search..."
                    onKeyUp={handleFilterChange((setFilterItems))}
                  />
                </div>
                {/* Ver modo en grid o lista */}
                <div className="col-1">
                  <div className="btn-group" role="group">
                    <button type="button" className={`btn btn-outline-secondary ${viewModeItems === "list" ? "active" : ""}`} onClick={() => setViewItems("list")}>
                      <i className="bi bi-list-ul"></i>
                    </button>
                    <button type="button" className={`btn btn-outline-secondary ${viewModeItems === "grid" ? "active" : ""}`} onClick={() => setViewItems("grid")}>
                      <i className="bi bi-grid-3x3-gap-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
              {/* Lista de items */}
              <ul className="list-group">
                {items.map((item, index) => (
                  <li className="list-group-item icon-link" key={index}>
                    {viewModeItems === "grid" ? (
                      <img className="rounded float-start" src={item.snippet.thumbnails.default.url} alt={item.snippet.title} title={item.snippet.title} />
                    ) : null}
                    {item.snippet.title}</li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;