# Инструкция настройки Nginx для подключения к серверу по кнопке:

1. Скачайте файл [index.php](https://github.com/Armatura-Create/bot-monitoring-cs2/tree/main/nginx/index.php)
2. Переместите файл index.php в корень сайта или куда вам удобно

### Обновите конфигурацию Nginx:

#### with SSL

```
server {
    listen 80;
    server_name <domain.name>;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name <domain.name>;

    root </path/to/your/file/location>;
    index index.php;

    error_log /var/log/nginx/connect_error.log;
    access_log /var/log/nginx/connect_access.log;

    ssl_certificate </path/ssl/cert.pem>;
    ssl_certificate_key </path/ssl/privkey.pem>;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php<VERSION>-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

#### without SSL

```
server {
    listen 80;
    server_name <domain.name>;

    root </path/to/your/file/location>;
    index index.php;

    error_log /var/log/nginx/connect_error.log;
    access_log /var/log/nginx/connect_access.log;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php<VERSION>-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

3. Замените `<domain.name>` на ваш домен
4. Замените `</path/to/your/file/location>` на путь к файлу index.php
5. Замените `</path/ssl/cert.pem>` и `</path/ssl/privkey.pem>` на путь к вашему SSL сертификату и приватному ключу

## Проверка и перезапуск Nginx:
#### Проверьте конфигурацию Nginx на наличие ошибок:
```bash
sudo nginx -t
```
#### Если ошибок нет, перезапустите Nginx для применения новых настроек:
```bash
sudo systemctl restart nginx
```

## Праивльно впишите данные в config.json:
```json
{
  ...
  "buttons": {
    "connect": {
      "active": true,
      "url": "https://<domain.name>?ip=127.0.0.1:27015" //или http://<domain.name>?ip=127.0.0.1:27015
    }
  },
  ...
}
```

# !!!Важно
### Вписывать ?ip=ip:port вашего сервера а не домена по которому можно присоединится
