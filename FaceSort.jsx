import { useState, useCallback, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────
   MOCK DATA – simulates backend classification
───────────────────────────────────────────────*/
const generateMockAlbums = (files) => {
  const count = Math.min(files.length, Math.max(2, Math.floor(files.length / 3)));
  return Array.from({ length: count }, (_, i) => {
    const assigned = files.filter((_, j) => j % count === i);
    return {
      id: i + 1,
      label: `Person ${i + 1}`,
      images: assigned.map((f) => URL.createObjectURL(f)),
      thumbnail: URL.createObjectURL(assigned[0]),
    };
  });
};

/* ─────────────────────────────────────────────
   ICONS (inline SVG, no dependencies)
───────────────────────────────────────────────*/
const Icon = {
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Folder: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Images: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Face: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   STYLES (injected once)
───────────────────────────────────────────────*/
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f7f6f3;
    --surface: #ffffff;
    --surface2: #f0eeea;
    --border: #e8e5de;
    --text: #1a1916;
    --muted: #888580;
    --accent: #2d6a4f;
    --accent-light: #e8f5ee;
    --accent2: #c77dff;
    --shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
    --shadow-lg: 0 8px 40px rgba(0,0,0,.12);
    --radius: 16px;
    --font: 'DM Sans', sans-serif;
    --font-display: 'DM Serif Display', serif;
    --transition: 0.22s cubic-bezier(.4,0,.2,1);
  }
  .dark {
    --bg: #141412;
    --surface: #1e1d1a;
    --surface2: #252420;
    --border: #2e2d28;
    --text: #f0ede6;
    --muted: #7a7870;
    --accent: #52b788;
    --accent-light: #1a2e22;
    --shadow: 0 1px 3px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.3);
    --shadow-lg: 0 8px 40px rgba(0,0,0,.5);
  }

  body { font-family: var(--font); background: var(--bg); color: var(--text); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes progress {
    0%   { width: 0%; }
    20%  { width: 25%; }
    45%  { width: 55%; }
    70%  { width: 72%; }
    90%  { width: 88%; }
    100% { width: 100%; }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50% { opacity: .5; }
  }
  @keyframes successBounce {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.15); }
    80%  { transform: scale(.95); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 40; }
    to   { stroke-dashoffset: 0; }
  }

  .fade-up   { animation: fadeUp .5s ease both; }
  .fade-in   { animation: fadeIn .4s ease both; }
  .scale-in  { animation: scaleIn .35s cubic-bezier(.34,1.56,.64,1) both; }

  .stagger-1 { animation-delay: .05s; }
  .stagger-2 { animation-delay: .12s; }
  .stagger-3 { animation-delay: .20s; }
  .stagger-4 { animation-delay: .28s; }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    transition: border-color var(--transition), background var(--transition), transform var(--transition);
    cursor: pointer;
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent);
    background: var(--accent-light);
    transform: scale(1.01);
  }
  .upload-zone.drag-over {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent);
  }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .65rem 1.35rem; border-radius: 10px;
    font-family: var(--font); font-size: .9rem; font-weight: 500;
    cursor: pointer; border: none; transition: all var(--transition);
    text-decoration: none; white-space: nowrap;
  }
  .btn-primary {
    background: var(--accent); color: #fff;
  }
  .btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.18); }
  .btn-primary:active { transform: translateY(0); }
  .btn-ghost {
    background: var(--surface2); color: var(--text);
  }
  .btn-ghost:hover { background: var(--border); }
  .btn-outline {
    background: transparent; color: var(--accent);
    border: 1.5px solid var(--accent);
  }
  .btn-outline:hover { background: var(--accent-light); }
  .btn-sm { padding: .45rem .9rem; font-size: .82rem; border-radius: 8px; }

  /* Album card */
  .album-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition);
    box-shadow: var(--shadow);
    animation: fadeUp .45s ease both;
  }
  .album-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent);
  }
  .album-card:hover .album-overlay { opacity: 1; }
  .album-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,.3);
    opacity: 0; transition: opacity var(--transition);
    display: flex; align-items: center; justify-content: center;
  }

  /* Gallery image */
  .gallery-img {
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 10px;
    transition: all var(--transition);
    cursor: zoom-in;
    border: 1px solid var(--border);
  }
  .gallery-img:hover { transform: scale(1.03); box-shadow: var(--shadow-lg); z-index: 1; position: relative; }

  /* Progress bar */
  .progress-bar-inner {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #52b788));
    animation: progress 4s cubic-bezier(.4,0,.2,1) forwards;
  }

  /* Spinner */
  .spinner {
    width: 48px; height: 48px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Circular avatar */
  .avatar-ring {
    border: 3px solid var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
    transition: box-shadow var(--transition);
  }
  .album-card:hover .avatar-ring {
    box-shadow: 0 0 0 5px var(--accent-light);
  }

  /* Success check */
  .check-circle {
    animation: successBounce .6s cubic-bezier(.34,1.56,.64,1) both;
  }
  .check-path {
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    animation: checkDraw .5s .4s ease forwards;
  }

  /* Nav */
  .nav { backdrop-filter: blur(12px); background: color-mix(in srgb, var(--surface) 85%, transparent); }

  /* Empty state */
  .empty-icon { animation: pulse 2.4s ease-in-out infinite; }

  /* Lightbox */
  .lightbox {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,.88);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn .2s ease;
    cursor: zoom-out;
    padding: 2rem;
  }
  .lightbox img {
    max-width: 90vw; max-height: 90vh;
    border-radius: 12px;
    object-fit: contain;
    box-shadow: 0 20px 80px rgba(0,0,0,.6);
    animation: scaleIn .25s cubic-bezier(.34,1.56,.64,1);
  }
