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
        mode: Phaser.Scale.RESIZE, 
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
    // AGORA SEMPRE CARREGANDO A IMAGEM DO PRÉDIO
    this.load.image('alvo1_predio', 'assets/alvo1_predio.png'); 
    console.log("Preload complete.");
}

// Variáveis para referências dos sprites, para que possam ser acessadas na função resize
let silhuetaSprite;
let titleText, startButtonText;
let allCannonsSprites = []; 
let allTowerSprites = []; 
let gameBackgroundRect; 

// Variáveis para os offsets e fator de escala calculados em resize
let currentScaleFactor = 1;
let currentOffsetX = 0;
let currentOffsetY = 0;

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
    gameBackgroundRect = this.add.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, 0x3b1a1a).setOrigin(0).setDepth(0); // DEPTH: 0

    // Silhueta Urbana 
    silhuetaSprite = this.add.image(450, 1600, 'silhueta_urbana').setOrigin(0.5, 1);
    silhuetaSprite.setDepth(20); // DEPTH: 20
    silhuetaSprite.displayWidth = 900; 
    silhuetaSprite.displayHeight = 384; 
    
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
        allTowerSprites.push({ sprite: tower, def: def }); 

        const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset);
        cannon.setOrigin(0.5, 1); 
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

        const gamePointerX = (pointer.x - currentOffsetX) / currentScaleFactor;
        const gamePointerY = (pointer.y - currentOffsetY) / currentScaleFactor;

        cannons.forEach(cannon => {
            const distance = Phaser.Math.Distance.Between(gamePointerX, gamePointerY, (cannon.sprite.x - currentOffsetX) / currentScaleFactor, (cannon.sprite.y - currentOffsetY) / currentScaleFactor);
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


function resize(gameSize) {
    const width = gameSize.width; 
    const height = gameSize.height; 

    this.cameras.main.setViewport(0, 0, width, height);

    currentScaleFactor = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);

    currentOffsetX = (width - BASE_WIDTH * currentScaleFactor) * 0.5;
    currentOffsetY = (height - BASE_HEIGHT * currentScaleFactor) * 0.5;

    // --- Redimensiona e reposiciona os elementos ---

    // Fundo da Área de Jogo
    if (gameBackgroundRect && gameBackgroundRect.active) { 
        gameBackgroundRect.x = currentOffsetX;
        gameBackgroundRect.y = currentOffsetY;
        gameBackgroundRect.displayWidth = BASE_WIDTH * currentScaleFactor;
        gameBackgroundRect.displayHeight = BASE_HEIGHT * currentScaleFactor;
    }

    // Silhueta Urbana
    if (silhuetaSprite && silhuetaSprite.active) { 
        silhuetaSprite.x = (450 * currentScaleFactor) + currentOffsetX; 
        silhuetaSprite.y = (1600 * currentScaleFactor) + currentOffsetY; 
        
        silhuetaSprite.displayWidth = 900 * currentScaleFactor;
        silhuetaSprite.displayHeight = 384 * currentScaleFactor;
    }

    // Elementos da tela de título (se ainda existirem)
    if (titleText && titleText.active) {
        titleText.x = (BASE_WIDTH / 2 * currentScaleFactor) + currentOffsetX;
        titleText.y = (BASE_HEIGHT / 2 - 50) * currentScaleFactor + currentOffsetY; 
        titleText.setFontSize(48 * currentScaleFactor); 
    }
    if (startButtonText && startButtonText.active) {
        startButtonText.x = (BASE_WIDTH / 2 * currentScaleFactor) + currentOffsetX;
        startButtonText.y = (BASE_HEIGHT / 2 + 50) * currentScaleFactor + currentOffsetY; 
        startButtonText.setFontSize(36 * currentScaleFactor); 
    }

    // Ajusta a posição e escala de cada torre e canhão
    allTowerSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;

        if (sprite && sprite.active) { 
            sprite.x = (def.towerBaseX * currentScaleFactor) + currentOffsetX; 
            sprite.y = (def.towerBaseY * currentScaleFactor) + currentOffsetY; 

            sprite.displayWidth = def.towerTargetWidth * currentScaleFactor;
            sprite.displayHeight = def.towerTargetHeight * currentScaleFactor;
        }
    });

    allCannonsSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;
        
        if (sprite && sprite.active) { 
            sprite.x = (def.cannonX * currentScaleFactor) + currentOffsetX;
            sprite.y = (def.cannonY * currentScaleFactor) + currentOffsetY;
            
            sprite.displayWidth = def.cannonTargetWidth * currentScaleFactor;
            sprite.displayHeight = def.cannonTargetHeight * currentScaleFactor;
        }
    });

    // Ajusta o prédio (AGORA SEMPRE USANDO A IMAGEM alvo1_predio.png)
    if (currentBuilding && currentBuilding.active) { 
        currentBuilding.x = (450 * currentScaleFactor) + currentOffsetX; // Coordenada X do editor
        currentBuilding.y = (1552 * currentScaleFactor) + currentOffsetY; // Coordenada Y do editor
        currentBuilding.displayWidth = 506 * currentScaleFactor; // displayWidth do editor para alvo1_predio
        currentBuilding.displayHeight = 362 * currentScaleFactor; // displayHeight do editor para alvo1_predio
    }
    
    console.log(`Resized to: ${width}x${height}. Scale factor: ${currentScaleFactor.toFixed(2)}. Offset X: ${currentOffsetX.toFixed(2)}, Offset Y: ${currentOffsetY.toFixed(2)}`);
}


