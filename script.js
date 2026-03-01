const fallbackData = {
  songs: [
    {
      id: 1,
      title: "Blue Skies",
      artist: "Luna Waves",
      album: "Morning Light",
      duration: "2:37",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      downloads: [
        {
          label: "MP3 Preview",
          format: "MP3",
          quality: "Standard",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        }
      ]
    }
  ],
  artists: [
    { name: "Luna Waves", genre: "Indie Pop", monthlyListeners: "1.4M" }
  ],
  albums: [
    { title: "Morning Light", artist: "Luna Waves", year: 2024, tracks: 11 }
  ],
  books: [
    {
      id: "book-fallback-1",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      language: "en",
      subject: "Classic Fiction",
      image: "https://covers.openlibrary.org/b/id/8231996-L.jpg",
      readUrl: "https://www.gutenberg.org/ebooks/1342",
      downloadUrl: "https://www.gutenberg.org/cache/epub/1342/pg1342-images.html"
    },
    {
      id: "book-fallback-2",
      title: "Moby Dick; Or, The Whale",
      author: "Herman Melville",
      language: "en",
      subject: "Adventure",
      image: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
      readUrl: "https://www.gutenberg.org/ebooks/2701",
      downloadUrl: "https://www.gutenberg.org/cache/epub/2701/pg2701-images.html"
    }
  ],
  podcasts: [
    {
      id: 101,
      title: "Music Makers Weekly",
      host: "Ava Cole",
      episode: "Episode 42: Writing Better Hooks",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
      id: 102,
      title: "Studio Stories",
      host: "Mark Ray",
      episode: "Episode 18: Mixing Basics",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    }
  ]
};

const fallbackAudio = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
];

const songsGrid = document.getElementById("songsGrid");
const artistsGrid = document.getElementById("artistsGrid");
const albumsGrid = document.getElementById("albumsGrid");
const booksGrid = document.getElementById("booksGrid");
const podcastsGrid = document.getElementById("podcastsGrid");
const searchInput = document.getElementById("searchInput");
const apiStatus = document.getElementById("apiStatus");
const languageSelect = document.getElementById("languageSelect");
const sourceSelect = document.getElementById("sourceSelect");
const qualitySelect = document.getElementById("qualitySelect");
const formatSelect = document.getElementById("formatSelect");
const minDurationInput = document.getElementById("minDurationInput");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const langChips = document.getElementById("langChips");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const audioPlayer = document.getElementById("audioPlayer");
const nowPlayingTitle = document.getElementById("nowPlayingTitle");
const nowPlayingMeta = document.getElementById("nowPlayingMeta");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const trimStartInput = document.getElementById("trimStartInput");
const trimEndInput = document.getElementById("trimEndInput");
const setTrimStartBtn = document.getElementById("setTrimStartBtn");
const setTrimEndBtn = document.getElementById("setTrimEndBtn");
const previewTrimBtn = document.getElementById("previewTrimBtn");
const downloadTrimBtn = document.getElementById("downloadTrimBtn");
const downloadCutBtn = document.getElementById("downloadCutBtn");
const editorStatus = document.getElementById("editorStatus");

const appState = {
  sourceData: cloneData(fallbackData),
  musicData: cloneData(fallbackData),
  playableQueue: [],
  currentTrackIndex: -1,
  searchTimer: null,
  selectedLanguage: "global",
  selectedSource: "local",
  preferredQuality: "any",
  preferredFormat: "any",
  minDurationMinutes: 1
};

const editorState = {
  sourceUrl: "",
  audioBuffer: null,
  previewUrl: ""
};

const LOCAL_LIBRARY_PATH = "songs/catalog.json";
const BOOKS_LIBRARY_PATH = "songs/books.json";
const DEFAULT_IMAGES = {
  song: "songs/images/albums/default-album.svg",
  artist: "songs/images/artists/default-artist.svg",
  album: "songs/images/albums/default-album.svg",
  book: "songs/images/albums/default-album.svg",
  podcast: "songs/images/podcasts/default-podcast.svg"
};

const LANGUAGE_PRESETS = {
  global: { label: "Global", country: "US", seed: "top songs" },
  english: { label: "English", country: "US", seed: "english songs" },
  tamil: { label: "Tamil", country: "IN", seed: "tamil hit songs" },
  malayalam: { label: "Malayalam", country: "IN", seed: "malayalam hit songs" },
  hindi: { label: "Hindi", country: "IN", seed: "hindi hit songs" },
  telugu: { label: "Telugu", country: "IN", seed: "telugu hit songs" }
};

const FORMAT_PRIORITY = [
  "Flac",
  "Apple Lossless Audio",
  "WAVE",
  "AIFF",
  "Ogg Vorbis",
  "VBR MP3",
  "128Kbps MP3",
  "MP3",
  "MPEG4 Audio"
];

