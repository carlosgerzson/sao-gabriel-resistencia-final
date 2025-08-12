let cannons = [];
let missiles = [];
let killerMissiles = [];
let antiMissiles = [];
let currentLevel = 1;
const TOTAL_LEVELS = 10;
let destroyedCount = 0;
let preservedCount = 0;
let gameEnded = false;

const BASE_WIDTH = 900;
const BASE_HEIGHT = 1600;
const VERSION = "1.0 - 2025-08-11";

// Carregar progresso salvo no início
const savedProgress = JSON.parse(localStorage.getItem('gameProgress'));
if (savedProgress) {
    currentLevel = savedProgress.currentLevel || 1;
    destroyedCount = savedProgress.destroyedCount || 0;
    preservedCount = savedProgress.preservedCount || 0;
}

// Forçar início na fase 10 para testes  - APAGAR O COMENTAR - NÃO ESEQUEÇA
currentLevel = 10;
// ...existing code...

window.initPhaserGame = function () {
    const config = {
        type: Phaser.WEBGL,
        width: document.getElementById('gameContainer').offsetWidth,
        height: document.getElementById('gameContainer').offsetHeight,
        parent: 'gameContainerInner',
        scale: {
            mode: Phaser.Scale.HEIGHT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: document.getElementById('gameContainer').offsetWidth,
            height: document.getElementById('gameContainer').offsetHeight
        },
        scene: [BriefingScene, GameScene],
        transparent: true,
        render: {
            pixelArt: false,
            antialias: true
        }
    };
    new Phaser.Game(config);
    console.log("Jogo Phaser inicializado a partir do main.js - Versão: " + VERSION);
};

// -------- BriefingScene --------
class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    preload() {
        this.load.image('fundo1', 'assets/fundo1.png');
    }

    create() {
        const isAndroid = /Android/.test(navigator.userAgent);
        const visibleHeight = isAndroid ? window.innerHeight : this.cameras.main.height;

        this.fundo = this.add.image(0, 0, 'fundo1')
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.cameras.main.height);

        this.cameras.main.setBackgroundColor(0x00000000);
        console.log('Câmera fundo no create:', this.cameras.main.backgroundColor.rgba);

        const levelDescriptions = [
            "ALVO 1: CLUBE COMERCIAL! \n\nO calor das tardes no Clube Comercial, onde risos e amizades forjaram nossa história. Defenda-o, pois é o coração pulsante de nossa união que não pode se apagar.",
            "ALVO 2: MAÇONARIA! \n\nO silêncio sábio da Rocha Negra nr 1, onde segredos e irmandade tecem nossa herança. Defenda-a, pois é o farol da sabedoria que ilumina nossa união.",
            "ALVO 3: IGREJA DO GALO! \n\nO eco sagrado da Igreja do Galo, onde a fé ressoa entre pedra e história. Defenda-a, pois é o espírito vivo de nossa devoção que não pode silenciar.",
            "ALVO 4: MUSEU LOCAL! \n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "ALVO 5: TEATRO ANTIGO! \n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
            "ALVO 6: SOBRADO - BIBLIOTECA! \n\nA alma acolhedora do Sobrado, onde livros e música guardam nossos sonhos. Defenda-o, pois é o coração da cultura que pulsa em nossa memória.",
            "ALVO 7: IGREJA MATRIZ! \n\nA força serena da Igreja Matriz, onde a fé dos colonizadores ainda ecoa. Defenda-a, pois é o alicerce espiritual que sustenta nossa identidade.",
            "ALVO 8: PREFEITURA MUNICIPAL! \n\nO orgulho altivo da Prefeitura, onde a gestão abraça o povo das coxilhas. Defenda-a, pois é o batimento do progresso que não pode parar.",
            "ALVO 9: BANCO DA PROVÍNCIA! \n\nA memória do Banco da Província, onde o passado imperial forjou nossa riqueza. Defenda-o, pois é o eco de um legado que resiste ao tempo.",
            "ALVO 10: BANRISUL! \n\nA solidez do Banrisul, onde a economia gaúcha encontrou raízes. Defenda-o, pois é o pilar financeiro que fortalece nossa história."
        ];

        this.briefingText = this.add.text(this.scale.width / 2, visibleHeight / 2,
            levelDescriptions[currentLevel - 1],
            {
                fontFamily: 'VT323',
                fontSize: '49px',
                color: '#e9bb00',
                align: 'center',
                lineSpacing: 20,
                wordWrap: { width: this.scale.width * 0.8 }
            }
        ).setOrigin(0.5).setDepth(1200);
        this.briefingText.setAlpha(0);
        this.tweens.add({
            targets: this.briefingText,
            alpha: { from: 0, to: 1 },
            duration: 2000
        });
        console.log('briefingText Y (create):', this.briefingText.y);

        const actionY = this.briefingText.y + (this.briefingText.height / 2) + 60;
        this.actionText = this.add.text(this.scale.width / 2, actionY, "INICIAR", {
            fontFamily: 'VT323',
            fontSize: '49px',
            color: '#00FF00',
            decoration: 'underline'
        }).setOrigin(0.5, 0.5).setDepth(1201).setInteractive({ useHandCursor: true });

        this.actionText.on('pointerover', () => this.actionText.setColor('#FFFF00'));
        this.actionText.on('pointerout', () => this.actionText.setColor('#00FF00'));
        this.actionText.on('pointerdown', () => {
            this.time.delayedCall(100, () => this.scene.start('GameScene'), [], this);
        });

        this.input.on('pointerdown', () => this.game.canvas.focus());
        this.scale.on('resize', this.resize, this);
        this.resize();
        console.log('BriefingScene.create concluído');
    }

    resize() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        const minFontSize = 20;
        const isAndroid = /Android/.test(navigator.userAgent);
        const visibleHeight = isAndroid ? window.innerHeight : this.cameras.main.height;
        if (this.briefingText) {
            this.briefingText.setPosition(this.scale.width / 2, visibleHeight / 2);
            this.briefingText.setFontSize(Math.max(49 * baseScale, minFontSize) + 'px');
            this.briefingText.setWordWrapWidth(this.scale.width * 0.8);
            console.log('briefingText Y (resize):', this.briefingText.y);
        }
        if (this.actionText) {
            const actionY = this.briefingText.y + (this.briefingText.height / 2) + 60;
            this.actionText.setPosition(this.scale.width / 2, actionY);
            this.actionText.setFontSize(Math.max(49 * baseScale, minFontSize) + 'px');
            console.log('actionText Y (resize):', this.briefingText.y);
        }
    }
}

