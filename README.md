# PROVA GLOBAL SOLUTION

ANDRÉ ALVIM - rm93120
MARCELO LOPEZ - RM94592

## Comandos para Rodar a Aplicação

1. **Subir os contêineres com Docker:**

   Para construir e rodar os contêineres de banco de dados e fila, use o seguinte comando:

   ```bash
   docker-compose up --build -d
   ```

2. **Rodar aplicação em modo dev:**

   Para executar a aplicação em modo desenvolvedor execute, use o seguinte comando:

   ```bash
   npm run start:dev
   ```

## Endpoints da API

### 1. Gerar Certificado

- **Método:** `POST`
- **Endpoint:** `/certificate`
- **Descrição:** Gera um certificado em PDF com os dados fornecidos.
- **Corpo da Requisição:**
  ```json
  {
    "studentName": "Nome do Estudante",
    "studentRM": 123456,
    "courseId": 1,
    "courseName": "Nome do Curso",
    "completionDate": "2023-10-30",
    "signatureName": "Nome da Assinatura",
    "position": "Cargo"
  }
  ```
- **Resposta:**

  - **Status 200:** Retorna os detalhes do certificado gerado.
  - **Status 400:** Erro de validação se os dados estiverem incorretos.

  ````bash
    curl -X POST http://localhost:3000/certificate \
    -H "Content-Type: application/json" \
    -d '{
      "studentName": "Nome do Estudante",
      "studentRM": 123456,
      "courseId": 1,
      "courseName": "Nome do Curso",
      "completionDate": "2023-10-30",
      "signatureName": "Nome da Assinatura",
      "position": "Cargo"
    }'```
  ````

### 2. Obter Certificado

- **Método:** `GET`
- **Endpoint:** `/certificate/:id`
- **Descrição:** Obtém o PDF do certificado com base no ID fornecido.
- **Parâmetros:**
  - `id`: ID do certificado a ser recuperado.
- **Resposta:**
  - **Status 200:** Retorna o arquivo PDF do certificado.
  - **Status 404:** Certificado não encontrado.

## OBS:

Em cada aplicação tem o seu dockerfile e no docker-compose está configurado os containers para subir em produção
