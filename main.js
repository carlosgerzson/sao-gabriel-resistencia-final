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
        const explosionCircle = this.add.circle(x, y, 50, 0xffff00); // Raio inicial 50px
        explosionCircle.setDepth(60);
        explosionCircle.setScale(0); // Começa invisível
        explosionCircle.setAlpha(1);

        this.tweens.add({
            targets: explosionCircle,
            scale: 1, // Escala até 1 (para o raio de 50px)
            alpha: 0, // Fica transparente
            ease: 'Cubic.easeOut', // Efeito de saída suave
            duration: 200, // Duração da animação
            onComplete: () => {
                explosionCircle.destroy();
                // Lógica para detectar e destruir mísseis inimigos dentro do raio da explosão
                this.handleExplosionCollision(x, y, 50); // Chamando o método da cena
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
        for (let i = missiles.length - 1; i >= 0; i--) {
            const missile = missiles[i];
            // Garante que o míssil ainda está ativo antes de verificar a colisão
            if (!missile || !missile.active) {
                missiles.splice(i, 1); // Remove se já estiver inativo
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

    this.time.addEvent({ delay: 5000, callback: spawnWave, callbackScope: this, loop: true });

    this.input.on('pointerdown', (pointer) => {
        if (currentState !== 'game') return;

        // Comentar ou remover esta parte para testar todos disparando
        // let closestCannon = null;
        // let minDistance = Infinity;

        const gamePointerX = pointer.x;
        const gamePointerY = pointer.y;

        // *******************************************************************
        // MUDANÇA AQUI: FAZER TODOS OS CANHÕES DISPARAREM PARA FINS DE TESTE
        // *******************************************************************
        cannons.forEach(cannon => { // Itera sobre CADA canhão
            // Calcula o ângulo para onde ESTE canhão deve apontar (para o ponto de clique)
            const cannonAngle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, gamePointerX, gamePointerY);

            // Gira o sprite deste canhão para apontar para o clique
            cannon.sprite.rotation = cannonAngle + Math.PI / 2;

            // Agora, chame fireAntiMissile com ESTE canhão e o ponto de clique
            fireAntiMissile.call(this, cannon, gamePointerX, gamePointerY);
        });
        // *******************************************************************
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
    // Reduz a velocidade base e o incremento
    const baseSpeed = 100; // Era 200, agora 100
    const speedIncrementPerWave = 20; // Era 50, agora 20 (cada nova onda aumenta a velocidade em 20px/s)

    // Atraso entre o spawn de cada míssil dentro da mesma onda
    const delayBetweenMissiles = 300; // 300 milissegundos

    for (let i = 0; i < 5; i++) { // Ainda spawna 5 mísseis por onda
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
            missiles.push(missile);
        }, [], this); // O 'this' no último parâmetro é o `scope` para o callback
    }
}

function fireAntiMissile(cannon, targetGameX, targetGameY) {
    // Calcula o ângulo que o canhão DEVERIA ter para apontar para o clique
    // (Este é o mesmo angle usado para a rotação do anti-míssil)
    const cannonAngle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, targetGameX, targetGameY);

    // ***************************************************************
    // CÁLCULO DA POSIÇÃO DE LANÇAMENTO NA PONTA DO CANHÃO
    // ***************************************************************
    // O sprite do canhão tem origem (0.5, 1) - sua base está em cannon.sprite.y
    // O comprimento total do canhão é closestCannon.sprite.displayHeight.
    // Ajuste este multiplicador (0.9) para a ponta exata da "boca" do canhão
    // 1.0 seria a extremidade superior do sprite, 0.9 um pouco abaixo.
    const lengthToCannonTip = cannon.sprite.displayHeight * 0.9;

    // Calcula a posição X e Y da ponta do canhão com base na sua rotação
    // x_offset = Math.sin(angle_radians) * length
    // y_offset = -Math.cos(angle_radians) * length (negativo porque Y cresce para baixo em Phaser)
    const launchX = cannon.sprite.x + Math.sin(cannonAngle) * lengthToCannonTip;
    const launchY = cannon.sprite.y - Math.cos(cannonAngle) * lengthToCannonTip;
    // ***************************************************************

    const antiMissile = this.add.rectangle(launchX, launchY, 15, 60, 0xff0000); // Cria na nova posição, 15x60
    antiMissile.setOrigin(0.5, 1); // MUITO IMPORTANTE: Define a origem na parte inferior central do retângulo
    antiMissile.setDepth(55); // Anti-míssil deve estar à frente da silhueta e canhões

    // Define a rotação inicial do anti-míssil para que ele já aponte para o alvo
    // O + Math.PI / 2 é um ajuste comum para que retângulos/imagens apontem "para cima"
    antiMissile.rotation = cannonAngle + Math.PI / 2; // Usa o mesmo angle do canhão para sincronizar

    this.tweens.add({
        targets: antiMissile,
        x: targetGameX,
        y: targetGameY,
        duration: 500, // Duração do tween
        ease: 'Linear',
        onUpdate: (tween, target) => {
            // A cada atualização do tween, recalcula o ângulo para que o anti-míssil
            // continue a apontar para o seu alvo, dando a sensação de um projétil guiado.
            const currentAngle = Phaser.Math.Angle.Between(target.x, target.y, targetGameX, targetGameY);
            target.rotation = currentAngle + Math.PI / 2;
        },
        onComplete: () => {
            antiMissile.destroy();
            this.onAntiMissileHit(targetGameX, targetGameY); // Chama o método da cena
        }
    });

    antiMissiles.push(antiMissile);
}


function update() {
    if (currentState !== 'game') return;

    // --- Processamento de Mísseis Inimigos e Colisão com Prédio ---
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        if (!missile || !missile.active) { // Adicionado !missile para mais robustez
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

    // --- Processamento de Anti-Mísseis e Colisão com Mísseis Inimigos DURANTE O VOO ---
    // (Esta seção está comentada/removida conforme sua preferência,
    // a explosão do anti-míssil ainda ocorre apenas no ponto de clique final do tween.)
    /*
    for (let i = antiMissiles.length - 1; i >= 0; i--) {
        const anti = antiMissiles[i];
        if (!anti || !anti.active) {
            antiMissiles.splice(i, 1);
            continue;
        }
        for (let j = missiles.length - 1; j >= 0; j--) {
            const missile = missiles[j];
            if (!missile || !missile.active) {
                missiles.splice(j, 1);
                continue;
            }
            const collisionTriggerDistance = 50;
            if (Phaser.Math.Distance.Between(anti.x, anti.y, missile.x, missile.y) < collisionTriggerDistance) {
                anti.destroy();
                antiMissiles.splice(i, 1);
                this.onAntiMissileHit(anti.x, anti.y);
                break;
            }
        }
    }
    */

    // --- Rotação dos Canhões ---
    // ESTE BLOCO FOI REMOVIDO/COMENTADO PARA QUE OS CANHÕES SÓ GIREM NO CLIQUE
    /*
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
    */

    // --- Spawn de Nova Onda ---
    // A condição de spawn de nova onda foi ajustada para ocorrer apenas se não houver mísseis.
    // Isso evita um spawn constante se a onda anterior for destruída rapidamente.
    if (missiles.length === 0 && currentState === 'game') {
        spawnWave.call(this); // Chama spawnWave no contexto da cena
    }
}