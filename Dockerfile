FROM nginx:alpine

# Copy sales page content to root
COPY paginadevendas/ /usr/share/nginx/html/

# Copy member area content to /area-de-membros/
COPY area-de-membros/ /usr/share/nginx/html/area-de-membros/

# Copy login redirect content to /login/
COPY login/ /usr/share/nginx/html/login/

# Garantir permissões de leitura corretas para os arquivos estáticos
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80
