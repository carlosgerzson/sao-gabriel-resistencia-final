// Variáveis globais
let cannons = [];
let missiles = [];
let antiMissiles = [];
let currentBuilding = null;
let currentBuildingIndex = 0;
let currentState = 'title';
let waveCount = 0;

// Para manter a proporção dos elementos em relação à nossa resolução base
const BASE_WIDTH = 900;
const BASE_HEIGHT = 1600;

const buildingStates = [
    { health: 3, color: 0x8b4b4b }, // Intacto - (Esta cor não será usada diretamente se usarmos a imagem, mas mantemos para referência)
    { health: 2, color: 0x6b3b3b }, // Dano1
    { health: 1, color: 0x4b2b2b }, // Dano2
    { health: 0, color: 0x2b1b1b }  // Destruído
];

const config = {
    type: Phaser.AUTO,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true 
        }
    },
    scale: {
        mode: Phaser.Scale.resize, // ALTERADO PARA Phaser.Scale.resize
        autoCenter: Phaser.Scale.NO_CENTER, // <<<<< ESSA É A MUDANÇA NECESSÁRIA
        parent: 'game-container'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    console.log("Preloading assets...");
    this.load.image('silhueta_urbana', 'assets/silhueta_urbana.png');
    this.load.image('torre_e', 'assets/torre_e.png');
    this.load.image('torre_c', 'assets/torre_c.png');
    this.load.image('torre_d', 'assets/torre_d.png');
    this.load.image('canhao_e', 'assets/canhao_e.png');
    this.load.image('canhao_c', 'assets/canhao_c.png');
    this.load.image('canhao_d', 'assets/canhao_d.png');
    this.load.image('antimissile', 'assets/antimissile.png');
    // AGORA SEMPRE CARREGANDO A IMAGEM DO PRÉDIO
    this.load.image('alvo1_predio', 'nivel1/alvo1_predio.png');
    console.log("Preload complete.");
}

// Variáveis para referências dos sprites, para que possam ser acessadas na função resize
let silhuetaSprite;
let titleText, startButtonText, gameOverText;
let allCannonsSprites = [];
let allTowerSprites = [];
let gameBackgroundRect;

// Variáveis para os offsets e fator de escala calculados em resize
// Com FIT, estas variáveis se tornam menos críticas para o posicionamento de elementos
// internos, mas ainda podem ser úteis para depuração ou lógica específica.
let currentScaleFactor = 1; // Manteremos, mas seu uso será reduzido
let currentOffsetX = 0;    // Manteremos, mas seu uso será reduzido
let currentOffsetY = 0;    // Manteremos, mas seu uso será reduzido


