#!/bin/bash

# Este script reemplaza la URL de la API en el archivo de entorno de producción
# utilizando la variable de entorno NG_APP_API_URL definida en Vercel.

ENV_FILE="src/environments/environment.prod.ts"

if [ -z "$NG_APP_API_URL" ]; then
  echo "Error: NG_APP_API_URL no está definida. Usando el valor por defecto."
else
  echo "Inyectando API URL: $NG_APP_API_URL"
  sed -i "s|apiUrl: '.*'|apiUrl: '$NG_APP_API_URL'|g" $ENV_FILE
fi