const FORMAT_GROUPS = {
  flac: ["Flac"],
  mp3: ["MP3", "VBR MP3", "128Kbps MP3"],
  ogg: ["Ogg Vorbis"],
  wav: ["WAVE"]
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatMillis(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "0:30";
  return formatSeconds(ms / 1000);
}

function formatBytes(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function parseDurationToSeconds(durationText) {
  const text = String(durationText || "").trim();
  if (!text.includes(":")) return 0;

  const parts = text.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function setStatus(message) {
  apiStatus.textContent = message;
}

function setEditorStatus(message) {
  if (editorStatus) editorStatus.textContent = message;
}

function readTrimRange() {
  const rawStart = Number(trimStartInput?.value || 0);
  const rawEnd = Number(trimEndInput?.value || 0);
  const start = Number.isFinite(rawStart) && rawStart >= 0 ? rawStart : 0;
  const end = Number.isFinite(rawEnd) && rawEnd >= 0 ? rawEnd : 0;
  return { start, end };
}

function clampTrimRange(startSeconds, endSeconds, maxSeconds) {
  const start = Math.max(0, Math.min(startSeconds, maxSeconds));
  const end = Math.max(0, Math.min(endSeconds, maxSeconds));
  if (end <= start) return { start: 0, end: maxSeconds };
  return { start, end };
}

function getLanguagePreset() {
  return LANGUAGE_PRESETS[appState.selectedLanguage] || LANGUAGE_PRESETS.global;
}

function buildLanguageQuery(searchTerm) {
  const preset = getLanguagePreset();
  const term = searchTerm.trim();
  if (!term) return preset.seed;
  if (preset.label === "Global") return term;
  return `${preset.label} songs ${term}`;
}

function guessQuality(format) {
  const key = String(format || "").toLowerCase();
  if (key.includes("flac") || key.includes("lossless") || key.includes("wave") || key.includes("aiff")) {
    return "Lossless";
  }
  if (key.includes("ogg")) return "High";
  if (key.includes("mp3") || key.includes("mpeg4") || key.includes("aac")) return "Standard";
  return "Unknown";
}

function qualityRank(quality) {
  const key = String(quality || "").toLowerCase();
  if (key === "lossless") return 3;
  if (key === "high") return 2;
  if (key === "standard") return 1;
  return 0;
}

function matchesPreferredQuality(item) {
  if (appState.preferredQuality === "any") return true;
  const targetRank = qualityRank(appState.preferredQuality);
  return qualityRank(item.quality) >= targetRank;
}

function matchesPreferredFormat(item) {
  if (appState.preferredFormat === "any") return true;
  const accepted = FORMAT_GROUPS[appState.preferredFormat] || [];
  return accepted.includes(item.format);
}

function extensionFromUrl(url) {
  const cleaned = String(url || "").split("?")[0].toLowerCase();
  if (cleaned.endsWith(".flac")) return "flac";
  if (cleaned.endsWith(".wav")) return "wav";
  if (cleaned.endsWith(".aif") || cleaned.endsWith(".aiff")) return "aiff";
  if (cleaned.endsWith(".ogg") || cleaned.endsWith(".oga")) return "ogg";
  if (cleaned.endsWith(".m4a") || cleaned.endsWith(".aac")) return "m4a";
  if (cleaned.endsWith(".mp3")) return "mp3";
  return "";
}

function normalizeLocalPath(value) {
  const raw = String(value || "").trim().replaceAll("\\", "/").replace(/^\.?\//, "");
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("songs/")) return raw;
  return `songs/${raw}`;
}

function normalizeLocalImagePath(value) {
  return normalizeLocalPath(value);
}

function formatFromUrl(url) {
  const ext = extensionFromUrl(url);
  if (ext === "flac") return "Flac";
  if (ext === "wav") return "WAVE";
  if (ext === "aiff") return "AIFF";
  if (ext === "ogg") return "Ogg Vorbis";
  if (ext === "m4a") return "MPEG4 Audio";
  if (ext === "mp3") return "MP3";
  return "Unknown";
}

function normalizeLocalDownloads(inputDownloads, fallbackUrl) {
  const list = Array.isArray(inputDownloads) ? inputDownloads : [];
  const normalized = list
    .map((entry) => {
      const url = normalizeLocalPath(entry?.url || entry?.file || "");
      if (!url) return null;
      const format = entry?.format || formatFromUrl(url);
      return {
        label: entry?.label || format,
        format,
        quality: entry?.quality || guessQuality(format),
        size: entry?.size || "",
        url
      };
    })
    .filter(Boolean);

  if (normalized.length) return normalized;
  if (!fallbackUrl) return [];

  const format = formatFromUrl(fallbackUrl);
  return [
    {
      label: format,
      format,
      quality: guessQuality(format),
      size: "",
      url: fallbackUrl
    }
  ];
}

function normalizeLocalSong(song, index) {
  const fallbackUrl = normalizeLocalPath(song?.audioUrl || song?.url || song?.file || "");
  const downloads = normalizeLocalDownloads(song?.downloads, fallbackUrl);
  const playbackUrl = pickPlaybackUrl(downloads, fallbackUrl);
  if (!playbackUrl) return null;

  return {
    id: song?.id ?? `local-song-${index + 1}`,
    title: song?.title || `Local Track ${index + 1}`,
    artist: song?.artist || "Unknown Artist",
    album: song?.album || "Local Uploads",
    duration: song?.duration || "3:00",
    image: normalizeLocalImagePath(song?.image || song?.artwork || song?.cover || "") || DEFAULT_IMAGES.song,
    artistImage: normalizeLocalImagePath(song?.artistImage || "") || DEFAULT_IMAGES.artist,
    albumImage: normalizeLocalImagePath(song?.albumImage || "") || DEFAULT_IMAGES.album,
    audioUrl: playbackUrl,
    downloads
  };
}

function normalizeLocalPodcast(podcast, index) {
  const audioUrl = normalizeLocalPath(podcast?.audioUrl || podcast?.url || podcast?.file || "");
  if (!audioUrl) return null;
  return {
    id: podcast?.id ?? `local-podcast-${index + 1}`,
    title: podcast?.title || `Local Podcast ${index + 1}`,
    host: podcast?.host || podcast?.artist || "Unknown Host",
    episode: podcast?.episode || "Local Upload",
    image: normalizeLocalImagePath(podcast?.image || podcast?.artwork || podcast?.cover || "") || DEFAULT_IMAGES.podcast,
    audioUrl
  };
}

function normalizeLocalBook(book, index) {
  const readUrl = String(book?.readUrl || book?.url || "").trim();
  const downloadUrl = String(book?.downloadUrl || "").trim();
  const cover = normalizeLocalImagePath(book?.image || book?.cover || "") || DEFAULT_IMAGES.book;

  if (!readUrl && !downloadUrl) return null;

  return {
    id: book?.id ?? `local-book-${index + 1}`,
    title: book?.title || `Book ${index + 1}`,
    author: book?.author || "Unknown Author",
    language: book?.language || "Unknown",
    subject: book?.subject || book?.category || "General",
    image: cover,
    readUrl: readUrl || downloadUrl,
    downloadUrl: downloadUrl || readUrl
  };
}

function normalizeLocalCatalog(raw) {
  const songsSource = Array.isArray(raw) ? raw : raw?.songs || [];
  const podcastSource = Array.isArray(raw?.podcasts) ? raw.podcasts : [];
  const booksSource = Array.isArray(raw?.books) ? raw.books : [];
  const artistSource = Array.isArray(raw?.artists) ? raw.artists : [];
  const albumSource = Array.isArray(raw?.albums) ? raw.albums : [];

  const artistImageByName = new Map();
  artistSource.forEach((artist) => {
    const key = String(artist?.name || "").trim().toLowerCase();
    const image = normalizeLocalImagePath(artist?.image || artist?.photo || artist?.artwork || "");
    if (key && image) artistImageByName.set(key, image);
  });

  const albumImageByKey = new Map();
  albumSource.forEach((album) => {
    const title = String(album?.title || "").trim().toLowerCase();
    const artist = String(album?.artist || "").trim().toLowerCase();
    const image = normalizeLocalImagePath(album?.image || album?.cover || album?.artwork || "");
    if (title && image) albumImageByKey.set(`${title}|${artist}`, image);
  });

  const songs = songsSource.map(normalizeLocalSong).filter(Boolean);
  songs.forEach((song) => {
    const artistKey = String(song.artist || "").trim().toLowerCase();
    const albumKey = `${String(song.album || "").trim().toLowerCase()}|${artistKey}`;

    if (!song.artistImage && artistImageByName.has(artistKey)) {
      song.artistImage = artistImageByName.get(artistKey);
    }
    if (!song.albumImage && albumImageByKey.has(albumKey)) {
      song.albumImage = albumImageByKey.get(albumKey);
    }
  });

  const podcasts = podcastSource.map(normalizeLocalPodcast).filter(Boolean);
  const books = booksSource.map(normalizeLocalBook).filter(Boolean);

  if (!songs.length && !podcasts.length && !books.length) {
    throw new Error("Local library is empty.");
  }

  return {
    songs,
    artists: buildArtistsFromSongs(songs),
    albums: buildAlbumsFromSongs(songs),
    books,
    podcasts
  };
}

function canBrowserPlay(url) {
  const audio = document.createElement("audio");
  const ext = extensionFromUrl(url);
  const mimeMap = {
    flac: "audio/flac",
    wav: "audio/wav",
    aiff: "audio/aiff",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    mp3: "audio/mpeg"
  };

  const mime = mimeMap[ext] || "";
  if (!mime) return true;
  return audio.canPlayType(mime) !== "";
}

function sortDownloadsByQuality(downloads) {
  return [...downloads].sort((a, b) => {
    const aIndex = FORMAT_PRIORITY.indexOf(a.format);
    const bIndex = FORMAT_PRIORITY.indexOf(b.format);
    const safeA = aIndex === -1 ? 999 : aIndex;
    const safeB = bIndex === -1 ? 999 : bIndex;
    return safeA - safeB;
  });
}

function pickPlaybackUrl(downloads, fallbackUrl) {
  const preferred = sortDownloadsByQuality(downloads)
    .filter((item) => matchesPreferredFormat(item))
    .filter((item) => matchesPreferredQuality(item))
    .filter((item) => canBrowserPlay(item.url));

  if (preferred.length) return preferred[0].url;

  const sorted = sortDownloadsByQuality(downloads).filter((item) => canBrowserPlay(item.url));
  if (sorted.length) return sorted[0].url;
  return fallbackUrl || downloads[0]?.url || "";
}

function meetsDurationRule(song) {
  if (appState.minDurationMinutes <= 0) return true;
  return parseDurationToSeconds(song.duration) >= appState.minDurationMinutes * 60;
}

function matchesDownloadRules(song) {
  const downloads = song.downloads || [];
  if (!downloads.length) return appState.preferredFormat === "any" && appState.preferredQuality === "any";

  return downloads.some((item) => matchesPreferredFormat(item) && matchesPreferredQuality(item));
}

function applySongPreferences(data) {
  const filteredSongs = (data.songs || []).filter((song) => meetsDurationRule(song) && matchesDownloadRules(song));
  const podcasts = data.podcasts || [];
  const books = data.books || [];

  return {
    songs: filteredSongs,
    artists: buildArtistsFromSongs(filteredSongs),
    albums: buildAlbumsFromSongs(filteredSongs),
    books,
    podcasts
  };
}

function applyPreferencesAndRender(searchTerm) {
  appState.musicData = applySongPreferences(appState.sourceData);
  rebuildPlayableQueue();
  filterAndRender(searchTerm);
}

function rebuildPlayableQueue() {
  appState.playableQueue = [
    ...appState.musicData.songs.map((item) => ({ ...item, type: "Song" })),
    ...appState.musicData.podcasts.map((item) => ({ ...item, type: "Podcast" }))
  ];

  if (appState.currentTrackIndex >= appState.playableQueue.length) {
    appState.currentTrackIndex = -1;
  }
}

function renderDownloadList(song) {
  if (!song.downloads?.length) {
    return "<p class=\"download-note\">No downloads available.</p>";
  }

  const options = sortDownloadsByQuality(song.downloads)
    .map(
      (item) => `
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" download>
        ${escapeHtml(item.format)} (${escapeHtml(item.quality)}) ${item.size ? `- ${escapeHtml(item.size)}` : ""}
      </a>
    `
    )
    .join("");

  return `
    <details class="download-box">
      <summary>Download</summary>
      <div class="download-links">${options}</div>
    </details>
  `;
}

function renderCardImage(imageUrl, altText) {
  if (!imageUrl) {
    return "<div class=\"card-media placeholder\" aria-hidden=\"true\"></div>";
  }

  return `<img class="card-media" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText)}" loading="lazy" />`;
}

function renderSongs(songs) {
  if (!songs.length) {
    songsGrid.innerHTML = "<p>No songs match your search/filters. Try lowering minimum duration or changing format/quality.</p>";
    return;
  }

  songsGrid.innerHTML = songs
    .map(
      (song) => `
      <article class="card">
        ${renderCardImage(song.image, `${song.title} cover image`)}
        <h3>${escapeHtml(song.title)}</h3>
        <p>${escapeHtml(song.artist)}</p>
        <p>Album: ${escapeHtml(song.album)}</p>
        <p>Duration: ${escapeHtml(song.duration)}</p>
        <p>Formats: ${escapeHtml((song.downloads || []).map((d) => d.format).join(", ") || "Unknown")}</p>
        <button data-type="Song" data-id="${song.id}">Play</button>
        ${renderDownloadList(song)}
      </article>
    `
    )
    .join("");
}

function renderArtists(artists) {
  if (!artists.length) {
    artistsGrid.innerHTML = "<p>No artists match your search.</p>";
    return;
  }

  artistsGrid.innerHTML = artists
    .map(
      (artist) => `
      <article class="card">
        ${renderCardImage(artist.image, `${artist.name} image`)}
        <h3>${escapeHtml(artist.name)}</h3>
        <p>Genre: ${escapeHtml(artist.genre)}</p>
        <p>Monthly listeners: ${escapeHtml(artist.monthlyListeners)}</p>
        <a class="card-link-btn" href="artist-detail.html?artist=${encodeURIComponent(artist.name)}">View Songs</a>
      </article>
    `
    )
    .join("");
}

function renderAlbums(albums) {
  if (!albums.length) {
    albumsGrid.innerHTML = "<p>No albums match your search.</p>";
    return;
  }

  albumsGrid.innerHTML = albums
    .map(
      (album) => `
      <article class="card">
        ${renderCardImage(album.image, `${album.title} cover image`)}
        <h3>${escapeHtml(album.title)}</h3>
        <p>${escapeHtml(album.artist)}</p>
        <p>Year: ${escapeHtml(album.year)}</p>
        <p>Tracks: ${escapeHtml(album.tracks)}</p>
        <a class="card-link-btn" href="album-detail.html?album=${encodeURIComponent(album.title)}&artist=${encodeURIComponent(album.artist)}">View Songs</a>
      </article>
    `
    )
    .join("");
}

function renderBooks(books) {
  if (!books.length) {
    booksGrid.innerHTML = "<p>No books match your search.</p>";
    return;
  }

  booksGrid.innerHTML = books
    .map(
      (book) => `
      <article class="card">
        ${renderCardImage(book.image, `${book.title} cover image`)}
        <h3>${escapeHtml(book.title)}</h3>
        <p>Author: ${escapeHtml(book.author)}</p>
        <p>Language: ${escapeHtml(book.language)}</p>
        <p>Category: ${escapeHtml(book.subject)}</p>
        <a class="card-link-btn" href="${escapeHtml(book.readUrl)}" target="_blank" rel="noopener">Read Free</a>
        <a class="card-link-btn" href="${escapeHtml(book.downloadUrl)}" target="_blank" rel="noopener">Download</a>
      </article>
    `
    )
    .join("");
}

function renderPodcasts(podcasts) {
  if (!podcasts.length) {
    podcastsGrid.innerHTML = "<p>No podcasts match your search.</p>";
    return;
  }

  podcastsGrid.innerHTML = podcasts
    .map(
      (podcast) => `
      <article class="card">
        ${renderCardImage(podcast.image, `${podcast.title} cover image`)}
        <h3>${escapeHtml(podcast.title)}</h3>
        <p>Host: ${escapeHtml(podcast.host)}</p>
        <p>${escapeHtml(podcast.episode)}</p>
        <button data-type="Podcast" data-id="${podcast.id}">Play</button>
      </article>
    `
    )
    .join("");
}

function filterAndRender(searchTerm) {
  const term = searchTerm.trim().toLowerCase();

  const filteredSongs = appState.musicData.songs.filter((song) =>
    `${song.title} ${song.artist} ${song.album}`.toLowerCase().includes(term)
  );

  const filteredArtists = appState.musicData.artists.filter((artist) =>
    `${artist.name} ${artist.genre}`.toLowerCase().includes(term)
  );

  const filteredAlbums = appState.musicData.albums.filter((album) =>
    `${album.title} ${album.artist} ${album.year}`.toLowerCase().includes(term)
  );

  const filteredBooks = appState.musicData.books.filter((book) =>
    `${book.title} ${book.author} ${book.language} ${book.subject}`.toLowerCase().includes(term)
  );

  const filteredPodcasts = appState.musicData.podcasts.filter((podcast) =>
    `${podcast.title} ${podcast.host} ${podcast.episode}`.toLowerCase().includes(term)
  );

  renderSongs(filteredSongs);
  renderArtists(filteredArtists);
  renderAlbums(filteredAlbums);
  renderBooks(filteredBooks);
  renderPodcasts(filteredPodcasts);
}

function normalizeSongsFromItunes(results) {
  return results.slice(0, 14).map((track, index) => {
    const previewUrl = track.previewUrl || fallbackAudio[index % fallbackAudio.length];
    const artwork = track.artworkUrl100 || track.artworkUrl60 || "";

    return {
      id: track.trackId ?? track.collectionId ?? Date.now() + index,
      title: track.trackName || "Unknown Track",
      artist: track.artistName || "Unknown Artist",
      album: track.collectionName || "Single",
      duration: formatMillis(track.trackTimeMillis),
      image: artwork || DEFAULT_IMAGES.song,
      artistImage: artwork || DEFAULT_IMAGES.artist,
      albumImage: artwork || DEFAULT_IMAGES.album,
      audioUrl: previewUrl,
      downloads: [
        {
          label: "iTunes Preview",
          format: "MPEG4 Audio",
          quality: "Standard",
          size: "",
          url: previewUrl
        }
      ]
    };
  });
}

function buildArtistsFromSongs(songs) {
  const byArtist = new Map();

  songs.forEach((song) => {
    const current = byArtist.get(song.artist) || {
      count: 0,
      image: song.artistImage || song.image || ""
    };

    current.count += 1;
    if (!current.image && (song.artistImage || song.image)) {
      current.image = song.artistImage || song.image;
    }
    byArtist.set(song.artist, current);
  });

  return [...byArtist.entries()].slice(0, 8).map(([name, info], index) => {
    const genres = ["Pop", "Alternative", "Rock", "R&B", "Electronic", "Indie"];
    return {
      name,
      genre: genres[index % genres.length],
      monthlyListeners: `${info.count * 180 + 520}K`,
      image: info.image || DEFAULT_IMAGES.artist
    };
  });
}

function buildAlbumsFromSongs(songs) {
  const byAlbum = new Map();

  songs.forEach((song) => {
    const key = `${song.album}|${song.artist}`;
    const current = byAlbum.get(key) || {
      title: song.album,
      artist: song.artist,
      year: new Date().getFullYear(),
      tracks: 0,
      image: song.albumImage || song.image || DEFAULT_IMAGES.album
    };

    current.tracks += 1;
    if (!current.image && (song.albumImage || song.image)) {
      current.image = song.albumImage || song.image;
    }
    byAlbum.set(key, current);
  });

  return [...byAlbum.values()].slice(0, 8);
}

function normalizePodcastsFromApi(results) {
  return results.slice(0, 8).map((podcast, index) => ({
    id: podcast.trackId ?? podcast.collectionId ?? Date.now() + 1000 + index,
    title: podcast.collectionName || podcast.trackName || "Podcast Show",
    host: podcast.artistName || "Unknown Host",
    episode: podcast.primaryGenreName ? `Genre: ${podcast.primaryGenreName}` : "Latest episode",
    image: podcast.artworkUrl100 || podcast.artworkUrl60 || DEFAULT_IMAGES.podcast,
    audioUrl: podcast.previewUrl || fallbackAudio[(index + 2) % fallbackAudio.length]
  }));
}

function inferBookLanguage(code) {
  const key = String(code || "").toLowerCase();
  if (!key) return "Unknown";
  if (key === "en") return "English";
  if (key === "ta") return "Tamil";
  if (key === "ml") return "Malayalam";
  if (key === "hi") return "Hindi";
  if (key === "te") return "Telugu";
  return key.toUpperCase();
}

function normalizeBooksFromGutendex(results) {
  return (results || []).slice(0, 12).map((book, index) => {
    const id = book?.id ?? `gutendex-${index + 1}`;
    const title = book?.title || `Book ${index + 1}`;
    const author = (book?.authors || []).map((item) => item?.name).filter(Boolean).join(", ") || "Unknown Author";
    const languageCode = Array.isArray(book?.languages) ? book.languages[0] : "";
    const subjects = Array.isArray(book?.subjects) ? book.subjects : [];
    const formats = book?.formats || {};
    const readUrl =
      formats["text/html"] ||
      formats["text/html; charset=utf-8"] ||
      formats["application/pdf"] ||
      formats["text/plain; charset=utf-8"] ||
      formats["text/plain"] ||
      `https://www.gutenberg.org/ebooks/${id}`;
    const downloadUrl = formats["application/epub+zip"] || formats["application/pdf"] || readUrl;
    const image = formats["image/jpeg"] || DEFAULT_IMAGES.book;

    return {
      id: `gutendex-${id}`,
      title,
      author,
      language: inferBookLanguage(languageCode),
      subject: subjects[0] || "General",
      image,
      readUrl,
      downloadUrl
    };
  });
}

function normalizeBooksFromOpenLibrary(docs) {
  return (docs || []).slice(0, 12).map((book, index) => {
    const coverId = book?.cover_i;
    const key = String(book?.key || "").trim();
    const edition = Array.isArray(book?.edition_key) ? book.edition_key[0] : "";
    const readUrl = edition
      ? `https://openlibrary.org/books/${encodeURIComponent(edition)}`
      : key
        ? `https://openlibrary.org${key}`
        : "https://openlibrary.org";

    return {
      id: `openlib-${book?.key || index}`,
      title: book?.title || `Book ${index + 1}`,
      author: Array.isArray(book?.author_name) ? book.author_name.join(", ") : "Unknown Author",
      language: Array.isArray(book?.language) ? inferBookLanguage(book.language[0]) : "Unknown",
      subject: Array.isArray(book?.subject) && book.subject.length ? book.subject[0] : "General",
      image: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : DEFAULT_IMAGES.book,
      readUrl,
      downloadUrl: readUrl
    };
  });
}

async function fetchBooksData(searchTerm) {
  const preset = getLanguagePreset();
  const rawTerm = (searchTerm || "").trim();
  const query = encodeURIComponent(rawTerm || `${preset.label} classic literature`);

  try {
    const gutendexUrl = `https://gutendex.com/books/?search=${query}`;
    const response = await fetch(gutendexUrl);
    if (!response.ok) throw new Error("Gutendex unavailable");
    const json = await response.json();
    const books = normalizeBooksFromGutendex(json?.results);
    if (books.length) return books;
  } catch {
    // fall through to Open Library
  }

  const openLibraryUrl = `https://openlibrary.org/search.json?q=${query}&limit=18`;
  const openResponse = await fetch(openLibraryUrl);
  if (!openResponse.ok) {
    throw new Error("Book APIs are unavailable.");
  }

  const openJson = await openResponse.json();
  const books = normalizeBooksFromOpenLibrary(openJson?.docs);
  if (!books.length) {
    throw new Error("No books found.");
  }

  return books;
}

async function fetchBooksDataSafe(searchTerm) {
  try {
    return await fetchBooksData(searchTerm);
  } catch {
    return [];
  }
}

function normalizeArchiveDuration(value) {
  if (!value) return "3:00";
  if (typeof value === "string" && value.includes(":")) {
    const parts = value.split(":").map((part) => Number(part));
    if (parts.length === 2) {
      return `${parts[0]}:${String(parts[1]).padStart(2, "0")}`;
    }
    if (parts.length === 3) {
      return `${parts[0] * 60 + parts[1]}:${String(parts[2]).padStart(2, "0")}`;
    }
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return formatSeconds(numeric);
  }

  return "3:00";
}

function isAudioArchiveFile(file) {
  const format = String(file.format || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  if (["mp3", "flac", "ogg", "wav", "m4a", "aac", "aiff", "alac"].some((ext) => name.endsWith(`.${ext}`))) {
    return true;
  }

  return (
    format.includes("mp3") ||
    format.includes("flac") ||
    format.includes("ogg") ||
    format.includes("wave") ||
    format.includes("mpeg4") ||
    format.includes("aiff") ||
    format.includes("lossless")
  );
}

function mapArchiveFormat(file) {
  const format = String(file.format || "Unknown");
  if (format === "VBR MP3" || format === "128Kbps MP3" || format === "Flac" || format === "Ogg Vorbis") {
    return format;
  }

  const lower = format.toLowerCase();
  if (lower.includes("mp3")) return "MP3";
  if (lower.includes("flac")) return "Flac";
  if (lower.includes("ogg")) return "Ogg Vorbis";
  if (lower.includes("wave")) return "WAVE";
  if (lower.includes("aiff")) return "AIFF";
  if (lower.includes("lossless")) return "Apple Lossless Audio";
  if (lower.includes("mpeg4") || lower.includes("aac") || lower.includes("m4a")) return "MPEG4 Audio";
  return format;
}

async function fetchPodcastsOnly(searchTerm, country) {
  const query = encodeURIComponent(searchTerm || "music podcast");
  const url = `https://itunes.apple.com/search?term=${query}&media=podcast&entity=podcast&country=${country}&limit=12`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const json = await response.json();
  return normalizePodcastsFromApi(json.results || []);
}

async function fetchItunesData(searchTerm) {
  const preset = getLanguagePreset();
  const query = encodeURIComponent(buildLanguageQuery(searchTerm));

  const songsUrl = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&country=${preset.country}&limit=40`;
  const podcastsUrl = `https://itunes.apple.com/search?term=${query}&media=podcast&entity=podcast&country=${preset.country}&limit=12`;

  const [songsResponse, podcastsResponse] = await Promise.all([fetch(songsUrl), fetch(podcastsUrl)]);
  if (!songsResponse.ok || !podcastsResponse.ok) {
    throw new Error("Unable to reach iTunes API.");
  }

  const [songsJson, podcastsJson] = await Promise.all([songsResponse.json(), podcastsResponse.json()]);
  const songs = normalizeSongsFromItunes(songsJson.results || []);
  const books = await fetchBooksDataSafe(searchTerm);

  if (!songs.length) {
    throw new Error("No songs returned from iTunes.");
  }

  return {
    songs,
    artists: buildArtistsFromSongs(songs),
    albums: buildAlbumsFromSongs(songs),
    books,
    podcasts: normalizePodcastsFromApi(podcastsJson.results || [])
  };
}

async function fetchArchiveData(searchTerm) {
  const preset = getLanguagePreset();
  const rawTerm = buildLanguageQuery(searchTerm);
  const q = encodeURIComponent(`(${rawTerm}) AND mediatype:(audio)`);

  const searchUrl =
    `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,creator&sort[]=downloads%20desc&rows=16&page=1&output=json`;

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    throw new Error("Unable to reach Archive search API.");
  }

  const searchJson = await searchResponse.json();
  const docs = searchJson.response?.docs || [];
  if (!docs.length) {
    throw new Error("No archive results found.");
  }

  const metadataResponses = await Promise.all(
    docs.slice(0, 10).map(async (doc) => {
      try {
        const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(doc.identifier)}`);
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    })
  );

  const songs = metadataResponses
    .filter(Boolean)
    .map((meta, index) => {
      const files = (meta.files || []).filter(isAudioArchiveFile);
      if (!files.length) return null;

      const unique = new Map();
      files.forEach((file) => {
        const fileName = file.name;
        if (!fileName) return;

        const url = `https://archive.org/download/${meta.metadata?.identifier}/${encodeURIComponent(fileName)}`;
        const format = mapArchiveFormat(file);
        const key = `${format}:${url}`;

        if (!unique.has(key)) {
          unique.set(key, {
            label: format,
            format,
            quality: guessQuality(format),
            size: formatBytes(file.size),
            url
          });
        }
      });

      const downloads = [...unique.values()].slice(0, 7);
      if (!downloads.length) return null;

      const sortedDownloads = sortDownloadsByQuality(downloads);
      const playbackUrl = pickPlaybackUrl(sortedDownloads, fallbackAudio[index % fallbackAudio.length]);
      const duration = normalizeArchiveDuration(files[0].length);
      const identifier = meta.metadata?.identifier || "";
      const archiveArtwork = identifier
        ? `https://archive.org/download/${encodeURIComponent(identifier)}/__ia_thumb.jpg`
        : "";

      return {
        id: `${identifier || Date.now()}-${index}`,
        title: meta.metadata?.title || `Archive Track ${index + 1}`,
        artist: meta.metadata?.creator || "Archive Artist",
        album: identifier || "Internet Archive",
        duration,
        image: archiveArtwork || DEFAULT_IMAGES.song,
        artistImage: archiveArtwork || DEFAULT_IMAGES.artist,
        albumImage: archiveArtwork || DEFAULT_IMAGES.album,
        audioUrl: playbackUrl,
        downloads: sortedDownloads
      };
    })
    .filter(Boolean)
    .slice(0, 12);

  if (!songs.length) {
    throw new Error("No playable archive songs found.");
  }

  const podcasts = await fetchPodcastsOnly(`${preset.label} music podcast`, preset.country);
  const books = await fetchBooksDataSafe(searchTerm);

  return {
    songs,
    artists: buildArtistsFromSongs(songs),
    albums: buildAlbumsFromSongs(songs),
    books,
    podcasts
  };
}

function isLocalMediaUrl(url) {
  const value = String(url || "").trim().toLowerCase();
  return value.startsWith("songs/");
}

async function isMediaUrlReachable(url) {
  const value = String(url || "").trim();
  if (!value) return false;
  if (!isLocalMediaUrl(value)) return true;

  try {
    const head = await fetch(value, { method: "HEAD", cache: "no-store" });
    if (head.ok) return true;
  } catch {
    // Fall through to GET probe.
  }

  try {
    const getProbe = await fetch(value, { method: "GET", cache: "no-store" });
    return getProbe.ok;
  } catch {
    return false;
  }
}

async function validateLocalMediaAvailability(data) {
  const reachabilityCache = new Map();
  const checkReachable = async (url) => {
    if (!reachabilityCache.has(url)) {
      reachabilityCache.set(url, isMediaUrlReachable(url));
    }
    return reachabilityCache.get(url);
  };

  const validatedSongs = (
    await Promise.all(
      (data.songs || []).map(async (song) => {
        const downloads = Array.isArray(song.downloads) ? song.downloads : [];
        const checkedDownloads = (
          await Promise.all(
            downloads.map(async (entry) => ({
              entry,
              reachable: await checkReachable(entry.url)
            }))
          )
        ).filter((row) => row.reachable).map((row) => row.entry);

        const playbackCandidates = [
          ...checkedDownloads.map((entry) => entry.url),
          song.audioUrl
        ].filter(Boolean);

        const playable = await Promise.all(playbackCandidates.map((url) => checkReachable(url)));
        const firstPlayable = playbackCandidates.find((_, index) => playable[index]) || "";
        if (!firstPlayable) return null;

        return {
          ...song,
          downloads: checkedDownloads,
          audioUrl: firstPlayable
        };
      })
    )
  ).filter(Boolean);

  const validatedPodcasts = (
    await Promise.all(
      (data.podcasts || []).map(async (podcast) => {
        if (!(await checkReachable(podcast.audioUrl))) return null;
        return podcast;
      })
    )
  ).filter(Boolean);

  return {
    songs: validatedSongs,
    artists: buildArtistsFromSongs(validatedSongs),
    albums: buildAlbumsFromSongs(validatedSongs),
    books: data.books || [],
    podcasts: validatedPodcasts
  };
}

async function fetchLocalLibraryData() {
  const [catalogResponse, artistsResponse, albumsResponse, podcastsResponse, booksResponse] = await Promise.all([
    fetch(LOCAL_LIBRARY_PATH, { cache: "no-store" }),
    fetch("songs/artists.json", { cache: "no-store" }).catch(() => null),
    fetch("songs/albums.json", { cache: "no-store" }).catch(() => null),
    fetch("songs/podcasts.json", { cache: "no-store" }).catch(() => null),
    fetch(BOOKS_LIBRARY_PATH, { cache: "no-store" }).catch(() => null)
  ]);

  if (!catalogResponse.ok) {
    throw new Error("Local catalog was not found.");
  }

  const catalogJson = await catalogResponse.json();
  const raw = Array.isArray(catalogJson) ? { songs: catalogJson } : { ...catalogJson };

  if (artistsResponse?.ok) {
    const artistsJson = await artistsResponse.json();
    raw.artists = Array.isArray(artistsJson?.artists) ? artistsJson.artists : [];
  }

  if (albumsResponse?.ok) {
    const albumsJson = await albumsResponse.json();
    raw.albums = Array.isArray(albumsJson?.albums) ? albumsJson.albums : [];
  }

  if (podcastsResponse?.ok) {
    const podcastsJson = await podcastsResponse.json();
    const filePodcasts = Array.isArray(podcastsJson?.podcasts) ? podcastsJson.podcasts : [];
    if (!Array.isArray(raw.podcasts) || !raw.podcasts.length) {
      raw.podcasts = filePodcasts;
    }
  }

  if (booksResponse?.ok) {
    const booksJson = await booksResponse.json();
    raw.books = Array.isArray(booksJson?.books) ? booksJson.books : [];
  }

  if (!Array.isArray(raw.books) || !raw.books.length) {
    try {
      raw.books = await fetchBooksDataSafe("");
    } catch {
      raw.books = [];
    }
  }

  const normalized = normalizeLocalCatalog(raw);
  const validated = await validateLocalMediaAvailability(normalized);
  if (!validated.songs.length && !validated.podcasts.length) {
    throw new Error("No playable local audio files found.");
  }
  return validated;
}

async function fetchLiveMusicData(searchTerm) {
  if (appState.selectedSource === "local") {
    return fetchLocalLibraryData();
  }

  if (appState.selectedSource === "itunes") {
    return fetchItunesData(searchTerm);
  }

  return fetchArchiveData(searchTerm);
}

function sourceLabel() {
  if (appState.selectedSource === "local") return "Local Library";
  return appState.selectedSource === "itunes" ? "iTunes Preview" : "Full Tracks";
}

function updateLanguageUI() {
  languageSelect.value = appState.selectedLanguage;
  sourceSelect.value = appState.selectedSource;
  qualitySelect.value = appState.preferredQuality;
  formatSelect.value = appState.preferredFormat;
  minDurationInput.value = String(appState.minDurationMinutes);

  langChips.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === appState.selectedLanguage);
  });
}

