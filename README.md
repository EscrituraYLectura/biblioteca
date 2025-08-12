# Biblioteca

> Biblioteca interactiva para filtrar y ordenar todos los libros de la Biblioteca.

La Biblioteca interactiva cuenta con tres páginas principales:

- **Buscador:** página que permite buscar cualquier libro subido en la Biblioteca mediante distintos filtros, incluyendo campos de texto para valores específicos, menús con elementos concretos y más, con la posibilidad de seleccionar varios filtros al mismo tiempo. La búsqueda se guarda en la URL actual, por lo que es fácil copiar la URL con la búsqueda y compartirla. En esta página también es posible reportar información de cada libro, por si hay información errada o faltante.
- **Índices:** página que muestra todos los libros subidos en la Biblioteca en orden alfabético. Permite ordenar la lista por los títulos de los libros o por los nombres de los autores.
- **Estadísticas:** página que muestra estadísticas de todos los libros subidos en la Biblioteca. Útil para ver el estado de cada idioma, género, país, etc., y para detectar combinaciones que no tienen muchos libros.

Además de estas tres páginas principales en la barra lateral izquierda, hay tres botones más: uno para cambiar el tema de estilos, otro para reportar errores del sitio en sí y otro para saber más información del sitio (incluyendo la fecha de la última vez en la que se actualizaron los datos).

El sitio (de tipo aplicación web y *single page application*) está programado en Next.js usando TypeScript y alojado en el lado del cliente en GitHub Pages.