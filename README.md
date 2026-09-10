## Requisitos

Para ejecutar el proyecto es necesario tener instalado:

- PHP 8.4 o superior
- Composer
- Node.js y npm
- Git
- Docker Desktop

Docker Desktop es necesario para iniciar MinIO, servicio utilizado para el almacenamiento de las fotografías.


## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/falucerol-arch/proyecto.git

Descarga el proyecto desde GitHub.
cd proyecto

Entra a la carpeta del proyecto descargado.
composer install

Instala las dependencias necesarias de Laravel/PHP.
npm install

Instala las dependencias de React, TypeScript, Vite y las demás librerías del frontend.
.\setup.bat

Prepara automáticamente el proyecto: configuración, base de datos, migraciones y Docker/MinIO.
.\iniciar.bat

Después se abre:
http://localhost:8000
