let voiceList = "";
let index = 0;
let sInd = 0;
let pitch = 1;
let rate = 1;
let listening, toggleSession, recognition = {};
const el = id => document.getElementById(id)
let list = document.createElement('div')
const synth = window.speechSynthesis;
let voices = synth.getVoices()
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        voices = synth.getVoices()
    };
}

let suggestions = ["what's the time", "go to facebook.com", "what is my ip address", "open youtube", "how is the weather outside"]
let printS = () => {
    list.innerHTML = 'try saying "' + suggestions[sInd] + '"'
    if (sInd < suggestions.length - 1) {
        sInd++
    } else { sInd = 0 }
}
let suggest = setInterval(printS, 1500);

let speakOut = (txt) => {
    try {
        synth.cancel()
        let speech = new SpeechSynthesisUtterance(txt);
        speech.voice = voices[parseInt(index) || 0];
        speech.pitch = parseFloat(pitch) || 1;
        speech.rate = parseFloat(rate) || 1;
        synth.speak(speech);
    } catch (err) { alert(err.message || "Something went wrong") }
}

let SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRec) {
    el("session").remove()
    el("t-or").innerText = ""
    el("status").innerHTML = ("<b>Browser does not support Speech API.<b>");
} else {
    recognition = new SpeechRec();
}
recognition.lang = "en-IN";
recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = function () {
    el("status").innerHTML = "Listening..."
};
recognition.onspeechend = function () {
    el("status").innerHTML = ""
}

recognition.onresult = async function (e) {
    const last = e.results.length - 1
    const input = e.results[last]
    const transcript = input[0].transcript;
    const confidence = input[0].confidence;

    if (input.isFinal && (confidence > 0.75)) {
        el("status").innerHTML = "Processing..."
        el("inputBox").innerHTML = "<= " + transcript
        let result = await process(transcript)
        el("outputBox").innerHTML = "=> " + result
        el("sugg").appendChild(list)
        speakOut(result)
        el("status").innerHTML = ""
    } else {
        el("status").innerHTML = "Say that again please."
        speakOut("Say that again please.")
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

el("command").addEventListener('change', async (e) => {
    let command = el('command').value
    el("status").innerHTML = "Processing..."
    el("inputBox").innerHTML = "<= " + command
    let result = await process(command)
    el("outputBox").innerHTML = "=> " + result
    el("sugg").appendChild(list)
    speakOut(result)
    el("status").innerHTML = ""
    el('command').value = ""
})

const process = async (txt) => {
    try {
        while (voices.length === 0) { voices = synth.getVoices() }
        query = txt.toLowerCase().replace(/\s/g, "");

        if (query.length === 0) { return "" }
        else if (query.startsWith("hi") || query.startsWith("hello")) {
            return "Hi Dear!"
        }
        else if (query.startsWith("say")) {
            return txt.slice(3, txt.length).trim()
        }

        else if (query.startsWith("lang")) {
            if (query.length === 4) {
                return recognition.lang
            } else {
                recognition.lang = txt.slice(4, txt.length)
                return "Input language changed"
            }
        }
        else if (query.startsWith("grammar")) {
            if (query.length === 7) {
                return JSON.stringify(recognition.grammars)
            } else {
                const grammarlist = new webkitSpeechGrammarList()
                grammarlist.addFromString(txt.slice(10, txt.length), parseFloat(txt.slice(7, 10)))
                recognition.grammars = grammarlist
                return "Input grammar updated"
            }
        }

        else if (query.includes("yourvoices")) {
            if (voiceList === "") {
                for (let index = 0; index < voices.length; index++) {
                    const _lang = voices[index].lang;
                    const _name = voices[index].name;
                    voiceList += `${index} || ${_name} || ${_lang}<br>`
                }
            }
            clearInterval(suggest)
            list.innerHTML = voiceList
            return "Here is a list of available voice samples"
        }
        else if (query.includes("index")) {
            index = parseInt(query.replace("index", ""))
            return "Voice index changed"
        }
        else if (query.includes("pitch")) {
            pitch = parseFloat(query.replace("pitch", ""))
            return "Voice pitch changed"
        }
        else if (query.includes("rate")) {
            rate = parseFloat(query.replace("rate", ""))
            return "Voice rate changed"
        }

        else if (query.includes("date")) {
            return `The date is ${new Date().toLocaleDateString()}`
        }
        else if (query.includes("time")) {
            return `The time is ${new Date().toLocaleTimeString()}`
        }

        else if (query.startsWith("goto")) {
            let site = query.replace("goto", "")
            open(`http://${site}`, "_blank")
            return `opened ${site} in new tab.`
        }
        else if (query.startsWith("open")) {
            let site = query.replace("open", "")
            open(`http://${site}.com`, "_blank")
            return `opened ${site} in new tab.`
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
            return `your ip address is ${ipRec[0]}`
        }
        else if (query.includes("mylocation") || query.includes("whereiam")) {
            clearInterval(suggest)
            locAdd = x => {
                locationRec.push(x)
                list.innerHTML = `timestamp: ${x.timestamp}<br>latitude: ${x.coords.latitude}<br>longitude: ${x.coords.longitude}<br>accuracy: ${x.coords.accuracy}<br><a class="n-btn" target="_blank" href="https://www.google.com/maps/@${x.coords.latitude},${x.coords.longitude}">on google maps</a><br>`
            }
            getCurrentLocation()
            return "here are your location coordinates"
        }
        else if (query.includes("weather")) {
            clearInterval(suggest)
            let uri = '?ddtj[yy4tqvKJ4d?J=4tqv5wYyBEy5h==JTdv~jwT;`Jg38k  E8f 56f^<<^<6fk^F_kEk8kSF_r234hdw[qtr04T>3JT'
            const pass_key = prompt("password").split("$")
            uri = dec(uri, pass_key[0], parseInt(pass_key[1]))
            if (uri.startsWith("http")) {
                const res = await fetch(uri)
                const x = await res.json()
                list.innerHTML = `latitude: ${x.location.lat}, longitude: ${x.location.lon}<br>location: ${x.location.name}<br>cloud: ${x.current.cloud}, humidity: ${x.current.humidity}<br>temperature: ${x.current.temp_c}, feels like: ${x.current.feelslike_c}<br>wind kph: ${x.current.wind_kph}, wind direction: ${x.current.wind_dir}<br>condition: ${x.current.condition.text}<br>`
                return `it's ${x.current.condition.text} outside now.`
            } else {
                return `incorrect password`
            }
        }

        else if (recognition.lang !== "en-IN") {
            return txt
        }
        else {
            open(`http://google.com/search?q=${txt}`, "_blank")
            return `found something about ${txt}.`
        }
    } catch (err) { return err.message || "Something went wrong" }
}