function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        const gameOverText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        
        if (gameOverText) {
            gameOverText.setFontSize(32 * currentScaleFactor);
            gameOverText.x = (BASE_WIDTH / 2 * currentScaleFactor) + currentOffsetX;
            gameOverText.y = (BASE_HEIGHT / 2 * currentScaleFactor) + currentOffsetY;
        }
        this.time.removeAllEvents(); 
        return;
    }
    
    // USANDO A IMAGEM 'alvo1_predio.png' DEFINITIVAMENTE
    currentBuilding = this.add.image(450, 1552, "alvo1_predio").setOrigin(0.5, 1); // X e Y do editor
    currentBuilding.setDepth(25); // DEPTH: 25 (entre torre E e silhueta)
    
    currentBuilding.health = 3; // Isso será modificado na próxima etapa para o sistema de camadas de dano
    currentBuilding.stateIndex = 0; // Usado para referenciar buildingStates

    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function spawnWave() {
    if (currentState !== 'game') return; 

    waveCount++;
    for (let i = 0; i < 5; i++) {
        const x_base = Phaser.Math.Between(0, BASE_WIDTH); 
        const spawnX = (x_base * currentScaleFactor) + currentOffsetX;
        const spawnY = currentOffsetY; 

        const missile = this.add.rectangle(spawnX, spawnY, 10, 30, 0x00ff00); 
        missile.speed = 200 + waveCount * 50;
        
        if (currentBuilding) { 
            missile.targetX = currentBuilding.x; 
            missile.targetY = currentBuilding.y - currentBuilding.displayHeight / 2; 
        } else {
            missile.targetX = (BASE_WIDTH / 2 * currentScaleFactor) + currentOffsetX;
            missile.targetY = (BASE_HEIGHT * currentScaleFactor) + currentOffsetY;
        }
        
        const missileBaseWidth = 10; 
        const missileBaseHeight = 30; 
        missile.displayWidth = missileBaseWidth * currentScaleFactor;
        missile.displayHeight = missileBaseHeight * currentScaleFactor;

        missile.setDepth(50); 
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetGameX, targetGameY) { 
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile'); 
    const antiMissileTargetWidthBase = 50; 
    
    antiMissile.displayWidth = antiMissileTargetWidthBase * currentScaleFactor;
    antiMissile.displayHeight = antiMissile.height * (antiMissile.displayWidth / antiMissile.width); 
    antiMissile.setDepth(55); 

    this.tweens.add({
        targets: antiMissile,
        x: (targetGameX * currentScaleFactor) + currentOffsetX, 
        y: (targetGameY * currentScaleFactor) + currentOffsetY, 
        duration: 500, 
        ease: 'Linear',
        onComplete: () => {
            antiMissile.destroy(); 
            this.onAntiMissileHit((targetGameX * currentScaleFactor) + currentOffsetX, (targetGameY * currentScaleFactor) + currentOffsetY);
        }
    });

    antiMissiles.push(antiMissile);
}

function onAntiMissileHit(x, y) {
    const explosionCircle = this.add.circle(x, y, 5, 0xffff00); 
    explosionCircle.setDepth(60); 
    explosionCircle.setScale(0); 
    explosionCircle.setAlpha(1); 

    this.tweens.add({
        targets: explosionCircle,
        scale: 1, 
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
                
                // A LÓGICA DE DANO DO PRÉDIO SERÁ REVISADA NA PRÓXIMA ETAPA
                if (currentBuilding.health > 0) {
                    currentBuilding.health--;
                    currentBuilding.stateIndex++;
                    // A COR DO RETÂNGULO NÃO SERÁ MAIS USADA SE FOR IMAGEM
                    // if (currentBuilding.stateIndex < buildingStates.length) {
                    //     currentBuilding.fillColor = buildingStates[currentBuilding.stateIndex].color;
                    // }
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
            if (anti.active && missile.active && Phaser.Math.Distance.Between(anti.x, anti.y, missile.x, missile.y) < 20) {
                anti.destroy();
                missile.destroy();
                this.onAntiMissileHit(anti.x, anti.y); 
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
            const distance = Phaser.Math.Distance.Between(cannon.sprite.x, cannon.sprite.y, missile.x, missile.y);
            if (distance < minEnemyDistance) {
                minEnemyDistance = distance;
                closestEnemyMissile = missile;
            }
        });

        if (closestEnemyMissile) {
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, closestEnemyMissile.x, closestEnemyMissile.y); 
            cannon.sprite.rotation = angle + Math.PI / 2; 
        } else if (currentBuilding && currentBuilding.active) { 
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, currentBuilding.x, currentBuilding.y);
            cannon.sprite.rotation = angle + Math.PI / 2;
        }
    });

    if (missiles.length === 0 && currentState === 'game') {
        spawnWave.call(this);
    }
}