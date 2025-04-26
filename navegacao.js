const telaInicial = document.getElementById('tela-inicial');
const btnContinuarInicial = document.getElementById('btn-continuar-inicial');
const telaIntroducao1 = document.getElementById('tela-introducao1');
const btnContinuarIntroducao1 = document.getElementById('btn-continuar-introducao1');
const telaIntroducao2 = document.getElementById('tela-introducao2');
const btnContinuarIntroducao2 = document.getElementById('btn-continuar-introducao2');
const mapaFases = document.getElementById('mapa-fases');

function mostrarTela(idTela) {
    console.log("Executando mostrarTela com ID:", idTela);
    console.log("Document:", document); // Verifique se 'document' é realmente o objeto document
    const telas = document.querySelectorAll('.tela'); // Linha 10
    console.log("Telas encontradas:", telas);
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

        const telaInicial = document.getElementById('tela-inicial');
        const mapaFases = document.getElementById('mapa-fases');

       // Move as declarações para dentro do DOMContentLoaded
        const briefingsContainer = document.getElementById('briefings');
        const todosBriefings = briefingsContainer ? briefingsContainer.querySelectorAll('.tela-briefing') : [];

       
        // Verifica o parâmetro da URL e decide qual tela mostrar
        const urlParams = new URLSearchParams(window.location.search);
        const fromGame = urlParams.get('fromGame');

        if (fromGame === 'true') {
            mostrarTela('mapa-fases');
        } else {
            mostrarTela('tela-inicial');
        }
    
    esconderTela('briefings'); // Garante que os briefings estejam escondidos inicialmente

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
            mostrarTela('mapa-fases'); // Exibe o mapa de fases após a intro 2
        });
    }

    // Adiciona event listeners aos botões do mapa de fases (nível)
    const botoesAlvo = document.querySelectorAll('.nivel-btn'); // Move para dentro do DOMContentLoaded também por segurança
    botoesAlvo.forEach(botao => {
        botao.addEventListener('click', function() {
            const nivelSelecionado = this.dataset.nivel;
            console.log(`Nível selecionado: ${nivelSelecionado}`);
            esconderTela('mapa-fases'); // Esconde o mapa de fases AO CLICAR no nível
            mostrarTela('briefings'); // Mostra a tela de briefings

            // Esconde todos os briefings
            if (briefingsContainer) {
                const todosBriefings = briefingsContainer.querySelectorAll('.tela-briefing'); // Garante que seja acessado após o DOM
                todosBriefings.forEach(briefing => briefing.style.display = 'none');

                // Exibe o briefing correto
                const briefingVisivel = document.getElementById(`alvo${nivelSelecionado}_briefing`);
                if (briefingVisivel) {
                    briefingVisivel.style.display = 'block';

                    // Cria um botão "Jogar" dinamicamente (se não existir)
                    let btnJogar = document.getElementById('btn-jogar-briefing');
                    if (!btnJogar) {
                        btnJogar = document.createElement('button');
                        btnJogar.id = 'btn-jogar-briefing';
                        btnJogar.textContent = 'Jogar';
                        briefingsContainer.appendChild(btnJogar);
                    } else {
                        btnJogar.style.display = 'block'; // Garante que esteja visível
                    }

                    // Define o evento de clique do botão "Jogar" para ir para o jogo
                    btnJogar.onclick = () => {
                        window.location.href = `jogo.html?nivel=${nivelSelecionado}`;
                    };
                } else {
                    console.error(`Briefing para o nível ${nivelSelecionado} não encontrado.`);
                    // Adicionar lógica para ir direto ao jogo se o briefing não existir?
                }
            }
        });
    });
});