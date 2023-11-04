let video_type = "video/mp4";
let audio_type = "audio/webm;codecs=opus";
let blobs_recorded = [];
let w, h, media_recorder, stream, rec_blob, rec_url;
const el = id => document.getElementById(id)

let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");
canvas.style.display = "none";
el("pauseBtn").style.display = "none";
el("stopRecBtn").style.display = "none"

el("scr").addEventListener('change', capture)
el("vid").addEventListener('change', capture)
el("aud").addEventListener('change', capture)

function play_stream() {
    el("player").srcObject = stream;
    el("player").onloadedmetadata = (e) => {
        el("player").play();
        w = el("player").videoWidth;
        h = el("player").videoHeight;
        canvas.width = w;
        canvas.height = h;
    };
}
async function capture() {
    try {
        let options = { video: el("vid").checked, audio: el("aud").checked }
        if (el("scr").checked) {
            if (!navigator.mediaDevices?.getDisplayMedia) { return alert("screen recorder IS NOT available") }
            stream = await navigator.mediaDevices.getDisplayMedia(options)
            play_stream()
            return
        }
        if (!navigator.mediaDevices?.getUserMedia) { return alert("media recorder IS NOT available") }
        stream = await navigator.mediaDevices.getUserMedia(options)
        play_stream()
    } catch (err) { alert(err.message || "Something went wrong") }
}

if (localStorage.getItem("as")) {
    el("autosave").checked = "true"
    el("saveImgBtn").style.display = "none"
    el("saveRecBtn").style.display = "none"
}
el("autosave").addEventListener('change', () => {
    let value = el("autosave").checked
    if (value === true) {
        localStorage.setItem("as", value)
        el("saveImgBtn").style.display = "none"
        el("saveRecBtn").style.display = "none"
    } else {
        localStorage.removeItem("as")
        el("saveImgBtn").style.display = "inline-block"
        el("saveRecBtn").style.display = "inline-block"
    }
})

function snapshot() {
    try {
        el("saveImgBtn").disabled = false;
        context.fillRect(0, 0, w, h);
        context.drawImage(el("player"), 0, 0, w, h);
        canvas.style.display = "inline";
        localStorage.getItem("as") && saveImg()
    } catch (err) { alert(err.message || "Something went wrong") }
}
function saveImg() {
    let el = document.createElement('a')
    el.href = canvas.toDataURL()
    el.download = `img-${new Date().toLocaleString()}`
    el.click()
}
function saveRec() {
    let el = document.createElement('a')
    el.href = rec_url
    el.download = `rec-${new Date().toLocaleString()}`
    el.click()
}

function startRec() {
    try {
        rec_blob, rec_url = null
        blobs_recorded = []
        media_recorder = new MediaRecorder(stream);
        media_recorder.addEventListener('dataavailable', function (e) {
            blobs_recorded.push(e.data);
        });
        media_recorder.addEventListener('stop', function () {
            rec_blob = new Blob(blobs_recorded, { type: el("vid").checked ? video_type : audio_type });
            rec_url = URL.createObjectURL(rec_blob)
            localStorage.getItem("as") && saveRec()
        });
        media_recorder.start(1000);
        el("startRecBtn").style.display = "none";
        el("stopRecBtn").style.display = "inline-block";
        el("pauseBtn").style.display = "inline";
        el("status").innerText = "recording..."
    } catch (err) { alert(err.message || "Something went wrong") }
};

function stopRec() {
    try {
        media_recorder?.stop();
        el("saveRecBtn").disabled = false;
        el("startRecBtn").style.display = "inline-block";
        el("stopRecBtn").style.display = "none";
        el("pauseBtn").style.display = "none";
        el("status").innerText = ""
    } catch (err) { alert(err.message || "Something went wrong") }
};
function pauseRec() {
    try {
        if (media_recorder?.state === 'recording') {
            media_recorder.pause();
            el("status").innerText = "paused..."
            el("pauseBtn").innerText = "resume recording"
        } else if (media_recorder?.state === 'paused') {
            media_recorder.resume();
            el("status").innerText = "recording..."
            el("pauseBtn").innerText = "pause recording"
        }
    } catch (err) { alert(err.message || "Something went wrong") }
}

document.addEventListener('keyup', e => {
    let code = e.code
    if (code === "Space") { media_recorder?.state === 'recording' ? stopRec() : startRec() }
    code === "KeyP" && pauseRec()
    code === "Enter" && snapshot()
    code === "ArrowRight" && el("saveRecBtn").click()
    code === "ArrowLeft" && el("saveImgBtn").click()
})
capture()