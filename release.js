const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const https = require("https")

try {
    require("dotenv").config()
} catch { }

const APP_NAME = "Maxify"
const BRANCH_PRINCIPAL = "main"
const MANTER_RELEASES_ANTIGAS = 0
const ABRIR_RELEASE_NO_NAVEGADOR = true

const DISCORD_WEBHOOK_URL = process.env.DISCORD_RELEASE_WEBHOOK_URL || "https://discord.com/api/webhooks/1503583132991881311/tsHPVHZnjaf8V_Al2Q6z0w7RSHkAhuEVSH-tkbbYVuRPUOy9DkXzWn86oMahwG6ChJK1"

const WEBHOOK_AVATAR_URL =
    process.env.WEBHOOK_AVATAR_URL ||
    "https://cdn.discordapp.com/attachments/1331617013075939345/1331627072874872882/Piolho_5.png?ex=6a0334da&is=6a01e35a&hm=e1ba88a073014d1f49ab403983e8ce22e9ea13e28b73dd42bb734f770ceb96ae&"

const EMBED_LOGO_URL =
    process.env.EMBED_LOGO_URL ||
    "https://cdn.discordapp.com/attachments/1331617013075939345/1331627072874872882/Piolho_5.png?ex=6a0334da&is=6a01e35a&hm=e1ba88a073014d1f49ab403983e8ce22e9ea13e28b73dd42bb734f770ceb96ae&"

const EMBED_BANNER_URL =
    process.env.EMBED_BANNER_URL ||
    "https://cdn.discordapp.com/attachments/1331625775803273297/1336319929942540419/Piolho_2.png?ex=6a03ccaa&is=6a027b2a&hm=bc1d47a939d5f3cadb88883cce27ef095e8abe56cedb7dbc5bed6d45aa721ff8&"

const state = {
    version: "Desconhecida",
    pkg: null,
    startTime: Date.now(),
    releaseUrl: "",
    changelog: "",
    arquivos: [],
}

function run(cmd) {
    console.log(`\n> ${cmd}`)
    execSync(cmd, { stdio: "inherit" })
}

function runOutput(cmd) {
    return execSync(cmd, { encoding: "utf8" }).trim()
}

function exists(file) {
    return fs.existsSync(path.join(__dirname, file))
}

function getPackageJson() {
    delete require.cache[require.resolve("./package.json")]
    return require("./package.json")
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const restSeconds = seconds % 60

    if (minutes <= 0) return `${restSeconds}s`

    return `${minutes}m ${restSeconds}s`
}

function cortarTexto(texto, limite = 1000) {
    if (!texto) return "Sem informações."
    if (texto.length <= limite) return texto
    return texto.slice(0, limite - 20) + "\n..."
}

