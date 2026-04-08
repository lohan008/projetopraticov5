-- 1. Cria o banco de dados se ele não existir
CREATE DATABASE IF NOT EXISTS sistema_web;

-- 2. Seleciona o banco para uso
USE sistema_web;

-- 3. Cria a tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('user', 'admin') DEFAULT 'user',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Opcional: Inserir um administrador padrão (apenas se a tabela estiver vazia)
-- Nota: A senha abaixo é o hash para 'admin123' gerado pelo bcrypt
INSERT IGNORE INTO usuarios (usuario, senha, tipo) 
VALUES ('admin', '$2b$10$X78dfg...sua_hash_aqui...', 'admin');