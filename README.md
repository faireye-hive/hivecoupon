# CUpom

Site de ofertas e cupons da comunidade Hive, criado com Vite. Ofertas e votos são publicados como operações `custom_json` identificadas por `cupom_offers`; comentários novos usam o próprio ID curto da oferta como `custom_id`. A chave `app` dentro do JSON continua indicando o formato `cupom_comments`. As operações são assinadas localmente pelo Hive Keychain.

IDs novos são curtos e tipados: ofertas usam `of-` seguido de 12 caracteres aleatórios e comentários usam `cm-` seguido de 12 caracteres. `parentId` referencia o `commentId` pai; IDs UUID já publicados continuam válidos. Como o Hive limita o `custom_id` a 32 caracteres, UUIDs antigos usam o formato compacto sem hífens como `custom_id`.

## Desenvolvimento local

```sh
npm ci
npm run dev
```

## Publicação

O GitHub Actions compila o site e publica `dist/` no GitHub Pages sempre que há um push para `main`. A configuração do Vite usa a base `/hivecoupon/` para o endereço do projeto:

`https://faireye-hive.github.io/hivecoupon/`

O login precisa da extensão Hive Keychain habilitada em um navegador compatível. A leitura pública das operações usa HAFSQL.
