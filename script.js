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
    },
    {
      id: 2,
      title: "City Lights",
      artist: "Neon Frame",
      album: "After Hours",
      duration: "3:04",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      downloads: [
        {
          label: "MP3 Preview",
          format: "MP3",
          quality: "Standard",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        }
      ]
    },
    {
      id: 3,
      title: "Wander Road",
      artist: "Atlas Echo",
      album: "Open Miles",
      duration: "2:48",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      downloads: [
        {
          label: "MP3 Preview",
          format: "MP3",
          quality: "Standard",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        }
      ]
    }
  ],
  artists: [
    { name: "Luna Waves", genre: "Indie Pop", monthlyListeners: "1.4M" },
    { name: "Neon Frame", genre: "Synthwave", monthlyListeners: "980K" },
    { name: "Atlas Echo", genre: "Alternative", monthlyListeners: "740K" }
  ],
  albums: [
    { title: "Morning Light", artist: "Luna Waves", year: 2024, tracks: 11 },
    { title: "After Hours", artist: "Neon Frame", year: 2025, tracks: 9 },
    { title: "Open Miles", artist: "Atlas Echo", year: 2023, tracks: 12 }
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

const LOCAL_LIBRARY_PATH = "songs/catalog.json";
const DEFAULT_IMAGES = {
  song: "songs/images/albums/default-album.svg",
  artist: "songs/images/artists/default-artist.svg",
  album: "songs/images/albums/default-album.svg",
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

function normalizeLocalCatalog(raw) {
  const songsSource = Array.isArray(raw) ? raw : raw?.songs || [];
  const podcastSource = Array.isArray(raw?.podcasts) ? raw.podcasts : [];
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

  if (!songs.length && !podcasts.length) {
    throw new Error("Local library is empty.");
  }

  return {
    songs,
    artists: buildArtistsFromSongs(songs),
    albums: buildAlbumsFromSongs(songs),
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

  return {
    songs: filteredSongs,
    artists: buildArtistsFromSongs(filteredSongs),
    albums: buildAlbumsFromSongs(filteredSongs),
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

  const filteredPodcasts = appState.musicData.podcasts.filter((podcast) =>
    `${podcast.title} ${podcast.host} ${podcast.episode}`.toLowerCase().includes(term)
  );

  renderSongs(filteredSongs);
  renderArtists(filteredArtists);
  renderAlbums(filteredAlbums);
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

  if (!songs.length) {
    throw new Error("No songs returned from iTunes.");
  }

  return {
    songs,
    artists: buildArtistsFromSongs(songs),
    albums: buildAlbumsFromSongs(songs),
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

  return {
    songs,
    artists: buildArtistsFromSongs(songs),
    albums: buildAlbumsFromSongs(songs),
    podcasts
  };
}

async function fetchLocalLibraryData() {
  const [catalogResponse, artistsResponse, albumsResponse, podcastsResponse] = await Promise.all([
    fetch(LOCAL_LIBRARY_PATH, { cache: "no-store" }),
    fetch("songs/artists.json", { cache: "no-store" }).catch(() => null),
    fetch("songs/albums.json", { cache: "no-store" }).catch(() => null),
    fetch("songs/podcasts.json", { cache: "no-store" }).catch(() => null)
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

  return normalizeLocalCatalog(raw);
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

function playTrackByIndex(index) {
  if (index < 0 || index >= appState.playableQueue.length) return;

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
