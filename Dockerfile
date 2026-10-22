# SABOTAGEM CP05 (Prova 3 - bônus): "volta" para uma imagem base antiga, nginx 1.16
# sobre Alpine 3.10 (fim de suporte em 2021), que tem CVEs CRITICAL com correção.
# O job trivy precisa barrar esta imagem.
FROM nginx:1.16-alpine@sha256:5057451e461dda671da5e951019ddbff9d96a751fc7d548053523ca1f848c1ad

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