// -------- GameScene --------

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        let colorPrefix;
        if ([1, 4, 7, 10].includes(currentLevel)) colorPrefix = 'red';
        else if ([3, 6, 9].includes(currentLevel)) colorPrefix = 'yellow';
        else colorPrefix = 'blue';
        console.log(`Carregando assets para nível ${currentLevel}`);

        this.load.image(`fundo_${colorPrefix}`, `assets/fundo_${colorPrefix}.png`);
        this.load.image(`silhueta_urbana_${colorPrefix}`, `assets/silhueta_urbana_${colorPrefix}.png`);
        this.load.image(`torre_e_${colorPrefix}`, `assets/torre_e_${colorPrefix}.png`);
        this.load.image(`torre_c_${colorPrefix}`, `assets/torre_c_${colorPrefix}.png`);
        this.load.image(`torre_d_${colorPrefix}`, `assets/torre_d_${colorPrefix}.png`);
        this.load.image('canhao_e', 'assets/canhao_e.png');
        this.load.image('canhao_c', 'assets/canhao_c.png');
        this.load.image('canhao_d', 'assets/canhao_d.png');
        this.load.image('antimissile', 'assets/antimissile.png');
        this.load.audio('explosion_air', 'assets/explosion_air.mp3');
        this.load.audio('explosion_target', 'assets/explosion_target.mp3');
        this.load.audio('missileFall', 'assets/assobio.mp3'); // Adicionado o assobio
        this.load.image('nave', 'assets/nave.png'); // nave espacial

        const spriteNames = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'];
        spriteNames.forEach(name => {
            this.load.image(`chamas${name}`, `assets/chamas1/chamas${name}.png`);
        });

        this.levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.load.image(`${this.levelPrefix}_predio`, `${this.levelPrefix}_predio.png`);
        this.load.image(`${this.levelPrefix}_dano1`, `${this.levelPrefix}_dano1.png`);
        this.load.image(`${this.levelPrefix}_dano2`, `${this.levelPrefix}_dano2.png`);
        this.load.image(`${this.levelPrefix}_destruido`, `${this.levelPrefix}_destruido.png`);
        this.load.image(`${this.levelPrefix}_fundo`, `${this.levelPrefix}_fundo.png`);
        this.load.on('complete', () => {
            this.cameras.main.setBackgroundColor('#000000');
        });
    }

    create() {
        cannons = [];
        antiMissiles = [];
        gameEnded = false;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const visibleHeight = isMobile ? window.innerHeight : this.cameras.main.height;
        this.cameras.main.setSize(this.scale.width, visibleHeight);
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);

        let colorPrefix;
        if ([1, 4, 7, 10].includes(currentLevel)) colorPrefix = 'red';
        else if ([3, 6, 9].includes(currentLevel)) colorPrefix = 'yellow';
        else colorPrefix = 'blue';

        this.fundo = this.add.image(this.scale.width / 2, 0, `fundo_${colorPrefix}`)
            .setOrigin(0.5, 0)
            .setDisplaySize(this.scale.width, visibleHeight);

        this.timerText = this.add.text(20, 20, '01:00', {
            fontFamily: 'VT323',
            fontSize: '40px',
            color: '#FFFFFF'
        }).setOrigin(0, 0).setDepth(100);

        this.timeLeft = 60; // Ou 20 se você ajustou
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                let minutes = Math.floor(this.timeLeft / 60);
                let seconds = this.timeLeft % 60;
                this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                if (this.timeLeft <= 0) {
                    if (this.buildingHealth >= 2) {
                        this.endLevel(true);
                    } else {
                        this.endLevel(false);
                    }
                }
            },
            loop: true
        });

        const buildingWidth = 510 * baseScale;
        const buildingHeight = 550 * baseScale;
        this.buildingContainer = this.add.container(this.scale.width / 2, visibleHeight - buildingHeight - (50 * baseScale));
        this.buildingContainer.setSize(buildingWidth, buildingHeight);
        this.buildingContainer.setDepth(900);

        const fundoWidth = 604 * baseScale;
        this.buildingFundo = this.add.image(-buildingWidth / 2, buildingHeight, `${this.levelPrefix}_fundo`)
            .setOrigin(0, 1)
            .setScale(baseScale)
            .setDepth(900);
        this.buildingContainer.add(this.buildingFundo);

        const chamasSpriteHeight = 375 * baseScale;
        this.currentChamasSprite = this.add.sprite(0, buildingHeight - (50 * baseScale + 10), 'chamas101');
        this.buildingContainer.add(this.currentChamasSprite);
        this.currentChamasSprite.setDepth(910);
        this.currentChamasSprite.setScale(0.3 * baseScale);
        this.currentChamasSprite.setVisible(false);

        this.buildingPredio = this.add.image(0, buildingHeight, `${this.levelPrefix}_predio`)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(920)
            .setVisible(true);
        this.buildingContainer.add(this.buildingPredio);

        this.buildingDano1 = this.add.image(0, buildingHeight, `${this.levelPrefix}_dano1`)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(920)
            .setVisible(false);
        this.buildingContainer.add(this.buildingDano1);

        this.buildingDano2 = this.add.image(0, buildingHeight, `${this.levelPrefix}_dano2`)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(920)
            .setVisible(false);
        this.buildingContainer.add(this.buildingDano2);

        this.buildingDestruido = this.add.image(0, buildingHeight, `${this.levelPrefix}_destruido`)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(920)
            .setVisible(false);
        this.buildingContainer.add(this.buildingDestruido);

        this.buildingHealth = 3;

        this.silhuetaSprite = this.add.image(this.scale.width / 2, visibleHeight, `silhueta_urbana_${colorPrefix}`)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(25);

        const towerAndCannonDefinitions = [
            {
                name: 'Torre Esquerda',
                towerAsset: `torre_e_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.144,
                towerBaseY: visibleHeight,
                towerScale: baseScale,
                cannonAsset: 'canhao_e',
                cannonX: this.scale.width * 0.144,
                cannonY: visibleHeight - (this.textures.get(`torre_e_${colorPrefix}`).getSourceImage().height * baseScale * 0.9) + 11,
                cannonScale: baseScale
            },
            {
                name: 'Torre Central',
                towerAsset: `torre_c_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.65,
                towerBaseY: visibleHeight,
                towerScale: baseScale,
                cannonAsset: 'canhao_c',
                cannonX: this.scale.width * 0.65,
                cannonY: visibleHeight - (this.textures.get(`torre_c_${colorPrefix}`).getSourceImage().height * baseScale * 0.9),
                cannonScale: baseScale
            },
            {
                name: 'Torre Direita',
                towerAsset: `torre_d_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.881,
                towerBaseY: visibleHeight,
                towerScale: baseScale,
                cannonAsset: 'canhao_d',
                cannonX: this.scale.width * 0.881,
                cannonY: visibleHeight - (this.textures.get(`torre_d_${colorPrefix}`).getSourceImage().height * baseScale * 0.9),
                cannonScale: baseScale
            }
        ];

        this.allCannonsSprites = [];
        this.towers = [];
        this.allTowerSprites = [];

        towerAndCannonDefinitions.forEach((def, index) => {
            const towerDepth = (def.name === 'Torre Esquerda') ? 30 : 20;
            const tower = this.add.image(def.towerBaseX, def.towerBaseY, def.towerAsset)
                .setOrigin(0.5, 1)
                .setScale(def.towerScale)
                .setDepth(towerDepth);
            this.allTowerSprites.push({ sprite: tower, def: def });

            const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset)
                .setOrigin(0.5, 1)
                .setScale(def.cannonScale)
                .setDepth(15);
            this.allCannonsSprites.push({ sprite: cannon, def: def });

            cannons.push({ sprite: cannon, tower: tower });
            this.towers.push(tower);
        });

        // nave espacial - adição e configuração
        let naveShouldAppear = false;
        if (currentLevel >= 3 && currentLevel <= 10) naveShouldAppear = true; // Aparece da fase 3 em diante

        if (naveShouldAppear) {
            // Array para armazenar os mísseis da nave
            this.naveMissiles = [];

            // Aguarda entre 10 e 20 segundos para criar a nave
            const naveDelay = Phaser.Math.Between(10000, 20000); // entre 10 e 20 segundos

            this.time.delayedCall(naveDelay, () => {
                const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
                const naveWidth = 209 * baseScale;
                const naveHeight = 88 * baseScale;
                const naveY = 130 * baseScale;
                const naveStartX = -naveWidth;
                const naveEndX = this.scale.width + naveWidth;
                const naveSpeed = 6000; // ms para cruzar a tela

                // Cria a nave
                this.naveSprite = this.add.image(naveStartX, naveY, 'nave')
                    .setOrigin(0, 0.5)
                    .setScale(baseScale)
                    .setDepth(1100);

                // Contador de mísseis da nave
                let naveMissileCount = 0;
                const maxNaveMissiles = 5;

                // Tween para mover a nave
                this.tweens.add({
                    targets: this.naveSprite,
                    x: naveEndX,
                    duration: naveSpeed,
                    ease: 'Linear',
                    onUpdate: (tween, target) => {
                        // A cada 800ms, lança um míssil/bomba (até o limite)
                        if (
                            naveMissileCount < maxNaveMissiles &&
                            (!target.lastFire || this.time.now - target.lastFire > 800)
                        ) {
                            target.lastFire = this.time.now;
                            naveMissileCount++;

                            // Origem do míssil: ponta da nave
                            const missileStartX = target.x + naveWidth * 0.4;
                            const missileStartY = naveY + naveHeight * 0.45;
                            // Destino X aleatório em toda a largura da tela
                            const targetMissileX = Phaser.Math.Between(0, this.scale.width);
                            const targetMissileY = this.cameras.main.height - 300 * baseScale;

                            const missile = this.add.circle(missileStartX, missileStartY, 12 * baseScale, 0xff0000, 0.8)
                                .setStrokeStyle(4 * baseScale, 0xffffff, 1)
                                .setDepth(1099);

                            // Adiciona ao array de mísseis da nave
                            this.naveMissiles.push(missile);

                            // Calcula área de colisão do alvo
                            const collisionTopY = this.cameras.main.height - 315 * baseScale;
                            const collisionBottomY = collisionTopY + 50 * baseScale;
                            const collisionLeftX = this.scale.width / 2 - 255 * baseScale;
                            const collisionRightX = this.scale.width / 2 + 255 * baseScale;

                            this.tweens.add({
                                targets: missile,
                                x: targetMissileX,
                                y: targetMissileY,
                                duration: 5000,
                                ease: 'Linear',
                                onComplete: () => {
                                    if (!missile.active) return; // Só executa se o míssil não foi interceptado

                                    if (
                                        missile.x >= collisionLeftX &&
                                        missile.x <= collisionRightX &&
                                        missile.y >= collisionTopY &&
                                        missile.y <= collisionBottomY
                                    ) {
                                        this.onBuildingHit(missile.x, missile.y);
                                    } else {
                                        this.onMissileHit(missile.x, missile.y);
                                    }
                                    missile.destroy();
                                    const idx = this.naveMissiles.indexOf(missile);
                                    if (idx !== -1) this.naveMissiles.splice(idx, 1);
                                }
                            });
                        }
                    },
                    onComplete: () => {
                        this.naveSprite.destroy();
                    }
                });
            }, [], this);
        }

        this.waveCount = 0;

        const spriteNames = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'];
        const frames = spriteNames.map(name => ({ key: `chamas${name}` }));
        this.anims.create({
            key: 'chamasAnim',
            frames: frames,
            frameRate: 16,
            repeat: -1
        });

        this.time.addEvent({ delay: 2000, callback: this.spawnWave, callbackScope: this, loop: true });

        this.input.on('pointerdown', (pointer) => {
            console.log('Clique detectado');
            if (!gameEnded) {
                const gamePointerX = pointer.x;
                const gamePointerY = pointer.y;
                cannons.forEach(cannon => {
                    const cannonAngle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, gamePointerX, gamePointerY);
                    cannon.sprite.rotation = cannonAngle + Math.PI / 2;
                    //       if (Phaser.Math.Between(1, 5) === 1) { // Remove o currentLevel >= 3 pra testar em qualquer fase
                    //              this.fireKillerMissile(cannon, gamePointerX, gamePointerY);
                    //          } else {
                    this.fireAntiMissile(cannon, gamePointerX, gamePointerY);
                    //           }
                });
            }
            this.game.canvas.focus();
        });

        this.onAntiMissileHit = function (x, y, radius = 100 * baseScale) {
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 0.8);
            explosionCircle.setDepth(920);
            const explosionAnimationDuration = 500;
            this.tweens.add({
                targets: explosionCircle,
                radius: radius,
                alpha: 0,
                ease: 'Quadratic.Out',
                duration: explosionAnimationDuration,
                onComplete: () => {
                    explosionCircle.destroy();
                    this.handleExplosionCollision(x, y, radius + (50 * baseScale));
                }
            });
        }.bind(this);

        this.onMissileHit = function (x, y) {
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 1.0);
            explosionCircle.setDepth(930);
            const explosionVisualRadius = 250 * baseScale;
            const explosionAnimationDuration = 550;
            this.tweens.add({
                targets: explosionCircle,
                radius: explosionVisualRadius,
                alpha: 0,
                ease: 'Quadratic.Out',
                duration: explosionAnimationDuration,
                onComplete: () => {
                    explosionCircle.destroy();
                }
            });
        }.bind(this);

        this.onBuildingHit = function (x, y) {
            this.onMissileHit(x, y);
            try {
                this.sound.play('explosion_target');
            } catch (e) {
                console.error('Erro ao tocar explosion_target:', e);
            }
            this.time.delayedCall(500, () => {
                if (this.currentChamasSprite && this.currentChamasSprite.active) {
                    if (this.currentChamasSprite.visible) {
                        this.currentChamasSprite.stop();
                    }
                    this.currentChamasSprite.setVisible(true);
                    if (this.anims.get('chamasAnim')) {
                        this.currentChamasSprite.play('chamasAnim');
                    }
                }
                if (this.buildingHealth > 0) {
                    this.buildingHealth--;
                    this.updateBuildingVisibility();
                    if (this.buildingHealth === 0) {
                        this.time.delayedCall(1000, () => {
                            this.endLevel(false);
                        }, [], this);
                    }
                }
            }, [], this);
        }.bind(this);

        this.handleExplosionCollision = function (explosionX, explosionY, explosionRadius) {
            // Mísseis normais
            for (let i = missiles.length - 1; i >= 0; i--) {
                const missile = missiles[i];
                if (!missile || !missile.active) {
                    missiles.splice(i, 1);
                    continue;
                }
                const distance = Phaser.Math.Distance.Between(explosionX, explosionY, missile.x, missile.y);
                if (distance < explosionRadius) {
                    missile.destroy();
                    missiles.splice(i, 1);
                    this.sound.play('explosion_air');
                }
            }

            // Bomba matadora
            for (let i = killerMissiles.length - 1; i >= 0; i--) {
                const killer = killerMissiles[i];
                if (!killer || !killer.active) {
                    killerMissiles.splice(i, 1);
                    continue;
                }
                const distance = Phaser.Math.Distance.Between(explosionX, explosionY, killer.x, killer.y);
                if (distance < explosionRadius) {
                    killer.destroy();
                    killerMissiles.splice(i, 1);
                    this.sound.play('explosion_air');
                }
            }

            // Mísseis da nave
            if (this.naveMissiles) {
                for (let i = this.naveMissiles.length - 1; i >= 0; i--) {
                    const naveMissile = this.naveMissiles[i];
                    if (!naveMissile || !naveMissile.active) {
                        this.naveMissiles.splice(i, 1);
                        continue;
                    }
                    const distance = Phaser.Math.Distance.Between(explosionX, explosionY, naveMissile.x, naveMissile.y);
                    if (distance < explosionRadius) {
                        naveMissile.destroy();
                        this.naveMissiles.splice(i, 1);
                        this.sound.play('explosion_air');
                    }
                }
            }
        }.bind(this);
        this.resize = () => {
            const width = this.scale.width;
            const height = this.cameras.main.height;
            const baseScale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
            const buildingWidth = 510 * baseScale;
            const buildingHeight = 550 * baseScale;

            let containerY = height - buildingHeight - (50 * baseScale);
            this.buildingContainer.setPosition(width / 2, containerY);
            this.buildingContainer.setSize(buildingWidth, buildingHeight);

            if (this.buildingFundo) {
                this.buildingFundo.setScale(baseScale);
                this.buildingFundo.setPosition(-buildingWidth / 2, buildingHeight);
            }

            [this.buildingPredio, this.buildingDano1, this.buildingDano2, this.buildingDestruido].forEach(building => {
                if (building) {
                    const texture = this.textures.get(building.texture.key);
                    const sourceImage = texture.getSourceImage();
                    const naturalWidth = sourceImage.width;
                    const naturalHeight = sourceImage.height;
                    const displayWidth = 510 * baseScale;
                    const displayHeight = (naturalHeight / naturalWidth) * displayWidth;
                    building.setDisplaySize(displayWidth, displayHeight)
                        .setOrigin(0.5, 1)
                        .setPosition(0, buildingHeight);
                }
            });

            if (this.currentChamasSprite) {
                this.currentChamasSprite.setPosition(0, buildingHeight - (50 * baseScale + 20));
                this.currentChamasSprite.setScale(0.3 * baseScale);
            }

            if (this.allTowerSprites) {
                this.allTowerSprites.forEach(tower => {
                    if (tower.sprite.active) {
                        tower.sprite.setPosition(tower.def.towerBaseX, height);
                        tower.sprite.setScale(tower.def.towerScale);
                    }
                });
            }
            if (this.allCannonsSprites) {
                this.allCannonsSprites.forEach(cannon => {
                    if (cannon.sprite.active) {
                        cannon.sprite.setPosition(cannon.def.cannonX, cannon.def.cannonY);
                        cannon.sprite.setScale(cannon.def.cannonScale);
                    }
                });
            }

            if (this.timerText) {
                this.timerText.setPosition(20, 20);
                this.timerText.setFontSize(40 * baseScale);
            }

            if (missiles) {
                missiles.forEach(missile => {
                    if (missile && missile.active) {
                        missile.setSize(10 * baseScale, 30 * baseScale);
                        missile.targetX = Phaser.Math.Between(width / 2 - 255 * baseScale, width / 2 + 255 * baseScale);
                        missile.targetY = height - 315 * baseScale;
                    }
                });
            }
            if (antiMissiles) {
                antiMissiles.forEach(anti => {
                    if (anti && anti.active) {
                        anti.setSize(12 * baseScale, 76 * baseScale);
                    }
                });
            }
        };

        this.scale.on('resize', this.resize, this);
        this.resize();

        this.spawnWave = function () {
            if (!gameEnded && this.timeLeft > 0) {
                this.waveCount++;
                let missilesPerWave = 2 + Math.floor((currentLevel - 1) / 2); // Quantidade de mísseis por wave (aumenta com o nível)
                if (currentLevel === 2) missilesPerWave = 2; // Exceção para o nível 2
                const delayBetweenMissiles = 600;          // Intervalo (ms) entre cada míssil da mesma wave

                for (let i = 0; i < missilesPerWave; i++) {
                    this.time.delayedCall(i * delayBetweenMissiles, () => {
                        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
                        const spawnX = Phaser.Math.Between(0, this.scale.width);
                        const spawnY = 0;
                        const missile = this.add.rectangle(spawnX, spawnY, 10 * baseScale, 30 * baseScale, 0x00ff00);

                        // Teste diferentes velocidades:
                        // missile.speed = 70 + (currentLevel * 5) + (this.waveCount * 15); // fase + wave - escolha uma ou outra
                        missile.speed = 70 + (currentLevel * 5); // só fase
                        // missile.speed = 70 + (this.waveCount * 15); // só wave

                        missile.targetX = Phaser.Math.Between(this.scale.width / 2 - 255 * baseScale, this.scale.width / 2 + 255 * baseScale);
                        missile.targetY = this.scale.height - 315 * baseScale;
                        missile.setDepth(1000);
                        missile.setActive(true);
                        missile.setVisible(true);
                        missiles.push(missile);
                    }, [], this);
                }
            }
        }.bind(this);


        this.time.addEvent({ delay: 2000, callback: this.spawnWave, callbackScope: this, loop: true }); // a cada 2 segundos uma nova wave

        // Evento de bomba matadora única ao iniciar a fase (dificuldade crescente)
        let killerChance;
        if (currentLevel <= 3) killerChance = 2;        // Fases 1-3: 1 em 8 (12,5%)
        else if (currentLevel <= 7) killerChance = 4;   // Fases 4-7: 1 em 4 (25%)
        else killerChance = 2;                          // Fases 8-10: 1 em 2 (50%)

        if (!gameEnded && Phaser.Math.Between(1, killerChance) === 1) {
            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
            const spawnX = Phaser.Math.Between(0, this.scale.width);
            const spawnY = 0;
            const killerRadius = 15 * baseScale;
            const killerMissile = this.add.circle(spawnX, spawnY, killerRadius, 0xff0000, 0.7)
                .setStrokeStyle(4, 0xffffff, 1)
                .setDepth(1000);
            killerMissiles.push(killerMissile);

            const sound = this.sound.add('missileFall', { volume: 0.5 });
            sound.play();

            const targetX = this.buildingContainer.x;
            const targetY = this.scale.height - 315 * baseScale;

            let trailGraphics = this.add.graphics({ x: 0, y: 0 }).setDepth(999);

            this.tweens.add({
                targets: killerMissile,
                x: targetX,
                y: targetY,
                duration: 4000,
                ease: 'Linear',
                onUpdate: (tween, target) => {
                    trailGraphics.clear();
                    const trailLength = 580 * baseScale;
                    const angle = Phaser.Math.Angle.Between(spawnX, spawnY, target.x, target.y);
                    const x1 = target.x - Math.cos(angle) * trailLength;
                    const y1 = target.y - Math.sin(angle) * trailLength;
                    const x2 = target.x;
                    const y2 = target.y;
                    trailGraphics.lineStyle(4, 0xffffff, 0.9 * (1 - tween.progress));
                    trailGraphics.lineBetween(x1, y1, x2, y2);
                },
                onComplete: () => {
                    if (!killerMissile.active) return; // Só executa se não foi interceptada
                    if (trailGraphics) trailGraphics.destroy();
                    if (sound && sound.isPlaying) sound.stop();
                    this.buildingHealth = 1;
                    this.updateBuildingVisibility();
                    this.onBuildingHit(targetX, targetY);
                    if (killerMissile) killerMissile.destroy();
                },
                onStop: () => {
                    if (trailGraphics) trailGraphics.destroy();
                    if (sound && sound.isPlaying) sound.stop();
                    if (killerMissile) killerMissile.destroy();
                }
            });
        }

        this.fireAntiMissile = function (cannon, targetGameX, targetGameY) {
            if (!gameEnded) {
                const launchX = cannon.sprite.x;
                const launchY = cannon.sprite.y;
                const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
                const antiMissile = this.add.image(launchX, launchY, 'antimissile')
                    .setOrigin(0.5, 1)
                    .setScale(baseScale)
                    .setDepth(5);
                antiMissiles.push(antiMissile);

                const antiMissileHeight = 76 * baseScale; // base original 76
                const angle = Phaser.Math.Angle.Between(launchX, launchY, targetGameX, targetGameY);
                const offsetX = Math.cos(angle) * (antiMissileHeight / 2);
                const offsetY = Math.sin(angle) * (antiMissileHeight / 2);
                const finalX = targetGameX - offsetX;
                const finalY = targetGameY - offsetY;
                const duration = 650;

                this.tweens.add({
                    targets: antiMissile,
                    x: finalX,
                    y: finalY,
                    duration: duration,
                    ease: 'Linear',
                    onUpdate: (tween, target) => {
                        const currentAngle = Phaser.Math.Angle.Between(target.x, target.y, targetGameX, targetGameY);
                        target.rotation = currentAngle + Math.PI / 2;

                        // Calcula progresso da distância
                        const totalDistance = Phaser.Math.Distance.Between(launchX, launchY, finalX, finalY);
                        const currentDistance = Phaser.Math.Distance.Between(target.x, target.y, finalX, finalY);
                        const progress = 1 - (currentDistance / totalDistance);

                        // Quando passar de 97%, reduz opacidade
                        if (progress > 0.90) {
                            target.setAlpha(0.0); // ou outro valor desejado
                        } else {
                            target.setAlpha(1);
                        }

                        if (!antiMissile.destroyed && currentDistance < 2) {
                            this.onAntiMissileHit(target.x, target.y);
                            antiMissile.destroy();
                            antiMissile.destroyed = true;
                            tween.stop();
                        }
                    }
                });
            }
        }.bind(this);

        this.updateBuildingVisibility = function () {
            this.buildingPredio.setVisible(this.buildingHealth === 3);
            this.buildingDano1.setVisible(this.buildingHealth === 2);
            this.buildingDano2.setVisible(this.buildingHealth === 1);
            this.buildingDestruido.setVisible(this.buildingHealth === 0);
        }.bind(this);

        this.endLevel = function (success) {
            this.time.removeAllEvents();
            gameEnded = true;
            missiles.forEach(missile => {
                if (missile.active) missile.setActive(false).setVisible(false);
            });
            antiMissiles.forEach(anti => {
                if (anti.active) anti.setActive(false).setVisible(false);
            });

            if (success) {
                preservedCount++;
            } else {
                destroyedCount++;
            }

            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
            const minFontSize = 20;

            const victoryMessages = [
                "Parabéns!\nVocê protegeu o patrimônio histórico!",
                "Excelente defesa!\nA cidade agradece!",
                "Missão cumprida!\nPrepare-se para o próximo desafio!",
                "Você é o guardião da história!\nContinue assim!",
                "Ótimo trabalho!\nVamos para o próximo alvo!"
            ];

            const defeatMessages = [
                "Não desista!\nTente novamente e salve o patrimônio!",
                "A resistência continua!\nVocê consegue!",
                "O desafio é grande,\nmas sua coragem é maior!",
                "Reforce sua defesa\nE tente outra vez!",
                "A cidade conta com você!\nPersista!"
            ];

            // Mensagem especial para vitória na fase 10
            const finalVictoryMessage =
                "Parabéns, Guardião!\nVocê defendeu\ntodos os patrimônios históricos\nde São Gabriel!\nA cidade agradece sua coragem e dedicação!";

            // Escolha a mensagem adequada
            const resultDetailMessage = (currentLevel === TOTAL_LEVELS && success)
                ? finalVictoryMessage
                : (success
                    ? victoryMessages[Phaser.Math.Between(0, victoryMessages.length - 1)]
                    : defeatMessages[Phaser.Math.Between(0, defeatMessages.length - 1)]);

            // Exibe a mensagem motivacional ou especial
            this.statsText = this.add.text(this.scale.width / 2, this.scale.height * 0.30,
                resultDetailMessage,
                {
                    fontFamily: 'VT323',
                    fontSize: Math.max(50 * baseScale, minFontSize) + 'px',
                    color: '#FFFFFF',
                    align: 'center',
                    lineSpacing: 20,
                    wordWrap: { width: this.scale.width * 0.8 }
                }
            ).setOrigin(0.5).setDepth(1501);
            this.statsText.setAlpha(0);
            this.tweens.add({
                targets: this.statsText,
                alpha: { from: 0, to: 1 },
                duration: 1000
            });

            const continueButtonY = this.statsText.y + (this.statsText.height / 2) + 60;
            const buttonText = (currentLevel === TOTAL_LEVELS) ? 'REINICIAR' : (success ? 'CONTINUAR' : 'RECOMEÇAR');
            const buttonColor = (currentLevel === TOTAL_LEVELS) ? 0xFF5722 : (success ? 0xFFC107 : 0xFF5722);

            this.continueButton = this.add.rectangle(this.scale.width / 2, continueButtonY, 200 * baseScale, 80 * baseScale, buttonColor)
                .setStrokeStyle(2 * baseScale, 0xFFFFFF)
                .setDepth(2000)
                .setInteractive({ useHandCursor: true });

            this.continueText = this.add.text(this.scale.width / 2, continueButtonY, buttonText, {
                fontFamily: 'VT323',
                fontSize: Math.max(30 * baseScale, minFontSize) + 'px',
                color: '#000000'
            }).setOrigin(0.5).setDepth(2001);

            const updateButtonState = (button, text, hover) => {
                button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || buttonColor, 1);
                text.setColor(hover ? '#000000ff' : '#000000');
            };

            this.continueButton.defaultFillColor = buttonColor;
            this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
            this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
            this.continueButton.on('pointerdown', () => {
                this.continueButton.setFillStyle(buttonColor, 1);
                this.continueText.setColor('#000000');
                this.time.delayedCall(100, () => {
                    if (currentLevel === TOTAL_LEVELS) {
                        destroyedCount = 0;
                        preservedCount = 0;
                        currentLevel = 1;
                        localStorage.removeItem('gameProgress');
                        gameEnded = false;
                        this.scene.start('BriefingScene');
                    } else {
                        if (success) {
                            currentLevel++;
                        } else {
                            gameEnded = false;
                        }
                        this.scene.start('BriefingScene');
                    }
                }, [], this);
            });

            // Botão SALVAR só aparece se não for a última fase e houver sucesso
            if (success && currentLevel < TOTAL_LEVELS) {
                this.saveButton = this.add.rectangle(this.scale.width / 2, continueButtonY + 100 * baseScale, 200 * baseScale, 80 * baseScale, 0x2196F3)
                    .setStrokeStyle(2 * baseScale, 0xFFFFFF)
                    .setDepth(2000)
                    .setInteractive({ useHandCursor: true });

                this.saveText = this.add.text(this.scale.width / 2, continueButtonY + 100 * baseScale, 'SALVAR', {
                    fontFamily: 'VT323',
                    fontSize: Math.max(30 * baseScale, minFontSize) + 'px',
                    color: '#000000'
                }).setOrigin(0.5).setDepth(2001);

                this.saveButton.defaultFillColor = 0x2196F3;
                this.saveButton.on('pointerover', () => updateButtonState(this.saveButton, this.saveText, true), this);
                this.saveButton.on('pointerout', () => updateButtonState(this.saveButton, this.saveText, false), this);
                this.saveButton.on('pointerdown', () => {
                    localStorage.setItem('gameProgress', JSON.stringify({ currentLevel, destroyedCount, preservedCount }));
                    this.saveText.setText('SALVO!');
                    this.time.delayedCall(1000, () => this.saveText.setText('SALVAR'), [], this);
                });
            }

            // RESETAR sempre aparece
            this.resetButton = this.add.rectangle(this.scale.width / 2, continueButtonY + 200 * baseScale, 200 * baseScale, 80 * baseScale, 0xFF5722)
                .setStrokeStyle(2 * baseScale, 0xFFFFFF)
                .setDepth(2000)
                .setInteractive({ useHandCursor: true });

            this.resetText = this.add.text(this.scale.width / 2, continueButtonY + 200 * baseScale, 'RESETAR', {
                fontFamily: 'VT323',
                fontSize: Math.max(30 * baseScale, minFontSize) + 'px',
                color: '#000000'
            }).setOrigin(0.5).setDepth(2001);

            this.resetButton.defaultFillColor = 0xFF5722;
            this.resetButton.on('pointerover', () => updateButtonState(this.resetButton, this.resetText, true), this);
            this.resetButton.on('pointerout', () => updateButtonState(this.resetButton, this.resetText, false), this);
            this.resetButton.on('pointerdown', () => {
                this.resetButton.setFillStyle(0xFF5722, 1);
                this.resetText.setColor('#000000');
                this.time.delayedCall(100, () => {
                    destroyedCount = 0;
                    preservedCount = 0;
                    currentLevel = 1;
                    localStorage.removeItem('gameProgress');
                    gameEnded = false;
                    this.scene.start('BriefingScene');
                }, [], this);
            });
        }.bind(this);

        this.update = function () {
            if (gameEnded) return;
            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
            const isAndroid = /Android/.test(navigator.userAgent);
            const visibleHeight = isAndroid ? window.innerHeight : this.cameras.main.height;
            const collisionTopY = visibleHeight - 315 * baseScale;
            const collisionBottomY = collisionTopY + 50 * baseScale;
            const collisionLeftX = this.scale.width / 2 - 255 * baseScale;
            const collisionRightX = this.scale.width / 2 + 255 * baseScale;

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

                if (missile.y >= collisionTopY && missile.y <= collisionBottomY && missile.x >= collisionLeftX && missile.x <= collisionRightX) {
                    this.onBuildingHit(missile.x, missile.y);
                    missile.destroy();
                    missiles.splice(i, 1);
                } else if (missile.y > this.scale.height) {
                    missile.destroy();
                    missiles.splice(i, 1);
                }
            }

            if (missiles.length === 0 && this.timeLeft > 0) {
                this.spawnWave();
            }
        }.bind(this);
    }
}