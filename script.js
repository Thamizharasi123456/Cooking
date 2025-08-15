let player;
const API_KEY = "AIzaSyAni6A-xfQU7WNtCX9xDyyjVDoZsxDapdk"; // Replace with your YouTube Data API key
let recognition; // Global SpeechRecognition instance
let voiceStarted = false; // Ensure voice starts only once

// YouTube search button
document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchQuery").value.trim();
  if (query) searchYouTube(query);
});

// Fetch videos from YouTube API
function searchYouTube(query) {
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${API_KEY}`)
    .then(res => res.json())
    .then(data => displayResults(data.items))
    .catch(err => console.error("YouTube API Error:", err));
}

// Display search results
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
      if (!voiceStarted) {
        startVoiceRecognition(); // Start voice recognition on first click
        voiceStarted = true;
      }
    });
    resultsDiv.appendChild(div);
  });
}

// Load selected video
function loadVideo(videoId) {
  if (player) player.loadVideoById(videoId);
  else createPlayer(videoId);
}

// Create YouTube player
function createPlayer(videoId) {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: videoId,
    playerVars: { autoplay: 0, controls: 1 }
  });
}

// Start continuous voice recognition
function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    document.getElementById("status").textContent = `🎤 Heard: "${command}"`;
    handleCommand(command);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.start();
}

// Handle voice commands
function handleCommand(command) {
  if (!player) return;

  if (command.includes("play")) player.playVideo();
  else if (command.includes("pause")) player.pauseVideo();
  else if (command.includes("stop")) player.stopVideo();
  else if (command.includes("rewind")) player.seekTo(player.getCurrentTime() - 10, true);
  else if (command.includes("forward")) player.seekTo(player.getCurrentTime() + 10, true);
  else if (command.includes("repeat")) player.seekTo(0, true);
}