function escapeDiscord(text) {
    return String(text || "")
        .replace(/`/g, "'")
        .replace(/\*/g, "")
        .replace(/_/g, "-")
}

function getRepoName() {
    try {
        const remote = runOutput("git remote get-url origin")

        return remote
            .replace("https://github.com/", "")
            .replace("git@github.com:", "")
            .replace(".git", "")
            .trim()
    } catch {
        return "Desconhecido"
    }
}

function getCurrentBranch() {
    try {
        return runOutput("git branch --show-current")
    } catch {
        return "Desconhecida"
    }
}

function getLastCommit() {
    try {
        return runOutput('git log -1 --pretty=format:"%h - %s"')
    } catch {
        return "Desconhecido"
    }
}

function getGitUser() {
    try {
        return runOutput("git config user.name")
    } catch {
        return "Desconhecido"
    }
}

function getDistFilesInfo() {
    const distPath = path.join(__dirname, "dist")

    if (!fs.existsSync(distPath)) return []

    return fs
        .readdirSync(distPath)
        .map((arquivo) => {
            const filePath = path.join(distPath, arquivo)
            const stat = fs.statSync(filePath)

            if (!stat.isFile()) return null

            return {
                name: arquivo,
                size: `${(stat.size / 1024 / 1024).toFixed(2)} MB`,
            }
        })
        .filter(Boolean)
}

function discordRequest(payload) {
    return new Promise((resolve, reject) => {
        if (!DISCORD_WEBHOOK_URL) {
            console.log("⚠️ DISCORD_RELEASE_WEBHOOK_URL não configurado. Webhook ignorado.")
            resolve(false)
            return
        }

        const url = new URL(DISCORD_WEBHOOK_URL)
        const data = JSON.stringify(payload)

        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
            },
        }

        const req = https.request(options, (res) => {
            let body = ""

            res.on("data", (chunk) => {
                body += chunk
            })

            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(true)
                } else {
                    reject(new Error(`Discord webhook erro ${res.statusCode}: ${body}`))
                }
            })
        })

        req.on("error", reject)
        req.write(data)
        req.end()
    })
}

async function enviarWebhookRelease(status, extra = {}) {
    const isSuccess = status === "success"
    const isError = status === "error"

    const color = isSuccess ? 0x05f804 : 0xff2f2f

    const title = isSuccess
        ? "<:icons8selecionado100:1333007552346194032> Release publicada com sucesso!"
        : "<:icons8unavailable:1332973118192619570> Erro ao publicar release!"

    const description = isSuccess
        ? `A nova versão do **${APP_NAME}** foi publicada no GitHub com sucesso.`
        : `A publicação da release do **${APP_NAME}** falhou.`

    const fields = [
        {
            name: "<:icons8touchpad100:1337855935120539791> Aplicativo",
            value: `\`${APP_NAME}\``,
            inline: true,
        },
        {
            name: "<:icons8star100:1337861569819705465> Versão",
            value: `\`${state.version || "Desconhecida"}\``,
            inline: true,
        },
        {
            name: "<:icons8termsandconditions100:1335352538719060059> Branch",
            value: `\`${getCurrentBranch()}\``,
            inline: true,
        },
        {
            name: "<:icons8roubodeidentidade100:1343346399554568192> Repositório",
            value: `\`${getRepoName()}\``,
            inline: false,
        },
        {
            name: "<:icons8megaphone100:1337851173176086570> Último commit",
            value: `\`${escapeDiscord(getLastCommit())}\``,
            inline: false,
        },
        {
            name: "<:icons8user1001:1332620007565299753> Publicado por",
            value: `\`${escapeDiscord(getGitUser())}\``,
            inline: true,
        },
        {
            name: "<:icons8alarmclock100:1332618962667573308> Tempo",
            value: `\`${formatDuration(Date.now() - state.startTime)}\``,
            inline: true,
        },
        {
            name: "<:icons8status100:1356027073885376632> Data",
            value: `\`${new Date().toLocaleString("pt-BR")}\``,
            inline: true,
        },
    ]

    if (isSuccess && state.releaseUrl) {
        fields.push({
            name: "<:icons8link100:1335335327124164738> Link da release",
            value: state.releaseUrl,
            inline: false,
        })
    }

    if (isError) {
        fields.push({
            name: "⚠️ Erro",
            value: `\`\`\`${cortarTexto(extra.error || "Erro desconhecido.", 900)}\`\`\``,
            inline: false,
        })
    }

    const payload = {
        username: "Maxify Releases",
        avatar_url: WEBHOOK_AVATAR_URL,
        embeds: [
            {
                title,
                description,
                color,
                fields,
                thumbnail: {
                    url: EMBED_LOGO_URL,
                },
                image: {
                    url: EMBED_BANNER_URL,
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: `${APP_NAME} Release System`,
                    icon_url: EMBED_LOGO_URL,
                },
            },
        ],
    }

    try {
        await discordRequest(payload)
        console.log("📨 Log enviado no webhook do Discord.")
    } catch (err) {
        console.log(`⚠️ Não consegui enviar webhook: ${err.message}`)
    }
}

function verificarGitRepo() {
    console.log("\n📁 Verificando repositório Git...")

    try {
        runOutput("git rev-parse --is-inside-work-tree")
        console.log("✅ Repositório Git encontrado.")
    } catch {
        throw new Error("Essa pasta não parece ser um repositório Git.")
    }
}

function verificarGitHubAuth() {
    console.log("\n🔐 Verificando login no GitHub...")
    run("gh auth status")
}

