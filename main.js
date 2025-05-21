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
    { health: 3, color: 0x8b4b4b }, // Intacto
    { health: 2, color: 0x6b3b3b }, // Dano1
    { health: 1, color: 0x4b2b2b }, // Dano2
    { health: 0, color: 0x2b1b1b }  // Destruído
];

const config = {
    type: Phaser.AUTO,
    // *** MUDANÇA: Voltando para RESIZE ***
    // As dimensões iniciais são a sua resolução base, mas o jogo se adaptará.
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
        // *** MODO DE ESCALA: RESIZE (o que estava funcionando bem) ***
        mode: Phaser.Scale.RESIZE, 
        autoCenter: Phaser.Scale.CENTER_BOTH, 
        parent: 'game-container'
        // Não definimos 'width' e 'height' fixos aqui quando usamos RESIZE,
        // pois eles se tornarão a largura/altura real do canvas.
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
let allCannonsSprites = []; // Para armazenar apenas as referências dos sprites dos canhões
let allTowerSprites = []; // Para armazenar apenas as referências dos sprites das torres
let currentBuildingSprite; // Referência para o sprite do prédio
let gameBackgroundRect; // Para o retângulo de fundo

function create() {
    console.log("Create function started.");
    
    // Configura o evento de redimensionamento do Phaser
    // Esta é a linha que você provavelmente se referia!
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
    resize.call(this, game.scale.width, game.scale.height);
}

function startGame() {
    console.log("startGame function started.");
    // Fundo (vermelho escuro) - Adicionado como um sprite para ser redimensionado
    gameBackgroundRect = this.add.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, 0x3b1a1a).setOrigin(0).setDepth(0);

    // Silhueta Urbana (adicionada, mas será ajustada no resize)
    silhuetaSprite = this.add.image(BASE_WIDTH / 2, BASE_HEIGHT, 'silhueta_urbana').setOrigin(0.5, 1);
    silhuetaSprite.setDepth(20);
    

    // --- CONFIGURAÇÕES DE CANHÕES E TORRES (USANDO OS SEUS DADOS PRECISOS PARA 900x1600) ---
    const towerAndCannonDefinitions = [
        {
            name: 'Torre Esquerda',
            towerAsset: 'torre_e',
            towerBaseX: 112, // X da base na resolução base (900x1600)
            towerBaseY: 1600, // Y da base na resolução base (900x1600)
            towerOriginalWidth: 218, // Largura original do PNG
            towerOriginalHeight: 713, // Altura original do PNG
            towerTargetWidth: 218, // Largura desejada em 900x1600
            towerTargetHeight: 713, // Altura desejada em 900x1600
            towerDepth: 25,

            cannonAsset: 'canhao_e',
            cannonX: 103, // X do centro na resolução base (900x1600)
            cannonY: 840, // Y do centro na resolução base (900x1600)
            cannonOriginalWidth: 39, 
            cannonOriginalHeight: 141, 
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
        cannon.setOrigin(0.5, 1); // Ponto de origem do canhão: centro da base
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

        // As coordenadas do ponteiro já são relativas à tela atual do jogo
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
    resize.call(this, game.scale.width, game.scale.height);
}


function resize(gameSize) {
    const width = gameSize.width; // Largura atual do canvas
    const height = gameSize.height; // Altura atual do canvas

    // Define o viewport para a nova largura e altura
    this.cameras.main.setViewport(0, 0, width, height);

    // Calcula os fatores de escala para largura e altura em relação à base de 900x1600
    const scaleFactorX = width / BASE_WIDTH;
    const scaleFactorY = height / BASE_HEIGHT;

    // --- Redimensiona e reposiciona os elementos ---

    // Fundo
    if (gameBackgroundRect) {
        gameBackgroundRect.x = 0;
        gameBackgroundRect.y = 0;
        gameBackgroundRect.displayWidth = width;
        gameBackgroundRect.displayHeight = height;
    }

    // Silhueta Urbana
    if (silhuetaSprite) {
        silhuetaSprite.x = width / 2; // Centraliza na nova largura
        silhuetaSprite.y = height;    // Base no fundo da nova altura
        // Escala a silhueta para preencher a largura da tela atual
        silhuetaSprite.setScale(width / silhuetaSprite.baseTexture.width, height / silhuetaSprite.baseTexture.height); // Ajusta para preencher, pode distorcer verticalmente
        // Ou, se a silhueta deve apenas ter a largura da tela e manter sua proporção original,
        // use: silhuetaSprite.setScale(width / silhuetaSprite.baseTexture.width);
        // Considerando a imagem que você enviou, onde ela estava "espremida" verticalmente,
        // é provável que você queira que ela tenha a largura total, mas mantenha sua própria proporção original.
        // Vamos usar a escala baseada na largura da tela atual para mantê-la preenchendo a largura.
        silhuetaSprite.setScale(width / silhuetaSprite.baseTexture.width);
        // Se a silhueta precisa se esticar verticalmente para não deixar buraco no fundo,
        // pode precisar de: silhuetaSprite.displayHeight = height - (algum offset do chão);
    }

    // Elementos da tela de título (se ainda existirem)
    if (titleText && titleText.active) {
        titleText.x = width / 2;
        titleText.y = height / 2 - (50 * scaleFactorY); // Ajusta o offset Y
        titleText.setFontSize(48 * Math.min(scaleFactorX, scaleFactorY)); // Tenta manter a proporção da fonte
    }
    if (startButtonText && startButtonText.active) {
        startButtonText.x = width / 2;
        startButtonText.y = height / 2 + (50 * scaleFactorY); // Ajusta o offset Y
        startButtonText.setFontSize(36 * Math.min(scaleFactorX, scaleFactorY)); // Tenta manter a proporção da fonte
    }

    // Ajusta a posição e escala de cada torre e canhão
    allTowerSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;

        // Reposiciona com base nas coordenadas da resolução base e no fator de escala X e Y
        sprite.x = def.towerBaseX * scaleFactorX; 
        sprite.y = def.towerBaseY * scaleFactorY; // A base da torre no fundo da tela escalada

        // Redimensiona o sprite para a largura e altura alvo, mas escalado pela proporção atual da tela.
        // Isso fará com que o sprite se "estique" ou "comprima" para se encaixar na nova proporção da tela,
        // que é o que você descreveu como "boa responsividade".
        sprite.displayWidth = def.towerTargetWidth * scaleFactorX;
        sprite.displayHeight = def.towerTargetHeight * scaleFactorY;
    });

    allCannonsSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;

        // Reposiciona
        sprite.x = def.cannonX * scaleFactorX;
        sprite.y = def.cannonY * scaleFactorY;
        
        // Redimensiona
        sprite.displayWidth = def.cannonTargetWidth * scaleFactorX;
        sprite.displayHeight = def.cannonTargetHeight * scaleFactorY;
    });

    // Ajusta o prédio
    if (currentBuildingSprite) {
        currentBuildingSprite.x = (BASE_WIDTH / 2) * scaleFactorX;
        currentBuildingSprite.y = 1360 * scaleFactorY; // Y do centro do prédio
        currentBuildingSprite.displayWidth = 270 * scaleFactorX;
        currentBuildingSprite.displayHeight = 320 * scaleFactorY;
    }
    
    console.log(`Resized to: ${width}x${height}. Scale factors X: ${scaleFactorX.toFixed(2)}, Y: ${scaleFactorY.toFixed(2)}`);
}


