let voiceList = "";
let index = 0;
let sInd = 0;
let pitch = 1;
let rate = 1;
let listening, toggleSession;
const el = id => document.getElementById(id)
let list = document.createElement('div')
let voices = speechSynthesis.getVoices()

let suggestions = ["what's the time", "list your voices", "go to facebook.com", "what is my ip address", "how is the weather outside", "open youtube"]
let printS = () => {
    list.innerHTML = 'try saying "' + suggestions[sInd] + '"'
    if (sInd < suggestions.length - 1) {
        sInd++
    } else {
        sInd = 0
    }
}
let suggest = setInterval(printS, 1500);;

// speaker------------------
let speakOut = (txt) => {
    try {
        while (voices.length === 0) {
            voices = speechSynthesis.getVoices()
        }
        let speech = new SpeechSynthesisUtterance(txt);

        speech.voice = voices[parseInt(index) || 0];
        speech.pitch = parseFloat(pitch) || 1;
        speech.rate = parseFloat(rate) || 1;
        speechSynthesis.speak(speech);
    } catch (error) {
        console.log(error);
        alert(error.message || error);
    }
}

// listener-------------
let SpeechRec = webkitSpeechRecognition;
if (typeof SpeechRec === "undefined") {
    el("session").remove()
    el("status").innerHTML = ("<b>Browser does not support Speech API.<b>");
}
const recognition = new SpeechRec();
recognition.lang = "en-IN";
recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = function (event) {
    el("status").innerHTML = "Listening..."
};
recognition.onspeechend = function (event) {
    el("status").innerHTML = ""
}

recognition.onresult = async function (event) {
    const last = event.results.length - 1
    const input = event.results[last]
    const transcript = input[0].transcript;
    const confidence = input[0].confidence;

    if (input.isFinal && (confidence > 0.75)) {
        el("status").innerHTML = "Processing..."
        el("inputBox").innerHTML = transcript
        let result = await process(transcript)
        el("outputBox").innerHTML = result
        document.body.appendChild(list)
        speakOut(result)
        el("status").innerHTML = ""
    } else {
        el("status").innerHTML = "Say that again please."
    }
}

toggleSession = () => {
    if (listening) {
        recognition.stop()
        el("status").innerHTML = ""
        el("session").innerHTML = "Start a new Session"
    }
    else {
        recognition.start();
        el("session").innerHTML = "Stop Listening"
    }
    listening = !listening
}

// textinput
el("command").addEventListener('change', async (e) => {
    e.preventDefault();
    let command = el('command').value
    el("status").innerHTML = "Processing..."
    el("inputBox").innerHTML = command
    let result = await process(command)
    el("outputBox").innerHTML = result
    document.body.appendChild(list)
    speakOut(result)
    el("status").innerHTML = ""
    el('command').value = ""
})

// processor
const process = async (txt) => {
    while (voices.length === 0) {
        voices = speechSynthesis.getVoices()
    }
    query = txt.toLowerCase().replace(/\s/g, "");
    if (query.length === 0) {
        response = ""
    }
    else if (query.startsWith("hi") || query.startsWith("hello")) {
        response = "Hi Dear!"
    }
    else if (query.startsWith("say")) {
        response = txt.slice(3, txt.length).trim()
    }
    else if (query.includes("lang")) {
        ln = query.replace("lang", "")
        if (ln.length === 0) {
            response = recognition.lang
        } else {
            recognition.lang = txt.slice(4, txt.length).trim()
            response = "Input language changed"
        }
    }
    else if (query.includes("index")) {
        index = parseInt(query.replace("index", ""))
        response = "Voice index changed"
    }
    else if (query.includes("pitch")) {
        pitch = parseFloat(query.replace("pitch", ""))
        response = "Voice pitch changed"
    }
    else if (query.includes("rate")) {
        rate = parseFloat(query.replace("rate", ""))
        response = "Voice rate changed"
    }
    else if (query.includes("date")) {
        const t = new Date().toLocaleDateString();
        response = `The date is ${t}`
    }
    else if (query.includes("time")) {
        const t = new Date().toLocaleTimeString();
        response = `The time is ${t}`
    }
    else if (query.includes("yourvoices")) {
        if (voiceList === "") {
            for (let index = 0; index < voices.length; index++) {
                const _lang = voices[index].lang;
                const _name = voices[index].name;
                voiceList += `${index} || ${_name} || ${_lang}<br>`
            }
            clearInterval(suggest)
            list.innerHTML = voiceList
        }
        response = "Here is a list of available voice samples"
    }
    else if (query.startsWith("goto")) {
        let site = query.replace("goto", "")
        open(`http://${site}`, "_blank")
        response = `opened ${site} in new tab.`
    }
    else if (query.startsWith("open")) {
        let site = query.replace("open", "")
        open(`http://${site}.com`, "_blank")
        response = `opened ${site} in new tab.`
    }
    else if (query.includes("myip")) {
        clearInterval(suggest)
        list.innerHTML = ""
        ipAdd = x => {
            if (ipRec.indexOf(x) === -1) {
                ipRec.push(x)
                list.innerHTML += x + "<br>"
            }
        }
        await getipv4()
        await getipv6()
        response = `your ip address is ${ipRec[0]}`
    }
    else if (query.includes("mylocation") || query.includes("whereiam")) {
        clearInterval(suggest)
        locAdd = x => {
            locationRec.push(x)
            list.innerHTML = `timestamp: ${x.timestamp}, latitude: ${x.coords.latitude}, longitude: ${x.coords.longitude}, accuracy: ${x.coords.accuracy} <a target="_blank" href="https://www.google.com/maps/@${x.coords.latitude},${x.coords.longitude}">on google maps</a><br>`
        }
        getCurrentLocation()
        response = "here are your location coordinates"
    }
    else if (query.includes("weather")) {
        try {
            clearInterval(suggest)
            let uri = '?ddtj[yy4tqvKJ4d?J=4tqv5wYyBEy5h==JTdv~jwT;`Jg38k  E8f 56f^<<^<6fk^F_kEk8kSF_r234hdw[qtr04T>3JT'
            const pass_key = prompt("password").split("$")
            uri = dec(uri, pass_key[0], parseInt(pass_key[1]))
            if (uri.startsWith("http")) {
                const res = await fetch(uri)
                const x = await res.json()
                list.innerHTML = `latitude: ${x.location.lat}, longitude: ${x.location.lon}, location: ${x.location.name}, cloud: ${x.current.cloud}, humidity: ${x.current.humidity}, temperature: ${x.current.temp_c}, feels like: ${x.current.feelslike_c}, wind kph: ${x.current.wind_kph}, wind direction: ${x.current.wind_dir}, condition: ${x.current.condition.text}<br>`
                response = `it's ${x.current.condition.text} outside now.`
            } else {
                response = `incorrect password`
            }
        } catch (err) { response = err.message || "an error occured, please try again." }
    }
    else if (recognition.lang !== "en-IN") {
        response = txt
    }
    else {
        open(`http://google.com/search?q=${txt}`, "_blank")
        response = `found something about ${txt}.`
    }
    return response
}