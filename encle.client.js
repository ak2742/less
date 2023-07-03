const DBuri = "https://data.mongodb-api.com/app/data-dchft/endpoint/data/v1/action/insertOne"
const myExt = ".encle"
let saveLocal = true
let saveDB = true
let DBtoken = ""
let str0 = 'qt7Q8WECV5BRTYyuas2df!@#O6P$%o^&*()gh4jk lzxcv_+{}wer:"' + "|>?<~`-bnm0\n9UILKJ=[]\\';./,HGFDSAipZXN3M1"

const shuffle = (pass, key) => {
    let _chars = ""
    let _str = str0
    for (let i = 0; i < pass.length; i++) {
        const x = pass[i];
        if (_str.indexOf(x) !== -1) {
            _chars = _chars.concat(x)
            _str = _str.replace(x, "")
        }
    }
    _str = Math.abs(key % 2) === 0 ? _chars.concat(_str) : _str.concat(_chars)
    return _str
}

const enc = (data, pass = "pass", key) => {
    if (!data || typeof data !== "string") { return { error: "invalid data" } }
    if (!pass || typeof pass !== "string" || 0 >= pass.length >= str0.length) { return { error: "invalid pass" } }
    if (!key || typeof key !== "number" || key === 0 || key >= str0.length) { key = pass.length }
    let oldStr = shuffle(pass, key)
    let newStr = oldStr.slice(-key, -1) + oldStr.charAt(oldStr.length - 1) + oldStr.slice(0, -key)
    let encrypt = ""
    for (let i = 0; i < data.length; i++) {
        encrypt = encrypt.concat(newStr.charAt(oldStr.indexOf(data[i])))
    }
    return encrypt
}
const dec = (data, pass = "pass", key) => {
    if (!data || typeof data !== "string") { return { error: "invalid data" } }
    if (!pass || typeof pass !== "string" || 0 >= pass.length >= str0.length) { return { error: "invalid pass" } }
    if (!key || typeof key !== "number" || key === 0 || key >= str0.length) { key = pass.length }
    let oldStr = shuffle(pass, key)
    let newStr = oldStr.slice(-key, -1) + oldStr.charAt(oldStr.length - 1) + oldStr.slice(0, -key)
    let decrypt = ""
    for (let i = 0; i < data.length; i++) {
        decrypt = decrypt.concat(oldStr.charAt(newStr.indexOf(data[i])))
    }
    return decrypt
}

const saveDbItem = (filename, filedata) => {
    if (DBtoken === "") {
        return alert("please enter a token")
    }
    const cb = (obj) => {
        console.log(obj);
        alert(obj.message || JSON.stringify(obj))
    }
    fetch(DBuri, {
        method: "POST",
        headers: {
            "api-key": DBtoken,
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*"
        },
        body: JSON.stringify({
            dataSource: "cluster1",
            database: "encle",
            collection: "client_encles",
            document: {
                date: new Date(),
                name: filename,
                data: filedata
            }
        })
    })
        .then(res => res.json())
        .then(res => cb(res))
        .catch(err => cb(err))
}
const saveFile = (filename, filedataurl) => {
    let dl = document.createElement('a')
    dl.href = filedataurl
    dl.download = filename
    dl.click()
}

const encFile = (file, pass, key) => {
    let reader = new FileReader();
    reader.onloadend = () => {
        let filedata = reader.result
        let newdata = enc(filedata, pass, key)
        if (typeof newdata === "object") {
            return alert(newdata.error || "an error occured");
        }
        saveDB && saveDbItem(file.name + myExt, newdata)
        saveLocal && saveFile(file.name + myExt, URL.createObjectURL(new Blob([newdata], { type: "text/plain" })))
    }
    reader.readAsDataURL(file)
}
const decFile = (file, pass, key) => {
    let reader = new FileReader();
    reader.onloadend = () => {
        let filedata = reader.result
        let newdata = dec(filedata, pass, key)
        if (typeof newdata === "object") {
            return alert(newdata.error || "an error occured");
        }
        saveDB && saveDbItem(file.name, filedata)
        saveLocal && saveFile(file.name.split(myExt)[0], newdata)
    }
    reader.readAsText(file)
}

const encAllFiles = (fileList, pass, key) => {
    for (const file of fileList) {
        encFile(file, pass, key);
    }
}
const decAllFiles = (fileList, pass, key) => {
    for (const file of fileList) {
        decFile(file, pass, key);
    }
}