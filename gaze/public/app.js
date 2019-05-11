
// WEBGAZER
webgazer.setGazeListener( function(data, elapsedTime) {
    if (data === null) {
        return
    }
	let coordinates = {
		x: data.x,
		y: data.y
	}
	let gazeWithinBounds = checkGazeBounds(coordinates, xAxisBounds, yAxisBounds)
	gazeStatus(gazeWithinBounds)
	gazeControl(gazeWithinBounds)
    // console.log(`GAZING AT - elapsedTime : ${elapsedTime} ||| dataX: ${coordinates.x} ||| dataY:${coordinates.y}`);
}).begin()

function gazeControl(gazeIsWithinBounds) {
	
	const videoPlayerIsPlaying = player.getPlayerState() === 1
	if (gazeIsWithinBounds) {
		console.log('within bounds')
		if (videoPlayerIsPlaying) {
			// player.pauseVideo()
		} else {
			return
		}
	} else {
		console.log('out of bounds')
		// player.pauseVideo()
	}
}

function gazeStatus(gazeWithinBounds) {
	if (gazeWithinBounds) {
		gazeIndicator.classList.remove('red')
		gazeIndicator.classList.add('green')
	} else {
		gazeIndicator.classList.remove('green')
		gazeIndicator.classList.add('red')
	}
}

function checkGazeBounds(coordinates, xAxisBounds, yAxisBounds) {
	let gazeWithinBounds
	if (coordinates.x > xAxisBounds.min &&
		coordinates.x < xAxisBounds.max &&
		coordinates.y > yAxisBounds.min &&
		coordinates.y < yAxisBounds.max) {
			gazeWithinBounds = true
		} else {
			gazeWithinBounds = false
		}
	return gazeWithinBounds
}

// STATE, DB MANAGEMENT AND SETUP
const videosWatchedEl = document.querySelector('.videos-watched')
const timeWatchedEl = document.querySelector('.time-watched')
const tag = document.createElement('script');
const videoLinks = document.querySelectorAll('.video-playlist__link');
const firstScriptTag = document.getElementsByTagName('script')[0];
const initButton = document.querySelector('.init')
let gazeIndicator = document.querySelector('.gazeIndicator')
let player;

initButton.addEventListener('click', function() {
	webgazer.begin()
})

// const xAxisBounds = {
// 	max: 1200,
// 	min: 200
// }

// const yAxisBounds = {
// 	max: 700,
// 	min: 200
// }

const xAxisBounds = {
	max: 1600,
	min: 100
}

const yAxisBounds = {
	max: 900,
	min: 100
}

let globalState = {
	videosWatched: 0,
	totalWatchDuration: 0,
	timeLookingAtScreen: 0,
	lastPausedTimestamp: 0
}


// STATE MANIPULATION FUNCTIONS
function retriveState(state) {
	let newState = state
	for (let key in state) {
		newState[key] = localStorage.getItem(key) === null ? 0 : localStorage.getItem(key)
	}
	return newState
}

function storeState(state) {
	for(let key in state) {
		localStorage.setItem(key, state[key])
	}
}

function resetState(key, state) {
	state[key] = 0
	return state
}

function updateStatistics(state) {
	timeWatchedEl.innerText = Math.round(state.totalWatchDuration)
	videosWatchedEl.innerText = state.videosWatched
}

// PROGRAM SEQUENCE
globalState = retriveState(globalState)

videoLinks.forEach(link => {
	link.addEventListener('click', cueVideo);
});

// Load youtube API
tag.src = "https://www.youtube.com/iframe_api";
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// YOUTUBE IFRAME API

function cueVideo(event) {
	console.log(event);
	const url = event.target.dataset.link
	console.log(url)
	player.cueVideoById(url, 0, 'large')
}

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

function onPlayerReady(event) {
	webgazer.pause()
	console.log('ready')
}

function onPlayerStateChange(event) {
	console.log(event)
	if (event.data == YT.PlayerState.PLAYING) {
		updateStatistics(globalState)
		webgazer.resume()
	} else if (event.data == YT.PlayerState.ENDED) {
		globalState.videosWatched++
		globalState = recordTime(globalState, true)
		updateStatistics(globalState)
		webgazer.pause()
	} else if (event.data == YT.PlayerState.PAUSED) {
		globalState = recordTime(globalState)
		updateStatistics(globalState)
		webgazer.pause()
	} else if (event.data == YT.PlayerState.CUED) {
		globalState = resetState('lastPausedTimestamp', globalState)
		globalState = recordTime(globalState)
		updateStatistics(globalState)
	}
}

function recordTime(state, videoEnded = false) {
	console.log(`duration : ${player.getDuration()}, currentTime: ${player.getCurrentTime()}`)
	console.log('state')
	console.log(state)
	let newTimeEntry;
	if (videoEnded) {
		newTimeEntry = player.getDuration() - state.lastPausedTimestamp
	} else {
		newTimeEntry = player.getCurrentTime() - state.lastPausedTimestamp
	}
	state.totalWatchDuration += newTimeEntry;
	state.lastPausedTimestamp = player.getCurrentTime();
	return state
}

function stopVideo() {
	player.stopVideo();
}

//  UTILITY FUNCTIONS
// function renderDotPosition(x, y) {
//     dot.style.top = `${x}px;`;
//     dot.style.left = `${y}px;`;
// }