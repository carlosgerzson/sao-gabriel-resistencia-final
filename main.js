console.log("Início do código JavaScript");

// Variáveis globais (let)
let danoAlvo = 0;
let nivelAtual = 1;
let estadoDanoAlvo1 = 0;
let tempoDecorridoNivel = 0;
let intervaloTempoNivel;
const DURACAO_NIVEL = 30; // 1 minuto e meio
let podeReceberDano = true;
const intervaloDano = 500;
const game = document.getElementById("game");
const alvo1Container = document.getElementById("alvo1-container");
const explosion = document.getElementById("explosion");
const groundYTop = 1525;
const groundYBottom = 1600;
const armyOrigins = {};
let missiles = [];
let missileIntervals = [];
let avancarParaProximoNivelTimeout;

// Outras variáveis globais
let pontuacao = 0;
let faseAtual = 1;

const armyData = {
    army_e: { missileWidth: 18, missileHeight: 252, missileOffsetX: 9, missileOffsetY: 126, missileSpeed: 7 },
    army_c: { missileWidth: 18, missileHeight: 196, missileOffsetX: 9, missileOffsetY: 98, missileSpeed: 6 },
    army_d: { missileWidth: 18, missileHeight: 230, missileOffsetX: 9, missileOffsetY: 115, missileSpeed: 8 }
};

let jogoAcabou = false;
let nextBombId = 0;
let activeBombs = [];

const alvos = [
    {
        id: "alvo1",
        containerId: "alvo1-container",
        health: 3,
        collisionBox: { x: 197, y: 1552, width: 507, height: 254 },
        predioElementId: "alvo1_predio",
        dano1ElementId: "alvo1_dano1",
        dano2ElementId: "alvo1_dano2",
        destruidoElementId: "alvo1_destruido",
        fundoElementId: "alvo1_fundo",
        isDestroyed: false
    },
    {
        id: "alvo2",
        containerId: "alvo2-container",
        health: 3,
        collisionBox: { x: 197, y: 1552, width: 507, height: 254 },
        predioElementId: "alvo2_predio",
        dano1ElementId: "alvo2_dano1",
        dano2ElementId: "alvo2_dano2",
        destruidoElementId: "alvo2_destruido",
        fundoElementId: "alvo2_fundo",
        isDestroyed: false
    },
    // ... para os outros alvos
];

// Variáveis globais para elementos da UI
let tempoElement;
let pausarContinuarBtn;
let salvarBtn;
let terminarPartidaBtn;
let alvo2PredioElement;
let alvo2Dano1Element;
let alvo2Dano2Element;
let alvo2DestruidoElement;
let alvo2FundoElement;
let alvo1PredioElement;
let alvo1Dano1Element;
let alvo1Dano2Element;
let alvo1DestruidoElement;
let alvo1FundoElement;

// Variável para armazenar o ID do intervalo de criação de bombas
let bombInterval;
let jogoIniciado = false; // Flag para controlar a inicialização do jogo

