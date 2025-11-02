// Dados para os prédios que terão alternância
// Garantir que `Cesium` esteja definido no escopo deste módulo para satisfazer
// verificações estáticas (TS/JS server) e também usar a referência global em runtime.
const Cesium = (typeof globalThis !== 'undefined' && globalThis.Cesium) ? globalThis.Cesium : (/** @type {any} */ {});

export const buildingsMap = {
    '505354016': { // Barão
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316222, -30.3411985, 136), // 146.10
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'barao_low.glb',
        uri_detail: 'barao.glb',
        info: {
            title: 'Edifício Barão',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['barao1.jpg']
        }
    },
    '505354014': { // Corsan
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316286, -30.341502, 136), // 146.06
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'corsan_low.glb',
        uri_detail: 'corsan.glb',
        info: {
            title: 'CORSAN',
            description: `A Companhia Riograndense de Saneamento (CORSAN) foi fundada em 21 de dezembro de 1965 e instalada oficialmente em 28 de março de 1966, com o objetivo de expandir o saneamento básico no Rio Grande do Sul. Em São Gabriel, a CORSAN ampliou a rede de água para todos os bairros e instalou torneiras públicas nas regiões mais afastadas, além de estabelecer a meta de universalizar o esgoto em 30 anos.<br><br>
Desde 9 de maio de 2012, a gestão dos serviços de água e esgoto passou para a empresa Saneamento São Gabriel, vencedora do processo licitatório municipal.`,
            images: ['corsan1.jpg']
        }
    },
    '496696965': { // Banco da Província
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317309, -30.339836, 136), // 141
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'provincia_low.glb',
        uri_detail: 'provincia.glb',
        info: {
            title: 'BANCO DA PROVÍNCIA',
            description: `No início do século XX, esta esquina abrigava o Banco Brandão & Cia, fundado em outubro de 1909 e conhecido como “Banquinho do Seu Brandão”. Em 12 de março de 1912, a agência foi adquirida pelo Banco da Província, que logo construiu o segundo piso, tornando o prédio um dos mais belos marcos arquitetônicos da cidade. Atualmente, o local abriga uma agência do banco Itaú.`,
            images: ['provincia1.jpg', 'provincia2.jpg']
        }
    },
    '505354011': { // Banco do Brasil
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316374, -30.341547, 136), // 146,09
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'bb_low.glb',
        uri_detail: 'bb.glb',
        info: {
            title: 'BANCO DO BRASIL',
            description: `No local ocupado pelo Banco do Brasil desde o século XIX, em 1835 funcionou temporariamente um hospital destinado ao atendimento de feridos durante a Guerra dos Farrapos. Essa antiga instalação, conhecida como Hospital Banco de Sangue no período do conflito, marcou a história local antes da consolidação do uso bancário do imóvel.`,
            images: ['bb1.jpg']
        }
    },
    '228625933': { // Banrisul
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.318080, -30.341116, 136), // 142
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'banrisul_low.glb',
        uri_detail: 'banrisul.glb',
        info: {
            title: 'BANRISUL',
            description: `O prédio da esquina das ruas Sezefredo e General Mallet foi inaugurado em 1915 para abrigar a filial do Banco Pelotense, fundada em 26 de março de 1912. Reformado em 1920, ganhou um segundo piso e uma marcante abóbada, tornando-se referência arquitetônica em São Gabriel. O banco teve papel importante no desenvolvimento urbano, promovendo loteamentos como o Bairro Siqueira e a Chácara dos Pinheiros.<br><br>
Com a crise financeira dos anos 1920 e a criação do Banco do Estado do Rio Grande do Sul (Banrisul) em 1928, o Pelotense entrou em liquidação em 1931. O Banrisul assumiu o prédio, que passou por reformas e, nos anos 1940, teve sua abóbada removida — seja por questões estruturais ou para apagar o símbolo da antiga instituição.`,
            images: ['banrisul1.jpg', 'banrisul2.jpg']
        }
    },
    '496697002': { // Copex 
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316500, -30.340160, 136), // 144
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'copex_low.glb',
        uri_detail: 'copex.glb',
        info: {
            title: 'COPEX',
            description: `O prédio foi, por muitos anos, sede da Cooperativa de Crédito de São Gabriel (CoopEx), fundada em 1962 inicialmente para militares do Exército e, depois, aberta a civis, chegando a mais de 2.500 associados. Nos anos 2000, o local passou a abrigar também uma agência da Caixa Econômica Federal.<br><br>
O imóvel tem ligação histórica com o marechal Hermes da Fonseca, nascido em São Gabriel em 12 de maio de 1855. Hermes foi presidente do Brasil entre 1910 e 1914, participou da Proclamação da República e teve papel marcante na história militar e política do país.`,
            images: ['copex1.jpg']
        }
    },
    '496696995': { // Casa Central
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316500, -30.340160, 136), // 144
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'casacentral_low.glb',
        uri_detail: 'casacentral.glb',
        info: {
            title: 'CASA CENTRAL',
            description: 'No início, a Casa Central que foi atualizando para Rainha dos Móveis, Urbis e atualmente Pompeia.',
            images: ['casacentral1.jpg', 'casacentral2.jpg', 'casacentral3.jpg', 'casacentral4.jpg']
        }
    },

    '496680317': { // Loja São Miguel
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317553, -30.340040, 136), // 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        // scale: { x: 1, y: 1, z: 1 }, // Controle de escala XYZ
        uri_base: 'saomiguel_low.glb',
        uri_detail: 'saomiguel.glb',
        info: {
            title: 'LOJA SÃO MIGUEL',
            description: `O prédio da Loja São Miguel tem uma longa história de usos em São Gabriel. No local já funcionou um armazém de madeira do português José Figueiró (1892), residência da família Olimpyo Estrázulas, agência dos Correios (1930), além da tradicional Casa São Miguel, especializada em roupas e tecidos desde 1941. O imóvel também abrigou agências bancárias como Habitasul, Bamerindus, HSBC e Bradesco. Atualmente, o prédio é ocupado por uma farmácia Panvel.`,
            images: ['saomiguel1.jpg', 'saomiguel2.jpg', 'saomiguel3.jpg']
        }
    },
    '496696981': { // Maçonaria
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317040, -30.339852, 136), // 142
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'maçonaria_low.glb',
        uri_detail: 'maçonaria.glb',
        info: {
            title: 'MAÇONARIA - ROCHA NEGRA NR 1',
            description: `A Loja Maçônica Rocha Negra nº 1, fundada em 29 de junho de 1873 por 11 membros liderados por Jonathas Abbott, é uma das mais antigas instituições de São Gabriel. Com o lema “Liberdade, Igualdade, Fraternidade”, teve papel fundamental na abolição da escravidão no município: em 28 de setembro de 1884, anunciou em sessão magna que a escravidão estava extinta em todos os recantos da cidade, quatro anos antes da Lei Áurea. O nome Rocha Negra nº 1 foi concedido pela Maçonaria do Rio de Janeiro em reconhecimento ao êxito da campanha abolicionista local.`,
            images: ['maçonaria1.jpg', 'maçonaria2.jpg']
        }
    },
    '496697003': { // Sobrado/biblioteca/D.Pedro
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316098, -30.340311, 136), // 142
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'sobrado_low.glb',
        uri_detail: 'sobrado.glb',
        info: {
            title: 'SOBRADO HISTÓRICO DE SÃO GABRIEL',
            description: `O Sobrado da Praça, também conhecido como Sobrado Dom Pedro II, foi construído em 1826 pelo português Francisco José de Carvalho e é um dos mais antigos marcos arquitetônicos de São Gabriel. Tombado pelo Instituto do Patrimônio Histórico e Artístico Nacional em 1974, o prédio foi restaurado com verba federal.<br><br>
O sobrado ficou famoso por hospedar o imperador Dom Pedro II durante sua visita à cidade em janeiro de 1846, quando permaneceu por seis dias e se encantou com a paisagem local.`,
            images: ['sobrado1.jpg']
        }
    },
    '496692924': { // Getúlio discursou
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316817, -30.341718, 136), // 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'getulio_low.glb',
        uri_detail: 'getulio.glb',
        info: {
            title: 'CASA ONDE GETÚLIO DISCURSOU',
            description: `Três casarões históricos de São Gabriel se destacam por suas janelas redondas, preservando uma arquitetura eclética que mistura elementos do barroco, gótico e romano, com detalhes em alvenaria e ferro. Um desses casarões entrou para a história ao servir de cenário para um discurso de Getúlio Vargas na praça Fernando Abbott, reunindo milhares de pessoas e marcando a memória da cidade.`,
            images: ['getulio1.jpg', 'getulio2.jpg']
        }
    },
    '496692932': { // Hoje Banco Bradesco
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317569, -30.341437, 136), // 143
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'bradesco_low.glb',
        uri_detail: 'bradesco.glb',
        info: {
            title: 'HOJE BRADESCO',
            description: `O prédio que hoje abriga o Banco Bradesco é um dos símbolos da São Gabriel histórica, destacando-se pela fachada ornamentada com uma musa central, ramos republicanos do castilhismo gaúcho e detalhes florais sobre as janelas, além de cinco colunas greco-romanas brancas — marcas da ostentação arquitetônica da elite local em seu apogeu.<br><br>
Conta-se que o antigo proprietário, Seu Macedo, emocionou-se ao ver o casarão sendo demolido, chorando no banco da praça em frente. Desde os anos 1980, o local é sede do Bradesco.`,
            images: ['bradesco1.jpg']
        }
    },
    '505354027': { // Casa América
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.315992, -30.340752, 136), // 141
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'america_low.glb',
        uri_detail: 'america.glb',
        info: {
            title: 'CASA AMÉRICA',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['america1.jpg']
        }
    },
    '505354023': { // Casa do Pastor
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316104, -30.340986, 136), // 144
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'pastor_low.glb',
        uri_detail: 'pastor.glb',
        info: {
            title: 'CASA DO PASTOR',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['pastor1.jpg']
        }
    },
    '505353919': { // Casa família Terra
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.315906, -30.340653, 136), // 141
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'terra_low.glb',
        uri_detail: 'terra.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['terra1.jpg']
        }
    },
    '496680298': { // Casarão Amarelo
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317810, -30.340555, 136), // 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'amarelo_low.glb',
        uri_detail: 'amarelo.glb',
        info: {
            title: 'CASARÃO AMARELO',
            description: `O Solar do Barão de São Gabriel, conhecido como Casarão Amarelo, é um ícone da arquitetura imperial da cidade. Construído em 1860 pelo Marechal João Propício de Figueiredo Menna Barreto, o 2º Barão de São Gabriel, o casarão foi lar de várias gerações da família Menna Barreto e palco de importantes momentos da história local.<br><br>
Ao longo dos anos, abrigou o Clube Cassino Gabrielense, clínicas médicas e permanece até hoje como residência da família. O imóvel destaca-se por sua arquitetura eclética, com platibanda, florão imperial, colunas gregas, arcos e sacadas em ferro, além de um jardim com chafariz e portão de ferro batido.`,
            images: ['amarelo1.jpg', 'amarelo2.jpg', 'amarelo3.jpg']
        }
    },
    '496692933': { // Clube Comercial
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317818, -30.341347, 136), // 143
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'comercial_low.glb',
        uri_detail: 'comercial.glb',
        info: {
            title: 'CLUBE COMERCIAL',
            description: `No local onde hoje está o Clube Comercial funcionou o Coliseu Central, o maior teatro da história de São Gabriel, com capacidade para 1.500 pessoas. O espaço era referência cultural na cidade até o início dos anos 1930, quando um incêndio — causado por um acidente com o projetor de filmes — destruiu o prédio, então pertencente à Joucla & Cia.`,
            images: ['comercial1.jpg', 'comercial2.jpg', 'comercial3.jpg']
        }
    },
    '505353915': { // Clube Guarani
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316168, -30.341109, 136), // 145.06
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'guarani_low.glb',
        uri_detail: 'guarani.glb',
        info: {
            title: 'CLUBE GUARANI',
            description: `O prédio do antigo Clube Guarani foi originalmente construído em 1900 como residência do Dr. José Narciso Antunes, intendente de São Gabriel e responsável por trazer a energia elétrica à cidade. Após servir como clínica médica, o imóvel foi adquirido pelo clube social Guarani, fundado em 21 de abril de 1944, inicialmente voltado para militares e, a partir de 1975, aberto também a civis.<br><br>
O Guarani viveu seu auge entre as décadas de 1970 e 1990, sendo palco de bailes, carnavais e encontros da juventude local. Com o declínio dos clubes sociais no Brasil, encerrou suas atividades e, atualmente, o prédio encontra-se abandonado no centro da cidade.`,
            images: ['guarani1.jpg', 'guarani2.jpg']
        }
    },
    '496680296': { // Café Central
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317937, -30.340809, 136),// 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'cafecentral_low.glb',
        uri_detail: 'cafecentral.glb',
        info: {
            title: 'CAFÉ CENTRAL',
            description: `O Café Central foi um tradicional ponto de encontro em São Gabriel, localizado em uma dos locais mais movimentados da cidade. Nos anos 1920, era comum ver os carros de praça — os antigos táxis — estacionados em frente ao local, reforçando seu papel como referência social e comercial. A foto histórica de 1921 registra esse cenário típico da época.`,
            images: ['cafecentral.jpg']
        }
    },
    '496696988': { // Farmácia Central
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316858, -30.340008, 136), // 144
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'farmaciacentral_low.glb',
        uri_detail: 'farmaciacentral.glb',
        info: {
            title: 'FARMÁCIA CENTRAL',
            description: `A Farmácia Central foi fundada pelo Dr. Argeu, farmacêutico reconhecido por sua dedicação e generosidade. Inicialmente instalada na praça Fernando Abbott, na esquina da Laurindo, a farmácia logo conquistou a confiança da comunidade. Posteriormente, mudou-se para a rua Francisco Leivas. Dr. Argeu era conhecido por criar fórmulas próprias e atender a todos, inclusive quem não podia pagar, tornando-se uma figura admirada e respeitada em São Gabriel.`,
            images: ['farmaciacentral.jpg']
        }
    },
    '496675629': { // Farmácia Confiança
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.318204, -30.341384, 136), // 142
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'farmaciaconfianca_low.glb',
        uri_detail: 'farmaciaconfianca.glb',
        info: {
            title: 'FARMÁCIA CONFIANÇA',
            description: `A Farmácia Confiança foi um importante estabelecimento de São Gabriel nos anos 1940, localizada na esquina com o Banrisul e o Clube Comercial. O prédio também abrigou, por muitos anos, o consultório do Dr. Fernando Abbott, figura de destaque na área da saúde local.`,
            images: ['farmaciaconfianca1.jpg']
        }
    },
    '502141804': { // Igreja do Galo
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316628, -30.342041, 136),  // 141
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'galo_low.glb',
        uri_detail: 'galo.glb',
        info: {
            title: 'IGREJA DO GALO',
            description: `A Igreja do Galo, oficialmente Nossa Senhora do Rosário – Bonfim, foi a primeira igreja de alvenaria de São Gabriel, construída em 1817. Seu nome popular vem do galo de bronze que adornava o topo, símbolo de tradição e fé, inspirado em referências bíblicas. Conta-se que o local já foi um cemitério indígena.<br><br>
O galo desapareceu em 1985, e a igreja quase foi demolida, mas acabou parcialmente restaurada. O templo guarda memórias de missas históricas, como a celebrada na presença do imperador Dom Pedro II em sua passagem pela cidade.`,
            images: ['galo1.jpg']
        }
    },
    '496683075': { // Igreja Matriz
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317459, -30.341476, 136),  // 143
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'matriz_low.glb',
        uri_detail: 'matriz.glb',
        info: {
            title: 'IGREJA MATRIZ',
            description: `A Igreja Matriz de São Gabriel, em estilo neoclássico, é um dos principais cartões-postais da cidade. Sua história começou em 1848, quando a Câmara Municipal escolheu o local mais alto da vila para a construção do templo. A comissão responsável pelas obras foi nomeada em 1861, tendo como presidente o Barão do Cambai e membros ilustres como o Barão de Candiota.<br><br>
A pedra fundamental foi lançada em 14 de março de 1863, com a primeira argamassa colocada pelos barões João Propício Menna Barreto e Antônio Martins da Cruz Jobim.`,
            images: ['matriz1.jpg', 'matriz2.jpg']
        }
    },
    '505354033': { // Posto Esso 1944
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.315853, -30.340659, 136), // 141.00
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'esso_low.glb',
        uri_detail: 'esso.glb',
        info: {
            title: 'POSTO ESSO',
            description: `No início da era dos automóveis em São Gabriel, o abastecimento era feito com galões de gasolina em casa ou em bombas portáteis instaladas em frente a lojas autorizadas, operadas manualmente por manivela. Marcas como Texaco, Esso e Shell estavam presentes na cidade. Com o aumento acelerado da frota de veículos nos anos 1940, surgiu a necessidade de postos fixos, e o Posto Esso tornou-se um dos primeiros estabelecimentos dedicados ao abastecimento de automóveis em São Gabriel.`,
            images: ['esso1.jpg']
        }
    },
    '494741651': { // Prefeitura Municipal
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.319076, -30.339119, 136),  // 141
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'prefeitura_low.glb',
        // Modelo detalhado agora dividido em 4 blocos (ajuste nomes conforme seus arquivos reais)
        uri_detail: [
            'prefeitura_bloco1.glb',
            'prefeitura_bloco2.glb',
            'prefeitura_bloco3.glb',
            'prefeitura_bloco4.glb'
        ],
        info: {
            title: 'PREFEITURA MUNICIPAL',
            description: `O Palácio Plácido de Castro, sede da Prefeitura Municipal de São Gabriel, foi construído entre 1918 e 1924 em terreno adquirido por Frederico Fayet. O projeto, inspirado no Capitólio norte-americano, passou por diferentes engenheiros até ser concluído e inaugurado em 15 de novembro de 1924, durante a gestão do coronel Francisco Hermenegildo da Silva.<br><br>
Um dos destaques do prédio é a porta principal, talhada em madeira de cinamomo, que ostenta o brasão do Brasil e o do Rio Grande do Sul. O edifício é um dos marcos arquitetônicos e históricos da cidade, simbolizando o poder executivo municipal.`,
            images: ['prefeitura1.jpg']
        }
    }
    ,
    // Novos GLBs provisórios
    '496696996': { // esquerda_sobrado
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316227, -30.340263, 136), // 143
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'esquerda_sobrado_low.glb',
        uri_detail: 'esquerda_sobrado.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['esquerda_sobrado1.jpg']
        }
    },
    '496692925': { // esquerda_igreja
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316900, -30.341682, 136), // 141
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'esquerda_igreja_low.glb',
        uri_detail: 'esquerda_igreja.glb',
        info: {
            title: 'esquerda_igreja (provisório)',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['esquerda_igreja1.jpg']
        }
    },
    '505354025': { // esquerda_pastor
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.315984, -30.340869, 136), // 144.06
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'esquerda_pastor_low.glb',
        uri_detail: 'esquerda_pastor.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['esquerda_pastor1.jpg']
        }
    },
    '228625830': { // esquerda_cafecentral
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.318005, -30.340976, 136),// 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'esquerda_cafecentral_low.glb',
        uri_detail: 'esquerda_cafecentral.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['esquerda_cafecentral.jpg']
        }
    },
    '505353911': { // esquina_galo
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316521, -30.341834, 136), // 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'esquina_galo_low.glb',
        uri_detail: 'esquina_galo.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['esquina_galo1.jpg']
        }
    },
    '496696982': { // direita_maçonaria
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316919, -30.339898, 136), // 143
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'direita_maçonaria_low.glb',
        uri_detail: 'direita_maçonaria.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['direita_maçonaria1.jpg']
        }
    },
    '496680282': { // praça1
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317679, -30.340259, 136), // 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'praça1_low.glb',
        uri_detail: 'praça1.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['praça1.jpg', 'praça2.jpg']
        }
    },
    '496692923': { // esquina Getulio
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316616, -30.341797, 136), // 140
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'esquina_getulio_low.glb',
        uri_detail: 'esquina_getulio.glb',
        info: {
            title: 'GUEDES BARBOSA',
            description: `A loja Guedes Barbosa marcou época em São Gabriel, especialmente quando funcionava na esquina da Coronel Sezefredo com a Andrade Neves. Nos anos 1990, era tradição as lojas decorarem fachadas e vitrines para o Natal, tornando o centro da cidade ainda mais encantador durante as festas de fim de ano.`,
            images: ['esquina_getulio1.jpg']
        }
    },
    '496696997': { // beco_sobrado
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316598, -30.340111, 136), // 144
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'beco_sobrado_low.glb',
        uri_detail: 'beco_sobrado.glb',
        info: {
            title: 'Casa Privada',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['beco_sobrado1.jpg']
        }
    },
    '260863639': { // Poço
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.316974, -30.340808, 140),// 144.08
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'poco_low.glb',
        uri_detail: 'poco_centro.glb',
        info: {
            title: 'POÇO ANTIGO',
            description: 'No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['poco1.jpg']
        }
    },
    '262049292': { // Museu Gaúcho da FEB
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.3250266, -30.3359283, 170),// 144.08
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'museu_feb_low.glb',
        uri_detail: 'museu_feb.glb',
        info: {
            title: 'MUSEU GAÚCHO DA FEB',
            description: 'Museu dedicado à memória da participação gaúcha na Força Expedicionária Brasileira (FEB) na Segunda Guerra Mundial, com uniformes, objetos, documentos e painéis que preservam a história dos combatentes e a relação com a comunidade local.',
            images: ['tour_feb.jpg']
        }
    },
    '474529581': { // Clube Caixeral
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.3186732, -30.3394415, 136),// 144.08
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'caixeral_low.glb',
        uri_detail: 'caixeral.glb',
        info: {
            title: 'CLUBE CAIXERAL',
            description: `Fundado em 19 de maio de 1895 como União Caixeiral Gabrielense, o Clube Caixeiral foi um centro social importante em São Gabriel, conhecido por bailes, carnavais e noites de boate nas décadas de 1960–70. A reforma e ampliação do prédio explicam a escada central do salão: adicionaram-se janelas e o acesso acabou ficando no meio do salão. Hoje o clube integra a memória cultural e social da cidade.`,
            images: ['caixeral.jpg']
        }
    },
    '226820498': { // Rodoviária São Gabriel
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.325346, -30.343651, 140),// 144.08
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-43), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'rodoviaria_low.glb',
        uri_detail: 'rodoviaria.glb',
        info: {
            title: 'RODOVIÁRIA SÃO GABRIEL',
            description: `A Rodoviária de São Gabriel foi construída em 1972, na gestão do Dr. Alfredo Bento Pereira Filho. Desde então serve como o principal terminal rodoviário da cidade, conectando São Gabriel a municípios vizinhos e concentrando serviços de transporte e comércio no entorno.`,
            images: ['rodoviaria.jpg']
        }
    },
    '437396075': { // Vila Eulália
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.314821, -30.338520, 133),// 144.08
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(112), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'vila_eulalia_low.glb',
        uri_detail: 'vila_eulalia.glb',
        info: {
            title: 'VILA EULÁLIA',
            description: 'Conjunto residencial histórico conhecido como Vila Eulália, que preserva exemplos da habitação popular e a memória coletiva do bairro central.',
            images: ['vila_eulalia.jpg']
        }
    },
    '111111111': { // Heróis da FEB
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317539, -30.340605, 137),// 144.08
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-156), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'monumento1_low.glb',
        uri_detail: 'monumento1.glb',
        info: {
            title: 'HERÓIS DA FEB',
            description: 'Monumento em homenagem aos Heróis da Força Expedicionária Brasileira (FEB) que lutaram na Segunda Guerra Mundial. Representa o reconhecimento da cidade aos seus combatentes e à memória da participação brasileira no conflito. Além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['monumento1.jpg']
        }
    },
    '222222222': { //sampaio
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317499, -30.341000, 138),
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-190), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'sampaio_low.glb',
        uri_detail: 'sampaio.glb',
        info: {
            title: 'SAMPAIO MARQUES LUZ',
            description: 'Monumento em homenagem a Sampaio Marques Luz, ex-prefeito de São Gabriel e jornalista, reconhecido por sua atuação na vida pública e contribuição para a imprensa local.',
            images: ['sampaio1.jpg']
        }
    },
    '333333333': { // Celestino
        elevationOffset: 0,
        position: Cesium.Cartesian3.fromDegrees(-54.317305, -30.340343, 138),
        orientation: new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0)),
        uri_base: 'celestino_low.glb',
        uri_detail: 'celestino.glb',
        info: {
            title: 'DR. CELESTINO CAVALHEIRO',
            description: 'Monumento dedicado ao Dr. Celestino Cavalheiro, ex-prefeito, médico e cidadão ilustre de São Gabriel, reconhecido por sua atuação na área da saúde e pelo legado de dedicação à comunidade local. No entorno urbano da Praça Fernando Abbott, além dos prédios históricos e seus detalhes arquitetônicos, destacam-se casas e lojas privadas que, mesmo sem registros detalhados, contribuem para a identidade e a vivacidade do centro da cidade.',
            images: ['celestino1.jpg']
        }
    }
};