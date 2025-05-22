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
    this.load.image('silhueta_urbana', 'assets/silhueta_urbana.png'); // Imagem do fundo (chão + cidade)
    this.load.image('torre_e', 'assets/torre_e.png'); 
    this.load.image('torre_c', 'assets/torre_c.png'); 
    this.load.image('torre_d', 'assets/torre_d.png'); 
    this.load.image('canhao_e', 'assets/canhao_e.png'); 
    this.load.image('canhao_c', 'assets/canhao_c.png'); 
    this.load.image('canhao_d', 'assets/canhao_d.png'); 
    this.load.image('antimissile', 'assets/antimissile.png'); 
    // SE 'alvo1_predio' É UMA IMAGEM, DESCOMENTE E CERTIFIQUE-SE DO CAMINHO CORRETO:
    this.load.image('alvo1_predio', 'nivel1/alvo1_predio.png'); 
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
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function startGame() {
    console.log("startGame function started.");
    // Fundo (vermelho escuro)
    gameBackgroundRect = this.add.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, 0x3b1a1a).setOrigin(0).setDepth(0); // DEPTH: 0 (mais ao fundo)

    // Silhueta Urbana 
    silhuetaSprite = this.add.image(450, 1600, 'silhueta_urbana').setOrigin(0.5, 1);
    silhuetaSprite.setDepth(20); // DEPTH: 20 (entre canhões e torre E)
    silhuetaSprite.displayWidth = 900; 
    silhuetaSprite.displayHeight = 384; 
    
    // --- CONFIGURAÇÕES DE CANHÕES E TORRES (AJUSTE DE DEPTHS) ---
    const towerAndCannonDefinitions = [
        {
            name: 'Torre Esquerda',
            towerAsset: 'torre_e',
            towerBaseX: 130, 
            towerBaseY: 1600, 
            towerTargetWidth: 218, 
            towerTargetHeight: 709, 
            towerDepth: 30, // DEPTH: 30 (bem na frente, conforme pedido)

            cannonAsset: 'canhao_e',
            cannonX: 130, 
            cannonY: 981, 
            cannonTargetWidth: 39, 
            cannonTargetHeight: 141, 
            cannonDepth: 10 // DEPTH: 10 (bem atrás, conforme pedido)
        },
        {
            name: 'Torre Central',
            towerAsset: 'torre_c',
            towerBaseX: 610, 
            towerBaseY: 1600, 
            towerTargetWidth: 148, 
            towerTargetHeight: 637, 
            towerDepth: 18, // DEPTH: 18 (atrás da silhueta, mas à frente dos canhões)

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

    // Calcula um fator de escala único para manter a proporção.
    // Usamos o menor fator para garantir que o conteúdo inteiro seja visível (fit).
    // Se quiséssemos preencher a tela inteira, mesmo que corte parte do conteúdo, usaríamos Math.max.
    const scaleFactor = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);

    // O offset serve para centralizar o conteúdo quando a proporção da tela não é a mesma da BASE_WIDTH/BASE_HEIGHT
    const offsetX = (width - BASE_WIDTH * scaleFactor) * 0.5;
    const offsetY = (height - BASE_HEIGHT * scaleFactor) * 0.5;

    // --- Redimensiona e reposiciona os elementos ---

    // Fundo
    if (gameBackgroundRect && gameBackgroundRect.active) { 
        // O fundo geralmente é um caso especial, pode ser esticado para preencher a tela
        // ou você pode querer que ele também mantenha a proporção e seja centralizado.
        // Para preencher a tela e evitar barras pretas no fundo, vamos esticá-lo:
        gameBackgroundRect.x = 0;
        gameBackgroundRect.y = 0;
        gameBackgroundRect.displayWidth = width;
        gameBackgroundRect.displayHeight = height;
        // Ou, se você quiser que o fundo mantenha a proporção, como os outros elementos:
        // gameBackgroundRect.displayWidth = BASE_WIDTH * scaleFactor;
        // gameBackgroundRect.displayHeight = BASE_HEIGHT * scaleFactor;
        // gameBackgroundRect.x = offsetX;
        // gameBackgroundRect.y = offsetY;
    }

    // Silhueta Urbana
    if (silhuetaSprite && silhuetaSprite.active) { 
        silhuetaSprite.x = (450 * scaleFactor) + offsetX; 
        silhuetaSprite.y = (1600 * scaleFactor) + offsetY; // BASE_HEIGHT é a base original, então 1600 * scaleFactor é a nova base
        
        silhuetaSprite.displayWidth = 900 * scaleFactor;
        silhuetaSprite.displayHeight = 384 * scaleFactor;
    }

    // Elementos da tela de título (se ainda existirem)
    if (titleText && titleText.active) {
        titleText.x = (BASE_WIDTH / 2 * scaleFactor) + offsetX;
        titleText.y = (BASE_HEIGHT / 2 - 50) * scaleFactor + offsetY; 
        titleText.setFontSize(48 * scaleFactor); // Escala a fonte também
    }
    if (startButtonText && startButtonText.active) {
        startButtonText.x = (BASE_WIDTH / 2 * scaleFactor) + offsetX;
        startButtonText.y = (BASE_HEIGHT / 2 + 50) * scaleFactor + offsetY; 
        startButtonText.setFontSize(36 * scaleFactor); // Escala a fonte também
    }

    // Ajusta a posição e escala de cada torre e canhão
    allTowerSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;

        if (sprite && sprite.active) { 
            sprite.x = (def.towerBaseX * scaleFactor) + offsetX; 
            sprite.y = (def.towerBaseY * scaleFactor) + offsetY; 

            sprite.displayWidth = def.towerTargetWidth * scaleFactor;
            sprite.displayHeight = def.towerTargetHeight * scaleFactor;
        }
    });

    allCannonsSprites.forEach(item => {
        const sprite = item.sprite;
        const def = item.def;
        
        if (sprite && sprite.active) { 
            sprite.x = (def.cannonX * scaleFactor) + offsetX;
            sprite.y = (def.cannonY * scaleFactor) + offsetY;
            
            sprite.displayWidth = def.cannonTargetWidth * scaleFactor;
            sprite.displayHeight = def.cannonTargetHeight * scaleFactor;
        }
    });

    // Ajusta o prédio
    if (currentBuilding && currentBuilding.active) { 
        // Se 'alvo1_predio' for uma imagem, use as coordenadas do editor e o displayWidth/Height
        // currentBuilding.x = (450 * scaleFactor) + offsetX; 
        // currentBuilding.y = (1552 * scaleFactor) + offsetY; 
        // currentBuilding.displayWidth = 506 * scaleFactor; 
        // currentBuilding.displayHeight = 362 * scaleFactor; 

        // Mantém a lógica de retângulo se você não usar a imagem
        currentBuilding.x = (BASE_WIDTH / 2 * scaleFactor) + offsetX;
        currentBuilding.y = (1360 * scaleFactor) + offsetY; 
        currentBuilding.displayWidth = 270 * scaleFactor;
        currentBuilding.displayHeight = 320 * scaleFactor;
    }
    
    console.log(`Resized to: ${width}x${height}. Scale factor: ${scaleFactor.toFixed(2)}. Offset X: ${offsetX.toFixed(2)}, Offset Y: ${offsetY.toFixed(2)}`);
}


