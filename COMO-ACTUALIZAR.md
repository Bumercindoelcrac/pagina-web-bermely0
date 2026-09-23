# Cómo actualizar el menú del día y los precios (Netlify + GitHub)

## Idea general
La página NO tiene los precios "pegados": los lee de dos archivos de texto.

| Archivo | Qué controla | Cada cuándo se edita |
|---|---|---|
| `menu-del-dia.json` | Sopa, arroz y guisados de hoy, con sus precios | Diario |
| `menu.json` | Toda la carta (177 platillos) y sus precios | Cuando cambie algo |

Si Netlify está conectado a GitHub, **editar el archivo en GitHub = actualizar la página**.
Netlify detecta el cambio y vuelve a publicar solo, en 20–40 segundos. No hay que subir nada a mano.

---

## Configuración (una sola vez, 5 minutos)

1. Crea una cuenta en https://github.com y un repositorio nuevo, por ejemplo `bermely`.
2. Sube TODOS los archivos de esta carpeta (arrastra la carpeta completa en "uploading an existing file"). Incluye la carpeta `images/`.
3. En https://app.netlify.com → **Add new site → Import an existing project → GitHub** → elige el repositorio `bermely`.
4. Deja *Build command* vacío y *Publish directory* en `.` (el archivo `netlify.toml` ya lo configura). Clic en **Deploy**.
5. Netlify te da una dirección tipo `https://bermely.netlify.app`. Puedes cambiar el nombre en *Site configuration → Change site name*, o conectar tu dominio propio.

Listo. Desde ahora, cada cambio en GitHub se publica solo.

---

## Cambiar el menú del día (todos los días, 1 minuto, desde el celular)

1. Abre la app de **GitHub** en el teléfono (o github.com) → tu repositorio → `menu-del-dia.json`.
2. Toca el lápiz ✏️ (Editar).
3. Cambia la fecha, las opciones y los precios. Ejemplo:

```json
{
 "fecha": "2026-09-22",
 "horario": "Lunes a viernes · 12:30 PM a 5:00 PM",
 "tiempos": [
  {"nombre": "Sopa", "incluido": true,
   "opciones": ["Consomé de pollo", "Crema de zanahoria"]},
  {"nombre": "Arroz o pasta", "incluido": true,
   "opciones": ["Arroz rojo", "Espagueti a la crema", "Ensalada dulce"]},
  {"nombre": "Guisado", "incluido": false,
   "opciones": [
     {"nombre": "Bistec a la mexicana", "precio": 139},
     {"nombre": "Pechuga empanizada", "precio": 146},
     {"nombre": "Chiles rellenos de queso", "precio": 120}
   ]}
 ]
}
```

4. Toca **Commit changes** (Guardar). En menos de un minuto la página ya muestra el menú nuevo.

Reglas:
- Puedes poner 2, 3, 4… opciones en cada tiempo.
- Sopa y arroz llevan `"incluido": true` y solo el nombre entre comillas.
- El guisado lleva `"incluido": false` y cada opción con `"nombre"` y `"precio"`.
- Cuidado con las comas: cada elemento se separa con coma, el último de la lista NO lleva coma.
- Si te equivocas en una coma, la página muestra el último menú que sí funcionó (no se rompe). Puedes validar el texto en https://jsonlint.com antes de guardar.

---

## Cambiar precios de la carta

1. GitHub → `menu.json` → ✏️.
2. Usa Ctrl+F (o "buscar") para encontrar el platillo, por ejemplo `"Café americano"`.
3. Cambia el número del `"precio"`. Para agregar un platillo, copia una línea y edítala:

```json
{"nombre": "Café americano", "precio": 46},
{"nombre": "Café con canela", "precio": 50},
```

4. **Commit changes**. Listo.

---

## ¿Y si no uso GitHub y solo arrastro la carpeta a Netlify (Netlify Drop)?
Funciona, pero cada cambio de precio o menú del día obliga a volver a arrastrar la carpeta.
Para que sea automático, la ruta es GitHub → Netlify como se explica arriba.

## Cambiar textos, fotos o colores
Eso está en `index.src.html`, `styles.css` y `app.js`. Después de editarlos hay que ejecutar
`python3 build.py` (genera `index.html`) y subir el resultado. Para menú y precios NO hace falta.
