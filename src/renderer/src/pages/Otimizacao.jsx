import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import { notify as toast } from "../lib/notify"
import {
    Activity,
    Battery,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    Cpu,
    Gauge,
    Layers3,
    LoaderCircle,
    MonitorCog,
    Power,
    Rocket,
    RotateCcw,
    Shield,
    Sparkles,
    TerminalSquare,
    TriangleAlert,
    X,
    Zap,
} from "lucide-react"

const MODES = [
    {
        id: "full",
        short: "Essencial",
        title: "Windows Essencial - 82 módulos",
        tag: "Base otimizada",
        summary:
            "Perfil inicial com 82 ajustes no pacote, focado em melhorias importantes para jogos, multimídia, áudio, baixa latência e resposta geral do sistema.",
        target: "Quem quer uma otimização segura, limpa e organizada para performance geral.",
        intensity: 65,
        risk: "Baixa",
        icon: Gauge,
        color: "blue",
        bullets: [
            "82 ajustes organizados no pacote Essencial.",
            "Foco em jogos, multimídia e baixa latência.",
            "Boa opção para começar a otimização.",
            "Melhora o sistema sem partir para cortes muito agressivos.",
        ],
    },
    {
        id: "balanced",
        short: "Avançado",
        title: "Windows Avançado - 116 módulos",
        tag: "Mais completo",
        summary:
            "Perfil avançado com 116 ajustes no pacote, feito para melhorar fluidez, entrada, visual, estabilidade e reduzir recursos que pesam no Windows.",
        target: "Usuários que querem mais desempenho mantendo uma experiência usável no dia a dia.",
        intensity: 82,
        risk: "Média",
        icon: Shield,
        color: "cyan",
        bullets: [
            "116 ajustes organizados no pacote Avançado.",
            "Mais forte que o Essencial.",
            "Equilibra desempenho, resposta e estabilidade.",
            "Boa escolha antes de usar o perfil Máximo.",
        ],
    },
    {
        id: "extreme",
        short: "Máximo",
        title: "Windows Máximo - 131 módulos",
        tag: "Mais agressivo",
        summary:
            "Perfil mais agressivo com 131 ajustes no pacote, voltado para cortar recursos secundários, reduzir tarefas em segundo plano e buscar o máximo desempenho.",
        target: "Jogos competitivos, PCs focados em FPS e usuários que querem performance máxima.",
        intensity: 100,
        risk: "Alta",
        icon: Rocket,
        color: "indigo",
        bullets: [
            "131 ajustes organizados no perfil Máximo.",
            "Corta mais recursos secundários do Windows.",
            "Foco total em desempenho e resposta.",
            "Recomendado para quem sabe que quer modo agressivo.",
        ],
    },
]

