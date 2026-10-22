# CP05 — O Pipeline DevSecOps Completo

[![Security Pipeline](https://github.com/akiramrt/cp05-devsecops-pipeline/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/akiramrt/cp05-devsecops-pipeline/actions/workflows/security.yml)

**Aluno:** Eduardo Akira Murata — **RM 98713**
**Turma:** 4ESR-2026 · FIAP Engenharia de Software
**Disciplina:** DevSecOps and Cloud Computing · Checkpoint 05

> Uma chave de API vazou num commit público da **Arcanjosa** (empresa fictícia). A diretoria decretou:
> pipeline de segurança obrigatório em todos os repositórios. Este repositório é o pipeline de
> referência: ele **barra segredos, código vulnerável e imagem com CVE crítico**, e as
> provas de sabotagem abaixo mostram que ele barra de fato.

## O que tem aqui

| Caminho | O que é |
|---|---|
| [`site/`](site/) | Site estático da Arcanjosa (HTML, CSS e JS sem `eval`/`innerHTML`) |
| [`nginx/default.conf`](nginx/default.conf) | nginx na porta 8080 com headers de segurança (CSP, `X-Frame-Options`, `nosniff`…) e `/healthz` |
| [`Dockerfile`](Dockerfile) | Imagem do site sobre `nginx-unprivileged` (Alpine), roda como usuário não-root, com `HEALTHCHECK` |
| [`.github/workflows/security.yml`](.github/workflows/security.yml) | **Security Pipeline**: jobs `gitleaks`, `semgrep` e `trivy` |
| [`.semgrep/no-eval.yml`](.semgrep/no-eval.yml) | Regra própria do Semgrep que proíbe `eval()`, `new Function()` e timers com string |
| [`docs/`](docs/) | PDF da entrega e prints das execuções |

<!-- EVIDENCIAS -->

## Como rodar o site localmente

```bash
docker build -t cp05-site .
docker run --rm -p 8080:8080 cp05-site
# abra http://localhost:8080
```
