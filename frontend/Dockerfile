# Usa una imagen ligera de Nginx
FROM nginx:alpine

# Copia tus archivos a la carpeta de Nginx
COPY index.html app.js /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expón el puerto 80 (HTTP)
EXPOSE 80