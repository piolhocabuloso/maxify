const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function run(cmd) {
    console.log(`\n> ${cmd}`)
    execSync(cmd, { stdio: "inherit" })
}

try {
    run("git add .")
    run('git commit -m "update release" || echo Nada para commitar')
    run("npm version patch")
    run("git push --follow-tags")
    run("npm run build")

    const pkg = require("./package.json")
    const version = `v${pkg.version}`

    const dist = path.join(__dirname, "dist")
    const files = fs
        .readdirSync(dist)
        .filter(file =>
            file.endsWith(".exe") ||
            file.endsWith(".yml") ||
            file.endsWith(".blockmap")
        )
        .map(file => `"dist/${file}"`)
        .join(" ")

    run(`gh release create ${version} ${files} --title "${version}" --notes "Nova atualização do Maxify"`)

    console.log("\n✅ Atualização publicada com sucesso!")
} catch (err) {
    console.error("\n❌ Erro ao publicar atualização:")
    console.error(err.message)
}