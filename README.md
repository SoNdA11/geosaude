# GeoSaúde Mossoró

Bem-vindo ao repositório oficial do **GeoSaúde Mossoró**, uma plataforma digital inovadora criada para facilitar o acesso da população aos **serviços públicos de saúde** do município.

## Sobre o Projeto

O **GeoSaúde Mossoró** reúne **usabilidade**, **acessibilidade** e **dados atualizados** para oferecer uma experiência simples e eficiente, tanto para cidadãos quanto para gestores.

![Interface GeoSaúde](src/assets/print-tela-inicial.png)


### Principais Funcionalidades

* **Mapa Interativo:** visualização de UBSs, UPAs e Hospitais no mapa com remoção de pontos de interesse (POIs) nativos para melhor clareza.
* **Busca Avançada & Inteligente:** pesquisa rápida na página inicial por CEP e filtros avançados por especialidade, bairro, tipo de serviço ou esfera administrativa.
* **Detalhes Completos da Unidade:** informações completas incluindo endereço estruturado, contatos, quadro clínico de médicos, notícias específicas e horários de funcionamento.
* **Triagem Clínica Online:** sistema inteligente e interativo baseado em perguntas para recomendar o canal ideal de atendimento (Auto-cuidado, UBS, UPA ou Hospital) de acordo com o grau de urgência.
* **Portal de Documentos Informativos:** área de download de documentos e cartilhas oficiais disponibilizadas pelas secretarias de saúde.
* **Painel de Controle Geral (Admin):** controle centralizado de administradores, unidades de saúde, relatórios de logs de auditoria e métricas estatísticas globais com gráficos de acessos e triagens.
* **Painel do Gestor de Unidade:** ferramentas de gestão específicas para atualizar dados da própria unidade, cadastrar médicos, serviços, notícias locais e monitorar avaliações.
* **Avaliações de Serviços:** sistema de feedback do cidadão para avaliar os serviços prestados em cada unidade de saúde.

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
