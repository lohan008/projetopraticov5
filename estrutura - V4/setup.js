const mysql = require('mysql2/promise'); // Usaremos a versão com Promises para ser mais limpo
const bcrypt = require('bcrypt');

async function setup() {
    const connectionConfig = {
        host: 'localhost',
        user: 'root',
        password: '' // Coloque sua senha do MySQL aqui
    };

    try {
        // 1. Conectar ao MySQL (sem banco ainda)
        const connection = await mysql.createConnection(connectionConfig);
        console.log("✅ Conectado ao MySQL.");

        // 2. Criar o Banco de Dados
        await connection.query("CREATE DATABASE IF NOT EXISTS sistema_web;");
        console.log("✅ Banco 'sistema_web' verificado/criado.");

        // 3. Selecionar o Banco e Criar a Tabela
        await connection.query("USE sistema_web;");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario VARCHAR(50) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                tipo ENUM('user', 'admin') DEFAULT 'user'
            );
        `);
        console.log("✅ Tabela 'usuarios' verificada/criada.");

        // 4. Criar o Administrador Padrão
        const userAdmin = 'admin';
        const passAdmin = 'admin123'; // Esta será a senha inicial

        // Verificamos se já existe um admin para não duplicar
        const [rows] = await connection.query("SELECT * FROM usuarios WHERE usuario = ?", [userAdmin]);

        if (rows.length === 0) {
            const hash = await bcrypt.hash(passAdmin, 10);
            await connection.query("INSERT INTO usuarios (usuario, senha, tipo) VALUES (?, ?, ?)", 
                                  [userAdmin, hash, 'admin']);
            console.log("--------------------------------------");
            console.log("🚀 USUÁRIO MESTRE CRIADO COM SUCESSO!");
            console.log(`👤 Usuário: ${userAdmin}`);
            console.log(`🔑 Senha: ${passAdmin}`);
            console.log("--------------------------------------");
        } else {
            console.log("ℹ️ O usuário 'admin' já existe no sistema.");
        }

        await connection.end();
        process.exit();

    } catch (error) {
        console.error("❌ Erro durante o setup:", error.message);
        process.exit(1);
    }
}

setup();