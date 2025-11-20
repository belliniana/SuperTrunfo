let monteJogador = [];
let monteMaquina = [];
let cartaJogador = null;
let cartaMaquina = null;
let jogoPausado = false;

const placarJogadorEl = document.getElementById('placar-jogador');
const placarMaquinaEl = document.getElementById('placar-maquina');
const cartaJogadorEl = document.getElementById('carta-jogador');
const cartaMaquinaEl = document.getElementById('carta-maquina');
const resultadoEl = document.getElementById('resultado');

const btnJogar = document.getElementById('btn-jogar');
const btnPausar = document.getElementById('btn-pausar');
const btnProxima = document.getElementById('btn-proxima-rodada');
const btnReiniciar = document.getElementById('btn-reiniciar');

const pauseOverlay = document.getElementById('pause-overlay');
const soundWin = document.getElementById('sound-win');
const soundLose = document.getElementById('sound-lose');

const btnComo = document.getElementById('btn-como-jogar');
const infoBox = document.getElementById('como-jogar');
const btnFecharInfo = document.getElementById('btn-fechar-info');

function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5) }

function updatePlacar() {
    placarJogadorEl.textContent = `Jogador: ${monteJogador.length}`;
    placarMaquinaEl.textContent = `Máquina: ${monteMaquina.length}`;
}

function renderCarta(element, cartaObj, revelar = false, ehJogador = false) {
    element.classList.remove('verso');
    element.classList.add('revealed');
    element.innerHTML = '';
    const nome = document.createElement('div'); nome.className = 'carta-nome'; nome.textContent = cartaObj.nome;
    const img = document.createElement('img'); img.className = 'carta-imagem'; img.src = cartaObj.imagem; img.alt = cartaObj.nome;
    const attrs = document.createElement('div'); attrs.className = 'carta-atributos';
    const ul = document.createElement('ul');

    for (const key in cartaObj.atributos) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${cartaObj.atributos[key]}`;
        if (ehJogador && !jogoPausado) {
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => comparar(key), { once: true });
        }
        ul.appendChild(li);
    }
    attrs.appendChild(ul);
    element.appendChild(nome);
    element.appendChild(img);
    element.appendChild(attrs);
}

function setVerso(element) {
    element.classList.remove('revealed');
    element.classList.add('verso');
    element.innerHTML = '';
}


function iniciarJogo() {
    const deck = shuffle(baralho);
    const metade = Math.ceil(deck.length / 2);
    monteJogador = deck.slice(0, metade);
    monteMaquina = deck.slice(metade);
    resultadoEl.textContent = '';
    btnJogar.disabled = true;
    btnPausar.disabled = false;
    btnProxima.disabled = true;
    jogoPausado = false;
    pauseOverlay.classList.add('hidden');
    setVerso(cartaJogadorEl);
    setVerso(cartaMaquinaEl);
    updatePlacar();
    sortearCartas();
}

function togglePause() {
    jogoPausado = !jogoPausado;
    if (jogoPausado) {
        pauseOverlay.classList.remove('hidden');
        btnPausar.textContent = 'Retomar';
    } else {
        pauseOverlay.classList.add('hidden');
        btnPausar.textContent = 'Pausar';
    }
}

function sortearCartas() {
    if (jogoPausado) return;
    if (monteJogador.length === 0 || monteMaquina.length === 0) {
        fimDeJogo(); return;
    }

    cartaJogador = monteJogador[0];
    cartaMaquina = monteMaquina[0];

    renderCarta(cartaJogadorEl, cartaJogador, true, true);
    setVerso(cartaMaquinaEl); // mantém a máquina oculta até comparar
    resultadoEl.textContent = 'Escolha um atributo na sua carta.';
    btnProxima.disabled = true;
    updatePlacar();
}

function comparar(atributo) {
    if (jogoPausado) return;
    renderCarta(cartaMaquinaEl, cartaMaquina, true, false);

    const vJog = cartaJogador.atributos[atributo];
    const vMaquina = cartaMaquina.atributos[atributo];

    btnProxima.disabled = true;

    setTimeout(() => {
        if (vJog > vMaquina) {
            resultadoEl.textContent = `Você venceu! ${vJog} > ${vMaquina}`;
            try { soundWin.currentTime = 0; soundWin.play(); } catch (e) { }
            monteJogador.push(monteMaquina.shift());
            monteJogador.push(monteJogador.shift());
        } else if (vMaquina > vJog) {
            resultadoEl.textContent = `Você perdeu! ${vJog} < ${vMaquina}`;
            try { soundLose.currentTime = 0; soundLose.play(); } catch (e) { }
            monteMaquina.push(monteJogador.shift());
            monteMaquina.push(monteMaquina.shift());
        } else {
            resultadoEl.textContent = `Empate! ${vJog} = ${vMaquina}`;
            monteJogador.push(monteJogador.shift());
            monteMaquina.push(monteMaquina.shift());
        }

        updatePlacar();
        btnProxima.disabled = false;

        const lis = cartaJogadorEl.querySelectorAll('li');
        lis.forEach(li => li.replaceWith(li.cloneNode(true)));

        if (monteJogador.length === 0 || monteMaquina.length === 0) {
            fimDeJogo();
        }

    }, 700);
}

function fimDeJogo() {
    btnProxima.disabled = true;
    btnPausar.disabled = true;
    btnJogar.disabled = false;
    const vencedor = monteJogador.length > 0 ? 'Parabéns — você venceu o jogo!' : 'A máquina venceu. Tente novamente!';
    resultadoEl.textContent = `Fim de jogo! ${vencedor}`;
}

function reiniciar() {
    // reset UI
    btnJogar.disabled = false;
    btnPausar.disabled = true;
    btnProxima.disabled = true;
    setVerso(cartaJogadorEl);
    setVerso(cartaMaquinaEl);
    monteJogador = [];
    monteMaquina = [];
    cartaJogador = null;
    cartaMaquina = null;
    resultadoEl.textContent = '';
    updatePlacar();
    pauseOverlay.classList.add('hidden');
    jogoPausado = false;
}

btnComo.addEventListener('click', () => infoBox.classList.remove('hidden'));
btnFecharInfo.addEventListener('click', () => infoBox.classList.add('hidden'));

btnJogar.addEventListener('click', iniciarJogo);
btnPausar.addEventListener('click', togglePause);
btnProxima.addEventListener('click', () => {
    setVerso(cartaJogadorEl);
    setVerso(cartaMaquinaEl);
    sortearCartas();
});
btnReiniciar.addEventListener('click', reiniciar);

setVerso(cartaJogadorEl);
setVerso(cartaMaquinaEl);
updatePlacar();