function verificarBranch() {
    console.log("\n🌿 Verificando branch atual...")

    const branch = runOutput("git branch --show-current")

    if (branch !== BRANCH_PRINCIPAL) {
        throw new Error(`Você está na branch "${branch}". Mude para "${BRANCH_PRINCIPAL}" antes de publicar.`)
    }

    console.log(`✅ Branch correta: ${branch}`)
}

function verificarPackageJson() {
    console.log("\n📦 Verificando package.json...")

    if (!exists("package.json")) {
        throw new Error("package.json não encontrado.")
    }

    const pkg = getPackageJson()

    if (!pkg.name) {
        throw new Error("O package.json não tem o campo name.")
    }

    if (!pkg.version) {
        throw new Error("O package.json não tem o campo version.")
    }

    console.log(`✅ App: ${pkg.name}`)
    console.log(`✅ Versão atual: ${pkg.version}`)
}

function verificarNodeModules() {
    console.log("\n📚 Verificando node_modules...")

    if (!exists("node_modules")) {
        throw new Error("A pasta node_modules não existe. Rode npm install antes.")
    }

    console.log("✅ node_modules encontrado.")
}

function limparDist() {
    const distPath = path.join(__dirname, "dist")

    console.log("\n🧹 Limpando pasta dist...")

    if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true })
        console.log("✅ Pasta dist apagada.")
    } else {
        console.log("ℹ️ Pasta dist ainda não existe.")
    }
}

function limparBuildsAntigosLocais() {
    const releasesPath = path.join(__dirname, "releases")

    console.log("\n🧹 Limpando backups locais antigos...")

    if (!fs.existsSync(releasesPath)) {
        console.log("ℹ️ Pasta releases ainda não existe.")
        return
    }

    const arquivos = fs.readdirSync(releasesPath)

    if (arquivos.length === 0) {
        console.log("ℹ️ Nenhum backup local antigo encontrado.")
        return
    }

    for (const arquivo of arquivos) {
        const filePath = path.join(releasesPath, arquivo)

        try {
            fs.rmSync(filePath, { recursive: true, force: true })
            console.log(`🗑️ Removido: ${arquivo}`)
        } catch {
            console.log(`⚠️ Não consegui remover: ${arquivo}`)
        }
    }

    console.log("✅ Backups locais antigos limpos.")
}

function criarCommit() {
    console.log("\n📝 Criando commit...")

    run("git add .")
    run('git commit -m "update release" || echo Nada para commitar')
}

function atualizarVersao() {
    console.log("\n🚀 Atualizando versão patch...")

    run("npm version patch")

    const pkg = getPackageJson()
    const version = `v${pkg.version}`

    state.pkg = pkg
    state.version = version

    console.log(`✅ Nova versão criada: ${version}`)

    return { pkg, version }
}

function getUltimaTagAntesDaAtual(versionAtual) {
    try {
        const tags = runOutput("git tag --sort=-creatordate")
            .split("\n")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .filter((tag) => tag !== versionAtual)

        return tags[0] || ""
    } catch {
        return ""
    }
}

function gerarChangelog(versionAtual) {
    console.log("\n📄 Gerando changelog automático...")

    const ultimaTag = getUltimaTagAntesDaAtual(versionAtual)

    try {
        let commits = ""

        if (ultimaTag) {
            commits = runOutput(`git log ${ultimaTag}..HEAD --pretty=format:"- %s"`)
        } else {
            commits = runOutput(`git log --pretty=format:"- %s" -10`)
        }

        if (!commits) {
            commits = "- Correções e melhorias gerais."
        }

        const changelog = [
            `# Nova atualização do ${APP_NAME}`,
            "",
            `## Versão ${versionAtual}`,
            "",
            "### Alterações:",
            commits,
            "",
            "### Informações:",
            `- App: ${APP_NAME}`,
            `- Versão: ${versionAtual}`,
            `- Branch: ${getCurrentBranch()}`,
            `- Data: ${new Date().toLocaleString("pt-BR")}`,
        ].join("\n")

        state.changelog = changelog

        console.log("✅ Changelog gerado.")

        return changelog
    } catch {
        console.log("⚠️ Não foi possível gerar changelog completo.")

        const fallback = "Nova atualização do Maxify com correções e melhorias gerais."
        state.changelog = fallback

        return fallback
    }
}