function iniciarJogo(nivelSelecionado) {
    if (!jogoIniciado) {
        console.log('Iniciando a lógica do jogo em main.js...');

        // Obtenha as referências aos elementos da UI **aqui** DENTRO da inicialização do jogo
        tempoElement = document.getElementById("tempo");
        pausarContinuarBtn = document.getElementById("pausar-continuar-btn");
        salvarBtn = document.getElementById("salvar-btn");
        terminarPartidaBtn = document.getElementById("terminar-partida-btn");
        alvo2PredioElement = document.getElementById("alvo2_predio");
        alvo2Dano1Element = document.getElementById("alvo2_dano1");
        alvo2Dano2Element = document.getElementById("alvo2_dano2");
        alvo2DestruidoElement = document.getElementById("alvo2_destruido");
        alvo2FundoElement = document.getElementById("alvo2_fundo");
        alvo1PredioElement = document.getElementById("alvo1_predio");
        alvo1Dano1Element = document.getElementById("alvo1_dano1");
        alvo1Dano2Element = document.getElementById("alvo1_dano2");
        alvo1DestruidoElement = document.getElementById("alvo1_destruido");
        alvo1FundoElement = document.getElementById("alvo1_fundo");

        if (pausarContinuarBtn) {
            pausarContinuarBtn.addEventListener("click", togglePause);
        } else {
            console.error("Botão 'pausar-continuar-btn' não encontrado.");
        }

        let nivelParaIniciar = nivelSelecionado;

        if (nivelParaIniciar) {
            console.log(`Nível selecionado: ${nivelParaIniciar}`);
            exibirAlvo(nivelParaIniciar);
            iniciarNivel(nivelParaIniciar);
            // ... outras inicializações baseadas no nível ...
        } else {
            console.error("Nenhum nível selecionado para iniciar o jogo.");
            return; // Impede a inicialização se o nível não for definido
        }

        const telaFimDeFase = document.getElementById("tela-fim-de-fase");
        const btnVoltarMapa = document.getElementById("btn-voltar-mapa");

        if (btnVoltarMapa) {
            btnVoltarMapa.addEventListener("click", () => {
                console.log("Voltando para o mapa de fases.");
                telaFimDeFase.style.display = "none";
                // Redireciona de volta para o index.html com parâmetro
                window.location.href = "index.html?fromGame=true";
            });
        }

        initializeArmy("army_e");
        initializeArmy("army_c");
        initializeArmy("army_d");
        game.addEventListener("mousedown", handleGameClick);
        setInterval(checkBombCollisions, 50);

        // Agora, adicione os event listeners dos botões da UI (já feito acima)

        if (salvarBtn) {
            salvarBtn.addEventListener("click", salvarJogo);
        }

        if (terminarPartidaBtn) {
            terminarPartidaBtn.addEventListener("click", terminarPartida);
        }

        jogoIniciado = true;
        console.log('Lógica de inicialização do jogo concluída em main.js');
    } else {
        console.log('Jogo já foi iniciado.');
    }
}

function atualizarTempo() {
    const minutos = Math.floor((DURACAO_NIVEL - tempoDecorridoNivel) / 60).toString().padStart(2, '0');
    const segundos = ((DURACAO_NIVEL - tempoDecorridoNivel) % 60).toString().padStart(2, '0');
    tempoElement.innerHTML = `<span class="math-inline">\{minutos\}\:</span>{segundos}`;
    tempoDecorridoNivel++;

    // Verifique se algum alvo foi destruído
    const algumAlvoDestruido = alvos.some(alvo => alvo.isDestroyed);

    if (algumAlvoDestruido) {
        clearInterval(intervaloTempoNivel);
        console.log("Partida terminada por falha (alvo destruído).");
        terminarPartida("falha"); // Chama a função para exibir a tela de falha
    } else if (tempoDecorridoNivel > DURACAO_NIVEL) {
        clearInterval(intervaloTempoNivel);
        console.log(`Tempo da fase esgotado!`);
        terminarPartida("sucesso"); // Chama a função para exibir a tela de sucesso
    }
}

let jogoPausado = false; // Variável para rastrear o estado de pausa

function togglePause() {
    jogoPausado = !jogoPausado;
    pausarContinuarBtn.textContent = jogoPausado ? "Continuar" : "Pausar";

    if (jogoPausado) {
        clearInterval(intervaloTempoNivel);
        clearInterval(bombInterval); // Limpa o intervalo de criação de bombas ao pausar
        activeBombs.forEach(bomb => {
            if (bomb.interval) {
                clearInterval(bomb.interval);
                bomb.interval = null; // Indica que o intervalo foi parado
            }
        });
        console.log("Jogo pausado.");
    } else {
        continuarJogoLogica();
    }
}

function pausarJogoLogica() {
    jogoPausado = true;
    pausarContinuarBtn.textContent = "Continuar";
    clearInterval(intervaloTempoNivel); // Pausa o temporizador do nível
    clearInterval(bombInterval); // Pausa a criação de novas bombas

    // Pausa o movimento das bombas ativas
    activeBombs.forEach(bomb => {
        if (bomb.interval) {
            clearInterval(bomb.interval);
        }
    });

    // Pausa o movimento dos mísseis (se houver lógica de intervalo para eles)
    missileIntervals.forEach(interval => clearInterval(interval));

    console.log("Jogo pausado.");
}

function continuarJogoLogica() {
    jogoPausado = false;
    pausarContinuarBtn.textContent = "Pausar";
    intervaloTempoNivel = setInterval(atualizarTempo, 1000);
    bombInterval = setInterval(createBomb, 3000); // Reinicia a criação de bombas

    activeBombs.forEach(bombObject => {
        if (bombObject.interval) {
            clearInterval(bombObject.interval); // Limpa o intervalo antigo (se existir)
            bombObject.interval = null; // Reseta a propriedade interval
        }
        moveBomb(bombObject.element, bombObject); // Chama moveBomb novamente para reiniciar o movimento e a colisão
    });
    console.log("Jogo continuado.");
}