function releasePreviewUrl() {
  if (!editorState.previewUrl) return;
  URL.revokeObjectURL(editorState.previewUrl);
  editorState.previewUrl = "";
}

async function ensureEditorBuffer() {
  const src = String(audioPlayer.currentSrc || audioPlayer.src || "").trim();
  if (!src) {
    throw new Error("No active track selected.");
  }

  if (editorState.audioBuffer && editorState.sourceUrl === src) {
    return editorState.audioBuffer;
  }

  setEditorStatus("Loading audio for trim/cut...");
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error("Unable to load this audio for editing.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  await audioContext.close();

  editorState.sourceUrl = src;
  editorState.audioBuffer = decoded;
  trimStartInput.value = "0";
  trimEndInput.value = String(Math.max(0, decoded.duration).toFixed(1));
  return decoded;
}

function audioBufferToWavBlob(channels, sampleRate) {
  const numChannels = channels.length;
  const sampleCount = channels[0]?.length || 0;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = sampleCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, value) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < sampleCount; i += 1) {
    for (let ch = 0; ch < numChannels; ch += 1) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i] || 0));
      const pcm = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, pcm, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function buildTrimBlob(audioBuffer, startSeconds, endSeconds) {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startSeconds * sampleRate);
  const endSample = Math.floor(endSeconds * sampleRate);
  const channels = [];

  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch += 1) {
    channels.push(audioBuffer.getChannelData(ch).slice(startSample, endSample));
  }

  return audioBufferToWavBlob(channels, sampleRate);
}