function salvarChangelogNaDist(changelog) {
    const distPath = path.join(__dirname, "dist")

    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true })
    }

    fs.writeFileSync(
        path.join(distPath, "CHANGELOG.md"),
        changelog,
        "utf8"
    )

    console.log("📄 CHANGELOG.md salvo na dist.")
}

function gerarReleaseInfo(pkg, version) {
    console.log("\n📄 Gerando release-info.json...")

    const info = {
        app: APP_NAME,
        packageName: pkg.name,
        version: pkg.version,
        tag: version,
        releaseUrl: state.releaseUrl || "",
        date: new Date().toISOString(),
        installer: `${APP_NAME}-${pkg.version}-setup.exe`,
        latestYml: "latest.yml",
        branch: getCurrentBranch(),
        repository: getRepoName(),
        lastCommit: getLastCommit(),
    }

    fs.writeFileSync(
        path.join(__dirname, "dist", "release-info.json"),
        JSON.stringify(info, null, 2),
        "utf8"
    )

    console.log("✅ release-info.json criado.")
}

function rodarBuild() {
    console.log("\n🏗️ Gerando build do app...")
    run("npm run build")
    console.log("✅ Build finalizado.")
}

function validarArquivosDaDist(pkg) {
    console.log("\n🔍 Validando arquivos da dist...")

    const arquivosObrigatorios = [
        `dist/${APP_NAME}-${pkg.version}-setup.exe`,
        "dist/latest.yml",
    ]

    const faltando = arquivosObrigatorios.filter((file) => !exists(file))

    if (faltando.length > 0) {
        console.log("\n❌ Arquivos faltando:")

        for (const file of faltando) {
            console.log(`- ${file}`)
        }

        throw new Error(
            "Arquivos obrigatórios da release não foram gerados. Precisa ter .exe, .blockmap e latest.yml."
        )
    }

    console.log("✅ Arquivos obrigatórios encontrados:")
    for (const file of arquivosObrigatorios) {
        console.log(`- ${file}`)
    }

    return arquivosObrigatorios
}

function listarArquivosDist() {
    console.log("\n📦 Arquivos encontrados na dist:")

    const distPath = path.join(__dirname, "dist")

    if (!fs.existsSync(distPath)) {
        console.log("Nenhum arquivo encontrado.")
        return []
    }

    const arquivos = getDistFilesInfo()

    for (const arquivo of arquivos) {
        console.log(`- ${arquivo.name} | ${arquivo.size}`)
    }

    state.arquivos = arquivos

    return arquivos
}

function pushGit(version) {
    console.log("\n⬆️ Enviando alterações para o GitHub...")

    run(`git push origin ${BRANCH_PRINCIPAL}`)
    run(`git push origin ${version}`)

    console.log("✅ Código e tag enviados.")
}

function criarReleaseGitHub(version, arquivos, changelog) {
    console.log("\n🚀 Criando release no GitHub...")

    const changelogFile = path.join(__dirname, "dist", "CHANGELOG.md")
    fs.writeFileSync(changelogFile, changelog, "utf8")

    const arquivosExtras = [
        "dist/CHANGELOG.md",
        "dist/release-info.json",
    ]

    const todosArquivos = [
        ...arquivos,
        ...arquivosExtras,
    ]
        .filter(exists)
        .map((file) => `"${file}"`)
        .join(" ")

    if (!todosArquivos) {
        throw new Error("Nenhum arquivo encontrado para enviar na release.")
    }

    run(
        `gh release create ${version} ${todosArquivos} --title "${version}" --notes-file "dist/CHANGELOG.md" --latest`
    )

    try {
        state.releaseUrl = runOutput(`gh release view ${version} --json url --jq ".url"`)
    } catch {
        state.releaseUrl = ""
    }

    console.log("✅ Release criada no GitHub.")
}

