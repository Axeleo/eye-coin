
console.log('app.js running')

// WEBGAZER
// let dot = document.querySelector('.gaze-dot')
webgazer.setGazeListener( function(data, elapsedTime) {
    if (data === null) {
        return
    }
    let xPrediction = data.x;
    let yPrediction = data.y;
    // renderDotPosition(xPrediction, yPrediction)
    console.log(`GAZING AT - elapsedTime : ${elapsedTime} ||| dataX: ${xPrediction} ||| dataY:${yPrediction}`);
}).begin()

// STATE AND COOKIE MANAGEMENT

let globalState = {
	videosWatched: 0,
	totalWatchDuration: 0,
	timeLookingAtScreen: 0,
	lastPausedTimestamp: 0
}

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

// Program SEQUENCE
globalState = retriveState(globalState)

// YOUTUBE IFRAME API

var tag = document.createElement('script');
const videoLinks = document.querySelectorAll('.video-playlist__link');

videoLinks.forEach(link => {
	link.addEventListener('click', cueVideo);
});

function cueVideo(event) {
	console.log(event);
	const url = event.target.dataset.link
	console.log(url)
	player.cueVideoById(url, 0, 'large')
}

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
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
		webgazer.resume()
	} else if (event.data == YT.PlayerState.ENDED) {
		globalState.videosWatched++
		globalState = recordTime(globalState, true)
		webgazer.pause()
	} else if (event.data == YT.PlayerState.PAUSED) {
		globalState = recordTime(globalState)
		webgazer.pause()
	} else if (event.data == YT.PlayerState.CUED) {
		globalState = resetState('lastPausedTimestamp', globalState)
		globalState = recordTime(globalState)
	}
}

function resetState(key, state) {
	state[key] = 0
	return state
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