function buildCutBlob(audioBuffer, startSeconds, endSeconds) {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startSeconds * sampleRate);
  const endSample = Math.floor(endSeconds * sampleRate);
  const channels = [];

  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch += 1) {
    const data = audioBuffer.getChannelData(ch);
    const cutLength = Math.max(0, data.length - (endSample - startSample));
    const merged = new Float32Array(cutLength);
    merged.set(data.slice(0, startSample), 0);
    merged.set(data.slice(endSample), startSample);
    channels.push(merged);
  }

  return audioBufferToWavBlob(channels, sampleRate);
}

function triggerBlobDownload(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

async function previewTrimSelection() {
  try {
    const audioBuffer = await ensureEditorBuffer();
    const { start, end } = clampTrimRange(
      readTrimRange().start,
      readTrimRange().end || audioBuffer.duration,
      audioBuffer.duration
    );
    const blob = buildTrimBlob(audioBuffer, start, end);
    releasePreviewUrl();
    editorState.previewUrl = URL.createObjectURL(blob);
    audioPlayer.src = editorState.previewUrl;
    await audioPlayer.play();
    setEditorStatus(`Previewing trim: ${formatSeconds(start)} to ${formatSeconds(end)}.`);
  } catch (error) {
    setEditorStatus(error?.message || "Trim preview failed.");
  }
}

async function downloadEditedAudio(mode) {
  try {
    const audioBuffer = await ensureEditorBuffer();
    const { start, end } = clampTrimRange(
      readTrimRange().start,
      readTrimRange().end || audioBuffer.duration,
      audioBuffer.duration
    );
    const blob = mode === "cut"
      ? buildCutBlob(audioBuffer, start, end)
      : buildTrimBlob(audioBuffer, start, end);
    const fileName = mode === "cut" ? "edited-cut.wav" : "edited-trim.wav";
    triggerBlobDownload(blob, fileName);
    setEditorStatus(
      mode === "cut"
        ? `Downloaded cut version (removed ${formatSeconds(start)} to ${formatSeconds(end)}).`
        : `Downloaded trim version (${formatSeconds(start)} to ${formatSeconds(end)}).`
    );
  } catch (error) {
    setEditorStatus(error?.message || "Audio export failed.");
  }
}

function playTrackByIndex(index) {
  if (index < 0 || index >= appState.playableQueue.length) return;

  releasePreviewUrl();
  appState.currentTrackIndex = index;
  const track = appState.playableQueue[appState.currentTrackIndex];

  const playbackUrl = track.type === "Song"
    ? pickPlaybackUrl(track.downloads || [], track.audioUrl)
    : track.audioUrl;

  audioPlayer.src = playbackUrl;
  nowPlayingTitle.textContent = track.title;

  if (track.type === "Song") {
    const topFormat = track.downloads?.[0]?.format || "Audio";
    const quality = track.downloads?.[0]?.quality || "Standard";
    nowPlayingMeta.textContent = `${track.artist} - ${topFormat} (${quality})`;
  } else {
    nowPlayingMeta.textContent = `${track.type} - Host: ${track.host}`;
  }

  editorState.sourceUrl = "";
  editorState.audioBuffer = null;
  if (trimStartInput) trimStartInput.value = "0";
  if (trimEndInput) trimEndInput.value = String(parseDurationToSeconds(track.duration || "0:00") || 0);
  setEditorStatus("Track ready. Set start/end and use Trim/Cut.");
  audioPlayer.play();
}

function playTrackFromButton(type, id) {
  const index = appState.playableQueue.findIndex((track) => track.type === type && String(track.id) === String(id));
  playTrackByIndex(index);
}

async function reloadFromApi(messagePrefix = "Loading") {
  setStatus(`${messagePrefix} ${getLanguagePreset().label} songs from ${sourceLabel()}...`);

  try {
    const liveData = await fetchLiveMusicData(searchInput.value);
    appState.sourceData = liveData;
    applyPreferencesAndRender(searchInput.value);
    setStatus(`${getLanguagePreset().label} songs ready from ${sourceLabel()}.`);
  } catch {
    appState.sourceData = cloneData(fallbackData);
    applyPreferencesAndRender(searchInput.value);
    setStatus(`Could not load ${sourceLabel()} right now. Showing local sample data.`);
  }
}

async function initializeData() {
  applyPreferencesAndRender("");
  updateLanguageUI();

  try {
    const localData = await fetchLocalLibraryData();
    appState.sourceData = localData;
    appState.selectedSource = "local";
    updateLanguageUI();
    applyPreferencesAndRender("");
    setStatus("Loaded your local library from songs/catalog.json.");
    return;
  } catch {
    appState.selectedSource = "archive";
    updateLanguageUI();
  }

  await reloadFromApi("Loading");
}

searchInput.addEventListener("input", (event) => {
  const term = event.target.value;
  filterAndRender(term);

  clearTimeout(appState.searchTimer);
  appState.searchTimer = setTimeout(async () => {
    if (term.trim().length < 2) return;

    setStatus(`Searching ${getLanguagePreset().label} (${sourceLabel()}) for \"${term.trim()}\"...`);

    try {
      const liveData = await fetchLiveMusicData(term.trim());
      appState.sourceData = liveData;
      applyPreferencesAndRender(term);
      setStatus(`Showing ${getLanguagePreset().label} results from ${sourceLabel()}.`);
    } catch {
      setStatus(`Search failed for ${sourceLabel()}. Showing current cached data.`);
    }
  }, 550);
});

languageSelect.addEventListener("change", async (event) => {
  appState.selectedLanguage = event.target.value;
  updateLanguageUI();
  await reloadFromApi("Switching to");
});

sourceSelect.addEventListener("change", async (event) => {
  appState.selectedSource = event.target.value;
  updateLanguageUI();
  await reloadFromApi("Switching source to");
});

qualitySelect.addEventListener("change", () => {
  appState.preferredQuality = qualitySelect.value;
  applyPreferencesAndRender(searchInput.value);
  setStatus(`Applied quality filter: ${appState.preferredQuality}.`);
});

formatSelect.addEventListener("change", () => {
  appState.preferredFormat = formatSelect.value;
  applyPreferencesAndRender(searchInput.value);
  setStatus(`Applied format filter: ${appState.preferredFormat.toUpperCase()}.`);
});

minDurationInput.addEventListener("input", () => {
  const value = Number(minDurationInput.value);
  appState.minDurationMinutes = Number.isFinite(value) && value >= 0 ? value : 0;
  applyPreferencesAndRender(searchInput.value);
  setStatus(`Showing tracks at least ${appState.minDurationMinutes} minute(s).`);
});

resetFiltersBtn.addEventListener("click", () => {
  appState.preferredQuality = "any";
  appState.preferredFormat = "any";
  appState.minDurationMinutes = 1;
  searchInput.value = "";
  updateLanguageUI();
  applyPreferencesAndRender("");
  setStatus("Filters reset to defaults.");
});

langChips.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const language = target.dataset.lang;
  if (!language || !LANGUAGE_PRESETS[language]) return;

  appState.selectedLanguage = language;
  updateLanguageUI();
  await reloadFromApi("Switching to");
});

