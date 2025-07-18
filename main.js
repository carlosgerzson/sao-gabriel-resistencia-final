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
    constructor() { super('IntroScene'); }
    preload() {
        this.load.image('fundo1', 'assets/fundo1.png');
        // fundo2 desativado por agora
        // this.load.image('fundo2', 'assets/fundo2.png');
        this.load.once('complete', () => {
            this.create(); // Chama create apenas após o carregamento
            this.scale.on('resize', this.resize, this); // Adiciona resize após o carregamento
            this.resize(); // Força resize inicial
        }, this);
        this.load.start(); // Inicia o carregamento
        this.game.canvas.style.backgroundColor = '#00FF00'; // Mesma cor da câmera
    }
    create() {
        const gameAreaWidth = this.scale.width;
        const gameAreaHeight = this.scale.height;
        const centerX = this.scale.width / 2;

        console.log('Create chamado', gameAreaHeight, gameAreaWidth); // Depuração
        this.cameras.main.setBackgroundColor('#00FF00');
        this.cameras.main.setBounds(0, 0, gameAreaWidth, gameAreaHeight); // Alinha à resolução real

        this.fundo1Width = this.textures.get('fundo1').getSourceImage().width; // 900
        this.fundo1Height = this.textures.get('fundo1').getSourceImage().height; // 1600
        const scaleY = gameAreaHeight / this.fundo1Height;
        const scaledWidth = this.fundo1Width * scaleY;
        console.log('ScaleY:', scaleY, 'GameAreaHeight:', gameAreaHeight, 'ScaledWidth:', scaledWidth); // Depuração
        this.gameBackground = this.add.image(centerX, 0, 'fundo1')
            .setOrigin(0.5, 0).setScale(scaleY).setDepth(0);

        const buttonScaleFactor = (gameAreaWidth < 500) ? 0.2 : 0.333; // 1/5 para <500px, 1/3 para >=500px
        console.log('ButtonScaleFactor:', buttonScaleFactor, 'gameAreaWidth:', gameAreaWidth); // Depuração
        const buttonWidth = Math.max(60, Math.min(150, scaledWidth * buttonScaleFactor));
        const buttonHeight = buttonWidth * 0.3; // Proporção ~10:3
        const buttonMargin = 20; // Margem ajustada
        const buttonY = gameAreaHeight - buttonHeight - buttonMargin; // Posição fixa no bottom
        this.continueButton = this.add.rectangle(centerX, buttonY, buttonWidth, buttonHeight, 0xFFFF00)
            .setStrokeStyle(2, 0xFFFFFF).setDepth(1001).setInteractive({ useHandCursor: true });
        const fontSize = Math.max(12, Math.min(18, buttonWidth / 6)); // Ajuste dinâmico da fonte
        this.continueText = this.add.text(centerX, buttonY, 'CONTINUAR', {
            fontFamily: 'VT323', fontSize: `${fontSize}px`, color: '#000000'
        }).setOrigin(0.5).setDepth(1002);
        this.continueButton.defaultFillColor = 0xFFFF00;
        this.continueButton.on('pointerover', () => this.continueButton.setFillStyle(0xFFFFFF, 1));
        this.continueButton.on('pointerout', () => this.continueButton.setFillStyle(0xFFFF00, 1));
        this.continueButton.on('pointerdown', () => {
            this.continueButton.setFillStyle(0xFFFF00, 1); this.continueText.setColor('#FFFFFF');
            this.continueButton.once('pointerup', () => this.scene.start('InstructionsScene2'));
        });
        this.input.on('pointerdown', () => this.game.canvas.focus());
    }
    resize() {
        if (!this.fundo1Width || !this.fundo1Height) return; // Evita erro antes do preload
        const gameAreaWidth = this.scale.width;
        const gameAreaHeight = this.scale.height;
        const centerX = this.scale.width / 2;

        console.log('Resize chamado', gameAreaHeight, gameAreaWidth, 'Canvas Height:', this.game.canvas.height); // Depuração
        // Limpa objetos antigos para evitar duplicatas
        if (this.gameBackground) this.gameBackground.destroy();
        if (this.continueButton) this.continueButton.destroy();
        if (this.continueText) this.continueText.destroy();

        const scaleY = gameAreaHeight / this.fundo1Height;
        const scaledWidth = this.fundo1Width * scaleY;
        console.log('ScaleY:', scaleY, 'GameAreaHeight:', gameAreaHeight, 'ScaledWidth:', scaledWidth); // Depuração
        this.gameBackground = this.add.image(centerX, 0, 'fundo1')
            .setOrigin(0.5, 0).setScale(scaleY).setDepth(0);

        const buttonScaleFactor = (gameAreaWidth < 500) ? 0.2 : 0.333; // 1/5 para <500px, 1/3 para >=500px
        console.log('ButtonScaleFactor:', buttonScaleFactor, 'gameAreaWidth:', gameAreaWidth); // Depuração
        const buttonWidth = Math.max(60, Math.min(150, scaledWidth * buttonScaleFactor));
        const buttonHeight = buttonWidth * 0.3; // Proporção ~10:3
        const buttonMargin = 20; // Margem ajustada
        const buttonY = gameAreaHeight - buttonHeight - buttonMargin; // Posição fixa no bottom
        this.continueButton = this.add.rectangle(centerX, buttonY, buttonWidth, buttonHeight, 0xFFFF00)
            .setStrokeStyle(2, 0xFFFFFF).setDepth(1001).setInteractive({ useHandCursor: true });
        const fontSize = Math.max(12, Math.min(18, buttonWidth / 6)); // Ajuste dinâmico da fonte
        this.continueText = this.add.text(centerX, buttonY, 'CONTINUAR', {
            fontFamily: 'VT323', fontSize: `${fontSize}px`, color: '#000000'
        }).setOrigin(0.5).setDepth(1002);
        this.continueButton.defaultFillColor = 0xFFFF00;
        this.continueButton.on('pointerover', () => this.continueButton.setFillStyle(0xFFFFFF, 1));
        this.continueButton.on('pointerout', () => this.continueButton.setFillStyle(0xFFFF00, 1));
        this.continueButton.on('pointerdown', () => {
            this.continueButton.setFillStyle(0xFFFF00, 1); this.continueText.setColor('#FFFFFF');
            this.continueButton.once('pointerup', () => this.scene.start('InstructionsScene2'));
        });

        this.game.renderer.resize(gameAreaWidth, gameAreaHeight); // Redimensiona o renderer
        this.cameras.main.setSize(gameAreaWidth, gameAreaHeight); // Alinha o tamanho da câmera
        this.cameras.main.setBounds(0, 0, gameAreaWidth, gameAreaHeight); // Alinha os limites
        this.cameras.main.centerOn(centerX, gameAreaHeight / 2);
        // Ajuste de zoom apenas para larguras muito pequenas
        if (gameAreaWidth < 200) {
            this.cameras.main.setZoom(Math.max(0.7, gameAreaWidth / 400));
        } else {
            this.cameras.main.setZoom(1);
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
        this.fundo = this.add.image(this.scale.width / 2, 0, 'fundo1')
            .setOrigin(0.5, 0);

        const instructionsText = "BEM-VINDO AO JOGO!\n\n" +
            "Em um futuro próximo, o Império da Unidade Suprema impôs um plano global de padronização cultural.\n" +
            "Eles acreditam que todas as cidades devem ser “niveladas” – sem sotaques, sem tradições, sem identidade.\n" +
            "E para isso, começaram a invadir locais históricos, símbolo da cultura popular, apagando suas raízes.\n\n" +
            "Boa sorte, DEFENSOR!";

        this.instructionsText = this.add.text(this.scale.width / 2, this.scale.height / 2, instructionsText, {
            fontFamily: 'VT323',
            fontSize: '48px',
            color: '#e9bb00',
            align: 'center',
            lineSpacing: 20,
            wordWrap: { width: this.scale.width * 0.8 }
        }).setOrigin(0.5).setDepth(1000);

        const textBounds = this.instructionsText.getBounds();
        const padding = 20;
        const offsetX = this.scale.width / 2 - textBounds.width / 2 - padding;
        const offsetY = this.scale.height / 2 - textBounds.height / 2 - padding;
        const widthWithPadding = textBounds.width + padding * 2;
        const heightWithPadding = textBounds.height + padding * 2;

        const corners = this.add.graphics();
        corners.lineStyle(4, 0xe9bb00, 1);
        corners.beginPath();
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX + 45, offsetY);
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX, offsetY + 60);
        corners.strokePath();
        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding - 45, offsetY);
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding, offsetY + 60);
        corners.strokePath();
        corners.beginPath();
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX + 45, offsetY + heightWithPadding);
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX, offsetY + heightWithPadding - 60);
        corners.strokePath();
        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding - 45, offsetY + heightWithPadding);
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding, offsetY + heightWithPadding - 60);
        corners.strokePath();
        corners.setDepth(999);

        this.instructionsText.setAlpha(0);
        this.tweens.add({
            targets: this.instructionsText,
            alpha: { from: 0, to: 1 },
            duration: 1500
        });

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - 160, 200, 80, 0xFFFF00)
            .setStrokeStyle(2, 0xFFFFFF)
            .setDepth(1002)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - 160, 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: '30px',
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
        });

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
        const minFontSize = 20; // Tamanho mínimo para telas pequenas
        if (this.fundo) {
            this.fundo.setPosition(this.scale.width / 2, 0);
            this.fundo.setScale(baseScale);
        }
        if (this.instructionsText) {
            this.instructionsText.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.instructionsText.setFontSize(Math.max(48 * baseScale, minFontSize) + 'px');
            this.instructionsText.setWordWrapWidth(this.scale.width * 0.8);
        }
        if (this.continueButton) {
            this.continueButton.setPosition(this.scale.width / 2, this.scale.height - 160 * baseScale);
            this.continueButton.setSize(200 * baseScale, 80 * baseScale);
            this.continueButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.continueButton.setInteractive();
            this.continueText.setPosition(this.scale.width / 2, this.scale.height - 160 * baseScale);
            this.continueText.setFontSize(Math.max(30 * baseScale, minFontSize) + 'px');
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
        this.fundo = this.add.image(this.scale.width / 2, 0, 'fundo1')
            .setOrigin(0.5, 0);

        const instructionsText = "Mas uma cidade resiste.!\n\n" +
            "SÃO GABRIEL, com suas raízes profundas, memória viva e orgulho de sua história, se recusa a tombar.\n" +
            "Um grupo de resistência ativa torres de defesa, canhões de memória e antenas de verdade em pontos estratégicos da cidade.\n" +
            "A cada fase, um prédio histórico corre risco de ser apagado da existência.\n\n" +
            "Você é o último guardião.\n" +
            "E a cultura… não vai cair sem lutar!";

        this.instructionsText = this.add.text(this.scale.width / 2, this.scale.height / 2, instructionsText, {
            fontFamily: 'VT323',
            fontSize: '48px',
            color: '#e9bb00',
            align: 'center',
            lineSpacing: 20,
            wordWrap: { width: this.scale.width * 0.8 }
        }).setOrigin(0.5).setDepth(1000);

        const textBounds = this.instructionsText.getBounds();
        const padding = 20;
        const offsetX = this.scale.width / 2 - textBounds.width / 2 - padding;
        const offsetY = this.scale.height / 2 - textBounds.height / 2 - padding;
        const widthWithPadding = textBounds.width + padding * 2;
        const heightWithPadding = textBounds.height + padding * 2;

        const corners = this.add.graphics();
        corners.lineStyle(4, 0xe9bb00, 1);
        corners.beginPath();
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX + 45, offsetY);
        corners.moveTo(offsetX, offsetY);
        corners.lineTo(offsetX, offsetY + 60);
        corners.strokePath();
        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding - 45, offsetY);
        corners.moveTo(offsetX + widthWithPadding, offsetY);
        corners.lineTo(offsetX + widthWithPadding, offsetY + 60);
        corners.strokePath();
        corners.beginPath();
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX + 45, offsetY + heightWithPadding);
        corners.moveTo(offsetX, offsetY + heightWithPadding);
        corners.lineTo(offsetX, offsetY + heightWithPadding - 60);
        corners.strokePath();
        corners.beginPath();
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding - 45, offsetY + heightWithPadding);
        corners.moveTo(offsetX + widthWithPadding, offsetY + heightWithPadding);
        corners.lineTo(offsetX + widthWithPadding, offsetY + heightWithPadding - 60);
        corners.strokePath();
        corners.setDepth(999);

        this.instructionsText.setAlpha(0);
        this.tweens.add({
            targets: this.instructionsText,
            alpha: { from: 0, to: 1 },
            duration: 1500
        });

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - 160, 200, 80, 0xFFFF00)
            .setStrokeStyle(2, 0xFFFFFF)
            .setDepth(1002)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - 160, 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: '30px',
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
        });

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
        const minFontSize = 20; // Tamanho mínimo para telas pequenas
        if (this.fundo) {
            this.fundo.setPosition(this.scale.width / 2, 0);
            this.fundo.setScale(baseScale);
        }
        if (this.instructionsText) {
            this.instructionsText.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.instructionsText.setFontSize(Math.max(48 * baseScale, minFontSize) + 'px');
            this.instructionsText.setWordWrapWidth(this.scale.width * 0.8);
        }
        if (this.continueButton) {
            this.continueButton.setPosition(this.scale.width / 2, this.scale.height - 160 * baseScale);
            this.continueButton.setSize(200 * baseScale, 80 * baseScale);
            this.continueButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.continueButton.setInteractive();
            this.continueText.setPosition(this.scale.width / 2, this.scale.height - 160 * baseScale);
            this.continueText.setFontSize(Math.max(30 * baseScale, minFontSize) + 'px');
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
            .setOrigin(0.5, 0);

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
                fontSize: '48px',
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

        this.startButton = this.add.rectangle(this.scale.width / 2, this.scale.height - 160, 200, 80, 0xFFFF00)
            .setStrokeStyle(2, 0xFFFFFF)
            .setDepth(1201)
            .setInteractive({ useHandCursor: true });
        this.startText = this.add.text(this.scale.width / 2, this.scale.height - 160, 'INICIAR', {
            fontFamily: 'VT323',
            fontSize: '30px',
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
        });

        this.input.on('pointerdown', () => this.game.canvas.focus());

        this.scale.on('resize', this.resize, this);
        this.resize();

        console.log('BriefingScene.create concluído');
    }

    resize() {
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        const minFontSize = 20; // Tamanho mínimo para telas pequenas
        if (this.fundo) {
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
        if (this.briefingText) {
            this.briefingText.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.briefingText.setFontSize(Math.max(48 * baseScale, minFontSize) + 'px');
            this.briefingText.setWordWrapWidth(this.scale.width * 0.8);
        }
        if (this.startButton) {
            this.startButton.setPosition(this.scale.width / 2, this.scale.height - 160 * baseScale);
            this.startButton.setSize(200 * baseScale, 80 * baseScale);
            this.startButton.setStrokeStyle(2 * baseScale, 0xFFFFFF);
            this.startButton.setInteractive();
            this.startText.setPosition(this.scale.width / 2, this.scale.height - 160 * baseScale);
            this.startText.setFontSize(Math.max(30 * baseScale, minFontSize) + 'px');
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
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        this.gameBackground = this.add.image(this.scale.width / 2, 0, `fundo_${colorPrefix}`)
            .setOrigin(0.5, 0)
            .setScale(baseScale);

        this.timerText = this.add.text(20, 20, '00:10', {
            fontFamily: 'VT323',
            fontSize: '40px',
            color: '#FFFFFF'
        }).setOrigin(0, 0).setDepth(100);

        this.timeLeft = 10;
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
        this.buildingContainer = this.add.container(this.scale.width / 2, this.scale.height - buildingHeight - (48 * baseScale));
        this.buildingContainer.setSize(buildingWidth, buildingHeight);
        this.buildingContainer.setDepth(900);

        const background = this.add.image(0, buildingHeight, `${this.levelPrefix}_fundo`)
            .setOrigin(0.5, 1)
            .setScale(baseScale);
        background.setPosition(0, buildingHeight);
        background.setDepth(900);
        this.buildingContainer.add(background);

        const chamasSpriteHeight = 375 * baseScale;
        this.currentChamasSprite = this.add.sprite(0, 550 * baseScale - (chamasSpriteHeight / 2), 'chamas101');
        this.buildingContainer.add(this.currentChamasSprite);
        this.currentChamasSprite.setDepth(910);
        this.currentChamasSprite.setScale(0.3 * baseScale);
        this.currentChamasSprite.setVisible(false);

        this.building = this.add.image(0, buildingHeight, `${this.levelPrefix}_predio`)
            .setOrigin(0.5, 1)
            .setScale(baseScale);
        this.building.setPosition(0, buildingHeight);
        this.building.setDepth(920);
        this.buildingContainer.add(this.building);

        this.silhuetaSprite = this.add.image(this.scale.width / 2, this.scale.height, `silhueta_urbana_${colorPrefix}`)
            .setOrigin(0.5, 1)
            .setScale(baseScale)
            .setDepth(20);

        const towerAndCannonDefinitions = [
            {
                name: 'Torre Esquerda',
                towerAsset: `torre_e_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.144,
                towerBaseY: this.scale.height,
                towerScale: baseScale,
                cannonAsset: 'canhao_e',
                cannonX: this.scale.width * 0.144,
                cannonY: this.scale.height * 0.613,
                cannonScale: baseScale
            },
            {
                name: 'Torre Central',
                towerAsset: `torre_c_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.65,
                towerBaseY: this.scale.height,
                towerScale: baseScale,
                cannonAsset: 'canhao_c',
                cannonX: this.scale.width * 0.65,
                cannonY: this.scale.height * 0.647,
                cannonScale: baseScale
            },
            {
                name: 'Torre Direita',
                towerAsset: `torre_d_${colorPrefix}`,
                towerBaseX: this.scale.width * 0.881,
                towerBaseY: this.scale.height,
                towerScale: baseScale,
                cannonAsset: 'canhao_d',
                cannonX: this.scale.width * 0.881,
                cannonY: this.scale.height * 0.563,
                cannonScale: baseScale
            }
        ];

        this.allCannonsSprites = [];
        this.towers = [];
        this.allTowerSprites = [];

        towerAndCannonDefinitions.forEach((def) => {
            const tower = this.add.image(def.towerBaseX, def.towerBaseY, def.towerAsset)
                .setOrigin(0.5, 1)
                .setScale(def.towerScale)
                .setDepth(18); // 20
            this.allTowerSprites.push({ sprite: tower, def: def });

            const cannon = this.add.image(def.cannonX, def.cannonY, def.cannonAsset)
                .setOrigin(0.5, 1)
                .setScale(def.cannonScale)
                .setDepth(10);
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

            const baseScale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
            if (this.gameBackground) {
                this.gameBackground.setPosition(width / 2, 0);
                this.gameBackground.setScale(baseScale);
            }

            if (this.silhuetaSprite) {
                this.silhuetaSprite.setPosition(width / 2, height);
                this.silhuetaSprite.setScale(baseScale);
            }

            if (this.buildingContainer) {
                const buildingWidth = 510 * baseScale;
                const buildingHeight = 550 * baseScale;
                this.buildingContainer.setPosition(width / 2, height - buildingHeight - (48 * baseScale));
                this.buildingContainer.setSize(buildingWidth, buildingHeight);
                this.building.setScale(baseScale);
                this.building.setPosition(0, buildingHeight);
                const background = this.buildingContainer.getAt(0);
                if (background) background.setScale(baseScale);
            }

            if (this.currentChamasSprite) {
                const chamasSpriteHeight = 375 * baseScale;
                this.currentChamasSprite.setPosition(0, 550 * baseScale - (chamasSpriteHeight / 2));
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
        const buildingHeight = 550 * baseScale;
        const key = this.buildingState === 1 ? `${levelPrefix}_dano1` : this.buildingState === 2 ? `${levelPrefix}_dano2` : `${levelPrefix}_destruido`;
        this.building.setTexture(key).setScale(baseScale);
        this.building.setPosition(0, buildingHeight);
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

        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
        const minFontSize = 20; // Tamanho mínimo para telas pequenas
        this.resultText = this.add.text(this.scale.width / 2, this.scale.height * 0.25,
            success ? 'SUCESSO!' : 'FALHA!',
            {
                fontFamily: 'VT323',
                fontSize: Math.max(60 * baseScale, minFontSize) + 'px',
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
                fontSize: Math.max(40 * baseScale, minFontSize) + 'px',
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

        this.continueButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (160 * baseScale), 200 * baseScale, 80 * baseScale, 0xFFFF00)
            .setStrokeStyle(2 * baseScale, 0xFFFFFF)
            .setDepth(2000)
            .setInteractive({ useHandCursor: true });

        this.continueText = this.add.text(this.scale.width / 2, this.scale.height - (160 * baseScale), 'CONTINUAR', {
            fontFamily: 'VT323',
            fontSize: Math.max(30 * baseScale, minFontSize) + 'px',
            color: '#000000'
        }).setOrigin(0.5).setDepth(2001);

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

                    this.endText = this.add.text(this.scale.width / 2, this.scale.height / 2 - (200 * baseScale), 'FIM DE JOGO!', {
                        fontFamily: 'VT323',
                        fontSize: Math.max(80 * baseScale, minFontSize) + 'px',
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
                        fontSize: Math.max(40 * baseScale, minFontSize) + 'px',
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

                    this.statsText = this.add.text(this.scale.width / 2, this.scale.height / 2 + (150 * baseScale),
                        `Destruídos: ${destroyedCount}\nPreservados: ${preservedCount}`,
                        {
                            fontFamily: 'VT323',
                            fontSize: Math.max(40 * baseScale, minFontSize) + 'px',
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

                    this.restartButton = this.add.rectangle(this.scale.width / 2, this.scale.height - (250 * baseScale), 300 * baseScale, 100 * baseScale, 0x00FF00)
                        .setStrokeStyle(4 * baseScale, 0xFFFFFF)
                        .setDepth(2000)
                        .setInteractive({ useHandCursor: true });
                    this.restartText = this.add.text(this.scale.width / 2, this.scale.height - (250 * baseScale), 'REINICIAR', {
                        fontFamily: 'VT323',
                        fontSize: Math.max(40 * baseScale, minFontSize) + 'px',
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
                    });
                }
            }, this);
        }, this);
    }

    update() {
        if (gameEnded) return;
        const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
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