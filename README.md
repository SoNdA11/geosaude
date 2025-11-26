# GeoSaúde Mossoró

Bem-vindo ao repositório oficial do **GeoSaúde Mossoró**, uma plataforma digital inovadora criada para facilitar o acesso da população aos **serviços públicos de saúde** do município.

## Sobre o Projeto

O **GeoSaúde Mossoró** reúne **usabilidade**, **acessibilidade** e **dados atualizados** para oferecer uma experiência simples e eficiente, tanto para cidadãos quanto para gestores.

![Interface GeoSaúde](src/assets/print-tela-inicial.png)


### Principais Funcionalidades

* **Mapa Interativo:** visualize UBSs, UPAs e Hospitais com filtros inteligentes.
* **Busca Avançada:** encontre unidades por especialidade, bairro, tipo de serviço ou ente federativo.
* **Detalhes Completos:** endereço, contato, equipe médica e horários de atendimento.
* **Triagem Online (Em breve):** sistema inteligente para recomendação de atendimento.
* **Painel Administrativo:** área segura para atualização dos dados das unidades.

## Tecnologias Utilizadas

* **Frontend:** React + Vite
* **Linguagem:** JavaScript (ES6+)
* **Estilização:** Tailwind CSS
* **Ícones:** Lucide React
* **Mapas:** Google Maps JavaScript API

## Como Rodar o Projeto

### Pré-requisitos

* Node.js (versão **18+**)
* npm

### Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/SEU_USUARIO/geosaude-app.git
   cd geosaude-app
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo **.env** na raiz com sua chave da Google Maps API:

   ```
   VITE_GOOGLE_MAPS_API_KEY="SUA_CHAVE_AQUI"
   ```

4. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

5. Acesse no navegador:
   [http://localhost:5173](http://localhost:5173)


## Equipe Técnica

Projeto desenvolvido pelo **Grupo 1 – Projeto Integrador**:

| Membro                                | Responsabilidade                                              |
| ------------------------------------- | ------------------------------------------------------------- |
| **Eduardo Marinho de Paiva**          | Requisitos Não Funcionais, Regras de Negócio, Painel Admin    |
| **Luiz Henrique Alves Ferreira**      | Requisitos Não Funcionais, Casos de Uso, Mapa e Navegação     |
| **Vinicius Eduardo Freitas de Sales** | Requisitos Funcionais, Casos de Uso, Detalhes e Refatoração   |
| **Paulo Sérgio Silva de Medeiros**    | Requisitos Funcionais, Busca Avançada, Performance            |
| **João Victor Amaral de Souza**       | Identificação de Usuário, Painel Admin de Unidade, Avaliações |
