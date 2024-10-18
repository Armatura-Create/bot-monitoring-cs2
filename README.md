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

# Discord Monitoring Bot for CS2

 This bot allows monitoring of multiple game servers, providing information about the server status, map, and players. It also allows for flexible configuration of the bot's appearance and behavior, including map images and online player stats.

<hr />

## Features

- Flexible display configuration: Customize the bot's appearance, including server name, map, and player details.
- Automatic map image fetching: The bot can pull map images either from the bot's storage or from external URLs.
- Real-time stats: Get live server information including player count and server status.
- Player statistics: Track player stats like score and playtime.
- Configurable buttons: Add connect buttons, player stat and online statistic buttons to your messages.
- Multi\-server support: Monitor multiple servers with a single bot.

<hr />

# Installation

## Installation via Systemd

### Download the latest release from the [releases page](https://github.com/Armatura-Create/bot-monitoring-cs2/releases): 
```bash
cd /path/to/your/bot
wget https://github.com/Armatura-Create/bot-monitoring-cs2/releases/latest/download/discord-monitoring-bot.zip
```
### Unzip the downloaded archive:
```bash
unzip discord-monitoring-bot.zip
```

### Install dependencies:
```bash
cd bot/
npm install --production
```

### Create a systemd service: Create a new systemd service file:
```bash
sudo nano /etc/systemd/system/discord-monitoring-bot.service
```
#### Add the following content to the file:
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

### Start the service:
```bash
sudo systemctl enable cs2-monitoring-bot
sudo systemctl start cs2-monitoring-bot
```

### Check the status:
```bash
sudo systemctl status cs2-monitoring-bot
```

## Installation via Pterodactyl/Pelican Egg

#### Download the Egg: Download the provided egg file [egg_pterodactyl_bot.json](https://github.com/Armatura-Create/bot-monitoring-cs2/blob/main/egg_pterodactyl_bot.json) or [egg_pelican_bot.json](https://github.com/Armatura-Create/bot-monitoring-cs2/blob/main/egg_pelican_bot.json) and upload it to your Pterodactyl / Pelican panel under Nests / Eggs > Import Egg.

#### Create a new server: When creating a new server, choose the imported egg as the base and adjust the settings as required, such as memory (128MiB), CPU (30%), and disk (512 MiB) allocation.

<hr />

## Configuration

Below is a sample configuration that allows you to monitor multiple servers, customize the bot’s appearance, and control its behavior:

```json
{
    "debug": true,
    "bot_token": "",
    "update_interval": 60,
    "compact": false,
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

### Configurations Breakdown:

- ```debug```: Enables or disables debug mode (true or false).
- ```bot_token```: Your Discord bot token.
- ```update_interval```: Time in seconds between server status updates.
- ```compact```: Enables compact mode (true or false).
- ```compact_config```: Configuration for compact mode.
  - ```message_id```: The ID of the message where server updates are posted (if not set - generate auto).
  - ```color```: The color of the embed message.
  - ```image_author```: URL of the author's image (optional).
  - ```footer```: Information for the footer of the embed message.
    - ```icon```: URL of the footer icon (opional).
- ```use_plugin```: Enables plugin features if set to true (In plans plugin for detail player statistic).
- ```locale```: The language locale for the bot (e.g., en-US, ru-RU).
- ```channel_id```: The Discord channel ID where the bot will post updates.
- ```time_zone```: Timezone for the bot (e.g., UTC, Europe/Kiev).
- ```servers```: An array of server objects where each server can have its own configuration.
  - ```server_name```: The name of the server (optional, if not set - bot get name by server auto).
  - ```url```: The URL to your website (optional).
  - ```message_id```: The ID of the message where server updates are posted (if not set - generate auto).
  - ```color```: The color of the embed message.
  - ```ip_port```: The IP address and port of the server.
  - ```image_author```: URL of the author's image (optional).
  - ```image_thumbnail```: URL of the thumbnail image for the server (optional).
  - ```map_settings```: Configuration for the map image.
    - ```active```: Whether map images are active.
    - ```image```: The URL of the map image (if empty - bot try set image by name map).
  - ```footer```: Information for the footer of the embed message.
    - ```icon```: URL of the footer icon.
  - ```buttons```: Configuration for buttons within the embed.
    - ```connect```: A button to connect to the server. [INSTRUCTIONS](https://github.com/Armatura-Create/bot-monitoring-cs2/tree/main/nginx/README.md)
    - ```players```: A button to show player stats on server.
    - ```online_stats```: A button to display server online statistics.

<hr />

## Usage

Once the bot is configured and running, it will automatically post updates about your servers. You can customize the bot's behavior through the configuration file or environment variables.

- <b>Buttons</b>: Include buttons to connect to the server or show player statistics.
- <b>Real-time stats</b>: Server player statistics are updated in real-time at the interval specified in the configuration.

# Preview

<img width="540" alt="image" src="https://github.com/user-attachments/assets/aab4705f-a412-4025-b1fe-1f1c29aefac0">
<img width="538" alt="image" src="https://github.com/user-attachments/assets/45306480-dfb2-4e56-98c0-5f17d000b31d">


# 🆘 Find bug? Report it!

- [GitHub Issues](https://github.com/Armatura-Create/bot-monitoring-cs2/issues)
