console.log('app.js running')
webgazer.begin()
let dot = document.querySelector('.gaze-dot')
webgazer.setGazeListener( function(data, elapsedTime) {
    if (data === null) {
        return
    }
    let xPrediction = data.x;
    let yPrediction = data.y;
    renderDotPosition(xPrediction, yPrediction)
    console.log(`GAZING AT - elapsedTime : ${elapsedTime} ||| dataX: ${xPrediction} ||| dataY:${yPrediction}`);
}).begin()


function renderDotPosition(x, y) {
    dot.style.top = `${x}px;`;
    dot.style.left = `${y}px;`;
}