// Variáveis globais
let cannons = []; 
let missiles = []; 
let antiMissiles = []; 
let currentBuilding = null; // Agora será uma instância do retângulo do prédio.
let currentBuildingIndex = 0; 
let currentState = 'title'; 
let waveCount = 0; 

// Para manter a proporção dos elementos em relação à nossa resolução base
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
    console.log("Preload complete.");
}

// Variáveis para referências dos sprites, para que possam ser acessadas na função resize
let silhuetaSprite;
let titleText, startButtonText;
let allCannonsSprites = []; 
let allTowerSprites = []; 
let gameBackgroundRect; 

function create() {
    console.log("Create function started.");
    
    // Configura o evento de redimensionamento do Phaser
    this.scale.on('resize', resize, this);

    // Inicializa a tela de apresentação
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

    // Chama resize uma vez na inicialização para posicionar elementos da tela de título
    // O Phaser já terá definido as dimensões iniciais do canvas.
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function startGame() {
    console.log("startGame function started.");
    // Fundo (vermelho escuro) - Adicionado como um sprite para ser redimensionado
    gameBackgroundRect = this.add.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, 0x3b1a1a).setOrigin(0).setDepth(0);

    // Silhueta Urbana (adicionada, mas será ajustada no resize)
    silhuetaSprite = this.add.image(BASE_WIDTH / 2, BASE_HEIGHT, 'silhueta_urbana').setOrigin(0.5, 1);
    silhuetaSprite.setDepth(20);
    
    // --- CONFIGURAÇÕES DE CANHÕES E TORRES (USANDO OS SEUS DADOS PRECISOS PARA 900x1600) ---
    // ATENÇÃO: Verifique e ajuste os valores de originalWidth/Height com as dimensões REAIS dos seus PNGs.
    const towerAndCannonDefinitions = [
        {
            name: 'Torre Esquerda',
            towerAsset: 'torre_e',
            towerBaseX: 112, 
            towerBaseY: 1600, 
            towerOriginalWidth: 218, // *** VERIFIQUE E AJUSTE COM A LARGURA REAL DO SEU PNG ***
            towerOriginalHeight: 713, // *** VERIFIQUE E AJUSTE COM A ALTURA REAL DO SEU PNG ***
            towerTargetWidth: 218, 
            towerTargetHeight: 713, 
            towerDepth: 25,

            cannonAsset: 'canhao_e',
            cannonX: 103, 
            cannonY: 840, 
            cannonOriginalWidth: 39, // *** VERIFIQUE E AJUSTE COM A LARGURA REAL DO SEU PNG ***
            cannonOriginalHeight: 141, // *** VERIFIQUE E AJUSTE COM A ALTURA REAL DO SEU PNG ***
            cannonTargetWidth: 39,
            cannonTargetHeight: 141,
            cannonDepth: 10
        },
        {
            name: 'Torre Central',
            towerAsset: 'torre_c',
            towerBaseX: 610, 
            towerBaseY: 1600, 
            towerOriginalWidth: 147,
            towerOriginalHeight: 636,
            towerTargetWidth: 147,
            towerTargetHeight: 636,
            towerDepth: 11,

            cannonAsset: 'canhao_c',
            cannonX: 592, 
            cannonY: 932, 
            cannonOriginalWidth: 33, 
            cannonOriginalHeight: 103, 
            cannonTargetWidth: 33,
            cannonTargetHeight: 103,
            cannonDepth: 10
        },
        {
            name: 'Torre Direita',
            towerAsset: 'torre_d',
            towerBaseX: 793, 
            towerBaseY: 1600, 
            towerOriginalWidth: 189,
            towerOriginalHeight: 787,
            towerTargetWidth: 189,
            towerTargetHeight: 787,
            towerDepth: 11,

            cannonAsset: 'canhao_d',
            cannonX: 772, 
            cannonY: 775, 
            cannonOriginalWidth: 41, 
            cannonOriginalHeight: 126, 
            cannonTargetWidth: 41,
            cannonTargetHeight: 126,
            cannonDepth: 10
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

        cannons.forEach(cannon => {
            const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, cannon.sprite.x, cannon.sprite.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestCannon = cannon;
            }
        });

        if (closestCannon) {
            fireAntiMissile.call(this, closestCannon, pointer.x, pointer.y);
        }
    });

    // Chama resize novamente para posicionar todos os elementos criados no startGame
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}


