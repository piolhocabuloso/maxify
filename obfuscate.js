const fs = require("fs")
const path = require("path")
const JavaScriptObfuscator = require("javascript-obfuscator")

const input = process.argv[2]

if (!input) {
  console.log("Use assim:")
  console.log("node obfuscate.js caminho/do/arquivo.js")
  console.log("ou")
  console.log("node obfuscate.js caminho/da/pasta")
  process.exit(1)
}

const projectRoot = process.cwd()
const inputPath = path.resolve(projectRoot, input)
const outputRoot = path.resolve(projectRoot, "obfuscated-copy")

const allowedExtensions = [".js", ".jsx"]

const options = {
  compact: true,

  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.45,

  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,

  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 8,

  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,

  transformObjectKeys: true,

  selfDefending: true,
  debugProtection: false,
  disableConsoleOutput: false,

  unicodeEscapeSequence: false,
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyFileNormal(filePath, outputPath) {
  ensureDir(path.dirname(outputPath))
  fs.copyFileSync(filePath, outputPath)
}

function obfuscateFile(filePath, outputPath) {
  const ext = path.extname(filePath).toLowerCase()

  ensureDir(path.dirname(outputPath))

  if (!allowedExtensions.includes(ext)) {
    copyFileNormal(filePath, outputPath)
    return
  }

  const code = fs.readFileSync(filePath, "utf8")

  const result = JavaScriptObfuscator.obfuscate(code, {
    ...options,
    inputFileName: path.basename(filePath),
  })

  fs.writeFileSync(outputPath, result.getObfuscatedCode(), "utf8")

  console.log(`Ofuscado: ${filePath}`)
}

function walkFolder(folderPath) {
  const items = fs.readdirSync(folderPath, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(folderPath, item.name)

    if (
      item.name === "node_modules" ||
      item.name === "dist" ||
      item.name === "out" ||
      item.name === ".git" ||
      item.name === "obfuscated-copy"
    ) {
      continue
    }

    const relativePath = path.relative(projectRoot, fullPath)
    const outputPath = path.join(outputRoot, relativePath)

    if (item.isDirectory()) {
      walkFolder(fullPath)
    } else {
      obfuscateFile(fullPath, outputPath)
    }
  }
}

if (!fs.existsSync(inputPath)) {
  console.log("Arquivo ou pasta não encontrado:", inputPath)
  process.exit(1)
}

ensureDir(outputRoot)

const stats = fs.statSync(inputPath)

if (stats.isDirectory()) {
  walkFolder(inputPath)
} else {
  const relativePath = path.relative(projectRoot, inputPath)
  const outputPath = path.join(outputRoot, relativePath)
  obfuscateFile(inputPath, outputPath)
}

console.log("")
console.log("Finalizado.")
console.log("Cópia criada em:")
console.log(outputRoot)