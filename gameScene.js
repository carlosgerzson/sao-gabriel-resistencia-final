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

// -------- BriefingScene --------
class BriefingScene extends Phaser.Scene {
    constructor() { super('BriefingScene'); }
    preload() { this.load.image('fundo1', 'assets/fundo1.png'); }
    create() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        const gameAreaWidth = this.scale.width * 1;
        const gameAreaHeight = this.scale.height * 0.9;
        this.fundo = this.add.image(this.scale.width / 2, 0, 'fundo1').setOrigin(0.5, 0).setScale(baseScale).setDisplaySize(this.scale.width, this.scale.height);
        this.stars = []; for (let i = 0; i < 50; i++) this.stars.push(this.add.circle(Phaser.Math.Between(0, gameAreaWidth), Phaser.Math.Between(0, gameAreaHeight), Phaser.Math.Between(1, 3), 0xFFFFFF).setAlpha(Phaser.Math.FloatBetween(0.2, 1)));
        const levelDescriptions = ["ALVO 1: CLUBE COMERCIAL! \n\nO calor das tardes no Clube Comercial, onde risos e amizades forjaram nossa história. Defenda-o, pois é o coração pulsante de nossa união que não pode se apagar.", "Nível 2: ...", "Nível 3: ...", "Nível 4: ...", "Nível 5: ...", "Nível 6: ...", "Nível 7: ...", "Nível 8: ...", "Nível 9: ...", "Nível 10: ..."];
        this.briefingText = this.add.text(gameAreaWidth / 2, gameAreaHeight / 2, levelDescriptions[currentLevel - 1], {
            fontFamily: 'VT323', fontSize: `${48 * baseScale}px`, color: '#e9bb00', align: 'center', lineSpacing: 20, wordWrap: { width: gameAreaWidth * 0.8 }
        }).setOrigin(0.5).setDepth(1200).setAlpha(0);
        this.tweens.add({ targets: this.briefingText, alpha: 1, duration: 2000 });
        this.startButton = this.add.rectangle(gameAreaWidth / 2, gameAreaHeight - 50 * baseScale, 200 * baseScale, 80 * baseScale, 0xffca28) // Mudado pra tom "warning" (#ffca28)
            .setStrokeStyle(2 * baseScale, 0xFFFFFF).setDepth(1201).setInteractive({ useHandCursor: true });
        this.startText = this.add.text(gameAreaWidth / 2, gameAreaHeight - 50 * baseScale, 'INICIAR', {
            fontFamily: 'VT323', fontSize: `${30 * baseScale}px`, color: '#000000' // Voltado pra preto como você preferiu
        }).setOrigin(0.5).setDepth(1202);
        this.startButton.defaultFillColor = 0xffca28;
        this.startButton.on('pointerover', () => this.startButton.setFillStyle(0xFFFFFF, 1));
        this.startButton.on('pointerout', () => this.startButton.setFillStyle(0xffca28, 1));
        this.startButton.on('pointerdown', () => {
            this.startButton.setFillStyle(0xffca28, 1); this.startText.setColor('#FFFFFF');
            this.startButton.once('pointerup', () => this.scene.start('GameScene'));
        });
        this.input.on('pointerdown', () => this.game.canvas.focus());
        this.scale.on('resize', this.resize, this); this.resize();
    }
    resize() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        const gameAreaWidth = this.scale.width * 1;
        const gameAreaHeight = this.scale.height * 0.9;
        if (this.fundo) this.fundo.setPosition(this.scale.width / 2, 0).setScale(baseScale).setDisplaySize(this.scale.width, this.scale.height);
        if (this.stars) this.stars.forEach(star => { if (star.active) star.setPosition(Phaser.Math.Between(0, gameAreaWidth), Phaser.Math.Between(0, gameAreaHeight)).setScale(baseScale); });
        if (this.briefingText) this.briefingText.setPosition(gameAreaWidth / 2, gameAreaHeight / 2).setFontSize(`${48 * baseScale}px`).setWordWrapWidth(gameAreaWidth * 0.8);
        if (this.startButton) {
            this.startButton.setPosition(gameAreaWidth / 2, gameAreaHeight - 50 * baseScale);
            this.startButton.setSize(200 * baseScale, 80 * baseScale).setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.startText.setPosition(gameAreaWidth / 2, gameAreaHeight - 50 * baseScale);
            this.startText.setFontSize(`${30 * baseScale}px`);
        }
    }
}

