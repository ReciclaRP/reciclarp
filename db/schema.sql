-- schema.sql
-- Equipe: Adrian Souza Teixeira (RA 2840482421051), Heitor Benedetti Lopes (RA 2840482421003), Victor Breno Anastácio de Matos (RA 2840482313038)
-- PostgreSQL 15+
 
CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('comum', 'ong'))
);
 
CREATE TABLE material_aceito (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(60) NOT NULL UNIQUE
);
 
CREATE TABLE ponto_coleta (
  id SERIAL PRIMARY KEY,
  endereco VARCHAR(200) NOT NULL,
  bairro VARCHAR(80) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aprovado' CHECK (status IN ('aprovado', 'inativo')),
  criado_por INT NOT NULL REFERENCES usuario(id),
  atualizado_em TIMESTAMP NOT NULL DEFAULT now()
);
 
CREATE TABLE ponto_material (
  ponto_id INT NOT NULL REFERENCES ponto_coleta(id) ON DELETE CASCADE,
  material_id INT NOT NULL REFERENCES material_aceito(id),
  PRIMARY KEY (ponto_id, material_id)
);
 
CREATE TABLE horario_funcionamento (
  id SERIAL PRIMARY KEY,
  ponto_id INT NOT NULL REFERENCES ponto_coleta(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_abertura TIME NOT NULL,
  hora_fechamento TIME NOT NULL,
  CHECK (hora_fechamento > hora_abertura)
);
 
CREATE TABLE requisicao_cadastro (
  id SERIAL PRIMARY KEY,
  autor_id INT NOT NULL REFERENCES usuario(id),
  endereco_proposto VARCHAR(200) NOT NULL,
  latitude_proposta DECIMAL(9,6) NOT NULL,
  longitude_proposta DECIMAL(9,6) NOT NULL,
  materiais_propostos TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  justificativa_rejeicao TEXT,
  decidido_por INT REFERENCES usuario(id),
  data_decisao TIMESTAMP,
  ponto_gerado_id INT UNIQUE REFERENCES ponto_coleta(id),
  CHECK (status <> 'rejeitada' OR justificativa_rejeicao IS NOT NULL)
);
 
CREATE TABLE relato_problema (
  id SERIAL PRIMARY KEY,
  ponto_id INT NOT NULL REFERENCES ponto_coleta(id),
  autor_id INT NOT NULL REFERENCES usuario(id),
  categoria VARCHAR(40) NOT NULL,
  descricao TEXT NOT NULL,
  protocolo VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'resolvido')),
  criado_em TIMESTAMP NOT NULL DEFAULT now()
);
 
-- Índices de apoio à consulta agregada do painel
CREATE INDEX idx_ponto_coleta_bairro ON ponto_coleta(bairro);
CREATE INDEX idx_ponto_material_material ON ponto_material(material_id);
 
-- Seed de exemplo
INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES
  ('ONG Recicla RP', 'contato@reciclarp.org.br', '$2b$10$exemplo', 'ong'),
  ('Maria Eduarda', 'maria.eduarda@exemplo.com', '$2b$10$exemplo', 'comum');
 
INSERT INTO material_aceito (nome) VALUES ('Papel'), ('Plástico'), ('Vidro'), ('Metal');
 
INSERT INTO ponto_coleta (endereco, bairro, latitude, longitude, criado_por) VALUES
  ('Av. Costábile Romano, 2201', 'Ribeirânia', -21.185, -47.795, 1);
 
INSERT INTO ponto_material (ponto_id, material_id) VALUES (1, 1), (1, 2), (1, 3);
 
INSERT INTO horario_funcionamento (ponto_id, dia_semana, hora_abertura, hora_fechamento) VALUES
  (1, 1, '08:00', '17:00'),
  (1, 2, '08:00', '17:00');
 
INSERT INTO requisicao_cadastro (autor_id, endereco_proposto, latitude_proposta, longitude_proposta, materiais_propostos) VALUES
  (2, 'Rua Nove de Julho, 500', -21.178, -47.808, 'Papel, Metal');