function salvarJogo() {
    console.log("Função de salvar jogo!");
    // Implemente a lógica de salvar o estado do jogo aqui
}

function terminarPartida(resultado) {
    console.log("terminarPartida chamada com resultado:", resultado, "bombInterval:", bombInterval);
    clearInterval(bombInterval); // Para a criação de novas bombas

    // Interrompe o movimento das bombas existentes usando a lógica de pausa
    activeBombs.forEach(bomb => {
        clearInterval(bomb.interval); // Interrompe o intervalo de movimento de cada bomba
    });

    document.removeEventListener('click', handleGameClick);
    exibirTelaFimDeFase(resultado);
    // Lógica adicional de fim de partida, se necessário
}

function exibirTelaFimDeFase(resultado) {
    console.log("exibirTelaFimDeFase chamada com:", resultado)
    const telaFimDeFase = document.getElementById("tela-fim-de-fase");
    const mensagemFimDeFase = document.getElementById("mensagem-fim-de-fase");
    const imagemFimDeFase = document.getElementById("imagem-fim-de-fase");

    if (resultado === "sucesso") {
        imagemFimDeFase.src = "fim_fase_sucesso.png"; // Substitua pelo caminho da sua imagem
    } else if (resultado === "falha") {
        imagemFimDeFase.src = "fim_fase_falha.png"; // Substitua pelo caminho da sua imagem
    }

    telaFimDeFase.style.display = "flex"; // Exibe a tela
}

function initializeArmy(armyId) {
    console.log("initializeArmy chamado para:", armyId);
    const army = document.getElementById(armyId);
    const gameRect = game.getBoundingClientRect();
    const rect = army.getBoundingClientRect();
    armyOrigins[armyId] = {
        x: rect.left - gameRect.left + rect.width / 2, y: rect.top - gameRect.
            top + rect.height
    };

}

function rotateArmy(armyId, clickX, clickY) {
    console.log("rotateArmy chamado para:", armyId);
    const army = document.getElementById(armyId);
    const startX = armyOrigins[armyId].x;
    const startY = armyOrigins[armyId].y;
    const deltaX = clickX - startX;
    const deltaY = clickY - startY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    army.style.transform = `rotate(${angle}deg)`;
}

function checkMissileCollision(missileRect, targetRect) {
    return !(missileRect.right < targetRect.left || missileRect.left > targetRect.right || missileRect.bottom < targetRect.top || missileRect.top > targetRect.bottom);
}

async function removeMissileAndExplode(missil, clickX, clickY) {
    return new Promise(resolve => {
        removeMissile(missil);

        const explosionArea = document.createElement("div");
        explosionArea.className = "explosion-area";
        explosionArea.style.left = `${clickX - 75}px`;
        explosionArea.style.top = `${clickY - 75}px`;
        document.getElementById("game").appendChild(explosionArea);
        console.log("Criando animação de explosão:", explosionArea);

        const explosionAreaRect = explosionArea.getBoundingClientRect();
        const alvoRect = document.getElementById("alvo1-container").getBoundingClientRect();
        const isExplosionOverlappingAlvo = isRectanglesOverlap(explosionAreaRect, alvoRect);
        console.log("Explosão sobrepõe o alvo?", isExplosionOverlappingAlvo, "Explosão:", explosionAreaRect, "Alvo:", alvoRect);

        explosionArea.animate(
            [{ transform: "scale(0)" }, { transform: "scale(1)" }],
            { duration: 1000, iterations: 1 }
        );
        setTimeout(() => {
            console.log("Removendo animação de explosão:", explosionArea);
            explosionArea.remove();
            resolve();
        }, 1000);
    });
}

