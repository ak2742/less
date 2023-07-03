const params = new URLSearchParams(window.location.search);

document.getElementById('container').style.backgroundColor = params.get('0')
document.getElementById('container').style.color = params.get('1')
document.getElementById('btn').style.backgroundColor = params.get('2')

let join = _link => window.open(_link, "_blank")