document.body.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.matches(".card button[data-type]")) {
    playTrackFromButton(target.dataset.type, target.dataset.id);
  }
});

playBtn.addEventListener("click", () => {
  if (appState.currentTrackIndex === -1) {
    playTrackByIndex(0);
    return;
  }
  audioPlayer.play();
});

pauseBtn.addEventListener("click", () => {
  audioPlayer.pause();
});

nextBtn.addEventListener("click", () => {
  if (!appState.playableQueue.length) return;
  const nextIndex =
    appState.currentTrackIndex < appState.playableQueue.length - 1 ? appState.currentTrackIndex + 1 : 0;
  playTrackByIndex(nextIndex);
});

prevBtn.addEventListener("click", () => {
  if (!appState.playableQueue.length) return;
  const prevIndex =
    appState.currentTrackIndex > 0 ? appState.currentTrackIndex - 1 : appState.playableQueue.length - 1;
  playTrackByIndex(prevIndex);
});

audioPlayer.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatSeconds(audioPlayer.duration);
  if (trimEndInput && Number(audioPlayer.duration) > 0) {
    const currentEnd = Number(trimEndInput.value || 0);
    if (!Number.isFinite(currentEnd) || currentEnd <= 0) {
      trimEndInput.value = String(audioPlayer.duration.toFixed(1));
    }
  }
});