async function fireMissile(armyId, clickX, clickY) {
    const army = document.getElementById(armyId);
    const startX = armyOrigins[armyId].x;
    const startY = armyOrigins[armyId].y;
    const deltaX = clickX - startX;
    const deltaY = clickY - startY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    const missileData = armyData[armyId];
    const missil = document.createElement('img');
    missil.className = 'missil';
    missil.src = "antimissil.png";
    missil.style.width = `${missileData.missileWidth}px`;
    missil.style.height = `${missileData.missileHeight}px`;
    missil.style.left = `${startX - missileData.missileOffsetX}px`;
    missil.style.top = `${startY - missileData.missileOffsetY}px`;
    missil.style.transform = `rotate(${angle}deg)`;
    missil.style.display = 'block';
    game.appendChild(missil);
    missiles.push(missil);

    setTimeout(() => {
        let currentX = startX - missileData.missileOffsetX;
        let currentY = startY - missileData.missileOffsetY;
        const speed = missileData.missileSpeed;
        const steps = Math.floor(Math.sqrt(deltaX ** 2 + deltaY ** 2) / speed) - 5;
        const stepX = deltaX / steps;
        const stepY = deltaY / steps;
        let counter = 0;

        const targetRect = target.getBoundingClientRect();

        const missileInterval = setInterval(async () => {
            const missilRect = missil.getBoundingClientRect();
            const targetCenterX = clickX;
            const targetCenterY = clickY;
            const targetRadius = 130;
            const missileTipX = currentX + missileData.missileWidth / 2 + Math.cos(angle - Math.PI / 2) * missileData.missileHeight / 2;
            const missileTipY = currentY + missileData.missileHeight / 2 + Math.sin(angle - Math.PI / 2) * missileData.missileHeight / 2;
            const distance = Math.sqrt((missileTipX - targetCenterX) ** 2 + (missileTipY - targetCenterY) ** 2);

            if (checkMissileCollision(missilRect, targetRect) || distance <= targetRadius) {
                console.log("Colisão detectada!");
                clearInterval(missileInterval);
                missileIntervals.splice(missileIntervals.indexOf(missileInterval), 1);
                await removeMissileAndExplode(missil, clickX, clickY);
                return;
            }

            currentX += stepX;
            currentY += stepY;
            if (missil) {
                missil.style.left = currentX + "px";
                missil.style.top = currentY + "px";
            }
            counter++;
        }, 16);
        missileIntervals.push(missileInterval);
    }, 200);
}

let modoJogo = "coordenado";
const modoJogoBtn = document.getElementById("modo-jogo-btn");
modoJogoBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    modoJogo = modoJogo === "coordenado" ? "individual" : "coordenado";
    modoJogoBtn.textContent = modoJogo === "coordenado" ? "Modo Coordenado" : "Modo Individual";
});

function handleGameClick(event) {
    console.log("handleGameClick chamado!");
    handleDefense(event);
    const gameRect = game.getBoundingClientRect();
    const clickX = event.clientX - gameRect.left;
    const clickY = event.clientY - gameRect.top;
    const btnRect = modoJogoBtn.getBoundingClientRect();

        // **ADICIONE UMA CONDIÇÃO PARA VERIFICAR SE O CLIQUE NÃO FOI NOS BOTÕES DE CONTROLE**
        const controles = document.getElementById("game-controls");
        if (controles && controles.contains(event.target)) {
            console.log("Clique nos controles, não disparar míssil.");
            return; // Se o clique foi dentro da div de controles, não faça nada
        }

    if (clickX >= btnRect.left - gameRect.left && clickX <= btnRect.right - gameRect.left && clickY >= btnRect.top - gameRect.top && clickY <= btnRect.bottom - gameRect.top) {
        return;
    }
    if (modoJogo === "coordenado") {
        for (const armyId in armyOrigins) {
            rotateArmy(armyId, clickX, clickY);
            fireMissile(armyId, clickX, clickY);
        }
    } else {
        let closestArmyId = null;
        let closestDistance = Infinity;
        for (const armyId in armyOrigins) {
            const armyX = armyOrigins[armyId].x;
            const armyY = armyOrigins[armyId].y;
            const distance = Math.sqrt((clickX - armyX) ** 2 + (clickY - armyY) ** 2);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestArmyId = armyId;
            }
        }
        if (closestArmyId) {
            console.log("Exército mais próximo clicado:", closestArmyId);
            rotateArmy(closestArmyId, clickX, clickY);
            fireMissile(closestArmyId, clickX, clickY);
        } else {
            console.log("Clique no background");
        }
    }
    const target = document.getElementById("target");
    target.style.left = `${clickX - 20}px`;
    target.style.top = `${clickY - 20}px`;
    target.style.display = "block";
    setTimeout(() => {
        target.style.display = "none";
    }, 2000);
}

