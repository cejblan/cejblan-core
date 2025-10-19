# DIRECTRICES DE ATRIBUCIÓN (ATTRIBUTION_GUIDELINES.md)

**Propósito:** este documento define cómo deben atribuir visiblemente a *Cejblan Core* y a su autor cuando se use, modifique, integre o distribuya el núcleo o partes sustanciales del mismo. La atribución es un requisito de la licencia del núcleo (MIT con requisito de atribución pública).

---

## 1) Texto mínimo obligatorio de atribución

El integrador debe mostrar **una atribución visible para usuarios finales** con, al menos, la siguiente redacción mínima (en español):

**Opción completa (recomendada):**
> Basado en **Cejblan Core** — desarrollado por **Francisco Ramon Gonzalez Portal**.

**Opción corta (aceptable si espacio limitado):**
> Basado en **Cejblan Core** — © Francisco Ramon Gonzalez Portal

También se permite usar la versión en inglés cuando la interfaz principal esté en inglés:

**English (recommended):**
> Based on **Cejblan Core** — developed by **Francisco Ramon Gonzalez Portal**.

---

## 2) Requisito obligatorio: enlace clickable en el código

**Obligatorio:** la atribución debe incluir en el código **un elemento `<a>` con el `href` exacto** que se indica a continuación. Este enlace debe estar presente en la UI visible para usuarios finales (footer, página About, créditos, etc.) — no basta con dejar la atribución en archivos del repositorio o en comentarios del código.

**URL obligatoria (href requerido):**
<https://www.linkedin.com/in/cejblan>

**Qué significa esto en la práctica:**

- Debe existir en el DOM un enlace clicable `<a href="https://www.linkedin.com/in/cejblan">...</a>`.
- El enlace debe ser visible y accesible desde la interfaz que usan los usuarios finales.
- No sirve poner la URL solo en el `LICENSE`, en comentarios del código o en documentación privada: debe ser parte de la UI pública o la documentación accesible desde ella.
- Si una organización adquiere una licencia comercial que exima de este requisito, la exención debe constar por escrito en el contrato/licencia.

---

## 3) Ejemplos concretos (copia y pega)

### 3.1 HTML (footer)

```html
<footer>
  <p>
    Basado en <strong>Cejblan Core</strong> — desarrollado por
    <a href="https://www.linkedin.com/in/cejblan" target="_blank" rel="noopener noreferrer" aria-label="Basado en Cejblan Core - perfil de Francisco Ramon Gonzalez Portal en LinkedIn">
      Francisco Ramon Gonzalez Portal
    </a>
  </p>
</footer>
