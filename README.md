# Ber-Mely · Carta digital

Página estática (HTML + CSS + JS), lista para GitHub Pages.

## Estructura
```
index.html          → página FINAL (autocontenida, es la que se publica)
index.src.html      → plantilla fuente
build.py            → regenera index.html: python3 build.py
styles.css          → estilos
app.js              → lógica (carta, carrito, WhatsApp, menú del día)
menu.json           → carta completa (categorías → subcategorías → platillos)
menu-del-dia.json   → menú del día (se edita a diario)
images/             → fotos
```

## Publicar en GitHub Pages
1. Crea un repo (ej. `bermely`) y sube todos los archivos.
2. Settings → Pages → Branch `main` / carpeta `/root` → Save.
3. Tu página quedará en `https://TU_USUARIO.github.io/bermely/`.

## Cambiar el menú del día
Edita **`menu-del-dia.json`** en GitHub (lápiz ✏️ → Commit). Reglas:
- Cada tiempo puede tener las opciones que quieras (2, 3, 4…).
- Tiempos con `"incluido": true` (sopa, arroz) **no se cobran**; se escriben como lista de textos.
- El tiempo con `"incluido": false` (guisado) es **obligatorio** y su precio es el total.
- No se escribe qué agua ni postre: la página solo dice "Incluye agua del día".
```json
{
 "fecha": "2026-09-22",
 "horario": "Lunes a viernes · 12:30 PM a 5:00 PM",
 "tiempos": [
  {"nombre": "Sopa", "incluido": true, "opciones": ["Consomé de pollo", "Crema de elote"]},
  {"nombre": "Arroz o pasta", "incluido": true, "opciones": ["Arroz rojo", "Ensalada dulce", "Espagueti"]},
  {"nombre": "Guisado", "incluido": false, "opciones": [
    {"nombre": "Bistec a la mexicana", "precio": 139},
    {"nombre": "Milanesa de res", "precio": 135}]}
 ]
}
```
La página lo lee en cada visita (sin caché). Si prefieres tenerlo en **otro repo o URL**, cambia
`MENU_DIA_URL` al inicio de `app.js` por la URL *raw*, por ejemplo:
`https://raw.githubusercontent.com/TU_USUARIO/bermely/main/menu-del-dia.json`

También puedes probar cualquier URL sin tocar código: `index.html?dia=https://.../otro.json`

## Cambiar precios o platillos
Edita `menu.json`. Cada platillo es `{"nombre": "...", "precio": 99}`.

## WhatsApp
Número principal en `app.js` → `const WHATSAPP = "525537317794"`.

## Iconos
Los iconos se cargan desde la **API de Iconify** (`code.iconify.design`), más de 200 000 iconos exactos. Para cambiar uno, busca su nombre en https://icon-sets.iconify.design/ y ponlo en el campo `"icono"` de `menu.json` (categoría o subcategoría) o del menú del día.

## Si editas estilos o código
`index.html` lleva todo integrado para que funcione en cualquier lado. Si cambias `styles.css`, `app.js`
o `index.src.html`, vuelve a generar con `python3 build.py`. Si **solo** cambias los JSON del menú no hace falta:
la página los lee en vivo desde GitHub.

## Cargo por empaque (recoger / domicilio)
Al inicio de `app.js`:
```js
const FEE_DEFAULT = 10;   // $ por platillo
const FEE_LIGHT   = 5;    // $ por platillo en estas categorías
const FEE_LIGHT_CATS = ["Cafetería", "La Crepería", "Bebidas"];
```
Solo se aplica cuando el modo del carrito es "Para recoger" o "A domicilio". Al comer aquí no se cobra.
Si cambias estos valores, actualiza también la leyenda en `index.src.html` y corre `python3 build.py`.

## Ubicación y distancia
La página pide permiso de ubicación al abrir (si el usuario acepta, muestra a cuántos km está y una ruta en el mapa).
Las coordenadas del restaurante están al inicio de `app.js`:
```js
const REST = { lat: 19.297633, lng: -99.0220159, ... };  // ya son las exactas de Google Maps
```
Para afinarlas: clic derecho en el punto exacto en Google Maps → copiar coordenadas → pegar → `python3 build.py`.
Nota: la geolocalización solo funciona en HTTPS (GitHub Pages ya lo es).
