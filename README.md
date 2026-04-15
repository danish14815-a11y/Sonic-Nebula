# 🎧 Sonic Nebula

> *Feel the Music, See the Rhythm*

**Sonic Nebula** is a free, ad‑free web‑based music streaming platform built as our diploma major project at DSEU.  
Search and play millions of songs from JioSaavn – **zero ads, no subscription**.  
Plus a real‑time audio visualizer + ambient lighting that moves with the beat.

🔗 **Live demo:** [https://sonic-nebula-topaz.vercel.app/](https://sonic-nebula-topaz.vercel.app/)

---

## ✨ Features

- 🎵 **Search** – songs, albums, artists, playlists (tabbed results)
- 🎮 **Full player** – play/pause, next/prev, volume, seek, queue
- 🌈 **Ambient lighting** – background colour changes per song
- 📊 **Audio visualizer** – 48 frequency bars (Web Audio API)
- 📱 **Responsive** – mobile (375px) to 4K
- 💸 **100% free** – no ads, no login

---

## 🛠️ Tech stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 19, Tailwind CSS, Zustand, Axios, Radix UI |
| Backend      | Python FastAPI, Uvicorn, HTTPX, Motor           |
| Database     | MongoDB (caching)                               |
| Audio        | HTML5 Audio + Web Audio API                     |
| Deployment   | Vercel (frontend) + Emergent Cloud (backend)    |

---

## 🧠 How the visualizer works

```javascript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;  // 128 frequency bins

function draw() {
  analyser.getByteFrequencyData(dataArray);
  for (let i = 0; i < 48; i++) {
    let height = dataArray[i * step] / 255 * canvas.height;
    // draw bar with cyan→violet→rose gradient
  }
  requestAnimationFrame(draw);
}
```

---

## 👥 Team

Name               | Roll Number   | Role
-------------------|---------------|------------------------------------
Danish Siddique    | 230111009086  | Visualizer, ambient lighting, homepage
Abhinay Sharma     | 230111009003  | Music player, queue, artist pages
Bhanu Pratap       | 230111009076  | Backend API, search, trending
Aaditya Gautam     | 230111009001  | Album & playlist pages, track list

Guides: Ms. Kiran Dhanger, Ms. Deepika, Mr. Saurav Verma
Dept. of CSE, DSEU | 2023–2026

```
```

## 🙏 Acknowledgements

- JioSaavn unofficial API by sumit
- All open‑source tools we used
- Friends who beta‑tested
```
```
## 📄 License
```
MIT License

Copyright (c) 2026 Danish Siddique, Abhinay Sharma, Bhanu Pratap, Aaditya Gautam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
⭐ **Star this repo if you like it!**
