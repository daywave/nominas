# Backend (AWS Lambda + DynamoDB + Hono)

Módulo serverless para el registro y consulta de votos de recomendación y percepción salarial.

## Estructura

```text
aws/
├── template.yaml            # Plantilla SAM
└── lambda/
    └── votes/
        ├── package.json
        ├── index.mjs        # Entry point Hono
        └── routes/
            └── votes.js     # Endpoints /votes/:prof_key
```

## Requisitos

- AWS CLI configurado
- Node.js 20+

## Despliegue con SAM

```bash
sam build -t aws/template.yaml
sam deploy --guided
```

## Endpoints

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check |
| `GET` | `/votes/{prof_key}` | Conteos agregados |
| `POST` | `/votes/{prof_key}` | Registro o cancelación de voto |
