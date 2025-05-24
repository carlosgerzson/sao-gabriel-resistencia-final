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
        mode: Phaser.Scale.FIT, // Mantido como FIT
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
let currentOffsetX = 0;
let currentOffsetY = 0;


function create() {
    console.log("Create function started.");

    // Removemos o listener de 'resize' aqui para o modo FIT.
    // Com FIT, o Phaser já lida com a escala e centralização do canvas
    // e do mundo do jogo. Nosso "mundo" de BASE_WIDTH x BASE_HEIGHT
    // sempre estará visível e proporcional.
    // A única exceção é se você tem elementos de UI que *não* fazem parte do mundo do jogo
    // e precisam ser realinhados com as bordas *reais* da janela,
    // mas para o jogo em si, o FIT é suficiente.
    // Se a fonte dos textos não escalar corretamente, podemos adicionar um listener
    // específico para ajustar apenas o `fontSize` no `create` ou `startGame`.

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

    // Removido a chamada a resize aqui.
    // Para a tela de título, as posições fixas em BASE_WIDTH/BASE_HEIGHT são suficientes.
}

function startGame() {
    console.log("startGame function started.");
    // Fundo da Área de Jogo (vermelho escuro) - Cor definitiva do jogo
    // Com FIT, o retângulo de fundo deve ter o tamanho BASE para cobrir o mundo do jogo
    gameBackgroundRect = this.add.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, 0x3b1a1a).setOrigin(0).setDepth(0); // DEPTH: 0

    // Silhueta Urbana
    // Posições e tamanhos já são definidos no sistema de coordenadas BASE_WIDTH x BASE_HEIGHT
    silhuetaSprite = this.add.image(BASE_WIDTH / 2, BASE_HEIGHT, 'silhueta_urbana').setOrigin(0.5, 1); // X: centro, Y: base do mundo
    silhuetaSprite.setDepth(20); // DEPTH: 20
    silhuetaSprite.displayWidth = BASE_WIDTH; // Ocupa a largura total da base
    // Mantém a proporção da silhueta em relação à largura base
    silhuetaSprite.displayHeight = silhuetaSprite.texture.height * (silhuetaSprite.displayWidth / silhuetaSprite.texture.width);


    // --- CONFIGURAÇÕES DE CANHÕES E TORRES (COM OS DEPTHS REVISADOS) ---
    const towerAndCannonDefinitions = [
        {
            name: 'Torre Esquerda',
            towerAsset: 'torre_e',
            towerBaseX: 130, // Posição X no mundo base
            towerBaseY: 1600, // Posição Y no mundo base (ancorada na base)
            towerTargetWidth: 218, // Largura no mundo base
            towerTargetHeight: 709, // Altura no mundo base
            towerDepth: 30,

            cannonAsset: 'canhao_e',
            cannonX: 130, // Posição X no mundo base
            cannonY: 981, // Posição Y no mundo base
            cannonTargetWidth: 39, // Largura no mundo base
            cannonTargetHeight: 141, // Altura no mundo base
            cannonDepth: 10
        },
        {
            name: 'Torre Central',
            towerAsset: 'torre_c',
            towerBaseX: 610,
            towerBaseY: 1600,
            towerTargetWidth: 148,
            towerTargetHeight: 637,
            towerDepth: 18,

            cannonAsset: 'canhao_c',
            cannonX: 610,
            cannonY: 1035,
            cannonTargetWidth: 33,
            cannonTargetHeight: 103,
            cannonDepth: 10
        },
        {
            name: 'Torre Direita',
            towerAsset: 'torre_d',
            towerBaseX: 793,
            towerBaseY: 1600,
            towerTargetWidth: 190,
            towerTargetHeight: 782,
            towerDepth: 18,

            cannonAsset: 'canhao_d',
            cannonX: 793,
            cannonY: 901,
            cannonTargetWidth: 39,
            cannonTargetHeight: 125,
            cannonDepth: 10
        }
    ];

    cannons = [];
    allCannonsSprites = [];
    this.towers = [];
    allTowerSprites = [];

    towerAndCannonDefinitions.forEach((def) => {
        // As posições (x, y) e dimensões (displayWidth, displayHeight)
        // devem ser as do SEU MUNDO BASE (900x1600).
        // O Phaser se encarrega de escalá-las e centralizá-las na tela.
        const tower = this.add.image(def.towerBaseX, def.towerBaseY, def.towerAsset).setOrigin(0.5, 1);
        tower.setDepth(def.towerDepth);
        tower.displayWidth = def.towerTargetWidth;
        tower.displayHeight = def.towerTargetHeight;
        allTowerSprites.push({ sprite: tower, def: def });

        const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset);
        cannon.setOrigin(0.5, 1);
        cannon.setDepth(def.cannonDepth);
        cannon.displayWidth = def.cannonTargetWidth;
        cannon.displayHeight = def.cannonTargetHeight;
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

        // Com FIT, pointer.x/y já estão nas coordenadas do mundo do jogo escalado.
        // Ou seja, se o jogo tem BASE_WIDTH x BASE_HEIGHT, e está escalado,
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

    // Removido a chamada a resize aqui.
    // Uma vez que os sprites são criados com as dimensões BASE, o FIT cuida do resto.
}

