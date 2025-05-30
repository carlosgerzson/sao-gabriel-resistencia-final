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

class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    create() {
        console.log(`BriefingScene iniciada para o nível ${currentLevel}`);

        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x8B0000, 0x8B0000, 0x000000, 0x000000, 1);
        graphics.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
        this.gameBackgroundRect = graphics;
        console.log("Fundo com gradiente renderizado");

        this.stars = [];
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, BASE_WIDTH),
                Phaser.Math.Between(0, BASE_HEIGHT),
                Phaser.Math.Between(1, 3),
                0xFFFFFF
            ).setAlpha(Phaser.Math.FloatBetween(0.2, 1));
            this.stars.push(star);
        }
        console.log("Estrelas renderizadas");

        this.briefingText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 
            `Nível ${currentLevel}: Teatro Municipal de São Gabriel,\nconstruído em 1920. Defenda-o dos ataques!`, 
            {
                fontFamily: 'VT323',
                fontSize: '40px',
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 20
            }
        ).setOrigin(0.5).setDepth(100);
        this.briefingText.setAlpha(0);
        this.tweens.add({
            targets: this.briefingText,
            alpha: { from: 0, to: 1 },
            duration: 2000,
            onComplete: () => {
                console.log("Texto do briefing exibido");
            }
        });

        this.startButton = this.add.graphics();
        this.startButton.fillStyle(0xFFFF00, 1);
        this.startButton.fillRect(350, 1400, 200, 80);
        this.startButton.lineStyle(2, 0xFFFFFF);
        this.startButton.strokeRect(350, 1400, 200, 80);
        this.startButton.setDepth(100);
        this.startText = this.add.text(BASE_WIDTH / 2, 1440, 'INICIAR', {
            fontFamily: 'VT323',
            fontSize: '30px',
            color: '#000000'
        }).setOrigin(0.5).setDepth(100);
        this.startButton.setInteractive(new Phaser.Geom.Rectangle(350, 1400, 200, 80), Phaser.Geom.Rectangle.Contains);
        this.startButton.on('pointerdown', () => {
            console.log("Botão INICIAR clicado, iniciando GameScene");
            this.scene.start('GameScene');
        });
        this.startButton.on('pointerover', () => this.startButton.fillStyle(0xFFFFFF, 1));
        this.startButton.on('pointerout', () => this.startButton.fillStyle(0xFFFF00, 1));
        console.log("Botão INICIAR renderizado");

        this.scale.on('resize', resize, this);
        resize.call(this, { width: this.scale.width, height: this.scale.height });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('silhueta_urbana', 'assets/silhueta_urbana.png');
        this.load.image('torre_e', 'assets/torre_e.png');
        this.load.image('torre_c', 'assets/torre_c.png');
        this.load.image('torre_d', 'assets/torre_d.png');
        this.load.image('canhao_e', 'assets/canhao_e.png');
        this.load.image('canhao_c', 'assets/canhao_c.png');
        this.load.image('canhao_d', 'assets/canhao_d.png');
        this.load.image('antimissile', 'assets/antimissile.png');
        const levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.load.image(`${levelPrefix}_fundo`, `${levelPrefix}_fundo.png');
        this.load.image(`${levelPrefix}_predio`, `${levelPrefix}_predio.png');
        this.load.image(`${levelPrefix}_dano1`, `${levelPrefix}_dano1.png');
        this.load.image(`${levelPrefix}_dano2`, `${levelPrefix}_dano2.png');
        this.load.image(`${levelPrefix}_destruido`, `${levelPrefix}_destruido.png`);
    }

    create() {
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x8B0000, 0x8B0000, 0x000000, 0x000000, 1);
        graphics.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
        this.gameBackgroundRect = graphics;

        this.stars = [];
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, BASE_WIDTH),
                Phaser.Math.Between(0, BASE_HEIGHT),
                Phaser.Math.Between(1, 3),
                0xFFFFFF
            ).setAlpha(Phaser.Math.FloatBetween(0.2, 1));
            this.stars.push(star);
        }

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
                if (this.timeLeft <= 0 && this.buildingState < 3) {
                    this.endLevel(false);
                }
            },
            loop: true
        });

        this.buildingContainer = this.add.container(450, 1002);
        this.buildingContainer.setSize(510, 550);
        this.buildingContainer.setDepth(30);

        const debugRect = this.add.graphics();
        debugRect.lineStyle(2, 0x00FF00);
        debugRect.strokeRect(450 - 255, 1002, 510, 550);
        this.debugRect = debugRect;

        const levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.background = this.add.image(0, 0, `${levelPrefix}_fundo`).setOrigin(0.5, 1).setDisplaySize(510, 510 * (this.textures.get(`${levelPrefix}_fundo`).source[0].height / this.textures.get(`${levelPrefix}_fundo`).source[0].width));
        this.background.setPosition(0, 550);
        this.background.setDepth(-1);
        this.buildingContainer.add(this.background);

        this.building = this.add.image(0, 0, `${levelPrefix}_predio`).setOrigin(0.5, 1).setDisplaySize(510, 510 * (this.textures.get(`${levelPrefix}_predio`).source[0].height / this.textures.get(`${levelPrefix}_predio`).source[0].width));
        this.building.setPosition(0, 550);
        this.building.setDepth(1);
        this.buildingContainer.add(this.building);

        this.silhuetaSprite = this.add.image(450, 1600, 'silhueta_urbana').setOrigin(0.5, 1).setDepth(20);
        this.silhuetaSprite.displayWidth = 900;
        this.silhuetaSprite.displayHeight = 384;

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
        this.allCannonsSprites = [];
        this.towers = [];
        this.allTowerSprites = [];

        towerAndCannonDefinitions.forEach((def) => {
            const tower = this.add.image(def.towerBaseX, def.towerBaseY, def.towerAsset).setOrigin(0.5, 1);
            tower.setDepth(def.towerDepth);
            tower.displayWidth = def.towerTargetWidth;
            tower.displayHeight = def.towerTargetHeight;
            this.allTowerSprites.push({ sprite: tower, def: def });

            const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset);
            cannon.setOrigin(0.5, 1);
            cannon.setDepth(def.cannonDepth);
            cannon.displayWidth = def.cannonTargetWidth;
            cannon.displayHeight = def.cannonTargetHeight;
            this.allCannonsSprites.push({ sprite: cannon, def: def });

            cannons.push({ sprite: cannon, tower: tower });
            this.towers.push(tower);
        });

        this.buildingState = 0;
        missiles = [];
        antiMissiles = [];
        this.waveCount = 0;

        this.time.addEvent({ delay: 2000, callback: this.spawnWave, callbackScope: this, loop: true });

        this.input.on('pointerdown', (pointer) => {
            if (!gameEnded) {
                const gamePointerX = pointer.x;
                const gamePointerY = pointer.y;
                cannons.forEach(cannon => {
                    const cannonAngle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, gamePointerX, gamePointerY);
                    cannon.sprite.rotation = cannonAngle + Math.PI / 2;
                    this.fireAntiMissile(cannon, gamePointerX, gamePointerY);
                });
            }
        });

        this.onAntiMissileHit = function(x, y) {
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 0.8);
            explosionCircle.setDepth(60);
            const explosionVisualRadius = 100;
            const explosionAnimationDuration = 500;
            this.tweens.add({
                targets: explosionCircle,
                radius: explosionVisualRadius,
                alpha: 0,
                ease: 'Quadratic.Out',
                duration: explosionAnimationDuration,
                onComplete: () => {
                    explosionCircle.destroy();
                    this.handleExplosionCollision(x, y, explosionVisualRadius + 50);
                }
            });
        }.bind(this);

        this.onBuildingHit = function(x, y) {
            const buildingHitExplosion = this.add.circle(x, y, 30, 0xffa500);
            buildingHitExplosion.setDepth(60);
            buildingHitExplosion.setScale(0);
            buildingHitExplosion.setAlpha(1);
            this.tweens.add({
                targets: buildingHitExplosion,
                scale: 1,
                alpha: 0,
                ease: 'Cubic.easeOut',
                duration: 150,
                onComplete: () => {
                    buildingHitExplosion.destroy();
                }
            });
        }.bind(this);

        this.handleExplosionCollision = function(explosionX, explosionY, explosionRadius) {
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
                }
            }
        }.bind(this);

        this.scale.on('resize', resize, this);
        resize.call(this, { width: this.scale.width, height: this.scale.height });
    }

    spawnWave() {
        if (!gameEnded) {
            this.waveCount++;
            const baseSpeed = 70;
            const speedIncrementPerWave = 20;
            const delayBetweenMissiles = 800;
            for (let i = 0; i < 2; i++) {
                this.time.delayedCall(i * delayBetweenMissiles, () => {
                    const spawnX = Phaser.Math.Between(0, BASE_WIDTH);
                    const spawnY = 0;
                    const missile = this.add.rectangle(spawnX, spawnY, 10, 30, 0x00ff00);
                    missile.speed = baseSpeed + this.waveCount * speedIncrementPerWave;
                    missile.targetX = 450;
                    missile.targetY = 1552 - (this.building.displayHeight / 2);
                    missile.displayWidth = 10;
                    missile.displayHeight = 30;
                    missile.setDepth(50);
                    missiles.push(missile);
                }, [], this);
            }
        }
    }

    fireAntiMissile(cannon, targetGameX, targetGameY) {
        if (!gameEnded) {
            const launchX = cannon.sprite.x;
            const launchY = cannon.sprite.y;
            const antiMissile = this.add.image(launchX, launchY, 'antimissile');
            antiMissile.setOrigin(0.5, 1);
            antiMissile.setDepth(5);
            antiMissile.displayWidth = 15;
            antiMissile.displayHeight = 60;
            antiMissiles.push(antiMissile);
            this.tweens.add({
                targets: antiMissile,
                x: targetGameX,
                y: targetGameY,
                duration: 500,
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
        if (this.buildingState >= 1 && !this.background) {
            this.background = this.add.image(0, 0, `${levelPrefix}_fundo`).setOrigin(0.5, 1).setDisplaySize(510, 510 * (this.textures.get(`${levelPrefix}_fundo`).source[0].height / this.textures.get(`${levelPrefix}_fundo`).source[0].width));
            this.background.setPosition(0, 550);
            this.background.setDepth(-1);
            this.buildingContainer.add(this.background);
        }
        const textureKey = this.buildingState === 1 ? `${levelPrefix}_dano1` : this.buildingState === 2 ? `${levelPrefix}_dano2` : `${levelPrefix}_destruido`;
        const newHeight = 510 * (this.textures.get(textureKey).source[0].height / this.textures.get(textureKey).source[0].width);
        this.building.setTexture(textureKey).setDisplaySize(510, newHeight);
    }

    endLevel(success) {
        this.time.removeAllEvents();
        this.input.enabled = false;
        gameEnded = true;
        missiles.forEach(missile => {
            if (missile.active) missile.setActive(false).setVisible(false);
        });
        antiMissiles.forEach(anti => {
            if (anti.active) anti.setActive(false).setVisible(false);
        });
        this.tweens.pauseAll();

        if (success) {
            preservedCount++;
        } else {
            destroyedCount++;
        }

        this.resultText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 
            success ? 'SUCESSO!' : 'FALHA!',
            {
                fontFamily: 'VT323',
                fontSize: '60px',
                color: success ? '#00FF00' : '#FF0000',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(100);
        this.resultText.setAlpha(0);
        this.tweens.add({
            targets: this.resultText,
            alpha: { from: 0, to: 1 },
            duration: 2000
        });

        this.statsText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2 + 100, 
            `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
            {
                fontFamily: 'VT323',
                fontSize: '40px',
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 20
            }
        ).setOrigin(0.5).setDepth(100);
        this.statsText.setAlpha(0);
        this.tweens.add({
            targets: this.statsText,
            alpha: { from: 0, to: 1 },
            duration: 2000
        });

        this.continueButton = this.add.graphics();
        this.continueButton.fillStyle(0xFFFF00, 1);
        this.continueButton.fillRect(350, 1400, 200, 80);
        this.continueButton.lineStyle(2, 0xFFFFFF);
        this.continueButton.strokeRect(350, 1400, 200, 80);
        this.continueButton.setDepth(100);
        this.continueText = this.add.text(BASE_WIDTH / 2, 1440, 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: '30px',
            color: '#000000'
        }).setOrigin(0.5).setDepth(100);
        this.continueButton.setInteractive(new Phaser.Geom.Rectangle(350, 1400, 200, 80), Phaser.Geom.Rectangle.Contains);
        this.continueButton.on('pointerdown', () => {
            if (currentLevel < TOTAL_LEVELS) {
                currentLevel++;
                gameEnded = false;
                this.scene.start('BriefingScene');
            } else {
                this.gameBackgroundRect.clear();
                this.gameBackgroundRect.fillGradientStyle(0xFFD700, 0xFFD700, 0xFF4500, 0xFF4500, 1);
                this.gameBackgroundRect.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

                this.stars.forEach(star => {
                    if (star.active) {
                        this.tweens.add({
                            targets: star,
                            alpha: { from: 1, to: 0.2 },
                            duration: 500,
                            yoyo: true,
                            repeat: -1
                        });
                    }
                });

                this.resultText.destroy();
                this.statsText.destroy();
                this.continueButton.destroy();
                this.continueText.destroy();

                this.endText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2 - 200, 'FIM DE JOGO!', {
                    fontFamily: 'VT323',
                    fontSize: '80px',
                    color: '#FFFFFF',
                    align: 'center'
                }).setOrigin(0.5).setDepth(100);
                this.tweens.add({
                    targets: this.endText,
                    scale: { from: 1, to: 1.2 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });

                let performanceMessage = '';
                if (preservedCount >= 8) {
                    performanceMessage = 'Excelente! Você é um verdadeiro defensor do patrimônio!';
                } else if (preservedCount >= 5) {
                    performanceMessage = 'Bom trabalho! Você preservou mais da metade!';
                } else {
                    performanceMessage = 'Foi difícil, mas você fez o seu melhor!';
                }

                this.performanceText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, performanceMessage, {
                    fontFamily: 'VT323',
                    fontSize: '40px',
                    color: '#FFFFFF',
                    align: 'center',
                    lineSpacing: 20,
                    wordWrap: { width: 800 }
                }).setOrigin(0.5).setDepth(100);
                this.performanceText.setAlpha(0);
                this.tweens.add({
                    targets: this.performanceText,
                    alpha: { from: 0, to: 1 },
                    duration: 2000
                });

                this.statsText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2 + 150, 
                    `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
                    {
                        fontFamily: 'VT323',
                        fontSize: '40px',
                        color: '#FFFFFF',
                        align: 'center',
                        lineSpacing: 20
                    }
                ).setOrigin(0.5).setDepth(100);
                this.statsText.setAlpha(0);
                this.tweens.add({
                    targets: this.statsText,
                    alpha: { from: 0, to: 1 },
                    duration: 2000
                });

                this.restartButton = this.add.graphics();
                this.restartButton.fillStyle(0x00FF00, 1);
                this.restartButton.fillRect(300, 1300, 300, 100);
                this.restartButton.lineStyle(4, 0xFFFFFF);
                this.restartButton.strokeRect(300, 1300, 300, 100);
                this.restartButton.setDepth(100);
                this.restartText = this.add.text(BASE_WIDTH / 2, 1350, 'REINICIAR', {
                    fontFamily: 'VT323',
                    fontSize: '40px',
                    color: '#000000'
                }).setOrigin(0.5).setDepth(100);
                this.restartButton.setInteractive(new Phaser.Geom.Rectangle(300, 1300, 300, 100), Phaser.Geom.Rectangle.Contains);
                this.restartButton.on('pointerdown', () => {
                    destroyedCount = 0;
                    preservedCount = 0;
                    currentLevel = 1;
                    gameEnded = false;
                    this.scene.start('BriefingScene');
                });
                this.restartButton.on('pointerover', () => this.restartButton.fillStyle(0xFFFFFF, 1));
                this.restartButton.on('pointerout', () => this.restartButton.fillStyle(0x00FF00, 1));
            }
        });
        this.continueButton.on('pointerover', () => this.continueButton.fillStyle(0xFFFFFF, 1));
        this.continueButton.on('pointerout', () => this.continueButton.fillStyle(0xFFFF00, 1));

        this.scale.on('resize', resize, this);
        resize.call(this, { width: this.scale.width, height: this.scale.height });
    }

    update() {
        if (gameEnded) return;

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

            const buildingTopY = 1552 - (this.building.displayHeight / 2);
            const buildingLeftX = 450 - (this.building.displayWidth / 2);
            const buildingRightX = 450 + (this.building.displayWidth / 2);

            if (missile.y >= buildingTopY && missile.x >= buildingLeftX && missile.x <= buildingRightX) {
                this.onBuildingHit(missile.x, missile.y);
                missile.destroy();
                missiles.splice(i, 1);

                if (this.buildingState < 3) {
                    this.buildingState++;
                    this.updateBuildingState(`nivel${currentLevel}/alvo${currentLevel}`);
                    if (this.buildingState === 3) {
                        this.endLevel(false);
                    }
                }
            }
        }

        if (missiles.length === 0) {
            this.spawnWave();
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    parent: 'game-container',
    scene: [BriefingScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container'
    }
};

