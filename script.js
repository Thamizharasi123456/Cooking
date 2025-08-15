let player;
const API_KEY = "AIzaSyAni6A-xfQU7WNtCX9xDyyjVDoZsxDapdk"; // Replace with your key
let recognition;
let recognizing = false;

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
      openVideoPage(video.id.videoId, video.snippet.title);
    });
    resultsDiv.appendChild(div);
  });
}

// Open video in a "full screen" page like YouTube
function openVideoPage(videoId, title) {
  const playerPage = document.createElement("div");
  playerPage.className = "player-page";
  playerPage.innerHTML = `
    <button class="close-btn">✖</button>
    <h2>${title}</h2>
    <div id="player"></div>
    <p id="status">🎤 Waiting for command...</p>
  `;
  document.body.innerHTML = ""; // clear old search page
  document.body.appendChild(playerPage);

  createPlayer(videoId);
  initVoiceRecognition();
  startListening();

  document.querySelector(".close-btn").addEventListener("click", () => {
    location.reload(); // go back to search
  });
}

function createPlayer(videoId) {
  player = new YT.Player('player', {
    height: '360',
    width: '100%',
    videoId: videoId,
    playerVars: { autoplay: 0, controls: 1 }
  });
}

// Voice recognition setup
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    recognizing = true;
    console.log("Voice recognition started");
  };

  recognition.onend = () => {
    recognizing = false;
    console.log("Voice recognition stopped");
    setTimeout(() => {
      if (!recognizing) recognition.start();
    }, 500);
  };

  recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    document.getElementById("status").textContent = `🎤 Heard: "${command}"`;
    handleCommand(command);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };
}

function startListening() {
  if (!recognition) initVoiceRecognition();
  recognition.start();
}

// Handle commands
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
    // Skip forward 5 seconds for ad skipping
    player.seekTo(player.getCurrentTime() + 5, true);
  }
}
