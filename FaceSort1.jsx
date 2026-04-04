import { useState, useCallback, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// MOCK DATA
// Simulates what your Python backend returns after face clustering.
// Replace generateMockAlbums() with a real API call when backend is ready.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// ICONS  -  all inline SVG, zero external dependencies
// ---------------------------------------------------------------------------
const Icon = {
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Folder: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Images: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Face: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  // USP section icons
  CloudOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9.59 9.59A5 5 0 015 14H4a4 4 0 00-.78 7.93M16.73 10A9 9 0 0120 17.27"/>
      <path d="M20 17H4.73"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <path d="M9.5 2a4.5 4.5 0 014.5 4.5"/>
      <path d="M9.5 2C7 2 5 4 5 6.5c0 1.5.7 2.8 1.8 3.7"/>
      <path d="M14 6.5c0-2.5 2-4.5 4.5-4.5S23 4 23 6.5c0 2-1.2 3.7-3 4.4"/>
      <path d="M1 13.5C1 11 3 9 5.5 9c1.3 0 2.4.5 3.3 1.4"/>
      <path d="M20 10c1.7.7 3 2.4 3 4.5 0 2.5-2 4.5-4.5 4.5"/>
      <path d="M5.5 9C3 9 1 11 1 13.5 1 16 3 18 5.5 18c.9 0 1.8-.3 2.5-.7"/>
      <path d="M18.5 18c-2 1.2-4.4 1.5-6.5.7"/>
      <path d="M12 14c0 2.5-1.5 4.7-3.5 5.7"/>
      <path d="M12 14c0-3 2.5-5.5 5.5-5.5"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// GLOBAL CSS  -  injected via <style> tag, no Tailwind compilation needed.
// Uses CSS custom properties for full light/dark mode support.
// ---------------------------------------------------------------------------
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:           #f7f6f3;
    --surface:      #ffffff;
    --surface2:     #f0eeea;
    --border:       #e8e5de;
    --text:         #1a1916;
    --muted:        #888580;
    --accent:       #2d6a4f;
    --accent-light: #e8f5ee;
    --shadow:       0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
    --shadow-lg:    0 8px 40px rgba(0,0,0,.12);
    --radius:       16px;
    --font:         'DM Sans', sans-serif;
    --font-display: 'DM Serif Display', serif;
    --transition:   0.22s cubic-bezier(.4,0,.2,1);
  }
  .dark {
    --bg:           #141412;
    --surface:      #1e1d1a;
    --surface2:     #252420;
    --border:       #2e2d28;
    --text:         #f0ede6;
    --muted:        #7a7870;
    --accent:       #52b788;
    --accent-light: #1a2e22;
    --shadow:       0 1px 3px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.3);
    --shadow-lg:    0 8px 40px rgba(0,0,0,.5);
  }

  body { font-family: var(--font); background: var(--bg); color: var(--text); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes successBounce {
    0%   { transform:scale(0); opacity:0; }
    60%  { transform:scale(1.15); }
    80%  { transform:scale(.95); }
    100% { transform:scale(1); opacity:1; }
  }
  @keyframes checkDraw { from { stroke-dashoffset:40; } to { stroke-dashoffset:0; } }

  .fade-up  { animation: fadeUp  .5s ease both; }
  .fade-in  { animation: fadeIn  .4s ease both; }
  .scale-in { animation: scaleIn .35s cubic-bezier(.34,1.56,.64,1) both; }
  .stagger-1 { animation-delay:.05s; }
  .stagger-2 { animation-delay:.12s; }
  .stagger-3 { animation-delay:.20s; }
  .stagger-4 { animation-delay:.28s; }

  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    transition: border-color var(--transition), background var(--transition), transform var(--transition);
    cursor: pointer;
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent); background: var(--accent-light); transform: scale(1.01);
  }
  .upload-zone.drag-over {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent);
  }

  .btn {
    display: inline-flex; align-items: center; gap:.5rem;
    padding:.65rem 1.35rem; border-radius:10px;
    font-family: var(--font); font-size:.9rem; font-weight:500;
    cursor:pointer; border:none; transition:all var(--transition); white-space:nowrap;
  }
  .btn-primary  { background:var(--accent); color:#fff; }
  .btn-primary:hover  { filter:brightness(1.12); transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,.18); }
  .btn-primary:active { transform:translateY(0); }
  .btn-ghost    { background:var(--surface2); color:var(--text); }
  .btn-ghost:hover    { background:var(--border); }
  .btn-outline  { background:transparent; color:var(--accent); border:1.5px solid var(--accent); }
  .btn-outline:hover  { background:var(--accent-light); }
  .btn-sm       { padding:.45rem .9rem; font-size:.82rem; border-radius:8px; }

  .album-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius); overflow:hidden; cursor:pointer;
    transition:all var(--transition); box-shadow:var(--shadow);
    animation: fadeUp .45s ease both;
  }
  .album-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--accent); }
  .album-card:hover .album-overlay { opacity:1; }
  .album-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,.3);
    opacity:0; transition:opacity var(--transition);
    display:flex; align-items:center; justify-content:center;
  }

  .gallery-img {
    aspect-ratio:1; object-fit:cover; border-radius:10px;
    transition:all var(--transition); cursor:zoom-in; border:1px solid var(--border);
  }
  .gallery-img:hover { transform:scale(1.03); box-shadow:var(--shadow-lg); z-index:1; position:relative; }

  .spinner {
    width:48px; height:48px;
    border:3px solid var(--border); border-top-color:var(--accent);
    border-radius:50%; animation:spin 1s linear infinite;
  }

  .avatar-ring {
    border:3px solid var(--accent); box-shadow:0 0 0 3px var(--accent-light);
    transition:box-shadow var(--transition);
  }
  .album-card:hover .avatar-ring { box-shadow:0 0 0 5px var(--accent-light); }

  .check-circle { animation:successBounce .6s cubic-bezier(.34,1.56,.64,1) both; }
  .check-path   { stroke-dasharray:40; stroke-dashoffset:40; animation:checkDraw .5s .4s ease forwards; }

  .nav { backdrop-filter:blur(12px); background:color-mix(in srgb, var(--surface) 85%, transparent); }
  .empty-icon { animation:pulse 2.4s ease-in-out infinite; }

  .lightbox {
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.88);
    display:flex; align-items:center; justify-content:center;
    animation:fadeIn .2s ease; cursor:zoom-out; padding:2rem;
  }
  .lightbox img {
    max-width:90vw; max-height:90vh; border-radius:12px;
    object-fit:contain; box-shadow:0 20px 80px rgba(0,0,0,.6);
    animation:scaleIn .25s cubic-bezier(.34,1.56,.64,1);
  }

  /* === WHY FACESORT - USP section === */
  .usp-section {
    margin-top: 3.5rem;
    padding-top: 3rem;
    border-top: 1px solid var(--border);
  }

  .privacy-badge {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    background: var(--accent-light);
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: 99px;
    padding: .3rem .9rem;
    font-size: .78rem;
    font-weight: 600;
    letter-spacing: .03em;
    margin-bottom: 1rem;
    animation: fadeUp .4s ease both;
  }

  /* 3-col grid that collapses to 2, then 1 on small screens */
  .usp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.1rem;
    margin-top: 2rem;
  }
  @media (max-width: 760px) { .usp-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .usp-grid { grid-template-columns: 1fr; } }

  /* Individual feature card */
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.4rem 1.3rem;
    box-shadow: var(--shadow);
    animation: fadeUp .55s ease both;
    position: relative;
    overflow: hidden;
    transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
  }
  /* Accent gradient wash that fades in on hover */
  .feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--accent-light) 0%, transparent 65%);
    opacity: 0;
    transition: opacity var(--transition);
    pointer-events: none;
  }
  .feature-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-lg); border-color:var(--accent); }
  .feature-card:hover::before { opacity: 1; }

  /* Icon bubble */
  .fc-icon-wrap {
    width: 50px; height: 50px;
    border-radius: 12px;
    background: var(--accent-light);
    color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem;
    transition: background var(--transition), color var(--transition);
    position: relative; z-index: 1;
  }
  /* Icon flips to solid on hover */
  .feature-card:hover .fc-icon-wrap { background: var(--accent); color: #fff; }

  .fc-text  { position: relative; z-index: 1; }
  .fc-title { font-weight:700; font-size:.95rem; letter-spacing:-.01em; margin-bottom:.35rem; }
  .fc-desc  { color:var(--muted); font-size:.84rem; line-height:1.65; }

  @media (max-width: 480px) { .feature-card { padding: 1.15rem; } }
`;

// ---------------------------------------------------------------------------
// COMPONENT: UploadBox
// ---------------------------------------------------------------------------
function UploadBox({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const [count,    setCount]    = useState(0);
  const fileRef   = useRef();
  const folderRef = useRef();

  const handle = useCallback((files) => {
    const valid = [...files].filter((f) =>
      f.name.toLowerCase().endsWith(".jpg") || f.name.toLowerCase().endsWith(".jpeg")
    );
    if (valid.length) { setCount(valid.length); onFiles(valid); }
  }, [onFiles]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); handle(e.dataTransfer.files);
  }, [handle]);

  return (
    <div
      className={`upload-zone ${dragging ? "drag-over" : ""}`}
      style={{ padding:"3rem 2rem", textAlign:"center" }}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true);  }}
      onDragOver ={(e) => { e.preventDefault(); setDragging(true);  }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => fileRef.current.click()}
    >
      <input ref={fileRef}   type="file" multiple accept=".jpg,.jpeg"
        style={{ display:"none" }} onChange={(e) => handle(e.target.files)} />
      <input ref={folderRef} type="file" multiple accept=".jpg,.jpeg"
        style={{ display:"none" }} webkitdirectory="" directory=""
        onChange={(e) => handle(e.target.files)} />

      <div className="fade-up" style={{
        width:72, height:72, borderRadius:"50%",
        background:"var(--accent-light)", color:"var(--accent)",
        display:"flex", alignItems:"center", justifyContent:"center",
        margin:"0 auto 1.25rem",
      }}>
        <Icon.Images />
      </div>

      {count > 0 ? (
        <div className="scale-in"
          style={{ color:"var(--accent)", fontWeight:600, fontSize:"1.1rem", marginBottom:".5rem" }}>
          {count} image{count !== 1 ? "s" : ""} selected
        </div>
      ) : (
        <div className="fade-up stagger-1" style={{ marginBottom:".5rem" }}>
          <div style={{ fontWeight:600, fontSize:"1.05rem", marginBottom:".35rem" }}>Drop images here</div>
          <div style={{ color:"var(--muted)", fontSize:".88rem" }}>Supports .jpg and .jpeg files</div>
        </div>
      )}

      <div className="fade-up stagger-2"
        style={{ display:"flex", gap:".75rem", justifyContent:"center", marginTop:"1.5rem" }}
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

// ---------------------------------------------------------------------------
// COMPONENT: ProgressLoader
// ---------------------------------------------------------------------------
function ProgressLoader({ onDone }) {
  const [pct,   setPct]   = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = [
    "Detecting faces...",
    "Encoding facial features...",
    "Clustering identities...",
    "Organising albums...",
    "Finalising...",
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => { setPct(22); setPhase(1); }, 600),
      setTimeout(() => { setPct(48); setPhase(2); }, 1600),
      setTimeout(() => { setPct(68); setPhase(3); }, 2700),
      setTimeout(() => { setPct(88); setPhase(4); }, 3600),
      setTimeout(() => setPct(100),                   4400),
      setTimeout(onDone,                              5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="fade-in" style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"4rem 2rem", gap:"2rem", minHeight:360,
    }}>
      <div className="spinner" />
      <div style={{ textAlign:"center" }}>
        <div style={{ fontWeight:600, fontSize:"1.1rem", marginBottom:".4rem" }}>
          Processing faces and organising images...
        </div>
        <div style={{ color:"var(--muted)", fontSize:".88rem" }}>{phases[phase]}</div>
      </div>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".5rem" }}>
          <span style={{ fontSize:".82rem", color:"var(--muted)" }}>Progress</span>
          <span style={{ fontSize:".82rem", fontWeight:600, color:"var(--accent)" }}>{pct}%</span>
        </div>
        <div style={{ height:6, borderRadius:99, background:"var(--surface2)", overflow:"hidden" }}>
          <div style={{
            height:"100%", borderRadius:99, background:"var(--accent)",
            width:`${pct}%`, transition:"width .7s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: SuccessScreen
// ---------------------------------------------------------------------------
function SuccessScreen({ albumCount, onView }) {
  useEffect(() => {
    const t = setTimeout(onView, 1800);
    return () => clearTimeout(t);
  }, [onView]);

  return (
    <div className="fade-in" style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"4rem 2rem", gap:"1.5rem", minHeight:360,
    }}>
      <div className="check-circle" style={{
        width:80, height:80, borderRadius:"50%", background:"var(--accent)",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 0 0 12px var(--accent-light)",
      }}>
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path className="check-path" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"1.6rem", marginBottom:".4rem" }}>
          Images successfully categorised!
        </div>
        <div style={{ color:"var(--muted)", fontSize:".9rem" }}>
          Found <strong>{albumCount}</strong> unique person{albumCount !== 1 ? "s" : ""}. Opening albums...
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: AlbumCard
// ---------------------------------------------------------------------------
function AlbumCard({ album, delay, onClick }) {
  return (
    <div className="album-card" style={{ animationDelay:`${delay}s` }} onClick={onClick}>
      <div style={{ position:"relative", height:160, overflow:"hidden", background:"var(--surface2)" }}>
        {album.images.slice(0, 4).map((src, i) => (
          <img key={i} src={src} alt="" style={{
            position:"absolute", width:"50%", height:"50%", objectFit:"cover",
            top: i < 2 ? 0 : "50%", left: i % 2 === 0 ? 0 : "50%",
            opacity: album.images.length === 1 ? (i === 0 ? 1 : 0) : 1,
          }} />
        ))}
        <div className="album-overlay">
          <span style={{ color:"#fff", fontWeight:600, fontSize:".9rem" }}>View All</span>
        </div>
      </div>
      <div style={{ padding:"1rem", display:"flex", alignItems:"center", gap:".85rem" }}>
        <img src={album.thumbnail} alt={album.label} className="avatar-ring"
          style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize:".95rem", marginBottom:".15rem" }}>{album.label}</div>
          <div style={{ color:"var(--muted)", fontSize:".8rem" }}>
            {album.images.length} image{album.images.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ flexShrink:0, color:"var(--accent)" }}
          onClick={(e) => { e.stopPropagation(); alert(`Downloading ${album.label}...`); }}>
          <Icon.Download />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: FeatureCard  (reusable)
// Props: icon (React component), title (string), description (string), delay (number)
// ---------------------------------------------------------------------------
function FeatureCard({ icon: IconComp, title, description, delay }) {
  return (
    <div className="feature-card" style={{ animationDelay:`${delay}s` }}>
      {/* Icon bubble - fills with accent colour on hover via CSS */}
      <div className="fc-icon-wrap">
        <IconComp />
      </div>
      {/* Text content sits above the ::before gradient overlay via z-index */}
      <div className="fc-text">
        <div className="fc-title">{title}</div>
        <div className="fc-desc">{description}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DATA: USP feature list
// Edit this array to add, remove, or reorder cards without touching JSX.
// ---------------------------------------------------------------------------
const USP_FEATURES = [
  {
    icon: Icon.CloudOff,
    title: "No Cloud Dependency",
    description:
      "All processing happens locally on your device. Your data never leaves your system.",
  },
  {
    icon: Icon.Lock,
    title: "Privacy First",
    description:
      "Your images and facial data are not uploaded or shared with any external servers.",
  },
  {
    icon: Icon.Shield,
    title: "Secure by Design",
    description:
      "No third-party APIs or cloud services involved, reducing cybersecurity risks.",
  },
  {
    icon: Icon.Brain,
    title: "Smart AI Organisation",
    description:
      "Automatically groups photos by individuals using intelligent face recognition.",
  },
  {
    icon: Icon.Users,
    title: "Context-Aware Sorting",
    description:
      "Distinguishes between personal photos, group photos, and crowd images.",
  },
];

// ---------------------------------------------------------------------------
// COMPONENT: WhyFaceSort
// Rendered below the upload box on the upload screen only.
// Communicates trust, privacy, and intelligence at first glance.
// ---------------------------------------------------------------------------
function WhyFaceSort() {
  return (
    <section className="usp-section">
      {/* Section header */}
      <div className="fade-up" style={{ textAlign:"center" }}>
        {/* Privacy badge pill */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:".9rem" }}>
          <span className="privacy-badge">Privacy Preserving System</span>
        </div>

        <div style={{
          fontFamily:"var(--font-display)",
          fontSize:"1.65rem",
          marginBottom:".5rem",
          letterSpacing:"-.02em",
          lineHeight:1.2,
        }}>
          Why FaceSort?
        </div>

        {/* Tagline */}
        <div style={{ color:"var(--muted)", fontSize:".9rem", fontStyle:"italic", letterSpacing:".01em" }}>
          Your photos. Your control. No compromises.
        </div>
      </div>

      {/* Feature cards - staggered entrance via animationDelay */}
      <div className="usp-grid">
        {USP_FEATURES.map((f, i) => (
          <FeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
            delay={i * 0.09 + 0.1}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT: GalleryView
// Full grid of a single person's images; click any to open lightbox
// ---------------------------------------------------------------------------
function GalleryView({ album, onBack }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="fade-up" style={{ padding:"1.5rem 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><Icon.Back /> Back</button>
        <img src={album.thumbnail} alt="" className="avatar-ring"
          style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover" }} />
        <div>
          <div style={{ fontWeight:700, fontSize:"1.05rem" }}>{album.label}</div>
          <div style={{ color:"var(--muted)", fontSize:".82rem" }}>{album.images.length} images</div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginLeft:"auto" }}
          onClick={() => alert(`Downloading ${album.label}...`)}>
          <Icon.Download /> Download Album
        </button>
      </div>

      <div style={{
        display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:"1rem",
      }}>
        {album.images.map((src, i) => (
          <img key={i} src={src} alt={`${album.label} ${i + 1}`} className="gallery-img"
            style={{ animationDelay:`${i * 0.04}s` }}
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

// ---------------------------------------------------------------------------
// ROOT COMPONENT: App
// Screen state machine:  upload -> processing -> success -> albums -> gallery
// ---------------------------------------------------------------------------
export default function App() {
  const [dark,        setDark]        = useState(false);
  const [screen,      setScreen]      = useState("upload");
  const [files,       setFiles]       = useState([]);
  const [albums,      setAlbums]      = useState([]);
  const [activeAlbum, setActiveAlbum] = useState(null);

  const onFiles       = useCallback((f) => setFiles(f), []);
  const startProcess  = () => { if (files.length) setScreen("processing"); };

  // When processing finishes: generate albums then show success screen
  const onProcessDone = useCallback(() => {
    setAlbums(generateMockAlbums(files));
    setScreen("success");
  }, [files]);

  const onSuccess = useCallback(() => setScreen("albums"), []);
  const reset     = () => {
    setFiles([]); setAlbums([]); setActiveAlbum(null); setScreen("upload");
  };

  return (
    <>
      <style>{CSS}</style>
      <div className={dark ? "dark" : ""}
        style={{ minHeight:"100vh", background:"var(--bg)", transition:"background .3s, color .3s" }}>

        {/* NAV */}
        <nav className="nav" style={{
          position:"sticky", top:0, zIndex:100,
          borderBottom:"1px solid var(--border)",
          padding:".85rem 2rem",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
            <div style={{
              width:32, height:32, borderRadius:8, background:"var(--accent)",
              display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
            }}>
              <Icon.Face />
            </div>
            <span style={{ fontFamily:"var(--font-display)", fontSize:"1.15rem", letterSpacing:"-.01em" }}>
              FaceSort
            </span>
          </div>
          <div style={{ display:"flex", gap:".6rem", alignItems:"center" }}>
            {screen === "albums" && (
              <button className="btn btn-primary btn-sm" onClick={() => alert("Downloading all albums...")}>
                <Icon.Download /> Download All
              </button>
            )}
            {screen !== "upload" && (
              <button className="btn btn-ghost btn-sm" onClick={reset}>New Session</button>
            )}
            <button className="btn btn-ghost btn-sm" style={{ padding:".45rem" }}
              onClick={() => setDark(!dark)}>
              {dark ? <Icon.Sun /> : <Icon.Moon />}
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <main style={{ maxWidth:960, margin:"0 auto", padding:"2.5rem 1.5rem" }}>

          {/* ===== UPLOAD SCREEN ===== */}
          {screen === "upload" && (
            <div>
              {/* Hero headline */}
              <div className="fade-up" style={{ textAlign:"center", marginBottom:"2.5rem" }}>
                <div style={{
                  fontFamily:"var(--font-display)", fontSize:"2.2rem",
                  marginBottom:".6rem", lineHeight:1.2,
                }}>
                  Organise faces,<br />
                  <span style={{ fontStyle:"italic", color:"var(--accent)" }}>automatically.</span>
                </div>
                <div style={{ color:"var(--muted)", fontSize:".95rem", maxWidth:420, margin:"0 auto" }}>
                  Upload a collection of photos and FaceSort groups them by person instantly.
                </div>
              </div>

              {/* Upload box */}
              <div className="fade-up stagger-2">
                <UploadBox onFiles={onFiles} />
              </div>

              {/* Process button - appears after files are selected */}
              {files.length > 0 && (
                <div className="fade-up"
                  style={{ display:"flex", justifyContent:"center", marginTop:"1.5rem" }}>
                  <button className="btn btn-primary"
                    style={{ padding:".75rem 2.5rem", fontSize:"1rem" }}
                    onClick={startProcess}>
                    Process Images
                  </button>
                </div>
              )}

              {/* Empty-state hint */}
              {files.length === 0 && (
                <div className="fade-up stagger-4"
                  style={{ textAlign:"center", marginTop:"2.5rem", color:"var(--muted)" }}>
                  <div className="empty-icon" style={{ fontSize:"2.5rem", marginBottom:".5rem" }}>
                    {String.fromCodePoint(0x1F5BC, 0xFE0F)}
                  </div>
                  <div style={{ fontSize:".88rem" }}>Upload images to get started</div>
                </div>
              )}

              {/* WHY FACESORT - USP highlights section */}
              <WhyFaceSort />
            </div>
          )}

          {/* ===== PROCESSING SCREEN ===== */}
          {screen === "processing" && (
            <div style={{
              background:"var(--surface)", borderRadius:"var(--radius)",
              border:"1px solid var(--border)", boxShadow:"var(--shadow)",
            }}>
              <ProgressLoader onDone={onProcessDone} />
            </div>
          )}

          {/* ===== SUCCESS SCREEN ===== */}
          {screen === "success" && (
            <div style={{
              background:"var(--surface)", borderRadius:"var(--radius)",
              border:"1px solid var(--border)", boxShadow:"var(--shadow)",
            }}>
              <SuccessScreen albumCount={albums.length} onView={onSuccess} />
            </div>
          )}

          {/* ===== ALBUMS GRID ===== */}
          {screen === "albums" && !activeAlbum && (
            <div>
              <div className="fade-up" style={{ marginBottom:"1.75rem" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"1.6rem", marginBottom:".3rem" }}>
                  Your Albums
                </div>
                <div style={{ color:"var(--muted)", fontSize:".88rem" }}>
                  {albums.length} person{albums.length !== 1 ? "s" : ""} detected from {files.length} images
                </div>
              </div>
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
                gap:"1.25rem",
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

          {/* ===== GALLERY VIEW ===== */}
          {screen === "albums" && activeAlbum && (
            <GalleryView album={activeAlbum} onBack={() => setActiveAlbum(null)} />
          )}
        </main>
      </div>
    </>
  );
}