audioPlayer.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatSeconds(audioPlayer.currentTime);

  if (!audioPlayer.duration) return;
  progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
});

audioPlayer.addEventListener("ended", () => {
  const nextIndex =
    appState.currentTrackIndex < appState.playableQueue.length - 1 ? appState.currentTrackIndex + 1 : 0;
  playTrackByIndex(nextIndex);
});

audioPlayer.addEventListener("play", () => {
  document.body.classList.add("is-playing");
});

audioPlayer.addEventListener("pause", () => {
  document.body.classList.remove("is-playing");
});

progressBar.addEventListener("input", () => {
  if (!audioPlayer.duration) return;
  const newTime = (Number(progressBar.value) / 100) * audioPlayer.duration;
  audioPlayer.currentTime = newTime;
});

setTrimStartBtn?.addEventListener("click", () => {
  trimStartInput.value = String((audioPlayer.currentTime || 0).toFixed(1));
  setEditorStatus(`Start set to ${formatSeconds(audioPlayer.currentTime || 0)}.`);
});

setTrimEndBtn?.addEventListener("click", () => {
  const value = Number.isFinite(audioPlayer.duration) ? audioPlayer.currentTime : Number(trimEndInput.value || 0);
  trimEndInput.value = String((value || 0).toFixed(1));
  setEditorStatus(`End set to ${formatSeconds(value || 0)}.`);
});

previewTrimBtn?.addEventListener("click", () => {
  previewTrimSelection();
});

downloadTrimBtn?.addEventListener("click", () => {
  downloadEditedAudio("trim");
});

downloadCutBtn?.addEventListener("click", () => {
  downloadEditedAudio("cut");
});

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.matches("a")) {
    navLinks.classList.remove("open");
  }
});

initializeData();
