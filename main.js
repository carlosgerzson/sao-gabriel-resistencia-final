// Variáveis globais (se forem realmente globais a todo o seu jogo)
let cannons = []; 
let missiles = []; 
let antiMissiles = []; 
let currentBuilding = null; 
let currentBuildingIndex = 0; 
let currentState = 'title'; 
let waveCount = 0; 

const buildingStates = [
    { health: 3, color: 0x8b4b4b }, // Intacto
    { health: 2, color: 0x6b3b3b }, // Dano1
    { health: 1, color: 0x4b2b2b }, // Dano2
    { health: 0, color: 0x2b1b1b }  // Destruído
];

const config = {
    type: Phaser.AUTO,
    width: 900,  
    height: 1000, 
    parent: 'game-container', // <-- CRUCIAL: AGORA É 'game-container'
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true 
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // <-- ESTE É O MODO CORRETO E FINAL PARA RESPONSIVIDADE
        autoCenter: Phaser.Scale.CENTER_BOTH, 
        parent: 'game-container', // <-- REPETE PARA CLAREZA, APONTA PARA 'game-container'
        width: 900, // Tamanho de referência interno do seu jogo
        height: 1000 // Tamanho de referência interno do seu jogo
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('silhueta_urbana', 'assets/silhueta_urbana.png');
    this.load.image('torre', 'assets/torre_e.png'); // <-- CONFIRME SE É 'torre_e.png' OU 'torre.png'
    this.load.image('canhao', 'assets/canhao.png'); 
    this.load.image('antimissile', 'assets/antimissile.png'); 
}

function create() {
    // Tela de apresentação
    const title = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'SÃO GABRIEL\nRESISTÊNCIA FINAL', {
        fontSize: '48px',
        fill: '#fff',
        fontFamily: 'monospace'
    }).setOrigin(0.5);

    const startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'TOCAR PARA INICIAR', {
        fontSize: '36px',
        fill: '#fff'
    }).setOrigin(0.5).setInteractive(); 

    startButton.on('pointerdown', (pointer) => {
        console.log("Botão Iniciar clicado!");
        console.log("Pointer X:", pointer.x, "Pointer Y:", pointer.y);
        console.log("StartButton X:", startButton.x, "StartButton Y:", startButton.y);
        console.log("Game Width:", this.cameras.main.width, "Game Height:", this.cameras.main.height);

        title.destroy();
        startButton.destroy();
        currentState = 'game';
        startGame.call(this);
    });

    // Removido: O setTimeout que envolvia o setInteractive (não é necessário com Phaser.Scale.RESIZE)
    // Removido: this.scale.refresh(); // Não é mais necessário aqui, o Phaser fará isso automaticamente na inicialização
}