const OPTIMIZATION_SCRIPTS = {
    balanced: [
        {
            name: "Limpeza completa (modo agressivo)",
            script: "maxify-premium://mx_win_balanced_001_12c1d040",
        },
        {
            name: "Desativando componentes IPv6 definidos no ajuste",
            script: "maxify-premium://mx_win_balanced_002_0e59b65a",
        },
        {
            name: "Desativando solicitação de confirmação para administrador",
            script: "maxify-premium://mx_win_balanced_003_83f2d4de",
        },
        {
            name: "Desativando UAC",
            script: "maxify-premium://mx_win_balanced_004_b7c135b5",
        },
        {
            name: "Desativando tela segura de confirmação",
            script: "maxify-premium://mx_win_balanced_005_bc1f345c",
        },
        {
            name: "Ativando cache amplo do sistema",
            script: "maxify-premium://mx_win_balanced_006_1e509b46",
        },
        {
            name: "Desativando paginação do kernel",
            script: "maxify-premium://mx_win_balanced_007_3c88aa03",
        },
        {
            name: "Desativando paging combining",
            script: "maxify-premium://mx_win_balanced_008_187305c6",
        },
        {
            name: "Desativando CFG",
            script: "maxify-premium://mx_win_balanced_009_b9143662",
        },
        {
            name: "Ajustando FeatureSettings",
            script: "maxify-premium://mx_win_balanced_010_8a2dc734",
        },
        {
            name: "Ajustando FeatureSettingsOverride",
            script: "maxify-premium://mx_win_balanced_011_7d916ba5",
        },
        {
            name: "Ajustando máscara de override de recursos",
            script: "maxify-premium://mx_win_balanced_012_856b87c3",
        },
        {
            name: "Ajustando DMA externo durante bloqueio",
            script: "maxify-premium://mx_win_balanced_013_8ce2181b",
        },
        {
            name: "Desativando segurança baseada em virtualização",
            script: "maxify-premium://mx_win_balanced_014_3c3ff799",
        },
        {
            name: "Desativando exigência HVCI",
            script: "maxify-premium://mx_win_balanced_015_f428adbe",
        },
        {
            name: "Aumentando fila de dados do teclado",
            script: "maxify-premium://mx_win_balanced_016_f13e500d",
        },
        {
            name: "Aumentando fila de dados do mouse",
            script: "maxify-premium://mx_win_balanced_017_dedb27e4",
        },
        {
            name: "Definindo sensibilidade do mouse",
            script: "maxify-premium://mx_win_balanced_018_0f66a3f8",
        },
        {
            name: "Desativando aceleração padrão do mouse",
            script: "maxify-premium://mx_win_balanced_019_ed7dc68c",
        },
        {
            name: "Ajustando threshold 1 do mouse",
            script: "maxify-premium://mx_win_balanced_020_f802ab2f",
        },
        {
            name: "Ajustando threshold 2 do mouse",
            script: "maxify-premium://mx_win_balanced_021_4523fe0b",
        },
        {
            name: "Reduzindo timer de coalescência na sessão de energia",
            script: "maxify-premium://mx_win_balanced_022_e91637da",
        },
        {
            name: "Reduzindo timer de coalescência da memória",
            script: "maxify-premium://mx_win_balanced_023_f099f058",
        },
        {
            name: "Reduzindo timer de coalescência do kernel",
            script: "maxify-premium://mx_win_balanced_024_8f410aa6",
        },
        {
            name: "Reduzindo timer de coalescência do executivo",
            script: "maxify-premium://mx_win_balanced_025_ead3dcb1",
        },
        {
            name: "Reduzindo timer de coalescência principal",
            script: "maxify-premium://mx_win_balanced_026_5160aca4",
        },
        {
            name: "Reduzindo timer de coalescência do Modern Sleep",
            script: "maxify-premium://mx_win_balanced_027_e9df9240",
        },
        {
            name: "Reduzindo timer de coalescência da energia",
            script: "maxify-premium://mx_win_balanced_028_45226d80",
        },
        {
            name: "Reduzindo timer de coalescência global",
            script: "maxify-premium://mx_win_balanced_029_c60a966f",
        },
        {
            name: "Ajustando responsividade do sistema",
            script: "maxify-premium://mx_win_balanced_030_a4b8fdab",
        },
        {
            name: "Ajustando prioridade dos jogos",
            script: "maxify-premium://mx_win_balanced_031_8ab36877",
        },
        {
            name: "Desativando ProtectionMode",
            script: "maxify-premium://mx_win_balanced_032_74cf0405",
        },
        {
            name: "Desativando política de composição da DWM",
            script: "maxify-premium://mx_win_balanced_033_cd4075ae",
        },
        {
            name: "Desativando composição visual",
            script: "maxify-premium://mx_win_balanced_034_11418598",
        },
        {
            name: "Desativando colorização de janelas",
            script: "maxify-premium://mx_win_balanced_035_90e2cb5b",
        },
        {
            name: "Desativando Aero Peek",
            script: "maxify-premium://mx_win_balanced_036_2e330af6",
        },
        {
            name: "Desativando miniaturas em hibernação",
            script: "maxify-premium://mx_win_balanced_037_0da73b3d",
        },
        {
            name: "Bloqueando coleta implícita de texto",
            script: "maxify-premium://mx_win_balanced_038_e0d810c7",
        },
        {
            name: "Bloqueando coleta implícita de tinta",
            script: "maxify-premium://mx_win_balanced_039_71309d5a",
        },
        {
            name: "Mostrando arquivos ocultos",
            script: "maxify-premium://mx_win_balanced_040_69bbbd86",
        },
        {
            name: "Ajustando efeitos visuais para desempenho",
            script: "maxify-premium://mx_win_balanced_041_18f193f9",
        },
        {
            name: "Desativando arrasto com janela completa",
            script: "maxify-premium://mx_win_balanced_042_b3f9b1f2",
        },
        {
            name: "Mantendo suavização de fonte",
            script: "maxify-premium://mx_win_balanced_043_253f1786",
        },
        {
            name: "Aplicando máscara de preferências visuais",
            script: "maxify-premium://mx_win_balanced_044_d4896de0",
        },
        {
            name: "Desativando animação de minimizar janelas",
            script: "maxify-premium://mx_win_balanced_045_c1600529",
        },
        {
            name: "Aplicando shell state do Explorer",
            script: "maxify-premium://mx_win_balanced_046_c32b1da6",
        },
        {
            name: "Exibindo somente ícones",
            script: "maxify-premium://mx_win_balanced_047_e454a515",
        },
        {
            name: "Desativando seleção alpha da lista",
            script: "maxify-premium://mx_win_balanced_048_c2c68f7e",
        },
        {
            name: "Desativando sombra da lista",
            script: "maxify-premium://mx_win_balanced_049_2aa02ee0",
        },
        {
            name: "Desativando animações da barra de tarefas",
            script: "maxify-premium://mx_win_balanced_050_66bd61c0",
        },
        {
            name: "Desativando alto contraste padrão",
            script: "maxify-premium://mx_win_balanced_051_ee562aa7",
        },
        {
            name: "Desativando resposta especial do teclado",
            script: "maxify-premium://mx_win_balanced_052_ca0e7a06",
        },
        {
            name: "Desativando mouse keys padrão",
            script: "maxify-premium://mx_win_balanced_053_fbe01952",
        },
        {
            name: "Desativando SoundSentry padrão",
            script: "maxify-premium://mx_win_balanced_054_66e933d3",
        },
        {
            name: "Desativando StickyKeys padrão",
            script: "maxify-premium://mx_win_balanced_055_afc7ee2b",
        },
        {
            name: "Desativando timeout de acessibilidade padrão",
            script: "maxify-premium://mx_win_balanced_056_d028d6a5",
        },
        {
            name: "Desativando ToggleKeys padrão",
            script: "maxify-premium://mx_win_balanced_057_0a866c7f",
        },
        {
            name: "Ajustando flags do MouseKeys do usuário",
            script: "maxify-premium://mx_win_balanced_058_327b964b",
        },
        {
            name: "Aumentando velocidade máxima do MouseKeys",
            script: "maxify-premium://mx_win_balanced_059_fd859a88",
        },
        {
            name: "Ajustando tempo para velocidade máxima do MouseKeys",
            script: "maxify-premium://mx_win_balanced_060_f1be1e1b",
        },
        {
            name: "Desativando manutenção automática",
            script: "maxify-premium://mx_win_balanced_061_727d1119",
        },
        {
            name: "Desativando hibernação",
            script: "maxify-premium://mx_win_balanced_062_0f351ab3",
        },
        {
            name: "Desativando inicialização híbrida",
            script: "maxify-premium://mx_win_balanced_063_24b58142",
        },
        {
            name: "Desativando Sleep Study",
            script: "maxify-premium://mx_win_balanced_064_c7e5f874",
        },
        {
            name: "Desativando Aero Shake",
            script: "maxify-premium://mx_win_balanced_065_d9d35364",
        },
        {
            name: "Desativando atalho de idioma",
            script: "maxify-premium://mx_win_balanced_066_b0aa3fae",
        },
        {
            name: "Desativando hotkey principal de teclado",
            script: "maxify-premium://mx_win_balanced_067_fe598d40",
        },
        {
            name: "Desativando hotkey de layout",
            script: "maxify-premium://mx_win_balanced_068_6243418f",
        },
        {
            name: "Desativando redução automática de volume",
            script: "maxify-premium://mx_win_balanced_069_1b43880f",
        },
        {
            name: "Criando chave de eventos de aplicativo",
            script: "maxify-premium://mx_win_balanced_070_64f85e3d",
        },
        {
            name: "Reduzindo atraso da troca de área de trabalho",
            script: "maxify-premium://mx_win_balanced_071_c7f4dc9e",
        },
        {
            name: "Desativando prefetcher",
            script: "maxify-premium://mx_win_balanced_072_6ae39d60",
        },
        {
            name: "Desativando superfetch",
            script: "maxify-premium://mx_win_balanced_073_cd0512fb",
        },
        {
            name: "Desativando recursos promocionais do Windows",
            script: "maxify-premium://mx_win_balanced_074_ee9eac68",
        },
        {
            name: "Desativando log WUDF",
            script: "maxify-premium://mx_win_balanced_075_63f8aa15",
        },
        {
            name: "Reduzindo nível de log WUDF",
            script: "maxify-premium://mx_win_balanced_076_ea0ca91b",
        },
        {
            name: "Ajustando política de peernet",
            script: "maxify-premium://mx_win_balanced_077_526c9d6e",
        },
        {
            name: "Desativando DEP do Internet Explorer",
            script: "maxify-premium://mx_win_balanced_078_0ec9083f",
        },
        {
            name: "Desativando identificador de publicidade",
            script: "maxify-premium://mx_win_balanced_079_380de7af",
        },
        {
            name: "Desativando conteúdo sugerido 310093",
            script: "maxify-premium://mx_win_balanced_080_ac304bb4",
        },
        {
            name: "Desativando conteúdo sugerido 338389",
            script: "maxify-premium://mx_win_balanced_081_e3413e02",
        },
        {
            name: "Desativando conteúdo sugerido 338393",
            script: "maxify-premium://mx_win_balanced_082_e58ccef6",
        },
        {
            name: "Desativando conteúdo sugerido 353694",
            script: "maxify-premium://mx_win_balanced_083_70fe09c1",
        },
        {
            name: "Desativando conteúdo sugerido 353696",
            script: "maxify-premium://mx_win_balanced_084_8980e425",
        },
        {
            name: "Desativando instalação silenciosa de apps",
            script: "maxify-premium://mx_win_balanced_085_3720a076",
        },
        {
            name: "Desativando experiência inicial do sistema",
            script: "maxify-premium://mx_win_balanced_086_68e1eafd",
        },
        {
            name: "Desativando experiências personalizadas",
            script: "maxify-premium://mx_win_balanced_087_1d58a32d",
        },
        {
            name: "Bloqueando publicidade por política",
            script: "maxify-premium://mx_win_balanced_088_320922a8",
        },
        {
            name: "Desativando autenticação de código segura",
            script: "maxify-premium://mx_win_balanced_089_adbe8ee5",
        },
        {
            name: "Desativando autologger do Diagtrack",
            script: "maxify-premium://mx_win_balanced_090_65f0dc06",
        },
        {
            name: "Desativando SQMLogger",
            script: "maxify-premium://mx_win_balanced_091_25b91878",
        },
        {
            name: "Reduzindo telemetria principal",
            script: "maxify-premium://mx_win_balanced_092_f30a8586",
        },
        {
            name: "Reduzindo telemetria por política",
            script: "maxify-premium://mx_win_balanced_093_de9cce52",
        },
        {
            name: "Reduzindo telemetria do Wow6432Node",
            script: "maxify-premium://mx_win_balanced_094_85cfa6b4",
        },
        {
            name: "Desativando painel inicial da Game Bar",
            script: "maxify-premium://mx_win_balanced_095_5aec06f9",
        },
        {
            name: "Ajustando dica inicial da Game Bar",
            script: "maxify-premium://mx_win_balanced_096_56825a09",
        },
        {
            name: "Desativando modo jogo automático",
            script: "maxify-premium://mx_win_balanced_097_cb370922",
        },
        {
            name: "Desativando Auto Game Mode",
            script: "maxify-premium://mx_win_balanced_098_5ae36463",
        },
        {
            name: "Desativando Nexus da Game Bar",
            script: "maxify-premium://mx_win_balanced_099_f53ca101",
        },
        {
            name: "Desativando Game DVR",
            script: "maxify-premium://mx_win_balanced_100_91f2fef5",
        },
        {
            name: "Ajustando comportamento FSE do Game DVR",
            script: "maxify-premium://mx_win_balanced_101_5c0865e2",
        },
        {
            name: "Ajustando comportamento FSE adicional",
            script: "maxify-premium://mx_win_balanced_102_051b0276",
        },
        {
            name: "Mantendo honor user FSE",
            script: "maxify-premium://mx_win_balanced_103_3136a1a5",
        },
        {
            name: "Ajustando compatibilidade DXGI FSE",
            script: "maxify-premium://mx_win_balanced_104_ce48f140",
        },
        {
            name: "Desativando flags EFSE do Game DVR",
            script: "maxify-premium://mx_win_balanced_105_2cdee5e5",
        },
        {
            name: "Ajustando comportamento DSE do Game DVR",
            script: "maxify-premium://mx_win_balanced_106_c26a4bd2",
        },
        {
            name: "Bloqueando Game DVR pela política do sistema",
            script: "maxify-premium://mx_win_balanced_107_d388546a",
        },
        {
            name: "Bloqueando Game DVR por política do Windows",
            script: "maxify-premium://mx_win_balanced_108_ded1e23a",
        },
        {
            name: "Desativando captura de aplicativo",
            script: "maxify-premium://mx_win_balanced_109_b9165bfe",
        },
        {
            name: "Desativando AutoGameMode padrão",
            script: "maxify-premium://mx_win_balanced_110_ab0b2b9c",
        },
        {
            name: "Removendo filhos do GameConfigStore",
            script: "maxify-premium://mx_win_balanced_111_80b1d77f",
        },
        {
            name: "Removendo pais do GameConfigStore",
            script: "maxify-premium://mx_win_balanced_112_aff49189",
        },
        {
            name: "Desativando power throttling",
            script: "maxify-premium://mx_win_balanced_113_8dae6728",
        },
        {
            name: "Desativando CEIP",
            script: "maxify-premium://mx_win_balanced_114_978fb615",
        },
        {
            name: "Ajustando URL corporativa SQM",
            script: "maxify-premium://mx_win_balanced_115_12005a55",
        },
        {
            name: "Desativando biometria",
            script: "maxify-premium://mx_win_balanced_116_172ae548",
        },
    ],
    full: [
        {
            name: "Limpeza completa (modo agressivo)",
            script: "maxify-premium://mx_win_full_001_6d7388f1",
        },
        {
            name: "Criando chave principal do perfil multimídia",
            script: "maxify-premium://mx_win_full_002_69169dc2",
        },
        {
            name: "Desativando limitação de rede do Windows",
            script: "maxify-premium://mx_win_full_003_e4f0d1dc",
        },
        {
            name: "Reduzindo responsividade reservada do sistema",
            script: "maxify-premium://mx_win_full_004_9377a821",
        },
        {
            name: "Ativando modo sempre ativo do perfil multimídia",
            script: "maxify-premium://mx_win_full_005_687829f0",
        },
        {
            name: "Ajustando modo lazy do perfil multimídia",
            script: "maxify-premium://mx_win_full_006_9d672b99",
        },
        {
            name: "Definindo tempo de lazy mode",
            script: "maxify-premium://mx_win_full_007_23b5fc2b",
        },
        {
            name: "Criando perfil de áudio",
            script: "maxify-premium://mx_win_full_008_4e3754fb",
        },
        {
            name: "Definindo afinidade do perfil de áudio",
            script: "maxify-premium://mx_win_full_009_bfceb304",
        },
        {
            name: "Definindo execução em segundo plano do áudio",
            script: "maxify-premium://mx_win_full_010_b3238998",
        },
        {
            name: "Ajustando clock rate do áudio",
            script: "maxify-premium://mx_win_full_011_966f671f",
        },
        {
            name: "Definindo prioridade de GPU do áudio",
            script: "maxify-premium://mx_win_full_012_5959c9dc",
        },
        {
            name: "Definindo prioridade do áudio",
            script: "maxify-premium://mx_win_full_013_3678232a",
        },
        {
            name: "Definindo categoria de agendamento do áudio",
            script: "maxify-premium://mx_win_full_014_13514eaf",
        },
        {
            name: "Definindo prioridade SFIO do áudio",
            script: "maxify-premium://mx_win_full_015_1ec5b8fb",
        },
        {
            name: "Criando perfil de captura",
            script: "maxify-premium://mx_win_full_016_04bcaf22",
        },
        {
            name: "Definindo afinidade do perfil de captura",
            script: "maxify-premium://mx_win_full_017_c6a95ea1",
        },
        {
            name: "Definindo execução em segundo plano da captura",
            script: "maxify-premium://mx_win_full_018_3b1395ee",
        },
        {
            name: "Ajustando clock rate da captura",
            script: "maxify-premium://mx_win_full_019_0a683b2d",
        },
        {
            name: "Definindo prioridade de GPU da captura",
            script: "maxify-premium://mx_win_full_020_dfd7b43c",
        },
        {
            name: "Definindo prioridade da captura",
            script: "maxify-premium://mx_win_full_021_11f9196e",
        },
        {
            name: "Definindo categoria de agendamento da captura",
            script: "maxify-premium://mx_win_full_022_4c4f35db",
        },
        {
            name: "Definindo prioridade SFIO da captura",
            script: "maxify-premium://mx_win_full_023_eb092d54",
        },
        {
            name: "Criando perfil de pós-processamento de vídeo",
            script: "maxify-premium://mx_win_full_024_d9736e0c",
        },
        {
            name: "Definindo afinidade do pós-processamento",
            script: "maxify-premium://mx_win_full_025_63de43c1",
        },
        {
            name: "Definindo execução em segundo plano do pós-processamento",
            script: "maxify-premium://mx_win_full_026_6b200992",
        },
        {
            name: "Definindo prioridade em segundo plano do pós-processamento",
            script: "maxify-premium://mx_win_full_027_bfc7dfc3",
        },
        {
            name: "Ajustando clock rate do pós-processamento",
            script: "maxify-premium://mx_win_full_028_c3979b39",
        },
        {
            name: "Definindo prioridade de GPU do pós-processamento",
            script: "maxify-premium://mx_win_full_029_e2124034",
        },
        {
            name: "Definindo prioridade do pós-processamento",
            script: "maxify-premium://mx_win_full_030_8a864141",
        },
        {
            name: "Definindo categoria de agendamento do pós-processamento",
            script: "maxify-premium://mx_win_full_031_cb39b7d9",
        },
        {
            name: "Definindo prioridade SFIO do pós-processamento",
            script: "maxify-premium://mx_win_full_032_48674f7c",
        },
        {
            name: "Criando perfil de distribuição",
            script: "maxify-premium://mx_win_full_033_eb905744",
        },
        {
            name: "Definindo afinidade da distribuição",
            script: "maxify-premium://mx_win_full_034_c186ae3f",
        },
        {
            name: "Definindo execução em segundo plano da distribuição",
            script: "maxify-premium://mx_win_full_035_7aa4bef5",
        },
        {
            name: "Ajustando clock rate da distribuição",
            script: "maxify-premium://mx_win_full_036_afdf2f4b",
        },
        {
            name: "Definindo prioridade de GPU da distribuição",
            script: "maxify-premium://mx_win_full_037_328e5b22",
        },
        {
            name: "Definindo prioridade da distribuição",
            script: "maxify-premium://mx_win_full_038_30b6a87d",
        },
        {
            name: "Definindo categoria de agendamento da distribuição",
            script: "maxify-premium://mx_win_full_039_39a74bbf",
        },
        {
            name: "Definindo prioridade SFIO da distribuição",
            script: "maxify-premium://mx_win_full_040_88e855cb",
        },
        {
            name: "Criando perfil de jogos",
            script: "maxify-premium://mx_win_full_041_0f04c8b6",
        },
        {
            name: "Definindo afinidade do perfil de jogos",
            script: "maxify-premium://mx_win_full_042_2e425670",
        },
        {
            name: "Definindo execução do perfil de jogos",
            script: "maxify-premium://mx_win_full_043_35fc34bb",
        },
        {
            name: "Ajustando clock rate do perfil de jogos",
            script: "maxify-premium://mx_win_full_044_1ed543a2",
        },
        {
            name: "Definindo prioridade de GPU dos jogos",
            script: "maxify-premium://mx_win_full_045_df2402f5",
        },
        {
            name: "Definindo prioridade dos jogos",
            script: "maxify-premium://mx_win_full_046_b5c56e74",
        },
        {
            name: "Definindo categoria de agendamento dos jogos",
            script: "maxify-premium://mx_win_full_047_ee163b9b",
        },
        {
            name: "Definindo prioridade SFIO dos jogos",
            script: "maxify-premium://mx_win_full_048_2ea586dc",
        },
        {
            name: "Criando perfil de baixa latência",
            script: "maxify-premium://mx_win_full_049_d3d711af",
        },
        {
            name: "Definindo afinidade de baixa latência",
            script: "maxify-premium://mx_win_full_050_3f5cc14b",
        },
        {
            name: "Definindo execução do perfil de baixa latência",
            script: "maxify-premium://mx_win_full_051_fe95235b",
        },
        {
            name: "Ajustando clock rate de baixa latência",
            script: "maxify-premium://mx_win_full_052_0b2c2192",
        },
        {
            name: "Definindo prioridade de GPU de baixa latência",
            script: "maxify-premium://mx_win_full_053_e5f7ee16",
        },
        {
            name: "Definindo prioridade de baixa latência",
            script: "maxify-premium://mx_win_full_054_ab66da5b",
        },
        {
            name: "Definindo categoria de agendamento de baixa latência",
            script: "maxify-premium://mx_win_full_055_906ef638",
        },
        {
            name: "Definindo prioridade SFIO de baixa latência",
            script: "maxify-premium://mx_win_full_056_c0b087da",
        },
        {
            name: "Ativando sensibilidade à latência",
            script: "maxify-premium://mx_win_full_057_bc708976",
        },
        {
            name: "Criando perfil de reprodução",
            script: "maxify-premium://mx_win_full_058_8a700256",
        },
        {
            name: "Definindo afinidade da reprodução",
            script: "maxify-premium://mx_win_full_059_d8bc4f79",
        },
        {
            name: "Definindo execução da reprodução",
            script: "maxify-premium://mx_win_full_060_e59f571f",
        },
        {
            name: "Definindo prioridade de fundo da reprodução",
            script: "maxify-premium://mx_win_full_061_c788ba62",
        },
        {
            name: "Ajustando clock rate da reprodução",
            script: "maxify-premium://mx_win_full_062_b4f934b6",
        },
        {
            name: "Definindo prioridade de GPU da reprodução",
            script: "maxify-premium://mx_win_full_063_55931eb4",
        },
        {
            name: "Definindo prioridade da reprodução",
            script: "maxify-premium://mx_win_full_064_0d63646a",
        },
        {
            name: "Definindo categoria de agendamento da reprodução",
            script: "maxify-premium://mx_win_full_065_f489c1ff",
        },
        {
            name: "Definindo prioridade SFIO da reprodução",
            script: "maxify-premium://mx_win_full_066_2ade7df3",
        },
        {
            name: "Criando perfil de áudio profissional",
            script: "maxify-premium://mx_win_full_067_686ff6ed",
        },
        {
            name: "Definindo afinidade do áudio profissional",
            script: "maxify-premium://mx_win_full_068_99159f2e",
        },
        {
            name: "Definindo execução do áudio profissional",
            script: "maxify-premium://mx_win_full_069_7bfcacb5",
        },
        {
            name: "Ajustando clock rate do áudio profissional",
            script: "maxify-premium://mx_win_full_070_d71567e7",
        },
        {
            name: "Definindo prioridade de GPU do áudio profissional",
            script: "maxify-premium://mx_win_full_071_775e20dd",
        },
        {
            name: "Definindo prioridade do áudio profissional",
            script: "maxify-premium://mx_win_full_072_7fea6b2b",
        },
        {
            name: "Definindo categoria de agendamento do áudio profissional",
            script: "maxify-premium://mx_win_full_073_76f9365c",
        },
        {
            name: "Definindo prioridade SFIO do áudio profissional",
            script: "maxify-premium://mx_win_full_074_bcf564d4",
        },
        {
            name: "Criando perfil do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_075_97bf00df",
        },
        {
            name: "Definindo afinidade do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_076_6cbfd99e",
        },
        {
            name: "Definindo execução em segundo plano do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_077_a916e419",
        },
        {
            name: "Ajustando clock rate do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_078_d759f36b",
        },
        {
            name: "Definindo prioridade de GPU do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_079_e90908cc",
        },
        {
            name: "Definindo prioridade do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_080_7a8e2010",
        },
        {
            name: "Definindo categoria de agendamento do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_081_ddd5e9e3",
        },
        {
            name: "Definindo prioridade SFIO do gerenciador de janelas",
            script: "maxify-premium://mx_win_full_082_872d8e7d",
        },
    ],
    extreme: [
        {
            name: "Limpeza completa (modo agressivo)",
            script: "maxify-premium://mx_win_extreme_001_4d5b7735",
        },
        {
            name: "Desativando dynamic tick",
            script: "maxify-premium://mx_win_extreme_002_134ccc15",
        },
        {
            name: "Ativando platform tick",
            script: "maxify-premium://mx_win_extreme_003_d5d77755",
        },
        {
            name: "Ajustando separação de prioridade Win32",
            script: "maxify-premium://mx_win_extreme_004_5007abc6",
        },
        {
            name: "Ativando encerramento automático de apps",
            script: "maxify-premium://mx_win_extreme_005_62bebf6f",
        },
        {
            name: "Reduzindo tempo de app travado",
            script: "maxify-premium://mx_win_extreme_006_d4a22c91",
        },
        {
            name: "Reduzindo tempo para matar aplicativos",
            script: "maxify-premium://mx_win_extreme_007_6cfd3924",
        },
        {
            name: "Reduzindo timeout de hooks",
            script: "maxify-premium://mx_win_extreme_008_b7aaddac",
        },
        {
            name: "Removendo delay do menu",
            script: "maxify-premium://mx_win_extreme_009_82d550fb",
        },
        {
            name: "Reduzindo tempo para matar serviços",
            script: "maxify-premium://mx_win_extreme_010_d50fe6bf",
        },
        {
            name: "Ajustando intervalo de timestamp da confiabilidade",
            script: "maxify-premium://mx_win_extreme_011_ff0c7493",
        },
        {
            name: "Ajustando prioridade de IO da confiabilidade",
            script: "maxify-premium://mx_win_extreme_012_5c2944e9",
        },
        {
            name: "Definindo configaccesspolicy padrão",
            script: "maxify-premium://mx_win_extreme_013_5a3ab34b",
        },
        {
            name: "Definindo MSI padrão",
            script: "maxify-premium://mx_win_extreme_014_8926800d",
        },
        {
            name: "Desativando usephysicaldestination",
            script: "maxify-premium://mx_win_extreme_015_b854dfbd",
        },
        {
            name: "Desativando usefirmwarepcisettings",
            script: "maxify-premium://mx_win_extreme_016_be16fd78",
        },
        {
            name: "Ajustando tolerância de latência do DXGKrnl",
            script: "maxify-premium://mx_win_extreme_017_b50a6c3d",
        },
        {
            name: "Ajustando tolerância de refresh do DXGKrnl",
            script: "maxify-premium://mx_win_extreme_018_197985d6",
        },
        {
            name: "Ajustando ExitLatency",
            script: "maxify-premium://mx_win_extreme_019_f4eb2060",
        },
        {
            name: "Ativando verificação de ExitLatency",
            script: "maxify-premium://mx_win_extreme_020_bece21a3",
        },
        {
            name: "Ajustando Latency global de energia",
            script: "maxify-premium://mx_win_extreme_021_38963436",
        },
        {
            name: "Ajustando tolerância de latência padrão",
            script: "maxify-premium://mx_win_extreme_022_29ecbe65",
        },
        {
            name: "Ajustando tolerância FSVP",
            script: "maxify-premium://mx_win_extreme_023_b986ba25",
        },
        {
            name: "Ajustando override de latência de desempenho",
            script: "maxify-premium://mx_win_extreme_024_abfd90f4",
        },
        {
            name: "Ajustando tolerância com tela desligada",
            script: "maxify-premium://mx_win_extreme_025_5a799358",
        },
        {
            name: "Ativando tolerância VSync",
            script: "maxify-premium://mx_win_extreme_026_2c773ace",
        },
        {
            name: "Ajustando RtlCapabilityCheckLatency",
            script: "maxify-premium://mx_win_extreme_027_0b57a56c",
        },
        {
            name: "Desativando biometria por política",
            script: "maxify-premium://mx_win_extreme_028_67b7c1a2",
        },
        {
            name: "Ajustando responsividade do sistema",
            script: "maxify-premium://mx_win_extreme_029_4407d691",
        },
        {
            name: "Ajustando auditoria de encerramento de processo",
            script: "maxify-premium://mx_win_extreme_030_bae086ed",
        },
        {
            name: "Ajustando auditoria de eventos RPC",
            script: "maxify-premium://mx_win_extreme_031_9ed60386",
        },
        {
            name: "Ajustando auditoria de conexão da plataforma de filtragem",
            script: "maxify-premium://mx_win_extreme_032_e37883a3",
        },
        {
            name: "Ajustando auditoria de atividade DPAPI",
            script: "maxify-premium://mx_win_extreme_033_dc9fd9f1",
        },
        {
            name: "Ajustando auditoria de outros eventos do sistema",
            script: "maxify-premium://mx_win_extreme_034_54fce8c3",
        },
        {
            name: "Ajustando auditoria de mudança do estado de segurança",
            script: "maxify-premium://mx_win_extreme_035_35a6e0fc",
        },
        {
            name: "Ajustando auditoria de extensão do sistema de segurança",
            script: "maxify-premium://mx_win_extreme_036_588fc301",
        },
        {
            name: "Ajustando auditoria de integridade do sistema",
            script: "maxify-premium://mx_win_extreme_037_27a120ea",
        },
        {
            name: "Desativando sessão de Wi-Fi autologger",
            script: "maxify-premium://mx_win_extreme_038_5fa20a2b",
        },
        {
            name: "Desativando experimentos do Windows",
            script: "maxify-premium://mx_win_extreme_039_9506e03e",
        },
        {
            name: "Desativando valor padrão de experimentação",
            script: "maxify-premium://mx_win_extreme_040_47416728",
        },
        {
            name: "Desativando feeds do Windows",
            script: "maxify-premium://mx_win_extreme_041_34e00be1",
        },
        {
            name: "Desativando News and Interests",
            script: "maxify-premium://mx_win_extreme_042_68560104",
        },
        {
            name: "Desativando activity feed",
            script: "maxify-premium://mx_win_extreme_043_5addac56",
        },
        {
            name: "Desativando idioma aceito por perfil",
            script: "maxify-premium://mx_win_extreme_044_ed8f494a",
        },
        {
            name: "Desativando advertising info do usuário",
            script: "maxify-premium://mx_win_extreme_045_49e44cb2",
        },
        {
            name: "Desativando activity feed por software",
            script: "maxify-premium://mx_win_extreme_046_8385766d",
        },
        {
            name: "Desativando manutenção automática",
            script: "maxify-premium://mx_win_extreme_047_02f2ffd4",
        },
        {
            name: "Desativando notificações toast",
            script: "maxify-premium://mx_win_extreme_048_c01dc66f",
        },
        {
            name: "Desativando sons de notificação",
            script: "maxify-premium://mx_win_extreme_049_49e4a662",
        },
        {
            name: "Desativando notificações críticas acima da tela de bloqueio",
            script: "maxify-premium://mx_win_extreme_050_034a90d6",
        },
        {
            name: "Desativando Quiet Hours",
            script: "maxify-premium://mx_win_extreme_051_6eb3cbf9",
        },
        {
            name: "Desativando notificação de autoplay",
            script: "maxify-premium://mx_win_extreme_052_9badf270",
        },
        {
            name: "Desativando notificação de pouco espaço em disco",
            script: "maxify-premium://mx_win_extreme_053_ada3ce92",
        },
        {
            name: "Desativando notificação de impressão",
            script: "maxify-premium://mx_win_extreme_054_4135bbde",
        },
        {
            name: "Desativando notificação de segurança e manutenção",
            script: "maxify-premium://mx_win_extreme_055_bbda1316",
        },
        {
            name: "Desativando notificação do gerenciador de Wi-Fi",
            script: "maxify-premium://mx_win_extreme_056_0c511e84",
        },
        {
            name: "Desativando central de notificações",
            script: "maxify-premium://mx_win_extreme_057_de050b3a",
        },
        {
            name: "Desativando autenticação de sessão CDP",
            script: "maxify-premium://mx_win_extreme_058_b0a8bd66",
        },
        {
            name: "Desativando Near Share",
            script: "maxify-premium://mx_win_extreme_059_fea3977b",
        },
        {
            name: "Ajustando política de sincronização",
            script: "maxify-premium://mx_win_extreme_060_c94bf698",
        },
        {
            name: "Desativando sincronização de acessibilidade",
            script: "maxify-premium://mx_win_extreme_061_86c111ab",
        },
        {
            name: "Desativando sincronização de apps",
            script: "maxify-premium://mx_win_extreme_062_8e572a75",
        },
        {
            name: "Desativando sincronização do navegador",
            script: "maxify-premium://mx_win_extreme_063_1ea5057b",
        },
        {
            name: "Desativando sincronização de credenciais",
            script: "maxify-premium://mx_win_extreme_064_9504e9e8",
        },
        {
            name: "Desativando sincronização de tema",
            script: "maxify-premium://mx_win_extreme_065_1f42b072",
        },
        {
            name: "Desativando sincronização de idioma",
            script: "maxify-premium://mx_win_extreme_066_776425a2",
        },
        {
            name: "Desativando sincronização de pacote",
            script: "maxify-premium://mx_win_extreme_067_7d33c73f",
        },
        {
            name: "Desativando sincronização de personalização",
            script: "maxify-premium://mx_win_extreme_068_7117ed5a",
        },
        {
            name: "Desativando sincronização do menu iniciar",
            script: "maxify-premium://mx_win_extreme_069_4ab07ffb",
        },
        {
            name: "Desativando sincronização do Windows",
            script: "maxify-premium://mx_win_extreme_070_22aadbb8",
        },
        {
            name: "Bloqueando sincronização pelo sistema",
            script: "maxify-premium://mx_win_extreme_071_1be58e19",
        },
        {
            name: "Bloqueando override de sincronização",
            script: "maxify-premium://mx_win_extreme_072_6986302d",
        },
        {
            name: "Desativando sync de apps por política",
            script: "maxify-premium://mx_win_extreme_073_d064a8e9",
        },
        {
            name: "Bloqueando override de sync de apps",
            script: "maxify-premium://mx_win_extreme_074_bfb1561d",
        },
        {
            name: "Desativando sync de aplicativos",
            script: "maxify-premium://mx_win_extreme_075_8a315bb1",
        },
        {
            name: "Bloqueando override de sync de aplicativos",
            script: "maxify-premium://mx_win_extreme_076_3de5a60e",
        },
        {
            name: "Desativando sync de credenciais por política",
            script: "maxify-premium://mx_win_extreme_077_ff36a81e",
        },
        {
            name: "Bloqueando override de sync de credenciais",
            script: "maxify-premium://mx_win_extreme_078_b961ca19",
        },
        {
            name: "Desativando sync de tema por política",
            script: "maxify-premium://mx_win_extreme_079_a6f2d5b2",
        },
        {
            name: "Bloqueando override de sync de tema",
            script: "maxify-premium://mx_win_extreme_080_47144dbe",
        },
        {
            name: "Desativando sync de personalização por política",
            script: "maxify-premium://mx_win_extreme_081_9f56bb92",
        },
        {
            name: "Bloqueando override de sync de personalização",
            script: "maxify-premium://mx_win_extreme_082_572c7044",
        },
        {
            name: "Desativando sync de layout inicial por política",
            script: "maxify-premium://mx_win_extreme_083_a39b3830",
        },
        {
            name: "Bloqueando override de layout inicial",
            script: "maxify-premium://mx_win_extreme_084_f3850a71",
        },
        {
            name: "Desativando sync em rede paga",
            script: "maxify-premium://mx_win_extreme_085_41886858",
        },
        {
            name: "Desativando sync do navegador por política",
            script: "maxify-premium://mx_win_extreme_086_bf67e4ea",
        },
        {
            name: "Bloqueando override do navegador",
            script: "maxify-premium://mx_win_extreme_087_8ff665a9",
        },
        {
            name: "Desativando sync do Windows por política",
            script: "maxify-premium://mx_win_extreme_088_e8a2bb39",
        },
        {
            name: "Bloqueando override do sync do Windows",
            script: "maxify-premium://mx_win_extreme_089_78ca584f",
        },
        {
            name: "Desativando apps pré-instalados",
            script: "maxify-premium://mx_win_extreme_090_8e757943",
        },
        {
            name: "Desativando apps silenciosos",
            script: "maxify-premium://mx_win_extreme_091_d8c16e63",
        },
        {
            name: "Desativando apps OEM",
            script: "maxify-premium://mx_win_extreme_092_1509004f",
        },
        {
            name: "Desativando entrega de conteúdo",
            script: "maxify-premium://mx_win_extreme_093_fe687d2d",
        },
        {
            name: "Desativando conteúdo inscrito",
            script: "maxify-premium://mx_win_extreme_094_cbc4306e",
        },
        {
            name: "Desativando histórico de apps pré-instalados",
            script: "maxify-premium://mx_win_extreme_095_ce2d107d",
        },
        {
            name: "Desativando serviço BAM",
            script: "maxify-premium://mx_win_extreme_096_1243f576",
        },
        {
            name: "Desativando serviço DAM",
            script: "maxify-premium://mx_win_extreme_097_62c7aaf9",
        },
        {
            name: "Desativando transparência",
            script: "maxify-premium://mx_win_extreme_098_92ccb79f",
        },
        {
            name: "Desativando AIT",
            script: "maxify-premium://mx_win_extreme_099_60270c00",
        },
        {
            name: "Desativando telemetria de compatibilidade",
            script: "maxify-premium://mx_win_extreme_100_69a9f34b",
        },
        {
            name: "Desativando inventário de compatibilidade",
            script: "maxify-premium://mx_win_extreme_101_f58eec7e",
        },
        {
            name: "Desativando UAR",
            script: "maxify-premium://mx_win_extreme_102_c8c3cde2",
        },
        {
            name: "Desativando engine de compatibilidade",
            script: "maxify-premium://mx_win_extreme_103_46ff7a70",
        },
        {
            name: "Desativando PCA",
            script: "maxify-premium://mx_win_extreme_104_10070f28",
        },
        {
            name: "Desativando experiências personalizadas",
            script: "maxify-premium://mx_win_extreme_105_baaf2f2f",
        },
        {
            name: "Ajustando toast do DiagTrack",
            script: "maxify-premium://mx_win_extreme_106_16628e4c",
        },
        {
            name: "Desativando TIPC",
            script: "maxify-premium://mx_win_extreme_107_1a636a11",
        },
        {
            name: "Desativando upload de atividades",
            script: "maxify-premium://mx_win_extreme_108_ca14acc8",
        },
        {
            name: "Desativando publicação de atividades",
            script: "maxify-premium://mx_win_extreme_109_4683a66b",
        },
        {
            name: "Mantendo SaveZoneInformation",
            script: "maxify-premium://mx_win_extreme_110_4c177f03",
        },
        {
            name: "Desativando cenário WDI",
            script: "maxify-premium://mx_win_extreme_111_a1d0843d",
        },
        {
            name: "Desativando tarefa StartupAppTask",
            script: "maxify-premium://mx_win_extreme_112_a3ef1ebb",
        },
        {
            name: "Encerrando coletor de diagnóstico de disco",
            script: "maxify-premium://mx_win_extreme_113_a18be33e",
        },
        {
            name: "Desativando coletor de diagnóstico de disco",
            script: "maxify-premium://mx_win_extreme_114_f5eb0d83",
        },
        {
            name: "Encerrando resolvedor de diagnóstico de disco",
            script: "maxify-premium://mx_win_extreme_115_db1f31ad",
        },
        {
            name: "Desativando resolvedor de diagnóstico de disco",
            script: "maxify-premium://mx_win_extreme_116_86d79e20",
        },
        {
            name: "Encerrando análise de eficiência de energia",
            script: "maxify-premium://mx_win_extreme_117_8b35b16b",
        },
        {
            name: "Desativando análise de eficiência de energia",
            script: "maxify-premium://mx_win_extreme_118_0fb8749b",
        },
        {
            name: "Removendo OverlayTestMode",
            script: "maxify-premium://mx_win_extreme_119_231dcbab",
        },
        {
            name: "Ajustando GameDVR_DSEBehavior",
            script: "maxify-premium://mx_win_extreme_120_bf37c4b8",
        },
        {
            name: "Ajustando GameDVR_FSEBehaviorMode",
            script: "maxify-premium://mx_win_extreme_121_0a5f30d2",
        },
        {
            name: "Ajustando GameDVR_EFSEFeatureFlags",
            script: "maxify-premium://mx_win_extreme_122_c8f24425",
        },
        {
            name: "Ajustando compatibilidade DXGI do Game DVR",
            script: "maxify-premium://mx_win_extreme_123_174fbeca",
        },
        {
            name: "Ajustando honor user FSE do Game DVR",
            script: "maxify-premium://mx_win_extreme_124_7c87142f",
        },
        {
            name: "Ajustando preferências globais da GPU",
            script: "maxify-premium://mx_win_extreme_125_ec8f1d9b",
        },
        {
            name: "Desativando busca automática de drivers",
            script: "maxify-premium://mx_win_extreme_126_de50674b",
        },
        {
            name: "Excluindo drivers do Windows Update",
            script: "maxify-premium://mx_win_extreme_127_5e2571ae",
        },
        {
            name: "Desativar aplicativos em segundo plano (economizar recursos)",
            script: "maxify-premium://mx_win_extreme_128_3a273a73",
        },
        {
            name: "Impedir aplicativos de executarem em segundo plano (Microsoft Store apps)",
            script: "maxify-premium://mx_win_extreme_129_863f7b1a",
        },
        {
            name: "Desativar execução de apps em segundo plano no Windows 11",
            script: "maxify-premium://mx_win_extreme_130_edd31704",
        },
        {
            name: "Desativar apps em segundo plano via política (Windows Pro/Enterprise)",
            script: "maxify-premium://mx_win_extreme_131_630d6e77",
        },
    ],
}
function fixTerminalEncoding(text) {
    return String(text || "")
        .replace(/opera��o/gi, "operação")
        .replace(/opera��es/gi, "operações")
        .replace(/conclu�da/gi, "concluída")
        .replace(/conclu�do/gi, "concluído")
        .replace(/�xito/gi, "êxito")
        .replace(/pr�/gi, "pré")
        .replace(/aplica��o/gi, "aplicação")
        .replace(/otimiza��o/gi, "otimização")
        .replace(/m�dulo/gi, "módulo")
        .replace(/m�dulos/gi, "módulos")
        .replace(/n�o/gi, "não")
}
function cleanTerminalLine(text) {
    let value = fixTerminalEncoding(String(text || ""))

    value = value
        .replace(/maxify-blue-/gi, "")
        .replace(/maxify-premium:\/\//gi, "")
        .replace(/mx_win_/gi, "")
        .replace(/windows-/gi, "")
        .replace(/\bfull-/gi, "")
        .replace(/\bbalanced-/gi, "")
        .replace(/\bextreme-/gi, "")
        .replace(/\bfull\b/gi, "")
        .replace(/\bbalanced\b/gi, "")
        .replace(/\bextreme\b/gi, "")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b[a-f0-9]{8}\b/gi, "")
        .replace(/\d{10,}/g, "")
        .replace(/\s+\.\.\./g, "...")
        .replace(/\s+/g, " ")
        .trim()

    value = value.replace(/(\d{3})\.\s*/g, "$1. ")

    if (!value) return "Executando otimização..."

    return value
}
function BackgroundGlow() {
    return (
        <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.15),transparent_28%),radial-gradient(circle_at_60%_95%,rgba(37,99,235,0.12),transparent_30%)]" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
        </>
    )
}

