let player;
const API_KEY = "AIzaSyAni6A-xfQU7WNtCX9xDyyjVDoZsxDapdk"; // Your API Key
let recognition; // Global to reuse

// Called when YouTube IFrame API is ready
function onYouTubeIframeAPIReady() {
  // Player will be created after user selects a video
}

// Search YouTube videos
document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchQuery").value.trim();
  if (query) {
    searchYouTube(query);
  }
});

function searchYouTube(query) {
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      displayResults(data.items);
    })
    .catch(err => console.error("YouTube API Error:", err));
}

function displayResults(videos) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  videos.forEach(video => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
      <p class="result-title">${video.snippet.title}</p>
    `;
    div.addEventListener("click", () => {
      loadVideo(video.id.videoId);
      initVoiceRecognition(); // Initialize when video starts
    });
    resultsDiv.appendChild(div);
  });
}

function loadVideo(videoId) {
  if (player) {
    player.loadVideoById(videoId);
  } else {
    createPlayer(videoId);
  }
}

function createPlayer(videoId) {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: videoId,
    playerVars: { autoplay: 0, controls: 1 }
  });
}

// Initialize voice recognition (works for mobile + desktop)
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false; // Better for mobile
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.trim().toLowerCase();
    document.getElementById("status").textContent = `🎤 Heard: "${command}"`;
    handleCommand(command);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    // Restart automatically on mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      setTimeout(() => recognition.start(), 400);
    }
  };

  recognition.start();
}

// Handle allowed commands only
function handleCommand(command) {
  if (!player) return;

  if (command.includes("play")) {
    player.playVideo();
  } 
  else if (command.includes("pause")) {
    player.pauseVideo();
  } 
  else if (command.includes("stop")) {
    player.stopVideo();
  }
  else if (command.includes("rewind")) {
    player.seekTo(player.getCurrentTime() - 10, true);
  } 
  else if (command.includes("forward")) {
    player.seekTo(player.getCurrentTime() + 10, true);
  } 
  else if (command.includes("repeat")) {
    player.seekTo(0, true);
  }
  else if (command.includes("skip")) {
    player.seekTo(player.getCurrentTime() + 5, true); // Skip ahead
  }
}
