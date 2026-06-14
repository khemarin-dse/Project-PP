export default function Modal({ id, title, onClose, children, footer }) {
  return (
    <div className="modal-overlay open" onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{title}</div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