`;

/* ─────────────────────────────────────────────
   COMPONENT: UploadBox
───────────────────────────────────────────────*/
function UploadBox({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const [count, setCount] = useState(0);
  const fileRef = useRef();
  const folderRef = useRef();

  const handle = useCallback((files) => {
    const valid = [...files].filter((f) =>
      f.name.toLowerCase().endsWith(".jpg") || f.name.toLowerCase().endsWith(".jpeg")
    );
    if (valid.length) { setCount(valid.length); onFiles(valid); }
  }, [onFiles]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handle(e.dataTransfer.files);
  }, [handle]);

  return (
    <div
      className={`upload-zone p-12 text-center ${dragging ? "drag-over" : ""}`}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => fileRef.current.click()}
    >
      {/* Hidden inputs */}
      <input ref={fileRef} type="file" multiple accept=".jpg,.jpeg" className="hidden"
        style={{ display: "none" }}
        onChange={(e) => handle(e.target.files)} />
      <input ref={folderRef} type="file" multiple accept=".jpg,.jpeg"
        style={{ display: "none" }}
        webkitdirectory="" directory=""
        onChange={(e) => handle(e.target.files)} />

      {/* Icon */}
      <div className="fade-up" style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "var(--accent-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 1.25rem",
        color: "var(--accent)",
      }}>
        <Icon.Images />
      </div>

      {count > 0 ? (
        <div className="scale-in" style={{ color: "var(--accent)", fontWeight: 600, fontSize: "1.1rem", marginBottom: ".5rem" }}>
          {count} image{count !== 1 ? "s" : ""} selected
        </div>
      ) : (
        <div className="fade-up stagger-1" style={{ marginBottom: ".5rem" }}>
          <div style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: ".35rem" }}>
            Drop images here
          </div>
          <div style={{ color: "var(--muted)", fontSize: ".88rem" }}>
            Supports .jpg and .jpeg files
          </div>
        </div>
      )}

      <div className="fade-up stagger-2" style={{ display: "flex", gap: ".75rem", justifyContent: "center", marginTop: "1.5rem" }}
        onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-primary" onClick={() => fileRef.current.click()}>
          <Icon.Upload /> Upload Images
        </button>
        <button className="btn btn-ghost" onClick={() => folderRef.current.click()}>
          <Icon.Folder /> Upload Folder
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: ProgressLoader
───────────────────────────────────────────────*/
function ProgressLoader({ onDone }) {
  const [pct, setPct] = useState(0);
  const phases = [
    "Detecting faces…",
    "Encoding facial features…",
    "Clustering identities…",
    "Organizing albums…",
    "Finalizing…",
  ];
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const intervals = [
      setTimeout(() => { setPct(22); setPhase(1); }, 600),
      setTimeout(() => { setPct(48); setPhase(2); }, 1600),
      setTimeout(() => { setPct(68); setPhase(3); }, 2700),
      setTimeout(() => { setPct(88); setPhase(4); }, 3600),
      setTimeout(() => { setPct(100); }, 4400),
      setTimeout(onDone, 5000),
    ];
    return () => intervals.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="fade-in" style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "4rem 2rem", gap: "2rem",
      minHeight: 360,
    }}>
      <div className="spinner" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: ".4rem" }}>
          Processing faces and organizing images…
        </div>
        <div style={{ color: "var(--muted)", fontSize: ".88rem" }}>{phases[phase]}</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
          <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>Progress</span>
          <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--accent)" }}>{pct}%</span>
        </div>
        <div style={{
          height: 6, borderRadius: 99, background: "var(--surface2)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "var(--accent)",
            width: `${pct}%`,
            transition: "width .7s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: SuccessScreen
───────────────────────────────────────────────*/
function SuccessScreen({ albumCount, onView }) {
  useEffect(() => {
    const t = setTimeout(onView, 1800);
    return () => clearTimeout(t);
  }, [onView]);

  return (
    <div className="fade-in" style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "4rem 2rem", gap: "1.5rem", minHeight: 360,
    }}>
      <div className="check-circle" style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 12px var(--accent-light)",
      }}>
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path className="check-path" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", marginBottom: ".4rem" }}>
          Images successfully categorized!
        </div>
        <div style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          Found <strong>{albumCount}</strong> unique person{albumCount !== 1 ? "s" : ""}. Opening albums…
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: AlbumCard
───────────────────────────────────────────────*/
function AlbumCard({ album, delay, onClick }) {
  return (
    <div className="album-card" style={{ animationDelay: `${delay}s` }} onClick={onClick}>
      {/* Mosaic preview */}
      <div style={{ position: "relative", height: 160, overflow: "hidden", background: "var(--surface2)" }}>
        {album.images.slice(0, 4).map((src, i) => (
          <img key={i} src={src} alt="" style={{
            position: "absolute",
            width: "50%", height: "50%",
            objectFit: "cover",
            top: i < 2 ? 0 : "50%",
            left: i % 2 === 0 ? 0 : "50%",
            opacity: album.images.length === 1 ? (i === 0 ? 1 : 0) : 1,
          }} />
        ))}
        <div className="album-overlay">
          <span style={{ color: "#fff", fontWeight: 600, fontSize: ".9rem" }}>View All</span>
        </div>
      </div>

      {/* Info row */}
      <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: ".85rem" }}>
        <img src={album.thumbnail} alt={album.label} className="avatar-ring"
          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: ".95rem", marginBottom: ".15rem" }}>{album.label}</div>
          <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>
            {album.images.length} image{album.images.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0, color: "var(--accent)" }}
          onClick={(e) => { e.stopPropagation(); alert(`Downloading ${album.label}…`); }}>
          <Icon.Download />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT: GalleryView
───────────────────────────────────────────────*/
function GalleryView({ album, onBack }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="fade-up" style={{ padding: "1.5rem 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><Icon.Back /> Back</button>
        <img src={album.thumbnail} alt="" className="avatar-ring"
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{album.label}</div>
          <div style={{ color: "var(--muted)", fontSize: ".82rem" }}>{album.images.length} images</div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }}
          onClick={() => alert(`Downloading ${album.label}…`)}>
          <Icon.Download /> Download Album
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "1rem",
      }}>
        {album.images.map((src, i) => (
          <img key={i} src={src} alt={`${album.label} ${i + 1}`} className="gallery-img"
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => setLightbox(src)} />
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────*/
export default function App() {
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState("upload"); // upload | processing | success | albums | gallery
  const [files, setFiles] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activeAlbum, setActiveAlbum] = useState(null);

  const onFiles = useCallback((f) => setFiles(f), []);

  const process = () => {
    if (!files.length) return;
    setScreen("processing");
  };

  const onProcessDone = useCallback(() => {
    const generated = generateMockAlbums(files);
    setAlbums(generated);
    setScreen("success");
  }, [files]);

  const onSuccess = useCallback(() => setScreen("albums"), []);

  const reset = () => {
    setFiles([]); setAlbums([]); setActiveAlbum(null); setScreen("upload");
  };

  return (
    <>
      <style>{CSS}</style>
      <div className={dark ? "dark" : ""} style={{ minHeight: "100vh", background: "var(--bg)", transition: "background .3s, color .3s" }}>

        {/* NAV */}
        <nav className="nav" style={{
          position: "sticky", top: 0, zIndex: 100,
          borderBottom: "1px solid var(--border)",
          padding: ".85rem 2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon.Face />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", letterSpacing: "-.01em" }}>
              FaceSort
            </span>
          </div>
          <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
            {screen === "albums" && (
              <button className="btn btn-primary btn-sm"
                onClick={() => alert("Downloading all albums…")}>
                <Icon.Download /> Download All
              </button>
            )}
            {screen !== "upload" && (
              <button className="btn btn-ghost btn-sm" onClick={reset}>New Session</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setDark(!dark)}
              style={{ padding: ".45rem" }}>
              {dark ? <Icon.Sun /> : <Icon.Moon />}
            </button>
          </div>
        </nav>

        {/* CONTENT */}
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* ── UPLOAD SCREEN ── */}
          {screen === "upload" && (
            <div>
              <div className="fade-up" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", marginBottom: ".6rem", lineHeight: 1.2 }}>
                  Organize faces,<br />
                  <span style={{ fontStyle: "italic", color: "var(--accent)" }}>automatically.</span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: ".95rem", maxWidth: 420, margin: "0 auto" }}>
                  Upload a collection of photos and FaceSort groups them by person — instantly.
                </div>
              </div>

              <div className="fade-up stagger-2">
                <UploadBox onFiles={onFiles} />
              </div>

              {files.length > 0 && (
                <div className="fade-up" style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                  <button className="btn btn-primary" style={{ padding: ".75rem 2.5rem", fontSize: "1rem" }}
                    onClick={process}>
                    Process Images →
                  </button>
                </div>
              )}

              {/* Empty hint */}
              {files.length === 0 && (
                <div className="fade-up stagger-4" style={{ textAlign: "center", marginTop: "3rem", color: "var(--muted)" }}>
                  <div className="empty-icon" style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>🖼️</div>
                  <div style={{ fontSize: ".88rem" }}>Upload images to get started</div>
                </div>
              )}
            </div>
          )}

          {/* ── PROCESSING ── */}
          {screen === "processing" && (
            <div style={{
              background: "var(--surface)", borderRadius: "var(--radius)",
              border: "1px solid var(--border)", boxShadow: "var(--shadow)",
            }}>
              <ProgressLoader onDone={onProcessDone} />
            </div>
          )}

          {/* ── SUCCESS ── */}
          {screen === "success" && (
            <div style={{
              background: "var(--surface)", borderRadius: "var(--radius)",
              border: "1px solid var(--border)", boxShadow: "var(--shadow)",
            }}>
              <SuccessScreen albumCount={albums.length} onView={onSuccess} />
            </div>
          )}

          {/* ── ALBUMS GRID ── */}
          {screen === "albums" && !activeAlbum && (
            <div>
              <div className="fade-up" style={{ marginBottom: "1.75rem" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", marginBottom: ".3rem" }}>
                  Your Albums
                </div>
                <div style={{ color: "var(--muted)", fontSize: ".88rem" }}>
                  {albums.length} person{albums.length !== 1 ? "s" : ""} detected from {files.length} images
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.25rem",
              }}>
                {albums.map((album, i) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    delay={i * 0.07}
                    onClick={() => setActiveAlbum(album)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── GALLERY VIEW ── */}
          {screen === "albums" && activeAlbum && (
            <GalleryView album={activeAlbum} onBack={() => setActiveAlbum(null)} />
          )}
        </main>
      </div>
    </>
  );
}
