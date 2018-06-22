const http = require('http')
const upyun = require('../')
const fs = require('fs')
const path = require('path')

http.createServer(function(req, res) {
  if (req.url.indexOf('index.html') !== -1 || req.url === '/') {
    res.end(fs.readFileSync(path.join(__dirname, './index.html'), 'utf-8'))
  } else if (req.url.indexOf('upyun.js') !== -1) {
    res.end(fs.readFileSync(path.join(__dirname, '../dist/upyun.js'), 'utf-8'))
  } else {
    res.writeHead(404)
    res.end()
  }
}).listen(3001)