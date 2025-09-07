# 🚀 Project Setup Instructions

## 1. Requirements
- [Docker](https://docs.docker.com/get-docker/) installed  
- [Docker Compose](https://docs.docker.com/compose/) installed  

---

## 2. Start the project
From the root folder (where `docker-compose.yml` is located), run:

```bash
docker compose up -d --build
```

This will start 3 containers:

- **laravel-app** → Laravel backend ([http://localhost:8000](http://localhost:8000))  
- **fit-mysql** → MySQL database (on port `3307` locally)  
- **react-app** → React frontend ([http://localhost:3000](http://localhost:3000))

## 3. Access the apps

- **React (frontend):** [http://localhost:3000](http://localhost:3000)  
- **Laravel (backend API):** [http://localhost:8000](http://localhost:8000)  

## 4. Database credentials

- **Host**: `db`  
- **Port**: `3306` (internal), `3307` (from host)  
- **Database**: `fit`  
- **Username**: `fit`  
- **Password**: `fitpass`  
- **Root password**: `rootpass`  


## STEP 5 — Laravel Setup

# 5.1 Install PHP dependencies (Composer)
# ----------------------------------------
# Run this OUTSIDE any container, from the Laravel folder where composer.json is located.

# 👉 Windows PowerShell
```bash
cd \path\to\ha-noosa-labs-main\laravel
docker run --rm -v ${PWD}:/app -w /app composer install
```
# 👉 Linux / macOS
```bash
cd /path/to/ha-noosa-labs-main/laravel
docker run --rm -v $(pwd):/app -w /app composer install
```


# 5.2 Configure Laravel INSIDE the container
# ------------------------------------------
# Run these from the project root (where docker-compose.yml is),
# they execute inside the laravel-app container.

```bash
docker exec -it laravel-app cp .env.example .env      # Copy env file
docker exec -it laravel-app php artisan key:generate  # Generate app key
docker exec -it laravel-app php artisan migrate --seed  # Run migrations + seed
docker exec -it laravel-app php artisan storage:link    # Recreate storage symlink
```


# ⚠️ NOTE
# The "public/storage" symlink is NOT included in the repo (Windows cannot compress symlinks).
# Make sure to run the last command:
#   docker exec -it laravel-app php artisan storage:link
# after the container is up, otherwise uploaded files won’t be accessible.

## 6. React setup

The React container already runs the development server with:

```bash
npm run dev
```

ℹ️ Any code changes in **`react-part/`** will automatically reload in the browser.


you should see something like this 

<img width="1343" height="641" alt="image" src="https://github.com/user-attachments/assets/f84a6e50-6276-4edb-8956-5d921b75b8ae" />

