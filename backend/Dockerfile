# Usa uma versão leve e estável do Python (evita problemas do 3.14)
FROM python:3.11-slim

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia o arquivo de dependências para o container
COPY requirements.txt .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o resto do código do backend para o container
COPY . .

# Comando para iniciar o servidor quando o container subir
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]