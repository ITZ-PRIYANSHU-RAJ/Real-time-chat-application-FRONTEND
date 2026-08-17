import { motion } from "framer-motion";
import UserSearch from "./UserSearch.jsx";

const ChatSidebar = ({
  user,
  selectedUser,
  onSelectUser,
  onLogout,
}) => {
  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-slate-950 md:w-80">

      {/* Header */}
      <div className="border-b border-white/10 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              Talksy
            </h1>

            <p className="text-xs text-slate-500">
              Real-time conversations
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>

        <UserSearch onSelectUser={onSelectUser} />
      </div>

      {/* Current user */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 font-bold text-white">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-white">
              {user?.fullName}
            </p>

            <p className="text-xs text-green-400">
              ● Online
            </p>
          </div>
        </div>
      </div>

      {/* Selected conversation */}
      <div className="flex-1 overflow-y-auto p-3">
        {selectedUser ? (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onSelectUser(selectedUser)}
            className="flex w-full items-center gap-3 rounded-xl bg-white/10 p-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white">
              {selectedUser.fullName?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <p className="font-medium text-white">
                {selectedUser.fullName}
              </p>

              <p className="text-xs text-green-400">
                ● Online
              </p>
            </div>
          </motion.button>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="px-6 text-sm text-slate-600">
              Search for a user to start chatting
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;