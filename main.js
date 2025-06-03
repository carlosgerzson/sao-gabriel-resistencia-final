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
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
        this.gameBackgroundRect = graphics;
        console.log("Fundo com gradiente renderizado");

        this.stars = [];
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height),
                Phaser.Math.Between(1, 3),
                0xFFFFFF
            ).setAlpha(Phaser.Math.FloatBetween(0.2, 1));
            this.stars.push(star);
        }
        console.log("Estrelas renderizadas");

        const levelDescriptions = [
            "Nível 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Nível 2: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Nível 3: Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            "Nível 4: Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "Nível 5: Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
            "Nível 6: Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
            "Nível 7: At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.",
            "Nível 8: Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
            "Nível 9: Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
            "Nível 10: Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat."
        ];

        this.briefingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 
            levelDescriptions[currentLevel - 1], 
            {
                fontFamily: 'VT323',
                fontSize: `${40 * (this.scale.width / BASE_WIDTH)}px`,
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 20,
                wordWrap: { width: this.scale.width * 0.8 }
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

        this.startButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 200, 80, 0xFFFF00);
        this.startButton.setStrokeStyle(2, 0xFFFFFF);
        this.startButton.setDepth(101);
        this.startButton.setInteractive({ useHandCursor: true });
        this.startText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 'INICIAR', {
            fontFamily: 'VT323',
            fontSize: `${30 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#000000'
        }).setOrigin(0.5).setDepth(102);

        // Eventos para hover e toque
        const updateButtonState = (button, text, hover) => {
            console.log(`Estado do botão ${text.text}: ${hover ? 'hover' : 'out'}`);
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
            text.setColor(hover ? '#000000' : '#000000');
        };

        this.startButton.defaultFillColor = 0xFFFF00; // Salvar a cor padrão
        this.startButton.on('pointerover', () => updateButtonState(this.startButton, this.startText, true), this);
        this.startButton.on('pointerout', () => updateButtonState(this.startButton, this.startText, false), this);
        this.startButton.on('pointerdown', () => {
            console.log("Botão INICIAR clicado (pointerdown)");
            this.startButton.setFillStyle(0xFFFF00, 1);
            this.startText.setColor('#000000');
            this.startButton.once('pointerup', () => {
                console.log("Botão INICIAR liberado (pointerup)");
                this.scene.start('GameScene');
            }, this);
        }, this);

        console.log("Botão INICIAR renderizado");

        // Garantir foco no canvas ao interagir
        this.input.on('pointerdown', (pointer) => {
            console.log(`Clique detectado em: x=${pointer.x}, y=${pointer.y} (world: x=${pointer.worldX}, y=${pointer.worldY})`);
            this.game.canvas.focus();
        });

        this.scale.on('resize', resize, this);
        resize.call(this);
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
        const spriteNames = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'];
        spriteNames.forEach(name => {
            this.load.image(`chamas${name}`, `assets/chamas1/chamas${name}.png`);
        });
        const levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.load.image(`${levelPrefix}_fundo`, `${levelPrefix}_fundo.png`);
        this.load.image(`${levelPrefix}_predio`, `${levelPrefix}_predio.png`);
        this.load.image(`${levelPrefix}_dano1`, `${levelPrefix}_dano1.png`);
        this.load.image(`${levelPrefix}_dano2`, `${levelPrefix}_dano2.png`);
        this.load.image(`${levelPrefix}_destruido`, `${levelPrefix}_destruido.png`);
    }

    create() {
        console.log("Dimensões da tela: width=", this.scale.width, ", height=", this.scale.height);

        this.cameras.main.setBackgroundColor('#000000');

        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x8B0000, 0x8B0000, 0x000000, 0x000000, 1);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
        this.gameBackgroundRect = graphics;

        this.stars = [];
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height),
                Phaser.Math.Between(1, 3),
                0xFFFFFF
            ).setAlpha(Phaser.Math.FloatBetween(0.2, 1));
            this.stars.push(star);
        }

        this.timerText = this.add.text(20 * (this.scale.width / BASE_WIDTH), 20 * (this.scale.height / BASE_HEIGHT), '00:20', {
            fontFamily: 'VT323',
            fontSize: `${40 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#FFFFFF'
        }).setOrigin(0, 0).setDepth(100);

        this.timeLeft = 30;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                let minutes = Math.floor(this.timeLeft / 60);
                let seconds = this.timeLeft % 60;
                this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                if (this.timeLeft <= 0) {
                    if (this.buildingState < 3) {
                        this.endLevel(true); // Sucesso se o prédio não foi destruído
                    } else {
                        this.endLevel(false); // Falha se o prédio foi destruído
                    }
                }
            },
            loop: true
        });

        const buildingWidth = 510;
        const buildingHeight = 550;
        this.buildingContainer = this.add.container(this.scale.width / 2, this.scale.height - buildingHeight - (48 * (this.scale.height / BASE_HEIGHT)));
        this.buildingContainer.setSize(buildingWidth, buildingHeight);
        this.buildingContainer.setDepth(900);
        console.log("buildingContainer posicionado em x=", this.buildingContainer.x, ", y=", this.buildingContainer.y);

        const debugRect = this.add.graphics();
        debugRect.lineStyle(2, 0x00FF00);
        debugRect.strokeRect(this.scale.width / 2 - (buildingWidth / 2), this.scale.height - buildingHeight - (48 * (this.scale.height / BASE_HEIGHT)), buildingWidth, buildingHeight);
        this.debugRect = debugRect;

        const levelPrefix = `nivel${currentLevel}/alvo${currentLevel}`;
        this.background = this.add.image(0, buildingHeight, `${levelPrefix}_fundo`).setOrigin(0.5, 1).setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(`${levelPrefix}_fundo`).source[0].height / this.textures.get(`${levelPrefix}_fundo`).source[0].width));
        this.background.setPosition(0, buildingHeight);
        this.background.setDepth(900);
        this.buildingContainer.add(this.background);

        const chamasSpriteHeight = 375 * 1.0;
        this.currentChamasSprite = this.add.sprite(0, 550 - (chamasSpriteHeight / 2), 'chamas101');
        this.buildingContainer.add(this.currentChamasSprite);
        this.currentChamasSprite.setDepth(910);
        this.currentChamasSprite.setScale(1.0);
        this.currentChamasSprite.setVisible(false);
        console.log("chamasSprite inicial criado em x=", this.currentChamasSprite.x, ", y=", this.currentChamasSprite.y, " dentro do buildingContainer, visível=", this.currentChamasSprite.visible);

        this.building = this.add.image(0, buildingHeight, `${levelPrefix}_predio`).setOrigin(0.5, 1).setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(`${levelPrefix}_predio`).source[0].height / this.textures.get(`${levelPrefix}_predio`).source[0].width));
        this.building.setPosition(0, buildingHeight);
        this.building.setDepth(920);
        this.buildingContainer.add(this.building);

        this.silhuetaSprite = this.add.image(this.scale.width / 2, this.scale.height, 'silhueta_urbana').setOrigin(0.5, 1).setDepth(20);
        this.silhuetaSprite.displayWidth = this.scale.width;
        this.silhuetaSprite.displayHeight = 384 * (this.scale.height / BASE_HEIGHT);

        const towerAndCannonDefinitions = [
            {
                name: 'Torre Esquerda',
                towerAsset: 'torre_e',
                towerBaseX: this.scale.width * 0.144,
                towerBaseY: this.scale.height,
                towerTargetWidth: 218 * (this.scale.width / BASE_WIDTH),
                towerTargetHeight: 709 * (this.scale.height / BASE_HEIGHT),
                towerDepth: 30,
                cannonAsset: 'canhao_e',
                cannonX: this.scale.width * 0.144,
                cannonY: this.scale.height * 0.613,
                cannonTargetWidth: 39 * (this.scale.width / BASE_WIDTH),
                cannonTargetHeight: 141 * (this.scale.height / BASE_HEIGHT),
                cannonDepth: 10
            },
            {
                name: 'Torre Central',
                towerAsset: 'torre_c',
                towerBaseX: this.scale.width * 0.62,
                towerBaseY: this.scale.height,
                towerTargetWidth: 148 * (this.scale.width / BASE_WIDTH),
                towerTargetHeight: 637 * (this.scale.height / BASE_HEIGHT),
                towerDepth: 18,
                cannonAsset: 'canhao_c',
                cannonX: this.scale.width * 0.62,
                cannonY: this.scale.height * 0.647,
                cannonTargetWidth: 33 * (this.scale.width / BASE_WIDTH),
                cannonTargetHeight: 103 * (this.scale.height / BASE_HEIGHT),
                cannonDepth: 10
            },
            {
                name: 'Torre Direita',
                towerAsset: 'torre_d',
                towerBaseX: this.scale.width * 0.881,
                towerBaseY: this.scale.height,
                towerTargetWidth: 190 * (this.scale.width / BASE_WIDTH),
                towerTargetHeight: 782 * (this.scale.height / BASE_HEIGHT),
                towerDepth: 18,
                cannonAsset: 'canhao_d',
                cannonX: this.scale.width * 0.881,
                cannonY: this.scale.height * 0.563,
                cannonTargetWidth: 39 * (this.scale.width / BASE_WIDTH),
                cannonTargetHeight: 125 * (this.scale.height / BASE_HEIGHT),
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

        const spriteNames = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114'];
        const frames = spriteNames.map(name => ({ key: `chamas${name}` }));
        this.anims.create({
            key: 'chamasAnim',
            frames: frames,
            frameRate: 16,
            repeat: -1
        });
        console.log("Animação 'chamasAnim' criada com 14 frames PNG");

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
            this.game.canvas.focus();
        });

        this.onAntiMissileHit = function(x, y) {
            console.log(`Explosão criada em x=${x}, y=${y}`);
            const explosionCircle = this.add.circle(x, y, 0, 0xffff00, 0.8);
            explosionCircle.setDepth(920); // Aumentado para ficar acima das chamas (910)
            const explosionVisualRadius = 100 * (this.scale.width / BASE_WIDTH);
            const explosionAnimationDuration = 500;
            this.tweens.add({
                targets: explosionCircle,
                radius: explosionVisualRadius,
                alpha: 0,
                ease: 'Quadratic.Out',
                duration: explosionAnimationDuration,
                onComplete: () => {
                    console.log(`Explosão em x=${x}, y=${y} concluída e destruída`);
                    explosionCircle.destroy();
                    this.handleExplosionCollision(x, y, explosionVisualRadius + (50 * (this.scale.width / BASE_WIDTH)));
                }
            });
        }.bind(this);

        this.onBuildingHit = function(x, y) {
            console.log(`onBuildingHit chamado em x=${x}, y=${y}, buildingState=${this.buildingState}`);
            console.log("Dimensões no onBuildingHit: width=", this.scale.width, ", height=", this.scale.height);

            const adjustedY = this.scale.height * 0.5;
            console.log("Posição ajustada: x=", x, ", y=", adjustedY);

            let containerX = x - this.buildingContainer.x;
            let containerY = (adjustedY - this.buildingContainer.y);
            containerX = Math.max(0, containerX);
            containerY = Math.max(0, containerY);
            console.log("Coordenadas globais:", x, adjustedY, "locais:", containerX, containerY);

            if (this.currentChamasSprite && this.currentChamasSprite.active) {
                if (this.currentChamasSprite.visible) {
                    console.log("chamasSprite já visível, reiniciando animação");
                    this.currentChamasSprite.stop();
                }
                this.currentChamasSprite.setVisible(true);
                if (this.anims.get('chamasAnim')) {
                    this.currentChamasSprite.play('chamasAnim');
                    console.log("Animação 'chamasAnim' iniciada em loop");
                } else {
                    console.error("Animação 'chamasAnim' não encontrada");
                }
            } else {
                console.error("chamasSprite não encontrado ou destruído");
            }

            if (this.buildingState < 3) {
                this.buildingState++;
                console.log(`Novo buildingState: ${this.buildingState}`);
                this.updateBuildingState(`nivel${currentLevel}/alvo${currentLevel}`);
                if (this.buildingState === 3) {
                    this.endLevel(false);
                }
            }
        }.bind(this);

        this.handleExplosionCollision = function(explosionX, explosionY, explosionRadius) {
            console.log(`Verificando colisões de explosão em x=${explosionX}, y=${explosionY}, raio=${explosionRadius}`);
            for (let i = missiles.length - 1; i >= 0; i--) {
                const missile = missiles[i];
                if (!missile || !missile.active) {
                    missiles.splice(i, 1);
                    continue;
                }
                const distance = Phaser.Math.Distance.Between(explosionX, explosionY, missile.x, missile.y);
                if (distance < explosionRadius) {
                    console.log(`Míssil destruído em x=${missile.x}, y=${missile.y}`);
                    missile.destroy();
                    missiles.splice(i, 1);
                }
            }
        }.bind(this);

        this.scale.on('resize', resize, this);
        resize.call(this);
    }

    spawnWave() {
        if (!gameEnded) {
            this.waveCount++;
            const baseSpeed = 70;
            const speedIncrementPerWave = 20;
            const delayBetweenMissiles = 800;
            for (let i = 0; i < 2; i++) {
                this.time.delayedCall(i * delayBetweenMissiles, () => {
                    const spawnX = Phaser.Math.Between(0, this.scale.width);
                    const spawnY = 0;
                    const missile = this.add.rectangle(spawnX, spawnY, 10 * (this.scale.width / BASE_WIDTH), 30 * (this.scale.height / BASE_HEIGHT), 0x00ff00);
                    missile.speed = baseSpeed + this.waveCount * speedIncrementPerWave;
                    missile.targetX = Phaser.Math.Between(this.scale.width / 2 - 255, this.scale.width / 2 + 255);
                    missile.targetY = this.scale.height - 315;
                    missile.displayWidth = 10 * (this.scale.width / BASE_WIDTH);
                    missile.displayHeight = 30 * (this.scale.height / BASE_HEIGHT);
                    missile.setDepth(1000);
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
            antiMissile.displayWidth = 15 * (this.scale.width / BASE_WIDTH);
            antiMissile.displayHeight = 60 * (this.scale.height / BASE_HEIGHT);
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
        console.log(`Atualizando buildingState para ${this.buildingState} com textura ${levelPrefix}`);
        if (this.buildingState >= 1 && !this.background) {
            const buildingWidth = 510;
            const buildingHeight = 550;
            this.background = this.add.image(0, buildingHeight, `${levelPrefix}_fundo`).setOrigin(0.5, 1).setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(`${levelPrefix}_fundo`).source[0].height / this.textures.get(`${levelPrefix}_fundo`).source[0].width));
            this.background.setPosition(0, buildingHeight);
            this.background.setDepth(900);
            this.buildingContainer.add(this.background);
        }
        const textureKey = this.buildingState === 1 ? `${levelPrefix}_dano1` : this.buildingState === 2 ? `${levelPrefix}_dano2` : `${levelPrefix}_destruido`;
        const buildingWidth = 510;
        const buildingHeight = 550;
        const newHeight = buildingHeight * (this.textures.get(textureKey).source[0].height / this.textures.get(textureKey).source[0].width);
        this.building.setTexture(textureKey).setDisplaySize(buildingWidth, newHeight).setPosition(0, buildingHeight);
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
        console.log("endLevel chamado, jogo pausado via gameEnded");

        if (success) {
            preservedCount++;
        } else {
            destroyedCount++;
        }

        this.resultText = this.add.text(this.scale.width / 2, this.scale.height * 0.25, 
            success ? 'SUCESSO!' : 'FALHA!',
            {
                fontFamily: 'VT323',
                fontSize: `${60 * (this.scale.width / BASE_WIDTH)}px`,
                color: success ? '#00FF00' : '#FF0000',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(100);
        console.log("resultText criado: ", this.resultText.text, "em x=", this.resultText.x, "y=", this.resultText.y);
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
                fontSize: `${40 * (this.scale.width / BASE_WIDTH)}px`,
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 20
            }
        ).setOrigin(0.5).setDepth(100);
        console.log("statsText criado: ", this.statsText.text, "em x=", this.statsText.x, "y=", this.statsText.y);
        this.statsText.setAlpha(0);
        this.tweens.add({
            targets: this.statsText,
            alpha: { from: 0, to: 1 },
            duration: 2000
        });

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 200, 80, 0xFFFF00);
        this.continueButton.setStrokeStyle(2, 0xFFFFFF);
        this.continueButton.setDepth(1001);
        this.continueButton.setVisible(true);
        this.continueButton.setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: `${30 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#000000'
        }).setOrigin(0.5).setDepth(1002);
        this.continueText.setVisible(true);

        console.log("Botão CONTINUAR criado em x=", this.continueButton.x, ", y=", this.continueButton.y, "visível=", this.continueButton.visible, "depth=", this.continueButton.depth);

        const updateButtonState = (button, text, hover) => {
            console.log(`Estado do botão ${text.text}: ${hover ? 'hover' : 'out'}`);
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
            text.setColor(hover ? '#000000' : '#000000');
        };

        this.continueButton.defaultFillColor = 0xFFFF00;
        this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
        this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
        this.continueButton.on('pointerdown', () => {
            console.log("Botão CONTINUAR clicado (pointerdown)");
            this.continueButton.setFillStyle(0xFFFF00, 1);
            this.continueText.setColor('#000000');
            this.continueButton.once('pointerup', () => {
                console.log("Botão CONTINUAR liberado (pointerup)");
                updateButtonState(this.continueButton, this.continueText, false);
                if (currentLevel < TOTAL_LEVELS) {
                    currentLevel++;
                    gameEnded = false;
                    this.scene.start('BriefingScene');
                } else {
                    this.gameBackgroundRect.clear();
                    this.gameBackgroundRect.fillGradientStyle(0xFFD700, 0xFFD700, 0xFF4500, 0xFF4500, 1);
                    this.gameBackgroundRect.fillRect(0, 0, this.scale.width, this.scale.height);

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

                    this.endText = this.add.text(this.scale.width / 2, this.scale.height / 2 - (200 * (this.scale.height / BASE_HEIGHT)), 'FIM DE JOGO!', {
                        fontFamily: 'VT323',
                        fontSize: `${80 * (this.scale.width / BASE_WIDTH)}px`,
                        color: '#FFFFFF',
                        align: 'center'
                    }).setOrigin(0.5).setDepth(1001);
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
                        fontSize: `${40 * (this.scale.width / BASE_WIDTH)}px`,
                        color: '#FFFFFF',
                        align: 'center',
                        lineSpacing: 20,
                        wordWrap: { width: 800 * (this.scale.width / BASE_WIDTH) }
                    }).setOrigin(0.5).setDepth(1001);
                    this.performanceText.setAlpha(0);
                    this.tweens.add({
                        targets: this.performanceText,
                        alpha: { from: 0, to: 1 },
                        duration: 2000
                    });

                    this.statsText = this.add.text(this.scale.width / 2, this.scale.height / 2 + (150 * (this.scale.height / BASE_HEIGHT)), 
                        `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
                        {
                            fontFamily: 'VT323',
                            fontSize: `${40 * (this.scale.width / BASE_WIDTH)}px`,
                            color: '#FFFFFF',
                            align: 'center',
                            lineSpacing: 20
                        }
                    ).setOrigin(0.5).setDepth(1001);
                    this.statsText.setAlpha(0);
                    this.tweens.add({
                        targets: this.statsText,
                        alpha: { from: 0, to: 1 },
                        duration: 2000
                    });

                    this.restartButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (250 * (this.scale.height / BASE_HEIGHT)), 300, 100, 0x00FF00);
                    this.restartButton.setStrokeStyle(4, 0xFFFFFF);
                    this.restartButton.setDepth(1001);
                    this.restartButton.setInteractive({ useHandCursor: true });
                    this.restartText = this.add.text(this.scale.width / 2, this.scale.height - (250 * (this.scale.height / BASE_HEIGHT)), 'REINICIAR', {
                        fontFamily: 'VT323',
                        fontSize: `${40 * (this.scale.width / BASE_WIDTH)}px`,
                        color: '#000000'
                    }).setOrigin(0.5).setDepth(1002);

                    this.restartButton.defaultFillColor = 0x00FF00;
                    this.restartButton.on('pointerover', () => updateButtonState(this.restartButton, this.restartText, true), this);
                    this.restartButton.on('pointerout', () => updateButtonState(this.restartButton, this.restartText, false), this);
                    this.restartButton.on('pointerdown', () => {
                        console.log("Botão REINICIAR clicado (pointerdown)");
                        this.restartButton.setFillStyle(0x00FF00, 1);
                        this.restartText.setColor('#000000');
                        this.restartButton.once('pointerup', () => {
                            console.log("Botão REINICIAR liberado (pointerup)");
                            updateButtonState(this.restartButton, this.restartText, false);
                            destroyedCount = 0;
                            preservedCount = 0;
                            currentLevel = 1;
                            gameEnded = false;
                            this.scene.start('BriefingScene');
                        }, this);
                    }, this);
                }
            }, this);
        }, this);

        this.scale.on('resize', resize, this);
        resize.call(this);
    }

    update() {
        if (gameEnded) return;
        console.log("Update rodando...");
        const collisionTopY = this.scale.height - 315;
        const collisionBottomY = collisionTopY + 50;
        const collisionLeftX = this.scale.width / 2 - 255;
        const collisionRightX = this.scale.width / 2 + 255;

        console.log(`Área de colisão: y de ${collisionTopY} a ${collisionBottomY}, x de ${collisionLeftX} a ${collisionRightX}`);

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
                console.log(`Colisão detectada com o prédio em x=${missile.x}, y=${missile.y}`);
                this.onBuildingHit(missile.x, missile.y);
                missile.destroy();
                missiles.splice(i, 1);
            } else if (missile.y > this.scale.height) {
                console.log(`Míssil ${i} passou do limite inferior da tela`);
                missile.destroy();
                missiles.splice(i, 1);
            }
        }

        if (missiles.length === 0 && this.waveCount < 5) {
            this.spawnWave();
        }
    }
}

