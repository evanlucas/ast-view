'use strict'

const http = require('http')
const https = require('https')

const proto = location.protocol
const HTTP = proto === 'http:' ? http : https

const createEditor = require('javascript-editor')

const editor = createEditor({
  container: document.querySelector('#edit')
, lineWrapping: true
, value: '// hello world\n'
, mode: 'javascript'
})

function $(str) {
  return document.getElementById(str)
}

const left = $('left')
const right = $('right')

editor.on('valid', (noErrors) => {
  if (noErrors) {
    get(editor.getValue())
  }
})

function get(data) {
  const req = HTTP.request({
    host: location.hostname
  , port: location.port
  , path: '/submit'
  , method: 'POST'
  }, (res) => {
    let out = ''
    res.on('data', (chunk) => {
      out += chunk
    })

    res.on('end', () => {
      right.innerHTML = out
    })
  })

  req.on('error', (err) => {
    console.error('http error', err)
  })

  req.write(data)
  req.end()
}
