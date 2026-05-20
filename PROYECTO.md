# PROYECTO — Landing Page Curso de Trading
> Documento de trabajo. Actualizar conforme avance el proyecto.

---

## RESUMEN DEL PROYECTO

Landing page de venta para un curso de trading (formato Hotmart). Entrada de tráfico principalmente desde redes sociales (Instagram/TikTok) via link, mayoría de visitas en **móvil**. El diseño debe sentirse como una red social — scroll fluido, animaciones suaves, video prominente — no como una página web tradicional.

---

## STACK TÉCNICO

| Qué | Cómo |
|-----|------|
| Framework | Next.js 16 (App Router) — ya inicializado |
| Lenguaje | TypeScript |
| Animaciones | **Framer Motion** (ya instalado) + **Lenis** (smooth scroll) |
| Estilos | CSS Variables + Tailwind 4 |
| Video | `<video>` nativo o embed YouTube/Vimeo |
| Deploy | **Vercel** (gratuito) + dominio propio |
| Dominio | Namecheap o Porkbun (~$10–15 USD/año para .com) |

---

## INFORMACIÓN PENDIENTE DEL CLIENTE

Estas preguntas hay que hacerle al cliente antes de construir:

### Contenido obligatorio
- [ ] ¿Cuál es el nombre oficial del curso?
- [ ] ¿Cuál es el nombre del instructor y su foto/bio corta?
- [ ] ¿Cuántos módulos tiene el curso y qué temas cubre cada uno?
- [ ] ¿Cuál es el precio actual y el precio tachado (si hay oferta)?
- [ ] ¿El link de Hotmart para el botón de compra?
- [ ] ¿Cuántos alumnos tiene? ¿Algún testimonio real?
- [ ] ¿Tiene logo o solo texto?

### Video
- [ ] ¿Tiene video de ventas grabado?
- [ ] ¿Es un video corto tipo VSL (Video Sales Letter) o más largo?
- [ ] ¿Lo sube él o lo subimos nosotros?

### Garantía
- [ ] ¿La garantía es de 30 o 90 días? (hay inconsistencia en el contenido actual)

### Branding
- [ ] ¿Colores preferidos o referencia visual? (ver imagen VisionTrade enviada)
- [ ] ¿Quiere mantener el estilo oscuro/dorado actual o cambiarlo?
- [ ] ¿Tiene fotos propias del instructor o del curso?

### Despliegue
- [ ] ¿Tiene dominio comprado? ¿Cuál quiere usar?
- [ ] ¿Tiene cuenta en Vercel o lo manejamos nosotros?

---

## DIRECCIÓN DE DISEÑO

### Concepto visual
- Fondo oscuro (negro/azul profundo)
- Tipografía bold y limpia
- Acentos: dorado **O** morado/azul (como VisionTrade — definir con cliente)
- Sensación de app nativa, no de página web

### UX Mobile-first
- Hero con video arriba del fold
- CTA fijo en la parte inferior de la pantalla (sticky bottom bar)
- Scroll revelado sección por sección (Framer Motion + Lenis)
- Sin menú complejo — una sola página lineal
- Botones grandes y fáciles de tocar

### Secciones sugeridas (orden de scroll)
1. **Hero** — Headline + subheadline + video VSL + CTA
2. **Social proof** — Contador de alumnos + rating/estrellas
3. **El problema** — ¿Por qué el 90% fracasa en trading?
4. **La solución** — Qué hace diferente este curso
5. **Curriculum** — Módulos con acordeón
6. **Instructor** — Foto + bio + credenciales
7. **Testimonios** — Cards o carrusel
8. **Garantía** — 30/90 días sin riesgo
9. **Precio + CTA final** — Precio tachado + precio real + botón grande
10. **FAQ** — Acordeón

---

## REFERENCIAS DE MOVIMIENTO (para mostrarle al cliente)

### Librerías
- **Framer Motion** — animaciones de entrada por scroll (`whileInView`)
- **Lenis** — scroll ultra suave, efecto premium
- **GSAP + ScrollTrigger** — si se necesita algo más complejo (parallax, pin sections)

### Sites de referencia para mostrar
- [linear.app](https://linear.app) — scroll muy suave, animaciones sutiles
- [framer.com](https://framer.com) — hero animado, transiciones
- [VisionTrade] — referencia visual enviada por el cliente

---

## TAREAS DEL PROYECTO

### Fase 1 — Definición (ESTA SEMANA)
- [ ] Recopilar info del cliente (ver sección arriba)
- [ ] Definir paleta de colores final
- [ ] Conseguir video del cliente
- [ ] Confirmar dominio

### Fase 2 — Desarrollo
- [ ] Instalar Lenis para smooth scroll
- [ ] Refactorizar page.tsx con secciones nuevas
- [ ] Definir CSS variables faltantes (`--ff-display`, `--ff-body`, `--black2`)
- [ ] Corregir inconsistencias actuales (garantía 30 vs 90 días, 6 vs 8 módulos)
- [ ] Implementar animaciones Framer Motion por scroll
- [ ] CTA sticky en mobile (barra inferior fija)
- [ ] Sección de Instructor
- [ ] Sección de Testimonios
- [ ] Optimizar video (lazy load / poster frame)

### Fase 3 — Deploy
- [ ] Configurar proyecto en Vercel
- [ ] Comprar dominio (Namecheap/Porkbun)
- [ ] Conectar dominio en Vercel
- [ ] Verificar velocidad mobile (Lighthouse > 80)
- [ ] Reemplazar link de Hotmart real

---

## BUGS CONOCIDOS (en el código actual)

| Prioridad | Bug |
|-----------|-----|
| 🔴 Alta | `HOTMART_LINK` es un placeholder — botón de compra no funciona |
| 🔴 Alta | Garantía dice 90 días en contador y 30 días en texto |
| 🟠 Media | Contador dice 8 módulos pero solo hay 6 en el array |
| 🟠 Media | Variables CSS `--ff-display`, `--ff-body`, `--black2` no definidas |
| 🟡 Baja | `framer-motion` instalado pero sin usar |
| 🟡 Baja | `INSTRUCTOR` definido pero sin usar |
| 🟡 Baja | Hover del botón CTA tiene sombra roja (debería ser dorada) |