function create() {
    console.log("Create function started.");

    this.scale.on('resize', resize, this);

    titleText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2 - 50, 'SÃO GABRIEL\nRESISTÊNCIA FINAL', {
        fontSize: '48px',
        fill: '#fff',
        fontFamily: 'monospace'
    }).setOrigin(0.5);

    startButtonText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2 + 50, 'TOCAR PARA INICIAR', {
        fontSize: '36px',
        fill: '#fff'
    }).setOrigin(0.5).setInteractive();

    startButtonText.on('pointerdown', (pointer) => {
        console.log("Botão Iniciar clicado!");
        titleText.destroy();
        startButtonText.destroy();
        currentState = 'game';
        startGame.call(this);
    });

    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function startGame() {
    console.log("startGame function started.");
    // Fundo da Área de Jogo (vermelho escuro) - Cor definitiva do jogo
    // Com FIT, o retângulo de fundo deve ter o tamanho BASE para cobrir o mundo do jogo
    gameBackgroundRect = this.add.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, 0x3b1a1a).setOrigin(0).setDepth(0); // DEPTH: 0

    // Silhueta Urbana 
    silhuetaSprite = this.add.image(450, 1600, 'silhueta_urbana').setOrigin(0.5, 1);
    silhuetaSprite.setDepth(20); // DEPTH: 20
    silhuetaSprite.displayWidth = 900; // Define as dimensões base
    silhuetaSprite.displayHeight = 384; // Define as dimensões base

    // --- CONFIGURAÇÕES DE CANHÕES E TORRES (COM OS DEPTHS REVISADOS) ---
    const towerAndCannonDefinitions = [
        {
            name: 'Torre Esquerda',
            towerAsset: 'torre_e',
            towerBaseX: 130,
            towerBaseY: 1600,
            towerTargetWidth: 218,
            towerTargetHeight: 709,
            towerDepth: 30, // DEPTH: 30 (Torre E na frente)

            cannonAsset: 'canhao_e',
            cannonX: 130,
            cannonY: 981,
            cannonTargetWidth: 39,
            cannonTargetHeight: 141,
            cannonDepth: 10 // DEPTH: 10 (Canhão atrás de tudo)
        },
        {
            name: 'Torre Central',
            towerAsset: 'torre_c',
            towerBaseX: 610,
            towerBaseY: 1600,
            towerTargetWidth: 148,
            towerTargetHeight: 637,
            towerDepth: 18, // DEPTH: 18 (Torre C e D atrás da silhueta)

            cannonAsset: 'canhao_c',
            cannonX: 610,
            cannonY: 1035,
            cannonTargetWidth: 33,
            cannonTargetHeight: 103,
            cannonDepth: 10 // DEPTH: 10
        },
        {
            name: 'Torre Direita',
            towerAsset: 'torre_d',
            towerBaseX: 793,
            towerBaseY: 1600,
            towerTargetWidth: 190,
            towerTargetHeight: 782,
            towerDepth: 18, // DEPTH: 18

            cannonAsset: 'canhao_d',
            cannonX: 793,
            cannonY: 901,
            cannonTargetWidth: 39,
            cannonTargetHeight: 125,
            cannonDepth: 10 // DEPTH: 10
        }
    ];

    cannons = [];
    allCannonsSprites = [];
    this.towers = [];
    allTowerSprites = [];

    towerAndCannonDefinitions.forEach((def) => {
        const tower = this.add.image(def.towerBaseX, def.towerBaseY, def.towerAsset).setOrigin(0.5, 1);
        tower.setDepth(def.towerDepth);
        tower.displayWidth = def.towerTargetWidth; // Definir displayWidth/Height aqui no START
        tower.displayHeight = def.towerTargetHeight; // para que o FIT os escala corretamente
        allTowerSprites.push({ sprite: tower, def: def });

        const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset);
        cannon.setOrigin(0.5, 1);
        cannon.setDepth(def.cannonDepth);
        cannon.displayWidth = def.cannonTargetWidth; // Definir displayWidth/Height aqui no START
        cannon.displayHeight = def.cannonTargetHeight; // para que o FIT os escala corretamente
        allCannonsSprites.push({ sprite: cannon, def: def });

        cannons.push({ sprite: cannon, tower: tower });
        this.towers.push(tower);
    });

    // Primeiro prédio
    spawnBuilding.call(this);

    // Iniciar onda de mísseis a cada 5 segundos
    this.time.addEvent({ delay: 5000, callback: spawnWave, callbackScope: this, loop: true });

    // Controles de toque/clique
    this.input.on('pointerdown', (pointer) => {
        if (currentState !== 'game') return;

        let closestCannon = null;
        let minDistance = Infinity;

        // Com FIT, o pointer.x/y já estão nas coordenadas do mundo do jogo escalado
        // ou seja, se o jogo tem BASE_WIDTH x BASE_HEIGHT, e está escalado,
        // o clique em (450, 800) corresponde ao centro do mundo do jogo,
        // independentemente da escala da tela.
        const gamePointerX = pointer.x;
        const gamePointerY = pointer.y;

        cannons.forEach(cannon => {
            // A distância é calculada entre as coordenadas do mundo do jogo
            const distance = Phaser.Math.Distance.Between(gamePointerX, gamePointerY, cannon.sprite.x, cannon.sprite.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestCannon = cannon;
            }
        });

        if (closestCannon) {
            fireAntiMissile.call(this, closestCannon, gamePointerX, gamePointerY);
        }
    });

    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

