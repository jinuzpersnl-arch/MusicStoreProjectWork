# Music Store

A beginner-friendly front-end music streaming style app built with HTML, CSS, and JavaScript.

## Open Source

This project is open source under the MIT License.

- License: [LICENSE](LICENSE)
- Contributions: [CONTRIBUTING.md](CONTRIBUTING.md)
- Community rules: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Features

- Browse songs, artists, albums, and podcasts
- Search across all content sections
- Live data from the iTunes Search API
- Automatic fallback to local sample data if API is unavailable
- Language-aware discovery (Global, English, Tamil, Malayalam, Hindi, Telugu)
- Source switch: `Full Tracks (Archive)` or `iTunes Preview (30s)`
- Download links with available formats/quality (when provided by source)
- Preferred quality filter: Lossless / High / Standard
- Preferred format filter: FLAC / MP3 / OGG / WAV
- Minimum duration filter (minutes)
- Play, pause, next, and previous controls
- Interactive progress bar with seek support
- Responsive layout for desktop and mobile
- Data rendered dynamically with JavaScript

## Project Structure

- `index.html` - app layout and sections
- `style.css` - responsive, modern UI styles
- `script.js` - API fetching, fallback data, search, and player logic
- `songs/catalog.json` - your local music library manifest (for uploaded files)
- `artists.html` - artists directory page from your uploaded songs
- `artist-detail.html` - selected artist songs page
- `albums.html` - albums directory page from your uploaded songs
- `album-detail.html` - selected album songs page
- `local-library.js` and `library-pages.js` - local catalog parsing and page rendering

## Run Locally

1. Open a terminal in the project folder:
   - `cd c:\MusicStoreProjectWork`
2. Start a simple local server (recommended):
   - Python: `python -m http.server 5500`
3. Open your browser and go to:
   - `http://localhost:5500`

You can also open `index.html` directly, but a local server is better for consistent browser behavior.

## API Notes

- The app uses iTunes public endpoints, so no API key is required.
- For longer playable tracks and multi-format downloads, use `Full Tracks (Archive)`.
- For best results, use an internet connection.
- If live requests fail, the app keeps working with built-in sample data.

## Add Your Own Songs

1. Put audio files in `c:\MusicStoreProjectWork\songs`
2. Edit `songs/catalog.json` and set each song `file` to the exact filename
3. Example:
   - `"file": "my-track.mp3"`
4. Add `artist` and `album` values for each song so Artists/Albums pages are created correctly.
5. Add optional image fields for better UI cards:
   - song: `"image"`, `"artistImage"`, `"albumImage"`
   - podcast: `"image"`
   - metadata files: `songs/artists.json` and `songs/albums.json` support `"image"`
6. Put image files in:
   - `songs/images/artists`
   - `songs/images/albums`
   - `songs/images/podcasts`
7. Reload the app; it will auto-load `Local Library (Your Uploads)`

## Publish Publicly (GitHub Pages)

1. Create a GitHub repository and push this project.
2. In GitHub, go to `Settings > Pages`.
3. Under `Build and deployment`, set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or your default branch) and `/ (root)`
4. Save and wait for deployment.
5. Your public URL will be:
   - `https://<your-username>.github.io/<repo-name>/`

Important: keep song file names and paths in `songs/catalog.json` exactly matching files in the `songs` folder so public users can play them.

## Make It Global + Open Source

1. Create a public GitHub repository.
2. Push this project to the repository.
3. Keep repository visibility as `Public`.
4. Enable GitHub Pages in repository settings.
5. Share the generated `https://<username>.github.io/<repo>/` URL.
