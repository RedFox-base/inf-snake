/**
 * Minimal Monotone Music Player
 * Native HTML5 Audio with Local MP3 Files & YouTube Thumbnails
 */

(() => {
  const playlist = [
    {
      title: "Midnight Coast Chill",
      artist: "Sound Eve",
      youtubeId: "uf-aVxBA86c",
      src: "assets/music/Midnight Coast.mp3"
    },
    {
      title: "Book",
      artist: "RYU ITO MUSIC",
      youtubeId: "97vI2QoVfzo",
      src: "assets/music/Book.mp3"
    },
    {
      title: "Driftwood",
      artist: "RYU ITO MUSIC",
      youtubeId: "yhTgtK1HhiQ",
      src: "assets/music/Driftwood.mp3"
    }
  ];

  let currentIndex = 0;
  let isPlaying = false;
  let isMuted = false;
  let currentVolume = 0.7; // 0.0 to 1.0

  // Native HTML5 Audio instance
  const audio = new Audio();
  audio.preload = "auto";

  // DOM Elements
  const recordDisc = document.getElementById('recordDisc');
  const recordThumb = document.getElementById('recordThumb');
  const trackIndexEl = document.getElementById('trackIndex');
  const trackTitleEl = document.getElementById('trackTitle');
  const trackArtistEl = document.getElementById('trackArtist');

  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const muteBtn = document.getElementById('muteBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const muteIcon = document.getElementById('muteIcon');
  const volumeSlider = document.getElementById('volumeSlider');

  // --- Update UI Display for Current Track ---
  function updateTrackDisplay() {
    const track = playlist[currentIndex];
    trackIndexEl.textContent = `TRACK 0${currentIndex + 1} / 0${playlist.length}`;
    trackTitleEl.textContent = track.title;
    trackArtistEl.textContent = track.artist;

    // Retain high quality YouTube thumbnail
    const thumbUrl = `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`;
    recordThumb.src = thumbUrl;
  }

  // --- Play / Pause Control ---
  function setPlayState(playing) {
    isPlaying = playing;
    if (isPlaying) {
      recordDisc.classList.remove('paused');
      recordDisc.classList.add('playing');
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
    } else {
      recordDisc.classList.add('paused');
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    }
  }

  function togglePlay() {
    if (audio.paused) {
      // If audio has no src set yet, initialize it
      if (!audio.src || audio.src === window.location.href) {
        audio.src = encodeURI(playlist[currentIndex].src);
        audio.volume = currentVolume;
      }
      audio.play().then(() => {
        setPlayState(true);
      }).catch(err => {
        console.warn('Playback prevented or file error:', err);
      });
    } else {
      audio.pause();
      setPlayState(false);
    }
  }

  // --- Change Track ---
  function loadAndPlay(index) {
    currentIndex = (index + playlist.length) % playlist.length;
    updateTrackDisplay();

    audio.src = encodeURI(playlist[currentIndex].src);
    audio.volume = currentVolume;
    audio.play().then(() => {
      setPlayState(true);
    }).catch(err => {
      console.warn('Auto-play prevented:', err);
    });
  }

  function nextTrack() {
    loadAndPlay(currentIndex + 1);
  }

  function prevTrack() {
    loadAndPlay(currentIndex - 1);
  }

  // --- Volume & Mute ---
  function setVolume(val) {
    const num = parseInt(val, 10);
    currentVolume = num / 100;
    audio.volume = currentVolume;

    if (num === 0) {
      isMuted = true;
      audio.muted = true;
      volumeIcon.classList.add('hidden');
      muteIcon.classList.remove('hidden');
    } else {
      isMuted = false;
      audio.muted = false;
      volumeIcon.classList.remove('hidden');
      muteIcon.classList.add('hidden');
    }
  }

  function toggleMute() {
    if (isMuted) {
      audio.muted = false;
      isMuted = false;
      volumeIcon.classList.remove('hidden');
      muteIcon.classList.add('hidden');
      audio.volume = currentVolume || 0.5;
      volumeSlider.value = Math.round(audio.volume * 100);
    } else {
      audio.muted = true;
      isMuted = true;
      volumeIcon.classList.add('hidden');
      muteIcon.classList.remove('hidden');
      volumeSlider.value = 0;
    }
  }

  // --- Audio Event Listeners ---
  audio.addEventListener('play', () => setPlayState(true));
  audio.addEventListener('pause', () => setPlayState(false));
  audio.addEventListener('ended', () => {
    // Automatically advance to the next track when finished
    nextTrack();
  });

  // --- UI Event Listeners ---
  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextTrack);
  prevBtn.addEventListener('click', prevTrack);

  volumeSlider.addEventListener('input', (e) => {
    setVolume(e.target.value);
  });

  muteBtn.addEventListener('click', toggleMute);

  // Initialize
  audio.src = encodeURI(playlist[currentIndex].src);
  audio.volume = currentVolume;
  updateTrackDisplay();
})();