function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        const gameOverText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        
        if (gameOverText) {
            const scaleFactorX = this.scale.width / BASE_WIDTH;
            const scaleFactorY = this.scale.height / BASE_HEIGHT;
            gameOverText.setFontSize(32 * Math.min(scaleFactorX, scaleFactorY));
            gameOverText.x = this.scale.width / 2;
            gameOverText.y = this.scale.height / 2;
        }
        this.time.removeAllEvents(); 
        return;
    }
    
    // --- DECISÃO AQUI: Usar retângulo ou imagem 'alvo1_predio'? ---
    // SE VOCÊ QUISER USAR A IMAGEM 'alvo1_predio.png' que você forneceu as dimensões:
    // 1. Descomente a linha `this.load.image('alvo1_predio', 'assets/alvo1_predio.png');` no `preload`.
    // 2. Comente a linha `currentBuilding = this.add.rectangle(...)` abaixo.
    // 3. Descomente as 4 linhas abaixo que criam e dimensionam o sprite da imagem.
    // currentBuilding = this.add.image(450, 1552, "alvo1_predio").setOrigin(0.5, 1); // X e Y do editor
    // currentBuilding.displayWidth = 506; // displayWidth do editor para alvo1_predio
    // currentBuilding.displayHeight = 362; // displayHeight do editor para alvo1_predio
    // currentBuilding.setDepth(1); 
    
    // SE VOCÊ QUISER CONTINUAR USANDO O RETÂNGULO DE COR (como estava antes):
    currentBuilding = this.add.rectangle(BASE_WIDTH / 2, 1360, 270, 320, buildingStates[0].color); 
    currentBuilding = this.add.rectangle(BASE_WIDTH / 2, 1360, 270, 320, buildingStates[0].color); 
    currentBuilding.setOrigin(0.5, 1); 
    currentBuilding.setDepth(25); // DEPTH: 25 (entre torre E e silhueta, ou ajustável)

    currentBuilding.health = 3;
    currentBuilding.stateIndex = 0;
    
    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function spawnWave() {
    if (currentState !== 'game') return; 

    waveCount++;
    for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(0, this.scale.width);
        const missile = this.add.rectangle(x, 0, 10, 30, 0x00ff00);
        missile.speed = 200 + waveCount * 50;
        if (currentBuilding) { 
            missile.targetX = currentBuilding.x; 
            missile.targetY = currentBuilding.y - currentBuilding.displayHeight / 2; // Alvo no centro do prédio
        } else {
            missile.targetX = this.scale.width / 2;
            missile.targetY = this.scale.height;
        }
         missile.setDepth(50); // DEPTH: 50 (mísseis sempre na frente, para atacar)
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetX, targetY) {
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile'); 
    const antiMissileTargetWidthBase = 50; 
    const scaleFactorX = this.scale.width / BASE_WIDTH;
    const antiMissileCurrentWidth = antiMissileTargetWidthBase * scaleFactorX; // Ajusta a largura base do anti-míssil
    antiMissile.setScale(antiMissileCurrentWidth / antiMissile.width); // Aplica a escala para essa largura base
    antiMissile.setDepth(55); 

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

    // Movimento e colisão dos mísseis
    missiles.forEach((missile, index) => {
        if (!missile.active) return; // Garante que o míssil está ativo

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

    // Filtra mísseis e antemísseis que foram destruídos
    missiles = missiles.filter(missile => missile.active); 
    antiMissiles = antiMissiles.filter(anti => anti.active); 

    // Colisão antemísseis com mísseis
    antiMissiles.forEach((anti) => { 
        // Itera sobre uma cópia da lista de mísseis para evitar problemas ao remover elementos
        missiles.slice().forEach((missile) => { 
            if (anti.active && missile.active && Phaser.Math.Distance.Between(anti.x, anti.y, missile.x, missile.y) < 20) {
                anti.destroy();
                missile.destroy();
                this.onAntiMissileHit(anti.x, anti.y); // Passando as coordenadas corretas para a explosão
                // Remova os mísseis e antemísseis destruídos da lista para evitar processamento futuro
                missiles = missiles.filter(m => m.active);
                antiMissiles = antiMissiles.filter(a => a.active);
            }
        });
    });

    // Rotação dos canhões
    cannons.forEach(cannon => {
        let closestEnemyMissile = null;
        let minEnemyDistance = Infinity;

        missiles.forEach(missile => {
            if (!missile.active) return; // Garante que o míssil está ativo
            const distance = Phaser.Math.Distance.Between(cannon.sprite.x, cannon.sprite.y, missile.x, missile.y);
            if (distance < minEnemyDistance) {
                minEnemyDistance = distance;
                closestEnemyMissile = missile;
            }
        });

        if (closestEnemyMissile) {
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, closestEnemyMissile.x, closestEnemyMissile.y); 
            cannon.sprite.rotation = angle + Math.PI / 2; 
        } else if (currentBuilding && currentBuilding.active) { // Verifica se o prédio existe e está ativo
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, currentBuilding.x, currentBuilding.y);
            cannon.sprite.rotation = angle + Math.PI / 2;
        }
    });

    if (missiles.length === 0 && currentState === 'game') {
        spawnWave.call(this);
    }
}