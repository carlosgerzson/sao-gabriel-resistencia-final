// Variáveis globais
let cannons = [];
let missiles = []; // Array para mísseis inimigos
let antiMissiles = []; // Array para anti-mísseis
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
    // Physics Arcade removida conforme sua solicitação de não usar colisões em tempo real.
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         // debug: true
    //     }
    // },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NONE,
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
    this.load.image('antimissile', 'assets/antimissile.png'); // Mantenha o carregamento, mesmo que o sprite seja um retângulo
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
let currentScaleFactor = 1;
let currentOffsetX = 0;
let currentOffsetY = 0;


function create() {
    console.log("Create function started.");

    this.scale.on('resize', resize, this);

    // ***************************************************************
    // DEFINIÇÃO DAS FUNÇÕES DE COLISÃO E EXPLOSÃO COMO MÉTODOS DA CENA
    // Isso garante que 'this' dentro delas sempre se refira à cena.
    // ***************************************************************
    this.onAntiMissileHit = function(x, y) {
        // Explosão do anti-míssil (amarela)
        const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 0.8); // Começa com raio 0
        explosionCircle.setDepth(60);
        // explosionCircle.setScale(0); // Não é mais necessário com raio inicial 0
        // explosionCircle.setAlpha(1); // Já definido no construtor do círculo

        // Parâmetros ajustados para raio e duração da explosão
        const explosionVisualRadius = 100; // Raio final maior
        const explosionAnimationDuration = 500; // Duração da animação mais longa

        this.tweens.add({
            targets: explosionCircle,
            radius: explosionVisualRadius, // Escala até o raio desejado
            alpha: 0, // Fica transparente
            ease: 'Quadratic.Out', // Efeito de saída suave
            duration: explosionAnimationDuration, // Duração da animação
            onComplete: () => {
                explosionCircle.destroy();
                // Lógica para detectar e destruir mísseis inimigos dentro do raio da explosão
                this.handleExplosionCollision(x, y, explosionVisualRadius + 50); // Chamando o método da cena, com raio de dano maior
            }
        });
    }.bind(this); // Garante que 'this' dentro de onAntiMissileHit é a cena

    this.onBuildingHit = function(x, y) {
        // Explosão do míssil inimigo atingindo o prédio (laranja)
        const buildingHitExplosion = this.add.circle(x, y, 30, 0xffa500); // Raio inicial 30px
        buildingHitExplosion.setDepth(60);
        buildingHitExplosion.setScale(0);
        buildingHitExplosion.setAlpha(1);

        this.tweens.add({
            targets: buildingHitExplosion,
            scale: 1,
            alpha: 0,
            ease: 'Cubic.easeOut',
            duration: 150, // Mais rápida
            onComplete: () => {
                buildingHitExplosion.destroy();
            }
        });
    }.bind(this); // Garante que 'this' dentro de onBuildingHit é a cena

    this.handleExplosionCollision = function(explosionX, explosionY, explosionRadius) {
        // Itera os mísseis inimigos de trás para frente para remoção segura
        // Isso é crucial ao modificar um array enquanto itera sobre ele
        for (let i = missiles.length - 1; i >= 0; i--) {
            const missile = missiles[i];
            // Garante que o míssil ainda está ativo antes de verificar a colisão
            if (!missile || !missile.active) {
                missiles.splice(i, 1); // Remove se já estiver inativo/destruído
                continue;
            }

            // Calcula a distância do míssil ao centro da explosão
            const distance = Phaser.Math.Distance.Between(explosionX, explosionY, missile.x, missile.y);

            // Se o míssil está dentro do raio da explosão
            if (distance < explosionRadius) {
                missile.destroy();
                missiles.splice(i, 1); // Remove o míssil do array
            }
        }
    }.bind(this); // Garante que 'this' dentro de handleExplosionCollision é a cena
    // ***************************************************************


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
        startGame.call(this); // Inicia o jogo no contexto da cena
    });

    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function startGame() {
    console.log("startGame function started.");
    gameBackgroundRect = this.add.rectangle(0, 0, BASE_WIDTH, BASE_HEIGHT, 0x3b1a1a).setOrigin(0).setDepth(0);

    silhuetaSprite = this.add.image(450, 1600, 'silhueta_urbana').setOrigin(0.5, 1);
    silhuetaSprite.setDepth(20);
    silhuetaSprite.displayWidth = 900;
    silhuetaSprite.displayHeight = 384;

    const towerAndCannonDefinitions = [
        {
            name: 'Torre Esquerda',
            towerAsset: 'torre_e',
            towerBaseX: 130,
            towerBaseY: 1600,
            towerTargetWidth: 218,
            towerTargetHeight: 709,
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
        const tower = this.add.image(def.towerBaseX, def.towerBaseY, def.towerAsset).setOrigin(0.5, 1);
        tower.setDepth(def.towerDepth);
        tower.displayWidth = def.towerTargetWidth;
        tower.displayHeight = def.towerTargetHeight;
        allTowerSprites.push({ sprite: tower, def: def });

        const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset);
        cannon.setOrigin(0.5, 1); // Garante que a origem do canhão é a base central
        cannon.setDepth(def.cannonDepth);
        cannon.displayWidth = def.cannonTargetWidth;
        cannon.displayHeight = def.cannonTargetHeight;
        allCannonsSprites.push({ sprite: cannon, def: def });

        cannons.push({ sprite: cannon, tower: tower });
        this.towers.push(tower);
    });

    spawnBuilding.call(this); // Chama spawnBuilding no contexto da cena

    // Ajuste a frequência de spawn de ondas para 2 segundos (2000ms)
    this.time.addEvent({ delay: 2000, callback: spawnWave, callbackScope: this, loop: true });

    this.input.on('pointerdown', (pointer) => {
        if (currentState !== 'game') return;

        const gamePointerX = pointer.x;
        const gamePointerY = pointer.y;

        // FAZER TODOS OS CANHÕES DISPARAREM (para fins de teste, conforme solicitado)
        cannons.forEach(cannon => { // Itera sobre CADA canhão
            const cannonAngle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, gamePointerX, gamePointerY);
            cannon.sprite.rotation = cannonAngle + Math.PI / 2;
            fireAntiMissile.call(this, cannon, gamePointerX, gamePointerY);
        });
    });

    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function resize(gameSize) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);

    const currentPhaserZoom = this.scale.zoom;

    if (gameBackgroundRect && gameBackgroundRect.active) {
        gameBackgroundRect.x = 0;
        gameBackgroundRect.y = 0;
        gameBackgroundRect.displayWidth = BASE_WIDTH;
        gameBackgroundRect.displayHeight = BASE_HEIGHT;
    }

    if (titleText && titleText.active) {
        titleText.x = BASE_WIDTH / 2;
        titleText.y = BASE_HEIGHT / 2 - 50;
        titleText.setFontSize(48 * currentPhaserZoom);
    }
    if (startButtonText && startButtonText.active) {
        startButtonText.x = BASE_WIDTH / 2;
        startButtonText.y = BASE_HEIGHT / 2 + 50;
        startButtonText.setFontSize(36 * currentPhaserZoom);
    }

    if (gameOverText && gameOverText.active) {
        gameOverText.x = BASE_WIDTH / 2;
        gameOverText.y = BASE_HEIGHT / 2;
        gameOverText.setFontSize(32 * currentPhaserZoom);
    }

    if (silhuetaSprite && silhuetaSprite.active) {
        silhuetaSprite.x = 450;
        silhuetaSprite.y = 1600;
        silhuetaSprite.displayWidth = 900;
        silhuetaSprite.displayHeight = 384;
    }
    if (currentBuilding && currentBuilding.active) {
        currentBuilding.x = 450;
        currentBuilding.y = 1552;
        currentBuilding.displayWidth = 506;
        currentBuilding.displayHeight = 362;
    }

    missiles.forEach(missile => {
        if (missile.active) {
            const missileBaseWidth = 10;
            const missileBaseHeight = 30;

            missile.displayWidth = missileBaseWidth;
            missile.displayHeight = missileBaseHeight;

            let targetNewX, targetNewY;
            if (currentBuilding && currentBuilding.active) {
                targetNewX = currentBuilding.x;
                targetNewY = currentBuilding.y - currentBuilding.displayHeight / 2;
            } else {
                targetNewX = BASE_WIDTH / 2;
                targetNewY = BASE_HEIGHT;
            }

            missile.targetX = targetNewX;
            missile.targetY = targetNewY;
        }
    });

    antiMissiles.forEach(anti => {
        if (anti.active) {
            // Se for um retângulo, displayWidth/Height não são definidos da mesma forma que imagens.
            // Eles já usam o width/height diretamente.
            // anti.displayWidth = anti.width;
            // anti.displayHeight = anti.height;
        }
    });

    console.log(`Resized to: ${gameSize.width}x${gameSize.height}. Phaser Zoom: ${currentPhaserZoom.toFixed(2)}`);
}


