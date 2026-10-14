#!/data/data/com.termux/files/usr/bin/bash

CRED="$HOME/.unal_credenciales"

if [ -f "$CRED" ]; then
  . "$CRED"
fi

export UNAL_USER UNAL_PASS

sleep 4

python "$HOME/unal_wifi_login.py" "$@" 2>> "$HOME/unal_wifi.log"