function resize() {
    if (this.gameBackgroundRect && this.gameBackgroundRect.active) {
        this.gameBackgroundRect.clear();
        this.gameBackgroundRect.fillGradientStyle(0x8B0000, 0x8B0000, 0x000000, 0x000000, 1);
        this.gameBackgroundRect.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    if (this.stars) {
        this.stars.forEach(star => {
            if (star.active) {
                star.x = Phaser.Math.Between(0, this.scale.width);
                star.y = Phaser.Math.Between(0, this.scale.height);
                star.setScale(1);
            }
        });
    }

    if (this.briefingText && this.briefingText.active) {
        this.briefingText.setPosition(this.scale.width / 2, this.scale.height / 2);
        this.briefingText.setFontSize(40 * (this.scale.width / BASE_WIDTH));
        this.briefingText.setWordWrapWidth(this.scale.width * 0.8);
    }

    if (this.startButton && this.startButton.active) {
        this.startButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
        this.startButton.setSize(200 * (this.scale.width / BASE_WIDTH), 80 * (this.scale.height / BASE_HEIGHT));
        this.startButton.setInteractive(); // Reaplicar interatividade
        this.startText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
        this.startText.setFontSize(30 * (this.scale.width / BASE_WIDTH));
    }

    if (this.silhuetaSprite && this.silhuetaSprite.active) {
        this.silhuetaSprite.setPosition(this.scale.width / 2, this.scale.height);
        this.silhuetaSprite.displayWidth = this.scale.width;
        this.silhuetaSprite.displayHeight = 384 * (this.scale.height / BASE_HEIGHT);
    }

    if (this.buildingContainer && this.buildingContainer.active) {
        const buildingWidth = 510;
        const buildingHeight = 550;
        this.buildingContainer.setPosition(this.scale.width / 2, this.scale.height - buildingHeight - (48 * (this.scale.height / BASE_HEIGHT)));
        this.buildingContainer.setSize(buildingWidth, buildingHeight);
        this.background.setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(`nivel${currentLevel}/alvo${currentLevel}_fundo`).source[0].height / this.textures.get(`nivel${currentLevel}/alvo${currentLevel}_fundo`).source[0].width));
        this.background.setPosition(0, buildingHeight);
        this.building.setDisplaySize(buildingWidth, buildingHeight * (this.textures.get(this.building.texture.key).source[0].height / this.textures.get(this.building.texture.key).source[0].width));
        this.building.setPosition(0, buildingHeight);
    }

    if (this.currentChamasSprite && this.currentChamasSprite.active) {
        const chamasSpriteHeight = 375 * 1.0;
        this.currentChamasSprite.setPosition(0, 550 - (chamasSpriteHeight / 2));
    }

    if (this.debugRect && this.debugRect.active) {
        const buildingWidth = 510;
        const buildingHeight = 550;
        this.debugRect.clear();
        this.debugRect.lineStyle(2, 0x00FF00);
        this.debugRect.strokeRect(this.scale.width / 2 - (buildingWidth / 2), this.scale.height - buildingHeight - (48 * (this.scale.height / BASE_HEIGHT)), buildingWidth, buildingHeight);
    }

    if (this.timerText && this.timerText.active) {
        this.timerText.setPosition(20 * (this.scale.width / BASE_WIDTH), 20 * (this.scale.height / BASE_HEIGHT));
        this.timerText.setFontSize(40 * (this.scale.width / BASE_WIDTH));
    }

    if (missiles) {
        missiles.forEach(missile => {
            if (missile && missile.active) {
                missile.displayWidth = 10 * (this.scale.width / BASE_WIDTH);
                missile.displayHeight = 30 * (this.scale.height / BASE_HEIGHT);
                missile.targetX = Phaser.Math.Between(this.scale.width / 2 - 255, this.scale.width / 2 + 255);
                missile.targetY = this.scale.height - 315;
            }
        });
    }

    if (antiMissiles) {
        antiMissiles.forEach(anti => {
            if (anti && anti.active) {
                anti.displayWidth = 15 * (this.scale.width / BASE_WIDTH);
                anti.displayHeight = 60 * (this.scale.height / BASE_HEIGHT);
            }
        });
    }

    if (this.allTowerSprites) {
        this.allTowerSprites.forEach(tower => {
            if (tower.sprite.active) {
                tower.sprite.setPosition(tower.def.towerBaseX, tower.def.towerBaseY);
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

    if (this.resultText && this.resultText.active) {
        this.resultText.setPosition(this.scale.width / 2, this.scale.height * 0.25);
        this.resultText.setFontSize(60 * (this.scale.width / BASE_WIDTH));
    }

    if (this.statsText && this.statsText.active) {
        this.statsText.setPosition(this.scale.width / 2, this.scale.height * 0.30);
        this.statsText.setFontSize(40 * (this.scale.width / BASE_WIDTH));
    }

    if (this.performanceText && this.performanceText.active) {
        this.performanceText.setPosition(this.scale.width / 2, this.scale.height / 2);
        this.performanceText.setFontSize(40 * (this.scale.width / BASE_WIDTH));
    }

    if (this.continueButton && this.continueButton.active) {
        this.continueButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
        this.continueButton.setSize(200 * (this.scale.width / BASE_WIDTH), 80 * (this.scale.height / BASE_HEIGHT));
        this.continueButton.setInteractive(); // Reaplicar interatividade
        this.continueText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
        this.continueText.setFontSize(30 * (this.scale.width / BASE_WIDTH));
    }

    if (this.endText && this.endText.active) {
        this.endText.setPosition(this.scale.width / 2, this.scale.height / 2 - (200 * (this.scale.height / BASE_HEIGHT)));
        this.endText.setFontSize(80 * (this.scale.width / BASE_WIDTH));
    }

    if (this.restartButton && this.restartButton.active) {
        this.restartButton.setPosition(this.scale.width / 2, this.scale.height - (250 * (this.scale.height / BASE_HEIGHT)));
        this.restartButton.setSize(300 * (this.scale.width / BASE_WIDTH), 100 * (this.scale.height / BASE_HEIGHT));
        this.restartButton.setInteractive(); // Reaplicar interatividade
        this.restartText.setPosition(this.scale.width / 2, this.scale.height - (250 * (this.scale.height / BASE_HEIGHT)));
        this.restartText.setFontSize(40 * (this.scale.width / BASE_WIDTH));
    }
}