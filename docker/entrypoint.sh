#!/bin/bash

cd /home/container

exit_handler() {
    log_message "Stopping all processes..." "running"
    pkill -P $$  # Убиваем все дочерние процессы
    exit 0
}

trap 'exit_handler' SIGINT SIGTERM

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
WHITE='\033[0;37m'
NC='\033[0m'

PREFIX="${RED}[Armatura]${WHITE} > "

log_message() {
  local message="$1"
  local type="$2"

  message=$(echo -n "$message")

  case $type in
    running)
      printf "${PREFIX}${YELLOW}%s${NC}\n" "$message"
      ;;
    error)
      printf "${PREFIX}${RED}%s${NC}\n" "$message"
      ;;
    success)
      printf "${PREFIX}${GREEN}%s${NC}\n" "$message"
      ;;
    debug)
      printf "${PREFIX}${WHITE}[DEBUG] %s${NC}\n" "$message"
      ;;
    *)
      printf "${PREFIX}${WHITE}%s${NC}\n" "$message"
      ;;
  esac
}

RELEASE_URL="https://github.com/Armatura-Create/bot-monitoring-cs2/releases/latest/download/discord-monitoring-bot.zip"
GITHUB_API_URL="https://api.github.com/repos/Armatura-Create/bot-monitoring-cs2/releases/latest"
VERSION_FILE="version.txt"
CONFIG_FILE="config.json"
TEMP_DIR="tmp/"
TEMP_DIR_UPDATE="tmp/bot_update"
ARCHIVE_NAME="discord-monitoring-bot.zip"

check_dependencies() {
    log_message "Checking dependencies..." "running"
    for cmd in curl unzip npm; do
        if ! command -v $cmd &>/dev/null; then
            log_message "Error: $cmd is not installed. Please install it first." "error"
            exit 1
        fi
    done
}

download_archive() {
    log_message "Downloading the latest release..." "running"
    if ! curl -L "$RELEASE_URL" -o "$ARCHIVE_NAME"; then
        log_message "Failed to download the release." "error"
        exit 1
    fi
}

unpack_archive() {
    log_message "Unpacking the release..." "running"
    
    if [ ! -d "$TEMP_DIR_UPDATE" ]; then
        mkdir -p "$TEMP_DIR_UPDATE"
    fi

    if ! unzip -o "$ARCHIVE_NAME" -d "$TEMP_DIR_UPDATE"; then
        log_message "Failed to unpack the archive." "error"
        exit 1
    fi
}

move_to_install_dir() {
    log_message "Moving files to install directory..." "running"

    # Удаляем старые файлы перед копированием, кроме config.json
    find . -maxdepth 1 ! -name 'config.json' -type f -exec rm -rf {} \;

    # Перемещаем файлы из временной директории в рабочую директорию
    cp -r $TEMP_DIR_UPDATE/* .

    log_message "Files moved to install directory." "success"
}

install_dependencies() {
    log_message "Installing dependencies..." "running"
    cd bot
    if ! npm install --production; then
        log_message "Failed to install dependencies." "error"
        exit 1
    fi
    cd ..
}

restore_config() {
    if [ -f "$TEMP_DIR/config_save.json" ]; then
        log_message "Restoring config.json..." "running"
        cp "$TEMP_DIR/config_save.json" "$CONFIG_FILE"
    fi
}

save_config() {
    if [ -f "$CONFIG_FILE" ]; then
        log_message "Saving config.json..." "running"
        cp "$CONFIG_FILE" "$TEMP_DIR/config_save.json"
    fi
}

write_version() {
    local version="$1"
    echo "$version" > "$VERSION_FILE"
}

get_latest_version() {
    local latest_version
    latest_version=$(curl -s "$GITHUB_API_URL" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
    
    if [ -z "$latest_version" ]; then
        log_message "Error fetching the latest version." "error"
        exit 1
    fi

    echo "$latest_version"
}

check_version() {
    local latest_version
    latest_version=$(get_latest_version)

    if [ -f "$VERSION_FILE" ]; then
        local current_version
        current_version=$(cat "$VERSION_FILE")
        if [ "$current_version" == "$latest_version" ]; then
            log_message "Latest version ($latest_version) is already installed." "success"
            return 1
        else
            log_message "New version available: $latest_version" "running"
            return 0
        fi
    else
        log_message "No version file found. Proceeding with installation." "running"
        return 0
    fi
}

check_dependencies

if check_version; then
    save_config

    download_archive
    unpack_archive

    move_to_install_dir

    restore_config

    install_dependencies

    write_version "$(get_latest_version)"

    log_message "Cleaning up..." "running"
    rm -rf "$TEMP_DIR_UPDATE"
    rm -f "$ARCHIVE_NAME"
fi

log_message "Starting the bot..." "running"
cd bot

# Запускаем npm без exec, чтобы можно было обработать сигнал в родительском процессе
npm run start &  # Запускаем в фоне

# Ожидание завершения процесса
wait $!
