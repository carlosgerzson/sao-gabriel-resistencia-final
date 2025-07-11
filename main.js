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
        // Armazenar fundo como propriedade da classe
        this.fundo = this.add.image(this.scale.width / 2, 0, 'fundointro1')
            .setOrigin(0.5, 0)
            .setDisplaySize(BASE_WIDTH, BASE_HEIGHT);

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
            text.setColor('#000000');
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

        this.scale.on('resize', this.resize, this);
        this.resize();

        console.log('IntroScene.create concluído');
    }

    resize() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        if (this.fundo && this.fundo.active) {
            this.fundo.setPosition(this.scale.width / 2, 0);
            this.fundo.setScale(baseScale);
            // Adicionar padding lateral (exemplo: 20px de cada lado)
            //this.fundo.setPosition(this.scale.width / 2 + 20, 0); // Ajuste para padding à direita
        }
        if (this.continueButton && this.continueButton.active) {
            this.continueButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.continueButton.setSize(200 * baseScale, 80 * baseScale);
            this.continueButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.continueButton.setInteractive();
            this.continueText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.continueText.setFontSize(30 * baseScale);
        }
    }
}

// -------- InstructionsScene2 --------
class InstructionsScene2 extends Phaser.Scene {
    constructor() {
        super('InstructionsScene2');
    }

    preload() {
        this.load.image('fundo1', 'assets/fundo1.png');
    }

    create() {
        // Armazenar fundo como propriedade da classe
        this.fundo = this.add.image(this.scale.width / 2, 0, 'fundo1')
            .setOrigin(0.5, 0)
            .setDisplaySize(BASE_WIDTH, BASE_HEIGHT);

        const instructionsText = "BEM-VINDO AO JOGO!\n\n" +
            "Em um futuro próximo, o Império da Unidade Suprema impôs um plano global de padronização cultural.\n" +
            "Eles acreditam que todas as cidades devem ser “niveladas” – sem sotaques, sem tradições, sem identidade.\n" +
            "E para isso, começaram a invadir locais históricos, símbolo da cultura popular, apagando suas raízes.\n\n" +
            "Boa sorte, DEFENSOR!";

        this.instructionsText = this.add.text(this.scale.width / 2, this.scale.height / 2, instructionsText, {
            fontFamily: 'VT323',
            fontSize: `${48 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#e9bb00',
            align: 'center',
            lineSpacing: 20,
            wordWrap: { width: this.scale.width * 0.8 }
        }).setOrigin(0.5).setDepth(1000);

        const textBounds = this.instructionsText.getBounds();
        const padding = 20 * (this.scale.width / BASE_WIDTH);
        const offsetX = this.scale.width / 2 - textBounds.width / 2 - padding;
        const offsetY = this.scale.height / 2 - textBounds.height / 2 - padding;
        const widthWithPadding = textBounds.width + padding * 2;
        const heightWithPadding = textBounds.height + padding * 2;

        const corners = this.add.graphics();
        corners.lineStyle(4 * (this.scale.width / BASE_WIDTH), 0xe9bb00, 1);

        corners.beginPath();
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX + 45 * (this.scale.width / BASE_WIDTH), offsetY);
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX, offsetY + 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding - 45 * (this.scale.width / BASE_WIDTH), offsetY);
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding, offsetY + 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.beginPath();
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX + 45 * (this.scale.width / BASE_WIDTH), offsetY + heightWithPadding);
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX, offsetY + heightWithPadding - 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding - 45 * (this.scale.width / BASE_WIDTH), offsetY + heightWithPadding);
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding, offsetY + heightWithPadding - 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.setDepth(999);

        this.instructionsText.setAlpha(0);
        this.tweens.add({
            targets: this.instructionsText,
            alpha: { from: 0, to: 1 },
            duration: 1500
        });

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 200, 80, 0xFFFF00);
        this.continueButton.setStrokeStyle(2, 0xFFFFFF);
        this.continueButton.setDepth(1002);
        this.continueButton.setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: `${30 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#e9bb00'
        }).setOrigin(0.5).setDepth(1003);

        const updateButtonState = (button, text, hover) => {
            button.setFillStyle(hover ? 0xFFFFFF : button.defaultFillColor || 0xFFFF00, 1);
            text.setColor(hover ? '#000000' : '#000000');
        };

        this.continueButton.defaultFillColor = 0xFFFF00;
        this.continueButton.on('pointerover', () => updateButtonState(this.continueButton, this.continueText, true), this);
        this.continueButton.on('pointerout', () => updateButtonState(this.continueButton, this.continueText, false), this);
        this.continueButton.on('pointerdown', () => {
            console.log('Botão Continuar pressionado');
            this.continueButton.setFillStyle(0xFFFF00, 1);
            this.continueText.setColor('#FFFFFF');
            this.continueButton.once('pointerup', () => {
                console.log('Transição para InstructionsScene');
                this.scene.start('InstructionsScene');
            }, this);
        }, this);

        this.input.on('pointerdown', () => {
            console.log('Foco no canvas');
            this.game.canvas.focus();
        });

        this.scale.on('resize', this.resize, this);
        this.resize();

        console.log('InstructionsScene2.create concluído');
    }

    resize() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        if (this.fundo && this.fundo.active) {
            this.fundo.setPosition(this.scale.width / 2, 0);
            this.fundo.setScale(baseScale);
            // Adicionar padding lateral (exemplo: 20px de cada lado)
            //this.fundo.setPosition(this.scale.width / 2 + 20, 0); // Ajuste para padding à direita
        }
        if (this.continueButton && this.continueButton.active) {
            this.continueButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.continueButton.setSize(200 * baseScale, 80 * baseScale);
            this.continueButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.continueButton.setInteractive();
            this.continueText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.continueText.setFontSize(30 * baseScale);
        }
        if (this.instructionsText && this.instructionsText.active) {
            this.instructionsText.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.instructionsText.setFontSize(48 * baseScale);
            this.instructionsText.setWordWrapWidth(this.scale.width * 0.8);
        }
    }
}

