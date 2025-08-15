let player;
const API_KEY = "YOUR_API_KEY"; // Replace with your valid YouTube Data API key

// Global SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    document.getElementById("status").textContent = `🎤 Heard: "${command}"`;
    handleCommand(command);
  };

  recognition.onerror = (event) => console.error("Speech recognition error:", event.error);
} else {
  alert("Speech Recognition not supported in this browser.");
}

// Start recognition via user interaction
document.getElementById("startBtn").addEventListener("click", () => {
  if (recognition) recognition.start();
});

// YouTube search button
document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchQuery").value.trim();
  if (!query) {
    alert("Please enter a search term.");
    return;
  }
  searchYouTube(query);
});

async function searchYouTube(query) {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      alert("No videos found.");
      return;
    }

    displayResults(data.items);
  } catch (err) {
    console.error("YouTube API Error:", err);
    alert("Error fetching YouTube videos. Check your API key and internet connection.");
  }
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
    div.addEventListener("click", () => loadVideo(video.id.videoId));
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

// Voice commands
function handleCommand(command) {
  if (!player) return;

  if (command.includes("play")) player.playVideo();
  else if (command.includes("pause")) player.pauseVideo();
  else if (command.includes("stop")) player.stopVideo();
  else if (command.includes("rewind")) player.seekTo(player.getCurrentTime() - 10, true);
  else if (command.includes("forward")) player.seekTo(player.getCurrentTime() + 10, true);
  else if (command.includes("repeat")) player.seekTo(0, true);
}
