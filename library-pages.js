function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

function makeArtwork(url, alt) {
  if (!url) {
    const placeholder = document.createElement("div");
    placeholder.className = "cover placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    return placeholder;
  }

  const img = document.createElement("img");
  img.className = "cover";
  img.src = url;
  img.alt = alt;
  img.loading = "lazy";

  // Provide graceful fallback for browsers that don't support WEBP or when the
  // image fails to load. Choose a sensible default based on the path.
  const defaultArtist = "songs/images/artists/default-artist.svg";
  const defaultAlbum = "songs/images/albums/default-album.svg";
  const defaultFallback = String(url).includes("/artists/") ? defaultArtist : defaultAlbum;

  img.addEventListener("error", () => {
    if (img.src && !img.src.endsWith(defaultFallback)) {
      img.src = defaultFallback;
    } else {
      img.style.display = "none";
    }
  });

  return img;
}

function makeCard(title, lines, imageUrl) {
  const card = document.createElement("article");
  card.className = "card";
  card.appendChild(makeArtwork(imageUrl, `${title} image`));

  const heading = document.createElement("h3");
  heading.textContent = title;
  card.appendChild(heading);

  lines.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    card.appendChild(p);
  });

  return card;
}

function makeSongItem(song) {
  const item = document.createElement("article");
  item.className = "song-item";
  item.appendChild(makeArtwork(song.image, `${song.title} cover image`));

  const title = document.createElement("h4");
  title.textContent = song.title;
  item.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "song-meta";
  meta.textContent = `${song.artist} | ${song.album} | ${song.duration}`;
  item.appendChild(meta);

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = song.audioUrl;
  item.appendChild(audio);

  return item;
}

function renderArtistsPage(songs, rawArtists = []) {
  const groups = window.LocalLibrary.groupByArtist(songs);
  const grid = document.getElementById("artistsGrid");
  grid.innerHTML = "";

  const shown = new Set();

  if (groups.length) {
    groups.forEach((artist) => {
      const card = makeCard(artist.name, [`Songs: ${artist.count}`], artist.image);
      const link = document.createElement("a");
      link.className = "link-btn";
      link.href = `artist-detail.html?artist=${encodeURIComponent(artist.name)}`;
      link.textContent = "View Artist Songs";
      card.appendChild(link);
      grid.appendChild(card);
      shown.add(String(artist.name).trim().toLowerCase());
    });
  }

  // Also render artists from songs/artists.json that might not have songs in catalog
  if (Array.isArray(rawArtists) && rawArtists.length) {
    rawArtists.forEach((a) => {
      const name = String(a?.name || "").trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (shown.has(key)) return; // already rendered from songs

      const imageUrl = window.LocalLibrary.normalizeLocalPath(a.image || a.photo || a.artwork || "");

      const lines = [];
      if (a.genre) lines.push(a.genre);
      if (a.monthlyListeners) lines.push(`Listeners: ${a.monthlyListeners}`);

      const card = makeCard(name, lines, imageUrl || undefined);
      const link = document.createElement("a");
      link.className = "link-btn";
      link.href = `artist-detail.html?artist=${encodeURIComponent(name)}`;
      link.textContent = "View Artist Songs";
      card.appendChild(link);
      grid.appendChild(card);
      shown.add(key);
    });
  }

  if (!grid.children.length) {
    grid.innerHTML = "<p class=\"notice\">No artists found.</p>";
  }
}

function renderAlbumsPage(songs) {
  const albums = window.LocalLibrary.groupByAlbum(songs);
  const grid = document.getElementById("albumsGrid");

  if (!albums.length) {
    grid.innerHTML = "<p class=\"notice\">No albums found in songs/catalog.json.</p>";
    return;
  }

  albums.forEach((album) => {
    const card = makeCard(album.title, [`Artist: ${album.artist}`, `Songs: ${album.count}`], album.image);
    const link = document.createElement("a");
    link.className = "link-btn";
    link.href = `album-detail.html?album=${encodeURIComponent(album.title)}&artist=${encodeURIComponent(album.artist)}`;
    link.textContent = "View Album Songs";
    card.appendChild(link);
    grid.appendChild(card);
  });
}

function renderArtistDetailPage(songs) {
  const artist = getQueryParam("artist");
  const heading = document.getElementById("pageHeading");
  const subHeading = document.getElementById("pageSubHeading");
  const list = document.getElementById("songList");

  heading.textContent = artist ? `Artist: ${artist}` : "Artist Not Selected";
  if (!artist) {
    subHeading.textContent = "Use the Artists page and open an artist.";
    return;
  }

  const artistSongs = window.LocalLibrary.songsByArtist(songs, artist);
  subHeading.textContent = `${artistSongs.length} song(s) found.`;

  if (!artistSongs.length) {
    list.innerHTML = "<p class=\"notice\">No songs found for this artist.</p>";
    return;
  }

  artistSongs.forEach((song) => list.appendChild(makeSongItem(song)));
}

function renderAlbumDetailPage(songs) {
  const album = getQueryParam("album");
  const artist = getQueryParam("artist");
  const heading = document.getElementById("pageHeading");
  const subHeading = document.getElementById("pageSubHeading");
  const list = document.getElementById("songList");

  heading.textContent = album ? `Album: ${album}` : "Album Not Selected";
  if (!album) {
    subHeading.textContent = "Use the Albums page and open an album.";
    return;
  }

  const albumSongs = window.LocalLibrary.songsByAlbum(songs, album, artist);
  subHeading.textContent = `${albumSongs.length} song(s) found${artist ? ` by ${artist}` : ""}.`;

  if (!albumSongs.length) {
    list.innerHTML = "<p class=\"notice\">No songs found for this album.</p>";
    return;
  }

  albumSongs.forEach((song) => list.appendChild(makeSongItem(song)));
}

async function initLibraryPage() {
  const pageType = document.body.dataset.page;
  const status = document.getElementById("status");

  try {
    const data = await window.LocalLibrary.loadLibraryData();
    const songs = data.songs;
    const artists = data.artists || [];
    status.textContent = `Loaded ${songs.length} song(s) from songs/catalog.json`;

    if (pageType === "artists") renderArtistsPage(songs, artists);
    if (pageType === "albums") renderAlbumsPage(songs);
    if (pageType === "artist-detail") renderArtistDetailPage(songs);
    if (pageType === "album-detail") renderAlbumDetailPage(songs);
  } catch (error) {
    status.textContent = "Could not load songs/catalog.json. Add your songs first.";
  }
}

initLibraryPage();
