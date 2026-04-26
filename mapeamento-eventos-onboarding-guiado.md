# Mapeamento de Eventos — Onboarding Guiado
**Iniciativa:** Squad de Ativação · Protótipo v1
**Telas:** Conta Aprovada · Sugestão de Produto · Confirmar Aplicação
**Referência:** Guia de Eventos ArenaCash v1.0
**Data:** 2026-04-25

---

## Contexto

Fluxo de onboarding guiado exibido imediatamente após aprovação do KYC. O objetivo é eliminar a "tela em branco" que respondia por 38% dos abandonos em março/26 e conduzir o novo usuário até o primeiro investimento em menos de 5 minutos. O funil completo é:

> `account_approved_screen` → `guided_onboarding_click` → `product_suggestion_screen` → `product_invest_click` → `investment_confirmation_screen` → `investment_confirm_click` → `investment_completed`

---

## Convenções utilizadas

Seguindo o Guia de Eventos ArenaCash v1.0:

| Padrão | Quando usar | Exemplos neste doc |
|---|---|---|
| `{tela}_screen` | Visualização de tela | `account_approved_screen`, `product_suggestion_screen` |
| `{objeto}_{ação}` | Cliques e interações | `product_invest_click`, `guided_onboarding_click` |
| `{objeto}_{estado}` | Mudanças de estado | `investment_completed`, `investment_amount_changed` |

Todas as propriedades em `snake_case`. Tipos: **Identificação** (`user_id`, `plan_type`), **Contexto** (`entry_point`, `screen_name`), **Conteúdo** (`asset_id`, `asset_name`), **Resultado** (`amount_brl`, `investment_success`).

---

## Tela 1 — Conta Aprovada

Exibida imediatamente após aprovação do KYC. Apresenta o progresso do usuário (Cadastro → Identidade verificada → Primeiro investimento) e dois CTAs: onboarding guiado ou exploração livre.

| Nome do evento | Propriedades | Gatilho | Pergunta que responde | Status |
|---|---|---|---|---|
| `account_approved_screen` | `user_id`, `plan_type`, `entry_point` | Usuário chega à tela após aprovação do KYC | Quantos usuários concluem o KYC e chegam ao onboarding? Qual a taxa de passagem KYC → tela de boas-vindas? | Pendente |
| `guided_onboarding_click` | `user_id`, `plan_type`, `screen_name` | Usuário toca em "Fazer meu primeiro investimento" | Qual % dos usuários aprovados no KYC inicia o onboarding guiado? | Pendente |
| `self_explore_click` | `user_id`, `plan_type`, `screen_name` | Usuário toca em "Explorar o app por conta própria" | Qual % opta por exploração livre? Esse grupo converte menos para o primeiro investimento? | Pendente |

---

## Tela 2 — Sugestão de Produto

Lista de produtos filtrados pelo perfil de suitability (conservador). Exibe 3 cards: CDB Banco Inter (destacado como "Mais popular entre iniciantes"), Tesouro Selic 2027 e LCI Banco BTG. Contém bottom navigation e botão de voltar.

| Nome do evento | Propriedades | Gatilho | Pergunta que responde | Status |
|---|---|---|---|---|
| `product_suggestion_screen` | `user_id`, `plan_type`, `suitability_profile`, `products_shown_count`, `entry_point` | Usuário chega à tela de sugestões após tocar em "Fazer meu primeiro investimento" | Qual % dos usuários que clicam no CTA da Tela 1 chegam à sugestão de produtos? | Pendente |
| `product_invest_click` | `user_id`, `asset_id`, `asset_name`, `asset_type`, `asset_rate`, `position_in_list`, `is_highlighted`, `entry_point` | Usuário toca no botão "Investir" de um produto | Qual produto é escolhido com mais frequência no primeiro investimento? Produtos em destaque convertem mais? | Pendente |
| `product_suggestion_back_click` | `user_id`, `screen_name`, `destination_screen` | Usuário toca no botão de voltar (ícone `<`) | Quantos usuários voltam da sugestão de produtos para a tela de conta aprovada? | Pendente |
| `bottom_nav_click` | `user_id`, `tab_selected`, `screen_name`, `entry_point` | Usuário toca em qualquer item da barra de navegação inferior (Home, Investir, Carteira, Cripto, Perfil) | Quantos usuários abandonam o fluxo de onboarding via bottom nav? Qual aba gera mais evasão? | Pendente |

---

## Tela 3 — Confirmar Aplicação

Input de valor com validação, projeção de retorno em 12 meses e confirmação da transação. Valor pré-preenchido com R$ 250,00. Inclui overlay de sucesso com duas ações pós-investimento.

