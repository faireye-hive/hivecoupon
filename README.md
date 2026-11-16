# CUpom

Site de ofertas e cupons da comunidade Hive, criado com Vite. Ofertas e votos são publicados como operações `custom_json` identificadas por `cupom_offers`; comentários usam `cupom_comments`. As operações são assinadas localmente pelo Hive Keychain.

## Desenvolvimento local

```sh
npm ci
npm run dev
```

## Publicação

O GitHub Actions compila o site e publica `dist/` no GitHub Pages sempre que há um push para `main`. A configuração do Vite usa a base `/hivecoupon/` para o endereço do projeto:

`https://faireye-hive.github.io/hivecoupon/`

O login precisa da extensão Hive Keychain habilitada em um navegador compatível. A leitura pública das operações usa HAFSQL.
