# Log Sentinel AI 🛡️🔍

### Um analisador de logs inteligente com o poder do Google Gemini para transformar dados técnicos em insights de segurança acionáveis.

![GIF do Log Sentinel AI em Ação](https://github.com/Kaue-Lustosa/log-sentinel-ai/blob/main/demo/first_view.gif)

---

## 🚀 Sobre o Projeto

O **Log Sentinel AI** é uma aplicação web full-stack projetada para auxiliar analistas de segurança, profissionais de forense digital e desenvolvedores a entender rapidamente logs de sistema complexos. Em um cenário de resposta a incidentes, cada segundo conta. Esta ferramenta utiliza um Large Language Model (LLM) para traduzir logs enigmáticos, avaliar riscos, extrair Indicadores de Comprometimento (IoCs) e sugerir ações práticas, tudo em tempo real.

Este projeto foi desenvolvido como um case de estudo aprofundado na integração de Inteligência Artificial com Cibersegurança, demonstrando habilidades em desenvolvimento de software, arquitetura de sistemas e engenharia de prompts.

**🔗 Teste a aplicação ao vivo:** [URL_DA_SUA_APLICAÇÃO_NA_VERCEL]

---

## ✨ Funcionalidades Principais

* **Análise com IA:** Utiliza a API do Google Gemini para fornecer uma análise contextual de logs.
* **Tradução e Risco:** Converte logs técnicos em linguagem humana e atribui um nível de risco (de Informativo a Crítico).
* **Extração de IoCs:** Identifica e extrai automaticamente IPs, domínios, hashes e URLs.
* **Chunking Inteligente:** Suporta logs de grande volume, dividindo-os em pedaços para uma análise completa sem exceder os limites da IA.
* **Interface Reativa:** Frontend moderno e responsivo construído com Next.js e Tailwind CSS.

---

## 🛠️ Tecnologias Utilizadas

| Frontend | Backend | IA & Bibliotecas | Implantação (Deployment) |
| :--- | :--- | :--- | :--- |
| Next.js | Python 3 | Google Gemini API | Vercel |
| React | FastAPI | LangChain | Render |
| TypeScript | Pydantic | - | - |
| Tailwind CSS | - | - | - |
| Shadcn/UI | - | - | - |
| Framer Motion| - | - | - |

---

## ⚙️ Como Executar Localmente

Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

### Pré-requisitos

* Node.js (v18+)
* Python (v3.9+)
* Uma chave de API do Google AI Studio

### Backend (FastAPI)

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```
2.  **Crie e ative um ambiente virtual:**
    ```bash
    python -m venv venv
    source venv/bin/activate # ou venv\Scripts\activate no Windows
    ```
3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt # (Lembre-se de criar este arquivo com 'pip freeze > requirements.txt')
    ```
4.  **Configure as variáveis de ambiente:**
    * Crie um arquivo `.env` na pasta `backend`.
    * Adicione sua chave de API: `GOOGLE_API_KEY="SUA_CHAVE_AQUI"`
5.  **Inicie o servidor:**
    ```bash
    uvicorn main:app --reload
    ```
    O backend estará rodando em `http://localhost:8000`.

### Frontend (Next.js)

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:3000`.

---

## 👨‍💻 Desenvolvido por

**Kauê Lustosa Morgado**

* **LinkedIn:** https://www.linkedin.com/in/kauê-lustosa/
* **GitHub:** [https://github.com/Kaue-Lustosa]