const game = new Phaser.Game(config);
console.log("Jogo Phaser inicializado");

function resize(gameSize) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.cameras.main.setZoom(Math.min(gameSize.width / BASE_WIDTH, gameSize.height / BASE_HEIGHT));
    const currentPhaserZoom = this.scale.zoom;

    if (this.gameBackgroundRect && this.gameBackgroundRect.active) {
        this.gameBackgroundRect.x = 0;
        this.gameBackgroundRect.y = 0;
        this.gameBackgroundRect.displayWidth = BASE_WIDTH * currentPhaserZoom;
        this.gameBackgroundRect.displayHeight = BASE_HEIGHT * currentPhaserZoom;
    }

    if (this.stars) {
        this.stars.forEach(star => {
            if (star.active) {
                star.setScale(currentPhaserZoom);
            }
        });
    }

    if (this.briefingText && this.briefingText.active) {
        this.briefingText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.briefingText.y = BASE_HEIGHT / 2 * currentPhaserZoom;
        this.briefingText.setFontSize(40 * currentPhaserZoom);
    }

    if (this.startButton && this.startButton.active) {
        this.startButton.clear();
        this.startButton.fillStyle(0xFFFF00, 1);
        this.startButton.fillRect(350 * currentPhaserZoom, 1400 * currentPhaserZoom, 200 * currentPhaserZoom, 80 * currentPhaserZoom);
        this.startButton.lineStyle(2 * currentPhaserZoom, 0xFFFFFF);
        this.startButton.strokeRect(350 * currentPhaserZoom, 1400 * currentPhaserZoom, 200 * currentPhaserZoom, 80 * currentPhaserZoom);
        this.startButton.setScale(1);
    }

    if (this.startText && this.startText.active) {
        this.startText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.startText.y = 1440 * currentPhaserZoom;
        this.startText.setFontSize(30 * currentPhaserZoom);
    }

    if (this.silhuetaSprite && this.silhuetaSprite.active) {
        this.silhuetaSprite.x = 450 * currentPhaserZoom;
        this.silhuetaSprite.y = 1600 * currentPhaserZoom;
        this.silhuetaSprite.displayWidth = 900 * currentPhaserZoom;
        this.silhuetaSprite.displayHeight = 384 * currentPhaserZoom;
        this.silhuetaSprite.setScale(1);
    }

    if (this.buildingContainer && this.buildingContainer.active) {
        this.buildingContainer.x = 450 * currentPhaserZoom;
        this.buildingContainer.y = 1002 * currentPhaserZoom;
        this.buildingContainer.setScale(1);
        if (this.building) {
            this.building.setDisplaySize(510 * currentPhaserZoom, 510 * currentPhaserZoom * (this.textures.get(`nivel${currentLevel}/alvo${currentLevel}_predio`).source[0].height / this.textures.get(`nivel${currentLevel}/alvo${currentLevel}_predio`).source[0].width));
        }
        if (this.background) {
            this.background.setDisplaySize(510 * currentPhaserZoom, 510 * currentPhaserZoom * (this.textures.get(`nivel${currentLevel}/alvo${currentLevel}_fundo`).source[0].height / this.textures.get(`nivel${currentLevel}/alvo${currentLevel}_fundo`).source[0].width));
        }
    }

    if (this.debugRect && this.debugRect.active) {
        this.debugRect.clear();
        this.debugRect.lineStyle(2 * currentPhaserZoom, 0x00FF00);
        this.debugRect.strokeRect((450 - 255) * currentPhaserZoom, 1002 * currentPhaserZoom, 510 * currentPhaserZoom, 550 * currentPhaserZoom);
        this.debugRect.setScale(1);
    }

    if (this.timerText && this.timerText.active) {
        this.timerText.x = 20 * currentPhaserZoom;
        this.timerText.y = 20 * currentPhaserZoom;
        this.timerText.setFontSize(40 * currentPhaserZoom);
    }

    if (missiles) {
        missiles.forEach(missile => {
            if (missile && missile.active) {
                const missileBaseWidth = 10 * currentPhaserZoom;
                const missileBaseHeight = 30 * currentPhaserZoom;
                missile.displayWidth = missileBaseWidth;
                missile.displayHeight = missileBaseHeight;
                missile.targetX = 450 * currentPhaserZoom;
                missile.targetY = (this.building && this.building.active ? 1552 - (this.building.displayHeight / 2) : 1552) * currentPhaserZoom;
                missile.setScale(1);
            }
        });
    }

    if (antiMissiles) {
        antiMissiles.forEach(anti => {
            if (anti && anti.active) {
                anti.displayWidth = 15 * currentPhaserZoom;
                anti.displayHeight = 60 * currentPhaserZoom;
                anti.setScale(1);
            }
        });
    }

    if (this.allTowerSprites) {
        this.allTowerSprites.forEach(tower => {
            if (tower.sprite.active) {
                tower.sprite.x = tower.def.towerBaseX * currentPhaserZoom;
                tower.sprite.y = tower.def.towerBaseY * currentPhaserZoom;
                tower.sprite.displayWidth = tower.def.towerTargetWidth * currentPhaserZoom;
                tower.sprite.displayHeight = tower.def.towerTargetHeight * currentPhaserZoom;
                tower.sprite.setScale(1);
            }
        });
    }

    if (this.allCannonsSprites) {
        this.allCannonsSprites.forEach(cannon => {
            if (cannon.sprite.active) {
                cannon.sprite.x = cannon.def.cannonX * currentPhaserZoom;
                cannon.sprite.y = cannon.def.cannonY * currentPhaserZoom;
                cannon.sprite.displayWidth = cannon.def.cannonTargetWidth * currentPhaserZoom;
                cannon.sprite.displayHeight = cannon.def.cannonTargetHeight * currentPhaserZoom;
                cannon.sprite.setScale(1);
            }
        });
    }

    if (this.resultText && this.resultText.active) {
        this.resultText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.resultText.y = BASE_HEIGHT / 2 * currentPhaserZoom;
        this.resultText.setFontSize(60 * currentPhaserZoom);
    }

    if (this.statsText && this.statsText.active) {
        this.statsText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.statsText.y = (BASE_HEIGHT / 2 + 100) * currentPhaserZoom;
        this.statsText.setFontSize(40 * currentPhaserZoom);
    }

    if (this.performanceText && this.performanceText.active) {
        this.performanceText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.performanceText.y = BASE_HEIGHT / 2 * currentPhaserZoom;
        this.performanceText.setFontSize(40 * currentPhaserZoom);
    }

    if (this.continueButton && this.continueButton.active) {
        this.continueButton.clear();
        this.continueButton.fillStyle(0xFFFF00, 1);
        this.continueButton.fillRect(350 * currentPhaserZoom, 1400 * currentPhaserZoom, 200 * currentPhaserZoom, 80 * currentPhaserZoom);
        this.continueButton.lineStyle(2 * currentPhaserZoom, 0xFFFFFF);
        this.continueButton.strokeRect(350 * currentPhaserZoom, 1400 * currentPhaserZoom, 200 * currentPhaserZoom, 80 * currentPhaserZoom);
        this.continueButton.setScale(1);
    }

    if (this.continueText && this.continueText.active) {
        this.continueText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.continueText.y = 1440 * currentPhaserZoom;
        this.continueText.setFontSize(30 * currentPhaserZoom);
    }

    if (this.endText && this.endText.active) {
        this.endText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.endText.y = (BASE_HEIGHT / 2 - 200) * currentPhaserZoom;
        this.endText.setFontSize(80 * currentPhaserZoom);
    }

    if (this.restartButton && this.restartButton.active) {
        this.restartButton.clear();
        this.restartButton.fillStyle(0x00FF00, 1);
        this.restartButton.fillRect(300 * currentPhaserZoom, 1300 * currentPhaserZoom, 300 * currentPhaserZoom, 100 * currentPhaserZoom);
        this.restartButton.lineStyle(4 * currentPhaserZoom, 0xFFFFFF);
        this.restartButton.strokeRect(300 * currentPhaserZoom, 1300 * currentPhaserZoom, 300 * currentPhaserZoom, 100 * currentPhaserZoom);
        this.restartButton.setScale(1);
    }

    if (this.restartText && this.restartText.active) {
        this.restartText.x = BASE_WIDTH / 2 * currentPhaserZoom;
        this.restartText.y = 1350 * currentPhaserZoom;
        this.restartText.setFontSize(40 * currentPhaserZoom);
    }

    console.log(`Resized to: ${gameSize.width}x${gameSize.height}. Phaser Zoom: ${currentPhaserZoom.toFixed(2)}`);
}