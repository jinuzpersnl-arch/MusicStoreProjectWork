# Songs Folder Structure

Use this structure for uploads:

- `songs/albums/1-tamil/` -> Tamil album songs
- `songs/albums/2-malayalam/` -> Malayalam album songs
- `songs/albums/3-hindi/` -> Hindi album songs
- `songs/albums/4-telugu/` -> Telugu album songs
- `songs/artists/<Artist-Name>/` -> Artist-wise songs
- `songs/podcasts/1-tamil/` -> Tamil podcasts
- `songs/podcasts/2-malayalam/` -> Malayalam podcasts
- `songs/podcasts/3-hindi/` -> Hindi podcasts
- `songs/podcasts/4-telugu/` -> Telugu podcasts
- `songs/images/albums/` -> Album cover images
- `songs/images/artists/` -> Artist images
- `songs/images/podcasts/` -> Podcast cover images

## Important for website pages

After uploading files, add entries in `songs/catalog.json`.

Example song entry:

```json
{
  "id": "song-1",
  "title": "My Tamil Song",
  "artist": "Anirudh Ravichander",
  "album": "My Tamil Album",
  "duration": "3:45",
  "file": "albums/1-tamil/my-tamil-song.mp3",
  "image": "images/albums/my-tamil-album.jpg",
  "artistImage": "images/artists/anirudh.jpg",
  "albumImage": "images/albums/my-tamil-album.jpg"
}
```

Example artist-wise file path if you want to reference from artists folder:

```json
{
  "id": "song-2",
  "title": "Artist Special Track",
  "artist": "AR Rahman",
  "album": "Collections",
  "duration": "4:10",
  "file": "artists/AR-Rahman/artist-special-track.mp3",
  "artistImage": "images/artists/ar-rahman.jpg"
}
```

Podcast entry example:

```json
{
  "id": "pod-1",
  "title": "Studio Talk",
  "host": "Host Name",
  "episode": "Episode 12",
  "file": "podcasts/1-tamil/studio-talk-ep12.mp3",
  "image": "images/podcasts/studio-talk.jpg"
}
```
