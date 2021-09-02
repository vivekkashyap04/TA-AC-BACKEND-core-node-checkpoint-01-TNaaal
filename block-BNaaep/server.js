const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const path = require('path');
const { error } = require('console');

const server = http.createServer(handleRequest);
const dir = path.join(__dirname, '..', 'contacts');
console.log(dir);

function handleRequest(req, res) {
  console.log(req.url);
  const parserUrl = url.parse(req.url, true);
  var store = '';
  req.on('data', (chunk) => {
    store += chunk;
  });
  req.on('end', () => {
    if ((req.method === 'GET') & (req.url === '/')) {
      fs.createReadStream('./assets/index.png').pipe(res);
    }
    if ((req.method === 'GET') & (req.url === '/about')) {
      fs.createReadStream('./assets/about.png').pipe(res);
    }
    if ((req.method === 'GET') & (req.url === '/contact')) {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./contact.html').pipe(res);
    }
    if ((req.method === 'POST') & (req.url === '/contact')) {
      let parseData = qs.parse(store);
      let username = parseData.username;
      fs.open(dir + username + '.json', 'wx', (err, fd) => {
        if (err) throw new Error(`${username} already exists`);
        fs.write(fd, JSON.stringify(parseData), (err) => {
          if (err) console.log(err);
          fs.close(fd, (err) => {
            if (err) console.log(err);
            res.end('Data Saved');
          });
        });
      });
    }
    if ((req.method === 'GET') & (parserUrl.pathname === '/users')) {
      let user = parserUrl.query.username;
      let path = dir + user + '.json';
      if (user) {
        fs.readFile(path, (err, content) => {
          if (err) console.log(err);

          let data = JSON.parse(content.toString());
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(`<h2>${data.name}</h2>`);
          res.write(`<h2>${data.email}</h2>`);
          res.write(`<h2>${data.username}</h2>`);
          res.write(`<h2>${data.age}</h2>`);
          res.write(`<h2>${data.bio}</h2>`);
          res.end();
        });
      }
    } else {
      res.statusCode = 404;
      res.end('page not found');
    }
  });
}

server.listen(5000, () => {
  console.log('server is listen on 5000');
});
