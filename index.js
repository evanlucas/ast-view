'use strict'

const acorn = require('acorn')
const Highlights = require('highlights')
const highlighter = new Highlights()
const util = require('util')
const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const files = new Map()
const htmlfp = path.join(__dirname, 'index.html')
const html = fs.readFileSync(htmlfp)
files.set('/', html)

const validFiles = {
  '/': 'text/html'
, '/css/codemirror.css': 'text/css'
, '/node_modules/javascript-editor/css/theme.css': 'text/css'
, '/css/dusk.css': 'text/css'
, '/bundle.js': 'application/javascript'
}

const keys = Object.keys(validFiles)
for (let i = 1; i < keys.length; i++) {
  const fn = keys[i]
  const fp = path.join(__dirname, fn)
  const contents = fs.readFileSync(fp)
  files.set(fn, contents)
}

const server = http.createServer()

server.on('request', (req, res) => {
  console.log(req.method, req.url)

  const u = req.url
  if (u !== '/submit') {

    const type = validFiles[u]
    if (!type) {
      res.writeHead(404)
      return res.end('Not found')
    }

    res.writeHead(200, {
      'Content-Type': type
    })

    const data = files.get(u)

    return res.end(data)
  }

  let out = ''
  req.on('data', (chunk) => {
    out += chunk.toString()
  })

  req.on('end', () => {
    generateHTML(out, (err, html) => {
      if (err) {
        console.error('generateHTML', err)
        return res.end('')
      }

      res.end(html)
    })
  })
})

server.listen(process.env.PORT || 10013, () => {
  console.log('http listen', server.address().port)
})

function parse(str) {
  return acorn.parse(str, {
    ecmaVersion: 6
  })
}

function generateHTML(str, cb) {
  try {
    const out = util.inspect(parse(str), {
      depth: null
    })
    highlighter.highlight({
      fileContents: out
    , scopeName: 'source.js'
    }, cb)
  } catch (err) {
    console.error('cannot parse', err)
    cb(err)
  }
}