const gameArea = document.getElementById("game");
let gameRect = gameArea.getBoundingClientRect();

function updateGameRect() {
    gameRect = gameArea.getBoundingClientRect();
}

window.addEventListener("resize", updateGameRect);
updateGameRect();

function handleDefense(event) {
    console.log("handleDefense chamado!");
    const gameRect = gameArea.getBoundingClientRect();
    const clickX = event.clientX - gameRect.left;
    const clickY = event.clientY - gameRect.top;
    console.log("Coordenadas do clique (relativas ao game):", clickX, clickY);
}

function isRectanglesOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

function checkBombCollisions() {
    const bombs = document.querySelectorAll(".bomb");
    const explosionAreas = document.querySelectorAll(".explosion-area");

    bombs.forEach(bomb => {
        const bombRect = bomb.getBoundingClientRect();
        const bombObject = activeBombs.find(b => b.element === bomb); // Encontra o objeto bombObject correspondente

        explosionAreas.forEach(explosionArea => {
            const explosionAreaRect = explosionArea.getBoundingClientRect();
            if (isRectanglesOverlap(bombRect, explosionAreaRect)) {
                bomb.remove();
                const index = activeBombs.findIndex(b => b.element === bomb);
                if (index > -1) {
                    const removedBomb = activeBombs.splice(index, 1)[0];
                    if (removedBomb) {
                        removedBomb.isIntercepted = true; // Adiciona uma flag de interceptação
                        console.log("Bomba ID:", removedBomb.id, "removida por explosão.");
                    }
                }
            }
        });
    });
}

function createBomb() {
    const bombId = nextBombId++; // Obtém o ID atual e depois incrementa

    const newBomb = document.createElement("img");
    newBomb.src = "bomb.png";
    newBomb.classList.add("bomb");
    newBomb.dataset.bombId = bombId; // Adiciona o ID como um atributo data-bomb-id
    game.appendChild(newBomb);

    const randomX = Math.random() * game.offsetWidth;
    newBomb.style.left = randomX + "px";
    const randomY = Math.random() * 1000 - 1000;
    newBomb.style.top = randomY + "px";

    const bombObject = { // Cria um objeto para representar a bomba (útil para rastreamento)
        id: bombId,
        element: newBomb,
        isIntercepted: false // Adiciona a propriedade isIntercepted
        // Adicione outras propriedades da bomba, se necessário (posição, etc.)
    };
    activeBombs.push(bombObject); // Adiciona a bomba à lista de bombas ativas
    console.log("Bomba criada com ID:", bombId, "em x:", randomX.toFixed(2), "y:", randomY.toFixed(2));

    moveBomb(newBomb, bombObject);
}

