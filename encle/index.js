let DBcol, filesUploaded = 0;
const { BSON: { ObjectId } } = Realm;
const el = id => document.getElementById(id)
const app = new Realm.App({ id: "application-0-qflmj" });
const updateUI = () => el("numFiles").innerText = "files in db: " + filesUploaded

const logout = async () => {
    el('logout').disabled = true
    await app.currentUser.logOut();
    DBcol = false
    filesUploaded = 0
    el("logoutBtn").style.display = "none"
    el("searchBox").style.display = "none"
    el("loginInput").style.display = "block"
    el("numFiles").innerText = "";
    el("fileList").innerHTML = "";
    el('login').disabled = false
}

const loginFinish = async () => {
    DBcol = app.currentUser.mongoClient("mongodb-atlas").db("encle").collection("encle_client")
    el("loginInput").style.display = "none"
    el("logoutBtn").style.display = "block"
    el("searchBox").style.display = "block"
    const filesInDb = await DBcol.count({ owner_id: app.currentUser.id });
    filesUploaded += filesInDb;
    updateUI()
    loadFiles()
}

const apikeyLogin = async (apiKey) => {
    try {
        const credentials = Realm.Credentials.apiKey(apiKey);
        const user = await app.logIn(credentials);
        user.id === app.currentUser.id && loginFinish()
    } catch (err) {
        alert(err.message || "Failed to log in")
        el('login').disabled = false
    }
}
const customLogin = async (id, pwd) => {
    try {
        const credentials = Realm.Credentials.function({ id, pwd });
        const user = await app.logIn(credentials);
        user.id === app.currentUser.id && loginFinish()
    } catch (err) {
        alert(err.message || "Failed to log in")
        el('login').disabled = false
    }
}

const loadFiles = async (match = {}, fields = { data: 0 }, limit = 5, sort = { _id: -1 }) => {
    try {
        fields.owner_id = 0
        match.owner_id = app.currentUser.id
        if (match._id) { match._id = new ObjectId(match._id) }
        const files = await DBcol.aggregate([{ $match: match }, { $sort: sort }, { $limit: limit }, { $project: fields }])
        if (fields.data === 0) {
            el("fileList").innerHTML = "";
            files.forEach(file => {
                let _div = document.createElement("div")
                _div.innerHTML += `<div class="block">${file.date}<br><b>${file.name}</b></div>`
                    + '<div class="media-block">'
                    + `<input class="p5 input border" type="password" id="p-${file._id}" placeholder="pass">`
                    + `<input class="p5 input border" type="number" id="k-${file._id}" placeholder="key">`
                    + '</div>'
                    + `<button class="pointer border m10" id="s-${file._id}" onclick="loadFiles({_id: '${file._id}'}, {_id: 0, date: 0})">download</button>`
                    + `<button class="pointer border m10" id="d-${file._id}" onclick="deleteFile('${file._id}')">delete</button>`
                _div.classList.add("block", "m10")
                el("fileList").append(_div)
            });
        } else {
            let _file = files[0]
            let _data = dec(_file.data, el("p-" + match._id).value, parseInt(el("k-" + match._id).value))
            if (typeof _data === "object") { return alert(_data.error || "Something went wrong"); }
            if (!_data.startsWith("data:")) { return alert("incorrect password"); }
            saveFile(_file.name, _data)
        }
    } catch (err) { alert(err.message || "Something went wrong") }
}

saveDbItem = async (filename, filedata) => {
    try {
        if (!DBcol) { return alert("Please log in to database") }
        const result = await DBcol.insertOne({ date: new Date().toDateString(), name: filename, data: filedata, owner_id: app.currentUser.id });
        filesUploaded += 1
        updateUI()
    } catch (err) { alert(err.message || "could not save to database") }
}

const searchFile = () => {
    if (el('searchInput').value !== "") {
        loadFiles({ $text: { $search: el("searchInput").value } }, { data: 0 }, 20, { $text: { $meta: "textScore" } })
        return el("searchInput").value = ""
    }
}

const deleteFile = async (id) => {
    try {
        let conf = confirm("Delete permanantly?")
        if (!conf) { return }
        const res = await DBcol.deleteOne({ _id: new ObjectId(id) })
        el(`s-${id}`).disabled = true
        el(`d-${id}`).disabled = true
        filesUploaded -= 1
        updateUI()
    } catch (err) { alert(err.message || "Something went wrong") }
}

el("logout").addEventListener('click', logout)
el("login").addEventListener('click', () => {
    el('login').disabled = true
    el("tokenInput").style.display === "none" ?
        customLogin(el("username").value, el("password").value) :
        apikeyLogin(el("token").value)
})
el("switchLogin").addEventListener('click', () => {
    if (el("tokenInput").style.display === "none") {
        el("tokenInput").style.display = "inline"
        el("credsInput").style.display = "none"
        el("switchLogin").innerText = "Login with username / password"
    }
    else {
        el("tokenInput").style.display = "none"
        el("credsInput").style.display = "inline"
        el("switchLogin").innerText = "Login with api key"
    }
})
el("btnEnc").addEventListener('click', () => {
    saveDB = el("db").checked
    saveLocal = el("local").checked
    encAllFiles(el("file").files, el("pass").value, parseInt(el("key").value))
})
el("btnDec").addEventListener('click', () => {
    saveDB = el("db").checked
    saveLocal = el("local").checked
    decAllFiles(el("file").files, el("pass").value, parseInt(el("key").value))
})
el("searchBtn").addEventListener('click', searchFile)
el("searchInput").addEventListener('change', searchFile)

app.currentUser && loginFinish()