// FUNÇÃO RESIZE SIMPLIFICADA PARA Phaser.Scale.FIT
// Com FIT, o Phaser já faz a maior parte do trabalho de escala e centralização do canvas.
// Nossos elementos internos devem ser posicionados em relação à nossa BASE_WIDTH/BASE_HEIGHT,
// e o Phaser cuida de escalá-los junto com o canvas.
function resize(gameSize) {
    // Define a viewport da câmera para o tamanho da tela atual
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);

    // O zoom do Phaser é o fator de escala que ele está aplicando ao nosso mundo de jogo (BASE_WIDTH/BASE_HEIGHT)
    const currentPhaserZoom = this.scale.zoom;

    // Calcular os offsets do canvas em relação à tela para usar na lógica de "coordenadas reais da tela"
    // (APENAS SE ABSOLUTAMENTE NECESSÁRIO, normalmente para coisas fora do mundo do jogo)
    // Para o nosso caso, no entanto, a maioria das coordenadas são do "mundo do jogo"
    // currentOffsetX = (gameSize.width - BASE_WIDTH * currentPhaserZoom) * 0.5;
    // currentOffsetY = (gameSize.height - BASE_HEIGHT * currentPhaserZoom) * 0.5;

    // Fundo da Área de Jogo: Deve cobrir o mundo de jogo (BASE_WIDTH x BASE_HEIGHT)
    if (gameBackgroundRect && gameBackgroundRect.active) {
        gameBackgroundRect.x = 0;
        gameBackgroundRect.y = 0;
        gameBackgroundRect.displayWidth = BASE_WIDTH; // Já estão no tamanho base
        gameBackgroundRect.displayHeight = BASE_HEIGHT; // Já estão no tamanho base
    }

    // Títulos e Botões (Textos) - posicionar no mundo do jogo e ajustar fontSize
    if (titleText && titleText.active) {
        titleText.x = BASE_WIDTH / 2;
        titleText.y = BASE_HEIGHT / 2 - 50;
        titleText.setFontSize(48 * currentPhaserZoom); // Font size ainda precisa ser escalado
    }
    if (startButtonText && startButtonText.active) {
        startButtonText.x = BASE_WIDTH / 2;
        startButtonText.y = BASE_HEIGHT / 2 + 50;
        startButtonText.setFontSize(36 * currentPhaserZoom); // Font size ainda precisa ser escalado
    }

    // Game Over Text - posicionar no mundo do jogo e ajustar fontSize
    if (gameOverText && gameOverText.active) {
        gameOverText.x = BASE_WIDTH / 2;
        gameOverText.y = BASE_HEIGHT / 2;
        gameOverText.setFontSize(32 * currentPhaserZoom); // Font size ainda precisa ser escalado
    }

    // Todos os Sprites (Silhueta, Torres, Canhões, Prédio)
    // Com o Phaser.Scale.FIT, as posições x, y e os displayWidth/Height
    // que você definiu na `startGame` já são automaticamente escalados pelo Phaser.
    // Não precisamos alterá-los aqui, a menos que haja uma lógica complexa de reposicionamento.

    // Apenas para garantir que o prédio e silhueta retenham suas propriedades de display,
    // embora o FIT cuide da escala geral, eles já estão setados no startGame.
    if (silhuetaSprite && silhuetaSprite.active) {
        silhuetaSprite.x = 450; // Coordenadas base
        silhuetaSprite.y = 1600; // Coordenadas base
        silhuetaSprite.displayWidth = 900; // Tamanho base
        silhuetaSprite.displayHeight = 384; // Tamanho base
    }
    if (currentBuilding && currentBuilding.active) {
        currentBuilding.x = 450; // Coordenadas base
        currentBuilding.y = 1552; // Coordenadas base
        currentBuilding.displayWidth = 506; // Tamanho base
        currentBuilding.displayHeight = 362; // Tamanho base
    }

    // --- CORREÇÃO FINAL para Mísseis e Anti-Mísseis ---
    // Com FIT, as coordenadas x, y dos mísseis JÁ SÃO coordenadas do mundo do jogo.
    // O que precisa ser ajustado são os targetX/Y (se baseados em elementos móveis)
    // e o displayWidth/Height, que devem ser mantidos nas suas dimensões BASE.
    missiles.forEach(missile => {
        if (missile.active) {
            const missileBaseWidth = 10;
            const missileBaseHeight = 30;

            missile.displayWidth = missileBaseWidth; // O Phaser se encarrega da escala visual
            missile.displayHeight = missileBaseHeight;

            // Recalcula o alvo do míssil com base nas coordenadas do MUNDO DO JOGO
            let targetNewX, targetNewY;
            if (currentBuilding && currentBuilding.active) {
                targetNewX = currentBuilding.x;
                targetNewY = currentBuilding.y - currentBuilding.displayHeight / 2;
            } else {
                targetNewX = BASE_WIDTH / 2; // Alvo no centro inferior do MUNDO DO JOGO
                targetNewY = BASE_HEIGHT;
            }

            missile.targetX = targetNewX;
            missile.targetY = targetNewY;

            // Não precisamos remapear missile.x e missile.y manualmente aqui,
            // pois eles já estão se movendo dentro do sistema de coordenadas do mundo do jogo,
            // e o Phaser.Scale.FIT escala o canvas todo. A rotação já é recalculada no update().
        }
    });

    antiMissiles.forEach(anti => {
        if (anti.active) {
            const antiMissileTargetWidthBase = 50;
            anti.displayWidth = antiMissileTargetWidthBase; // O Phaser se encarrega da escala visual
            anti.displayHeight = anti.height * (anti.displayWidth / anti.width);

            // Assim como os mísseis, não precisamos remapear x,y. O tween já opera no mundo do jogo.
            // Apenas garantir que o `x` e `y` do tween foram definidos com coordenadas base.
            // A parte do `fireAntiMissile` onde o `x` e `y` do tween são setados precisará ser revisada
            // para não usar `currentScaleFactor` e `currentOffsetX/Y` se estivermos em FIT.
            // Vamos corrigir isso no `fireAntiMissile` também!
        }
    });


    console.log(`Resized to: ${gameSize.width}x${gameSize.height}. Phaser Zoom: ${currentPhaserZoom.toFixed(2)}`);
}


