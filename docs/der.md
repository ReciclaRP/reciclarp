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
    user ||--o{ point  : "cria"
    user ||--o{ report : "registra"
    user ||--o{ access : "abre no Maps"
    point ||--o{ report : "recebe"
    point ||--o{ access : "é acessado"

    user {
        INTEGER id PK "AUTOINCREMENT"
        VARCHAR(120) uname "NOT NULL"
        VARCHAR(160) email "NOT NULL, UNIQUE"
        BOOLEAN banned "NOT NULL, padrão 0"
        BOOLEAN validated "NOT NULL, padrão 0"
        BOOLEAN ong "NOT NULL, padrão 0"
    }

    point {
        INTEGER pid PK "AUTOINCREMENT"
        TEXT pointdescription "NOT NULL"
        REAL lati "NOT NULL"
        REAL long "NOT NULL"
        TEXT time_open "NOT NULL, ex. 7:00"
        TEXT time_close "NOT NULL, ex. 19:00"
        BOOLEAN accepts_paper "NOT NULL, padrão 0"
        BOOLEAN accepts_metal "NOT NULL, padrão 0"
        BOOLEAN accepts_organic "NOT NULL, padrão 0"
        BOOLEAN accepts_biological "NOT NULL, padrão 0"
        BOOLEAN approved "NOT NULL, padrão 0"
        INTEGER creator FK "NOT NULL → user.id"
    }

    report {
        INTEGER rid PK "AUTOINCREMENT"
        TEXT reportdescription "NOT NULL"
        BOOLEAN category_noexist "NOT NULL, padrão 0"
        BOOLEAN category_full "NOT NULL, padrão 0"
        BOOLEAN category_badtime "NOT NULL, padrão 0"
        INTEGER uid FK "NOT NULL → user.id"
        INTEGER pid FK "NOT NULL → point.pid"
    }

    access {
        INTEGER aid PK "AUTOINCREMENT"
        TEXT hour_accessed "NOT NULL, HH:MM"
        INTEGER uid FK "NOT NULL → user.id"
        INTEGER pid FK "NOT NULL → point.pid"
    }
```
