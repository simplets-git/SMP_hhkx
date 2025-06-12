import terminalController from './core/terminal-controller.js';
import terminal from './core/terminal.js';
import terminalView from './core/terminal-view.js';

let soundcloudWidget;
let youtubePlayer;
let audioPlayer = null; // For local audio files
let activePlayer = null; // Can be 'soundcloud', 'youtube', or 'local'
let currentVolume = 50; // Shared volume state

const playlist = [
    // --- START: EDIT YOUR PLAYLIST HERE ---
    // Add your songs in this format: { url: 'URL_OR_PATH', title: 'SONG_TITLE', type: 'youtube|soundcloud|local' }
    { 
        url: 'https://www.youtube.com/watch?v=iG6M-vt-4JY', 
        title: '[ASMR] Cathode terminal emulator',
        type: 'local',
        localPath: 'assets/audio/ASMR.m4a' 
    },
    { 
        url: 'https://soundcloud.com/leather-and-lace/funami-fm', 
        title: 'Funami FM',
        type: 'soundcloud'
    },
    { 
        url: 'https://soundcloud.com/moskalus/premiere-alder-basalt-tripalium-corp', 
        title: 'Alder - Basalt', 
        startTime: 4,
        type: 'soundcloud' 
    },
    { 
        url: 'https://soundcloud.com/urbanstghetto/dj-freelancer-6666alxsf-remix', 
        title: '6666 - ALXSF Remix',
        type: 'soundcloud'
    },
    { 
        url: 'https://soundcloud.com/twoshell/everybody-worldwide', 
        title: 'Everybody Worldwide - Two Shell',
        type: 'soundcloud'
    },
    { 
        url: 'https://www.youtube.com/watch?v=vSK0GYjrZxQ', 
        title: 'After Chez Oim - Voiron',
        type: 'youtube'
    }
    // --- END: EDIT YOUR PLAYLIST HERE ---
];
let currentTrackIndex = 0; // Start with the first track in the playlist

// Helper function to extract YouTube Video ID
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Helper function to update song information display
function updateSongInfo(title, url) {
    const songInfo = document.getElementById('song-info');
    if (songInfo) {
        if (title && url) {
            songInfo.innerHTML = `<a href="${url}" target="_blank">${title}</a>`;
            songInfo.style.display = 'block';
        } else {
            // Optionally hide or clear if title/url are missing, or keep last known
            // For now, we only show if both are present.
            // songInfo.style.display = 'none'; 
        }
    }
}

// YouTube API Ready function (global callback)
window.onYouTubeIframeAPIReady = () => {
    const youtubeIframe = document.getElementById('youtube-player');
    if (youtubeIframe) {
        youtubePlayer = new YT.Player('youtube-player', {
            playerVars: {
                'autoplay': 0,          // Explicitly disable autoplay
                'controls': 0,          // Hide YouTube's default controls (if using custom)
                'showinfo': 0,          // Hide video title, uploader (optional)
                'rel': 0,               // Do not show related videos when playback ends (optional)
                'origin': window.location.origin // Important for security and some API functionalities
            },
            events: {
                'onReady': onYouTubePlayerReady,
                'onStateChange': onYouTubePlayerStateChange
            }
        });
    }
};

function onYouTubePlayerReady(event) {
    // console.log('YouTube Player Ready');
    event.target.setVolume(currentVolume);
    // If YouTube is the default player, set it as active and load the default track
    if (!activePlayer && playlist.length > 0) { // Ensure playlist is not empty
        activePlayer = 'youtube'; // Or determine based on first track type
        loadTrack(playlist[currentTrackIndex], false); // Load the initial track object, but don't play yet
    }
}

function onYouTubePlayerStateChange(event) {
    // Song info is now updated by loadTrack using the manually provided title.
    // We might still want to show/hide based on play/pause if desired, but title fetching is removed.
    // if (event.data === YT.PlayerState.PLAYING) {
    //     // songInfo.style.display = 'block'; // Already handled
    // } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    //     // if (songInfo) songInfo.style.display = 'none'; 
    // }
}

// Function to stop all players
function stopAllPlayers() {
    if (soundcloudWidget && typeof soundcloudWidget.pause === 'function') {
        soundcloudWidget.pause();
    }
    if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
        youtubePlayer.pauseVideo();
    }
    if (audioPlayer && typeof audioPlayer.pause === 'function') {
        audioPlayer.pause();
    }
    activePlayer = null;
}

