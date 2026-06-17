import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
})

# Permitir reuso de endereço
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor rodando localmente na porta {PORT}...")
    print(f"Acesse a Area de Membros em: http://localhost:{PORT}/area-de-membros/#/login")
    print(f"Acesse o Material Final em: http://localhost:{PORT}/entregaveis/tanatopraxia.html")
    httpd.serve_forever()
