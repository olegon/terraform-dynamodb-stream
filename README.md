# Como juntar eventos?

## Desafio

Um sistema pode receber dois tipos de eventos:

```json
# eventA
{
    "correlationId": "123",
    "eventType": "eventA"
}

# eventB
{
    "correlationId": "123",
    "eventType": "eventB"
}
```

O desafio é disparar um novo evento se, e somente se, os dois eventos forem recebidos.

## Stack

- AWS SQS
- AWS DynamoDB
- AWS DynamoDB Stream
- AWS Lambda (nodejs)
- Terraform


## Solução

- quando uma mensagem cair no SQS `app-events`, uma Lambda cadastrá esse evento no DynamoDB `app-events-registry`;
- o DynamoDB possui um *stream* habilitado que é processado pela Lambda `app-events-registry-stream`, que verifica quando eventos foram correlacionados/agregados com sucesso;
- os itens são cadastrados com TTL no DynamoDB, assim é possível reagir quando apenas um evento chega e o DynamoDB não fica com muitos itens por muito tempo.

## Itens implementados

- [x] Utililitário para gerar eventos
- [x] Lambda para receber eventos
- [x] DynamoDB
- [x] DynamoDB Stream
- [x] Lambda para ler DynamoDB Stream
- [x] Proteção contra concorrência (feito com Optimistic Locking + Retry + DLQ)