function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        // O texto de Game Over também precisa ser ajustado no resize
        const gameOverText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        this.time.removeAllEvents(); 

        // Garante que o texto de game over também seja redimensionado
        resize.call(this, game.scale.width, game.scale.height);
        return;
    }
    // Prédio Principal: Coordenadas e Tamanhos (ajuste se tiver dados específicos do Photoshop)
    currentBuildingSprite = this.add.rectangle(BASE_WIDTH / 2, 1360, 270, 320, buildingStates[0].color);
    currentBuildingSprite.health = 3;
    currentBuildingSprite.stateIndex = 0;
    currentBuildingSprite.setDepth(1); 
    
    // Redimensiona o prédio imediatamente após o spawn
    resize.call(this, game.scale.width, game.scale.height);
}

function spawnWave() {
    if (currentState !== 'game') return; 

    waveCount++;
    for (let i = 0; i < 5; i++) {
        // Mísseis spawnando aleatoriamente pela largura da TELA ATUAL do jogo
        const x = Phaser.Math.Between(0, this.scale.width);
        const missile = this.add.rectangle(x, 0, 10, 30, 0x00ff00);
        missile.speed = 200 + waveCount * 50;
        // O targetX e targetY do míssil devem ser as coordenadas atuais do prédio na tela
        missile.targetX = currentBuildingSprite.x; 
        missile.targetY = currentBuildingSprite.y; 
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetX, targetY) {
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile'); 
    // Escala do anti-míssil: calcule a escala para o tamanho desejado na tela atual
    // Usamos a proporção da largura ou altura da tela atual para escalar o anti-míssil
    const antiMissileTargetWidthBase = 50; // Largura desejada em 900x1600
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
        if (currentBuildingSprite && missile.y > currentBuildingSprite.y - currentBuildingSprite.displayHeight / 2) { 
            if (missile.x > currentBuildingSprite.x - currentBuildingSprite.displayWidth / 2 && 
                missile.x < currentBuildingSprite.x + currentBuildingSprite.displayWidth / 2) {

                missiles.splice(index, 1);
                missile.destroy();
                
                if (currentBuildingSprite.health > 0) {
                    currentBuildingSprite.health--;
                    currentBuildingSprite.stateIndex++;
                    if (currentBuildingSprite.stateIndex < buildingStates.length) {
                        currentBuildingSprite.fillColor = buildingStates[currentBuildingSprite.stateIndex].color;
                    }
                    if (currentBuildingSprite.health === 0) {
                        currentBuildingSprite.destroy();
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
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, closestEnemyMissile.x, closestEnemyMissile.y);
            cannon.sprite.rotation = angle + Math.PI / 2; 
        } else if (currentBuildingSprite) { 
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, currentBuildingSprite.x, currentBuildingSprite.y);
            cannon.sprite.rotation = angle + Math.PI / 2;
        }
    });

    if (missiles.length === 0 && currentState === 'game') {
        spawnWave.call(this);
    }
}