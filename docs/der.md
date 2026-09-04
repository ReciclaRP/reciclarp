# DER

## Dados de Entrega

Equipe:

- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003)
- Victor Breno Anastácio de Matos (RA 2840482313038)

Trilha: B 

Data: 04/09/2026

## Conteúdo

```mermaid
erDiagram

    usuario {
        SERIAL id PK
        VARCHAR_120 nome
        VARCHAR_160 email UK
        VARCHAR_255 senha_hash
        VARCHAR_20 perfil
    }

    ponto_coleta {
        SERIAL id PK
        VARCHAR_200 endereco
        VARCHAR_80 bairro
        DECIMAL_9_6 latitude
        DECIMAL_9_6 longitude
        VARCHAR_20 status
        INT criado_por FK
        TIMESTAMP atualizado_em
    }

    material_aceito {
        SERIAL id PK
        VARCHAR_60 nome UK
    }

    ponto_material {
        INT ponto_id PK, FK
        INT material_id PK, FK
    }

    horario_funcionamento {
        SERIAL id PK
        INT ponto_id FK
        SMALLINT dia_semana
        TIME hora_abertura
        TIME hora_fechamento
    }

    requisicao_cadastro {
        SERIAL id PK
        INT autor_id FK
        VARCHAR_200 endereco_proposto
        DECIMAL_9_6 latitude_proposta
        DECIMAL_9_6 longitude_proposta
        TEXT materiais_propostos
        VARCHAR_20 status
        TEXT justificativa_rejeicao
        INT decidido_por FK
        TIMESTAMP data_decisao
        INT ponto_gerado_id FK, UK
    }

    relato_problema {
        SERIAL id PK
        INT ponto_id FK
        INT autor_id FK
        VARCHAR_40 categoria
        TEXT descricao
        VARCHAR_20 protocolo UK
        VARCHAR_20 status
        TIMESTAMP criado_em
    }

    usuario ||--o{ ponto_coleta : "cadastra (criado_por)"
    usuario ||--o{ requisicao_cadastro : "propõe (autor_id)"
    usuario ||--o{ requisicao_cadastro : "decide (decidido_por)"
    usuario ||--o{ relato_problema : "relata (autor_id)"

    ponto_coleta ||--o{ horario_funcionamento : possui
    ponto_coleta ||--o{ relato_problema : recebe
    ponto_coleta ||--o{ ponto_material : aceita
    material_aceito ||--o{ ponto_material : "é aceito em"

    requisicao_cadastro |o--o| ponto_coleta : "gera (quando aprovada)"
```