function startGame() {
    // Fundo (vermelho escuro)
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x3b1a1a).setOrigin(0).setDepth(0);

    // 2. Silhueta Urbana:
    const silhueta = this.add.image(this.cameras.main.centerX, this.cameras.main.height, 'silhueta_urbana').setOrigin(0.5, 1);
    silhueta.setDepth(20);

    // --- DEFINIÇÕES DOS ASSETS ---
    const originalTowerWidth = 218;
    const originalTowerHeight = 818;
    const originalCannonWidth = 39;
    const originalCannonHeight = 141;

    // --- CONFIGURAÇÕES DOS CANHÕES E TORRES BASEADAS NAS IMAGENS (AJUSTADO PARA VISIBILIDADE) ---
    const towerAndCannonDefinitions = [
        {
            name: 'Torre & Canhão Esquerdo (E)',
            cannonXPercentage: 0.1144, cannonYPercentage: 0.49, cannonScale: 3.0, cannonOriginY: 0.5, 
            towerXPercentage: 0.0167, towerYPercentage: 0.5538, towerTopOffset: 0,
            cannonPenetrationIntoTower: 0, 
            towerScaleAdjust: 0.5 
        },
        {
            name: 'Torre & Canhão Central-Direito (C)',
            cannonXPercentage: 0.6578, cannonYPercentage: 0.5825, cannonScale: 3.0, cannonOriginY: 0.5, 
            towerXPercentage: 0.62, towerYPercentage: 0.60, towerTopOffset: 0,
            cannonPenetrationIntoTower: 0, 
            towerScaleAdjust: 0.4 
        },
        {
        name: 'Torre & Canhão Direito (D)',
            cannonXPercentage: 0.8578, cannonYPercentage: 0.4844, cannonScale: 3.0, cannonOriginY: 0.5, 
            towerXPercentage: 0.82, towerYPercentage: 0.50, towerTopOffset: 0,
            cannonPenetrationIntoTower: 0, 
            towerScaleAdjust: 0.4 
        }
    ];

    // Reinicialização de 'cannons' e 'this.towers'
    cannons = [];
    this.towers = []; // towers deve ser uma propriedade da cena para ser acessível em outras funções da cena

    towerAndCannonDefinitions.forEach((config) => {
        // 1. Criar e posicionar a Torre
        const towerY = this.cameras.main.height - 50; // Ajuste a altura da torre para ficar visível acima da silhueta se necessário
        const towerX = Math.round(this.cameras.main.width * config.towerXPercentage);

        const tower = this.add.image(towerX, towerY, 'torre').setOrigin(0.5, 1);
        tower.setScale(config.towerScaleAdjust);

        // 2. Criar e posicionar o Canhão
        const cannonX = Math.round(this.cameras.main.width * config.cannonXPercentage);
        const cannonY = tower.y - (tower.displayHeight / 2); // Posiciona o canhão no meio da torre para visualização (ajustar conforme imagem)

        const cannon = this.add.image(cannonX, cannonY, 'canhao');
        cannon.setScale(config.cannonScale);
        cannon.setOrigin(0.5, config.cannonOriginY);

        // --- DEPTHS ---
        cannon.setDepth(10); // Canhão mais na frente que a silhueta
        if (config.name === 'Torre & Canhão Esquerdo (E)') {
            tower.setDepth(25); // Torre da esquerda pode ser mais na frente
        } else {
            tower.setDepth(11); // Outras torres um pouco atrás do canhão
        }

        // Armazenar
        cannons.push({ sprite: cannon, x: cannon.x, y: cannon.y, tower: tower });
        this.towers.push(tower); // Adicionar torre à propriedade da cena
    });

    // Primeiro prédio
    spawnBuilding.call(this);

    // Iniciar onda de mísseis
    spawnWave.call(this);

    // Controles de toque/clique
    this.input.on('pointerdown', (pointer) => {
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
}

function spawnBuilding() {
    if (currentBuildingIndex >= 10) {
        currentState = 'gameover';
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Over\nTodos os Prédios Destruídos', { fontSize: '32px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        return;
    }
    // Posiciona o prédio na base da tela, em relação à altura da câmera
    currentBuilding = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.height * 0.85, this.cameras.main.width * 0.3, this.cameras.main.height * 0.2, buildingStates[0].color);
    currentBuilding.health = 3;
    currentBuilding.stateIndex = 0;
    currentBuilding.setDepth(1); // Ajuste a profundidade do prédio
}

function spawnWave() {
    waveCount++;
    for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const missile = this.add.rectangle(x, 0, 10, 30, 0x00ff00);
        missile.speed = 200 + waveCount * 50;
        missile.targetX = currentBuilding.x;
        missiles.push(missile);
    }
}

function fireAntiMissile(cannon, targetX, targetY) {
    const antiMissile = this.add.image(cannon.sprite.x, cannon.sprite.y, 'antimissile'); 
    antiMissile.setScale(0.5); 
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
        const angle = Phaser.Math.Angle.Between(missile.x, missile.y, missile.targetX, this.cameras.main.height);
        missile.x += Math.cos(angle) * missile.speed * (1 / 60);
        missile.y += Math.sin(angle) * missile.speed * (1 / 60);
        missile.rotation = angle + Math.PI / 2; 

        if (missile.y > this.cameras.main.height * 0.85) { // Chegou na altura do prédio
            missiles.splice(index, 1);
            missile.destroy();
            
            if (currentBuilding && currentBuilding.health > 0) {
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
    });

    antiMissiles.forEach((anti, index) => {
        // Colisão com mísseis inimigos (Ainda necessário aqui se o anti-míssil não explodir APENAS no alvo)
        missiles.forEach((missile, mIndex) => {
            // Verifica se ambos os mísseis estão ativos antes de checar colisão e destruir
            if (anti.active && missile.active && Phaser.Math.Distance.Between(anti.x, anti.y, missile.x, missile.y) < 20) {
                // Destrua ambos os mísseis e a explosão visual.
                antiMissiles.splice(index, 1);
                missiles.splice(mIndex, 1);
                anti.destroy();
                missile.destroy();
                this.onAntiMissileHit(anti.x, anti.y); 
            }
        });
    });

    // Rotação dos canhões
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
        } else if (currentBuilding) { 
            const angle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, currentBuilding.x, currentBuilding.y);
            cannon.sprite.rotation = angle + Math.PI / 2;
        }
    });

    // Nova onda se não houver mísseis inimigos
    if (missiles.length === 0) {
        spawnWave.call(this);
    }
}

// REMOVIDA A FUNÇÃO resizeCanvasDOM() E SUAS CHAMADAS!
// A lógica de escalonamento agora é TOTALMENTE gerida pelo Phaser.Scale.RESIZE.