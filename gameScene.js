class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        let colorPrefix;
        if ([1, 4, 7, 10].includes(currentLevel)) {
            colorPrefix = 'red';
        } else if ([3, 6, 9].includes(currentLevel)) {
            colorPrefix = 'yellow';
        } else {
            colorPrefix = 'blue';
        }
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
        spriteNames.forEach(name => {
            this.load.image(`chamas${name}`, `assets/chamas1/chamas${name}.png`);
        });

        this.levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.load.image(`${this.levelPrefix}_predio`, `${this.levelPrefix}_predio.png`);
        this.load.image(`${this.levelPrefix}_dano1`, `${this.levelPrefix}_dano1.png`);
        this.load.image(`${this.levelPrefix}_dano2`, `${this.levelPrefix}_dano2.png`);
        this.load.image(`${this.levelPrefix}_destruido`, `${this.levelPrefix}_destruido.png`);
        this.load.image(`${this.levelPrefix}_fundo`, `${this.levelPrefix}_fundo.png`);
    }

    create() {
        this.cameras.main.setSize(this.scale.width, this.scale.height);
        let colorPrefix;
        if ([1, 4, 7, 10].includes(currentLevel)) {
            colorPrefix = 'red';
        } else if ([3, 6, 9].includes(currentLevel)) {
            colorPrefix = 'yellow';
        } else {
            colorPrefix = 'blue';
        }
        // Ajuste o fundo com escala baseada na menor proporção para evitar over-zoom
        const baseScale = Math.min(this.scale.width / 900, this.scale.height / 1600);
        this.gameBackground = this.add.image(this.scale.width / 2, 0, `fundo_${colorPrefix}`)
            .setOrigin(0.5, 0)
            .setScale(baseScale);

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
        this.buildingContainer = this.add.container(this.scale.width / 2, this.scale.height - buildingHeight - (48 * (this.scale.height / 1600)));
        this.buildingContainer.setSize(buildingWidth, buildingHeight);
        this.buildingContainer.setDepth(900);

        const background = this.add.image(0, buildingHeight, `${this.levelPrefix}_fundo`).setOrigin(0.5, 1).setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(`${this.levelPrefix}_fundo`).source[0].height / this.textures.get(`${this.levelPrefix}_fundo`).source[0].width));
        background.setPosition(0, buildingHeight);
        background.setDepth(900);
        this.buildingContainer.add(background);

        const chamasSpriteHeight = 375 * baseScale;
        this.currentChamasSprite = this.add.sprite(0, 550 * baseScale - (chamasSpriteHeight / 2), 'chamas101');
        this.buildingContainer.add(this.currentChamasSprite);
        this.currentChamasSprite.setDepth(910);
        this.currentChamasSprite.setScale(0.3 * baseScale);
        this.currentChamasSprite.setVisible(false);

        this.building = this.add.image(0, buildingHeight, `${this.levelPrefix}_predio`).setOrigin(0.5, 1).setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(`${this.levelPrefix}_predio`).source[0].height / this.textures.get(`${this.levelPrefix}_predio`).source[0].width));
        this.building.setPosition(0, buildingHeight);
        this.building.setDepth(920);
        this.buildingContainer.add(this.building);

        this.silhuetaSprite = this.add.image(this.scale.width / 2, this.scale.height, `silhueta_urbana_${colorPrefix}`).setOrigin(0.5, 1).setDepth(20);
        this.silhuetaSprite.displayWidth = this.scale.width;
        this.silhuetaSprite.displayHeight = 384 * (this.scale.height / 1600) * baseScale;

        const towerAndCannonDefinitions = [
            {
                name: 'Torre Esquerda',
                towerAsset: `torre_e_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.144,
                towerBaseY: this.scale.height,
                towerTargetWidth: 218 * baseScale,
                towerTargetHeight: 709 * baseScale,
                towerDepth: 30,
                cannonAsset: 'canhao_e',
                cannonX: this.scale.width * 0.144,
                cannonY: this.scale.height * 0.613,
                cannonTargetWidth: 39 * baseScale,
                cannonTargetHeight: 141 * baseScale,
                cannonDepth: 10
            },
            {
                name: 'Torre Central',
                towerAsset: `torre_c_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.65,
                towerBaseY: this.scale.height,
                towerTargetWidth: 148 * baseScale,
                towerTargetHeight: 637 * baseScale,
                towerDepth: 18,
                cannonAsset: 'canhao_c',
                cannonX: this.scale.width * 0.65,
                cannonY: this.scale.height * 0.647,
                cannonTargetWidth: 33 * baseScale,
                cannonTargetHeight: 103 * baseScale,
                cannonDepth: 10
            },
            {
                name: 'Torre Direita',
                towerAsset: `torre_d_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.881,
                towerBaseY: this.scale.height,
                towerTargetWidth: 190 * baseScale,
                towerTargetHeight: 782 * baseScale,
                towerDepth: 18,
                cannonAsset: 'canhao_d',
                cannonX: this.scale.width * 0.881,
                cannonY: this.scale.height * 0.563,
                cannonTargetWidth: 39 * baseScale,
                cannonTargetHeight: 125 * baseScale,
                cannonDepth: 10
            }
        ];

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
                        this.endLevel(false);
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
            const height = this.scale.height;
            console.log(`Resize: width=${width}, height=${height}`);

            const baseScale = Math.min(width / 900, height / 1600); // Usa o menor para evitar stretch vertical
            if (this.gameBackground && this.gameBackground.active) {
                this.gameBackground.setPosition(width / 2, 0);
                this.gameBackground.setScale(baseScale);
            }

            if (this.silhuetaSprite && this.silhuetaSprite.active) {
                this.silhuetaSprite.setPosition(width / 2, height);
                this.silhuetaSprite.displayWidth = width;
                this.silhuetaSprite.displayHeight = 384 * (height / 1600) * baseScale;
            }

            if (this.buildingContainer && this.buildingContainer.active) {
                const buildingWidth = 510 * baseScale;
                const buildingHeight = 550 * baseScale;
                this.buildingContainer.setPosition(width / 2, height - buildingHeight - (48 * (height / 1600)));
                this.buildingContainer.setSize(buildingWidth, buildingHeight);
                this.building.setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(this.building.texture.key).source[0].height / this.textures.get(this.building.texture.key).source[0].width));
                this.building.setPosition(0, buildingHeight);
            }

            if (this.currentChamasSprite && this.currentChamasSprite.active) {
                const chamasSpriteHeight = 375 * baseScale;
                this.currentChamasSprite.setPosition(0, 550 * baseScale - (chamasSpriteHeight / 2));
                this.currentChamasSprite.setScale(0.3 * baseScale);
            }

            if (this.allTowerSprites) {
                this.allTowerSprites.forEach(tower => {
                    if (tower.sprite.active) {
                        tower.sprite.setPosition(tower.def.towerBaseX, height);
                        tower.sprite.displayWidth = tower.def.towerTargetWidth;
                        tower.sprite.displayHeight = tower.def.towerTargetHeight;
                    }
                });
            }
            if (this.allCannonsSprites) {
                this.allCannonsSprites.forEach(cannon => {
                    if (cannon.sprite.active) {
                        cannon.sprite.setPosition(cannon.def.cannonX, cannon.def.cannonY);
                        cannon.sprite.displayWidth = cannon.def.cannonTargetWidth;
                        cannon.sprite.displayHeight = cannon.def.cannonTargetHeight;
                    }
                });
            }

            if (this.timerText && this.timerText.active) {
                this.timerText.setPosition(20, 20);
                this.timerText.setFontSize(40 * baseScale);
            }

            if (missiles) {
                missiles.forEach(missile => {
                    if (missile && missile.active) {
                        missile.displayWidth = 10 * baseScale;
                        missile.displayHeight = 30 * baseScale;
                        missile.targetX = Phaser.Math.Between(width / 2 - 255 * baseScale, width / 2 + 255 * baseScale);
                        missile.targetY = height - 315 * baseScale;
                    }
                });
            }
            if (antiMissiles) {
                antiMissiles.forEach(anti => {
                    if (anti && anti.active) {
                        anti.displayWidth = 15 * baseScale;
                        anti.displayHeight = 60 * baseScale;
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
                    const baseScale = Math.min(this.scale.width / 900, this.scale.height / 1600);
                    const spawnX = Phaser.Math.Between(0, this.scale.width);
                    const spawnY = 0;
                    const missile = this.add.rectangle(spawnX, spawnY, 10 * baseScale, 30 * baseScale, 0x00ff00);
                    missile.speed = baseSpeed + this.waveCount * speedIncrementPerWave;
                    missile.targetX = Phaser.Math.Between(this.scale.width / 2 - 255 * baseScale, this.scale.width / 2 + 255 * baseScale);
                    missile.targetY = this.scale.height - 315 * baseScale;
                    missile.displayWidth = 10 * baseScale;
                    missile.displayHeight = 30 * baseScale;
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
            const baseScale = Math.min(this.scale.width / 900, this.scale.height / 1600);
            const antiMissile = this.add.image(launchX, launchY, 'antimissile');
            antiMissile.setOrigin(0.5, 1);
            antiMissile.setDepth(5);
            antiMissile.displayWidth = 12 * baseScale;
            antiMissile.displayHeight = 76 * baseScale;
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
        const baseScale = Math.min(this.scale.width / 900, this.scale.height / 1600);
        const buildingWidth = 510 * baseScale;
        const buildingHeight = 550 * baseScale;
        const key = this.buildingState === 1 ? `${levelPrefix}_dano1` : this.buildingState === 2 ? `${levelPrefix}_dano2` : `${levelPrefix}_destruido`;
        const newHeight = buildingHeight * (this.textures.get(key).source[0].height / this.textures.get(key).source[0].width);
        this.building.setTexture(key).setDisplaySize(buildingWidth, newHeight).setPosition(0, buildingHeight);
        this.building.setDepth(920);
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

        const baseScale = Math.min(this.scale.width / 900, this.scale.height / 1600);
        this.resultText = this.add.text(this.scale.width / 2, this.scale.height * 0.25,
            success ? 'SUCESSO!' : 'FALHA!',
            {
                fontFamily: 'VT323',
                fontSize: '60px' * baseScale,
                color: success ? '#00FF00' : '#FF0000',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(1500);
        this.resultText.setAlpha(0);
        this.tweens.add({
            targets: this.resultText,
            alpha: { from: 0, to: 1 },
            duration: 2000
        });

        this.statsText = this.add.text(this.scale.width / 2, this.scale.height * 0.30,
            `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
            {
                fontFamily: 'VT323',
                fontSize: '40px' * baseScale,
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 20
            }
        ).setOrigin(0.5).setDepth(1501);
        this.statsText.setAlpha(0);
        this.tweens.add({
            targets: this.statsText,
            alpha: { from: 0, to: 1 },
            duration: 2000
        });

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / 1600)), 200 * baseScale, 80 * baseScale, 0xFFFF00);
        this.continueButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
        this.continueButton.setDepth(2000);
        this.continueButton.setVisible(true);
        this.continueButton.setAlpha(1);
        this.continueButton.setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / 1600)), 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: '30px' * baseScale,
            color: '#000000'
        }).setOrigin(0.5).setDepth(2001);
        this.continueText.setVisible(true);

        const updateButtonState = (button, text, hover) => {
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
            text.setColor('#000000');
        };

        this.continueButton.defaultFillColor = 0xFFFF00;
        this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
        this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
        this.continueButton.on('pointerdown', () => {
            console.log('Botão clicado - pointerdown');
            this.continueButton.setFillStyle(0xFFFF00, 1);
            this.continueText.setColor('#000000');
            this.continueButton.once('pointerup', () => {
                console.log('Botão clicado - pointerup');
                console.log(`currentLevel: ${currentLevel}, TOTAL_LEVELS: ${TOTAL_LEVELS}`);
                updateButtonState(this.continueButton, this.continueText, false);
                const totalLevels = typeof TOTAL_LEVELS !== 'undefined' ? TOTAL_LEVELS : 10;
                if (currentLevel < totalLevels) {
                    currentLevel++;
                    gameEnded = false;
                    this.scene.start('BriefingScene');
                } else {
                    console.log('Entrando no modo FIM DE JOGO');
                    if (this.gameBackground) this.gameBackground.destroy();
                    if (this.resultText) this.resultText.destroy();
                    if (this.statsText) this.statsText.destroy();
                    this.continueButton.destroy();
                    this.continueText.destroy();

                    this.gameBackground = this.add.image(this.scale.width / 2, 0, 'fundo1')
                        .setOrigin(0.5, 0)
                        .setScale(baseScale)
                        .setDepth(1000);

                    this.endText = this.add.text(this.scale.width / 2, this.scale.height / 2 - (200 * (this.scale.height / 1600)), 'FIM DE JOGO!', {
                        fontFamily: 'VT323',
                        fontSize: '80px' * baseScale,
                        color: '#FFFFFF',
                        align: 'center'
                    }).setOrigin(0.5).setDepth(1200);
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

                    this.performanceText = this.add.text(this.scale.width / 2, this.scale.height / 2, performanceMessage, {
                        fontFamily: 'VT323',
                        fontSize: '40px' * baseScale,
                        color: '#FFFFFF',
                        align: 'center',
                        lineSpacing: 20,
                        wordWrap: { width: 800 * baseScale }
                    }).setOrigin(0.5).setDepth(1201);
                    this.performanceText.setAlpha(0);
                    this.tweens.add({
                        targets: this.performanceText,
                        alpha: { from: 0, to: 1 },
                        duration: 2000
                    });

                    this.statsText = this.add.text(this.scale.width / 2, this.scale.height / 2 + (150 * (this.scale.height / 1600)),
                        `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
                        {
                            fontFamily: 'VT323',
                            fontSize: '40px' * baseScale,
                            color: '#FFFFFF',
                            align: 'center',
                            lineSpacing: 20
                        }
                    ).setOrigin(0.5).setDepth(1201);
                    this.statsText.setAlpha(0);
                    this.tweens.add({
                        targets: this.statsText,
                        alpha: { from: 0, to: 1 },
                        duration: 2000
                    });

                    this.restartButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (250 * (this.scale.height / 1600)), 300 * baseScale, 100 * baseScale, 0x00FF00);
                    this.restartButton.setStrokeStyle(4 * baseScale, 0xFFFFFF);
                    this.restartButton.setDepth(2000);
                    this.restartButton.setInteractive({ useHandCursor: true });
                    this.restartText = this.add.text(this.scale.width / 2, this.scale.height - (250 * (this.scale.height / 1600)), 'REINICIAR', {
                        fontFamily: 'VT323',
                        fontSize: '40px' * baseScale,
                        color: '#000000'
                    }).setOrigin(0.5).setDepth(2001);

                    this.restartButton.defaultFillColor = 0x00FF00;
                    this.restartButton.on('pointerover', () => updateButtonState(this.restartButton, this.restartText, true), this);
                    this.restartButton.on('pointerout', () => updateButtonState(this.restartButton, this.restartText, false), this);
                    this.restartButton.on('pointerdown', () => {
                        console.log('Botão reiniciar clicado - pointerdown');
                        this.restartButton.setFillStyle(0x00FF00, 1);
                        this.restartText.setColor('#000000');
                        this.restartButton.once('pointerup', () => {
                            console.log('Botão reiniciar clicado - pointerup');
                            updateButtonState(this.restartButton, this.restartText, false);
                            destroyedCount = 0;
                            preservedCount = 0;
                            currentLevel = 1;
                            gameEnded = false;
                            this.scene.start('IntroScene');
                        }, this);
                    }, this);
                }
            }, this);
        }, this);
    }

    update() {
        if (gameEnded) return;
        const baseScale = Math.min(this.scale.width / 900, this.scale.height / 1600);
        const collisionTopY = this.scale.height - 315 * baseScale;
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