// -------- GameScene --------
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    preload() {
        let colorPrefix; if ([1, 4, 7, 10].includes(currentLevel)) colorPrefix = 'red'; else if ([3, 6, 9].includes(currentLevel)) colorPrefix = 'yellow'; else colorPrefix = 'blue';
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
        ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'].forEach(name => this.load.image(`chamas${name}`, `assets/chamas1/chamas${name}.png`));
        this.levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.load.image(`${this.levelPrefix}_predio`, `${this.levelPrefix}_predio.png`);
        this.load.image(`${this.levelPrefix}_dano1`, `${this.levelPrefix}_dano1.png`);
        this.load.image(`${this.levelPrefix}_dano2`, `${this.levelPrefix}_dano2.png`);
        this.load.image(`${this.levelPrefix}_destruido`, `${this.levelPrefix}_destruido.png`);
        this.load.image(`${this.levelPrefix}_fundo`, `${this.levelPrefix}_fundo.png`);
    }
    create() {
        this.cameras.main.setSize(this.scale.width, this.scale.height);
        let colorPrefix; if ([1, 4, 7, 10].includes(currentLevel)) colorPrefix = 'red'; else if ([3, 6, 9].includes(currentLevel)) colorPrefix = 'yellow'; else colorPrefix = 'blue';
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT) * 0.8;
        const gameAreaWidth = this.scale.width * 0.9;
        const gameAreaHeight = this.scale.height * 0.9;

        this.gameBackground = this.add.image(this.scale.width / 2, 0, `fundo_${colorPrefix}`)
            .setOrigin(0.5, 0).setScale(baseScale).setDisplaySize(this.scale.width, this.scale.height);

        this.timerText = this.add.text(gameAreaWidth * 0.15, 40 * baseScale, '00:10', {
            fontFamily: 'VT323', fontSize: `${Math.max(40 * baseScale, 30)}px`, color: '#FFFFFF'
        }).setOrigin(0, 0).setDepth(100);

        this.timeLeft = 10;
        this.timerEvent = this.time.addEvent({
            delay: 1000, callback: () => {
                this.timeLeft--; let minutes = Math.floor(this.timeLeft / 60); let seconds = this.timeLeft % 60;
                this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                if (this.timeLeft <= 0) (this.buildingState < 3) ? this.endLevel(true) : this.endLevel(false);
            }, loop: true
        });

        const buildingWidth = 510 * baseScale;
        const buildingHeight = 550 * baseScale;
        this.buildingContainer = this.add.container(this.scale.width / 2, gameAreaHeight - buildingHeight - (24 * baseScale));
        this.buildingContainer.setSize(buildingWidth, buildingHeight).setDepth(900);

        const background = this.add.image(0, buildingHeight, `${this.levelPrefix}_fundo`)
            .setOrigin(0.5, 1).setScale(baseScale).setDisplaySize(buildingWidth, buildingHeight);
        background.setPosition(0, buildingHeight).setDepth(900);
        this.buildingContainer.add(background);

        const chamasSpriteHeight = 375 * baseScale;
        this.currentChamasSprite = this.add.sprite(0, 550 * baseScale - (chamasSpriteHeight / 2), 'chamas101');
        this.buildingContainer.add(this.currentChamasSprite);
        this.currentChamasSprite.setDepth(910).setScale(0.3 * baseScale).setVisible(false);

        this.building = this.add.image(0, buildingHeight, `${this.levelPrefix}_predio`)
            .setOrigin(0.5, 1).setScale(baseScale).setDisplaySize(buildingWidth, buildingHeight);
        this.building.setPosition(0, buildingHeight).setDepth(920);
        this.buildingContainer.add(this.building);

        this.silhuetaSprite = this.add.image(this.scale.width / 2, gameAreaHeight, `silhueta_urbana_${colorPrefix}`)
            .setOrigin(0.5, 1).setScale(baseScale).setDisplaySize(gameAreaWidth, 250 * baseScale).setDepth(20);

        const towerAndCannonDefinitions = [
            { name: 'Torre Esquerda', towerAsset: `torre_e_${colorPrefix}`, towerBaseX: gameAreaWidth * 0.144, towerBaseY: gameAreaHeight, towerScale: baseScale, cannonAsset: 'canhao_e', cannonX: gameAreaWidth * 0.144, cannonY: gameAreaHeight * 0.613, cannonScale: baseScale },
            { name: 'Torre Central', towerAsset: `torre_c_${colorPrefix}`, towerBaseX: gameAreaWidth * 0.65, towerBaseY: gameAreaHeight, towerScale: baseScale, cannonAsset: 'canhao_c', cannonX: gameAreaWidth * 0.65, cannonY: gameAreaHeight * 0.647, cannonScale: baseScale },
            { name: 'Torre Direita', towerAsset: `torre_d_${colorPrefix}`, towerBaseX: gameAreaWidth * 0.881, towerBaseY: gameAreaHeight, towerScale: baseScale, cannonAsset: 'canhao_d', cannonX: gameAreaWidth * 0.881, cannonY: gameAreaHeight * 0.563, cannonScale: baseScale }
        ];

        this.allCannonsSprites = []; this.towers = []; this.allTowerSprites = [];
        towerAndCannonDefinitions.forEach((def) => {
            const tower = this.add.image(def.towerBaseX, def.towerBaseY, def.towerAsset)
                .setOrigin(0.5, 1).setScale(def.towerScale).setDisplaySize(218 * def.towerScale, 709 * def.towerScale).setDepth(30);
            this.allTowerSprites.push({ sprite: tower, def: def });
            const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset)
                .setOrigin(0.5, 1).setScale(def.cannonScale).setDisplaySize(39 * def.cannonScale, 141 * def.cannonScale).setDepth(10);
            this.allCannonsSprites.push({ sprite: cannon, def: def });
            cannons.push({ sprite: cannon, tower: tower }); this.towers.push(tower);
        });

        this.buildingState = 0; this.waveCount = 0;
        ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'].map(name => ({ key: `chamas${name}` }));
        this.anims.create({ key: 'chamasAnim', frames: this.anims.generateFrameNames('chamas'), frameRate: 16, repeat: -1 });
        this.time.addEvent({ delay: 2000, callback: this.spawnWave, callbackScope: this, loop: true });

        this.input.on('pointerdown', (pointer) => {
            if (!gameEnded) {
                const gamePointerX = pointer.x; const gamePointerY = pointer.y;
                cannons.forEach(cannon => {
                    const cannonAngle = Phaser.Math.Angle.Between(cannon.sprite.x, cannon.sprite.y, gamePointerX, gamePointerY);
                    cannon.sprite.rotation = cannonAngle + Math.PI / 2; this.fireAntiMissile(cannon, gamePointerX, gamePointerY);
                });
            }
            this.game.canvas.focus();
        });

        this.onAntiMissileHit = (x, y) => {
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 0.8).setDepth(920);
            const explosionVisualRadius = 100 * baseScale; const explosionAnimationDuration = 500;
            this.tweens.add({
                targets: explosionCircle, radius: explosionVisualRadius, alpha: 0, ease: 'Quadratic.Out', duration: explosionAnimationDuration,
                onComplete: () => { explosionCircle.destroy(); this.handleExplosionCollision(x, y, explosionVisualRadius + 50 * baseScale); }
            });
        };

        this.onMissileHit = (x, y) => {
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 1.0).setDepth(930);
            const explosionVisualRadius = 250 * baseScale; const explosionAnimationDuration = 550;
            this.tweens.add({
                targets: explosionCircle, radius: explosionVisualRadius, alpha: 0, ease: 'Quadratic.Out', duration: explosionAnimationDuration,
                onComplete: () => explosionCircle.destroy()
            });
        };

        this.onBuildingHit = (x, y) => {
            this.onMissileHit(x, y);
            try { this.sound.play('explosion_target'); } catch (e) { console.error('Erro ao tocar explosion_target:', e); }
            this.time.delayedCall(500, () => {
                if (this.currentChamasSprite && this.currentChamasSprite.active) {
                    if (this.currentChamasSprite.visible) this.currentChamasSprite.stop();
                    this.currentChamasSprite.setVisible(true).play('chamasAnim');
                }
                if (this.buildingState < 3) {
                    this.buildingState++; this.updateBuildingState(`nivel${currentLevel}/alvo${currentLevel}`);
                    if (this.buildingState === 3) this.endLevel(false);
                }
            });
        };

        this.handleExplosionCollision = (explosionX, explosionY, explosionRadius) => {
            for (let i = missiles.length - 1; i >= 0; i--) {
                const missile = missiles[i];
                if (!missile || !missile.active) { missiles.splice(i, 1); continue; }
                if (Phaser.Math.Distance.Between(explosionX, explosionY, missile.x, missile.y) < explosionRadius) {
                    missile.destroy(); missiles.splice(i, 1); this.sound.play('explosion_air');
                }
            }
        };

        this.resize = () => {
            const width = this.scale.width;
            const height = this.scale.height;
            if (width === 0 || height === 0) { this.scene.restart(); return; }
            const baseScale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT) * 0.8;
            const gameAreaWidth = width * 0.9;
            const gameAreaHeight = height * 0.9;
            const minFontSize = 20;

            if (this.gameBackground) this.gameBackground.setPosition(width / 2, 0).setScale(baseScale).setDisplaySize(width, height);
            if (this.silhuetaSprite) this.silhuetaSprite.setPosition(width / 2, gameAreaHeight).setScale(baseScale).setDisplaySize(gameAreaWidth, 250 * baseScale);
            if (this.buildingContainer) {
                const buildingWidth = 510 * baseScale;
                const buildingHeight = 550 * baseScale;
                this.buildingContainer.setPosition(width / 2, gameAreaHeight - buildingHeight - (24 * baseScale));
                this.buildingContainer.setSize(buildingWidth, buildingHeight);
                this.building.setScale(baseScale).setDisplaySize(buildingWidth, buildingHeight).setPosition(0, buildingHeight);
                const background = this.buildingContainer.getAt(0);
                if (background) background.setScale(baseScale).setDisplaySize(buildingWidth, buildingHeight);
            }
            if (this.currentChamasSprite) {
                const chamasSpriteHeight = 375 * baseScale;
                this.currentChamasSprite.setPosition(0, 550 * baseScale - (chamasSpriteHeight / 2)).setScale(0.3 * baseScale);
            }
            if (this.allTowerSprites) this.allTowerSprites.forEach(tower => {
                if (tower.sprite.active) {
                    tower.sprite.setPosition(tower.def.towerBaseX, gameAreaHeight)
                        .setScale(tower.def.towerScale).setDisplaySize(218 * tower.def.towerScale, 709 * tower.def.towerScale);
                }
            });
            if (this.allCannonsSprites) this.allCannonsSprites.forEach(cannon => {
                if (cannon.sprite.active) {
                    cannon.sprite.setPosition(cannon.def.cannonX, cannon.def.cannonY)
                        .setScale(cannon.def.cannonScale).setDisplaySize(39 * cannon.def.cannonScale, 141 * cannon.def.cannonScale);
                }
            });
            if (this.timerText) this.timerText.setPosition(gameAreaWidth * 0.15, 40 * baseScale).setFontSize(`${Math.max(40 * baseScale, 30)}px`);
            if (this.resultText) {
                this.resultText.setPosition(gameAreaWidth / 2, gameAreaHeight * 0.25)
                    .setFontSize(`${Math.max(60 * baseScale, 30)}px`)
                    .setWordWrapWidth(gameAreaWidth * 0.8);
            }
            if (this.statsText) {
                this.statsText.setPosition(gameAreaWidth / 2, gameAreaHeight * 0.30)
                    .setFontSize(`${Math.max(40 * baseScale, 24)}px`)
                    .setWordWrapWidth(gameAreaWidth * 0.8);
            }
            if (this.continueButton) {
                this.continueButton.setPosition(gameAreaWidth / 2, gameAreaHeight - (100 * baseScale))
                    .setSize(200 * baseScale, 80 * baseScale).setStrokeStyle(2 * baseScale, 0xFFFFFF);
                this.continueText.setPosition(gameAreaWidth / 2, gameAreaHeight - (100 * baseScale))
                    .setFontSize(`${Math.max(30 * baseScale, 20)}px`).setWordWrapWidth(200 * baseScale);
            }
            if (this.endText) {
                this.endText.setPosition(gameAreaWidth / 2, gameAreaHeight / 2 - (150 * baseScale))
                    .setFontSize(`${Math.max(80 * baseScale, 30)}px`)
                    .setWordWrapWidth(gameAreaWidth * 0.8);
            }
            if (this.performanceText) {
                this.performanceText.setPosition(gameAreaWidth / 2, gameAreaHeight / 2)
                    .setFontSize(`${Math.max(40 * baseScale, 24)}px`)
                    .setWordWrapWidth(gameAreaWidth * 0.8);
            }
            if (this.restartButton) {
                this.restartButton.setPosition(gameAreaWidth / 2, gameAreaHeight - (120 * baseScale))
                    .setSize(300 * baseScale, 100 * baseScale).setStrokeStyle(4 * baseScale, 0xFFFFFF);
                this.restartText.setPosition(gameAreaWidth / 2, gameAreaHeight - (120 * baseScale))
                    .setFontSize(`${Math.max(40 * baseScale, 24)}px`).setWordWrapWidth(300 * baseScale);
            }
            if (missiles) missiles.forEach(missile => {
                if (missile && missile.active) {
                    missile.setSize(10 * baseScale, 30 * baseScale);
                    missile.targetX = Phaser.Math.Between(gameAreaWidth / 2 - 255 * baseScale, gameAreaWidth / 2 + 255 * baseScale);
                    missile.targetY = gameAreaHeight - 315 * baseScale;
                }
            });
            if (antiMissiles) antiMissiles.forEach(anti => {
                if (anti && anti.active) anti.setSize(12 * baseScale, 76 * baseScale);
            });
        };

        this.scale.on('resize', this.resize, this); this.resize();
    }
    spawnWave() {
        if (!gameEnded) {
            this.waveCount++; const baseSpeed = 70; const speedIncrementPerWave = 20; const delayBetweenMissiles = 800;
            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT) * 0.8;
            const gameAreaWidth = this.scale.width * 0.9;
            const gameAreaHeight = this.scale.height * 0.9;
            for (let i = 0; i < 2; i++) this.time.delayedCall(i * delayBetweenMissiles, () => {
                const spawnX = Phaser.Math.Between(0, this.scale.width);
                const spawnY = 0;
                const missile = this.add.rectangle(spawnX, spawnY, 10 * baseScale, 30 * baseScale, 0x00ff00);
                missile.speed = baseSpeed + this.waveCount * speedIncrementPerWave;
                missile.targetX = Phaser.Math.Between(gameAreaWidth / 2 - 255 * baseScale, gameAreaWidth / 2 + 255 * baseScale);
                missile.targetY = gameAreaHeight - 315 * baseScale;
                missile.setDepth(1000).setActive(true).setVisible(true);
                missiles.push(missile);
            }, [], this);
        }
    }
    fireAntiMissile(cannon, targetGameX, targetGameY) {
        if (!gameEnded) {
            const launchX = cannon.sprite.x; const launchY = cannon.sprite.y;
            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT) * 0.8;
            const antiMissile = this.add.image(launchX, launchY, 'antimissile')
                .setOrigin(0.5, 1).setScale(baseScale).setDisplaySize(12 * baseScale, 76 * baseScale).setDepth(5);
            antiMissiles.push(antiMissile);
            this.tweens.add({
                targets: antiMissile, x: targetGameX, y: targetGameY, duration: 650, ease: 'Linear',
                onUpdate: (tween, target) => target.rotation = Phaser.Math.Angle.Between(target.x, target.y, targetGameX, targetGameY) + Math.PI / 2,
                onComplete: () => { antiMissile.destroy(); this.onAntiMissileHit(targetGameX, targetGameY); }
            });
        }
    }
    updateBuildingState(levelPrefix) {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT) * 0.8;
        const buildingWidth = 510 * baseScale; const buildingHeight = 550 * baseScale;
        const key = this.buildingState === 1 ? `${levelPrefix}_dano1` : this.buildingState === 2 ? `${levelPrefix}_dano2` : `${levelPrefix}_destruido`;
        this.building.setTexture(key).setScale(baseScale).setDisplaySize(buildingWidth, buildingHeight).setPosition(0, buildingHeight).setDepth(920);
    }
    endLevel(success) {
        this.time.removeAllEvents(); gameEnded = true;
        missiles.forEach(missile => { if (missile.active) missile.setActive(false).setVisible(false); });
        antiMissiles.forEach(anti => { if (anti.active) anti.setActive(false).setVisible(false); });
        if (success) preservedCount++; else destroyedCount++;
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT) * 0.8;
        const gameAreaWidth = this.scale.width * 0.9;
        const gameAreaHeight = this.scale.height * 0.9;
        const minFontSize = 20;
        this.resultText = this.add.text(gameAreaWidth / 2, gameAreaHeight * 0.25, success ? 'SUCESSO!' : 'FALHA!', {
            fontFamily: 'VT323', fontSize: `${Math.max(60 * baseScale, 30)}px`, color: success ? '#00FF00' : '#FF0000', align: 'center', wordWrap: { width: gameAreaWidth * 0.8 }
        }).setOrigin(0.5).setDepth(1500).setAlpha(0);
        this.tweens.add({ targets: this.resultText, alpha: 1, duration: 2000 });
        this.statsText = this.add.text(gameAreaWidth / 2, gameAreaHeight * 0.30, `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`, {
            fontFamily: 'VT323', fontSize: `${Math.max(40 * baseScale, 24)}px`, color: '#FFFFFF', align: 'center', lineSpacing: 20, wordWrap: { width: gameAreaWidth * 0.8 }
        }).setOrigin(0.5).setDepth(1501).setAlpha(0);
        this.tweens.add({ targets: this.statsText, alpha: 1, duration: 2000 });
        this.continueButton = this.add.rectangle(gameAreaWidth / 2, gameAreaHeight - (100 * baseScale), 200 * baseScale, 80 * baseScale, 0xffca28) // Tom "warning" aqui também
            .setStrokeStyle(2 * baseScale, 0xFFFFFF).setDepth(2000).setInteractive({ useHandCursor: true });
        this.continueText = this.add.text(gameAreaWidth / 2, gameAreaHeight - (100 * baseScale), 'CONTINUAR', {
            fontFamily: 'VT323', fontSize: `${Math.max(30 * baseScale, 20)}px`, color: '#000000', wordWrap: { width: 200 * baseScale }
        }).setOrigin(0.5).setDepth(2001);
        this.continueButton.defaultFillColor = 0xffca28;
        this.continueButton.on('pointerover', () => this.continueButton.setFillStyle(0xFFFFFF, 1));
        this.continueButton.on('pointerout', () => this.continueButton.setFillStyle(0xffca28, 1));
        this.continueButton.on('pointerdown', () => {
            this.continueButton.setFillStyle(0xffca28, 1); this.continueText.setColor('#000000');
            this.continueButton.once('pointerup', () => {
                const totalLevels = typeof TOTAL_LEVELS !== 'undefined' ? TOTAL_LEVELS : 10;
                if (currentLevel < totalLevels) { currentLevel++; gameEnded = false; this.scene.start('BriefingScene'); }
                else {
                    this.gameBackground.destroy(); this.resultText.destroy(); this.statsText.destroy(); this.continueButton.destroy(); this.continueText.destroy();
                    this.gameBackground = this.add.image(this.scale.width / 2, 0, 'fundo1').setOrigin(0.5, 0).setScale(baseScale).setDisplaySize(this.scale.width, this.scale.height).setDepth(1000);
                    this.endText = this.add.text(gameAreaWidth / 2, gameAreaHeight / 2 - (150 * baseScale), 'FIM DE JOGO!', {
                        fontFamily: 'VT323', fontSize: `${Math.max(80 * baseScale, 30)}px`, color: '#FFFFFF', align: 'center', wordWrap: { width: gameAreaWidth * 0.8 }
                    }).setOrigin(0.5).setDepth(1200);
                    this.tweens.add({ targets: this.endText, scale: { from: 1, to: 1.2 }, duration: 1000, yoyo: true, repeat: -1 });
                    let performanceMessage = preservedCount >= 8 ? 'Excelente! Você é um verdadeiro defensor do patrimônio!' : preservedCount >= 5 ? 'Bom trabalho! Você preservou mais da metade!' : 'Foi difícil, mas você fez o seu melhor!';
                    this.performanceText = this.add.text(gameAreaWidth / 2, gameAreaHeight / 2, performanceMessage, {
                        fontFamily: 'VT323', fontSize: `${Math.max(40 * baseScale, 24)}px`, color: '#FFFFFF', align: 'center', lineSpacing: 20, wordWrap: { width: gameAreaWidth * 0.8 }
                    }).setOrigin(0.5).setDepth(1201).setAlpha(0);
                    this.tweens.add({ targets: this.performanceText, alpha: 1, duration: 2000 });
                    this.statsText = this.add.text(gameAreaWidth / 2, gameAreaHeight / 2 + (150 * baseScale), `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`, {
                        fontFamily: 'VT323', fontSize: `${Math.max(40 * baseScale, 24)}px`, color: '#FFFFFF', align: 'center', lineSpacing: 20, wordWrap: { width: gameAreaWidth * 0.8 }
                    }).setOrigin(0.5).setDepth(1201).setAlpha(0);
                    this.tweens.add({ targets: this.statsText, alpha: 1, duration: 2000 });
                    this.restartButton = this.add.rectangle(gameAreaWidth / 2, gameAreaHeight - (120 * baseScale), 300 * baseScale, 100 * baseScale, 0x00FF00)
                        .setStrokeStyle(4 * baseScale, 0xFFFFFF).setDepth(2000).setInteractive({ useHandCursor: true });
                    this.restartText = this.add.text(gameAreaWidth / 2, gameAreaHeight - (120 * baseScale), 'REINICIAR', {
                        fontFamily: 'VT323', fontSize: `${Math.max(40 * baseScale, 24)}px`, color: '#000000', wordWrap: { width: 300 * baseScale }
                    }).setOrigin(0.5).setDepth(2001);
                    this.restartButton.defaultFillColor = 0x00FF00;
                    this.restartButton.on('pointerover', () => this.restartButton.setFillStyle(0xFFFFFF, 1));
                    this.restartButton.on('pointerout', () => this.restartButton.setFillStyle(0x00FF00, 1));
                    this.restartButton.on('pointerdown', () => {
                        this.restartButton.setFillStyle(0x00FF00, 1); this.restartText.setColor('#000000');
                        this.restartButton.once('pointerup', () => { destroyedCount = 0; preservedCount = 0; currentLevel = 1; gameEnded = false; this.scene.start('BriefingScene'); });
                    });
                }
            });
        });
    }
    update() {
        if (gameEnded) return;
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT) * 0.8;
        const gameAreaWidth = this.scale.width * 0.9;
        const gameAreaHeight = this.scale.height * 0.9;
        const collisionTopY = gameAreaHeight - 315 * baseScale;
        const collisionBottomY = collisionTopY + 50 * baseScale;
        const collisionLeftX = gameAreaWidth / 2 - 255 * baseScale;
        const collisionRightX = gameAreaWidth / 2 + 255 * baseScale;
        for (let i = missiles.length - 1; i >= 0; i--) {
            const missile = missiles[i];
            if (!missile || !missile.active) { missiles.splice(i, 1); continue; }
            const angle = Phaser.Math.Angle.Between(missile.x, missile.y, missile.targetX, missile.targetY);
            missile.x += Math.cos(angle) * missile.speed * (1 / 60);
            missile.y += Math.sin(angle) * missile.speed * (1 / 60);
            missile.rotation = angle + Math.PI / 2;
            if (missile.y >= collisionTopY && missile.y <= collisionBottomY && missile.x >= collisionLeftX && missile.x <= collisionRightX) {
                this.onBuildingHit(missile.x, missile.y); missile.destroy(); missiles.splice(i, 1);
            } else if (missile.y > gameAreaHeight) { missile.destroy(); missiles.splice(i, 1); }
        }
        if (missiles.length === 0 && this.waveCount < 5) this.spawnWave();
    }
}