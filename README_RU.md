<div align="center">

[<kbd><br>🌐 Русский README<br><br></kbd>](./README_RU.md)

[<kbd><br>🌐 English README<br><br></kbd>](./README.md)

</div>

<p align="center">
   <a href="https://github.com/Armatura-Create/bot-monitoring-cs2/releases">
        <img src="https://img.shields.io/github/release/Armatura-Create/bot-monitoring-cs2.svg" alt="Latest release" />
    </a>
  &nbsp;
</p>

# Бот для мониторинга CS2 серверов в Discord

Этот бот позволяет отслеживать несколько игровых серверов, предоставляя информацию о состоянии сервера, карте и игроках. Также позволяет гибко настраивать внешний вид и поведение бота, включая изображения карт и статистику онлайн игроков.

<hr />

## Возможности

- Гибкая настройка отображения: настройка внешнего вида бота, включая имя сервера, карту и данные об игроках.
- Автоматическая загрузка изображений карт: бот может подгружать изображения карт из собственного хранилища или по внешним ссылкам.
- Статистика в реальном времени: получение актуальной информации о состоянии сервера и количестве игроков.
- Статистика игроков: отслеживание статистики игроков, такой как счет и время игры.
- Настраиваемые кнопки: добавление кнопок для подключения к серверу, отображения статистики игроков и статистики онлайна.
- Поддержка нескольких серверов: мониторинг нескольких серверов с помощью одного бота.

<hr />

# Установка

## Установка через Systemd

### Скачайте последнюю версию с [страницы релизов](https://github.com/Armatura-Create/bot-monitoring-cs2/releases):
```bash
cd /path/to/your/bot
wget https://github.com/Armatura-Create/bot-monitoring-cs2/releases/latest/download/discord-monitoring-bot.zip
```
### Распакуйте скачанный архив:
```bash
unzip discord-monitoring-bot.zip
```

### Установите зависимости:
```bash
cd bot/
npm install --production
```

### Создайте systemd службу: создайте новый файл службы systemd:
```bash
sudo nano /etc/systemd/system/discord-monitoring-bot.service
```
#### Добавьте следующее содержимое в файл:
```bash
[Unit]
Description=Discord Monitoring Bot for CS2
After=network.target

[Service]
ExecStart=/usr/bin/node </path/to/bot/index.js>
WorkingDirectory=</path/to/bot>
Restart=always
User=yourusername
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Запустите службу:
```bash
sudo systemctl enable cs2-monitoring-bot
sudo systemctl start cs2-monitoring-bot
```

### Проверьте статус:
```bash
sudo systemctl status cs2-monitoring-bot
```

## Установка через Pterodactyl/Pelican Egg

#### Скачайте Egg: Скачайте подготовленный egg файл [egg_pterodactyl_bot.json](https://github.com/Armatura-Create/bot-monitoring-cs2/blob/main/egg_pterodactyl_bot.json) или [egg_pelican_bot.json](https://github.com/Armatura-Create/bot-monitoring-cs2/blob/main/egg_pelican_bot.json) и загрузите его в вашу панель Pterodactyl / Pelican в разделе Nests / Eggs > Import Egg.

#### Создайте новый сервер: при создании нового сервера выберите импортированный egg в качестве основы и настройте параметры, такие как память (128MiB), процессор (30%) и объем диска (512 MiB).

<hr />

## Конфигурация

Ниже приведен пример конфигурации, позволяющий мониторить несколько серверов, настраивать внешний вид бота и управлять его поведением:

```json
{
  "debug": true,
  "bot_token": "",
  "update_interval": 60,
  "compact_config": {
    "message_id": "",
    "color": "#FFFFFF",
    "image_author": "",
    "footer": {
      "icon": ""
    }
  },
  "use_plugin": false,
  "locale": "en-US",
  "channel_id": "",
  "time_zone": "UTC",
  "servers": [
    {
      "server_name": "Server Name",
      "url": "https://site.com/",
      "message_id": "",
      "color": "#FFFFFF",
      "ip_port": "127.0.0.1:27015",
      "image_author": "",
      "image_thumbnail": "",
      "show_status": true,
      "map_settings": {
        "active": false,
        "image": ""
      },
      "footer": {
        "icon": ""
      },
      "buttons": {
        "connect": {
          "active": false,
          "url": "https://site.com/"
        },
        "players": {
          "active": false
        },
        "online_stats": {
          "active": false
        }
      }
    }
  ]
}
```

### Объяснение конфигурации:

- ```debug```: Включение или отключение режима отладки (true или false).
- ```bot_token```: Токен вашего бота Discord.
- ```update_interval```: Интервал времени в секундах между обновлениями статуса сервера.
- ```compact_config```: Конфигурация для компактного режима.
    - ```message_id```: ID сообщения, в котором публикуются обновления сервера (если не указано - создается автоматически).
    - ```color```: Цвет сообщения embed.
    - ```image_author```: URL изображения автора (опционально).
    - ```footer```: Информация для нижней части сообщения embed.
        - ```icon```: URL иконки в нижней части сообщения (опционально).
- ```use_plugin```: Включение плагина для расширенных возможностей (например, плагин для детальной статистики игроков).
- ```locale```: Языковая локаль для бота (например, en-US, ru-RU).
- ```channel_id```: ID канала Discord, в который бот будет отправлять обновления.
- ```time_zone```: Часовой пояс для бота (например, UTC, Europe/Kiev).
- ```servers```: Массив серверов, каждый из которых имеет свою конфигурацию.
    - ```server_name```: Имя сервера (опционально, если не указано, бот автоматически получает имя сервера).
    - ```url```: URL вашего сайта (опционально).
    - ```message_id```: ID сообщения, в которое отправляются обновления сервера (если не указано - генерируется автоматически).
    - ```color```: Цвет сообщения embed.
    - ```ip_port```: IP-адрес и порт сервера.
    - ```image_author```: URL изображения автора (опционально).
    - ```image_thumbnail```: URL миниатюры для сервера (опционально).
    - ```show_status```: Отображение статуса сервера (true или false).
    - ```map_settings```: Настройки изображения карты.
        - ```active```: Включено ли отображение изображений карт.
        - ```image```: URL изображения карты (если не указано, бот попробует установить изображение по названию карты).
    - ```footer```: Информация для нижней части сообщения embed.
        - ```icon```: URL иконки в нижней части сообщения.
    - ```buttons```: Настройки кнопок в сообщении embed.
        - ```connect```: Кнопка для подключения к серверу. [ИНСТРУКЦИЯ](https://github.com/Armatura-Create/bot-monitoring-cs2/tree/main/nginx/README_RU.md)
        - ```players```: Кнопка для отображения статистики игроков на сервере.
        - ```online_stats```: Кнопка для отображения статистики онлайна на сервере.

<hr />

## Использование

После настройки и запуска бот автоматически будет публиковать обновления о ваших серверах. Вы можете настраивать поведение бота через файл конфигурации или переменные окружения.

- <b>Кнопки</b>: включают кнопки для подключения к серверу или отображения статистики игроков.
- <b>Статистика в реальном времени</b>: статистика игроков обновляется в реальном времени с заданным интервалом в конфигурации.

# Превью

<img width="540" alt="image" src="https://github.com/user-attachments/assets/aab4705f-a412-4025-b1fe-1f1c29aefac0">
<img width="538" alt="image" src="https://github.com/user-attachments/assets/45306480-dfb2-4e56-98c0-5f17d000b31d">


# 🆘 Нашли ошибку? Сообщите!

- [GitHub Issues](https://github.com/Armatura-Create/bot-monitoring-cs2/issues)
