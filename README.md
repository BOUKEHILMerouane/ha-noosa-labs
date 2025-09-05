Project Setup Instructions
1. Requirements

Docker
 installed

Docker Compose
 installed

2. Start the project

From the root folder (where docker-compose.yml is located), run:

docker compose up -d --build


This will start 3 containers:

laravel-app → Laravel backend (http://localhost:8000
)

fit-mysql → MySQL database (on port 3307 locally)

react-app → React frontend (http://localhost:3000
)

3. Access the apps

React (frontend): http://localhost:3000

Laravel (backend API): http://localhost:8000

4. Database credentials

Host: db

Port: 3306 (internal), 3307 (from host)

Database: fit

Username: fit

Password: fitpass

Root password: rootpass

5. Laravel setup

Enter the Laravel container:

docker exec -it laravel-app bash


Run the following inside:

composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed   # Creates tables and seeds sample data
php artisan storage:link     # Recreate the storage symlink


⚠️ Note:
The public/storage symlink is not included in the archive (Windows can’t compress it).
Make sure to run php artisan storage:link after the container is up, otherwise uploaded files won’t be accessible.

6. React setup

The React container already runs the development server with:

npm run dev


Any code changes in react-part/ will automatically reload in the browser.