function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        gameOverText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        gameOverText.setDepth(100);
        
        // Com FIT, a chamada imediata ao resize não é tão crítica para posicionamento inicial,
        // mas garante que o fontSize seja ajustado.
        resize.call(this, { width: this.scale.width, height: this.scale.height }); 
        this.time.removeAllEvents();
        return;
    }

    currentBuilding = this.add.image(450, 1552, "alvo1_predio").setOrigin(0.5, 1);
    currentBuilding.setDepth(25);
    currentBuilding.health = 3;
    currentBuilding.stateIndex = 0;

    // Setar o displayWidth/Height aqui no spawn também, para que o FIT os escala corretamente
    currentBuilding.displayWidth = 506;
    currentBuilding.displayHeight = 362;

    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function spawnWave() {
    if (currentState !== 'game') return;

    waveCount++;
    for (let i = 0; i < 5; i++) {
        const x_base = Phaser.Math.Between(0, BASE_WIDTH);
        // Com FIT, spawnX e spawnY são em coordenadas do MUNDO DO JOGO (BASE_WIDTH, BASE_HEIGHT)
        const spawnX = x_base; 
        const spawnY = 0; // Topo do mundo do jogo

        const missile = this.add.rectangle(spawnX, spawnY, 10, 30, 0x00ff00);
        missile.speed = 200 + waveCount * 50;

        if (currentBuilding) {
            missile.targetX = currentBuilding.x;
            missile.targetY = currentBuilding.y - currentBuilding.displayHeight / 2;
        } else {
            missile.targetX = BASE_WIDTH / 2;
            missile.targetY = BASE_HEIGHT;
        }

        const missileBaseWidth = 10;
        const missileBaseHeight = 30;
        missile.displayWidth = missileBaseWidth; // Define o tamanho base
        missile.displayHeight = missileBaseHeight; // O FIT escala isso automaticamente

        missile.setDepth(50);
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetGameX, targetGameY) {
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile');
    const antiMissileTargetWidthBase = 50;

    antiMissile.displayWidth = antiMissileTargetWidthBase; // Define o tamanho base
    antiMissile.displayHeight = antiMissile.height * (antiMissile.displayWidth / antiMissile.width);
    antiMissile.setDepth(55);

    this.tweens.add({
        targets: antiMissile,
        // Com FIT, as coordenadas x e y do tween já são coordenadas do MUNDO DO JOGO
        x: targetGameX, // Já vêm do input.on('pointerdown') em coordenadas do mundo do jogo
        y: targetGameY, // Já vêm do input.on('pointerdown') em coordenadas do mundo do jogo
        duration: 500,
        ease: 'Linear',
        onComplete: () => {
            antiMissile.destroy();
            // A explosão também deve ser nas coordenadas do MUNDO DO JOGO
            this.onAntiMissileHit(targetGameX, targetGameY); 
        }
    });

    antiMissiles.push(antiMissile);
}

function onAntiMissileHit(x, y) {
    // Com FIT, x e y já são coordenadas do MUNDO DO JOGO
    const explosionCircle = this.add.circle(x, y, 5, 0xffff00);
    explosionCircle.setDepth(60);
    explosionCircle.setScale(0); // Escala inicial
    explosionCircle.setAlpha(1);

    this.tweens.add({
        targets: explosionCircle,
        scale: 1 * this.scale.zoom, // A escala do círculo de explosão deve ser baseada no zoom do Phaser
                                    // ou podemos apenas deixar em 1 e depender do tween e do escalonamento geral.
                                    // Para consistência com outros elementos, vamos tentar 1.
        alpha: 0,
        ease: 'Linear',
        duration: 300,
        onComplete: () => {
            explosionCircle.destroy();
        }
    });
}

function update() {
    if (currentState !== 'game') return;

    missiles.forEach((missile, index) => {
        if (!missile.active) return;

        // Com FIT, missile.x, missile.y, missile.targetX, missile.targetY
        // já estão todos no mesmo sistema de coordenadas do mundo do jogo.
        const angle = Phaser.Math.Angle.Between(missile.x, missile.y, missile.targetX, missile.targetY);
        missile.x += Math.cos(angle) * missile.speed * (1 / 60);
        missile.y += Math.sin(angle) * missile.speed * (1 / 60);
        missile.rotation = angle + Math.PI / 2;

        // Colisão com o prédio
        if (currentBuilding && currentBuilding.active && missile.y > currentBuilding.y - currentBuilding.displayHeight / 2) {
            if (missile.x > currentBuilding.x - currentBuilding.displayWidth / 2 &&
                missile.x < currentBuilding.x + currentBuilding.displayWidth / 2) {

                missiles.splice(index, 1);
                missile.destroy();

                if (currentBuilding.health > 0) {
                    currentBuilding.health--;
                    currentBuilding.stateIndex++;
                    if (currentBuilding.health === 0) {
                        currentBuilding.destroy();
                        currentBuildingIndex++;
                        spawnBuilding.call(this);
                    }
                }
            }
        }
    });

    missiles = missiles.filter(missile => missile.active);
    antiMissiles = antiMissiles.filter(anti => anti.active);

    antiMissiles.forEach((anti) => {
        missiles.slice().forEach((missile) => {
            // Distância é calculada nas coordenadas do mundo do jogo
            if (anti.active && missile.active && Phaser.Math.Distance.Between(anti.x, anti.y, missile.x, missile.y) < 20) {
                anti.destroy();
                missile.destroy();
                this.onAntiMissileHit(anti.x, anti.y); // Passa coordenadas do mundo do jogo
                missiles = missiles.filter(m => m.active);
                antiMissiles = antiMissiles.filter(a => a.active);
            }
        });
    });

    cannons.forEach(cannon => {
        let closestEnemyMissile = null;
        let minEnemyDistance = Infinity;

        missiles.forEach(missile => {
            if (!missile.active) return;
            // Distância é calculada nas coordenadas do mundo do jogo
            const distance = Phaser.Math.Distance.Between(cannon.sprite.x, cannon.sprite.y, missile.x, missile.y);
            if (distance < minEnemyDistance) {
                minEnemyDistance = distance;
                closestEnemyMissile = missile;
            }
        });

        if (closestEnemyMissile) {
            // Ângulo é calculado nas coordenadas do mundo do jogo
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, closestEnemyMissile.x, closestEnemyMissile.y);
            cannon.sprite.rotation = angle + Math.PI / 2;
        } else if (currentBuilding && currentBuilding.active) {
            // Ângulo é calculado nas coordenadas do mundo do jogo
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, currentBuilding.x, currentBuilding.y);
            cannon.sprite.rotation = angle + Math.PI / 2;
        }
    });

    if (missiles.length === 0 && currentState === 'game') {
        spawnWave.call(this);
    }
}