function moveBomb(bombElement, bombObject) {
    console.log("Função moveBomb() chamada!");
    let currentTop = parseInt(bombElement.style.top);
    let currentLeft = parseInt(bombElement.style.left);
    let gravity = 0.015;
    const targetX = Math.random() * game.offsetWidth;
    const targetY = game.offsetHeight;
    console.log("moveBomb destino:");
    let deltaX = targetX - currentLeft;
    let deltaY = targetY - currentTop;
    let angle = Math.atan2(deltaY, deltaX);
    let speed = 4 + Math.random() * 2;
    let velocityX = Math.cos(angle) * speed;
    let velocityY = Math.sin(angle) * speed;

    bombObject.velocityX = velocityX;
    bombObject.velocityY = velocityY;
    bombObject.angle = angle;
    bombObject.speed = speed;

    const interval = setInterval(() => {
        currentTop += velocityY;
        currentLeft += velocityX;
        velocityY += gravity;
        bombElement.style.left = currentLeft + "px";
        bombElement.style.top = currentTop + "px";

        let initialAngle = Math.atan2(-velocityX, velocityY);
        bombElement.style.transform = `rotate(${initialAngle}rad)`;

        // **Lógica de colisão MOVIDA PARA CÁ**
        let atingiuAlvo = false;
        for (const alvo of alvos) {
            if (alvo.isDestroyed) {
                continue;
            }
            {
                const alvoColisao = alvo.collisionBox;
                const currentTopBomb = currentTop + 250;
                const currentLeftBomb = currentLeft + 20;

                if (currentLeftBomb > alvoColisao.x && currentLeft < alvoColisao.x + alvoColisao.width &&
                    currentTopBomb > alvoColisao.y - alvoColisao.height && currentTopBomb < alvoColisao.y) {
                    explode(currentLeft, currentTop + 250);
                    bombElement.remove();
                    clearInterval(interval);
                    alvo.health--;
                    atualizarEstadoDanoAlvo(alvo.id, alvo.health);
                    console.log("COLISÃO em moveBomb - Alvo ID:", alvo.id, "Saúde:", alvo.health - 1);

                    const index = activeBombs.findIndex(b => b.element === bombElement);
                    if (index > -1) {
                        activeBombs.splice(index, 1);
                        console.log(`COLISÃO BOMBA-${alvo.id}! Bomba ID:`, bombObject.id);
                    }
                    atingiuAlvo = true;
                    return;
                }
            }
        }

        if (!atingiuAlvo && currentTop + 250 >= groundYTop) {
            explode(currentLeft, groundYTop);
            bombElement.remove();
            clearInterval(interval);
            const index = activeBombs.findIndex(b => b.element === bombElement);
            if (index > -1) {
                activeBombs.splice(index, 1);
                console.log("Bomba ID:", bombObject.id, "explodiu no chão.");
            }
            return;
        }

        if (currentLeft < 0 || currentLeft > game.offsetWidth - 20 || currentTop > game.offsetHeight) {
            bombElement.remove();
            clearInterval(interval);
            const index = activeBombs.findIndex(b => b.element === bombElement);
            if (index > -1) {
                activeBombs.splice(index, 1);
                console.log("Bomba ID:", bombObject.id, "removida por sair da tela.");
            }
            return;
        }

    }, 50);
    bombObject.interval = interval;
}

