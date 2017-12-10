var path = require("path")
var filesize = require("rollup-plugin-filesize")
var babel = require("rollup-plugin-babel")

var commonjs = require("rollup-plugin-commonjs")
var resolve = require("rollup-plugin-node-resolve")

var uglify = require("rollup-plugin-uglify")
var alias = require("rollup-plugin-alias")

var { rollup } = require("rollup")

var emptyModulePath = path.resolve(__dirname, "empty.js")

function getExternals(target) {
    switch (target) {
        case "browser":
            return ["mobx"]
        case "native":
            return ["mobx"]
        case "custom":
            return ["mobx"]
    }
}

function getAliases(target) {
    switch (target) {
        case "browser":
            return { "react-native": emptyModulePath }
        case "native":
            return { "react-dom": emptyModulePath }
        case "custom":
            return { "react-native": emptyModulePath, "react-dom": emptyModulePath }
    }
}

function build(target, mode, filename) {
    let externals
    let aliases

    var plugins = [
        // alias(getAliases(target)),
        babel({
            exclude: "node_modules/**",
            presets: ["es2015-rollup"],
            plugins: ["transform-decorators-legacy", "transform-class-properties"]
        }),
        resolve({
            module: true,
            main: true
        }),
        commonjs()
    ]

    if (mode.endsWith(".min")) {
        plugins.push(
            uglify({
                ie8: false,
                warnings: false
            })
        )
    }

    plugins.push(filesize())

    return rollup({
        input: "src/remobx.ts",
        external: getExternals(target),
        plugins: plugins
    })
        .then(function(bundle) {
            var options = {
                file: path.resolve(__dirname, filename),
                format: mode.endsWith(".min") ? mode.slice(0, -".min".length) : mode,
                name: "remobx",
                exports: "named",
                globals: {
                    mobx: "mobx"
                }
            }

            return bundle.write(options)
        })
        .catch(function(reason) {
            console.error(reason)
            process.exit(-1)
        })
}

Promise.all([
    build("browser", "umd", "index.js"),
    build("browser", "umd.min", "index.min.js"),
    build("browser", "es", "index.module.js"),
    build("native", "es", "native.js"),
    build("custom", "umd", "custom.js"),
    build("custom", "es", "custom.module.js")
])