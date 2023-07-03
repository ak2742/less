let video_type = "video/mp4";
let audio_type = "audio/webm;codecs=opus";
let blobs_recorded = [];
let w, h, media_recorder, stream, rec_blob, rec_url;
const el = id => document.getElementById(id)

let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");
canvas.style.display = "none";
el("pauseBtn").style.display = "none";

el("scr").addEventListener('change', capture)
el("vid").addEventListener('change', capture)
el("aud").addEventListener('change', capture)
window.addEventListener('load', capture)

// capture media device
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
            stream = await navigator.mediaDevices.getDisplayMedia(options)
            play_stream()
            return
        }
        stream = await navigator.mediaDevices.getUserMedia(options)
        play_stream()
    } catch (error) {
        console.log(error);
        alert(error.message || error)
    }
}

if (localStorage.getItem("as")) {
    el("autosave").checked = "true"
}
el("autosave").addEventListener('change', () => {
    let value = el("autosave").checked
    value === true ? localStorage.setItem("as", value) : localStorage.removeItem("as")
})

// take snapshot
function snapshot() {
    try {
        context.fillRect(0, 0, w, h);
        context.drawImage(el("player"), 0, 0, w, h);
        canvas.style.display = "block";
        localStorage.getItem("as") && saveImg()
    } catch (error) {
        console.log(error);
        alert(error.message || error)
    }
}
function saveImg() {
    let el = document.createElement('a')
    el.href = canvas.toDataURL()
    el.download = `img-${new Date().toLocaleString()}`
    el.click()
}
function saveRec() {
    try {
        media_recorder?.state !== 'inactive' && stopRec()
        let el = document.createElement('a')
        el.href = rec_url
        el.download = `rec-${new Date().toLocaleString()}`
        el.click()
    } catch (error) {
        console.log(error);
        alert(error.message || error)
    }
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
        el("pauseBtn").style.display = "inline";
        el("status").innerText = "recording..."
    } catch (error) {
        console.log(error);
        alert(error.message || error)
    }
};

function stopRec() {
    try {
        media_recorder?.stop();
        el("pauseBtn").style.display = "none";
        el("status").innerText = ""
    } catch (error) {
        console.log(error);
        alert(error.message || error)
    }
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
    } catch (error) {
        console.log(error);
        alert(error.message || error)
    }
}

// keyboard input
document.addEventListener('keyup', e => {
    let code = e.code
    if (code === "Space") {
        media_recorder?.state === 'recording' ? stopRec() : startRec()
    } else if (code === "KeyP") {
        pauseRec()
    } else if (code === "Enter") {
        snapshot()
    } else if (code === "ArrowRight") {
        saveImg()
    } else if (code === "ArrowLeft") {
        saveRec()
    }
})