const el = id => document.getElementById(id)

const myId = prompt("Enter your peer ID(leave empty to get a random id)")
const peer = new Peer(myId);
peer.on('open', function (id) {
    el("myId").innerText = id
    el("newCallBtn").disabled = false
    el("newChatBtn").disabled = false
});
peer.on('call', function (call) {
    if (el("auto").checked) {
        answerCall(call)
    } else {
        let a = confirm(call.peer + " is calling you. would you like to answer?")
        a && answerCall(call)
    }
});
peer.on('connection', function (conn) {
    if (el("auto").checked) {
        startChat(conn)
    } else {
        let a = confirm(conn.peer + " is requesting chat. would you like to connect?")
        a && startChat(conn)
    }
});

const showCallerId = (id) => {
    el("callConnId").innerText = id
}
const showChatPeerId = (id) => {
    el("chatConnId").innerText = id
}

const listMessage = (msg, from) => {
    let p = document.createElement('div')
    let c = document.createElement('div')
    c.classList.add('msg')
    c.append(msg)
    p.append(from, ": ", c)
    el("msgs").append(p)
}
const listFile = (file, from) => {
    let p = document.createElement('div')
    let c = document.createElement('div')
    let m = document.createElement('button')
    m.addEventListener("click", () => {
        let dl = document.createElement('a')
        dl.href = file.uri
        dl.download = file.name
        dl.click()
        dl.remove()
    })
    m.classList.add('pointer', 'border')
    c.classList.add('msg')
    m.append("save")
    c.append("file: " + file.name)
    p.append(from, ": ", c, m)
    el("msgs").append(p)
}

const showMyStream = (stream) => {
    el("myStream").srcObject = stream;
    el("myStream").onloadedmetadata = (e) => {
        el("myStream").play();
    };
}
const showOthStream = (stream) => {
    el("gotStream").srcObject = stream;
    el("gotStream").onloadedmetadata = (e) => {
        el("gotStream").play();
    };
}

const getMedia = async (cb) => {
    try {
        if (!navigator.mediaDevices?.getUserMedia) { return alert("media recorder IS NOT available") }
        let stream = await navigator.mediaDevices.getUserMedia({ video: el("videoPref").checked, audio: el("audioPref").checked })
        cb(stream);
    } catch (err) { alert(err.message || "Something went wrong"); }
}

const encData = (data) => {
    if (el("enc")?.checked === false) { return data }
    if (typeof data === "object") { return data }
    return enc(data, el("pass").value, parseInt(el("key").value))
}
const decData = (data) => {
    if (el("enc")?.checked === false) { return data }
    if (typeof data === "object") { return data }
    return dec(data, el("pass").value, parseInt(el("key").value))
}

const randomId = () => {
    const a = "abcdefghijklmnopqrstuvwxyz0123456789"
    let id = ""
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            id = id.concat("-")
            continue
        }
        id = id.concat(a[Math.floor(Math.random() * a.length)])
    }
    return id
}

const makeACall = () => {
    if (!el("videoPref").checked && !el("audioPref").checked) {
        return alert("At least one of audio and video must be checked")
    }
    let id = el("remote-id-call").value
    if (el("random-id").checked) {
        el("remote-id-call").value = ""
        id = randomId()
    }
    const cb = (stream) => {
        showMyStream(stream)
        call = peer.call(id, encData(stream));
        console.log("calling " + id);
        call.on('stream', (remoteStream) => {
            showOthStream(decData(remoteStream))
            showCallerId(call.peer)
        })
        el("newCallBtn").innerText = "new call"
    }
    getMedia(cb)
}
const answerCall = (call) => {
    if (!el("videoPref").checked && !el("audioPref").checked) {
        return alert("At least one of audio and video must be checked")
    }
    const cb = (stream) => {
        showMyStream(stream)
        call.answer(encData(stream));
        call.on('stream', (remoteStream) => {
            showOthStream(decData(remoteStream))
            showCallerId(call.peer)
        })
        el("newCallBtn").innerText = "new call"
    }
    getMedia(cb)
}

const connectChat = () => {
    let id = el("remote-id-chat").value
    if (el("random-id").checked) {
        el("remote-id-chat").value = ""
        id = randomId()
    }
    const conn = peer.connect(id)
    startChat(conn)
}
const startChat = (conn) => {
    showChatPeerId(conn.peer)
    const cbMsg = () => {
        let msg = el("msgInput").value
        if (msg === "") { return }
        conn.send(encData(msg));
        listMessage(msg, "me")
        el("msgInput").value = ""
        el("msgs").scrollTo({ top: el("msgs").scrollHeight, behaviour: "smooth" })
    }
    const cbFile = () => {
        let file = el("fileInput").files[0]
        if (!file) { return }
        let reader = new FileReader();
        reader.onloadend = () => {
            let fileData = { uri: reader.result, name: file.name };
            conn.send({ uri: encData(fileData.uri), name: encData(fileData.name) });
            listFile(fileData, "me")
            el("msgs").scrollTo({ top: el("msgs").scrollHeight, behaviour: "smooth" })
        }
        reader.onerror = () => alert(reader.error?.message)
        reader.readAsDataURL(file)
    }
    el("sendMsgBtn").addEventListener('click', cbMsg)
    el("msgInput").addEventListener('change', cbMsg)
    el("sendFileBtn").addEventListener('click', cbFile)

    el("sendMsgBtn").disabled = false
    el("sendFileBtn").disabled = false

    conn.on('data', function (msg) {
        if (msg.uri) {
            listFile({ uri: decData(msg.uri), name: decData(msg.name) }, conn.peer)
        } else {
            listMessage(decData(msg), conn.peer)
        }
        el("msgs").scrollTo({ top: el("msgs").scrollHeight, behaviour: "smooth" })
    });
}

el("newCallBtn").addEventListener('click', makeACall)
el("newChatBtn").addEventListener('click', connectChat)
el("enc").addEventListener("change", () => {
    el("encInputs").style.display = el("enc").checked ? "inline" : "none"
})
el("random-id").addEventListener("change", () => {
    el("remote-id-call").style.display = el("random-id").checked ? "none" : "inline"
    el("remote-id-chat").style.display = el("random-id").checked ? "none" : "inline"
})