// Function to load and switch tracks
function loadTrack(track, shouldPlayImmediately = true) { // track is an object, shouldPlayImmediately defaults to true
    stopAllPlayers(); // Force stop any playing audio first

    const url = track.url;
    const title = track.title;
    const trackType = track.type || (url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : 
                                  url.includes('soundcloud.com') ? 'soundcloud' : 'local');

    updateSongInfo(title, url); // Update display with provided title and URL immediately

    // Handle local audio files
    if (trackType === 'local') {
        activePlayer = 'local';
        
        // Create audio element if it doesn't exist
        if (!audioPlayer) {
            audioPlayer = new Audio();
            audioPlayer.volume = currentVolume / 100;
        }
        
        // Set the audio source
        audioPlayer.src = track.localPath || url;
        
        // Handle play if needed
        if (shouldPlayImmediately) {
            audioPlayer.play().catch(e => {
                console.error('Error playing local audio:', e);
                terminal.write({ text: "Error playing local audio file.", className: "terminal-error" });
                terminalView.createInputLine();
            });
        }
        
        return;
    }
    
    // Handle YouTube and SoundCloud
    if (trackType === 'youtube') {
        activePlayer = 'youtube';
        const videoId = extractVideoID(url);
        if (videoId && youtubePlayer && typeof youtubePlayer.loadVideoById === 'function') {
            youtubePlayer.loadVideoById(videoId);
            if (shouldPlayImmediately && typeof youtubePlayer.playVideo === 'function') {
                youtubePlayer.playVideo();
            }
        } else if (!videoId) {
            console.error('Could not extract YouTube video ID from URL:', url);
            updateSongInfo('Invalid YouTube URL', url);
        } else {
            console.error('YouTube Player not ready or loadVideoById not available.');
        }
    } else if (trackType === 'soundcloud') {
        activePlayer = 'soundcloud';
        if (soundcloudWidget) {
            soundcloudWidget.load(url, {
                auto_play: shouldPlayImmediately,
                buying: false,
                download: false,
                sharing: false,
                show_artwork: false,
                show_playcount: false,
                show_user: false,
                start_track: 0,
                single_active: true
            });
            // SoundCloud Widget API doesn't have a direct way to set volume, so we use CSS to hide the iframe
            // and control volume through the widget's API if needed
            if (soundcloudWidget.setVolume) {
                soundcloudWidget.setVolume(currentVolume);
            }
        } else {
            console.error('SoundCloud Widget not ready or invalid URL.');
            updateSongInfo('Error loading song', url);
        }
    } else {
        console.error('Unsupported track URL:', url);
        terminal.write({ text: "Unsupported track URL.", className: "terminal-error" });
        terminalView.createInputLine();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const soundcloudPlayerIframe = document.getElementById('soundcloud-player');
    const youtubePlayerIframe = document.getElementById('youtube-player');
    const prevBtn = document.getElementById('prev-btn');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeUpBtn = document.getElementById('volume-up-btn');
    const volumeDownBtn = document.getElementById('volume-down-btn');
    const songInfo = document.getElementById('song-info');

    if (!soundcloudPlayerIframe || !youtubePlayerIframe || !prevBtn || !playBtn || !stopBtn || !nextBtn || !volumeUpBtn || !volumeDownBtn || !songInfo) {
        console.error('Music player elements not found!');
        return;
    }

    // Initialize SoundCloud Widget
    songInfo.style.display = 'none'; // Ensure song info is hidden initially
    soundcloudWidget = SC.Widget(soundcloudPlayerIframe);
    soundcloudWidget.bind(SC.Widget.Events.READY, () => {
        // console.log('SoundCloud Widget Ready');
        soundcloudWidget.setVolume(currentVolume);
        // If SoundCloud is intended as default or first loaded, set it as active here
        // For now, YouTube is default, so this won't set activePlayer initially
    });

    soundcloudWidget.bind(SC.Widget.Events.PLAY, () => {
        // Song info is now updated by loadTrack using the manually provided title.
        // We might still want to show/hide based on play/pause if desired, but title fetching is removed.
        // songInfo.style.display = 'block'; // Already handled
    });
    // Helper functions for playlist navigation
    function playNextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(playlist[currentTrackIndex]);
    }

    function playPreviousTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(playlist[currentTrackIndex]);
    }

    // Button Event Listeners
    prevBtn.addEventListener('click', () => {
        if (!terminalController.isAuthenticated) {
            terminal.write({ text: "Please unlock the terminal to access Funami FM.", className: "terminal-error" });
            terminalView.createInputLine();
            return;
        }
        playPreviousTrack();
    });

    playBtn.addEventListener('click', () => {
        if (!terminalController.isAuthenticated) {
            terminal.write({ text: "Please unlock the terminal to access Funami FM.", className: "terminal-error" });
            terminalView.createInputLine();
            return;
        }

        // Ensure the current song's info is displayed when play is clicked
        if (playlist.length > 0 && playlist[currentTrackIndex]) {
            const currentTrack = playlist[currentTrackIndex];
            updateSongInfo(currentTrack.title, currentTrack.url);
        }

        if (activePlayer === 'soundcloud') {
            if (soundcloudWidget && typeof soundcloudWidget.play === 'function') {
                soundcloudWidget.play();
            }
        } else if (activePlayer === 'youtube' && youtubePlayer) {
            if (typeof youtubePlayer.playVideo === 'function') {
                youtubePlayer.playVideo();
            } else {
                console.error("Play button: YouTube player or playVideo function not available.");
            }
        } else if (activePlayer === 'local' && audioPlayer) {
            audioPlayer.play().catch(e => {
                console.error('Error playing local audio:', e);
                terminal.write({ text: "Error playing audio file.", className: "terminal-error" });
                terminalView.createInputLine();
            });
        }
    });

    stopBtn.addEventListener('click', () => {
        if (!terminalController.isAuthenticated) {
            terminal.write({ text: "Please unlock the terminal to access Funami FM.", className: "terminal-error" });
            terminalView.createInputLine();
            return;
        }
        if (activePlayer === 'soundcloud') {
            soundcloudWidget.pause();
        } else if (activePlayer === 'youtube') {
            youtubePlayer.pauseVideo();
        } else if (activePlayer === 'local' && audioPlayer) {
            audioPlayer.pause();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (!terminalController.isAuthenticated) {
            terminal.write({ text: "Please unlock the terminal to access Funami FM.", className: "terminal-error" });
            terminalView.createInputLine();
            return;
        }
        playNextTrack();
    });

    volumeUpBtn.addEventListener('click', () => {
        if (!terminalController.isAuthenticated) {
            terminal.write({ text: "Please unlock the terminal to access Funami FM.", className: "terminal-error" });
            terminalView.createInputLine();
            return;
        }
        currentVolume = Math.min(100, currentVolume + 10);
        if (activePlayer === 'soundcloud') {
            soundcloudWidget.setVolume(currentVolume);
        } else if (activePlayer === 'youtube') {
            youtubePlayer.setVolume(currentVolume);
        } else if (activePlayer === 'local' && audioPlayer) {
            audioPlayer.volume = currentVolume / 100;
        }
    });

    volumeDownBtn.addEventListener('click', () => {
        if (!terminalController.isAuthenticated) {
            terminal.write({ text: "Please unlock the terminal to access Funami FM.", className: "terminal-error" });
            terminalView.createInputLine();
            return;
        }
        currentVolume = Math.max(0, currentVolume - 10);
        if (activePlayer === 'soundcloud') {
            soundcloudWidget.setVolume(currentVolume);
        } else if (activePlayer === 'youtube') {
            youtubePlayer.setVolume(currentVolume);
        } else if (activePlayer === 'local' && audioPlayer) {
            audioPlayer.volume = currentVolume / 100;
        }
    });

    // Function to toggle player visibility
    function togglePlayerVisibility() {
        const playerContainer = document.getElementById('music-player-container');
        if (playerContainer) {
            const isVisible = playerContainer.style.display !== 'none';
            playerContainer.style.display = isVisible ? 'none' : 'flex'; // 'flex' is the display type when visible
            return !isVisible; // Return the new visibility state (true if shown, false if hidden)
        }
        return false;
    }

    // Expose functions for external use (e.g., terminal commands)
    window.musicPlayer = {
        loadTrack: loadTrack,
        toggleVisibility: togglePlayerVisibility
    };
});
