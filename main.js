let cannons = [];
let missiles = [];
let antiMissiles = [];
let currentLevel = 1;
const TOTAL_LEVELS = 10;
let destroyedCount = 0;
let preservedCount = 0;
let gameEnded = false;

const BASE_WIDTH = 900;
const BASE_HEIGHT = 1600;
const VERSION = "1.0 - 2025-07-27";

// Função para inicializar o Phaser
window.initPhaserGame = function () {
    const config = {
        type: Phaser.WEBGL,
        width: document.getElementById('gameContainer').offsetWidth, // 482px
        height: document.getElementById('gameContainer').offsetHeight, // 857px
        parent: 'gameContainerInner',
        scale: {
            mode: Phaser.Scale.HEIGHT, // Prioriza a altura total
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
        this.load.image('fundo1', 'assets/fundo1.png'); // Carrega fundo1.png
    }

    create() {
        const isAndroid = /Android/.test(navigator.userAgent);
        const visibleHeight = isAndroid ? window.innerHeight : this.cameras.main.height;

        // Fundo com fundo1.png (substitui gradiente e stars)
        this.fundo = this.add.image(0, 0, 'fundo1')
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.cameras.main.height);

        // Transparência da câmera
        this.cameras.main.setBackgroundColor(0x00000000);
        console.log('Câmera fundo no create:', this.cameras.main.backgroundColor.rgba);

        const levelDescriptions = [
            "ALVO 1: CLUBE COMERCIAL! \n\n" +
            "O calor das tardes no Clube Comercial, onde risos e amizades forjaram nossa história. Defenda-o, pois é o coração pulsante de nossa união que não pode se apagar.",
            "ALVO 2: MAÇONARIA! \n\n" +
            "O silêncio sábio da Rocha Negra nr 1, onde segredos e irmandade tecem nossa herança. Defenda-a, pois é o farol da sabedoria que ilumina nossa união.",
            "ALVO 3: IGREJA DO GALO! \n\n" +
            "O eco sagrado da Igreja do Galo, onde a fé ressoa entre pedra e história. Defenda-a, pois é o espírito vivo de nossa devoção que não pode silenciar.",
            "ALVO 4: MUSEU LOCAL! \n\n" +
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "ALVO 5: TEATRO ANTIGO! \n\n" +
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
            "ALVO 6: SOBRADO - BIBLIOTECA! \n\n" +
            "A alma acolhedora do Sobrado, onde livros e música guardam nossos sonhos. Defenda-o, pois é o coração da cultura que pulsa em nossa memória.",
            "ALVO 7: IGREJA MATRIZ! \n\n" +
            "A força serena da Igreja Matriz, onde a fé dos colonizadores ainda ecoa. Defenda-a, pois é o alicerce espiritual que sustenta nossa identidade.",
            "ALVO 8: PREFEITURA MUNICIPAL! \n\n" +
            "O orgulho altivo da Prefeitura, onde a gestão abraça o povo das coxilhas. Defenda-a, pois é o batimento do progresso que não pode parar.",
            "ALVO 9: BANCO DA PROVÍNCIA! \n\n" +
            "A memória do Banco da Província, onde o passado imperial forjou nossa riqueza. Defenda-o, pois é o eco de um legado que resiste ao tempo.",
            "ALVO 10: BANRISUL! \n\n" +
            "A solidez do Banrisul, onde a economia gaúcha encontrou raízes. Defenda-o, pois é o pilar financeiro que fortalece nossa história."
        ];

        // Texto com seta (restaurado ao original)
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

        // Posicionar "INICIAR" como link abaixo do texto (restaurado)
        const actionY = this.briefingText.y + (this.briefingText.height / 2) + 60;
        this.actionText = this.add.text(this.scale.width / 2, actionY, "INICIAR", {
            fontFamily: 'VT323',
            fontSize: '49px',
            color: '#00FF00',
            decoration: 'underline'
        }).setOrigin(0.5, 0.5).setDepth(1201).setInteractive({ useHandCursor: true });

        this.actionText.on('pointerover', () => {
            this.actionText.setColor('#FFFF00');
        });
        this.actionText.on('pointerout', () => {
            this.actionText.setColor('#00FF00');
        });
        this.actionText.on('pointerdown', () => {
            this.time.delayedCall(100, () => {
                this.scene.start('GameScene');
            }, [], this);
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
        // Carrega os fundos PNGs com base no nível
        let colorPrefix;
        if ([1, 4, 7, 10].includes(currentLevel)) colorPrefix = 'red';
        else if ([3, 6, 9].includes(currentLevel)) colorPrefix = 'yellow';
        else colorPrefix = 'blue';
        console.log(`Carregando assets para nível ${currentLevel}`);

        this.load.image(`fundo_${colorPrefix}`, `assets/fundo_${colorPrefix}.png`); // Fundo PNG
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
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const visibleHeight = isMobile ? window.innerHeight : this.cameras.main.height; // Usa altura real do celular
        this.cameras.main.setSize(this.scale.width, visibleHeight);
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);

        // Determinar cor com base no nível
        let colorPrefix;
        if ([1, 4, 7, 10].includes(currentLevel)) colorPrefix = 'red';
        else if ([3, 6, 9].includes(currentLevel)) colorPrefix = 'yellow';
        else colorPrefix = 'blue';

        // Fundo PNG substitui os gradients
        this.fundo = this.add.image(this.scale.width / 2, 0, `fundo_${colorPrefix}`)
            .setOrigin(0.5, 0)
            .setDisplaySize(this.scale.width, visibleHeight);

        this.timerText = this.add.text(20, 20, '00:20', {
            fontFamily: 'VT323',
            fontSize: '40px',
            color: '#FFFFFF'
        }).setOrigin(0, 0).setDepth(100);

        this.timeLeft = 20;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                let minutes = Math.floor(this.timeLeft / 60);
                let seconds = this.timeLeft % 60;
                this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                if (this.timeLeft <= 0) {
                    if (this.buildingState < 3) {
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
        this.buildingContainer = this.add.container(this.scale.width / 2, visibleHeight - buildingHeight - (50 * baseScale)); // Alterado de 48px para 50px
        this.buildingContainer.setSize(buildingWidth, buildingHeight);
        this.buildingContainer.setDepth(900);

        // Fundo (sombra) alinhado pelo bottom esquerdo do container
        const fundoWidth = 604 * baseScale;
        const background = this.add.image(-buildingWidth / 2, buildingHeight, `${this.levelPrefix}_fundo`)
            .setOrigin(0, 1)
            .setScale(baseScale);
        background.setDepth(900);
        this.buildingContainer.add(background);

        // Console para inspecionar fundo (shadow)
        console.log(`Nível ${currentLevel} - Fundo: x=${background.x}, y=${background.y}, width=${fundoWidth}, scale=${background.scaleX}`);

        // Chamas
        const chamasSpriteHeight = 375 * baseScale;
        this.currentChamasSprite = this.add.sprite(0, buildingHeight - (50 * baseScale + 10), 'chamas101'); // Alterado de 48px para 50px
        this.buildingContainer.add(this.currentChamasSprite);
        this.currentChamasSprite.setDepth(910);
        this.currentChamasSprite.setScale(0.3 * baseScale);
        this.currentChamasSprite.setVisible(false);

        // Prédio centralizado
        this.building = this.add.image(0, buildingHeight, `${this.levelPrefix}_predio`)
            .setOrigin(0.5, 1)
            .setScale(baseScale);
        this.building.setDepth(920);
        this.buildingContainer.add(this.building);

        // Console para inspecionar prédio
        console.log(`Nível ${currentLevel} - Prédio: x=${this.building.x}, y=${this.building.y}, width=${buildingWidth}, scale=${this.building.scaleX}`);

        // Ajuste da silhueta e torres no bottom
        this.silhuetaSprite = this.add.image(this.scale.width / 2, visibleHeight, `silhueta_urbana_${colorPrefix}`)
            .setOrigin(0.5, 1) // Alinha ao bottom
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
                .setOrigin(0.5, 1) // Alinha ao bottom
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

        this.buildingState = 0;
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
                    this.fireAntiMissile(cannon, gamePointerX, gamePointerY);
                });
            }
            this.game.canvas.focus();
        });

        this.onAntiMissileHit = function (x, y) {
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 0.8);
            explosionCircle.setDepth(920);
            const explosionVisualRadius = 100 * baseScale;
            const explosionAnimationDuration = 500;
            this.tweens.add({
                targets: explosionCircle,
                radius: explosionVisualRadius,
                alpha: 0,
                ease: 'Quadratic.Out',
                duration: explosionAnimationDuration,
                onComplete: () => {
                    explosionCircle.destroy();
                    this.handleExplosionCollision(x, y, explosionVisualRadius + (50 * baseScale));
                }
            });
        }.bind(this);

        this.onMissileHit = function (x, y) {
            console.log(`Explosão em x: ${x}, y: ${y}`);
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
            console.log(`Colisão detectada em x: ${x}, y: ${y}`);
            this.onMissileHit(x, y);
            try {
                this.sound.play('explosion_target');
                console.log('Som explosion_target tocado');
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

                if (this.buildingState < 3) {
                    this.buildingState++;
                    this.updateBuildingState(`nivel${currentLevel}/alvo${currentLevel}`);
                    if (this.buildingState === 3) {
                        this.time.delayedCall(1000, () => { // Delay de 1 segundo após "destruído"
                            this.endLevel(false);
                        }, [], this);
                    }
                }
            }, [], this);
        }.bind(this);

        this.handleExplosionCollision = function (explosionX, explosionY, explosionRadius) {
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
        }.bind(this);

        this.resize = () => {
            const width = this.scale.width;
            const height = this.cameras.main.height;
            const baseScale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
            const buildingWidth = 510 * baseScale;
            const buildingHeight = 550 * baseScale;

            // Reposiciona o container centralizado
            let containerY = height - buildingHeight - (50 * baseScale); // Alterado de 48px para 50px
            this.buildingContainer.setPosition(width / 2, containerY);
            this.buildingContainer.setSize(buildingWidth, buildingHeight);

            // Fundo (sombra) alinhado pelo bottom esquerdo
            const background = this.buildingContainer.getAt(0);
            if (background) {
                background.setScale(baseScale);
                background.setPosition(-buildingWidth / 2, buildingHeight);
            }

            // Prédio centralizado
            if (this.building) {
                this.building.setScale(baseScale);
                this.building.setPosition(0, buildingHeight);
            }

            // Chamas centralizadas
            if (this.currentChamasSprite) {
                this.currentChamasSprite.setPosition(0, buildingHeight - (50 * baseScale + 20)); // Alterado de 48px para 50px
                this.currentChamasSprite.setScale(0.3 * baseScale);
            }

            if (this.allTowerSprites) {
                this.allTowerSprites.forEach(tower => {
                    if (tower.sprite.active) {
                        tower.sprite.setPosition(tower.def.towerBaseX, visibleHeight);
                        console.log('Torre Y:', tower.sprite.y);
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
                        missile.targetY = visibleHeight - 315 * baseScale;
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
    }

    spawnWave() {
        if (!gameEnded) {
            this.waveCount++;
            const baseSpeed = 70;
            const speedIncrementPerWave = 20;
            const delayBetweenMissiles = 800;
            for (let i = 0; i < 2; i++) {
                this.time.delayedCall(i * delayBetweenMissiles, () => {
                    const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
                    const spawnX = Phaser.Math.Between(0, this.scale.width);
                    const spawnY = 0;
                    const missile = this.add.rectangle(spawnX, spawnY, 10 * baseScale, 30 * baseScale, 0x00ff00);
                    missile.speed = baseSpeed + this.waveCount * speedIncrementPerWave;
                    missile.targetX = Phaser.Math.Between(this.scale.width / 2 - 255 * baseScale, this.scale.width / 2 + 255 * baseScale);
                    missile.targetY = this.scale.height - 315 * baseScale;
                    missile.setDepth(1000);
                    missile.setActive(true);
                    missile.setVisible(true);
                    missiles.push(missile);
                }, [], this);
            }
        }
    }

    fireAntiMissile(cannon, targetGameX, targetGameY) {
        if (!gameEnded) {
            const launchX = cannon.sprite.x;
            const launchY = cannon.sprite.y;
            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
            const antiMissile = this.add.image(launchX, launchY, 'antimissile')
                .setOrigin(0.5, 1)
                .setScale(baseScale)
                .setDepth(5);
            antiMissiles.push(antiMissile);
            this.tweens.add({
                targets: antiMissile,
                x: targetGameX,
                y: targetGameY,
                duration: 650,
                ease: 'Linear',
                onUpdate: (tween, target) => {
                    const currentAngle = Phaser.Math.Angle.Between(target.x, target.y, targetGameX, targetGameY);
                    target.rotation = currentAngle + Math.PI / 2;
                },
                onComplete: () => {
                    antiMissile.destroy();
                    this.onAntiMissileHit(targetGameX, targetGameY);
                }
            });
        }
    }

    updateBuildingState(levelPrefix) {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        const buildingWidth = 510 * baseScale;
        const key = this.buildingState === 1 ? `${levelPrefix}_dano1` : this.buildingState === 2 ? `${levelPrefix}_dano2` : `${levelPrefix}_destruido`;
        this.building.setTexture(key).setScale(baseScale);
        const scaledHeight = this.building.height * baseScale; // Corrige pra altura escalada
        const containerScaledHeight = this.buildingContainer.height;
        this.building.setPosition(0, containerScaledHeight);
        this.building.setDepth(920);
        this.buildingContainer.setSize(buildingWidth, containerScaledHeight);
        console.log(`Estado ${this.buildingState} (${key}), X: ${this.building.x}, Y: ${this.building.y}, Altura bruta: ${this.building.height}, Altura escalada: ${scaledHeight}, Container altura: ${containerScaledHeight}`);
    }

    endLevel(success) {
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
        this.resultText = this.add.text(this.scale.width / 2, this.scale.height * 0.25,
            currentLevel === TOTAL_LEVELS ? 'FIM DE JOGO' : success ? 'SUCESSO!' : 'FALHA!',
            {
                fontFamily: 'VT323',
                fontSize: Math.max(70 * baseScale, minFontSize) + 'px',
                color: currentLevel === TOTAL_LEVELS ? '#FFFFFF' : success ? '#00FF00' : '#FF0000',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(1500);
        this.resultText.setAlpha(0);
        this.tweens.add({
            targets: this.resultText,
            alpha: { from: 0, to: 1 },
            duration: 1000
        });

        this.statsText = this.add.text(this.scale.width / 2, this.scale.height * 0.30,
            `\nDestruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
            {
                fontFamily: 'VT323',
                fontSize: Math.max(60 * baseScale, minFontSize) + 'px',
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 20
            }
        ).setOrigin(0.5).setDepth(1501);
        this.statsText.setAlpha(0);
        this.tweens.add({
            targets: this.statsText,
            alpha: { from: 0, to: 1 },
            duration: 1000
        });

        const isAndroid = /Android/.test(navigator.userAgent);
        const continueButtonY = this.statsText.y + (this.statsText.height / 2) + 60;
        this.continueButton = this.add.rectangle(this.scale.width / 2, continueButtonY, 200 * baseScale, 80 * baseScale, 0xFFC107)
            .setStrokeStyle(2 * baseScale, 0xFFFFFF)
            .setDepth(2000)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, continueButtonY, currentLevel === TOTAL_LEVELS ? 'REINICIAR' : 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: Math.max(30 * baseScale, minFontSize) + 'px',
            color: '#000000'
        }).setOrigin(0.5).setDepth(2001);

        const updateButtonState = (button, text, hover) => {
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFC107, 1);
            text.setColor(hover ? '#000000ff' : '#000000');
        };

        this.continueButton.defaultFillColor = 0xFFC107;
        this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
        this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
        this.continueButton.on('pointerdown', () => {
            console.log('Botão clicado - pointerdown');
            this.continueButton.setFillStyle(0xFFC107, 1);
            this.continueText.setColor('#000000');
            this.time.delayedCall(100, () => {
                if (currentLevel < TOTAL_LEVELS) {
                    currentLevel++;
                    gameEnded = false;
                    this.scene.start('BriefingScene');
                } else {
                    destroyedCount = 0;
                    preservedCount = 0;
                    currentLevel = 1;
                    gameEnded = false;
                    this.scene.start('BriefingScene');
                }
            }, [], this);
        });
    }

    update() {
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

        if (missiles.length === 0 && this.waveCount < 5) {
            this.spawnWave();
        }
    }
}