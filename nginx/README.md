# Nginx Setup Instructions for Server Connection Button:

1. Download the [index.php](https://github.com/Armatura-Create/bot-monitoring-cs2/tree/main/nginx/index.php) file.
2. Move the `index.php` file to your website's root directory or another preferred location.

### Update Nginx Configuration:

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

3. Replace `<domain.name>` with your actual domain name.
4. Replace `</path/to/your/file/location>` with the path to your `index.php` file.
5. Replace `</path/ssl/cert.pem>` and `</path/ssl/privkey.pem>` with the path to your SSL certificate and private key.

## Check and Restart Nginx:

#### Test Nginx Configuration for Errors:
```bash
sudo nginx -t
```
#### If no errors are found, restart Nginx to apply the new settings:
```bash
sudo systemctl restart nginx
```

## Correctly Input Data in config.json:
```json
{
  ...
  "buttons": {
    "connect": {
      "active": true,
      "url": "https://<domain.name>?ip=127.0.0.1:27015" // or http://<domain.name>?ip=127.0.0.1:27015
    }
  },
  ...
}
```

# !!!Important:
### Make sure to input `?ip=ip:port` of your server, not the domain through which the connection is established.
