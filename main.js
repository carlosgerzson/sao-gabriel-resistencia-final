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

// Forçar início na fase para testes  - APAGAR OU COMENTAR - 
// currentLevel = 1;
// COMENTAR current Level acima

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
            "ALVO 4: O CASARÃO DA MALLET! \n\nConstruído a mando de João Propício de F. Menna Barreto, o 2º Barão de São Gabriel, por isso conhecido por “SOLAR DO BARÕES, não pode ser silenciado.",
            "ALVO 5: JANELAS REDONDAS! \n\nBela casa particular construída na cidade, incluindo janelas redondas em que Getúlio Vargas discursou em 1950. Defenda-a.",
            "ALVO 6: SOBRADO - BIBLIOTECA! \n\nA alma acolhedora do Sobrado, onde livros e música guardam nossos sonhos e local onde o imperador Dom Pedro II se hospedou. Defenda-o.",
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
        this.load.audio('sirene', 'assets/sirene.mp3'); // sirene matadora
        this.load.image('nave', 'assets/nave.png'); // nave espacial
        this.load.image('star_bonus', 'assets/star_bonus.png');
        this.load.image('bubble', 'assets/bubble.png');
        this.load.audio('track_red', 'assets/track_red.mp3');
        this.load.audio('track_yellow', 'assets/track_yellow.mp3');
        this.load.audio('track_blue', 'assets/track_blue.mp3');
        this.load.image('night_gradient', 'assets/night_gradient.png');
        this.load.image('icon_daynight', 'assets/icon_daynight.png');
        this.load.image('tela_final', 'assets/tela_final.png');
        this.load.image('nave_ponta', 'assets/nave_ponta.png');
        this.load.image('dome_btn', 'assets/dome.png');
        this.load.image('triplo_btn', 'assets/triplo.png');


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

        // flag do tiro Triplo
        this.tripleShotActive = false;

        // função shatterNave ---
        this.shatterNave = function (x, y, baseScale) {
            const navePonta = this.add.image(x, y, 'nave_ponta')
                .setScale(baseScale)
                .setDepth(20);

            const chamasEmitter = this.add.particles(navePonta.x, navePonta.y + 30 * baseScale, 'bubble', {
                scale: { min: 0.1, max: 0.5 },
                speed: { min: 20, max: 40 },
                alpha: { start: 1, end: 0 },
                tint: [0xffd700, 0xff3300],
                lifespan: 1200,
                frequency: 60,
                gravityY: -90,
                particleBringToTop: false
            });
            chamasEmitter.setDepth(21);

            this.tweens.add({
                targets: navePonta,
                x: this.scale.width - 60 * baseScale,
                y: this.scale.height - 100 * baseScale,
                angle: navePonta.angle + 110,
                scale: { from: baseScale, to: baseScale * 1.25 },
                duration: 4000,
                ease: 'Quad.easeIn',
                onUpdate: () => {
                    chamasEmitter.setPosition(navePonta.x, navePonta.y + 30 * navePonta.scale);
                },
                onComplete: () => {
                    this.cameras.main.shake(400, 0.015); // camera shake
                    this.sound.play('explosion_target');
                    this.time.delayedCall(1500, () => {
                        chamasEmitter.destroy();
                        navePonta.destroy();
                    });
                }
            });
            this.sound.play('explosion_air');
        };
        // --- Fim da função shatterNave ---


        ////////////////////////
        // Overlay gradiente PNG + sun e moon

        this.nightOverlay = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            'night_gradient'
        ).setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(30)
            .setAlpha(0); // começa transparente

        let isNight = false;

        this.dayNightIcon = this.add.image(this.scale.width - 40, 40, 'icon_daynight')
            .setDepth(2001)
            .setScale(0.7)
            .setInteractive({ useHandCursor: true });

        this.dayNightIcon.on('pointerdown', () => {
            isNight = !isNight;
            this.tweens.add({
                targets: this.nightOverlay,
                alpha: isNight ? 0.65 : 0,
                duration: 3000,
                ease: 'Linear'
            });
            // Tween para rotacionar o ícone (180 graus)
            this.tweens.add({
                targets: this.dayNightIcon,
                angle: this.dayNightIcon.angle + 180,
                duration: 3000,
                ease: 'Linear'
            });
        });
        ////////////////

        // === BÔNUS DOME E tiro TRIPLO ===

        // Quantos botões por fase
        let domeBonusCount = 0, tripleBonusCount = 0;
        if (currentLevel === 2 || currentLevel === 3) domeBonusCount = 1;
        if (currentLevel === 4 || currentLevel === 5) { domeBonusCount = 1; tripleBonusCount = 1; }
        if (currentLevel === 6 || currentLevel === 7) { domeBonusCount = 2; tripleBonusCount = 1; }
        if (currentLevel === 8 || currentLevel === 9 || currentLevel === 10) { domeBonusCount = 2; tripleBonusCount = 2; }

        // Antes de criar novos botões, destruir os antigos se existirem
        if (this.domeBtns) this.domeBtns.forEach(btn => btn.destroy());
        if (this.tripleBtns) this.tripleBtns.forEach(btn => btn.destroy());
        this.domeBtns = [];
        this.tripleBtns = [];


        // Criar botões Dome na esquerda
        this.domeBtns = [];
        const domeBtnYStart = 100; // ajuste conforme o layout
        for (let i = 0; i < domeBonusCount; i++) {
            const btn = this.add.image(40, domeBtnYStart + i * 80, 'dome_btn')
                .setDisplaySize(35, 35)
                .setInteractive({ useHandCursor: true })
                .setDepth(2002);
            btn.on('pointerdown', () => {
                if (!btn.used) {
                    btn.setVisible(false); // botão desaparece ao usar
                    btn.used = true;
                    this.activateDomeBonus(5000); // ativa dome por 5s

                    // Texto animado "DOME ATIVADO!"
                    const domeText = this.add.text(this.scale.width / 2, 80, 'DOME ATIVADO - 5s', {
                        fontFamily: 'VT323',
                        fontSize: '38px',
                        color: '#00e9ff',
                        align: 'center',
                        lineSpacing: 8
                    }).setOrigin(0.5).setDepth(3000).setAlpha(0);

                    this.tweens.add({
                        targets: domeText,
                        alpha: 1,
                        duration: 300,
                        yoyo: true,
                        hold: 800,
                        onComplete: () => domeText.destroy()
                    });
                }
            });
            this.domeBtns.push(btn);
        }

        // Criar botões Triplo na direita
        this.tripleBtns = [];
        const tripleBtnYStart = 100; // ajustar conforme o layout
        for (let i = 0; i < tripleBonusCount; i++) {
            const btn = this.add.image(this.scale.width - 40, tripleBtnYStart + i * 80, 'triplo_btn')
                .setDisplaySize(32, 32)
                .setInteractive({ useHandCursor: true })
                .setDepth(2002);
            btn.on('pointerdown', () => {
                if (!btn.used) {
                    btn.setVisible(false); // botão desaparece ao usar
                    btn.used = true;
                    this.activateTripleShot(8000); // ativa tiro triplo por 8s

                    // Texto animado "TIRO TRIPLO!"
                    const tripleText = this.add.text(this.scale.width / 2, 140, 'TRIPLO ATIVADO - 8s', {
                        fontFamily: 'VT323',
                        fontSize: '38px',
                        color: '#FFD700',
                        align: 'center',
                        lineSpacing: 8
                    }).setOrigin(0.5).setDepth(3000).setAlpha(0);

                    this.tweens.add({
                        targets: tripleText,
                        alpha: 1,
                        duration: 300,
                        yoyo: true,
                        hold: 800,
                        onComplete: () => tripleText.destroy()
                    });
                }
            });
            this.tripleBtns.push(btn);
        }
        // fim domebtn e triplo

        // Função para ativar o dome como bônus temporário
        this.activateDomeBonus = function (duration = 5000) {
            this.domeGraphics.setVisible(true);
            this.domeActive = true;
            this.time.delayedCall(duration, () => {
                this.domeGraphics.setVisible(false);
                this.domeActive = false;
            }, [], this);
        };

        // Função para ativar o tiro triplo por tempo limitado
        this.activateTripleShot = function (duration = 8000) {
            this.tripleShotActive = true;
            this.time.delayedCall(duration, () => {
                this.tripleShotActive = false;
            }, [], this);
        };

        // Carregar trilha sonora com base na cor
        let trackKey;
        if (colorPrefix === 'red') trackKey = 'track_red';
        else if (colorPrefix === 'yellow') trackKey = 'track_yellow';
        else trackKey = 'track_blue';

        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgMusic.destroy();
        }
        this.bgMusic = this.sound.add(trackKey, { loop: true, volume: 0.5 });
        this.bgMusic.play();

        // star bonus
        this.starBonusActive = false;

        this.fundo = this.add.image(this.scale.width / 2, 0, `fundo_${colorPrefix}`)
            .setOrigin(0.5, 0)
            .setDisplaySize(this.scale.width, visibleHeight);

        this.timerText = this.add.text(20, 20, '01:00', { // ajustar tempo do jogo
            fontFamily: 'VT323',
            fontSize: '40px',
            color: '#FFFFFF'
        }).setOrigin(0, 0).setDepth(100);

        this.timeLeft = 60; // Ajustar o tempo do jogo
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

        // Dome protetor sempre ativo (teste visual)....................
        const domeX = this.scale.width / 2;
        const domeY = this.buildingContainer.y + (48 + 500) * baseScale;
        const domeRadius = (this.scale.width / 2) + 120 * baseScale;
        const segments = 12; // quanto mais segmentos, mais suave; menos, mais facetado

        this.domeGraphics = this.add.graphics().setDepth(950);
        this.domeGraphics.lineStyle(6 * baseScale, 0x00e9ff, 0.7);
        this.domeGraphics.fillStyle(0x00e9ff, 0.18);

        this.domePoints = []; // <-- Adicionar esta linha antes do for

        this.domeGraphics.beginPath();
        for (let i = 0; i <= segments; i++) {
            const angle = Math.PI + (i / segments) * Math.PI;
            const x = domeX + Math.cos(angle) * domeRadius;
            const y = domeY + Math.sin(angle) * domeRadius;
            this.domePoints.push({ x, y }); // <-- Adicionar esta linha dentro do for
            if (i === 0) {
                this.domeGraphics.moveTo(x, y);
            } else {
                this.domeGraphics.lineTo(x, y);
            }
        }
        this.domeGraphics.strokePath();
        this.domeGraphics.fillPath();
        this.domeGraphics.setVisible(false);
        this.domeActive = false;
        // fim do dome protetor.........................................

        const fundoWidth = 604 * baseScale;
        this.buildingFundo = this.add.image(-buildingWidth / 2, buildingHeight, `${this.levelPrefix}_fundo`)
            .setOrigin(0, 1)
            .setScale(baseScale)
            .setDepth(900);
        this.buildingContainer.add(this.buildingFundo);


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
            const towerDepth = (def.name === 'Torre Esquerda') ? 950 : 20; // depth torre E - e demais
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
                                .setStrokeStyle(4 * baseScale, 0x000000, 1) // stroke preto
                                .setDepth(1099);

                            // Adiciona ao array de mísseis da nave
                            this.naveMissiles.push(missile);

                            // Calcula área de colisão do alvo
                            const collisionTopY = this.cameras.main.height - 315 * baseScale;
                            const collisionBottomY = collisionTopY + 50 * baseScale;
                            const collisionLeftX = this.scale.width / 2 - 255 * baseScale;
                            const collisionRightX = this.scale.width / 2 + 255 * baseScale;

                            const missileTween = this.tweens.add({
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
                            // Guarde o tween no objeto
                            missile.missileTween = missileTween;
                        }
                    },
                    onComplete: () => {
                        this.naveSprite.destroy();
                    }
                });
            }, [], this);
        }

        this.waveCount = 0;


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

            // Cria partículas de chamas (substitui o sprite)
            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.cameras.main.height / BASE_HEIGHT);

            // Ajuste de posição para cada fase
            let chamasX = this.buildingContainer.x;
            let chamasY = this.buildingContainer.y + (50 * baseScale);

            switch (currentLevel) {
                case 1:
                    chamasX = this.buildingContainer.x - 85 * baseScale;
                    chamasY = this.buildingContainer.y + 500 * baseScale;
                    break;
                case 2:
                    chamasX = this.buildingContainer.x + 45 * baseScale;
                    chamasY = this.buildingContainer.y + 450 * baseScale;
                    break;
                case 3:
                    chamasX = this.buildingContainer.x - 50;
                    chamasY = this.buildingContainer.y + 500 * baseScale;
                    break;
                case 4:
                    chamasX = this.buildingContainer.x - 50;
                    chamasY = this.buildingContainer.y + 500 * baseScale;
                    break;
                case 5:
                    chamasX = this.buildingContainer.x - 50;
                    chamasY = this.buildingContainer.y + 440 * baseScale;
                    break;
                case 6:
                    chamasX = this.buildingContainer.x + 60;
                    chamasY = this.buildingContainer.y + 500 * baseScale;
                    break;
                case 7:
                    chamasX = this.buildingContainer.x - 55;
                    chamasY = this.buildingContainer.y + 460 * baseScale;
                    break;
                case 8:
                    chamasX = this.buildingContainer.x - 50;
                    chamasY = this.buildingContainer.y + 400 * baseScale;
                    break;
                case 9:
                    chamasX = this.buildingContainer.x + 1;
                    chamasY = this.buildingContainer.y + 500 * baseScale;
                    break;
                case 10:
                    chamasX = this.buildingContainer.x + 1;
                    chamasY = this.buildingContainer.y + 500 * baseScale;
                    break;

                // ...adicione ajustes para cada fase...
                default:
                    chamasX = this.buildingContainer.x;
                    chamasY = this.buildingContainer.y + (50 * baseScale);
                    break;
            }

            if (!this.chamasEmitter) {
                this.chamasEmitter = this.add.particles(chamasX, chamasY, 'bubble', {
                    scale: { min: 0.1, max: 0.5 },
                    speed: { min: 20, max: 40 },
                    alpha: { start: 1, end: 0 },
                    tint: [0xffd700, 0x000000], // amarelo e vermelho 0xff3300
                    lifespan: 2000,
                    frequency: 50,
                    gravityY: -90,
                    particleBringToTop: false
                });
                this.chamasEmitter.setDepth(910);
            }

            this.time.delayedCall(500, () => {
                if (this.buildingHealth > 0) {
                    this.buildingHealth--;
                    this.updateBuildingVisibility();
                    if (this.buildingHealth === 0) {
                        this.time.delayedCall(1000, () => {
                            if (this.chamasParticles) {
                                this.chamasParticles.destroy();
                                this.chamasParticles = null;
                                this.chamasEmitter = null;
                            }
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
                    // Explosão verde (efeito visual)
                    const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
                    const greenExplosion = this.add.circle(missile.x, missile.y, 0, 0x39ff14, 0.7).setDepth(950);
                    this.tweens.add({
                        targets: greenExplosion,
                        radius: { from: 0, to: 80 * baseScale },
                        alpha: { from: 1, to: 0.2 },
                        duration: 400,
                        ease: 'Quad.easeOut',
                        onComplete: () => greenExplosion.destroy()
                    });

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
                    // Se tiver guardado o tween e o som da bomba matadora:
                    if (killer.killerTween && killer.killerTween.isPlaying()) killer.killerTween.stop();
                    if (killer.sound && killer.sound.isPlaying) killer.sound.stop();
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

            // Bloco para a nave principal:
            if (this.naveSprite && this.naveSprite.active) {
                const naveDistance = Phaser.Math.Distance.Between(explosionX, explosionY, this.naveSprite.x, this.naveSprite.y);
                if (naveDistance < explosionRadius) {
                    const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
                    this.shatterNave(this.naveSprite.x, this.naveSprite.y, baseScale);
                    this.naveSprite.destroy();
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

        // Diminui o cooldown do bônus especial a cada wave
        if (this.starBonusCooldown > 0) this.starBonusCooldown--;

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
                        const missile = this.add.rectangle(spawnX, spawnY, 7 * baseScale, 30 * baseScale, 0x00ff00); // sem neon - o normal é 10

                        // Efeito neon/glow:
                        missile.setStrokeStyle(4 * baseScale, 0x39ff14, 0.5); // borda neon semi-transparente
                        //missile.setShadow(0, 0, '#9cf289ff', 16 * baseScale, true, true); // sombra neon

                        // Testar diferentes velocidades e waves:
                        missile.speed = 70 + (currentLevel * 4) + (this.waveCount * 3); // fase + wave - escolher uma ou outra
                        //missile.speed = 70 + (currentLevel * 5); // só fase
                        // missile.speed = 70 + (this.waveCount * 15); // só wave

                        missile.targetX = Phaser.Math.Between(this.scale.width / 2 - 255 * baseScale, this.scale.width / 2 + 255 * baseScale);
                        missile.targetY = this.scale.height - 315 * baseScale;
                        missile.setDepth(1000);
                        missile.setActive(true);
                        missile.setVisible(true);
                        missiles.push(missile);
                    }, [], this);
                }


                // Bloco do bônus especial (estrela) - só a partir do nível 6

                if (!this.starBonusCount) this.starBonusCount = 0;

                if (
                    Phaser.Math.Between(1, 2) === 1 &&
                    !gameEnded &&
                    this.starBonusCount < 2 &&
                    !this.starBonusActive &&
                    this.starBonusCooldown <= 0 // só cria se cooldown zerado
                ) {
                    this.starBonusCount++;
                    this.starBonusActive = true;
                    this.starBonusCooldown = 5; // espera 5 waves para criar outro

                    const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
                    // Posição X aleatória entre 20% e 80% da largura
                    const bonusX = Phaser.Math.Between(this.scale.width * 0.2, this.scale.width * 0.8);
                    // Posição Y aleatória entre 15% e 35% da altura (mais acima do meio)
                    const bonusY = Phaser.Math.Between(this.scale.height * 0.15, this.scale.height * 0.35);

                    const bonusSprite = this.add.image(bonusX, bonusY, 'star_bonus')
                        .setScale(baseScale * .8)  // alterar scale star bonus - também no yoyo
                        .setDepth(2002)
                        .setInteractive({ useHandCursor: true });

                    this.tweens.add({
                        targets: bonusSprite,
                        scale: { from: baseScale * .8, to: baseScale * .9 }, // alterar scale star bonus também na const acima
                        alpha: { from: 1, to: 0.7 },
                        yoyo: true,
                        repeat: -1,
                        duration: 400
                    });

                    this.time.delayedCall(4000, () => {
                        if (bonusSprite.active) bonusSprite.destroy();
                        this.starBonusActive = false; // libera para criar outro bonus
                    }, [], this);

                    bonusSprite.on('pointerdown', () => {
                        // Cria a onda expansiva
                        const wave = this.add.circle(this.scale.width / 2, this.scale.height / 2, 0, 0xffffff, 0.4).setDepth(3000);
                        bonusSprite.destroy();
                        this.starBonusActive = false; // libera para criar outro
                        this.sound.play('explosion_air');

                        this.tweens.add({
                            targets: wave,
                            radius: { from: 0, to: Math.max(this.scale.width, this.scale.height) },
                            duration: 1000,
                            ease: 'Quad.easeOut',
                            onUpdate: (tween, target) => {
                                const progress = tween.progress;
                                const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                                    { r: 0, g: 180, b: 255 },
                                    { r: 255, g: 255, b: 0 },
                                    1,
                                    progress
                                );
                                target.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 0.4);
                            },
                            onComplete: () => {
                                missiles.forEach(missile => { if (missile.active) missile.destroy(); });
                                killerMissiles.forEach(killer => { if (killer.active) killer.destroy(); });
                                if (this.naveMissiles) this.naveMissiles.forEach(missile => { if (missile.active) missile.destroy(); });

                                this.tweens.add({
                                    targets: wave,
                                    radius: { from: wave.radius, to: 0 },
                                    duration: 1000,
                                    ease: 'Quad.easeIn',
                                    onComplete: () => wave.destroy()
                                });
                            }
                        });

                        bonusSprite.destroy();
                        this.sound.play('explosion_air');
                    });
                }
            }
        }.bind(this);

        // Diminui o cooldown do bônus especial a cada wave
        if (this.starBonusCooldown > 0) this.starBonusCooldown--;

        this.time.addEvent({ delay: 2500, callback: this.spawnWave, callbackScope: this, loop: true }); // a cada 2,5 segundos uma nova wave

        // Cria 3 bombas matadoras por fase, com delays diferentes

        const killerRadius = 15 * baseScale;
        const spawnY = 0;


        // Primeira bomba matadora: entre 0,5s e 15s
        this.time.delayedCall(Phaser.Math.Between(500, 15000), () => {
            this.sound.play('sirene', { volume: 0.7 });

            this.time.delayedCall(3000, () => {
                const spawnX = Phaser.Math.Between(0, this.scale.width);
                const killerMissile = this.add.circle(spawnX, spawnY, killerRadius, 0xff0000, 0.7)
                    .setStrokeStyle(4, 0xffffff, 1)
                    .setDepth(1000);
                killerMissiles.push(killerMissile);

                const sound = this.sound.add('missileFall', { volume: 1 });
                sound.play();

                let targetX = this.buildingContainer.x;
                let targetY = this.scale.height - 315 * baseScale;

                let trailGraphics = this.add.graphics({ x: 0, y: 0 }).setDepth(999);

                let killerTween = this.tweens.add({
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
                        if (!killerMissile.active) return;
                        if (trailGraphics) trailGraphics.destroy();
                        if (sound && sound.isPlaying) sound.stop();
                        this.buildingHealth = 1;
                        this.updateBuildingVisibility();
                        this.onBuildingHit(targetX, targetY);
                        if (killerMissile) killerMissile.destroy();
                    },
                    onStop: () => {
                        if (trailGraphics) {
                            this.tweens.add({
                                targets: trailGraphics,
                                alpha: { from: 1, to: 0 },
                                duration: 1000,
                                onComplete: () => trailGraphics.destroy()
                            });
                        }
                        if (sound && sound.isPlaying) sound.stop();
                        if (killerMissile) killerMissile.destroy();
                    }
                });

                killerMissile.killerTween = killerTween;
                killerMissile.sound = sound;
            }, [], this);
        }, [], this);

        // Segunda bomba matadora: entre 20s e 35s
        this.time.delayedCall(Phaser.Math.Between(20000, 35000), () => {
            this.sound.play('sirene', { volume: 0.7 });

            this.time.delayedCall(3000, () => {
                const spawnX = Phaser.Math.Between(0, this.scale.width);
                const killerMissile = this.add.circle(spawnX, spawnY, killerRadius, 0xff0000, 0.7)
                    .setStrokeStyle(4, 0xffffff, 1)
                    .setDepth(1000);
                killerMissiles.push(killerMissile);

                const sound = this.sound.add('missileFall', { volume: 1 });
                sound.play();

                let targetX = this.buildingContainer.x;
                let targetY = this.scale.height - 315 * baseScale;

                let trailGraphics = this.add.graphics({ x: 0, y: 0 }).setDepth(999);

                let killerTween = this.tweens.add({
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
                        if (!killerMissile.active) return;
                        if (trailGraphics) trailGraphics.destroy();
                        if (sound && sound.isPlaying) sound.stop();
                        this.buildingHealth = 1;
                        this.updateBuildingVisibility();
                        this.onBuildingHit(targetX, targetY);
                        if (killerMissile) killerMissile.destroy();
                    },
                    onStop: () => {
                        if (trailGraphics) {
                            this.tweens.add({
                                targets: trailGraphics,
                                alpha: { from: 1, to: 0 },
                                duration: 1000,
                                onComplete: () => trailGraphics.destroy()
                            });
                        }
                        if (sound && sound.isPlaying) sound.stop();
                        if (killerMissile) killerMissile.destroy();
                    }
                });

                killerMissile.killerTween = killerTween;
                killerMissile.sound = sound;
            }, [], this);
        }, [], this);

        // Terceira bomba matadora: entre 40s e 50s
        this.time.delayedCall(Phaser.Math.Between(40000, 50000), () => {
            this.sound.play('sirene', { volume: 0.7 });

            this.time.delayedCall(3000, () => {
                const spawnX = Phaser.Math.Between(0, this.scale.width);
                const killerMissile = this.add.circle(spawnX, spawnY, killerRadius, 0xff0000, 0.7)
                    .setStrokeStyle(4, 0xffffff, 1)
                    .setDepth(1000);
                killerMissiles.push(killerMissile);

                const sound = this.sound.add('missileFall', { volume: 1 });
                sound.play();

                let targetX = this.buildingContainer.x;
                let targetY = this.scale.height - 315 * baseScale;

                let trailGraphics = this.add.graphics({ x: 0, y: 0 }).setDepth(999);

                let killerTween = this.tweens.add({
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
                        if (!killerMissile.active) return;
                        if (trailGraphics) trailGraphics.destroy();
                        if (sound && sound.isPlaying) sound.stop();
                        this.buildingHealth = 1;
                        this.updateBuildingVisibility();
                        this.onBuildingHit(targetX, targetY);
                        if (killerMissile) killerMissile.destroy();
                    },
                    onStop: () => {
                        if (trailGraphics) {
                            this.tweens.add({
                                targets: trailGraphics,
                                alpha: { from: 1, to: 0 },
                                duration: 1000,
                                onComplete: () => trailGraphics.destroy()
                            });
                        }
                        if (sound && sound.isPlaying) sound.stop();
                        if (killerMissile) killerMissile.destroy();
                    }
                });

                killerMissile.killerTween = killerTween;
                killerMissile.sound = sound;
            }, [], this);
        }, [], this);


        this.fireAntiMissile = function (cannon, targetGameX, targetGameY) {
            if (!gameEnded) {
                // Se tiro triplo estiver ativo, dispara 3 antimísseis em leque
                if (this.tripleShotActive) {
                    const launchX = cannon.sprite.x;
                    const launchY = cannon.sprite.y;
                    const angle = Phaser.Math.Angle.Between(launchX, launchY, targetGameX, targetGameY);
                    const spread = Phaser.Math.DegToRad(18); // ângulo de abertura entre os tiros
                    const dist = 200; // distância para espalhar os alvos

                    // Central
                    this._fireSingleAntiMissile(cannon, targetGameX, targetGameY);

                    // Esquerda
                    this._fireSingleAntiMissile(
                        cannon,
                        targetGameX + dist * Math.cos(angle - spread),
                        targetGameY + dist * Math.sin(angle - spread)
                    );

                    // Direita
                    this._fireSingleAntiMissile(
                        cannon,
                        targetGameX + dist * Math.cos(angle + spread),
                        targetGameY + dist * Math.sin(angle + spread)
                    );
                } else {
                    // Tiro normal
                    this._fireSingleAntiMissile(cannon, targetGameX, targetGameY);
                }
            }
        }.bind(this);

        // Função auxiliar para disparar um antimíssil individual
        this._fireSingleAntiMissile = function (cannon, targetGameX, targetGameY) {
            const launchX = cannon.sprite.x;
            const launchY = cannon.sprite.y;
            const baseScale = Math.min(this.scale.width / BASE_WIDTH, this.scale.height / BASE_HEIGHT);
            const antiMissile = this.add.image(launchX, launchY, 'antimissile')
                .setOrigin(0.5, 1)
                .setScale(baseScale)
                .setDepth(5);
            antiMissiles.push(antiMissile);

            const antiMissileHeight = 76 * baseScale;
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

                    // Quando passar de 97%, reduz opacidade para sumir
                    if (progress > 0.90) {
                        target.setAlpha(0.0);
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


            // Parar e destruir a trilha sonora da fase
            if (this.bgMusic) {
                this.bgMusic.stop();
                this.bgMusic.destroy();
                this.bgMusic = null;
            }

            // Destruir a nave se exitir
            if (this.naveSprite && this.naveSprite.active) {
                this.naveSprite.destroy();
            }

            // Destruir os missiles da nave se existirem
            if (this.naveMissiles && this.naveMissiles.length > 0) {
                for (let i = this.naveMissiles.length - 1; i >= 0; i--) {
                    const missile = this.naveMissiles[i];
                    if (missile) {
                        if (missile.missileTween && missile.missileTween.isPlaying()) {
                            missile.missileTween.stop();
                        }
                        missile.destroy();
                    }
                    this.naveMissiles.splice(i, 1);
                }
            }

            // --- Adicione aqui - bubble---
            if (this.chamasEmitter) {
                this.chamasEmitter.destroy();
                this.chamasEmitter = null;
            }
            // ---------------------

            if (success) {
                preservedCount++;
            } else {
                destroyedCount++;
            }
            // ...................

            // Tela final especial se preservou o alvo da fase 10
            if (success && currentLevel === TOTAL_LEVELS) {
                this.children.removeAll();

                // Adiciona tela_final.png como fundo
                this.add.image(this.scale.width / 2, this.scale.height / 2, 'tela_final')
                    .setDisplaySize(this.scale.width, this.scale.height)
                    .setDepth(100);

                // Botões/textos no rodapé
                const btnY = this.scale.height - 120;
                const btnSpacing = 100; // ajustar espaço entre textos

                // Jogar Novamente
                const playAgainText = this.add.text(this.scale.width / 2 - btnSpacing, btnY, 'Jogar Novamente', {
                    fontFamily: 'VT323',
                    fontSize: '34px',
                    color: '#00FF00',
                    align: 'center'
                }).setOrigin(0.5).setDepth(2001).setInteractive({ useHandCursor: true });

                playAgainText.on('pointerdown', () => {
                    destroyedCount = 0;
                    preservedCount = 0;
                    currentLevel = 1;
                    localStorage.removeItem('gameProgress');
                    gameEnded = false;
                    this.scene.start('BriefingScene');
                });

                // Fechar
                const closeText = this.add.text(this.scale.width / 2 + btnSpacing, btnY, 'Fechar', {
                    fontFamily: 'VT323',
                    fontSize: '34px',
                    color: '#FF3300',
                    align: 'center'
                }).setOrigin(0.5).setDepth(2001).setInteractive({ useHandCursor: true });

                closeText.on('pointerdown', () => {
                    window.close(); // ou window.location.reload() se for web
                });

                return; // Impede que o restante do endLevel rode
            }
            //..............................

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
                    if (success) {
                        // Vitória: avança para próxima fase
                        currentLevel++;
                        gameEnded = false;
                        this.scene.start('BriefingScene');
                    } else {
                        // Derrota: reinicia a mesma fase
                        destroyedCount = 0;
                        preservedCount = 0;
                        // Mantém currentLevel
                        localStorage.removeItem('gameProgress');
                        gameEnded = false;
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


        // --- Colisão dos mísseis normais com o dome ---
        if (this.domeActive && this.domePoints && this.domePoints.length > 1) {
            // Mísseis normais
            for (let i = missiles.length - 1; i >= 0; i--) {
                const missile = missiles[i];
                if (!missile || !missile.active) continue;
                let domeYatX = null;
                for (let j = 0; j < this.domePoints.length - 1; j++) {
                    const p1 = this.domePoints[j];
                    const p2 = this.domePoints[j + 1];
                    if ((missile.x >= p1.x && missile.x <= p2.x) || (missile.x >= p2.x && missile.x <= p1.x)) {
                        const t = (missile.x - p1.x) / (p2.x - p1.x);
                        domeYatX = p1.y + t * (p2.y - p1.y);
                        break;
                    }
                }
                if (domeYatX !== null && missile.y >= domeYatX) {
                    // Efeito visual de impacto
                    const impact = this.add.circle(missile.x, missile.y, 20, 0x00e9ff, 0.5).setDepth(951);
                    this.tweens.add({
                        targets: impact,
                        alpha: 0,
                        scale: 2,
                        duration: 400,
                        onComplete: () => impact.destroy()
                    });
                    missile.destroy();
                    missiles.splice(i, 1);
                    this.sound.play('explosion_air');
                }
            }
            // KillerMissiles
            for (let i = killerMissiles.length - 1; i >= 0; i--) {
                const killer = killerMissiles[i];
                if (!killer || !killer.active) continue;
                let domeYatX = null;
                for (let j = 0; j < this.domePoints.length - 1; j++) {
                    const p1 = this.domePoints[j];
                    const p2 = this.domePoints[j + 1];
                    if ((killer.x >= p1.x && killer.x <= p2.x) || (killer.x >= p2.x && killer.x <= p1.x)) {
                        const t = (killer.x - p1.x) / (p2.x - p1.x);
                        domeYatX = p1.y + t * (p2.y - p1.y);
                        break;
                    }
                }
                if (domeYatX !== null && killer.y >= domeYatX) {
                    const impact = this.add.circle(killer.x, killer.y, 24, 0xff0000, 0.5).setDepth(951);
                    this.tweens.add({
                        targets: impact,
                        alpha: 0,
                        scale: 2,
                        duration: 400,
                        onComplete: () => impact.destroy()
                    });
                    if (killer.killerTween && killer.killerTween.isPlaying()) killer.killerTween.stop();
                    if (killer.sound && killer.sound.isPlaying) killer.sound.stop();
                    killer.destroy();
                    killerMissiles.splice(i, 1);
                    this.sound.play('explosion_air');
                }
            }
            // Mísseis da nave
            if (this.naveMissiles) {
                for (let i = this.naveMissiles.length - 1; i >= 0; i--) {
                    const naveMissile = this.naveMissiles[i];
                    if (!naveMissile || !naveMissile.active) continue;
                    let domeYatX = null;
                    for (let j = 0; j < this.domePoints.length - 1; j++) {
                        const p1 = this.domePoints[j];
                        const p2 = this.domePoints[j + 1];
                        if ((naveMissile.x >= p1.x && naveMissile.x <= p2.x) || (naveMissile.x >= p2.x && naveMissile.x <= p1.x)) {
                            const t = (naveMissile.x - p1.x) / (p2.x - p1.x);
                            domeYatX = p1.y + t * (p2.y - p1.y);
                            break;
                        }
                    }
                    if (domeYatX !== null && naveMissile.y >= domeYatX) {
                        const impact = this.add.circle(naveMissile.x, naveMissile.y, 20, 0x00e9ff, 0.5).setDepth(951);
                        this.tweens.add({
                            targets: impact,
                            alpha: 0,
                            scale: 2,
                            duration: 400,
                            onComplete: () => impact.destroy()
                        });
                        naveMissile.destroy();
                        this.naveMissiles.splice(i, 1);
                        this.sound.play('explosion_air');
                    }
                }
            }
        }


        // --- Movimentação e colisão dos mísseis normais com o prédio ---
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
    }
}
