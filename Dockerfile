# Usa imagem que já tem o texlive completo instalado
FROM texlive/texlive:latest

# Instala Python e pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /app

# Copia dependências
COPY requirements.txt .

# Instala dependências Python
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copia o restante dos arquivos
COPY . .

# Expõe a porta
EXPOSE 8000

# Inicia o servidor
CMD ["python3", "server.py"]

