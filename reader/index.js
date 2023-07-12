const el = id => document.getElementById(id)
let text = ""
const cb = () => {
    const files = el("file").files
    for (const file of files) {
        rcz(file)
    }
}
const rcz = (img) => {
    Tesseract.recognize(img, "eng+hin")
        .then((res) => {
            el("res").innerHTML += `confidence: ${res.data.confidence},
            blocks: ${res.data.blocks.length},
            paragraphs: ${res.data.paragraphs.length}<br>
            lines: ${res.data.lines.length},
            words: ${res.data.words.length},
            symbols: ${res.data.symbols.length}<br>
            text: ${res.data.text}<br><br>`
            text += res.data.text + "\n"
        })
        .catch((err) => {
            el("res").innerHTML += err.message || "something went wrong"
            console.log(err);
        })
}
el("read").addEventListener("click", cb)
el("cp").addEventListener("click", () => {
    navigator.clipboard.writeText(text)
})
el("clr").addEventListener("click", () => {
    text = ""
    el("res").innerHTML = ""
})