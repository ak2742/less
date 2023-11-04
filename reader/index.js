const el = id => document.getElementById(id)
let lang = "eng+hin"
let text = ""
const cb = () => {
    const files = el("file").files
    for (const file of files) {
        rcz(file)
    }
}
const rcz = (img) => {
    el("read").disabled = true
    el("read").innerText = "processing"
    Tesseract.recognize(img, lang)
        .then((res) => {
            el("res").innerHTML += `<strong>confidence: ${res.data.confidence},
        blocks: ${res.data.blocks.length},
        paragraphs: ${res.data.paragraphs.length}<br>
        lines: ${res.data.lines.length},
        words: ${res.data.words.length},
        symbols: ${res.data.symbols.length}<br>
        text: </strong>${res.data.text}<br><br>`
            text += res.data.text + "\n"
            el("cp").style.display = "inline-block"
            el("clr").style.display = "inline-block"
            el("read").innerText = "read images"
            el("read").disabled = false
        })
        .catch((err) => {
            el("res").innerHTML += err.message || "Something went wrong"
            el("read").innerText = "read images"
            el("read").disabled = false
        })
}
el("read").addEventListener("click", cb)
el("cp").addEventListener("click", () => navigator.clipboard.writeText(text))
el("clr").addEventListener("click", () => {
    text = ""
    el("res").innerHTML = ""
    el("cp").style.display = "none"
    el("clr").style.display = "none"
})
el("cp").style.display = "none"
el("clr").style.display = "none"