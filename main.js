// Variáveis globais
let cannons = [];
let missiles = [];
let antiMissiles = [];
let currentBuilding = null;
let currentBuildingIndex = 0;
let currentState = 'title';
let waveCount = 0;

// Para manter a proporção dos elementos em relação à nossa resolução base
// Com RESIZE, estas são as dimensões de referência, não fixas para o canvas
const BASE_WIDTH = 900;
const BASE_HEIGHT = 1600;

const buildingStates = [
    { health: 3, color: 0x8b4b4b }, // Intacto
    { health: 2, color: 0x6b3b3b }, // Dano1
    { health: 1, color: 0x4b2b2b }, // Dano2
    { health: 0, color: 0x2b1b1b }  // Destruído
];

const config = {
    type: Phaser.AUTO,
    width: BASE_WIDTH, // Largura de referência
    height: BASE_HEIGHT, // Altura de referência
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // ALTERADO PARA Phaser.Scale.RESIZE
        autoCenter: Phaser.Scale.NO_CENTER, // Mantido NO_CENTER para centralização via CSS
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
let gameBackgroundRect; // Retângulo de fundo

function create() {
    console.log("Create function started.");

    // Registrar o listener de redimensionamento
    this.scale.on('resize', resize, this);

    // Criar elementos da tela de título
    titleText = this.add.text(0, 0, 'SÃO GABRIEL\nRESISTÊNCIA FINAL', {
        fontSize: '48px',
        fill: '#fff',
        fontFamily: 'monospace'
    }).setOrigin(0.5);

    startButtonText = this.add.text(0, 0, 'TOCAR PARA INICIAR', {
        fontSize: '36px',
        fill: '#fff'
    }).setOrigin(0.5).setInteractive();

    startButtonText.on('pointerdown', () => {
        console.log("Botão Iniciar clicado!");
        titleText.destroy();
        startButtonText.destroy();
        currentState = 'game';
        startGame.call(this);
    });

    // Chamar resize uma vez no início para configurar o layout inicial
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function startGame() {
    console.log("startGame function started.");

    // Fundo da Área de Jogo (retângulo)
    // Ele será redimensionado na função resize para preencher a tela
    gameBackgroundRect = this.add.rectangle(0, 0, 1, 1, 0x3b1a1a).setOrigin(0.5).setDepth(0);

    // Silhueta Urbana - Criada com origem 0.5, 1 (centro-base)
    silhuetaSprite = this.add.image(0, 0, 'silhueta_urbana').setOrigin(0.5, 1);
    silhuetaSprite.setDepth(20);

    // --- CONFIGURAÇÕES DE CANHÕES E TORRES ---
    const towerAndCannonDefinitions = [
        {
            name: 'Torre Esquerda',
            towerAsset: 'torre_e',
            towerBaseX: 130, // Posição X de referência na BASE_WIDTH
            towerBaseY: 1600, // Posição Y de referência na BASE_HEIGHT
            towerTargetWidth: 218, // Largura de referência
            towerTargetHeight: 709, // Altura de referência
            towerDepth: 30,

            cannonAsset: 'canhao_e',
            cannonX: 130,
            cannonY: 981,
            cannonTargetWidth: 39,
            cannonTargetHeight: 141,
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
        // Criar sprites sem definir displayWidth/Height aqui, a função resize fará isso
        const tower = this.add.image(0, 0, def.towerAsset).setOrigin(0.5, 1);
        tower.setDepth(def.towerDepth);
        allTowerSprites.push({ sprite: tower, def: def });

        const cannon = this.add.image(0, 0, def.cannonAsset).setOrigin(0.5, 1);
        cannon.setDepth(def.cannonDepth);
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

        // pointer.x/y já estão nas coordenadas do mundo do jogo (que agora são as dimensões do canvas)
        const gamePointerX = pointer.x;
        const gamePointerY = pointer.y;

        cannons.forEach(cannon => {
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

    // Chamar resize novamente para posicionar todos os elementos criados no startGame
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

// FUNÇÃO RESIZE para Phaser.Scale.RESIZE
// Esta função é chamada sempre que a tela redimensiona e no início do jogo.
function resize(gameSize) {
    const width = gameSize.width; // Largura atual do canvas
    const height = gameSize.height; // Altura atual do canvas

    // Define a viewport da câmera para o tamanho da tela atual
    this.cameras.main.setViewport(0, 0, width, height);

    // --- Fundo da Área de Jogo ---
    // Estica o retângulo de fundo para preencher toda a tela
    if (gameBackgroundRect && gameBackgroundRect.active) {
        gameBackgroundRect.x = width / 2;
        gameBackgroundRect.y = height / 2;
        gameBackgroundRect.displayWidth = width;
        gameBackgroundRect.displayHeight = height;
    }

    // --- Títulos e Botões (Tela de Título) ---
    if (titleText && titleText.active) {
        titleText.x = width / 2;
        titleText.y = height / 2 - (50 * (height / BASE_HEIGHT)); // Escala Y proporcionalmente
        titleText.setFontSize(48 * (width / BASE_WIDTH)); // Escala a fonte com base na largura
    }
    if (startButtonText && startButtonText.active) {
        startButtonText.x = width / 2;
        startButtonText.y = height / 2 + (50 * (height / BASE_HEIGHT)); // Escala Y proporcionalmente
        startButtonText.setFontSize(36 * (width / BASE_WIDTH)); // Escala a fonte com base na largura
    }

    // Game Over Text - posicionar no mundo do jogo e ajustar fontSize
    if (gameOverText && gameOverText.active) {
        gameOverText.x = width / 2;
        gameOverText.y = height / 2;
        gameOverText.setFontSize(32 * (width / BASE_WIDTH)); // Escala a fonte com base na largura
    }

    // --- Silhueta Urbana (Grupo do Bottom) ---
    if (silhuetaSprite && silhuetaSprite.active) {
        silhuetaSprite.x = width / 2;
        silhuetaSprite.y = height; // Ancorado no fundo (origem 0.5, 1)
        silhuetaSprite.displayWidth = width; // Ocupa 100% da largura
        // A altura da silhueta será proporcional à sua largura para evitar distorção
        silhuetaSprite.displayHeight = silhuetaSprite.texture.height * (width / silhuetaSprite.texture.width);
    }

    // --- Torres e Canhões (Grupo do Bottom) ---
    // Calcular a escala de largura baseada na largura atual do canvas
    const currentWidthScale = width / BASE_WIDTH;

    allTowerSprites.forEach(item => {
        const tower = item.sprite;
        const def = item.def;
        if (tower && tower.active) {
            // Posicionar X proporcionalmente à largura atual
            tower.x = def.towerBaseX * currentWidthScale;
            // Posicionar Y em relação à base da tela
            tower.y = height - (BASE_HEIGHT - def.towerBaseY) * (height / BASE_HEIGHT); // Ajusta Y proporcionalmente à altura
            tower.displayWidth = def.towerTargetWidth * currentWidthScale; // Escala largura
            tower.displayHeight = def.towerTargetHeight * currentWidthScale; // Escala altura proporcionalmente à largura
        }
    });

    allCannonsSprites.forEach(item => {
        const cannon = item.sprite;
        const def = item.def;
        if (cannon && cannon.active) {
            // Posicionar X proporcionalmente à largura atual
            cannon.x = def.cannonX * currentWidthScale;
            // Posicionar Y em relação à base da tela
            cannon.y = height - (BASE_HEIGHT - def.cannonY) * (height / BASE_HEIGHT); // Ajusta Y proporcionalmente à altura
            cannon.displayWidth = def.cannonTargetWidth * currentWidthScale; // Escala largura
            cannon.displayHeight = def.cannonTargetHeight * currentWidthScale; // Escala altura proporcionalmente à largura
        }
    });

    // --- Prédio (Alvo Principal) ---
    if (currentBuilding && currentBuilding.active) {
        currentBuilding.x = width / 2; // Centralizado horizontalmente
        // Posicionar Y em relação à base da tela, logo acima da silhueta/canhões
        // Ajustar a posição Y para que o prédio fique acima da silhueta
        // A silhueta tem origem 0.5, 1 (base) e sua displayHeight é ajustada pela largura.
        // A altura do prédio também será ajustada pela largura
        currentBuilding.displayWidth = 506 * currentWidthScale;
        currentBuilding.displayHeight = 362 * currentWidthScale;
        currentBuilding.y = height - silhuetaSprite.displayHeight + (currentBuilding.displayHeight / 2); // Ajusta Y para ficar acima da silhueta
    }

    // --- Mísseis e Anti-Mísseis ---
    // Eles já estão se movendo em coordenadas do mundo do jogo, que agora são as dimensões do canvas.
    // Apenas ajuste o displayWidth/Height para que eles escalem com a largura da tela.
    missiles.forEach(missile => {
        if (missile.active) {
            const missileBaseWidth = 10;
            const missileBaseHeight = 30;
            missile.displayWidth = missileBaseWidth * currentWidthScale;
            missile.displayHeight = missileBaseHeight * currentWidthScale;

            // Recalcula o alvo do míssil com base nas novas posições dos elementos
            let targetNewX, targetNewY;
            if (currentBuilding && currentBuilding.active) {
                targetNewX = currentBuilding.x;
                targetNewY = currentBuilding.y - currentBuilding.displayHeight / 2;
            } else {
                targetNewX = width / 2; // Alvo no centro inferior do MUNDO DO JOGO
                targetNewY = height; // Fundo da tela
            }
            missile.targetX = targetNewX;
            missile.targetY = targetNewY;
        }
    });

    antiMissiles.forEach(anti => {
        if (anti.active) {
            const antiMissileTargetWidthBase = 50;
            anti.displayWidth = antiMissileTargetWidthBase * currentWidthScale;
            anti.displayHeight = anti.texture.height * (anti.displayWidth / anti.texture.width); // Mantém proporção do anti-míssil
        }
    });

    console.log(`Resized to: ${width}x${height}.`);
}

function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        gameOverText = this.add.text(0, 0, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        gameOverText.setDepth(100);

        // Chamar resize para posicionar o texto de Game Over
        resize.call(this, { width: this.scale.width, height: this.scale.height });
        this.time.removeAllEvents();
        return;
    }

    // Criar o prédio sem definir displayWidth/Height aqui, a função resize fará isso
    currentBuilding = this.add.image(0, 0, "alvo1_predio").setOrigin(0.5, 1); // Origem centro-base
    currentBuilding.setDepth(25);
    currentBuilding.health = 3;
    currentBuilding.stateIndex = 0;

    // Chamar resize para posicionar o prédio recém-criado
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function spawnWave() {
    if (currentState !== 'game') return;

    waveCount++;
    for (let i = 0; i < 5; i++) {
        // Spawn X do míssil na largura atual da tela
        const spawnX = Phaser.Math.Between(0, this.scale.width);
        const spawnY = 0; // Topo da tela

        const missile = this.add.rectangle(spawnX, spawnY, 10, 30, 0x00ff00);
        missile.speed = 200 + waveCount * 50;

        // O alvo do míssil deve ser o prédio atual, ou o centro da base da tela
        if (currentBuilding && currentBuilding.active) {
            missile.targetX = currentBuilding.x;
            missile.targetY = currentBuilding.y - currentBuilding.displayHeight / 2;
        } else {
            missile.targetX = this.scale.width / 2;
            missile.targetY = this.scale.height; // Fundo da tela
        }

        // Definir o tamanho base do míssil, que será escalado na função resize
        const missileBaseWidth = 10;
        const missileBaseHeight = 30;
        missile.displayWidth = missileBaseWidth * (this.scale.width / BASE_WIDTH); // Escala largura
        missile.displayHeight = missileBaseHeight * (this.scale.width / BASE_WIDTH); // Escala altura proporcionalmente à largura

        missile.setDepth(50);
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetGameX, targetGameY) {
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile');
    const antiMissileTargetWidthBase = 50;

    // Escalar o anti-míssil com base na largura atual da tela
    antiMissile.displayWidth = antiMissileTargetWidthBase * (this.scale.width / BASE_WIDTH);
    antiMissile.displayHeight = antiMissile.texture.height * (antiMissile.displayWidth / antiMissile.texture.width);
    antiMissile.setDepth(55);

    this.tweens.add({
        targets: antiMissile,
        x: targetGameX, // Coordenadas já vêm do clique na tela escalada
        y: targetGameY, // Coordenadas já vêm do clique na tela escalada
        duration: 500,
        ease: 'Linear',
        onComplete: () => {
            antiMissile.destroy();
            this.onAntiMissileHit(targetGameX, targetGameY);
        }
    });

    antiMissiles.push(antiMissile);
}

function onAntiMissileHit(x, y) {
    // A escala do círculo de explosão deve ser relativa à largura atual da tela
    const explosionRadiusBase = 50; // Raio base da explosão
    const currentRadius = explosionRadiusBase * (this.scale.width / BASE_WIDTH);

    const explosionCircle = this.add.circle(x, y, currentRadius, 0xffff00);
    explosionCircle.setDepth(60);
    explosionCircle.setScale(0); // Escala inicial
    explosionCircle.setAlpha(1);

    this.tweens.add({
        targets: explosionCircle,
        scale: 1, // Já definimos o raio base, então escala para 1
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

        // missile.x, missile.y, missile.targetX, missile.targetY já estão nas coordenadas do mundo do jogo
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
