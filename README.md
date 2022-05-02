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

- quando uma mensagem cair no SQS `app-events`, uma Lambda `app-events-check` cadastrá esse evento no DynamoDB `app-events-registry`;
- o DynamoDB possui um *Stream* habilitado que é processado pela Lambda `app-events-registry-stream`, que verifica quando eventos foram correlacionados/agregados com sucesso;
    - parte do filtro é feito com [lambda event filtering](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventfiltering.html#filtering-streams). *(Obrigado, Leandro Paixao e Carlos Decloedt, pela dica!)*
- como os itens são gravados com TTL no Dynamo, a Lambda `app-events-registry-tt-stream` é responsável por tratar eventos incompletos (sem casamento) expirados pelo próprio DynamoDB;

## Itens implementados

- [x] Utililitário para gerar eventos
- [x] Lambda para receber eventos
- [x] DynamoDB
- [x] DynamoDB Stream
- [x] Lambda para ler DynamoDB Stream
- [x] Proteção contra concorrência (feito com Optimistic Locking + Retry + DLQ)
