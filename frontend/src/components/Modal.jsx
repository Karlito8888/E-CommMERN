const Modal = ({ isOpen, onClose, children }) => {
  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          tabIndex="-1"
        >
          <div className="modal-background"></div>
          <div className="modal-content">
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Fermer la modal"
            >
              X
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
