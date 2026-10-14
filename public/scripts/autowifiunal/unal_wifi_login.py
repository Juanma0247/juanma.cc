#!/usr/bin/env python3

import html
import os
import re
import socket
import sys
import time
from urllib.parse import urljoin, urlparse

import requests
import urllib3
from requests.adapters import HTTPAdapter

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

USUARIO = os.environ.get("UNAL_USER", "")
CLAVE = os.environ.get("UNAL_PASS", "")
IFACE = os.environ.get("UNAL_IFACE", "wlan0")
DOMINIO = os.environ.get("UNAL_DOMINIO", "unal.edu.co")
TLS_ESTRICTO = os.environ.get("UNAL_TLS_ESTRICTO") == "1"

URL_204 = "http://connectivitycheck.gstatic.com/generate_204"
URL_HTTP = "http://neverssl.com/"
REINTENTOS = 10
ESPERA = 3
LOG = os.path.expanduser("~/unal_wifi.log")
DEBUG = "--debug" in sys.argv


def log(msg):
    linea = time.strftime("%Y-%m-%d %H:%M:%S ") + msg
    print(linea, flush=True)
    try:
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(linea + "\n")
    except OSError:
        pass


class Detener(Exception):
    pass


class AdaptadorWifi(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        opciones = list(urllib3.connection.HTTPConnection.default_socket_options)
        opciones.append((socket.SOL_SOCKET, getattr(socket, "SO_BINDTODEVICE", 25),
                         IFACE.encode()))
        kwargs["socket_options"] = opciones
        super().init_poolmanager(*args, **kwargs)


def nueva_sesion(por_wifi):
    s = requests.Session()
    if por_wifi:
        s.mount("http://", AdaptadorWifi())
        s.mount("https://", AdaptadorWifi())
    return s


def elegir_sesion():
    s = nueva_sesion(True)
    try:
        s.get(URL_204, allow_redirects=False, timeout=6)
        log(f"Tráfico forzado por {IFACE}.")
        return s
    except requests.RequestException as e:
        log(f"No se pudo forzar {IFACE} ({e.__class__.__name__}); se usa la red por defecto. "
            "Si falla, apaga los datos móviles al conectarte.")
        return nueva_sesion(False)


def hay_internet(s):
    try:
        r = s.get(URL_204, allow_redirects=False, timeout=6)
        return r.status_code == 204
    except requests.RequestException:
        return False


def portal_permitido(url):
    host = (urlparse(url).hostname or "").lower()
    return host == DOMINIO or host.endswith("." + DOMINIO)


def portal_peticion(s, metodo, url, **kwargs):
    try:
        return s.request(metodo, url, verify=True, timeout=8, **kwargs)
    except requests.exceptions.SSLError:
        if TLS_ESTRICTO:
            raise Detener("certificado del portal no verificable y UNAL_TLS_ESTRICTO=1.")
        log("Aviso: no se pudo verificar el certificado del portal; se continúa sin verificar.")
        return s.request(metodo, url, verify=False, timeout=8, **kwargs)


def buscar_portal(s):
    for url in (URL_204, URL_HTTP):
        r = s.get(url, allow_redirects=False, timeout=8)
        if url == URL_204 and r.status_code == 204:
            return None
        destino = r.headers.get("Location", "")
        if "fgtauth" not in destino:
            m = re.search(r'https?://[^"\'\s<>]+/fgtauth\?[^"\'\s<>]+', r.text)
            destino = m.group(0) if m else ""
        if "fgtauth" in destino:
            return html.unescape(destino)
    return None


def leer_formulario(texto):
    campos = {}
    for etiqueta in re.findall(r"<input\b[^>]*>", texto, re.I):
        nombre = re.search(r'name\s*=\s*["\']?([^"\'\s>]+)', etiqueta, re.I)
        valor = re.search(r'value\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))', etiqueta, re.I)
        if nombre:
            v = ""
            if valor:
                v = next(g for g in valor.groups() if g is not None)
            campos[nombre.group(1)] = html.unescape(v)
    accion = re.search(r'<form\b[^>]*action\s*=\s*["\']?([^"\'\s>]+)', texto, re.I)
    return campos, (accion.group(1) if accion else "/")


def guardar_debug(texto, paso):
    if DEBUG:
        ruta = os.path.expanduser(f"~/unal_portal_{paso}.html")
        with open(ruta, "w", encoding="utf-8") as f:
            f.write(texto)
        log(f"HTML del paso {paso} guardado en {ruta}")


def pasar_portal(s, url_portal):
    if not portal_permitido(url_portal):
        raise Detener(f"el portal no pertenece a {DOMINIO}; no se envió nada.")
    magic = url_portal.split("?", 1)[1]
    r = portal_peticion(s, "GET", url_portal)

    for paso in range(1, 4):
        guardar_debug(r.text, paso)
        if not portal_permitido(r.url):
            break
        campos, accion = leer_formulario(r.text)
        if not campos:
            break

        campos.setdefault("magic", magic)
        campos.setdefault("4Tredir", URL_HTTP)

        if "username" in campos or "password" in campos:
            if not USUARIO or not CLAVE:
                raise Detener("el portal pide usuario y contraseña pero no están configurados "
                              "(revisa ~/.unal_credenciales).")
            campos["username"] = USUARIO
            campos["password"] = CLAVE
            log(f"Paso {paso}: enviando usuario y contraseña.")
        else:
            campos["answer"] = "1"
            log(f"Paso {paso}: aceptando los términos (answer=1).")

        destino = urljoin(r.url, accion)
        if not portal_permitido(destino):
            raise Detener(f"el formulario apunta fuera de {DOMINIO}; no se envió.")
        r = portal_peticion(s, "POST", destino, data=campos)
        log(f"Paso {paso}: respuesta HTTP {r.status_code}")

        if "username" in campos and re.search(r'name\s*=\s*["\']?password', r.text, re.I):
            raise Detener("el portal rechazó el usuario o la contraseña (revisa ~/.unal_credenciales).")
        if "keepalive" in r.url or "keepalive" in r.text:
            break

    time.sleep(2)
    return hay_internet(s)


def main():
    log("---- inicio ----")
    s = elegir_sesion()
    for intento in range(1, REINTENTOS + 1):
        try:
            portal = buscar_portal(s)
            if portal is None:
                if hay_internet(s):
                    log("Ya hay internet; no hay nada que hacer.")
                    return 0
                log(f"Intento {intento}: sin internet y sin portal todavía.")
            else:
                log(f"Intento {intento}: portal detectado -> {portal.split('?')[0]}")
                if pasar_portal(s, portal):
                    log("Conectado al WiFi de la UNAL.")
                    return 0
                log("Se envió el formulario pero aún no hay internet.")
        except Detener as e:
            log(f"Se detiene: {e}")
            return 1
        except requests.RequestException as e:
            log(f"Intento {intento}: la red aún no responde ({e.__class__.__name__}).")
        time.sleep(ESPERA)
    log("No se logró conectar.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