// -------- InstructionsScene --------
class InstructionsScene extends Phaser.Scene {
    constructor() {
        super('InstructionsScene');
    }

    preload() {
        this.load.image('fundo1', 'assets/fundo1.png');
    }

    create() {
        // Armazenar fundo como propriedade da classe
        this.fundo = this.add.image(this.scale.width / 2, 0, 'fundo1')
            .setOrigin(0.5, 0)
            .setDisplaySize(BASE_WIDTH, BASE_HEIGHT);

        const instructionsText = "Mas uma cidade resiste.!\n\n" +
            "SÃO GABRIEL, com suas raízes profundas, memória viva e orgulho de sua história, se recusa a tombar.\n" +
            "Um grupo de resistência ativa torres de defesa, canhões de memória e antenas de verdade em pontos estratégicos da cidade.\n" +
            "A cada fase, um prédio histórico corre risco de ser apagado da existência.\n\n" +
            "Você é o último guardião.\n" +
            "E a cultura… não vai cair sem lutar!";

        this.instructionsText = this.add.text(this.scale.width / 2, this.scale.height / 2, instructionsText, {
            fontFamily: 'VT323',
            fontSize: `${48 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#e9bb00',
            align: 'center',
            lineSpacing: 20,
            wordWrap: { width: this.scale.width * 0.8 }
        }).setOrigin(0.5).setDepth(1000);

        const textBounds = this.instructionsText.getBounds();
        const padding = 20 * (this.scale.width / BASE_WIDTH);
        const offsetX = this.scale.width / 2 - textBounds.width / 2 - padding;
        const offsetY = this.scale.height / 2 - textBounds.height / 2 - padding;
        const widthWithPadding = textBounds.width + padding * 2;
        const heightWithPadding = textBounds.height + padding * 2;

        const corners = this.add.graphics();
        corners.lineStyle(4 * (this.scale.width / BASE_WIDTH), 0xe9bb00, 1);

        corners.beginPath();
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX + 45 * (this.scale.width / BASE_WIDTH), offsetY);
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX, offsetY + 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding - 45 * (this.scale.width / BASE_WIDTH), offsetY);
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding, offsetY + 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.beginPath();
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX + 45 * (this.scale.width / BASE_WIDTH), offsetY + heightWithPadding);
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX, offsetY + heightWithPadding - 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding - 45 * (this.scale.width / BASE_WIDTH), offsetY + heightWithPadding);
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding, offsetY + heightWithPadding - 60 * (this.scale.width / BASE_WIDTH));
        corners.strokePath();

        corners.setDepth(999);

        this.instructionsText.setAlpha(0);
        this.tweens.add({
            targets: this.instructionsText,
            alpha: { from: 0, to: 1 },
            duration: 1500
        });

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 200, 80, 0xFFFF00);
        this.continueButton.setStrokeStyle(2, 0xFFFFFF);
        this.continueButton.setDepth(1002);
        this.continueButton.setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)), 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: `${30 * (this.scale.width / BASE_WIDTH)}px`,
            color: '#e9bb00'
        }).setOrigin(0.5).setDepth(1003);

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
            console.log('Foco no canvas');
            this.game.canvas.focus();
        });

        this.scale.on('resize', this.resize, this);
        this.resize();

        console.log('InstructionsScene.create concluído');
    }

    resize() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        if (this.fundo && this.fundo.active) {
            this.fundo.setPosition(this.scale.width / 2, 0);
            this.fundo.setScale(baseScale);
        }
        if (this.continueButton && this.continueButton.active) {
            this.continueButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.continueButton.setSize(200 * baseScale, 80 * baseScale);
            this.continueButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.continueButton.setInteractive();
            this.continueText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.continueText.setFontSize(30 * baseScale);
        }
        if (this.instructionsText && this.instructionsText.active) {
            this.instructionsText.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.instructionsText.setFontSize(48 * baseScale);
            this.instructionsText.setWordWrapWidth(this.scale.width * 0.8);
        }
    }
}

// -------- BriefingScene --------
class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    preload() {
        this.load.image('fundo1', 'assets/fundo1.png');
    }

    create() {
        this.fundo = this.add.image(this.scale.width / 2, 0, 'fundo1')
            .setOrigin(0.5, 0)
            .setDisplaySize(BASE_WIDTH, BASE_HEIGHT);

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
            "ALVO 1: CLUBE COMERCIAL! \n\n" +
            "O calor das tardes no Clube Comercial, onde risos e amizades forjaram nossa história. Defenda-o, pois é o coração pulsante de nossa união que não pode se apagar.",
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
                fontSize: `${48 * (this.scale.width / BASE_WIDTH)}px`,
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

        this.scale.on('resize', this.resize, this);
        this.resize();

        console.log('BriefingScene.create concluído');
    }

    resize() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        if (this.fundo && this.fundo.active) {
            this.fundo.setPosition(this.scale.width / 2, 0);
            this.fundo.setScale(baseScale);
        }
        if (this.stars) {
            this.stars.forEach(star => {
                if (star.active) {
                    star.x = Phaser.Math.Between(0, this.scale.width);
                    star.y = Phaser.Math.Between(0, this.scale.height);
                    star.setScale(baseScale);
                }
            });
        }
        if (this.briefingText && this.briefingText.active) {
            this.briefingText.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.briefingText.setFontSize(48 * baseScale);
            this.briefingText.setWordWrapWidth(this.scale.width * 0.8);
        }
        if (this.startButton && this.startButton.active) {
            this.startButton.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.startButton.setSize(200 * baseScale, 80 * baseScale);
            this.startButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.startButton.setInteractive();
            this.startText.setPosition(this.scale.width / 2, this.scale.height - (160 * (this.scale.height / BASE_HEIGHT)));
            this.startText.setFontSize(30 * baseScale);
        }
    }
}