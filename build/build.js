'use strict'

/**
 * inspired by vue-router build script
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const uglify = require('uglify-js')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const pkg = require('../package.json')
const resolve = _path => path.resolve(__dirname, _path)
const version = process.env.VERSION || pkg.version

const banner =
`/**
  * YIQIFEI upyun-sdk ${version}
  * (c) ${new Date().getFullYear()}
  */`

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

build([
  {
    dest: resolve('../dist/upyun.js'),
    format: 'umd',
    isBrowser: true,
    external: ['axios'],
    env: 'development'
  }
].map(genConfig))

function genConfig (opts) {
  const config = {
    entry: resolve('../index.js'),
    dest: opts.dest,
    banner,
    format: opts.format,
    moduleName: 'upyun',
    external: opts.external,
    paths: opts.paths,
    plugins: [
      node({
        browser: opts.isBrowser,
        preferBuiltins: !opts.isBrowser
      }),
      cjs(),
      babel({
        babelrc: false,
        plugins: ['external-helpers'],
        exclude: 'node_modules/**',
        presets: [['env', {modules: false}]]
      })
    ]
  }

  return config
}

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry (config) {
  const isProd = /min\.js$/.test(config.dest)
  return rollup.rollup(config).then(bundle => {
    const code = bundle.generate(config).code
    if (isProd) {
      var minified = (config.banner ? config.banner + '\n' : '') + uglify.minify(code, {
        output: {
          ascii_only: true
        }
      }).code
      return write(config.dest, minified, true)
    } else {
      return write(config.dest, code)
    }
  })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
