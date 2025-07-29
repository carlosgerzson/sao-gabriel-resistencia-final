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
const VERSION = "1.5 - 2025-07-29";

// Função para inicializar o Phaser
window.initPhaserGame = function () {
    const isAndroid = /Android/.test(navigator.userAgent);
    const safeAreaTop = window.safeAreaInsets ? window.safeAreaInsets.top || 0 : 0;
    const safeAreaBottom = window.safeAreaInsets ? window.safeAreaInsets.bottom || 0 : (isAndroid ? 0 : 0); // No PC, usamos 0
    const adjustedHeight = window.innerHeight - safeAreaTop - safeAreaBottom;

    console.log("Inicialização: window.innerHeight:", window.innerHeight, "safeAreaTop:", safeAreaTop, "safeAreaBottom:", safeAreaBottom, "adjustedHeight:", adjustedHeight);

    const gameContainerInner = document.getElementById('gameContainerInner');
    if (!gameContainerInner) {
        console.error("Erro: gameContainerInner não encontrado!");
        return;
    }
    console.log("gameContainerInner dimensions:", gameContainerInner.offsetWidth, gameContainerInner.offsetHeight);

    if (gameContainerInner.offsetWidth === 0 || gameContainerInner.offsetHeight === 0) {
        console.error("Dimensões do gameContainerInner são 0! Verifique o CSS ou o DOM.");
        return;
    }

    const config = {
        type: Phaser.AUTO,
        width: gameContainerInner.offsetWidth,
        height: adjustedHeight,
        parent: 'gameContainerInner',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            expandParent: true
        },
        scene: [BriefingScene, GameScene],
        backgroundColor: '#000000ff',
        render: {
            pixelArt: false,
            antialias: true
        }
    };
    try {
        const game = new Phaser.Game(config);
        console.log("Jogo Phaser inicializado - Versão: " + VERSION);
    } catch (error) {
        console.error("Erro ao inicializar Phaser:", error);
    }
};

