const path = require("path")
const fs = require("fs-extra")
const fg = require("fast-glob")
const esbuild = require("esbuild")
const JavaScriptObfuscator = require("javascript-obfuscator")

const rootDir = process.cwd()

const inputDir = path.join(rootDir, "src")
const outputDir = path.join(rootDir, "obfuscated")

const ignoreFiles = [
    "**/node_modules/**",
    "**/dist/**",
    "**/out/**",
    "**/build/**",
    "**/.vite/**",
    "**/*.map",
    "**/*.env",
]

async function obfuscateCode() {
    console.log("Limpando pasta ofuscada...")
    await fs.remove(outputDir)
    await fs.ensureDir(outputDir)

    console.log("Copiando arquivos...")
    await fs.copy(inputDir, outputDir, {
        filter: (src) => {
            const relative = path.relative(inputDir, src).replace(/\\/g, "/")
            return !ignoreFiles.some((pattern) => {
                const clean = pattern.replace("**/", "").replace("/**", "")
                return relative.includes(clean)
            })
        },
    })

    console.log("Ofuscando arquivos JS/JSX/TS/TSX...")

    const files = await fg(["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], {
        cwd: outputDir,
        absolute: true,
    })

    for (const file of files) {
        const ext = path.extname(file).toLowerCase()
        let code = await fs.readFile(file, "utf8")

        try {
            if (ext === ".jsx" || ext === ".tsx" || ext === ".ts") {
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

            console.log("Ofuscado:", path.relative(outputDir, file))
        } catch (error) {
            console.log("")
            console.log("Erro no arquivo:", path.relative(outputDir, file))
            console.log(error.message)
            console.log("Pulando esse arquivo...")
            console.log("")
        }
    }

    console.log("")
    console.log("Finalizado.")
    console.log("Código ofuscado criado em:")
    console.log(outputDir)
}

obfuscateCode().catch((error) => {
    console.error("Erro ao ofuscar:", error)
    process.exit(1)
})