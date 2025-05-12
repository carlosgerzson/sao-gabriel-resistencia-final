const telaInicial = document.getElementById('tela-inicial');
const btnContinuarInicial = document.getElementById('btn-continuar-inicial');
const telaIntroducao1 = document.getElementById('tela-introducao1');
const btnContinuarIntroducao1 = document.getElementById('btn-continuar-introducao1');
const telaIntroducao2 = document.getElementById('tela-introducao2');
const btnContinuarIntroducao2 = document.getElementById('btn-continuar-introducao2');
const mapaFases = document.getElementById('mapa-fases');
const gameContainer = document.getElementById('game-container');
const gameElement = document.getElementById('game');
const briefingsContainer = document.getElementById('briefings');

function mostrarTela(idTela) {
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.classList.add('ativa');
        tela.style.display = 'flex';
    }
}

function esconderTela(idTela) {
    const tela = document.getElementById(idTela);
    if (tela) {
        tela.classList.remove('ativa');
        tela.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    esconderTela('mapa-fases');
    esconderTela('briefings');
    esconderTela('game');

    const urlParams = new URLSearchParams(window.location.search);
    const fromGame = urlParams.get('fromGame');

    if (fromGame === 'true') {
        mostrarTela('mapa-fases');
    } else {
        mostrarTela('tela-inicial');
    }

    if (btnContinuarInicial) {
        btnContinuarInicial.addEventListener('click', () => {
            esconderTela('tela-inicial');
            mostrarTela('tela-introducao1');
        });
    }

    if (btnContinuarIntroducao1) {
        btnContinuarIntroducao1.addEventListener('click', () => {
            esconderTela('tela-introducao1');
            mostrarTela('tela-introducao2');
        });
    }

    if (btnContinuarIntroducao2) {
        btnContinuarIntroducao2.addEventListener('click', () => {
            esconderTela('tela-introducao2');
            mostrarTela('mapa-fases');
        });
    }

    const botoesAlvo = document.querySelectorAll('.nivel-btn');
    botoesAlvo.forEach(botao => {
        botao.addEventListener('click', function() {
            const nivelSelecionado = this.dataset.nivel;
            esconderTela('mapa-fases');
            mostrarTela('briefings');

            if (briefingsContainer) {
                const todosBriefings = briefingsContainer.querySelectorAll('.tela-briefing');
                todosBriefings.forEach(briefing => briefing.style.display = 'none');

                const briefingVisivel = document.getElementById(`alvo${nivelSelecionado}_briefing`);
                if (briefingVisivel) {
                    briefingVisivel.style.display = 'block';

                    let btnJogar = document.getElementById('btn-jogar-briefing');
                    if (!btnJogar) {
                        btnJogar = document.createElement('button');
                        btnJogar.id = 'btn-jogar-briefing';
                        btnJogar.textContent = 'Jogar';
                        briefingsContainer.appendChild(btnJogar);
                    } else {
                        btnJogar.style.display = 'block';
                    }

                    btnJogar.onclick = () => {
                        esconderTela('briefings');
                        if (gameContainer) {
                            gameContainer.style.display = 'block';
                        }
                        if (gameElement) {
                            gameElement.style.display = 'block';
                        }
                        // A CHAMADA PARA iniciarJogo() DEVE FICAR AQUI, APÓS O CLIQUE NO JOGAR
                        iniciarJogo(nivelSelecionado);
                        // Passar o nível selecionado para iniciarJogo
                        // iniciarJogo(nivelSelecionado);
                    };
                } else {
                    console.error(`Briefing para o nível ${nivelSelecionado} não encontrado.`);
                }
            }
        });
    });
});

// REMOVA qualquer chamada para iniciarJogo() que possa estar fora deste escopo
// no seu navegacao.js ou em qualquer outro lugar que não seja o clique do "Jogar"