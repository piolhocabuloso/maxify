const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function run(cmd) {
    console.log(`\n> ${cmd}`)
    execSync(cmd, { stdio: "inherit" })
}

function exists(file) {
    return fs.existsSync(path.join(__dirname, file))
}
try {
    run("gh auth status")

    run("git add .")
    run('git commit -m "update release" || echo Nada para commitar')

    run("npm version patch")

    const pkg = require("./package.json")
    const version = `v${pkg.version}`

    run("git push origin main")
    run(`git push origin ${version}`)

    run("npm run build")

    const distFiles = [
        `dist/latest.yml`,
        `dist/Maxify-${pkg.version}-setup.exe`,
        `dist/Maxify-${pkg.version}-setup.exe.blockmap`,
    ]

    const files = distFiles
        .filter(exists)
        .map((file) => `"${file}"`)
        .join(" ")

    if (!files) {
        throw new Error("Nenhum arquivo encontrado na pasta dist.")
    }

    const releaseNotes = `
# 🚀 Maxify ${version}

![Maxify Banner](https://cdn.discordapp.com/attachments/1331625775803273297/1496024486770774116/ChatGPT_Image_21_de_abr._de_2026_02_46_00.png?ex=69eef860&is=69eda6e0&hm=d8dbf442e848b27de44a7acb13dbeaa8186cbc1d0e7c73c7d7fb338e5dd016a7&)

## ✨ O que há de novo
- Interface mais moderna e fluida
- Melhorias no sistema de otimização
- Correções de bugs internos
- Mais estabilidade no app
- Melhor desempenho geral

## 🛠️ Melhorias
- Atualização automática aprimorada
- Build mais seguro
- Arquivos otimizados para instalação
- Melhor compatibilidade com Windows

## 💙 Obrigado por usar o Maxify
O Maxify continua evoluindo para entregar mais desempenho, praticidade e controle para o seu PC.

---

### 📥 Baixe a nova versão nos arquivos abaixo
`

    fs.writeFileSync("release-notes.md", releaseNotes)

    run(
        `gh release create ${version} ${files} --title "🚀 Maxify ${version} - Nova versão disponível" --notes-file release-notes.md --latest`
    )

    console.log("\n✅ Release publicada com sucesso!")
    console.log(`🚀 Versão: ${version}`)
} catch (err) {
    console.error("\n❌ Erro:")
    console.error(err.message)
}