function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        gameOverText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        gameOverText.setDepth(100);

        resize.call(this, { width: this.scale.width, height: this.scale.height });
        this.time.removeAllEvents();
        return;
    }

    currentBuilding = this.add.image(450, 1552, "alvo1_predio").setOrigin(0.5, 1);
    currentBuilding.setDepth(25);
    currentBuilding.health = 3;
    currentBuilding.stateIndex = 0;

    currentBuilding.displayWidth = 506;
    currentBuilding.displayHeight = 362;

    resize.call(this, { width: this.scale.width, height: this.scale.height });
}

function spawnWave() {
    if (currentState !== 'game') return;

    waveCount++;
    // Reduz a velocidade base e o incremento para mísseis inimigos mais lentos
    const baseSpeed = 50; // Era 200, agora 100
    const speedIncrementPerWave = 10; // Era 50, agora 20 (cada nova onda aumenta a velocidade em 20px/s)

    // Atraso entre o spawn de cada míssil dentro da mesma onda
    const delayBetweenMissiles = 400; // 300 milissegundos

    for (let i = 0; i < 2; i++) { // Ainda spawna 5 mísseis por onda
        // Cria um atraso para cada míssil, fazendo com que apareçam em sequência
        this.time.delayedCall(i * delayBetweenMissiles, () => {
            const x_base = Phaser.Math.Between(0, BASE_WIDTH);
            const spawnX = x_base;
            const spawnY = 0; // Sempre spawna no topo da tela

            const missile = this.add.rectangle(spawnX, spawnY, 10, 30, 0x00ff00); // Míssil verde
            missile.speed = baseSpeed + waveCount * speedIncrementPerWave;

            // Define o alvo do míssil (prédio ou centro da tela se o prédio não existir)
            if (currentBuilding) {
                missile.targetX = currentBuilding.x;
                missile.targetY = currentBuilding.y - currentBuilding.displayHeight / 2;
            } else {
                missile.targetX = BASE_WIDTH / 2;
                missile.targetY = BASE_HEIGHT;
            }

            const missileBaseWidth = 10;
            const missileBaseHeight = 30;
            missile.displayWidth = missileBaseWidth;
            missile.displayHeight = missileBaseHeight;

            missile.setDepth(50);
            missiles.push(missile); // Adiciona ao array global de mísseis inimigos
        }, [], this); // O 'this' no último parâmetro é o `scope` para o callback
    }
}

