function normalizeLocalPath(value) {
  const raw = String(value || "").trim().replaceAll("\\", "/").replace(/^\.?\//, "");
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("songs/")) return raw;
  return `songs/${raw}`;
}

const DEFAULT_IMAGES = {
  song: "songs/images/albums/default-album.svg",
  artist: "songs/images/artists/default-artist.svg",
  album: "songs/images/albums/default-album.svg"
};

function normalizeSong(song, index) {
  const audioUrl = normalizeLocalPath(song?.audioUrl || song?.url || song?.file || "");
  if (!audioUrl) return null;

  // Extract format from file extension
  const format = getFormatFromUrl(audioUrl);
  const quality = guessQuality(format);

  return {
    id: song?.id ?? `song-${index + 1}`,
    title: song?.title || `Song ${index + 1}`,
    artist: song?.artist || "Unknown Artist",
    album: song?.album || "Unknown Album",
    duration: song?.duration || "3:00",
    image: normalizeLocalPath(song?.image || song?.artwork || song?.cover || "") || DEFAULT_IMAGES.song,
    artistImage: normalizeLocalPath(song?.artistImage || "") || DEFAULT_IMAGES.artist,
    albumImage: normalizeLocalPath(song?.albumImage || "") || DEFAULT_IMAGES.album,
    audioUrl,
    downloads: [
      {
        label: format,
        format: format,
        quality: quality,
        size: "",
        url: audioUrl
      }
    ]
  };
}

function getFormatFromUrl(url) {
  if (!url) return "MP3";
  const ext = url.toLowerCase().split('.').pop();
  if (ext === 'mp3') return "MP3";
  if (ext === 'flac') return "Flac";
  if (ext === 'wav') return "WAVE";
  if (ext === 'ogg') return "Ogg Vorbis";
  if (ext === 'm4a' || ext === 'aac') return "MPEG4 Audio";
  if (ext === 'aiff' || ext === 'aif') return "AIFF";
  return "MP3";
}

function guessQuality(format) {
  const key = String(format || "").toLowerCase();
  if (key.includes("flac") || key.includes("lossless") || key.includes("wave") || key.includes("aiff")) {
    return "Lossless";
  }
  if (key.includes("ogg")) return "High";
  if (key.includes("mp3") || key.includes("mpeg4") || key.includes("aac") || key.includes("m4a")) return "Standard";
  return "Standard";
}

async function loadJsonIfExists(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function makeArtistImageMap(rawArtists) {
  const map = new Map();
  if (!Array.isArray(rawArtists)) return map;

  rawArtists.forEach((artist) => {
    const name = String(artist?.name || "").trim().toLowerCase();
    if (!name) return;
    const image = normalizeLocalPath(artist?.image || artist?.photo || artist?.artwork || "");
    if (image) map.set(name, image);
  });

  return map;
}

function makeAlbumImageMap(rawAlbums) {
  const map = new Map();
  if (!Array.isArray(rawAlbums)) return map;

  rawAlbums.forEach((album) => {
    const title = String(album?.title || "").trim().toLowerCase();
    const artist = String(album?.artist || "").trim().toLowerCase();
    if (!title) return;
    const key = `${title}::${artist}`;
    const image = normalizeLocalPath(album?.image || album?.cover || album?.artwork || "");
    if (image) map.set(key, image);
  });

  return map;
}

async function loadLibraryData() {
  const [catalogJson, artistsJson, albumsJson, podcastsJson] = await Promise.all([
    loadJsonIfExists("songs/catalog.json"),
    loadJsonIfExists("songs/artists.json"),
    loadJsonIfExists("songs/albums.json"),
    loadJsonIfExists("songs/podcasts.json")
  ]);

  if (!catalogJson) {
    throw new Error("songs/catalog.json not found.");
  }

  const rawSongs = Array.isArray(catalogJson) ? catalogJson : catalogJson?.songs || [];
  const songs = rawSongs.map(normalizeSong).filter(Boolean);

  const artistImageMap = makeArtistImageMap(artistsJson?.artists);
  const albumImageMap = makeAlbumImageMap(albumsJson?.albums);

  songs.forEach((song) => {
    const artistKey = song.artist.trim().toLowerCase();
    const albumKey = `${song.album.trim().toLowerCase()}::${song.artist.trim().toLowerCase()}`;

    if (!song.artistImage && artistImageMap.has(artistKey)) {
      song.artistImage = artistImageMap.get(artistKey);
    }

    if (!song.albumImage && albumImageMap.has(albumKey)) {
      song.albumImage = albumImageMap.get(albumKey);
    }
  });

  return {
    songs,
    podcasts: Array.isArray(podcastsJson?.podcasts) ? podcastsJson.podcasts : [],
    artists: Array.isArray(artistsJson?.artists) ? artistsJson.artists : []
  };
}

async function loadCatalog() {
  const data = await loadLibraryData();
  return data.songs;
}

function groupByArtist(songs) {
  const byArtist = new Map();

  songs.forEach((song) => {
    const key = song.artist.trim() || "Unknown Artist";
    const current = byArtist.get(key) || {
      name: key,
      songs: [],
      count: 0,
      image: song.artistImage || song.image || DEFAULT_IMAGES.artist
    };

    current.songs.push(song);
    current.count += 1;
    if (!current.image && (song.artistImage || song.image)) {
      current.image = song.artistImage || song.image;
    }
    byArtist.set(key, current);
  });

  return [...byArtist.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function groupByAlbum(songs) {
  const byAlbum = new Map();

  songs.forEach((song) => {
    const albumTitle = song.album.trim() || "Unknown Album";
    const artistName = song.artist.trim() || "Unknown Artist";
    const key = `${albumTitle}::${artistName}`;
    if (!byAlbum.has(key)) {
      byAlbum.set(key, {
        title: albumTitle,
        artist: artistName,
        songs: [],
        image: song.albumImage || song.image || DEFAULT_IMAGES.album
      });
    }

    const current = byAlbum.get(key);
    current.songs.push(song);
    if (!current.image && (song.albumImage || song.image)) {
      current.image = song.albumImage || song.image;
    }
  });

  return [...byAlbum.values()]
    .map((album) => ({ ...album, count: album.songs.length }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function songsByArtist(songs, artistName) {
  const target = String(artistName || "").trim().toLowerCase();
  return songs.filter((song) => song.artist.trim().toLowerCase() === target);
}

function songsByAlbum(songs, albumTitle, artistName) {
  const titleTarget = String(albumTitle || "").trim().toLowerCase();
  const artistTarget = String(artistName || "").trim().toLowerCase();

  return songs.filter((song) => {
    const titleMatch = song.album.trim().toLowerCase() === titleTarget;
    const artistMatch = !artistTarget || song.artist.trim().toLowerCase() === artistTarget;
    return titleMatch && artistMatch;
  });
}

window.LocalLibrary = {
  loadLibraryData,
  loadCatalog,
  groupByArtist,
  groupByAlbum,
  songsByArtist,
  songsByAlbum,
  normalizeLocalPath
};