function atualizarEstadoDanoAlvo(alvoId, dano) {
    console.log("ID do alvo para atualização:", alvoId);
    console.log(`Nível de dano do alvo ${alvoId}:`, dano);
    const mensagemFeedback = document.getElementById("mensagem-feedback");
    let predioElement = null;
    let dano1Element = null;
    let dano2Element = null;
    let destruidoElement = null;
    let fundoElement = null;

    if (alvoId === "alvo1") {
        predioElement = alvo1PredioElement;
        dano1Element = alvo1Dano1Element;
        dano2Element = alvo1Dano2Element;
        destruidoElement = alvo1DestruidoElement;
        fundoElement = alvo1FundoElement;
    } else if (alvoId === "alvo2") {
        predioElement = alvo2PredioElement;
        dano1Element = alvo2Dano1Element;
        dano2Element = alvo2Dano2Element;
        destruidoElement = alvo2DestruidoElement;
        fundoElement = alvo2FundoElement;
    } else {
        console.error(`Alvo com ID ${alvoId} não encontrado para atualização de dano.`);
        return;
    }

    if (predioElement) {
        if (dano === 3) { // Estado inicial (saúde total)
            predioElement.style.display = "block";
            if (fundoElement) fundoElement.style.display = "none";
            if (dano1Element) dano1Element.style.display = "none";
            if (dano2Element) dano2Element.style.display = "none";
            if (destruidoElement) destruidoElement.style.display = "none";
        } else if (dano === 2) { // Primeiro impacto
            predioElement.style.display = "none";
            if (fundoElement) fundoElement.style.display = "block";
            if (dano1Element) dano1Element.style.display = "block";
            if (dano2Element) dano2Element.style.display = "none";
            if (destruidoElement) destruidoElement.style.display = "none";
            feedbackDanoLeve(alvoId);
        } else if (dano === 1) { // Segundo impacto
            predioElement.style.display = "none";
            if (fundoElement) fundoElement.style.display = "block";
            if (dano1Element) dano1Element.style.display = "none";
            if (dano2Element) dano2Element.style.display = "block";
            if (destruidoElement) destruidoElement.style.display = "none";
            feedbackDanoMedio(alvoId);
        } else { // Destruído (dano <= 0)
            predioElement.style.display = "none";
            if (fundoElement) fundoElement.style.display = "block";
            if (dano1Element) dano1Element.style.display = "none";
            if (dano2Element) dano2Element.style.display = "none";
            if (destruidoElement) destruidoElement.style.display = "block";
            gameOverFeedback(alvoId);
            const alvo = alvos.find(a => a.id === alvoId);

            if (alvo) {
                alvo.isDestroyed = true;

                // Mostrar a tela de fim de fase de falha
                const fimDeFaseFalhaElement = document.getElementById('fim-de-fase-falha');
                if (fimDeFaseFalhaElement) {
                    fimDeFaseFalhaElement.style.display = "block";

                    // Adicionar event listener ao botão "Voltar ao Mapa"
                    const btnVoltarMapaFalha = document.getElementById('btn-voltar-mapa-falha');
                    if (btnVoltarMapaFalha) {
                        btnVoltarMapaFalha.addEventListener('click', () => {
                            window.location.href = "index.html?fromGame=true";
                        });
                    } else {
                        console.error("Botão 'Voltar ao Mapa' não encontrado na tela de falha.");
                    }
                }
            }
        }
    }
}
        function explode(x, y) {
            explosion.style.left = x - 50 + "px";
            explosion.style.top = y - 50 + "px";
            explosion.style.display = "block";
            setTimeout(() => {
                explosion.style.display = "none";
            }, 1000);
        }

        function removeMissile(missileElement) {
            if (missileElement) {
                console.log("Removendo míssil:", missileElement);
                missileElement.remove();
                missiles = missiles.filter(missile => missile !== missileElement);
                console.log("Mísseis restantes:", missiles);
            } else {
                console.log("Míssil não encontrado para remoção.");
            }
        }

    // Este bloco DOMContentLoaded foi removido daqui e sua lógica movida para iniciarJogo()
    // document.addEventListener("DOMContentLoaded", () => { ... });


        // Função para exibir o container do alvo
        function exibirAlvo(nivelSelecionado) {
            console.log(`Exibindo container do alvo para o nível ${nivelSelecionado}`);

            // Esconde todos os containers de alvo
            const todosAlvosContainers = document.querySelectorAll('.alvo-container');
            todosAlvosContainers.forEach(container => {
                container.style.display = 'none';
            });

            // Exibe o container do alvo selecionado
            const alvoContainer = document.getElementById(`alvo${nivelSelecionado}-container`);
            if (alvoContainer) {
                alvoContainer.style.display = 'block';
            } else {
                console.error(`Container do alvo ${nivelSelecionado} não encontrado.`);
            }
        }

        // Função para iniciar o nível (somente após o briefing - agora chamado diretamente no carregamento)
        function iniciarNivel(nivel) {
            console.log(`Iniciando nível: ${nivel}`);
jogoPausado = false; // Marca o jogo como ativo
            tempoDecorridoNivel = 0;
            clearInterval(intervaloTempoNivel);
            intervaloTempoNivel = setInterval(atualizarTempo, 1000); // Inicia o contador de tempo
            // Inicia a criação de bombas AGORA AQUI, baseado no nível (se necessário)
            bombInterval = setInterval(createBomb, 3000); // Atribui o ID do intervalo a bombInterval
            nivelAtual = parseInt(nivel); // Atualiza o nível atual (garantindo que seja número)
            // Outras inicializações específicas do nível (se houver)
            console.log(`Jogo iniciado no nível ${nivelAtual}`);
        }


        function feedbackDanoLeve(alvoId) {
            const mensagemFeedback = document.getElementById("mensagem-feedback");
            mensagemFeedback.textContent = `Alvo ${alvoId} levemente danificado! Cuidado!`;
            mensagemFeedback.style.display = "block";
            setTimeout(() => {
                mensagemFeedback.style.display = "none";
            }, 2000);
        }

        function feedbackDanoMedio(alvoId) {
            const mensagemFeedback = document.getElementById("mensagem-feedback");
            mensagemFeedback.textContent = `Alvo ${alvoId} bastante danificado! Risco alto!`;
            mensagemFeedback.style.display = "block";
            setTimeout(() => {
                mensagemFeedback.style.display = "none";
            }, 2000);
        }

        function gameOverFeedback(alvoId) {
            const mensagemFeedback = document.getElementById("mensagem-feedback");
            mensagemFeedback.textContent = `O Alvo ${alvoId} foi destruído!`;
            mensagemFeedback.style.display = "block";
        }
        console.log("Fim do código JavaScript");

// Chamada para iniciar o jogo APÓS o carregamento do DOM
// REMOVE ESTE LISTENER. A chamada para iniciarJogo AGORA VEM DO navegacao.js
// document.addEventListener('DOMContentLoaded', iniciarJogo);