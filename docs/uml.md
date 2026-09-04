# Diagramas UML - RP Recicla

## Dados da Entrega

Equipe: 

- Adrian Souza Teixeira (RA 2840482421051)
- Heitor Benedetti Lopes (RA 2840482421003) 
- Victor Breno Anastácio de Matos (RA 2840482313038)
  
Trilha: B

Data: 04/09/2026

## Conteúdo

### Diagrama de Casos de Uso

```mermaid
flowchart LR
  U((Usuario))
  O((ONG))

  U --> UC1[Criar conta]
  O --> UC1
  U --> UC2[Recuperar senha]
  O --> UC3[Cadastrar ponto de coleta inicial]
  U --> UC4[Consultar pontos no mapa]
  U --> UC5[Visualizar detalhes do ponto]
  U --> UC6[Cadastrar novo ponto de coleta]
  UC6 -.include.-> UC6b[Registrar requisicao pendente]
  O --> UC7[Analisar requisicoes]
  UC7 -.extend.-> UC7a[Aprovar requisicao]
  UC7 -.extend.-> UC7b[Rejeitar requisicao]
  UC7b -.include.-> UC7c[Registrar justificativa]
  U --> UC8[Relatar problema em ponto]
  O --> UC9[Editar ponto e horarios]
  O --> UC10[Visualizar painel agregado]
  O --> UC11[Exportar relatorio CSV]
  UC11 -.include.-> UC10
  U --> UC12[Visualizar dicas de separacao]
```

### Diagrama de Classes

```mermaid
classDiagram
  class Usuario {
    +id: int
    +nome: string
    +email: string
    +senhaHash: string
    +perfil: enum
  }
  class PontoDeColeta {
    +id: int
    +endereco: string
    +bairro: string
    +latitude: decimal
    +longitude: decimal
    +status: enum
    +estaAberto() bool
  }
  class MaterialAceito {
    +id: int
    +nome: string
  }
  class HorarioFuncionamento {
    +id: int
    +diaSemana: int
    +horaAbertura: time
    +horaFechamento: time
  }
  class RequisicaoCadastro {
    +id: int
    +enderecoProposto: string
    +latitudeProposta: decimal
    +longitudeProposta: decimal
    +status: enum
    +justificativaRejeicao: string
    +dataDecisao: date
  }
  class RelatoProblema {
    +id: int
    +categoria: string
    +descricao: string
    +protocolo: string
    +status: enum
  }

  Usuario "1" -- "N" RequisicaoCadastro : autor
  Usuario "1" -- "0..N" RequisicaoCadastro : decide (ONG)
  Usuario "1" -- "N" RelatoProblema : autor
  PontoDeColeta "N" -- "N" MaterialAceito : aceita
  PontoDeColeta "1" -- "N" HorarioFuncionamento : possui
  PontoDeColeta "1" -- "N" RelatoProblema : recebe
  RequisicaoCadastro "0..1" -- "1" PontoDeColeta : gera (quando aprovada)
```

### Rastreabilidade — caso de uso → história do backlog (E2)

| Caso de uso | História(s) relacionada(s) (E2) |
|---|---|
| Criar conta | #1 |
| Recuperar senha | #2 |
| Cadastrar ponto de coleta inicial | #3 |
| Consultar pontos no mapa | #4 |
| Visualizar detalhes do ponto | #5 |
| Cadastrar novo ponto de coleta + Registrar requisição pendente | #6 |
| Analisar requisições + Aprovar/Rejeitar requisição + Registrar justificativa | #7 |
| Relatar problema em ponto | #8 |
| Editar ponto e horários | #9 |
| Visualizar painel agregado | #10 |
| Exportar relatório CSV | #11 |
| Visualizar dicas de separação | #12 |
