# GraphoAI – Anàlisi Grafopsicològica Assistida per IA

GraphoAI és una aplicació web premium dissenyada per a l'anàlisi grafopsicològica de textos manuscrits a partir de fotografies o documents PDF. Combina algorismes avançats de **visió per computador (OpenCV)** per a la segmentació i anàlisi geomètrica del traç amb la **intel·ligència artificial (OpenAI API)** per generar un informe grafològic professional, prudent i estructurat, seguint les directrius de la grafologia clàssica europea.

## Característiques

- **Processament d'imatges amb OpenCV**:
  - Detecció automàtica de la pàgina i correcció de la perspectiva (Warp).
  - Millora de contrast mitjançant CLAHE (Contrast Limited Adaptive Histogram Equalization) i filtrat bilateral de soroll.
  - Detecció i segmentació geomètrica de línies, paraules i lletres mitjançant perfils de projecció horitzontal i vertical.
- **Càlcul automàtic de 28 variables gràfiques**:
  - Inclinació, grandària, amplada, regularitat, pressió, continuïtat, bucles, marges, línia base, proporció signatura/text, etc.
- **Informe grafopsicològic generat per IA**:
  - Resum executiu.
  - Seccions de personalitat, relacions personals, aptitud laboral i punts d'atenció.
  - Ús estricte de llenguatge prudent ("és compatible amb", "podria indicar") i sense diagnòstics clínics o absoluts.
  - Gràfic radial de competències (lideratge, organització, creativitat, empatia, constància, etc.).
- **Exportació completa**:
  - Exportació en PDF professional (generada des de backend amb ReportLab).
  - Impressió optimitzada.
  - Descàrrega en format JSON.

---

## Estructura del Projecte

```text
GraphoAI/
├── backend/            # FastAPI Server & OpenCV Engine
│   ├── main.py         # Endpoints de l'API i uvicorn
│   ├── analyzer.py     # Processament d'imatge i càlcul geomètric
│   ├── openai_client.py# Integració de prompt i Structured Outputs d'OpenAI
│   ├── pdf_generator.py# Generació vectoritzada del document PDF
│   └── requirements.txt# Llibreries Python necessàries
└── frontend/           # React + Vite + Tailwind CSS v4
    ├── src/
    │   ├── App.jsx     # Interfície principal i flux del client
    │   ├── index.css   # Configuració de Tailwind v4 i estils globals
    │   └── components/
    │       ├── RadarChart.jsx   # Gràfic radial SVG interactiu
    │       └── VariablesGrid.jsx# Visualitzador de les 28 variables
    └── package.json    # Dependencies npm
```

---

## Com començar (Setup)

### Prerequisits

Assegura't de tenir instal·lats:
- **Node.js (v18+)**
- **Python (v3.11 o v3.12)**
- **uv** (opcional, per a una gestió ràpida de paquets)

### 1. Configurar el Backend

1. Entra a la carpeta `backend/`:
   ```bash
   cd backend
   ```
2. Crea un entorn virtual i activa'l:
   ```bash
   uv venv venv --python 3.12
   # o bé: python -m venv venv
   # Activa a Windows:
   venv\Scripts\activate
   ```
3. Instal·la les dependències:
   ```bash
   uv pip install -r requirements.txt
   # o bé: pip install -r requirements.txt
   ```
4. Configura les credencials d'OpenAI:
   - Copia el fitxer `.env.example` a un fitxer nou anomenat `.env`.
   - Afegeix la teva clau de l'API d'OpenAI:
     ```env
     OPENAI_API_KEY=la-teva-clau-api-aqui
     ```
     *(Si no configures la clau, l'aplicació funcionarà automàticament en **Mode Demo**, simulant l'informe basant-se en les mètriques reals extretes per OpenCV).*
5. Inicia el servidor del backend:
   ```bash
   python main.py
   ```
   El servidor s'iniciarà a [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 2. Configurar el Frontend

1. Entra a la carpeta `frontend/`:
   ```bash
   cd frontend
   ```
2. Instal·la les dependències:
   ```bash
   npm install
   ```
3. Inicia el servidor de desenvolupament:
   ```bash
   npm run dev
   ```
   L'aplicació estarà disponible a [http://localhost:5173](http://localhost:5173).