function fireAntiMissile(cannon, targetGameX, targetGameY) {
    // Calcula o ângulo que o canhão DEVERIA ter para apontar para o clique
    const cannonAngle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, targetGameX, targetGameY);

    // CÁLCULO DA POSIÇÃO DE LANÇAMENTO NA PONTA DO CANHÃO
    const lengthToCannonTip = cannon.sprite.displayHeight * 0.9; // Mantido 0.9

    const launchX = cannon.sprite.x + Math.sin(cannonAngle) * lengthToCannonTip;
    const launchY = cannon.sprite.y - Math.cos(cannonAngle) * lengthToCannonTip;

    const antiMissile = this.add.rectangle(launchX, launchY, 15, 60, 0xff0000); // Cria o retângulo
    antiMissile.setOrigin(0.5, 1);
    antiMissile.setDepth(55);

    antiMissiles.push(antiMissile); // Adiciona ao array global de anti-mísseis

    this.tweens.add({
        targets: antiMissile,
        x: targetGameX,
        y: targetGameY,
        duration: 500, // Duração do tween
        ease: 'Linear',
        onUpdate: (tween, target) => {
            const currentAngle = Phaser.Math.Angle.Between(target.x, target.y, targetGameX, targetGameY);
            target.rotation = currentAngle + Math.PI / 2;
        },
        onComplete: () => {
            antiMissile.destroy(); // Destroi o anti-míssil
            this.onAntiMissileHit(targetGameX, targetGameY); // Chama a explosão no ponto final
        }
    });
}


function update() {
    if (currentState !== 'game') return;

    // --- Processamento de Mísseis Inimigos e Colisão com Prédio ---
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        if (!missile || !missile.active) {
            missiles.splice(i, 1);
            continue;
        }

        const angle = Phaser.Math.Angle.Between(missile.x, missile.y, missile.targetX, missile.targetY);
        missile.x += Math.cos(angle) * missile.speed * (1 / 60);
        missile.y += Math.sin(angle) * missile.speed * (1 / 60);
        missile.rotation = angle + Math.PI / 2;

        // Colisão com o prédio
        if (currentBuilding && currentBuilding.active) {
            const buildingTopY = currentBuilding.y - currentBuilding.displayHeight / 2;
            const buildingLeftX = currentBuilding.x - currentBuilding.displayWidth / 2;
            const buildingRightX = currentBuilding.x + currentBuilding.displayWidth / 2;

            if (missile.y >= buildingTopY && missile.x >= buildingLeftX && missile.x <= buildingRightX) {
                this.onBuildingHit(missile.x, missile.y); // Explosão ao atingir o prédio (método da cena)
                missile.destroy();
                missiles.splice(i, 1);

                if (currentBuilding.health > 0) {
                    currentBuilding.health--;
                    // currentBuilding.stateIndex++; // Descomente para mudar aparência do prédio
                    if (currentBuilding.health === 0) {
                        currentBuilding.destroy();
                        currentBuildingIndex++;
                        spawnBuilding.call(this); // Chama spawnBuilding no contexto da cena
                    }
                }
            }
        }
    }

    // --- Rotação dos Canhões (Permanece como está, girando apenas no clique) ---
    // A rotação dos canhões agora acontece apenas no pointerdown, conforme a lógica em startGame.
    // O bloco de rotação de canhões no update foi removido/comentado.

    // --- Spawn de Nova Onda ---
    // A condição de spawn de nova onda: spawna nova onda se não há mísseis inimigos ativos na tela.
    if (missiles.length === 0 && currentState === 'game') {
        spawnWave.call(this); // Chama spawnWave no contexto da cena
    }
}