function HeaderHero({ currentMode }) {
    const Icon = currentMode.icon

    return (
        <section className="relative overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-7 shadow-xl shadow-black/5">
            <BackgroundGlow />

            <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_380px] xl:items-center">
                <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                        <Sparkles size={14} />
                        Maxify Modular Optimization
                    </div>

                    <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-maxify-text md:text-6xl">
                        Otimização modular do Windows em{" "}
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                            modo inteligente
                        </span>
                    </h1>

                    <p className="mt-5 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                        Escolha um perfil, veja o resumo do impacto e acompanhe a execução no console visual do Maxify.
                    </p>
                </div>

                <motion.div
                    key={currentMode.id}
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-6"
                >
                    <div className="mb-5 flex items-center justify-between">
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                            <Icon size={30} className="text-blue-300" />
                        </div>

                        <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                            Atual
                        </div>
                    </div>

                    <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                        Perfil selecionado
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-maxify-text">
                        {currentMode.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-maxify-text-secondary">
                        {currentMode.summary}
                    </p>

                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-maxify-text-secondary">
                            <span>Intensidade</span>
                            <span className="text-blue-300">{currentMode.intensity}%</span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-maxify-border p-[2px]">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300"
                                animate={{ width: `${currentMode.intensity}%` }}
                                transition={{ duration: 0.45 }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

function ModeSelector({ selected, setSelected, setApplied }) {
    return (
        <section className="grid gap-4 lg:grid-cols-3">
            {MODES.map((mode) => {
                const Icon = mode.icon
                const active = selected === mode.id

                return (
                    <motion.button
                        key={mode.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setSelected(mode.id)
                            setApplied(false)
                        }}
                        className={`relative overflow-hidden rounded-[28px] border p-5 text-left transition-all ${active
                            ? "border-blue-500/40 bg-blue-500/15 shadow-xl shadow-blue-500/10"
                            : "border-maxify-border bg-maxify-card hover:border-blue-500/25"
                            }`}
                    >
                        {active && (
                            <motion.div
                                layoutId="mode-active-bg"
                                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_50%)]"
                            />
                        )}

                        <div className="relative z-10">
                            <div className="mb-5 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`rounded-2xl border p-3 ${active
                                            ? "border-blue-500/25 bg-blue-500/15"
                                            : "border-maxify-border bg-maxify-card"
                                            }`}
                                    >
                                        <Icon
                                            size={24}
                                            className={active ? "text-blue-300" : "text-maxify-text-secondary"}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-300">
                                            {mode.tag}
                                        </p>

                                        <h3 className="mt-1 text-xl font-black text-maxify-text">
                                            {mode.short}
                                        </h3>
                                    </div>
                                </div>

                                {active && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                                        <Check size={16} />
                                    </div>
                                )}
                            </div>

                            <p className="text-sm leading-6 text-maxify-text-secondary">
                                {mode.summary}
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-maxify-border bg-maxify-card p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-maxify-text-secondary">
                                        Risco
                                    </p>
                                    <p className="mt-2 text-sm font-black text-maxify-text">
                                        {mode.risk}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-maxify-border bg-maxify-card p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-maxify-text-secondary">
                                        Força
                                    </p>
                                    <p className="mt-2 text-sm font-black text-blue-300">
                                        {mode.intensity}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.button>
                )
            })}
        </section>
    )
}

function ProfileDetails({ mode }) {
    const Icon = mode.icon
    const scripts = OPTIMIZATION_SCRIPTS[mode.id] || []

    return (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[30px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                        <Icon size={24} className="text-blue-300" />
                    </div>

                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-300">
                            Detalhes
                        </p>
                        <h2 className="text-2xl font-black text-maxify-text">
                            {mode.title}
                        </h2>
                    </div>
                </div>

                <p className="text-sm leading-7 text-maxify-text-secondary">
                    {mode.summary}
                </p>

                <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
                        Ideal para
                    </p>
                    <p className="mt-2 text-sm font-semibold text-maxify-text">
                        {mode.target}
                    </p>
                </div>

                <div className="mt-5 grid gap-3">
                    {mode.bullets.map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-3 rounded-2xl border border-maxify-border bg-maxify-card p-3"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                                <Check size={15} />
                            </div>

                            <p className="text-sm text-maxify-text-secondary">{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[30px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-300">
                            Resumo do pacote
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-maxify-text">
                            O que esse perfil melhora
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-black text-blue-300">
                        {scripts.length} ajustes
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                                <Gauge size={18} className="text-blue-300" />
                            </div>
                            <p className="font-black text-maxify-text">Intensidade</p>
                        </div>
                        <p className="text-sm leading-6 text-maxify-text-secondary">
                            {mode.short} aplica um conjunto de {scripts.length} ajustes com força de {mode.intensity}%, pensado para o nível de impacto desse perfil.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                                <Shield size={18} className="text-blue-300" />
                            </div>
                            <p className="font-black text-maxify-text">Risco</p>
                        </div>
                        <p className="text-sm leading-6 text-maxify-text-secondary">
                            Nível de risco: <span className="font-bold text-maxify-text">{mode.risk}</span>. Quanto mais agressivo o perfil, maior o corte de recursos secundários.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                                <Zap size={18} className="text-blue-300" />
                            </div>
                            <p className="font-black text-maxify-text">Foco principal</p>
                        </div>
                        <p className="text-sm leading-6 text-maxify-text-secondary">
                            Melhora resposta do sistema, reduz processos desnecessários e ajusta recursos ligados a jogos, energia, entrada, memória e fluidez.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-maxify-border bg-maxify-card p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                                <TerminalSquare size={18} className="text-blue-300" />
                            </div>
                            <p className="font-black text-maxify-text">Execução</p>
                        </div>
                        <p className="text-sm leading-6 text-maxify-text-secondary">
                            O console mostra o andamento da aplicação sem poluir a tela com a lista completa de comandos.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ComparisonStrip({ selected }) {
    const rows = [
        {
            icon: Cpu,
            label: "Desempenho",
            full: "Alto",
            balanced: "Muito alto",
            extreme: "Máximo",
        },
        {
            icon: Shield,
            label: "Estabilidade",
            full: "Boa",
            balanced: "Média",
            extreme: "Menor",
        },
        {
            icon: Zap,
            label: "Agressividade",
            full: "Média",
            balanced: "Alta",
            extreme: "Muito alta",
        },
        {
            icon: MonitorCog,
            label: "Uso diário",
            full: "Bom",
            balanced: "Forte",
            extreme: "Específico",
        },
    ]

    return (
        <section className="rounded-[30px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-300">
                        Comparativo
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-maxify-text">
                        Diferença entre os perfis
                    </h2>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-300">
                    Selecionado: {MODES.find((m) => m.id === selected)?.short}
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {rows.map((row) => {
                    const Icon = row.icon

                    return (
                        <div
                            key={row.label}
                            className="rounded-2xl border border-maxify-border bg-maxify-card p-4"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                                    <Icon size={17} className="text-blue-300" />
                                </div>

                                <p className="font-black text-maxify-text">{row.label}</p>
                            </div>

                            <div className="space-y-2">
                                {["full", "balanced", "extreme"].map((id) => (
                                    <div
                                        key={id}
                                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${selected === id
                                            ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                                            : "border-maxify-border bg-maxify-card text-maxify-text-secondary"
                                            }`}
                                    >
                                        <span className="font-bold">
                                            {MODES.find((m) => m.id === id)?.short}
                                        </span>
                                        <span>{row[id]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

function ActionPanel({
    mode,
    applying,
    applied,
    onApply,
    onReset,
    onOpenTerminal,
}) {
    const Icon = mode.icon

    return (
        <section className="relative overflow-hidden rounded-[30px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.20),transparent_36%)]" />

            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                    <div className="rounded-[24px] border border-blue-500/20 bg-blue-500/10 p-4">
                        <Icon className="h-7 w-7 text-blue-300" />
                    </div>

                    <div className="max-w-2xl">
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-300">
                            Aplicação modular
                        </p>

                        <h3 className="mt-2 text-2xl font-black text-maxify-text md:text-3xl">
                            {applied
                                ? `${mode.short} aplicado com sucesso`
                                : `Pronto para aplicar ${mode.short}`}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-maxify-text-secondary">
                            {applied
                                ? "Todos os módulos do perfil foram concluídos. Você pode trocar o modo e aplicar outro pacote."
                                : "Confirme para executar os módulos individuais do perfil selecionado no Windows."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={onOpenTerminal}
                        className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-maxify-text-secondary transition-all hover:border-blue-500/25 hover:text-blue-300"
                    >
                        <TerminalSquare size={15} />
                        Console
                    </button>

                    {!applied && (
                        <button
                            onClick={onApply}
                            disabled={applying}
                            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all ${applying
                                ? "cursor-not-allowed border border-maxify-border bg-maxify-card text-maxify-text-secondary"
                                : "border border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.03] hover:bg-blue-600"
                                }`}
                        >
                            {applying ? (
                                <>
                                    <LoaderCircle size={16} className="animate-spin" />
                                    Aplicando
                                </>
                            ) : (
                                <>
                                    <Zap size={16} />
                                    Aplicar agora
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={onReset}
                        disabled={applying}
                        className="inline-flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-card px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-maxify-text-secondary transition-all hover:border-blue-500/25 hover:text-blue-300"
                    >
                        <RotateCcw size={15} />
                        Resetar
                    </button>
                </div>
            </div>
        </section>
    )
}

function TerminalModal({ open, onClose, logs, applying, progress, currentMode, status }) {
    const terminalBodyRef = useRef(null)

    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
        }
    }, [logs])

    if (!open) return null

    const statusText =
        status === "success"
            ? "Concluído"
            : status === "error"
                ? "Falha"
                : applying
                    ? "Executando"
                    : "Pronto"

    const successCount = logs.filter((line) => line.type === "success").length
    const errorCount = logs.filter((line) => line.type === "error").length

    return (
        <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.22 }}
            className="relative flex h-full w-full overflow-hidden rounded-[34px] border border-blue-500/20 bg-[#061120] shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
        >
            <BackgroundGlow />

            <div className="relative z-10 grid min-h-0 w-full grid-cols-1 xl:grid-cols-[360px_1fr]">
                <aside className="flex min-h-0 flex-col border-b border-blue-500/15 bg-blue-500/[0.035] p-5 xl:border-b-0 xl:border-r">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/15 bg-blue-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-blue-300 transition-all hover:bg-blue-500/15"
                        >
                            <X size={15} />
                            Voltar
                        </button>

                        <div className="rounded-2xl border border-blue-500/15 bg-blue-500/10 px-3 py-2 text-xs font-black text-blue-300">
                            {statusText}
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300/70">
                            Execution Hub
                        </p>
                        <h2 className="mt-3 text-4xl font-black leading-none text-white">
                            {currentMode.short}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-blue-100/55">
                            {currentMode.title}
                        </p>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <div className="relative flex h-48 w-48 items-center justify-center">
                            <div className="absolute inset-0 rounded-full border border-blue-500/20" />
                            <div className="absolute inset-3 rounded-full border border-cyan-300/10" />
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `conic-gradient(from 180deg, rgba(59,130,246,0.95) ${progress}%, rgba(15,23,42,0.35) 0)`,
                                }}
                                animate={{ rotate: applying ? 360 : 0 }}
                                transition={{ duration: 18, repeat: applying ? Infinity : 0, ease: "linear" }}
                            />
                            <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full border border-blue-500/20 bg-[#08182b] shadow-inner shadow-black/50">
                                <span className="text-4xl font-black text-white">{progress}%</span>
                                <span className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
                                    progresso
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.055] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/50">Logs</p>
                            <p className="mt-2 text-lg font-black text-white">{logs.length}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.055] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/50">OK</p>
                            <p className="mt-2 text-lg font-black text-emerald-200">{successCount}</p>
                        </div>
                        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.055] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300/50">Erro</p>
                            <p className="mt-2 text-lg font-black text-red-200">{errorCount}</p>
                        </div>
                    </div>

                </aside>

                <section className="flex min-h-0 flex-col">
                    <div className="border-b border-blue-500/15 px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-blue-100/75">
                                    <TerminalSquare size={16} className="text-blue-300" />
                                    Maxify Live Output
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                                <Clock size={14} />
                                Tempo real
                            </div>
                        </div>
                    </div>

                    <div
                        ref={terminalBodyRef}
                        className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#050b14]/70 p-5 font-mono"
                    >
                        {logs.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-center">
                                <div>
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-blue-500/20 bg-blue-500/10 text-blue-300">
                                        <TerminalSquare size={28} />
                                    </div>
                                    <h3 className="mt-5 text-2xl font-black text-white">Aguardando execução</h3>
                                    <p className="mt-2 max-w-md text-sm leading-6 text-blue-100/45">
                                        Clique em aplicar para iniciar a otimização e acompanhar os eventos em tempo real.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            logs.map((line, index) => (
                                <motion.div
                                    key={line.id || index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className={`group grid grid-cols-[82px_1fr] gap-3 rounded-[22px] border p-4 ${
                                        line.type === "error"
                                            ? "border-red-400/20 bg-red-400/[0.055] text-red-200"
                                            : line.type === "success"
                                                ? "border-emerald-400/20 bg-emerald-400/[0.055] text-emerald-200"
                                                : "border-blue-500/15 bg-blue-500/[0.045] text-blue-100/78"
                                    }`}
                                >
                                    <div className="rounded-2xl border border-white/5 bg-black/15 px-3 py-3 text-center">
                                        <p className="text-[10px] text-blue-100/30">#{String(index + 1).padStart(2, "0")}</p>
                                        <p className="mt-1 text-[11px] text-blue-100/45">{line.time}</p>
                                    </div>

                                    <div className="flex min-w-0 items-center">
                                        <p className="break-words text-[13px] leading-6">
                                            {cleanTerminalLine(line.text)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </motion.div>
    )
}

function safeRunName(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
}

function getTimeNow() {
    return new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
}

export default function Otimizacao() {
    const [selected, setSelected] = useState(() => {
        try {
            return localStorage.getItem("maxify-blue-optimizer:selected") || "full"
        } catch {
            return "full"
        }
    })

    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [terminalOpen, setTerminalOpen] = useState(false)
    const [terminalLogs, setTerminalLogs] = useState([])
    const [progress, setProgress] = useState(0)
    const [runStatus, setRunStatus] = useState("idle")
    useEffect(() => {
        if (!window.powershellLogs?.onLog) return

        const cleanup = window.powershellLogs.onLog((data) => {
            addLog(data?.text || "", data?.type || "info")
        })

        return cleanup
    }, [])
    useEffect(() => {
        try {
            localStorage.setItem("maxify-blue-optimizer:selected", selected)
        } catch { }
    }, [selected])

    const currentMode = useMemo(
        () => MODES.find((mode) => mode.id === selected) || MODES[0],
        [selected]
    )

    const addLog = (text, type = "info") => {
        setTerminalLogs((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                time: getTimeNow(),
                text: cleanTerminalLine(text),
                type,
            },
        ])
    }

    const addPowerShellOutputToTerminal = (result) => {

        const output = String(
            result?.output ||
            result?.stdout ||
            result?.data ||
            result?.message ||
            ""

        )

        if (!output.trim()) return

        const lines = fixTerminalEncoding(output)
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)

        for (const line of lines) {
            const lower = line.toLowerCase()

            if (lower.includes("[erro]") || lower.includes("error") || lower.includes("falhou")) {
                addLog(line, "error")
            } else if (lower.includes("[ok]") || lower.includes("concluído") || lower.includes("sucesso")) {
                addLog(line, "success")
            } else {
                addLog(line)
            }
        }
    }

    const resetAll = () => {
        setSelected("full")
        setApplied(false)
        setApplying(false)
        setProgress(0)
        setRunStatus("idle")
        setTerminalLogs([])
    }

    const handleApply = async () => {
        if (applying) return

        setApplying(true)
        setApplied(false)
        setTerminalOpen(true)
        setTerminalLogs([])
        setProgress(0)
        setRunStatus("running")

        try {
            const scripts = OPTIMIZATION_SCRIPTS[currentMode.id] || []

            addLog(`Iniciando perfil ${currentMode.title}...`)
            setProgress(8)

            addLog("Preparando ambiente de execução...")
            setProgress(14)

            addLog(`Carregando ${scripts.length} otimizações individuais do pacote...`)
            setProgress(20)

            for (let index = 0; index < scripts.length; index++) {
                const item = scripts[index]
                const percent = Math.round(20 + ((index + 1) / scripts.length) * 70)

                addLog(`Executando: ${item.name}...`)

                const result = await invoke({
                    channel: "run-powershell",
                    payload: {
                        script: item.script,
                        name: safeRunName(`maxify-blue-${currentMode.id}-${item.name}-${Date.now()}`),
                    },
                })

                if (result?.success === false) {
                    addPowerShellOutputToTerminal(result)
                    throw new Error(result?.error || `Falha em ${item.name}`)
                }

                addPowerShellOutputToTerminal(result)
                addLog(`${item.name} concluído.`, "success")
                setProgress(percent)
            }

            addLog("Validando finalização...")
            setProgress(96)

            addLog(`${currentMode.title} aplicado com sucesso.`, "success")
            setProgress(100)
            setRunStatus("success")
            setApplied(true)
            toast.success(`${currentMode.title} aplicado com sucesso.`)
        } catch (error) {
            console.error(error)
            addLog(error?.message || "Não foi possível aplicar a otimização.", "error")
            setRunStatus("error")
            toast.error(error?.message || "Não foi possível aplicar a otimização.")
        } finally {
            setApplying(false)
        }
    }

    return (
        <RootDiv className="min-h-full w-full overflow-y-auto">
            {!terminalOpen ? (
                <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 p-4 md:p-6">
                    <HeaderHero currentMode={currentMode} />

                    <ModeSelector
                        selected={selected}
                        setSelected={setSelected}
                        setApplied={setApplied}
                    />

                    <ProfileDetails mode={currentMode} />

                    <ActionPanel
                        mode={currentMode}
                        applying={applying}
                        applied={applied}
                        onApply={handleApply}
                        onReset={resetAll}
                        onOpenTerminal={() => setTerminalOpen(true)}
                    />
                </div>
            ) : (
                <div className="mx-auto flex h-[calc(100vh-92px)] min-h-[560px] w-full max-w-[1700px] p-4 md:p-6">
                    <TerminalModal
                        open={terminalOpen}
                        onClose={() => setTerminalOpen(false)}
                        logs={terminalLogs}
                        applying={applying}
                        progress={progress}
                        currentMode={currentMode}
                        status={runStatus}
                    />
                </div>
            )}
        </RootDiv>
    )
}