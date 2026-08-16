import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import UserSearch from "../components/UserSearch.jsx";

const Chat = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-screen overflow-hidden">

        <motion.aside
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-sm flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h1 className="text-xl font-bold">
                Talksy
              </h1>

              <p className="text-xs text-slate-400">
                Messages
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>
          </div>

          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-medium">
                  {user?.fullName}
                </p>

                <p className="text-sm text-slate-400">
                  @{user?.username}
                </p>
              </div>

            </div>
          </div>

          <div className="p-4">
            <UserSearch
                onSelectUser={(selectedUser) => {
                console.log("Selected user:", selectedUser);
                }}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            <p className="px-2 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Recent Chats
            </p>

            <div className="rounded-xl p-3 text-center text-sm text-slate-500">
              No conversations yet
            </div>
          </div>
        </motion.aside>

        <main className="hidden flex-1 flex-col md:flex">

          <div className="flex flex-1 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-4xl">
                💬
              </div>

              <h2 className="text-2xl font-semibold">
                Welcome to Talksy
              </h2>

              <p className="mt-2 text-slate-500">
                Search for a user and start a conversation.
              </p>
            </motion.div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Chat;