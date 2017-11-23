const rollup = require("rollup")
const fs = require("fs-extra")
const path = require("path")
const ts = require("typescript")
const exec = require("child_process").execSync

// make sure we're in the right folder
process.chdir(path.resolve(__dirname, ".."))

const binFolder = path.resolve("node_modules/.bin/")

fs.removeSync("lib")
fs.removeSync(".build.cjs")
fs.removeSync(".build.es")

function runTypeScriptBuild(outDir, target, declarations) {
    console.log(`Running typescript build (target: ${ts.ScriptTarget[target]}) in ${outDir}/`)

    const tsConfig = path.resolve("tsconfig.json")
    const json = ts.parseConfigFileTextToJson(tsConfig, ts.sys.readFile(tsConfig), true)

    const { options } = ts.parseJsonConfigFileContent(json.config, ts.sys, path.dirname(tsConfig))

    options.target = target
    options.outDir = outDir
    options.declaration = declarations

    options.module = ts.ModuleKind.ES2015
    options.importHelpers = true
    options.noEmitHelpers = true
    if (declarations) options.declarationDir = path.resolve(".", "lib")

    const rootFile = path.resolve("src", "remobx.ts")
    const host = ts.createCompilerHost(options, true)
    const prog = ts.createProgram([rootFile], options, host)
    const result = prog.emit()
    if (result.emitSkipped) {
        const message = result.diagnostics
            .map(
                d =>
                    `${ts.DiagnosticCategory[
                        d.category
                    ]} ${d.code} (${d.file}:${d.start}): ${d.messageText}`
            )
            .join("\n")

        throw new Error(`Failed to compile typescript:\n\n${message}`)
    }
}

const rollupPlugins = [require("rollup-plugin-node-resolve")(), require("rollup-plugin-filesize")()]

function generateBundledModule(inputFile, outputFile, format) {
    console.log(`Generating ${outputFile} bundle.`)

    return rollup
        .rollup({
            input: inputFile,
            plugins: rollupPlugins
        })
        .then(bundle =>
            bundle.write({
                dest: outputFile,
                format,
                banner: "/** ReMobx - (c) Hung Tran 2017 - MIT Licensed */",
                exports: "named"
            })
        )
}

function generateUmd() {
    console.log("Generating remobx.umd.js")
    exec("browserify -s remobx -e lib/remobx.js -o lib/remobx.umd.js")
}

function generateMinified() {
    console.log("Generating remobx.min.js and remobx.umd.min.js")
    exec(
        `${binFolder}/uglifyjs -m sort,toplevel -c warnings=false --screw-ie8 --preamble "/** ReMobx - (c) Hung Tran 2017 - MIT Licensed */" --source-map lib/remobx.min.js.map -o lib/remobx.min.js lib/remobx.js`
    )
    exec(
        `${binFolder}/uglifyjs -m sort,toplevel -c warnings=false --screw-ie8 --preamble "/** ReMobx - (c) Hung Tran 2017 - MIT Licensed */" --source-map lib/remobx.umd.min.js.map -o lib/remobx.umd.min.js lib/remobx.umd.js`
    )
}

function copyFlowDefinitions() {
    console.log("Copying flowtype definitions")
    exec(`${binFolder}/ncp flow-typed/remobx.js lib/remobx.js.flow`)
}

function build() {
    runTypeScriptBuild(".build.cjs", ts.ScriptTarget.ES5, true)
    runTypeScriptBuild(".build.es", ts.ScriptTarget.ES5, false)
    return Promise.all([
        generateBundledModule(
            path.resolve(".build.cjs", "remobx.js"),
            path.resolve("lib", "remobx.js"),
            "cjs"
        ),

        generateBundledModule(
            path.resolve(".build.es", "remobx.js"),
            path.resolve("lib", "remobx.module.js"),
            "es"
        )
    ]).then(() => {
        generateUmd()
        // generateMinified()
        // copyFlowDefinitions()
        fs.removeSync(".build.cjs")
        fs.removeSync(".build.es")                
    })
}

build().catch(e => {
    console.error(e)
    if (e.frame) {
        console.error(e.frame)
    }
    process.exit(1)
})
