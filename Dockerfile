# Imagem base: nginx oficial "unprivileged" (roda como usuário não-root na porta 8080),
# variante alpine-slim (menos pacotes = menos superfície de ataque e menos CVEs).
# Fixada por versão + digest: o build é reproduzível e uma tag republicada não muda a imagem.
FROM nginx/nginx-unprivileged:1.31.8-alpine-slim@sha256:a2ae214d0266826427b804b0513dce20c9c93b862f1593203f9e6b50be9c2689

LABEL org.opencontainers.image.title="arcanjosa-site" \
      org.opencontainers.image.description="Site da Arcanjosa - CP05 DevSecOps (FIAP)" \
      org.opencontainers.image.authors="Eduardo Akira Murata - RM 98713" \
      org.opencontainers.image.source="https://github.com/akiramrt/cp05-devsecops-pipeline"

# Config do nginx com headers de segurança e o endpoint /healthz
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Conteúdo estático. Os arquivos ficam com dono root, então o processo do nginx
# (usuário 101) consegue ler, mas não consegue alterar o site.
COPY site/ /usr/share/nginx/html/

USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