function limparReleasesAntigas(versaoAtual) {
    console.log("\n🧹 Limpando releases antigas do GitHub...")

    let output = ""

    try {
        output = runOutput(`gh release list --limit 100 --json tagName --jq ".[].tagName"`)
    } catch {
        console.log("⚠️ Não foi possível listar releases antigas.")
        return
    }

    if (!output) {
        console.log("ℹ️ Nenhuma release antiga encontrada.")
        return
    }

    const releases = output
        .split("\n")
        .map((tag) => tag.trim())
        .filter(Boolean)

    const releasesAntigas = releases.filter((tag) => tag !== versaoAtual)

    if (releasesAntigas.length === 0) {
        console.log("✅ Nenhuma release antiga para apagar.")
        return
    }

    const releasesParaApagar = MANTER_RELEASES_ANTIGAS > 0
        ? releasesAntigas.slice(MANTER_RELEASES_ANTIGAS)
        : releasesAntigas

    for (const tag of releasesParaApagar) {
        try {
            console.log(`\n🗑️ Apagando release antiga: ${tag}`)
            run(`gh release delete ${tag} --yes --cleanup-tag`)
        } catch (err) {
            console.log(`⚠️ Não consegui apagar ${tag}: ${err.message}`)
        }
    }

    console.log("\n✅ Limpeza de releases antigas finalizada.")
}

function verificarReleasePublicada(version) {
    console.log("\n🔎 Verificando se a release foi publicada...")

    try {
        run(`gh release view ${version}`)
        console.log("✅ Release publicada e encontrada.")
    } catch {
        throw new Error("A release foi criada, mas não consegui confirmar ela no GitHub.")
    }
}

function abrirReleaseNoNavegador(version) {
    if (!ABRIR_RELEASE_NO_NAVEGADOR) return

    console.log("\n🌐 Abrindo release no navegador...")

    try {
        run(`gh release view ${version} --web`)
    } catch {
        console.log("⚠️ Não consegui abrir a release no navegador.")
    }
}

function mostrarResumoFinal(pkg, version) {
    console.log("\n====================================")
    console.log("✅ RELEASE PUBLICADA COM SUCESSO!")
    console.log("====================================")
    console.log(`🚀 App: ${APP_NAME}`)
    console.log(`📦 Versão: ${version}`)
    console.log(`🧩 Package: ${pkg.name}`)
    console.log(`📁 Instalador: ${APP_NAME}-${pkg.version}-setup.exe`)
    console.log(`📄 Arquivo update: latest.yml`)
    console.log(`🔗 Release: ${state.releaseUrl || "Não encontrada"}`)
    console.log("🧹 Releases antigas: limpas")
    console.log("💾 Backup local: desativado")
    console.log("📨 Webhook: enviado")
    console.log("====================================\n")
}

async function main() {
    try {
        console.log("\n====================================")
        console.log(`🚀 INICIANDO RELEASE DO ${APP_NAME}`)
        console.log("====================================")

        state.startTime = Date.now()

        verificarGitRepo()
        verificarGitHubAuth()
        verificarBranch()
        verificarPackageJson()
        verificarNodeModules()

        limparDist()
        limparBuildsAntigosLocais()

        criarCommit()

        const { pkg, version } = atualizarVersao()

        rodarBuild()

        const changelog = gerarChangelog(version)

        salvarChangelogNaDist(changelog)
        gerarReleaseInfo(pkg, version)

        const arquivosObrigatorios = validarArquivosDaDist(pkg)

        listarArquivosDist()

        pushGit(version)

        criarReleaseGitHub(version, arquivosObrigatorios, changelog)

        gerarReleaseInfo(pkg, version)

        verificarReleasePublicada(version)

        limparReleasesAntigas(version)

        await enviarWebhookRelease("success")

        abrirReleaseNoNavegador(version)

        mostrarResumoFinal(pkg, version)
    } catch (err) {
        console.error("\n====================================")
        console.error("❌ ERRO AO PUBLICAR RELEASE")
        console.error("====================================")
        console.error(err.message)
        console.error("====================================\n")

        await enviarWebhookRelease("error", {
            error: err.message,
        })

        process.exit(1)
    }
}

main()