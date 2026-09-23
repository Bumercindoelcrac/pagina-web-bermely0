"""Genera index.html autocontenido (CSS + JS + datos embebidos). Ejecuta: python3 build.py"""
import re
h=open("index.src.html").read(); css=open("styles.css").read(); js=open("app.js").read()
js=js.replace("__MENU__",open("menu.json").read()).replace("__DIA__",open("menu-del-dia.json").read())
h=h.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+css+'\n</style>')
h=h.replace('<script src="app.js"></script>','<script>\n'+js+'\n</script>')
open("index.html","w").write(h); print("index.html generado")
