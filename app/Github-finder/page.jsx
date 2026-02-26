"use client";

import { useState } from "react";
import Image from "next/image";

const COLORS = {
  bg: "#0a0a14",
  card: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.1)",
  violet: "#7c3aed",
  fuchsia: "#c026d3",
  cyan: "#06b6d4",
};

function FloatingBlobs() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-160px", left: "-160px", width: 600, height: 600, borderRadius: "50%", background: "rgba(124,58,237,0.18)", filter: "blur(120px)", animation: "blob 10s infinite" }} />
      <div style={{ position: "absolute", top: "33%", right: "-160px", width: 500, height: 500, borderRadius: "50%", background: "rgba(192,38,211,0.15)", filter: "blur(120px)", animation: "blob 10s infinite 2s" }} />
      <div style={{ position: "absolute", bottom: "-160px", left: "33%", width: 400, height: 400, borderRadius: "50%", background: "rgba(6,182,212,0.15)", filter: "blur(120px)", animation: "blob 10s infinite 4s" }} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "16px 24px",
        textAlign: "center",
        flex: 1,
        minWidth: 80,
        transition: "border-color 0.3s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(192,38,211,0.4)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Space Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function RepoCard({ repo }) {
  const langColors = {
    JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3776ab",
    HTML: "#e34c26", CSS: "#563d7c", Vue: "#42b883", React: "#61dafb",
    Go: "#00add8", Rust: "#ce422b", Java: "#b07219",
  };
  const color = langColors[repo.language] || "#6b7280";

  return (
    <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: "20px 22px",
          transition: "all 0.3s",
          cursor: "pointer",
          height: "100%",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(192,38,211,0.4)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#c084fc", fontFamily: "'Space Mono', monospace", wordBreak: "break-word", flex: 1 }}>{repo.name}</div>
          {repo.fork && <span style={{ fontSize: 10, background: "rgba(255,255,255,0.07)", color: "#9ca3af", borderRadius: 20, padding: "2px 8px", marginLeft: 8, whiteSpace: "nowrap" }}>fork</span>}
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 14px", lineHeight: 1.6, minHeight: 36 }}>{repo.description || "No description provided."}</p>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#6b7280", alignItems: "center", flexWrap: "wrap" }}>
          {repo.language && (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
              <span style={{ color: "#d1d5db" }}>{repo.language}</span>
            </span>
          )}
          <span>⭐ {repo.stargazers_count}</span>
          <span>🍴 {repo.forks_count}</span>
        </div>
      </div>
    </a>
  );
}

