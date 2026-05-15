const path = require("path")
const fs = require("fs-extra")
const fg = require("fast-glob")
const esbuild = require("esbuild")
const { spawnSync } = require("child_process")
const JavaScriptObfuscator = require("javascript-obfuscator")

const rootDir = process.cwd()

const srcDir = path.join(rootDir, "src")
const backupDir = path.join(rootDir, ".maxify-src-backup")
const obfuscatedDir = path.join(rootDir, ".maxify-src-obfuscated")

const ignoreFiles = [
    "**/node_modules/**",
    "**/dist/**",
    "**/out/**",
    "**/build/**",
    "**/.vite/**",
    "**/*.map",
    "**/*.env",
]

function runCommand(command, args) {
    const result = spawnSync(command, args, {
        cwd: rootDir,
        stdio: "inherit",
        shell: true,
    })

    if (result.status !== 0) {
        throw new Error(`Comando falhou: ${command} ${args.join(" ")}`)
    }
}

async function obfuscateFile(file) {
    const ext = path.extname(file).toLowerCase()
    let code = await fs.readFile(file, "utf8")

    if ([".jsx", ".tsx", ".ts"].includes(ext)) {
        const transformed = await esbuild.transform(code, {
            loader:
                ext === ".tsx"
                    ? "tsx"
                    : ext === ".ts"
                        ? "ts"
                        : "jsx",
            jsx: "automatic",
            format: "esm",
            target: "es2020",
        })

        code = transformed.code
    }

    const result = JavaScriptObfuscator.obfuscate(code, {
        compact: true,

        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.25,

        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,

        identifierNamesGenerator: "hexadecimal",
        renameGlobals: false,

        rotateStringArray: true,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        stringArrayThreshold: 0.7,

        transformObjectKeys: true,
        unicodeEscapeSequence: false,
        selfDefending: false,
    })

    await fs.writeFile(file, result.getObfuscatedCode(), "utf8")
}

async function createObfuscatedSrc() {
    console.log("Criando código ofuscado temporário...")

    await fs.remove(obfuscatedDir)
    await fs.copy(srcDir, obfuscatedDir, {
        filter: (src) => {
            const relative = path.relative(srcDir, src).replace(/\\/g, "/")

            return !ignoreFiles.some((pattern) => {
                const clean = pattern.replace("**/", "").replace("/**", "")
                return relative.includes(clean)
            })
        },
    })

    const files = await fg(["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], {
        cwd: obfuscatedDir,
        absolute: true,
    })

    for (const file of files) {
        try {
            await obfuscateFile(file)
            console.log("Ofuscado:", path.relative(obfuscatedDir, file))
        } catch (error) {
            console.log("")
            console.log("Erro ao ofuscar:", path.relative(obfuscatedDir, file))
            console.log(error.message)
            console.log("Arquivo mantido sem ofuscar.")
            console.log("")
        }
    }
}

async function restoreOriginalSrc() {
    if (await fs.pathExists(backupDir)) {
        await fs.remove(srcDir)
        await fs.move(backupDir, srcDir)
    }

    await fs.remove(obfuscatedDir)
}

async function buildObfuscated() {
    console.log("")
    console.log("Iniciando build ofuscado...")
    console.log("Seu código original será restaurado no final.")
    console.log("")

    if (!(await fs.pathExists(srcDir))) {
        throw new Error("Pasta src não encontrada.")
    }

    if (await fs.pathExists(backupDir)) {
        console.log("Backup antigo encontrado. Restaurando antes de continuar...")
        await restoreOriginalSrc()
    }

    try {
        await fs.remove(obfuscatedDir)

        console.log("Fazendo backup do src original...")
        await fs.move(srcDir, backupDir)

        await fs.copy(backupDir, srcDir)

        await createObfuscatedSrc()

        console.log("")
        console.log("Trocando src normal por src ofuscado...")
        await fs.remove(srcDir)
        await fs.move(obfuscatedDir, srcDir)

        console.log("")
        console.log("Gerando app...")
        runCommand("npm", ["run", "build:normal"])

        console.log("")
        console.log("Build ofuscado finalizado com sucesso.")
    } catch (error) {
        console.log("")
        console.log("Erro no build ofuscado:")
        console.log(error.message)
        throw error
    } finally {
        console.log("")
        console.log("Restaurando src original...")
        await restoreOriginalSrc()
        console.log("Src original restaurado.")
    }
}

buildObfuscated().catch(() => {
    process.exit(1)
})