# ✈️ Triptoyou - Plataforma Integral de Agencia de Viajes

Triptoyou es un sistema de gestión y reserva de viajes desarrollado como Trabajo de Fin de Grado (TFG). La plataforma permite a los usuarios explorar destinos, realizar reservas de forma segura y gestionar su documentación, todo asistido por inteligencia artificial.

El proyecto está construido bajo una arquitectura de despliegue distribuido, separando el cliente (SPA), la lógica de negocio (API REST) y la capa de datos.

## 🚀 Arquitectura y Tecnologías

### Frontend (Cliente)
* **Framework:** Angular
* **Despliegue:** Vercel (PaaS)
* **Características:** Single Page Application (SPA), enrutamiento gestionado (`vercel.json`), diseño responsivo.

### Backend (API REST)
* **Framework:** Laravel (PHP)
* **Despliegue:** Railway (PaaS)
* **Características:** Lógica de negocio, autenticación de usuarios (Laravel Sanctum), y manejo de colas de trabajo (Queues/Jobs) en segundo plano.

### Base de Datos
* **Motor:** PostgreSQL
* **Despliegue:** Neon.tech (Cloud)

### Integraciones de Terceros
* **💳 Pagos:** Stripe API (Procesamiento seguro de transacciones).
* **🤖 Inteligencia Artificial:** Google Gemini API (Asistente virtual/Chatbot integrado).


---

## 🔗 Enlaces de Producción

* **Frontend (Aplicación Web):** [ https://triptoyou.vercel.app]
* **Backend (API Base URL):** [travel-agency-production-d94a.up.railway.app]

---

## 🛠️ Instalación y Configuración Local

El repositorio está estructurado como un monorepo, con el código de Laravel en la raíz y la aplicación de Angular dentro del directorio `/frontend`.

### Requisitos Previos
* PHP >= 8.2 y Composer
* Node.js y npm
* Base de datos PostgreSQL local o en la nube

### 1. Configuración del Backend (Laravel)

```bash
# Clonar el repositorio
git clone [https://github.com/unaipma/travel-agency.git](https://github.com/unaipma/travel-agency.git)
cd travel-agency

# Instalar dependencias de PHP
composer install

# Configurar variables de entorno
cp .env.example .env

# Generar la clave de la aplicación
php artisan key:generate

# Ejecutar las migraciones para crear las tablas de la base de datos
php artisan migrate

# Iniciar el servidor local
php artisan serve
