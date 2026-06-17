FROM nginx:alpine

# Copy sales page content to root
COPY paginadevendas/ /usr/share/nginx/html/

# Copy member area content to /area-de-membros/
COPY area-de-membros/ /usr/share/nginx/html/area-de-membros/

# Copy login redirect content to /login/
COPY login/ /usr/share/nginx/html/login/

# Copy images content to /imagens/
COPY imagens/ /usr/share/nginx/html/imagens/

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
