// STATE, DB MANAGEMENT AND SETUP

// Setting up varaibles, pointing to different elements on the page to be used within functions
const videosWatchedEl = document.querySelectorAll('.videos-watched')
const timeWatchedEl = document.querySelectorAll('.time-watched')
const videoLinks = document.querySelectorAll('.video-playlist-link');
const initButton = document.querySelector('.init')
const playButton = document.querySelector('.play')
const pauseButton = document.querySelector('.pause')
const resetButton = document.querySelector('.reset')
const creditCloser = document.querySelector('.fa-times')
const generateButton = document.querySelector('.generate')
const creditWindow = document.querySelector('.credits')
const creditCount = document.querySelector('.credit-count')

let gazeIndicator = document.querySelector('.gazeIndicator')
let webgazerInitialized = false
let player;

// Varibles to load youtube api
const tag = document.createElement('script');
const firstScriptTag = document.getElementsByTagName('script')[0];

// Setting the state
let globalState = {
	videosWatched: 0,
	totalWatchDuration: 0,
	lastPausedTimestamp: 0
}	

// STATE MANIPULATION FUNCTIONS
function retriveCookies(state) {
	let newState = state
	for (let key in state) {
		newState[key] = Cookies.get(key) === undefined ? 0 : Cookies.get(key)
	}
	newState.lastPausedTimestamp = 0
	return newState
}

// Resets the cookies
function resetCookies() {
	for(let key in globalState) {
		Cookies.remove(key)
	}
}

// Stores cookies
function storeCookies(state) {
	for(let key in state) {
		Cookies.set(key, state[key], { expires: 30 })
	}
}

// Sets any value in the state back to 0
function resetLocalState() {
	return {
		videosWatched: 0,
		totalWatchDuration: 0,
		lastPausedTimestamp: 0
	}
}

// Updates the statistics on the page
function updateStatistics(state) {
	let seconds = Math.round(Number(state.totalWatchDuration));
	let timeDisplay = moment.utc(seconds*1000).format('HH:mm:ss')
	timeWatchedEl.forEach(el => el.innerText = timeDisplay)
	videosWatchedEl.forEach(el => el.innerText = state.videosWatched)
	calculateCredits(state)
}

// Calculates credits

function calculateCredits(state) {
	let credits = state.videosWatched * 100 + state.totalWatchDuration * 0.5
	creditCount.innerText = Math.floor(credits)
}

// Gets the time difference and stores it in the state
function recordTime(state, videoEnded = false) {
	let newTimeEntry;
	if (videoEnded) {
		newTimeEntry = player.getDuration() - Number(state.lastPausedTimestamp)
	} else {
		newTimeEntry = player.getCurrentTime() - Number(state.lastPausedTimestamp)
	}
	state.totalWatchDuration = newTimeEntry + Number(state.totalWatchDuration)
	state.lastPausedTimestamp = player.getCurrentTime();
	return state
}

// PROGRAM SEQUENCE

// Retrives any previous state
globalState = retriveCookies(globalState)

// Adding a click listeners to the buttons
initButton.addEventListener('click', function() {
	webgazer.begin()
	webgazerInitialized = true
})

playButton.addEventListener('click', function() {
	if (webgazerInitialized) {
		player.playVideo()
	} else {
		return
	}
})

creditCloser.addEventListener('click', function() {
	console.log('close')
	creditWindow.classList.add('hidden')
})

generateButton.addEventListener('click', function() {
	console.log('open')
	creditWindow.classList.remove('hidden')
})

pauseButton.addEventListener('click', function() {
	player.pauseVideo()
})

resetButton.addEventListener('click', function() {
	resetCookies()
	globalState = resetLocalState()
	updateStatistics(globalState)
})

// Adding click listeners to each of the video links which cue's that video into the video player
videoLinks.forEach(link => {
	link.addEventListener('click', cueVideo);
});


// Gets any data already stored in cookies and sets it as the global state. Updates those stats on the page
globalState = retriveCookies(globalState)
updateStatistics(globalState)

// Loads youtube API
tag.src = "https://www.youtube.com/iframe_api";
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// WEBGAZER
// Listens to the gaze tracker to see if the user is looking at the screen
webgazer.setGazeListener( function(data, elapsedTime) {
	let gazingAtScreen;
    if (data === null) {
		gazingAtScreen = false
		player.pauseVideo()
    } else {
		gazingAtScreen = true
	}
	gazeStatus(gazingAtScreen)
}).begin()

// changes the status of the colored gaze indicator depending on if the user is loooking at the screen
function gazeStatus(gazingAtScreen) {
	if (gazingAtScreen) {
		gazeIndicator.classList.remove('red')
		gazeIndicator.classList.add('green')
	} else {
		gazeIndicator.classList.remove('green')
		gazeIndicator.classList.add('red')
	}
}

// YOUTUBE IFRAME API

// Cues the next video in the youtube player
function cueVideo(event) {
	const url = event.target.dataset.link
	player.cueVideoById(url, 0, 'large')
}

// Contructs the video player once the youtube api is loaded, links the other functions to video player events
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '390',
		width: '640',
		videoId: 'HNdOPzcD3wI',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

// Pauses webgazer once the player has loaded
function onPlayerReady(event) {
	webgazer.pause()
}

// Prevents player from any actions if webgazer is not initilised otherwise controls how the program changes when the player pauses, stops, cues etc
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING) {
		updateStatistics(globalState)
		storeCookies(globalState)
		webgazer.resume()
	} else if (event.data == YT.PlayerState.ENDED) {
		globalState.videosWatched = Number(globalState.videosWatched) + 1
		globalState = recordTime(globalState, true)
		updateStatistics(globalState)
		storeCookies(globalState)
		webgazer.pause()
	} else if (event.data == YT.PlayerState.PAUSED) {
		globalState = recordTime(globalState)
		updateStatistics(globalState)
		storeCookies(globalState)
		webgazer.pause()
	} else if (event.data == YT.PlayerState.CUED) {
		globalState.lastPausedTimestamp = 0
		globalState = recordTime(globalState)
		updateStatistics(globalState)
		storeCookies(globalState)
	}
}

function pauseVideo() {
	player.pauseVideo()
}