// -------- BriefingScene --------
class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    preload() {
        console.log("Iniciando preload para BriefingScene");
        this.load.image('fundo1', 'assets/fundo1.png');
        this.load.on('complete', () => {
            console.log("Preload completo para BriefingScene");
            this.cameras.main.setBackgroundColor('#000000');
        }, this);
        this.load.on('loaderror', (file) => {
            console.error("Erro ao carregar asset:", file.src);
        });
    }

    create() {
        console.log("Iniciando create para BriefingScene");
        const visibleHeight = this.sys.game.config.height;
        this.cameras.main.setSize(this.sys.game.config.width, visibleHeight);
        console.log("Camera size set to:", this.sys.game.config.width, visibleHeight);

        if (!this.textures.exists('fundo1')) {
            console.error("Textura 'fundo1' não carregada!");
            return;
        }

        this.fundo = this.add.image(this.sys.game.config.width / 2, 0, 'fundo1')
            .setOrigin(0.5, 0)
            .setDisplaySize(this.sys.game.config.width, visibleHeight);
        console.log("Fundo1 adicionado:", this.fundo.width, this.fundo.height);

        this.stars = [];
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.sys.game.config.width),
                Phaser.Math.Between(0, visibleHeight),
                Phaser.Math.Between(1, 3),
                0xFFFFFF
            ).setAlpha(Phaser.Math.FloatBetween(0.2, 1));
            this.stars.push(star);
        }

        const levelDescriptions = [
            "ALVO 1: CLUBE COMERCIAL! \n\n" +
            "O calor das tardes no Clube Comercial, onde risos e amizades forjaram nossa história. Defenda-o, pois é o coração pulsante de nossa união que não pode se apagar.",
            "ALVO 2: CENTRO CULTURAL! \n\n" +
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "ALVO 3: PRAÇA HISTÓRICA! \n\n" +
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            "ALVO 4: MUSEU LOCAL! \n\n" +
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "ALVO 5: TEATRO ANTIGO! \n\n" +
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
            "ALVO 6: IGREJA COLONIAL! \n\n" +
            "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
            "ALVO 7: MERCADO TRADICIONAL! \n\n" +
            "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.",
            "ALVO 8: PONTE VELHA! \n\n" +
            "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
            "ALVO 9: ESTAÇÃO FERROVIÁRIA! \n\n" +
            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
            "ALVO 10: CASA HISTÓRICA! \n\n" +
            "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat."
        ];

        this.briefingText = this.add.text(this.sys.game.config.width / 2, visibleHeight / 2,
            levelDescriptions[currentLevel - 1],
            {
                fontFamily: 'VT323',
                fontSize: '49px',
                color: '#e9bb00',
                align: 'center',
                lineSpacing: 20,
                wordWrap: { width: this.sys.game.config.width * 0.8 }
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
        this.actionText = this.add.text(this.sys.game.config.width / 2, actionY, "INICIAR", {
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
    }

    resize() {
        const visibleHeight = this.sys.game.config.height;
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, visibleHeight / BASE_HEIGHT);
        const minFontSize = 20;

        if (this.fundo) {
            this.fundo.setPosition(this.scale.width / 2, 0);
            this.fundo.setScale(baseScale).setDisplaySize(this.scale.width, visibleHeight);
        }
        if (this.stars) {
            this.stars.forEach(star => {
                if (star.active) {
                    star.x = Phaser.Math.Between(0, this.scale.width);
                    star.y = Phaser.Math.Between(0, visibleHeight);
                    star.setScale(baseScale);
                }
            });
        }
        if (this.briefingText) {
            let textY = visibleHeight / 2;
            this.briefingText.setPosition(this.scale.width / 2, textY);
            this.briefingText.setFontSize(Math.max(49 * baseScale, minFontSize) + 'px');
            this.briefingText.setWordWrapWidth(this.scale.width * 0.8);
        }
        if (this.actionText) {
            const actionY = this.briefingText.y + (this.briefingText.height / 2) + 60;
            this.actionText.setPosition(this.scale.width / 2, actionY);
            this.actionText.setFontSize(Math.max(49 * baseScale, minFontSize) + 'px');
        }
    }
}

// -------- GameScene --------
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        console.log("Iniciando preload para GameScene");
        let colorPrefix = [1, 4, 7, 10].includes(currentLevel) ? 'red' : [3, 6, 9].includes(currentLevel) ? 'yellow' : 'blue';
        console.log(`Carregando fundo_${colorPrefix}.png para nível ${currentLevel}`);

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

        const spriteNames = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'];
        spriteNames.forEach(name => this.load.image(`chamas${name}`, `assets/chamas1/chamas${name}.png`));

        this.levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.load.image(`${this.levelPrefix}_predio`, `${this.levelPrefix}_predio.png`);
        this.load.image(`${this.levelPrefix}_dano1`, `${this.levelPrefix}_dano1.png`);
        this.load.image(`${this.levelPrefix}_dano2`, `${this.levelPrefix}_dano2.png`);
        this.load.image(`${this.levelPrefix}_destruido`, `${this.levelPrefix}_destruido.png`);
        this.load.image(`${this.levelPrefix}_fundo`, `${this.levelPrefix}_fundo.png`);
        this.load.on('complete', () => {
            console.log("Preload completo para GameScene");
            this.cameras.main.setBackgroundColor('#000000');
        }, this);
        this.load.on('loaderror', (file) => {
            console.error("Erro ao carregar asset:", file.src);
        });
    }

    create() {
        console.log("Iniciando create para GameScene");
        const visibleHeight = this.sys.game.config.height;
        this.cameras.main.setSize(this.sys.game.config.width, visibleHeight);
        console.log("Camera size set to:", this.sys.game.config.width, visibleHeight);

        let colorPrefix = [1, 4, 7, 10].includes(currentLevel) ? 'red' : [3, 6, 9].includes(currentLevel) ? 'yellow' : 'blue';
        this.baseScale = Math.min(this.scale.width / BASE_WIDTH, visibleHeight / BASE_HEIGHT); // Definido aqui
        console.log("baseScale inicial:", this.baseScale);

        this.gameBackground = this.add.image(this.scale.width / 2, 0, `fundo_${colorPrefix}`)
            .setOrigin(0.5, 0)
            .setScale(this.baseScale)
            .setDisplaySize(this.scale.width, visibleHeight);
        console.log("GameBackground adicionado:", this.gameBackground.width, this.gameBackground.height);

        this.timerText = this.add.text(20, 20, '00:10', { fontFamily: 'VT323', fontSize: '40px', color: '#FFFFFF' })
            .setOrigin(0, 0).setDepth(100);

        this.timeLeft = 10;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                let minutes = Math.floor(this.timeLeft / 60);
                let seconds = this.timeLeft % 60;
                this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                if (this.timeLeft <= 0) {
                    if (this.buildingState < 3) this.endLevel(true);
                    else this.endLevel(false);
                }
            },
            loop: true
        });

        const buildingWidth = 510 * this.baseScale;
        const buildingHeight = 550 * this.baseScale;
        this.buildingContainer = this.add.container(this.scale.width / 2, visibleHeight - buildingHeight - (48 * this.baseScale));
        this.buildingContainer.setSize(buildingWidth, buildingHeight).setDepth(900);

        const background = this.add.image(0, buildingHeight, `${this.levelPrefix}_fundo`)
            .setOrigin(0.5, 1)
            .setScale(this.baseScale);
        background.setPosition(0, buildingHeight).setDepth(900);
        this.buildingContainer.add(background);

        const chamasSpriteHeight = 375 * this.baseScale;
        this.currentChamasSprite = this.add.sprite(0, buildingHeight - (48 * this.baseScale + 5), 'chamas101');
        this.buildingContainer.add(this.currentChamasSprite);
        this.currentChamasSprite.setDepth(910).setScale(0.3 * this.baseScale).setVisible(false);

        this.building = this.add.image(0, buildingHeight, `${this.levelPrefix}_predio`)
            .setOrigin(0.5, 1)
            .setScale(this.baseScale);
        this.building.setPosition(0, buildingHeight).setDepth(920);
        this.buildingContainer.add(this.building);

        this.silhuetaSprite = this.add.image(this.scale.width / 2, visibleHeight, `silhueta_urbana_${colorPrefix}`)
            .setOrigin(0.5, 1)
            .setScale(this.baseScale)
            .setDepth(25);

        const towerAndCannonDefinitions = [
            { name: 'Torre Esquerda', towerAsset: `torre_e_${colorPrefix}`, towerBaseX: this.scale.width * 0.144, towerBaseY: visibleHeight, towerScale: this.baseScale, cannonAsset: 'canhao_e', cannonX: this.scale.width * 0.144, cannonY: visibleHeight - (this.textures.get(`torre_e_${colorPrefix}`).getSourceImage().height * this.baseScale * 0.9) + 11, cannonScale: this.baseScale },
            { name: 'Torre Central', towerAsset: `torre_c_${colorPrefix}`, towerBaseX: this.scale.width * 0.65, towerBaseY: visibleHeight, towerScale: this.baseScale, cannonAsset: 'canhao_c', cannonX: this.scale.width * 0.65, cannonY: visibleHeight - (this.textures.get(`torre_c_${colorPrefix}`).getSourceImage().height * this.baseScale * 0.9), cannonScale: this.baseScale },
            { name: 'Torre Direita', towerAsset: `torre_d_${colorPrefix}`, towerBaseX: this.scale.width * 0.881, towerBaseY: visibleHeight, towerScale: this.baseScale, cannonAsset: 'canhao_d', cannonX: this.scale.width * 0.881, cannonY: visibleHeight - (this.textures.get(`torre_d_${colorPrefix}`).getSourceImage().height * this.baseScale * 0.9), cannonScale: this.baseScale }
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
            this.allTowerSprites.push({ sprite: tower, def });

            const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset)
                .setOrigin(0.5, 1)
                .setScale(def.cannonScale)
                .setDepth(15);
            this.allCannonsSprites.push({ sprite: cannon, def });

            cannons.push({ sprite: cannon, tower });
            this.towers.push(tower);
        });

        this.buildingState = 0;
        this.waveCount = 0;

        const spriteNames = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'];
        const frames = spriteNames.map(name => ({ key: `chamas${name}` }));
        this.anims.create({ key: 'chamasAnim', frames, frameRate: 16, repeat: -1 });

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
            const explosionVisualRadius = 100 * this.baseScale;
            const explosionAnimationDuration = 500;
            this.tweens.add({
                targets: explosionCircle,
                radius: explosionVisualRadius,
                alpha: 0,
                ease: 'Quadratic.Out',
                duration: explosionAnimationDuration,
                onComplete: () => {
                    explosionCircle.destroy();
                    this.handleExplosionCollision(x, y, explosionVisualRadius + (50 * this.baseScale));
                }
            });
        }.bind(this);

        this.onMissileHit = function (x, y) {
            console.log(`Explosão em x: ${x}, y: ${y}`);
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 1.0);
            explosionCircle.setDepth(930);
            const explosionVisualRadius = 250 * this.baseScale;
            const explosionAnimationDuration = 550;
            this.tweens.add({
                targets: explosionCircle,
                radius: explosionVisualRadius,
                alpha: 0,
                ease: 'Quadratic.Out',
                duration: explosionAnimationDuration,
                onComplete: () => explosionCircle.destroy()
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
                    if (this.currentChamasSprite.visible) this.currentChamasSprite.stop();
                    this.currentChamasSprite.setVisible(true);
                    if (this.anims.get('chamasAnim')) this.currentChamasSprite.play('chamasAnim');
                }
                if (this.buildingState < 3) {
                    this.buildingState++;
                    this.updateBuildingState(`nivel${currentLevel}/alvo${currentLevel}`);
                    if (this.buildingState === 3) this.endLevel(false);
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
            const visibleHeight = this.sys.game.config.height;
            const width = this.scale.width;
            const height = visibleHeight;
            console.log(`Resize: width=${width}, height=${height}`);

            this.baseScale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT); // Atualiza baseScale
            console.log("baseScale atualizado:", this.baseScale);

            if (this.gameBackground) {
                this.gameBackground.setPosition(width / 2, 0);
                this.gameBackground.setScale(this.baseScale).setDisplaySize(width, height);
            }
            if (this.silhuetaSprite) this.silhuetaSprite.setPosition(width / 2, height);
            if (this.buildingContainer) {
                const buildingHeight = 550 * this.baseScale;
                let containerY = height - buildingHeight - (48 * this.baseScale);
                this.buildingContainer.setPosition(width / 2, containerY);
                this.buildingContainer.setSize(510 * this.baseScale, buildingHeight);
                this.building.setScale(this.baseScale).setPosition(0, buildingHeight);
                const background = this.buildingContainer.getAt(0);
                if (background) background.setScale(this.baseScale);
            }
            if (this.currentChamasSprite) {
                const chamasSpriteHeight = 375 * this.baseScale;
                this.currentChamasSprite.setPosition(0, buildingHeight - (48 * this.baseScale + 5)).setScale(0.3 * this.baseScale);
            }
            if (this.allTowerSprites) this.allTowerSprites.forEach(tower => {
                if (tower.sprite.active) tower.sprite.setPosition(tower.def.towerBaseX, height).setScale(tower.def.towerScale);
            });
            if (this.allCannonsSprites) this.allCannonsSprites.forEach(cannon => {
                if (cannon.sprite.active) cannon.sprite.setPosition(cannon.def.cannonX, cannon.def.cannonY).setScale(cannon.def.cannonScale);
            });
            if (this.timerText) this.timerText.setPosition(20, 20).setFontSize(40 * this.baseScale);
            if (missiles) missiles.forEach(missile => {
                if (missile && missile.active) {
                    missile.setSize(10 * this.baseScale, 30 * this.baseScale);
                    missile.targetX = Phaser.Math.Between(width / 2 - 255 * this.baseScale, width / 2 + 255 * this.baseScale);
                    missile.targetY = height - 315 * this.baseScale;
                }
            });
            if (antiMissiles) antiMissiles.forEach(anti => {
                if (anti && anti.active) anti.setSize(12 * this.baseScale, 76 * this.baseScale);
            });
        };

        this.scale.on('resize', this.resize, this);
        this.resize();
    }

    spawnWave() {
        if (!gameEnded) {
            this.waveCount++;
            const baseSpeed = 70, speedIncrementPerWave = 20, delayBetweenMissiles = 800;
            for (let i = 0; i < 2; i++) {
                this.time.delayedCall(i * delayBetweenMissiles, () => {
                    const spawnX = Phaser.Math.Between(0, this.scale.width);
                    const spawnY = 0;
                    const missile = this.add.rectangle(spawnX, spawnY, 10 * this.baseScale, 30 * this.baseScale, 0x00ff00);
                    missile.speed = baseSpeed + this.waveCount * speedIncrementPerWave;
                    missile.targetX = Phaser.Math.Between(this.scale.width / 2 - 255 * this.baseScale, this.scale.width / 2 + 255 * this.baseScale);
                    missile.targetY = this.sys.game.config.height - 315 * this.baseScale;
                    missile.setDepth(1000).setActive(true).setVisible(true);
                    missiles.push(missile);
                }, [], this);
            }
        }
    }

    fireAntiMissile(cannon, targetGameX, targetGameY) {
        if (!gameEnded) {
            const launchX = cannon.sprite.x, launchY = cannon.sprite.y;
            const antiMissile = this.add.image(launchX, launchY, 'antimissile')
                .setOrigin(0.5, 1)
                .setScale(this.baseScale)
                .setDepth(5);
            antiMissiles.push(antiMissile);
            this.tweens.add({
                targets: antiMissile,
                x: targetGameX,
                y: targetGameY,
                duration: 650,
                ease: 'Linear',
                onUpdate: (tween, target) => target.rotation = Phaser.Math.Angle.Between(target.x, target.y, targetGameX, targetGameY) + Math.PI / 2,
                onComplete: () => {
                    antiMissile.destroy();
                    this.onAntiMissileHit(targetGameX, targetGameY);
                }
            });
        }
    }

    updateBuildingState(levelPrefix) {
        const buildingWidth = 510 * this.baseScale;
        const buildingHeight = 550 * this.baseScale;
        const key = this.buildingState === 1 ? `${levelPrefix}_dano1` : this.buildingState === 2 ? `${levelPrefix}_dano2` : `${levelPrefix}_destruido`;
        this.building.setTexture(key).setScale(this.baseScale).setPosition(0, buildingHeight).setDepth(920);
    }

    endLevel(success) {
        this.time.removeAllEvents();
        gameEnded = true;
        missiles.forEach(missile => missile.active && missile.setActive(false).setVisible(false));
        antiMissiles.forEach(anti => anti.active && anti.setActive(false).setVisible(false));

        if (success) preservedCount++;
        else destroyedCount++;

        const minFontSize = 20;
        this.resultText = this.add.text(this.scale.width / 2, this.sys.game.config.height * 0.25,
            currentLevel === TOTAL_LEVELS ? 'FIM DE JOGO' : success ? 'SUCESSO!' : 'FALHA!',
            { fontFamily: 'VT323', fontSize: Math.max(70 * this.baseScale, minFontSize) + 'px', color: currentLevel === TOTAL_LEVELS ? '#FFFFFF' : success ? '#00FF00' : '#00FF00', align: 'center' }
        ).setOrigin(0.5).setDepth(1500).setAlpha(0);
        this.tweens.add({ targets: this.resultText, alpha: { from: 1, to: 1 }, duration: 1000 });

        this.statsText = this.add.text(this.scale.width / 2, this.sys.game.config.height * 0.30,
            `\nDestruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
            { fontFamily: 'VT323', fontSize: Math.max(60 * this.baseScale, minFontSize) + 'px', color: '#FFFFFF', align: 'center', lineSpacing: 20 }
        ).setOrigin(0.5).setDepth(1501).setAlpha(0);
        this.tweens.add({ targets: this.statsText, alpha: { from: 0, to: 1 }, duration: 1000 });

        const continueButtonY = this.statsText.y + (this.statsText.height / 2) + 60;
        this.continueButton = this.add.rectangle(this.scale.width / 2, continueButtonY, 200 * this.baseScale, 80 * this.baseScale, 0xFFC107)
            .setStrokeStyle(2 * this.baseScale, 0xFFFFFF)
            .setDepth(2000)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, continueButtonY, currentLevel === TOTAL_LEVELS ? 'REINICIAR' : 'CONTINUAR', {
            fontFamily: 'VT323', fontSize: Math.max(30 * this.baseScale, minFontSize) + 'px', color: '#000000'
        }).setOrigin(0.5).setDepth(2001);

        const updateButtonState = (button, text, hover) => {
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFC107, 1);
            text.setColor(hover ? '#000000ff' : '#000000');
        };

        this.continueButton.defaultFillColor = 0xFFC107;
        this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true));
        this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false));
        this.continueButton.on('pointerdown', () => {
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
        const visibleHeight = this.sys.game.config.height;
        const collisionTopY = visibleHeight - 315 * this.baseScale;
        const collisionBottomY = collisionTopY + 50 * this.baseScale;
        const collisionLeftX = this.scale.width / 2 - 255 * this.baseScale;
        const collisionRightX = this.scale.width / 2 + 255 * this.baseScale;

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
        if (missiles.length === 0 && this.waveCount < 5) this.spawnWave();
    }
}