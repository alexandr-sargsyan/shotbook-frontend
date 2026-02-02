# Инструкция по развертыванию Frontend

## Сборка проекта

```bash
npm run build
```

Результат сборки будет в папке `build/`

## Настройка веб-сервера (nginx)

Фронтенд должен быть доступен в корне сайта `/`

### Пример конфигурации nginx:

```nginx
server {
    listen 80;
    server_name 135.181.205.52;
    
    root /path/to/shotbook-frontend/build;
    index index.html;

    # Фронтенд (все запросы кроме /api и /admin идут на SPA)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Отключаем кеш для index.html
        location = /index.html {
            add_header Cache-Control "no-cache, must-revalidate";
        }
    }

    # API (проксирование на backend)
    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Админка (статические файлы)
    location /admin {
        alias /path/to/shotbook-admin-panel/build;
        try_files $uri $uri/ /admin/index.html;
        
        location = /admin/index.html {
            alias /path/to/shotbook-admin-panel/build/index.html;
            add_header Cache-Control "no-cache, must-revalidate";
        }
    }
}
```

## Важно

1. **SPA Routing**: `try_files $uri $uri/ /index.html` - все неизвестные пути перенаправляются на index.html
2. **API проксирование**: все запросы на `/api/*` проксируются на backend
3. **Отдельные сборки**: фронтенд и админка - это разные проекты с разными build папками

## Переменные окружения (.env)

Создайте файл `.env` перед сборкой:

```env
REACT_APP_API_URL=http://135.181.205.52/api
```

## После развертывания

1. Главная страница: `http://135.181.205.52/`
2. Детальная страница видео: `http://135.181.205.52/video/:id`
3. Профиль: `http://135.181.205.52/profile`
4. Коллекции: `http://135.181.205.52/collections`
5. Все страницы должны работать при прямом переходе и перезагрузке
6. Infinite scroll загружает следующие страницы при прокрутке вниз

## Проверка

После развертывания проверьте:
- Прямые переходы по URL работают (не 404)
- Перезагрузка страницы не ломает роутинг
- API запросы успешно проксируются на backend
- Infinite scroll подгружает следующие страницы
