# Use a imagem oficial do Node.js como base
FROM node:18.18.0

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json para o contêiner
COPY ./package*.json /usr/src/app/

# Instala as dependências da aplicação
RUN npm install

# Instala o NestJS CLI globalmente
RUN npm install -g @nestjs/cli

# Copia o restante do código da aplicação para o contêiner
COPY . .

# Expõe a porta que a aplicação irá rodar
EXPOSE 3000

RUN npm run build

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]