| Nome do evento | Propriedades | Gatilho | Pergunta que responde | Status |
|---|---|---|---|---|
| `investment_confirmation_screen` | `user_id`, `asset_id`, `asset_name`, `asset_type`, `asset_rate`, `pre_filled_amount_brl`, `plan_type`, `entry_point` | Usuário chega à tela de confirmação após selecionar produto | Qual % dos cliques em "Investir" chegam à tela de confirmação? Há abandono entre a Tela 2 e a Tela 3? | Pendente |
| `investment_amount_changed` | `user_id`, `asset_id`, `previous_amount_brl`, `new_amount_brl`, `is_below_minimum`, `is_above_balance` | Usuário altera o valor no campo de input (ao perder foco) | Os usuários alteram o valor pré-preenchido de R$ 250? O ticket real diverge do valor sugerido? | Pendente |
| `investment_amount_error` | `user_id`, `asset_id`, `amount_entered_brl`, `error_type` | Sistema exibe mensagem de erro de validação (valor abaixo do mínimo ou acima do saldo) | Em que percentual das tentativas o usuário insere um valor inválido? Qual o erro mais comum? | Pendente |
| `investment_confirm_click` | `user_id`, `asset_id`, `asset_name`, `asset_type`, `asset_rate`, `amount_brl`, `plan_type`, `is_first_investment`, `entry_point` | Usuário toca em "Confirmar aplicação" | Qual a taxa de conversão de chegada à tela de confirmação para clique em confirmar? Qual o ticket médio do primeiro investimento? | Pendente |
| `investment_completed` | `user_id`, `asset_id`, `asset_name`, `amount_brl`, `plan_type`, `is_first_investment` | Sistema exibe overlay de sucesso após processamento da transação | Qual % das tentativas de confirmação resulta em sucesso? Existe gap entre `investment_confirm_click` e `investment_completed`? | Pendente |
| `choose_other_product_click` | `user_id`, `asset_id`, `asset_name`, `amount_brl`, `screen_name` | Usuário toca em "Escolher outro produto" | Quantos usuários voltam para trocar o produto na tela de confirmação? Qual produto gera mais abandono nessa etapa? | Pendente |
| `investment_confirmation_back_click` | `user_id`, `screen_name`, `asset_id`, `amount_brl` | Usuário toca no botão de voltar (ícone `<`) na tela de confirmação | Quantos usuários abandonam na última etapa antes de confirmar? | Pendente |
| `success_portfolio_click` | `user_id`, `asset_id`, `amount_brl`, `is_first_investment` | Usuário toca em "Ver minha carteira" no overlay de sucesso | Qual % dos usuários acessa a carteira imediatamente após o primeiro investimento? | Pendente |
| `success_new_investment_click` | `user_id`, `asset_id`, `amount_brl`, `is_first_investment` | Usuário toca em "Fazer outro investimento" no overlay de sucesso | Qual % realiza um segundo investimento imediatamente após o primeiro? | Pendente |

---

## Funil completo

```
account_approved_screen
        │
        ├─ guided_onboarding_click  ──────────────────────────────────────┐
        │                                                                  │
        └─ self_explore_click (saída do fluxo guiado)                     │
                                                                          ▼
                                                         product_suggestion_screen
                                                                  │
                                                                  ├─ product_invest_click
                                                                  ├─ product_suggestion_back_click (saída)
                                                                  └─ bottom_nav_click (saída)
                                                                          │
                                                                          ▼
                                                          investment_confirmation_screen
                                                                  │
                                                                  ├─ investment_amount_changed
                                                                  ├─ investment_amount_error
                                                                  ├─ investment_confirm_click
                                                                  │         │
                                                                  │         ▼
                                                                  │  investment_completed
                                                                  │         │
                                                                  │         ├─ success_portfolio_click
                                                                  │         └─ success_new_investment_click
                                                                  │
                                                                  ├─ choose_other_product_click (volta à Tela 2)
                                                                  └─ investment_confirmation_back_click (volta à Tela 2)
```

---

## Perguntas de produto que o mapeamento responde

1. Qual % dos usuários aprovados no KYC inicia o onboarding guiado (vs. exploração livre)?
2. Existe abandono entre a tela de conta aprovada e a sugestão de produtos?
3. Qual produto é o mais escolhido no primeiro investimento — o destacado (CDB) ou outro?
4. O valor pré-preenchido de R$ 250 é aceito ou os usuários alteram o ticket?
5. Qual a taxa de conversão ponta a ponta do fluxo: KYC aprovado → primeiro investimento realizado?
6. Em qual etapa do funil ocorre o maior abandono?
7. Após o primeiro investimento, os usuários preferem ver a carteira ou fazer outro investimento?

---

*Gerado com base no Guia de Eventos ArenaCash v1.0 · Protótipo v1 (index.html) · Squad de Ativação*
