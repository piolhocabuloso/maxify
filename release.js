require("dotenv").config()

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const FormData = require("form-data")
const fetch = require("node-fetch")

function run(cmd) {
    console.log(`\n> ${cmd}`)
    execSync(cmd, { stdio: "inherit" })
}

function exists(file) {
    return fs.existsSync(path.join(__dirname, file))
}

async function sendDiscordFile(webhookUrl, filePath, version) {
    const fullPath = path.join(__dirname, filePath)

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Instalador não encontrado: ${filePath}`)
    }

    const form = new FormData()

    form.append("payload_json", JSON.stringify({
        content: `🚀 **Nova atualização do Maxify publicada!**\n📦 Versão: **${version}**\n\n⬇️ Instalador abaixo:`
    }))

    form.append("file", fs.createReadStream(fullPath), path.basename(fullPath))

    const res = await fetch(webhookUrl, {
        method: "POST",
        body: form,
        headers: form.getHeaders()
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Erro ao enviar para Discord: ${res.status} - ${text}`)
    }
}

async function main() {
    try {
        const webhook = process.env.DISCORD_WEBHOOK

        if (!webhook) {
            throw new Error("DISCORD_WEBHOOK não configurado no .env")
        }

        run("gh auth status")

        run("git add .")
        run('git commit -m "update release" || echo Nada para commitar')

        run("npm version patch")

        const pkg = require("./package.json")
        const version = `v${pkg.version}`

        run("git push origin main")
        run(`git push origin ${version}`)

        run("npm run build")

        const installer = `dist/Maxify-${pkg.version}-setup.exe`

        const distFiles = [
            `dist/latest.yml`,
            installer,
            `dist/Maxify-${pkg.version}-setup.exe.blockmap`,
        ]

        const files = distFiles
            .filter(exists)
            .map((file) => `"${file}"`)
            .join(" ")

        if (!files) {
            throw new Error("Nenhum arquivo encontrado na pasta dist.")
        }

        run(
            `gh release create ${version} ${files} --title "${version}" --notes "Nova atualização do Maxify" --latest`
        )

        await sendDiscordFile(webhook, installer, version)

        console.log("\n✅ Release publicada com sucesso!")
        console.log("✅ Instalador enviado para o Discord!")
        console.log(`🚀 Versão: ${version}`)

    } catch (err) {
        console.error("\n❌ Erro:")
        console.error(err.message)
    }
}

main()