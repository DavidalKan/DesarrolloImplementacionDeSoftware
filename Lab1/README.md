# CRUD con React y JavaScript

Aplicacion web para administrar registros mediante las operaciones CRUD:

- **Create:** crear un registro.
- **Read:** consultar y listar registros.
- **Update:** editar un registro existente.
- **Delete:** eliminar un registro despues de confirmar la accion.

## Alcance del CRUD

El laboratorio implementa un CRUD de tareas con React y JavaScript. La
interfaz permite crear, consultar, editar, eliminar y marcar tareas como
completadas. Los registros se guardan en `localStorage` para conservar los
cambios entre recargas sin depender de un backend.

Tambien incluye busqueda por texto, filtros por estado, prioridades, fechas
limite, notas, validacion de formulario, estados vacios, mensajes de exito y
confirmacion antes de eliminar.

## Requisitos funcionales

- Mostrar una lista de registros.
- Permitir crear registros desde un formulario.
- Permitir editar registros existentes.
- Permitir eliminar registros con confirmacion.
- Permitir cambiar el estado de una tarea.
- Validar los datos antes de guardarlos.
- Mostrar estados de carga, exito y error cuando corresponda.
- Mantener la interfaz accesible mediante teclado y etiquetas semanticas.
- Permitir buscar y filtrar registros.

## Stack sugerido

- React
- JavaScript
- Vite
- CSS
- `localStorage` para persistencia local
- API REST como siguiente paso para persistencia en servidor

## Estructura principal

```text
Lab1/
|-- README.md
|-- package.json
|-- index.html
`-- src/
    |-- App.jsx       # Logica y componentes principales del CRUD
    |-- App.css       # Estilos de la interfaz
    |-- index.css     # Estilos globales
    `-- main.jsx      # Punto de entrada de React
```

## Skill `frontend-patterns`

Para orientar la implementacion se puede utilizar la skill `frontend-patterns`
de `affaan-m/ECC`. Sus recomendaciones cubren composicion de componentes,
hooks, manejo de estado, formularios, rendimiento, accesibilidad, carga de
datos y limites de error.

### Fuentes

- Pagina de la skill:
  <https://skillsmp.com/creators/affaan-m/ecc/agents-skills-frontend-patterns>
- Repositorio fuente:
  <https://github.com/affaan-m/ECC/tree/main/.agents/skills/frontend-patterns>

### Comando de instalacion

Ejecutar desde la raiz del proyecto:

```bash
npx skills add https://github.com/affaan-m/ECC --skill frontend-patterns
```

### Estructura esperada de la skill

La carpeta instalada debe conservar todos los archivos de la skill:

```text
frontend-patterns/
|-- SKILL.md
`-- agents/
    `-- openai.yaml
```

`SKILL.md` contiene las instrucciones principales y `agents/openai.yaml`
contiene la configuracion visible e invocable del agente. La fuente revisada
no muestra scripts, assets ni referencias adicionales para esta skill.

### Verificacion posterior a la instalacion

Desde la carpeta donde la herramienta instale las skills, verificar que los
archivos esperados existan:

```bash
find . -path '*/frontend-patterns/SKILL.md' -o -path '*/frontend-patterns/agents/openai.yaml'
```

La salida debe incluir tanto `SKILL.md` como `agents/openai.yaml`. Tambien se
debe confirmar que la carpeta conserva su estructura relativa y no contiene
solamente el archivo principal.

## Riesgos y precauciones de seguridad

- `npx skills add` descarga y ejecuta una herramienta externa; revisar el
  contenido y confirmar el destino antes de usarla en un entorno sensible.
- Las recomendaciones de la skill no reemplazan la validacion del servidor,
  la autorizacion ni la sanitizacion de entradas.
- Usar datos sinteticos durante el desarrollo. No registrar ni mostrar
  contrasenas, tokens, datos de pago, identificadores personales ni otra
  informacion sensible.
- No agregar analytics, scripts de terceros o destinos externos de datos sin
  aprobacion explicita.
- `localStorage` no debe usarse para secretos ni datos sensibles y no sustituye
  los controles de acceso de un backend.
- Verificar los cambios de la fuente remota antes de reinstalar una version
  nueva de la skill.

## Criterios de implementacion

- Separar componentes de presentacion, formularios y acceso a datos.
- Mantener el estado minimo necesario y evitar mutaciones directas.
- Reutilizar componentes mediante composicion.
- Mostrar errores accionables y estados vacios.
- Validar entradas en el cliente y repetir la validacion en el servidor cuando
  exista una API.
- Probar crear, consultar, editar y eliminar registros, incluidos datos
  invalidos y errores de red.
- Mantener la interfaz responsive y navegable con teclado.

## Comandos habituales

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Crear una compilacion de produccion:

```bash
npm run build
```

Revisar el proyecto con Oxlint:

```bash
npm run lint
```