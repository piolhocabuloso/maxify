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

    run(
        `gh release create ${version} ${files} --title "${version}" --notes "Nova atualização do Maxify" --latest`
    )

    console.log("\n✅ Release publicada com sucesso!")
    console.log(`🚀 Versão: ${version}`)
} catch (err) {
    console.error("\n❌ Erro:")
    console.error(err.message)
}