function resize(gameSize) {
    const width = gameSize.width; 
    const height = gameSize.height; 

    this.cameras.main.setViewport(0, 0, width, height);

    const scaleFactorX = width / BASE_WIDTH;
    const scaleFactorY = height / BASE_HEIGHT;

    // --- Redimensiona e reposiciona os elementos ---

    // Fundo
    if (gameBackgroundRect) { // Adicionada a verificação
        gameBackgroundRect.x = 0;
        gameBackgroundRect.y = 0;
        gameBackgroundRect.displayWidth = width;
        gameBackgroundRect.displayHeight = height;
    }

    // Silhueta Urbana
    if (silhuetaSprite) { // Adicionada a verificação
        silhuetaSprite.x = width / 2; 
        silhuetaSprite.y = height;    
        // Usamos a largura original do PNG para a escala, esticando para a largura da tela.
        // Isso manterá a proporção do PNG, mas a silhueta pode não cobrir toda a altura se a proporção da tela for muito diferente.
        silhuetaSprite.setScale(width / silhuetaSprite.width);
        // Se a silhueta tiver que se esticar verticalmente também para preencher a altura (com distorção),
        // descomente e use a linha abaixo:
        // silhuetaSprite.displayHeight = height; // Força a altura a preencher
    }

    // Elementos da tela de título (se ainda existirem)
    if (titleText && titleText.active) {
        titleText.x = width / 2;
        titleText.y = height / 2 - (50 * scaleFactorY); 
        titleText.setFontSize(48 * Math.min(scaleFactorX, scaleFactorY)); 
    }
    if (startButtonText && startButtonText.active) {
        startButtonText.x = width / 2;
        startButtonText.y = height / 2 + (50 * scaleFactorY); 
        startButtonText.setFontSize(36 * Math.min(scaleFactorX, scaleFactorY)); 
    }

    // Ajusta a posição e escala de cada torre e canhão
    allTowerSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;

        // Reposiciona com base nas coordenadas da resolução base e no fator de escala X e Y
        sprite.x = def.towerBaseX * scaleFactorX; 
        sprite.y = def.towerBaseY * scaleFactorY; 

        // Redimensiona o sprite para a largura e altura alvo, mas escalado pela proporção atual da tela.
        // Isso causará o efeito de "esticar para preencher" que você descreveu como "boa responsividade".
        sprite.displayWidth = def.towerTargetWidth * scaleFactorX;
        sprite.displayHeight = def.towerTargetHeight * scaleFactorY;
    });

    allCannonsSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;

        sprite.x = def.cannonX * scaleFactorX;
        sprite.y = def.cannonY * scaleFactorY;
        
        sprite.displayWidth = def.cannonTargetWidth * scaleFactorX;
        sprite.displayHeight = def.cannonTargetHeight * scaleFactorY;
    });

    // Ajusta o prédio
    if (currentBuilding) { // Mudada a referência para 'currentBuilding' (a variável global)
        currentBuilding.x = (BASE_WIDTH / 2) * scaleFactorX;
        currentBuilding.y = 1360 * scaleFactorY; 
        currentBuilding.displayWidth = 270 * scaleFactorX;
        currentBuilding.displayHeight = 320 * scaleFactorY;
    }
    
    console.log(`Resized to: ${width}x${height}. Scale factors X: ${scaleFactorX.toFixed(2)}, Y: ${scaleFactorY.toFixed(2)}`);
}


