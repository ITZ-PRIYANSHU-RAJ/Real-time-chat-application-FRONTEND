export const UserFinderModal = ({
  users,
  open,
  onClose,
  onSearch,
  onStartChat,
}) =>
  open ? (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Find people</h3>
        <input placeholder="Search by name or email" onChange={(e) => onSearch(e.target.value)} />
        <div className="modal-list">
          {users.map((user) => (
            <button key={user._id} className="modal-row" onClick={() => onStartChat(user._id)}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;
