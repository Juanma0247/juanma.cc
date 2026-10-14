#!/data/data/com.termux/files/usr/bin/bash

set -e

ORIGEN="$(cd "$(dirname "$0")" && pwd)"

PY="$(ls -t "$ORIGEN"/unal_wifi_login*.py 2>/dev/null | head -n 1)"
SH="$(ls -t "$ORIGEN"/unal*.sh 2>/dev/null | head -n 1)"

if [ -z "$PY" ] || [ -z "$SH" ]; then
  echo "No encontré unal_wifi_login.py y unal.sh en $ORIGEN"
  echo "Descárgalos en la misma carpeta que este instalador."
  exit 1
fi

echo "[1/6] Actualizando los paquetes de Termux..."
pkg update -y
apt-get -y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold upgrade

echo "[2/6] Instalando Python..."
pkg install -y --no-install-recommends python python-pip

echo "[3/6] Instalando la librería requests..."
pip install --disable-pip-version-check requests \
  || pip install --disable-pip-version-check --break-system-packages requests

echo "[4/6] Copiando los scripts..."
cp "$PY" "$HOME/unal_wifi_login.py"
mkdir -p "$HOME/.termux/tasker"
chmod 700 "$HOME/.termux/tasker"
cp "$SH" "$HOME/.termux/tasker/unal.sh"
chmod 700 "$HOME/.termux/tasker/unal.sh"

echo "[5/6] Guardando tus credenciales UNAL..."
read -r -p "Usuario UNAL (sin @unal.edu.co): " USUARIO
USUARIO="${USUARIO%@unal.edu.co}"
read -r -s -p "Contraseña UNAL (no se verá al escribir): " CLAVE
echo
umask 077
printf 'UNAL_USER=%q\nUNAL_PASS=%q\n' "$USUARIO" "$CLAVE" > "$HOME/.unal_credenciales"
chmod 600 "$HOME/.unal_credenciales"

echo "[6/6] Verificando..."
python -c "import requests" && echo "  requests: OK"
python -m py_compile "$HOME/unal_wifi_login.py" && echo "  script: OK"
ls -l "$HOME/.termux/tasker/unal.sh"

echo
echo "Listo. Configura la macro en MacroDroid con el ejecutable: unal.sh"
echo "Registro de cada conexión: cat ~/unal_wifi.log"
