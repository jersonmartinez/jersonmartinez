# Política de seguridad

Este repositorio contiene el código fuente del portfolio profesional publicado en
[jersonmartinez.com](https://www.jersonmartinez.com). Es un sitio estático sin
backend ni datos de usuario, pero las aportaciones de seguridad son bienvenidas.

## Reportar una vulnerabilidad

Si encuentras un problema de seguridad (por ejemplo, una cabecera mal configurada,
una fuga de información en el build, o una dependencia vulnerable), repórtalo de
forma privada:

- **Preferido:** abre un aviso privado en
  [GitHub Security Advisories](https://github.com/jersonmartinez/jersonmartinez/security/advisories/new).
- **Alternativa:** escribe a `jersonmartinezsm@gmail.com` con el asunto
  `[SECURITY] jersonmartinez.com`.

Incluye, si puedes: pasos de reproducción, impacto esperado y la URL o el fichero
afectado. Por favor, **no** abras un issue público para vulnerabilidades.

## Qué esperar

- Confirmación de recepción en un plazo razonable.
- Evaluación del impacto y, si procede, una corrección publicada vía PR.
- Reconocimiento al reportante si así lo desea.

## Alcance

- Configuración de cabeceras de seguridad (ver [`SECURITY-HEADERS.md`](./SECURITY-HEADERS.md)).
- Dependencias de build y workflows de CI.
- El contenido estático servido en producción.

Fuera de alcance: ingeniería social, denegación de servicio volumétrica, y
reportes automáticos sin impacto demostrable.