function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        const gameOverText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        this.time.removeAllEvents(); 

        // Garante que o texto de game over também seja redimensionado
        // Como gameOverText é local, ele não pode ser acessado no resize.
        // Se precisar redimensioná-lo, ele também precisaria ser uma variável global.
        // Por enquanto, vamos deixá-lo sem redimensionamento dinâmico após o spawn.
        return;
    }
    // Prédio Principal: Coordenadas e Tamanhos
    currentBuilding = this.add.rectangle(BASE_WIDTH / 2, 1360, 270, 320, buildingStates[0].color); // Inicializa currentBuilding
    currentBuilding.health = 3;
    currentBuilding.stateIndex = 0;
    currentBuilding.setDepth(1); 
    
    // Redimensiona o prédio imediatamente após o spawn
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function spawnWave() {
    if (currentState !== 'game') return; 

    waveCount++;
    for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(0, this.scale.width);
        const missile = this.add.rectangle(x, 0, 10, 30, 0x00ff00);
        missile.speed = 200 + waveCount * 50;
        // O targetX e targetY do míssil devem ser as coordenadas atuais do prédio na tela
        if (currentBuilding) { // Verifica se o prédio existe antes de tentar acessar
            missile.targetX = currentBuilding.x; 
            missile.targetY = currentBuilding.y; 
        } else {
            // Fallback para uma posição padrão se o prédio ainda não existe (improvável com o spawnBuilding)
            missile.targetX = this.scale.width / 2;
            missile.targetY = this.scale.height;
        }
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetX, targetY) {
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile'); 
    const antiMissileTargetWidthBase = 50; 
    const scaleFactorX = this.scale.width / BASE_WIDTH;
    const antiMissileCurrentWidth = antiMissileTargetWidthBase * scaleFactorX;
    antiMissile.setScale(antiMissileCurrentWidth / antiMissile.width); 
    antiMissile.setDepth(5); 

    this.tweens.add({
        targets: antiMissile,
        x: targetX, 
        y: targetY, 
        duration: 500, 
        ease: 'Linear',
        onComplete: () => {
            antiMissile.destroy(); 
            this.onAntiMissileHit(antiMissile.x, antiMissile.y);
        }
    });

    antiMissiles.push(antiMissile);
}

function onAntiMissileHit(x, y) {
    const explosionCircle = this.add.circle(x, y, 5, 0xffff00); 
    explosionCircle.setDepth(45); 
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
        // Movimento e colisão ocorrem dentro do sistema de coordenadas da TELA ATUAL
        const angle = Phaser.Math.Angle.Between(missile.x, missile.y, missile.targetX, missile.targetY); 
        missile.x += Math.cos(angle) * missile.speed * (1 / 60);
        missile.y += Math.sin(angle) * missile.speed * (1 / 60);
        missile.rotation = angle + Math.PI / 2; 

        // Colisão com o prédio
        if (currentBuilding && missile.y > currentBuilding.y - currentBuilding.displayHeight / 2) { 
            if (missile.x > currentBuilding.x - currentBuilding.displayWidth / 2 && 
                missile.x < currentBuilding.x + currentBuilding.displayWidth / 2) {

                missiles.splice(index, 1);
                missile.destroy();
                
                if (currentBuilding.health > 0) {
                    currentBuilding.health--;
                    currentBuilding.stateIndex++;
                    if (currentBuilding.stateIndex < buildingStates.length) {
                        currentBuilding.fillColor = buildingStates[currentBuilding.stateIndex].color;
                    }
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
        missiles.forEach((missile) => { 
            if (anti.active && missile.active && Phaser.Math.Distance.Between(anti.x, anti.y, missile.x, missile.y) < 20) {
                anti.destroy();
                missile.destroy();
                this.onAntiMissileHit(anti.x, anti.y); 
            }
        });
    });

    cannons.forEach(cannon => {
        let closestEnemyMissile = null;
        let minEnemyDistance = Infinity;

        missiles.forEach(missile => {
            const distance = Phaser.Math.Distance.Between(cannon.sprite.x, cannon.sprite.y, missile.x, missile.y);
            if (distance < minEnemyDistance) {
                minEnemyDistance = distance;
                closestEnemyMissile = missile;
            }
        });

        if (closestEnemyMissile) {
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, closestEnemyMissile.x, closestEnemyEnemyMissile.y);
            cannon.sprite.rotation = angle + Math.PI / 2; 
        } else if (currentBuilding) { 
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, currentBuilding.x, currentBuilding.y);
            cannon.sprite.rotation = angle + Math.PI / 2;
        }
    });

    if (missiles.length === 0 && currentState === 'game') {
        spawnWave.call(this);
    }
}