// FUNÇÃO RESIZE SIMPLIFICADA PARA Phaser.Scale.FIT
// Com FIT, o Phaser já faz a maior parte do trabalho de escala e centralização do canvas.
// Nossos elementos internos devem ser posicionados em relação à nossa BASE_WIDTH/BASE_HEIGHT,
// e o Phaser cuida de escalá-los junto com o canvas.
function resize(gameSize) {
    // Com FIT, não é necessário ajustar a viewport da câmera.
    // this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);

    // O zoom do Phaser é o fator de escala que ele está aplicando ao nosso mundo de jogo (BASE_WIDTH/BASE_HEIGHT)
    const currentPhaserZoom = this.scale.zoom;

    // Fundo da Área de Jogo: Deve cobrir o mundo de jogo (BASE_WIDTH x BASE_HEIGHT)
    // Suas dimensões e posição já estão fixas em startGame e não precisam ser alteradas.
    // if (gameBackgroundRect && gameBackgroundRect.active) {
    //     gameBackgroundRect.x = 0;
    //     gameBackgroundRect.y = 0;
    //     gameBackgroundRect.displayWidth = BASE_WIDTH;
    //     gameBackgroundRect.displayHeight = BASE_HEIGHT;
    // }

    // Títulos e Botões (Textos) - posicionar no mundo do jogo e ajustar fontSize
    // Textos precisam de um ajuste de font size se você quiser que eles escalem bem.
    // Suas posições (x,y) são coordenadas do mundo do jogo e não precisam ser mudadas.
    if (titleText && titleText.active) {
        // titleText.x = BASE_WIDTH / 2; // Já definido em create
        // titleText.y = BASE_HEIGHT / 2 - 50; // Já definido em create
        titleText.setFontSize(48 * currentPhaserZoom); // Font size precisa ser escalado
    }
    if (startButtonText && startButtonText.active) {
        // startButtonText.x = BASE_WIDTH / 2; // Já definido em create
        // startButtonText.y = BASE_HEIGHT / 2 + 50; // Já definido em create
        startButtonText.setFontSize(36 * currentPhaserZoom); // Font size precisa ser escalado
    }

    // Game Over Text - posicionar no mundo do jogo e ajustar fontSize
    if (gameOverText && gameOverText.active) {
        // gameOverText.x = BASE_WIDTH / 2; // Já definido em spawnBuilding
        // gameOverText.y = BASE_HEIGHT / 2; // Já definido em spawnBuilding
        gameOverText.setFontSize(32 * currentPhaserZoom); // Font size precisa ser escalado
    }

    // Todos os Sprites (Silhueta, Torres, Canhões, Prédio)
    // Com o Phaser.Scale.FIT, as posições x, y e os displayWidth/Height
    // que você definiu na `startGame` (e `spawnBuilding`) já são automaticamente escalados pelo Phaser.
    // Não precisamos alterá-los aqui no resize.

    // Apenas para depuração, você pode manter os logs de zoom
    // console.log(`Resized to: ${gameSize.width}x${gameSize.height}. Phaser Zoom: ${currentPhaserZoom.toFixed(2)}`);
}


function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        gameOverText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        gameOverText.setDepth(100);

        // Chamar resize aqui para garantir que o fontSize do Game Over seja ajustado.
        resize.call(this, { width: this.scale.width, height: this.scale.height });
        this.time.removeAllEvents();
        return;
    }

    // Posições e tamanhos já são definidos no sistema de coordenadas BASE_WIDTH x BASE_HEIGHT
    currentBuilding = this.add.image(BASE_WIDTH / 2, 1552, "alvo1_predio").setOrigin(0.5, 1);
    currentBuilding.setDepth(25);
    currentBuilding.health = 3;
    currentBuilding.stateIndex = 0;

    // Setar o displayWidth/Height aqui no spawn também, para que o FIT os escala corretamente
    currentBuilding.displayWidth = 506;
    currentBuilding.displayHeight = 362;

    // Removido a chamada a resize aqui.
    // O prédio já é criado com as dimensões BASE e o FIT o escala.
}

function spawnWave() {
    if (currentState !== 'game') return;

    waveCount++;
    for (let i = 0; i < 5; i++) {
        // Com FIT, spawnX e spawnY são em coordenadas do MUNDO DO JOGO (BASE_WIDTH, BASE_HEIGHT)
        const spawnX = Phaser.Math.Between(0, BASE_WIDTH);
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

        // Definir o tamanho base do míssil. O FIT escala isso automaticamente.
        missile.displayWidth = 10;
        missile.displayHeight = 30;

        missile.setDepth(50);
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetGameX, targetGameY) {
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile');
    // Define o tamanho base do anti-míssil. O FIT escala isso automaticamente.
    antiMissile.displayWidth = 50;
    antiMissile.displayHeight = antiMissile.texture.height * (antiMissile.displayWidth / antiMissile.texture.width);
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
    // O raio do círculo de explosão deve ser um valor do mundo do jogo (base).
    const explosionRadiusBase = 50; // Um raio base
    const explosionCircle = this.add.circle(x, y, explosionRadiusBase / 2, 0xffff00); // Raio inicial
    explosionCircle.setDepth(60);
    explosionCircle.setScale(0); // Escala inicial
    explosionCircle.setAlpha(1);

    this.tweens.add({
        targets: explosionCircle,
        scale: 1, // Escala de 0 para 1 (o tamanho final é o que definimos como raio base)
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