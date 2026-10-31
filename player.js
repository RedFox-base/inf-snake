/**
 * Minimal Monotone Music Player
 * Native HTML5 Audio with Local MP3 Files & YouTube Thumbnails & Bootstrap Icons
 */

(() => {
  const playlist = [
    {
      title: "Midnight Coast Chill",
      artist: "Sound Eve",
      youtubeId: "uf-aVxBA86c",
      youtubeUrl: "https://youtu.be/uf-aVxBA86c",
      src: "assets/music/Midnight Coast.mp3"
    },
    {
      title: "Book",
      artist: "RYU ITO MUSIC",
      youtubeId: "97vI2QoVfzo",
      youtubeUrl: "https://youtu.be/97vI2QoVfzo",
      src: "assets/music/Book.mp3"
    },
    {
      title: "Driftwood",
      artist: "RYU ITO MUSIC",
      youtubeId: "yhTgtK1HhiQ",
      youtubeUrl: "https://youtu.be/yhTgtK1HhiQ",
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
  const trackYoutubeLink = document.getElementById('trackYoutubeLink');

  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const muteBtn = document.getElementById('muteBtn');
  const volumeSlider = document.getElementById('volumeSlider');

  // --- Update UI Display for Current Track ---
  function updateTrackDisplay() {
    const track = playlist[currentIndex];
    trackIndexEl.textContent = `TRACK 0${currentIndex + 1} / 0${playlist.length}`;
    trackTitleEl.textContent = track.title;
    trackArtistEl.textContent = track.artist;

    if (trackYoutubeLink) {
      trackYoutubeLink.href = track.youtubeUrl;
    }

    // High quality YouTube thumbnail
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
  // バーの黒い塗り幅（動かした分）を現在値に合わせる
  function updateSliderFill() {
    volumeSlider.style.setProperty('--vol-percent', `${volumeSlider.value}%`);
  }

  function applyMuteState(muted) {
    isMuted = muted;
    audio.muted = muted;
    muteBtn.classList.toggle('muted', muted);
  }

  function setVolume(val) {
    const num = parseInt(val, 10);
    if (num > 0) {
      currentVolume = num / 100;
      audio.volume = currentVolume;
    }
    applyMuteState(num === 0);
    updateSliderFill();
  }

  function toggleMute() {
    if (isMuted) {
      if (currentVolume === 0) currentVolume = 0.5;
      audio.volume = currentVolume;
      volumeSlider.value = Math.round(currentVolume * 100);
      applyMuteState(false);
    } else {
      volumeSlider.value = 0;
      applyMuteState(true);
    }
    updateSliderFill();
  }

  // --- Audio Event Listeners ---
  audio.addEventListener('play', () => setPlayState(true));
  audio.addEventListener('pause', () => setPlayState(false));
  audio.addEventListener('ended', () => {
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
  volumeSlider.value = Math.round(currentVolume * 100);
  updateSliderFill();
  updateTrackDisplay();
})();
