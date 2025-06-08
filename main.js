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

// -------- IntroScene --------
class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    preload() {
        this.load.image('fundointro1', 'assets/fundoIntro.jpeg');
    }

    create() {
        const fundo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'fundointro1')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height);

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / 1600)), 200, 80, 0xFFFF00);
        this.continueButton.setStrokeStyle(2, 0xFFFFFF);
        this.continueButton.setDepth(1001);
        this.continueButton.setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / 1600)), 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: `${30 * (this.scale.width / 900)}px`,
            color: '#000000' // Ajustado para black
        }).setOrigin(0.5).setDepth(1002);

        const updateButtonState = (button, text, hover) => {
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
            text.setColor(hover ? '#000000' : '#000000');
        };

        this.continueButton.defaultFillColor = 0xFFFF00;
        this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
        this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
        this.continueButton.on('pointerdown', () => {
            this.continueButton.setFillStyle(0xFFFF00, 1);
            this.continueText.setColor('#FFFFFF');
            this.continueButton.once('pointerup', () => {
                this.scene.start('InstructionsScene2');
            }, this);
        });

        this.input.on('pointerdown', () => {
            this.game.canvas.focus();
        });

        const resize = () => {
            if (this.cameras && this.cameras.main) {
                this.cameras.main.setSize(this.scale.width, this.scale.height);
            }
            if (fundo && fundo.active) {
                fundo.setPosition(this.scale.width / 2, this.scale.height / 2);
                fundo.setDisplaySize(this.scale.width, this.scale.height);
            }
            if (this.continueButton && this.continueButton.active) {
                this.continueButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / 1600)));
                this.continueButton.setSize(200 * (this.scale.width / 900), 80 * (this.scale.height / 1600));
                this.continueButton.setInteractive();
                this.continueText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / 1600)));
                this.continueText.setFontSize(30 * (this.scale.width / 900));
            }
        };

        this.scale.on('resize', resize, this);
        resize.call(this);
    }
}

// -------- InstructionsScene2 --------

class InstructionsScene2 extends Phaser.Scene {
    constructor() {
        super('InstructionsScene2');
    }

    preload() {
        this.load.image('fundo', 'assets/fundo_red.png');
    }

    create() {
        const fundo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'fundo')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height);

            const instructionsText = "BEM-VINDO AO JOGO!\n\n" +
                "Em um futuro próximo, o Império da Unidade Suprema impôs um plano global de padronização cultural.\n" +
                "Eles acreditam que todas as cidades devem ser “niveladas” – sem sotaques, sem tradições, sem identidade.\n" +
                "E para isso, começaram a invadir locais históricos, símbolo da cultura popular, apagando suas raízes.\n\n" +
                "Boa sorte, DEFENSOR!";

            this.instructionsText = this.add.text(this.scale.width / 2, this.scale.height / 2, instructionsText, {
                fontFamily: 'VT323',
                fontSize: `${48 * (this.scale.width / BASE_WIDTH)}px`,
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 20,
                wordWrap: { width: this.scale.width * 0.8 }
            }).setOrigin(0.5).setDepth(1000);
            this.instructionsText.setAlpha(0);
            this.tweens.add({
                targets: this.instructionsText,
                alpha: { from: 0, to: 1 },
                duration: 1500
            });

            this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 200, 80, 0xFFFF00);
            this.continueButton.setStrokeStyle(2, 0xFFFFFF);
            this.continueButton.setDepth(1001);
            this.continueButton.setInteractive({ useHandCursor: true });

            this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 'CONTINUAR', {
                fontFamily: 'VT323',
                fontSize: `${30 * (this.scale.width / BASE_WIDTH)}px`,
                color: '#000000'
            }).setOrigin(0.5).setDepth(1002);

            const updateButtonState = (button, text, hover) => {
                button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
                text.setColor(hover ? '#000000' : '#000000');
            };

            this.continueButton.defaultFillColor = 0xFFFF00;
            this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
            this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
            this.continueButton.on('pointerdown', () => {
                this.continueButton.setFillStyle(0xFFFF00, 1);
                this.continueText.setColor('#FFFFFF');
                this.continueButton.once('pointerup', () => {
                    this.scene.start('InstructionsScene');
                }, this);
            }, this);

            this.input.on('pointerdown', () => {
                this.game.canvas.focus();
            });

            const resize = () => {
                if (this.cameras && this.cameras.main) {
                    this.cameras.main.setSize(this.scale.width, this.scale.height);
                }
                if (this.instructionsText && this.instructionsText.active) {
                    this.instructionsText.setPosition(this.scale.width / 2, this.scale.height / 2);
                    this.instructionsText.setFontSize(48 * (this.scale.width / BASE_WIDTH));
                    this.instructionsText.setWordWrapWidth(this.scale.width * 0.8);
                }
                if (this.continueButton && this.continueButton.active) {
                    this.continueButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
                    this.continueButton.setSize(200 * (this.scale.width / BASE_WIDTH), 80 * (this.scale.height / BASE_HEIGHT));
                    this.continueButton.setInteractive();
                    this.continueText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
                    this.continueText.setFontSize(30 * (this.scale.width / BASE_WIDTH));
                }
            };

            this.scale.on('resize', resize, this);
            resize.call(this);
        }
    }

// -------- InstructionsScene --------
class InstructionsScene extends Phaser.Scene {
    constructor() {
        super('InstructionsScene');
    }

    preload() {
        this.load.image('fundo', 'assets/fundo_red.png');
    }

