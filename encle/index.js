const el = id => document.getElementById(id)

el("btnEnc").addEventListener('click', () => {
    DBtoken = el("token").value
    saveDB = el("db").checked
    saveLocal = el("local").checked
    encAllFiles(el("file").files, el("pass").value, parseInt(el("key").value))
})
el("btnDec").addEventListener('click', () => {
    DBtoken = el("token").value
    saveDB = el("db").checked
    saveLocal = el("local").checked
    decAllFiles(el("file").files, el("pass").value, parseInt(el("key").value))
})
