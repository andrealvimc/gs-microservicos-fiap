PROVA GLOBAL SOLUTION - ANDRÉ ALVIM

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

### 2. Obter Certificado

- **Método:** `GET`
- **Endpoint:** `/certificate/:id`
- **Descrição:** Obtém o PDF do certificado com base no ID fornecido.
- **Parâmetros:**
  - `id`: ID do certificado a ser recuperado.
- **Resposta:**
  - **Status 200:** Retorna o arquivo PDF do certificado.
  - **Status 404:** Certificado não encontrado.