    create() {
        const fundo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'fundo')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height);

        const instructionsText = "Mas uma cidade resiste.!\n\n" +
            
            "SÃO GABRIEL, com suas raízes profundas, memória viva e orgulho de sua história, se recusa a tombar.\n" +
           
            "Um grupo de resistência ativa torres de defesa, canhões de memória e antenas de verdade em pontos estratégicos da cidade.\n" +
           
            "A cada fase, um prédio histórico corre risco de ser apagado da existência.\n\n" +
            
            "Você é o último guardião.\n" +
            "E a cultura… não vai cair sem lutar!";

        this.instructionsText = this.add.text(this.scale.width / 2, this.scale.height / 2, instructionsText, {
            fontFamily: 'VT323',
            fontSize: `${48 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#FFFFFF',
            align: 'center',
            lineSpacing: 20,
            wordWrap: { width: this.scale.width * 0.8 }
        }).setOrigin(0.5).setDepth(1000);
        this.instructionsText.setAlpha(0);
        this.tweens.add({
            targets: this.instructionsText,
            alpha: { from: 0, to: 1 },
            duration: 1500
        });

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 200, 80, 0xFFFF00);
        this.continueButton.setStrokeStyle(2, 0xFFFFFF);
        this.continueButton.setDepth(1001);
        this.continueButton.setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: `${30 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#000000'
        }).setOrigin(0.5).setDepth(1002);

        const updateButtonState = (button, text, hover) => {
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
            text.setColor(hover ? '#000000' : '#000000');
        };

        this.continueButton.defaultFillColor = 0xFFFF00;
        this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
        this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
        this.continueButton.on('pointerdown', () => {
            this.continueButton.setFillStyle(0xFFFF00, 1);
            this.continueText.setColor('#FFFFFF');
            this.continueButton.once('pointerup', () => {
                this.scene.start('BriefingScene');
            }, this);
        }, this);

        this.input.on('pointerdown', () => {
            this.game.canvas.focus();
        });

        const resize = () => {
            if (this.cameras && this.cameras.main) {
                this.cameras.main.setSize(this.scale.width, this.scale.height);
            }
            
            if (this.instructionsText && this.instructionsText.active) {
                this.instructionsText.setPosition(this.scale.width / 2, this.scale.height / 2);
                this.instructionsText.setFontSize(48 * (this.scale.width / BASE_WIDTH));
                this.instructionsText.setWordWrapWidth(this.scale.width * 0.8);
            }
            if (this.continueButton && this.continueButton.active) {
                this.continueButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
                this.continueButton.setSize(200 * (this.scale.width / BASE_WIDTH), 80 * (this.scale.height / BASE_HEIGHT));
                this.continueButton.setInteractive();
                this.continueText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
                this.continueText.setFontSize(30 * (this.scale.width / BASE_WIDTH));
            }
        };

        this.scale.on('resize', resize, this);
        resize.call(this);
    }
}

// -------- BriefingScene --------
class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    preload() {
        let colorPrefix;
        if ([1, 2, 3].includes(currentLevel)) {
            colorPrefix = 'red';
        } else if ([4, 5, 6].includes(currentLevel)) {
            colorPrefix = 'yellow';
        } else {
            colorPrefix = 'blue';
        }

        this.load.image('fundo', `assets/fundo_${colorPrefix}.png`);
        this.load.image('silhueta_urbana', `assets/silhueta_urbana_${colorPrefix}.png`);
        this.load.image('torre_e', `assets/torre_e_${colorPrefix}.png`);
        this.load.image('torre_c', `assets/torre_c_${colorPrefix}.png`);
        this.load.image('torre_d', `assets/torre_d_${colorPrefix}.png`);
    }

    create() {
        const fundo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'fundo')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height);

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
        ).setOrigin(0.5).setDepth(1200);
        this.briefingText.setAlpha(0);
        this.tweens.add({
            targets: this.briefingText,
            alpha: { from: 0, to: 1 },
            duration: 2000
        });

        this.startButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 200, 80, 0xFFFF00);
        this.startButton.setStrokeStyle(2, 0xFFFFFF);
        this.startButton.setDepth(1201);
        this.startButton.setInteractive({ useHandCursor: true });
        this.startText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 'INICIAR', {
            fontFamily: 'VT323',
            fontSize: `${30 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#000000'
        }).setOrigin(0.5).setDepth(1202);

        const updateButtonState = (button, text, hover) => {
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
            text.setColor(hover ? '#000000' : '#000000');
        };

        this.startButton.defaultFillColor = 0xFFFF00;
        this.startButton.on('pointerover', () => updateButtonState(this.startButton, this.startText, true), this);
        this.startButton.on('pointerout', () => updateButtonState(this.startButton, this.startText, false), this);
        this.startButton.on('pointerdown', () => {
            this.startButton.setFillStyle(0xFFFF00, 1);
            this.startText.setColor('#FFFFFF');
            this.startButton.once('pointerup', () => {
                this.scene.start('GameScene');
            }, this);
        }, this);

        this.input.on('pointerdown', () => {
            this.game.canvas.focus();
        });

        const resize = () => {
            if (this.cameras && this.cameras.main) {
                this.cameras.main.setSize(this.scale.width, this.scale.height);
            }
            if (fundo && fundo.active) {
                fundo.setPosition(this.scale.width / 2, this.scale.height / 2);
                fundo.setDisplaySize(this.scale.width, this.scale.height);
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
                this.startButton.setInteractive();
                this.startText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
                this.startText.setFontSize(30 * (this.scale.width / BASE_WIDTH));
            }
        };

        this.scale.on('resize', resize, this);
        resize.call(this);
    }
}