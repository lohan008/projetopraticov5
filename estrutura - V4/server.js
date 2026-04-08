const http = require('http');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Configuração do Banco de Dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Sua senha do MySQL
    database: 'sistema_web'
});

const server = http.createServer((req, res) => {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 1. LÓGICA DE FICHEIROS ESTÁTICOS (HTML, CSS, JS)
    // Se o pedido for GET e tiver uma extensão (ex: .html) ou for a raiz "/"
    const parsedUrl = req.url.split('?')[0];
    const ext = path.extname(parsedUrl);

    if (req.method === 'GET' && (ext !== '' || parsedUrl === '/')) {
        let urlPath = parsedUrl === '/' ? '/login.html' : parsedUrl;
        let filePath = path.join(__dirname, urlPath);
        
        let contentType = 'text/html';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.js') contentType = 'text/javascript';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(404);
                res.end("Erro: O ficheiro " + urlPath + " nao existe na pasta do projeto.");
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
        return; // Importante: sai daqui para não tentar processar como API
    }

    // 2. ROTAS DE API (DADOS DO BANCO)
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        try {
            // Rota de Login
            if (req.url === '/login' && req.method === 'POST') {
                const { user, pass } = JSON.parse(body);
                db.execute('SELECT * FROM usuarios WHERE usuario = ?', [user], async (err, results) => {
                    if (results && results.length > 0 && await bcrypt.compare(pass, results[0].senha)) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(401, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({ success: false }));
                    }
                });
            }

            // Rota de Cadastro
            else if (req.url === '/cadastro' && req.method === 'POST') {
                const { user, pass } = JSON.parse(body);
                const hash = await bcrypt.hash(pass, 10);
                db.execute('INSERT INTO usuarios (usuario, senha) VALUES (?, ?)', [user, hash], (err) => {
                    res.writeHead(err ? 400 : 201, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: !err }));
                });
            }

            // Rota Admin (Listar)
            else if (req.url === '/usuarios' && req.method === 'GET') {
                db.execute('SELECT id, usuario FROM usuarios', (err, results) => {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(results));
                });
            }

            // Rota Admin (Remover)
            else if (req.url.startsWith('/usuarios/') && req.method === 'DELETE') {
                const id = req.url.split('/')[2];
                db.execute('DELETE FROM usuarios WHERE id = ?', [id], () => {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: true }));
                });
            }

        } catch (e) {
            res.writeHead(500);
            res.end();
        }
    });
});

server.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
    console.log("👉 Tente aceder: http://localhost:3000/login.html");
});