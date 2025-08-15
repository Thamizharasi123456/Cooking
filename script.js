let player;
let recognition;
const API_KEY = "AIzaSyAni6A-xfQU7WNtCX9xDyyjVDoZsxDapdk"; // Replace with valid key

// Start voice recognition on mobile
document.getElementById("startVoiceBtn").addEventListener("click", () => {
  if (!recognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      document.getElementById("status").textContent = `🎤 Heard: "${command}"`;
      handleCommand(command);
    };
    recognition.start();
  }
});

// YouTube search
document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchQuery").value.trim();
  if (!query) return;
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${API_KEY}`)
    .then(res => res.json())
    .then(data => displayResults(data.items))
    .catch(err => console.error(err));
});

function displayResults(videos) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  videos.forEach(video => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `<img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                     <p class="result-title">${video.snippet.title}</p>`;
    div.addEventListener("click", () => loadVideo(video.id.videoId));
    resultsDiv.appendChild(div);
  });
}

function loadVideo(videoId) {
  if (player) player.loadVideoById(videoId);
  else createPlayer(videoId);
}

function createPlayer(videoId) {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId,
    playerVars: { autoplay: 0, controls: 1 }
  });
}

function handleCommand(command) {
  if (!player) return;
  if (command.includes("play")) player.playVideo();
  else if (command.includes("pause")) player.pauseVideo();
  else if (command.includes("stop")) player.stopVideo();
  else if (command.includes("rewind")) player.seekTo(player.getCurrentTime() - 10, true);
  else if (command.includes("forward")) player.seekTo(player.getCurrentTime() + 10, true);
  else if (command.includes("repeat")) player.seekTo(0, true);
}
