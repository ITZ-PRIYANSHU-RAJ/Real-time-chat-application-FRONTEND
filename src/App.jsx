import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function Chat() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <h1 className="text-3xl font-bold">
        Chat App 🚀
      </h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;