import { useState } from "react";

export const GroupModal = ({
  users,
  open,
  onClose,
  onCreateGroup,
  onSearch,
}) => {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);

  if (!open) return null;

  const toggleUser = (userId) => {
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    await onCreateGroup({ name, participantIds: selected });
    setName("");
    setSelected([]);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h3>Create group chat</h3>
        <input
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input placeholder="Search members" onChange={(e) => onSearch(e.target.value)} />
        <div className="modal-list">
          {users.map((user) => (
            <label key={user._id} className="check-row">
              <input
                type="checkbox"
                checked={selected.includes(user._id)}
                onChange={() => toggleUser(user._id)}
              />
              <span>{user.name}</span>
            </label>
          ))}
        </div>
        <button type="submit">Create group</button>
      </form>
    </div>
  );
};
