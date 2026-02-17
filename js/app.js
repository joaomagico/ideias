// js/app.js (OFFLINE - sem fetch, letras estáticas)

const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];

function navActive() {
  const path = (location.pathname.split("/").pop() || "index.html");
  qsa(".nav a").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

function getTrack(id) {
  return (window.TRACKS || []).find(t => t.id === id);
}

function mountLyrics(container, text) {
  container.innerHTML = "";
  const safe = (text && String(text).trim().length > 0)
    ? String(text)
    : "Sem letras disponíveis.";

  safe.trim().split("\n").forEach(line => {
    const div = document.createElement("div");
    div.className = "lyricLine";
    div.textContent = line.trim();
    container.appendChild(div);
  });

  // começa no topo
  container.scrollTo({ top: 0, behavior: "auto" });
}

function renderTracklist() {
  const list = qs("#tracklist");
  if (!list) return;

  list.innerHTML = "";
  (window.TRACKS || []).forEach(t => {
    const row = document.createElement("div");
    row.className = "trackRow";
    row.innerHTML = `
      <div class="left">
        <div class="num">${String(t.number ?? "").padStart(2, "0")}</div>
        <div class="meta">
          <div class="t">${t.title || "Sem título"}</div>
          <div class="a">${t.artist || ""}</div>
        </div>
      </div>
      <div class="right">
        <span class="pill">${t.durationHint || ""}</span>
        <button class="btn" data-action="play" data-id="${t.id}">▶ Tocar</button>
        <a class="btn ghost" href="player.html?track=${encodeURIComponent(t.id)}">Letras</a>
      </div>
    `;
    list.appendChild(row);
  });
}

/**
 * Tracks page: lista + "agora a tocar" com letras estáticas
 */
function initTracksPage() {
  const audio = qs("#audio");
  const nowTitle = qs("#nowTitle");
  const nowArtist = qs("#nowArtist");
  const lyricsInner = qs("#lyricsInner");
  const coverImg = qs("#nowCoverImg");

  if (!audio || !lyricsInner) return;

  function loadTrack(id, autoplay = true) {
    const t = getTrack(id) || (window.TRACKS || [])[0];
    if (!t) return;

    audio.src = t.file || "";
    if (nowTitle) nowTitle.textContent = t.title || "—";
    if (nowArtist) nowArtist.textContent = t.artist || "";
    if (coverImg) coverImg.src = "assets/cover.jpg";

    mountLyrics(lyricsInner, t.lyrics);

    if (autoplay) {
      try { audio.play(); } catch (_) {}
    }
  }

  // Clique em "Tocar"
  qs("#tracklist")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='play']");
    if (!btn) return;
    loadTrack(btn.dataset.id, true);
  });

  // Inicial
  loadTrack((window.TRACKS || [])[0]?.id, false);
}

/**
 * Player page: player dedicado + letras estáticas
 */
function initPlayerPage() {
  const audio = qs("#audio");
  const title = qs("#trackTitle");
  const artist = qs("#trackArtist");
  const lyricsInner = qs("#lyricsInner");
  const prev = qs("#prevBtn");
  const next = qs("#nextBtn");

  if (!audio || !lyricsInner) return;

  const list = window.TRACKS || [];
  const params = new URLSearchParams(location.search);
  let currentId = params.get("track") || list[0]?.id;

  function load(id, autoplay = false) {
    const t = getTrack(id) || list[0];
    if (!t) return;

    currentId = t.id;
    if (title) title.textContent = t.title || "—";
    if (artist) artist.textContent = t.artist || "";
    audio.src = t.file || "";

    mountLyrics(lyricsInner, t.lyrics);

    if (autoplay) {
      try { audio.play(); } catch (_) {}
    }
  }

  function go(delta) {
    const i = list.findIndex(t => t.id === currentId);
    if (i === -1) return;
    const n = (i + delta + list.length) % list.length;
    const t = list[n];
    history.replaceState({}, "", `player.html?track=${encodeURIComponent(t.id)}`);
    load(t.id, true);
  }

  prev?.addEventListener("click", () => go(-1));
  next?.addEventListener("click", () => go(+1));

  load(currentId, false);
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  navActive();
  renderTracklist();
  initTracksPage();
  initPlayerPage();
});