export default function GitHubFinder() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [filterLang, setFilterLang] = useState("All");

  const search = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setUser(null);
    setRepos([]);

    try {
      const res = await fetch(`/api/github/user?username=${encodeURIComponent(query.trim())}`);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Server returned an invalid response. Is the API route running?");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setUser(data.user);
      setRepos(data.repos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") search(); };

  const languages = ["All", ...Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort()];

  const filteredRepos = repos
    .filter(r => filterLang === "All" || r.language === filterLang)
    .sort((a, b) => {
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      if (sortBy === "forks") return b.forks_count - a.forks_count;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a14; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div style={{ minHeight: "100vh", background: COLORS.bg, color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "0 0 80px" }}>
        <FloatingBlobs />

        {/* HEADER */}
        <div style={{ textAlign: "center", padding: "80px 24px 48px", animation: "fadeUp 0.8s ease both" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c084fc", marginBottom: 16, fontWeight: 600 }}>
              GitHub API
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            <span style={{ color: "#fff" }}>GitHub </span>
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #c084fc, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Profile Finder</span>
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 16, maxWidth: 420, margin: "0 auto" }}>Search any GitHub user and explore their repositories, status, and activity.</p>
        </div>

        {/* SEARCH BAR */}
        <div style={{ maxWidth: 560, margin: "0 auto 56px", padding: "0 24px", animation: "fadeUp 0.8s ease 0.1s both" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Enter a GitHub username..."
              style={{
                flex: 1, padding: "14px 20px", borderRadius: 999,
                background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.border}`,
                color: "#fff", fontSize: 15, outline: "none", fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(192,38,211,0.5)"}
              onBlur={e => e.target.style.borderColor = COLORS.border}
            />
            <button
              onClick={search}
              disabled={loading}
              style={{
                padding: "14px 28px", borderRadius: 999, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, #7c3aed, #c026d3)", color: "#fff",
                fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 0 30px rgba(124,58,237,0.35)", transition: "all 0.3s",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 16, padding: "12px 20px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13, textAlign: "center" }}>
              {error}
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #c084fc", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#9ca3af", fontSize: 13, animation: "pulse 1.5s ease infinite" }}>Fetching profile...</p>
          </div>
        )}

        {/* PROFILE + REPOS */}
        {user && !loading && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", animation: "fadeUp 0.7s ease both" }}>

            {/* USER CARD */}
            <div style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 24, padding: "36px 40px", marginBottom: 32,
              display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap",
            }}>
              <Image
                src={user.avatar_url}
                alt={user.login}
                width={100}
                height={100}
                style={{ borderRadius: "50%", border: "2px solid rgba(192,38,211,0.5)", boxShadow: "0 0 40px rgba(192,38,211,0.3)", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{user.name || user.login}</h2>
                  {user.name && <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Space Mono', monospace" }}>@{user.login}</span>}
                </div>
                {user.bio && <p style={{ color: "#d1d5db", fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>{user.bio}</p>}
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
                  {user.location && <span>📍 {user.location}</span>}
                  {user.company && <span>🏢 {user.company}</span>}
                  {user.blog && <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`} target="_blank" rel="noreferrer" style={{ color: "#c084fc", textDecoration: "none" }}>🔗 {user.blog}</a>}
                  <span>📅 Joined {new Date(user.created_at).getFullYear()}</span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Repos", value: user.public_repos },
                    { label: "Followers", value: user.followers },
                    { label: "Following", value: user.following },
                    { label: "Gists", value: user.public_gists },
                  ].map(s => <StatCard key={s.label} {...s} />)}
                </div>
              </div>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "10px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)",
                  color: "#d1d5db", fontSize: 13, fontWeight: 600, textDecoration: "none",
                  transition: "all 0.25s", flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(192,38,211,0.4)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#d1d5db"; }}
              >
                View on GitHub ↗
              </a>
            </div>

            {/* FILTERS */}
            {repos.length > 0 && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {languages.slice(0, 8).map(lang => (
                    <button key={lang} onClick={() => setFilterLang(lang)} style={{
                      padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid",
                      borderColor: filterLang === lang ? "#c026d3" : COLORS.border,
                      background: filterLang === lang ? "rgba(192,38,211,0.15)" : "transparent",
                      color: filterLang === lang ? "#e879f9" : "#9ca3af",
                      transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                    }}>{lang}</button>
                  ))}
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                  padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${COLORS.border}`, color: "#d1d5db", fontSize: 12,
                  outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>
                  <option value="updated">Recently Updated</option>
                  <option value="stars">Most Stars</option>
                  <option value="forks">Most Forks</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            )}

            {/* REPOS HEADER */}
            {repos.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#c084fc", fontWeight: 600 }}>
                  Repositories
                </span>
                <span style={{ marginLeft: 10, fontSize: 12, color: "#6b7280" }}>
                  {filteredRepos.length} of {repos.length} shown
                </span>
              </div>
            )}

            {/* REPO GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {filteredRepos.map(repo => <RepoCard key={repo.id} repo={repo} />)}
            </div>

            {filteredRepos.length === 0 && repos.length > 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#6b7280", fontSize: 14 }}>
                No repositories match the selected filter.
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {!user && !loading && !error && (
          <div style={{ textAlign: "center", padding: "20px 24px 0", color: "#374151" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🐙</div>
            <p style={{ fontSize: 14 }}>Enter a GitHub username above to get started</p>
          </div>
        )}
      </div>
    </>
  );
}