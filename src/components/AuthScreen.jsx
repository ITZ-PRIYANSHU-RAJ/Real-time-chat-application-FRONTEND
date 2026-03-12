import { useState } from "react";
import { HiSparkles } from "react-icons/hi2";
import { PiChatsCircleFill, PiLightningFill, PiUsersThreeFill } from "react-icons/pi";
import { api } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";

const defaultForm = { name: "", email: "", password: "" };

export const AuthScreen = () => {
  const { saveAuth } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const response = await api.post(endpoint, payload);
      saveAuth(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to continue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="hero-brand">
          <div className="hero-logo" aria-hidden="true">
            <PiChatsCircleFill />
          </div>
          <div>
            <div className="eyebrow">Realtime conversations, redesigned</div>
            <h1>TALKSY</h1>
          </div>
        </div>

        <div className="hero-story">
          <p>
            A sharper chat experience for direct messages, groups, files, and live updates
            with a landing screen that feels like a product, not a placeholder.
          </p>
          <div className="auth-points">
            <span>
              <PiLightningFill />
              Instant Socket.IO delivery
            </span>
            <span>
              <PiUsersThreeFill />
              Group rooms with profile controls
            </span>
            <span>
              <HiSparkles />
              Media sharing with polished UI
            </span>
          </div>
        </div>

        <div className="hero-panels">
          <section className="hero-panel hero-panel-primary">
            <div className="panel-label">Live flow</div>
            <strong>Fast, clean, and built for everyday messaging.</strong>
            <p>Designed to keep conversations readable while activity, media, and presence update in real time.</p>
          </section>

          <section className="hero-panel hero-panel-secondary">
            <div className="panel-label">Why it feels different</div>
            <ul className="hero-list">
              <li>Focused one-to-one and team conversations</li>
              <li>Distinct panels instead of one repeated card style</li>
              <li>Subtle motion, layered lighting, and stronger depth</li>
            </ul>
          </section>
        </div>
      </div>

      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-card-top">
          <div className="auth-card-badge">Access TALKSY</div>
          <div className="auth-card-glow" aria-hidden="true" />
        </div>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="auth-card-copy">
          {mode === "login"
            ? "Sign in to continue your conversations."
            : "Set up your profile and start chatting in seconds."}
        </p>
        {mode === "register" ? (
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        ) : null}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
};
