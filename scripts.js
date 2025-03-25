// Global variables and data
let productos = [];
let empleados = {
    3004106: "Juan José Mejía                                               Número del RDV: 4562-4277",
    3003613: "Felipe García                                                 Número del RDV: 3170-1079",
    3002387: "Marco Morales                                                 Número del RDV: 4685-1673",
    3003727: "Estuardo Salazar                                              Número del RDV: 4513-3095",
    3003797: "Edgar Soto                                                    Número del RDV: 4607-1539",
    3003915: "Gerardo Alonzo                                                Número del RDV: 4234-1264",
    3001180: "Jhonny Beiker                                                 Número del RDV: 3232-0446",
};

let codigosManuales = {
    1200022: { descripcion: "ARQUITEJA ROJO MDA 0.55", precio: 128.37 },
    33602: { descripcion: "ARQUITEJA", precio: 103.91 },
    1200023: { descripcion: "ARQUITEJA ROJO MDA 0.40", precio: 92.25 },
    1200047: { descripcion: "E25, OND, LISA 0.40 AZUL", precio: 86.16 },
    1200295: { descripcion: "E25, OND, LISA 0.40R", precio: 86.16 },
    1200977: { descripcion: "E25, OND, LISA 0.55R", precio: 119.86 },
    1200279: { descripcion: "E25, OND, LISA 0.40B", precio: 86.16 },
    1200368: { descripcion: "E25, OND, LISA 0.55B", precio: 119.86 },
    1200001: { descripcion: "D2 – 4.04 mm", precio: 1.17 },
    1200278: { descripcion: "E25, OND, LISA 0.40 VERDE", precio: 86.16 },
    MUESTRA: { descripcion: "0.33 MTS", precio: 28.13 },
    1200025: { descripcion: "ARQUITEJA AZUL MDA 0.40", precio: 92.25 },
    1200026: { descripcion: "ARQUITEJA VERDE MDA 0.40", precio: 92.25 },
};

let excepciones = [
    "platina ght",
    "D2–4.04 mm",
    "angulo",
    "polin c gfx",
    "starmax",
    "polin ght",
    "tubo est ght",
    "tubo ind crc",
    "tubo est hrc",
    "viga ght",
    "viga encaj ght",
    "viga hrc",
    "viga encaj hrc",
];

// Global functions
function calcularTotal() {
    let totalGeneral = 0;
    let descuentoTotal = 0;

    const productosBlocks = document.querySelectorAll(".producto-block");
    productosBlocks.forEach((block) => {
        const cantidad = parseFloat(block.querySelector(".cantidad").value) || 0;
        const longitud = parseFloat(block.querySelector(".longitud").value) || 1;
        const precioUnitario = parseFloat(block.querySelector(".precio-unitario").textContent) || 0;
        const descuento = parseFloat(block.querySelector(".descuento").value) || 0;

        const totalSinDescuento = cantidad * longitud * precioUnitario;
        const montoDescuento = (totalSinDescuento * descuento) / 100;
        const totalConDescuento = totalSinDescuento - montoDescuento;

        block.querySelector(".total-producto").textContent = totalConDescuento.toFixed(2);

        totalGeneral += totalSinDescuento;
        descuentoTotal += montoDescuento;
    });

    const totalGeneralElement = document.getElementById("total-general");
    const descuentoTotalElement = document.getElementById("descuento-total");
    const totalConDescuentoElement = document.getElementById("total-con-descuento");

    if (totalGeneralElement) totalGeneralElement.textContent = totalGeneral.toFixed(2);
    if (descuentoTotalElement) descuentoTotalElement.textContent = descuentoTotal.toFixed(2);
    if (totalConDescuentoElement) totalConDescuentoElement.textContent = (totalGeneral - descuentoTotal).toFixed(2);
}

// Función para buscar un producto en la lista
function buscarProducto(codigo) {
    codigo = codigo.trim();
    for (let i = 0; i < productos.length; i++) {
        let row = productos[i];
        let encontrado = Object.values(row).some(
            (value) => String(value).trim() === codigo,
        );
        if (!encontrado) continue;

        console.log("🔍 Código encontrado:", codigo, "➡ Datos:", row);

        let descripcion = "Sin descripción";
        if (
            row.__EMPTY === "GALVAMAX" ||
            row.__EMPTY === "GALVACOLOR" ||
            row.__EMPTY_3 === "COLORALUM"
        ) {
            descripcion = (
                row.__EMPTY_4 ||
                row.__EMPTY_6 ||
                row.__EMPTY_7 ||
                ""
            ).trim();
        } else {
            for (let key in row) {
                if (typeof row[key] === "string" && row[key].length > 3) {
                    descripcion = row[key];
                    break;
                }
            }
        }

        let precio = 0;
        for (let key in row) {
            if (typeof row[key] === "string" && row[key].includes("Q")) {
                precio = parseFloat(row[key].replace(/[^\d.]/g, ""));
                break;
            }
        }

        if (!precio) {
            console.log("⚠ No se encontró precio para el código:", codigo);
            return null;
        }

        if (codigo.startsWith("1200")) {
            let descripcionLower = descripcion.toLowerCase();
            let esExcepcion = excepciones.some((exc) =>
                descripcionLower.includes(exc),
            );
            if (!esExcepcion) {
                console.log(
                    "🔄 Precio en pies detectado, convirtiendo a metros...",
                );
                precio *= 3.28;
            }
        }

        return { descripcion, precio };
    }

    console.log("❌ Código no encontrado:", codigo);
    return null;
}

function actualizarDescripcion(input) {
    const productoBlock = input.closest(".producto-block");
    if (!productoBlock) return;
    
    const codigo = input.value.trim();
    const descripcionElement = productoBlock.querySelector(".descripcion");
    const precioElement = productoBlock.querySelector(".precio-unitario");

    if (!descripcionElement || !precioElement) return;

    // Primero verificamos si el código está en los productos manuales
    if (codigosManuales[codigo]) {
        descripcionElement.textContent = codigosManuales[codigo].descripcion;
        precioElement.textContent = codigosManuales[codigo].precio.toFixed(2);
        calcularTotal();
        return;
    }

    // Si no está en los manuales, buscamos en el Excel
    const datos = buscarProducto(codigo);

    if (datos) {
        descripcionElement.textContent = datos.descripcion;
        precioElement.textContent = datos.precio.toFixed(2);
    } else {
        descripcionElement.textContent = "Código no válido";
        precioElement.textContent = "0.00";
    }

    calcularTotal();
}

document.addEventListener("DOMContentLoaded", function () {
    // Inicializar jsPDF
    const { jsPDF } = window.jspdf;

    // Almacenamiento de cotizaciones en un archivo JSON
    let contadorCotizaciones = 1;
    let cotizaciones = [];

    // Cargar cotizaciones existentes desde el archivo JSON
    function cargarCotizaciones() {
        fetch("/get-cotizaciones")
            .then((response) => response.json())
            .then((data) => {
                cotizaciones = data;
                if (cotizaciones.cotizaciones && cotizaciones.cotizaciones.length > 0) {
                    contadorCotizaciones = cotizaciones.cotizaciones.length + 1;
                }
                console.log("✅ Cotizaciones cargadas:", cotizaciones.cotizaciones ? cotizaciones.cotizaciones.length : 0);
            })
            .catch((error) =>
                console.error("Error cargando cotizaciones:", error),
            );
    }

    cargarCotizaciones();

    // Función para cargar productos desde un archivo Excel
    function cargarExcel() {
        fetch("productos.xlsx")
            .then((response) => response.arrayBuffer())
            .then((data) => {
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                productos = XLSX.utils.sheet_to_json(sheet);
                console.log("✅ Productos cargados:", productos.length);
            })
            .catch((error) =>
                console.error("Error cargando el archivo Excel:", error),
            );
    }

    cargarExcel();

    // Función para agregar un producto a la tabla
    function agregarProducto() {
        const container = document.querySelector(".productos-container");
        const productoBlock = document.createElement("div");
        productoBlock.className = "producto-block";

        productoBlock.innerHTML = `
            <div class="campo-grupo">
                <label class="campo-label">Cantidad</label>
                <input type="number" class="campo-input cantidad" onchange="calcularTotal()">
            </div>
            <div class="campo-grupo">
                <label class="campo-label">Unidad</label>
                <input type="text" class="campo-input" value="UN" readonly>
            </div>
            <div class="campo-grupo">
                <label class="campo-label">Código</label>
                <input type="text" class="campo-input codigo" onchange="actualizarDescripcion(this)">
            </div>
            <div class="producto-detalles">
                <div class="campo-grupo">
                    <label class="campo-label">Descripción</label>
                    <div class="campo-input descripcion"></div>
                </div>
                <div class="campo-grupo">
                    <label class="campo-label">Longitud (m)</label>
                    <input type="number" class="campo-input longitud" value="1" onchange="calcularTotal()">
                </div>
                <div class="campo-grupo">
                    <label class="campo-label">Precio Unitario</label>
                    <div class="campo-input precio-unitario">0.00</div>
                </div>
                <div class="campo-grupo">
                    <label class="campo-label">Descuento (%)</label>
                    <input type="number" class="campo-input descuento" value="0" onchange="calcularTotal()">
                </div>
                <div class="campo-grupo">
                    <label class="campo-label">Total</label>
                    <div class="campo-input total-producto">0.00</div>
                </div>
            </div>
        `;

        container.appendChild(productoBlock);
    }

    // Función para actualizar la descripción y el precio del producto
    function actualizarDescripcion(input) {
        const fila = input.closest("tr");
        const codigo = input.value.trim();

        // Primero verificamos si el código está en los productos manuales
        if (codigosManuales[codigo]) {
            fila.querySelector(".descripcion").textContent =
                codigosManuales[codigo].descripcion;
            fila.querySelector(".precio-unitario").textContent =
                codigosManuales[codigo].precio.toFixed(2);
            calcularTotal();
            return;
        }

        // Si no está en los manuales, buscamos en el Excel
        const datos = buscarProducto(codigo);

        if (datos) {
            fila.querySelector(".descripcion").textContent = datos.descripcion;
            fila.querySelector(".precio-unitario").textContent =
                datos.precio.toFixed(2);
        } else {
            fila.querySelector(".descripcion").textContent = "Código no válido";
            fila.querySelector(".precio-unitario").textContent = "0.00";
        }

        calcularTotal();
    }

    // Función para buscar un producto en la lista
    function buscarProducto(codigo) {
        codigo = codigo.trim();
        for (let i = 0; i < productos.length; i++) {
            let row = productos[i];
            let encontrado = Object.values(row).some(
                (value) => String(value).trim() === codigo,
            );
            if (!encontrado) continue;

            console.log("🔍 Código encontrado:", codigo, "➡ Datos:", row);

            let descripcion = "Sin descripción";
            if (
                row.__EMPTY === "GALVAMAX" ||
                row.__EMPTY === "GALVACOLOR" ||
                row.__EMPTY_3 === "COLORALUM"
            ) {
                descripcion = (
                    row.__EMPTY_4 ||
                    row.__EMPTY_6 ||
                    row.__EMPTY_7 ||
                    ""
                ).trim();
            } else {
                for (let key in row) {
                    if (typeof row[key] === "string" && row[key].length > 3) {
                        descripcion = row[key];
                        break;
                    }
                }
            }

            let precio = 0;
            for (let key in row) {
                if (typeof row[key] === "string" && row[key].includes("Q")) {
                    precio = parseFloat(row[key].replace(/[^\d.]/g, ""));
                    break;
                }
            }

            if (!precio) {
                console.log("⚠ No se encontró precio para el código:", codigo);
                return null;
            }

            if (codigo.startsWith("1200")) {
                let descripcionLower = descripcion.toLowerCase();
                let esExcepcion = excepciones.some((exc) =>
                    descripcionLower.includes(exc),
                );
                if (!esExcepcion) {
                    console.log(
                        "🔄 Precio en pies detectado, convirtiendo a metros...",
                    );
                    precio *= 3.28;
                }
            }

            return { descripcion, precio };
        }

        console.log("❌ Código no encontrado:", codigo);
        return null;
    }

    // Función para calcular los totales
    function calcularTotal() {
        const filas = document.querySelectorAll("#cotizacion tbody tr");
        let totalGeneral = 0;
        let descuentoTotal = 0;

        filas.forEach((fila) => {
            const cantidad =
                parseFloat(fila.querySelector(".cantidad").value) || 0;
            const longitud =
                parseFloat(fila.querySelector(".longitud").value) || 1;
            const precioUnitario =
                parseFloat(
                    fila.querySelector(".precio-unitario").textContent,
                ) || 0;
            const descuento =
                parseFloat(fila.querySelector(".descuento").value) || 0;

            const totalSinDescuento = cantidad * longitud * precioUnitario;
            const montoDescuento = (totalSinDescuento * descuento) / 100;
            const totalConDescuento = totalSinDescuento - montoDescuento;

            fila.querySelector(".total-producto").textContent =
                totalConDescuento.toFixed(2);

            totalGeneral += totalSinDescuento;
            descuentoTotal += montoDescuento;
        });

        document.getElementById("total-general").textContent =
            totalGeneral.toFixed(2);
        document.getElementById("descuento-total").textContent =
            descuentoTotal.toFixed(2);
        document.getElementById("total-con-descuento").textContent = (
            totalGeneral - descuentoTotal
        ).toFixed(2);
    }

    // Función para actualizar el nombre del empleado
    function actualizarEmpleado() {
        const codigo = document.getElementById("codigo-empleado").value.trim();
        document.getElementById("nombre-empleado").textContent =
            empleados[codigo] || "Empleado no encontrado";
    }

    // Función para guardar la cotización en el archivo JSON
    function guardarCotizacion() {
        const cliente = document.getElementById("cliente").value.trim();
        const codigoEmpleado = document
            .getElementById("codigo-empleado")
            .value.trim();
        const nombreEmpleado = empleados[codigoEmpleado] || "Desconocido";

        const numeroPedido = `IPL${String(contadorCotizaciones).padStart(5, "0")}`;
        contadorCotizaciones++;

        const cotizacion = {
            numeroPedido,
            cliente,
            codigoEmpleado,
            nombreEmpleado,
            productos: [],
            totalGeneral: parseFloat(
                document.getElementById("total-general").textContent,
            ),
            descuentoTotal: parseFloat(
                document.getElementById("descuento-total").textContent,
            ),
            totalConDescuento: parseFloat(
                document.getElementById("total-con-descuento").textContent,
            ),
        };

        const productosBlocks = document.querySelectorAll(".producto-block");
        productosBlocks.forEach((block) => {
            const cantidad = parseFloat(block.querySelector(".cantidad").value) || 0;
            const codigo = block.querySelector(".codigo").value.trim();
            const descripcion = block.querySelector(".descripcion").textContent.trim();
            
            if (cantidad > 0 && codigo) {
                const producto = {
                    cantidad: cantidad,
                    codigo: codigo,
                    descripcion: descripcion,
                    longitud: parseFloat(block.querySelector(".longitud").value) || 1,
                    precioUnitario: parseFloat(block.querySelector(".precio-unitario").textContent) || 0,
                    descuento: parseFloat(block.querySelector(".descuento").value) || 0,
                    total: parseFloat(block.querySelector(".total-producto").textContent) || 0,
                };
                cotizacion.productos.push(producto);
            }
        });

        // Crear nueva cotización directamente
        const nuevaCotizacion = {
            cotizaciones: [cotizacion]
        };

        // Guardar en el archivo JSON
        fetch("/save-cotizaciones", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(nuevaCotizacion),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(
                    `Cotización guardada con éxito. Número de pedido: ${numeroPedido}`,
                );
            })
            .catch((error) => {
                console.error("Error guardando la cotización:", error);
                alert("Hubo un error al guardar la cotización.");
            });
    }

    // Función para cargar una cotización desde el archivo JSON
    function cargarCotizacion() {
        const numeroPedido = document
            .getElementById("buscar-cotizacion")
            .value.trim();
        const mensajeBusqueda = document.getElementById("mensaje-busqueda");

        if (!numeroPedido) {
            mensajeBusqueda.textContent = "Ingrese un número de pedido válido.";
            return;
        }

        let cotizacion;
        if (cotizaciones && cotizaciones.cotizaciones) {
            // Buscar directamente en el array de cotizaciones
            cotizacion = cotizaciones.cotizaciones.find(cot => 
                cot && cot.numeroPedido === numeroPedido
            );
            
            // Si no se encuentra, buscar en las subcotizaciones
            if (!cotizacion) {
                cotizaciones.cotizaciones.forEach(cot => {
                    if (cot.cotizaciones) {
                        const subCotizacion = cot.cotizaciones.find(
                            subcot => subcot && subcot.numeroPedido === numeroPedido
                        );
                        if (subCotizacion) {
                            cotizacion = subCotizacion;
                        }
                    }
                });
            }
        }

        if (cotizacion) {
            const container = document.querySelector(".productos-container");
            if (!container) return;
            container.innerHTML = "";

            cotizacion.productos.forEach((producto) => {
                const productoBlock = document.createElement("div");
                productoBlock.className = "producto-block";
                productoBlock.innerHTML = `
                    <div class="campo-grupo">
                        <label class="campo-label">Cantidad</label>
                        <input type="number" class="campo-input cantidad" value="${producto.cantidad}" onchange="calcularTotal()">
                    </div>
                    <div class="campo-grupo">
                        <label class="campo-label">Unidad</label>
                        <input type="text" class="campo-input" value="UN" readonly>
                    </div>
                    <div class="campo-grupo">
                        <label class="campo-label">Código</label>
                        <input type="text" class="campo-input codigo" value="${producto.codigo}" onchange="actualizarDescripcion(this)">
                    </div>
                    <div class="producto-detalles">
                        <div class="campo-grupo">
                            <label class="campo-label">Descripción</label>
                            <div class="campo-input descripcion">${producto.descripcion}</div>
                        </div>
                        <div class="campo-grupo">
                            <label class="campo-label">Longitud (m)</label>
                            <input type="number" class="campo-input longitud" value="${producto.longitud}" onchange="calcularTotal()">
                        </div>
                        <div class="campo-grupo">
                            <label class="campo-label">Precio Unitario</label>
                            <div class="campo-input precio-unitario">${producto.precioUnitario.toFixed(2)}</div>
                        </div>
                        <div class="campo-grupo">
                            <label class="campo-label">Descuento (%)</label>
                            <input type="number" class="campo-input descuento" value="${producto.descuento}" onchange="calcularTotal()">
                        </div>
                        <div class="campo-grupo">
                            <label class="campo-label">Total</label>
                            <div class="campo-input total-producto">${producto.total.toFixed(2)}</div>
                        </div>
                    </div>
                `;
                container.appendChild(productoBlock);
            });

            document.getElementById("total-general").textContent =
                cotizacion.totalGeneral.toFixed(2);
            document.getElementById("descuento-total").textContent =
                cotizacion.descuentoTotal.toFixed(2);
            document.getElementById("total-con-descuento").textContent =
                cotizacion.totalConDescuento.toFixed(2);

            document.getElementById("cliente").value = cotizacion.cliente;
            document.getElementById("codigo-empleado").value =
                cotizacion.codigoEmpleado;
            document.getElementById("nombre-empleado").textContent =
                cotizacion.nombreEmpleado;

            mensajeBusqueda.textContent = `Cotización cargada: ${numeroPedido}`;
        } else {
            mensajeBusqueda.textContent = "Cotización no encontrada.";
        }
    }

    // Función para exportar a PDF
    function exportarAPDF() {
        const doc = new jsPDF();

        const cargarLogo = new Promise((resolve, reject) => {
            const img = new Image();
            img.src = "https://i.postimg.cc/sf0xktr3/image.png";
            img.onload = () => resolve(img);
            img.onerror = (error) => reject(error);
        });

        cargarLogo
            .then((img) => {
                doc.addImage(img, "PNG", 10, 10, 50, 20);

                doc.setFontSize(18);
                doc.text("COTIZADOR FERROMAX", 70, 20);
                doc.setFontSize(12);
                doc.text(
                    `Número de Cotización: IPL${String(contadorCotizaciones - 1).padStart(5, "0")}`,
                    70,
                    30,
                );

                doc.text(
                    `Cliente: ${document.getElementById("cliente").value}`,
                    10,
                    40,
                );
                doc.text(
                    `Nombre del RDV: ${document.getElementById("nombre-empleado").textContent}`,
                    10,
                    50,
                );

                const productos = document.querySelectorAll(".producto-block");
                const data = [];
                productos.forEach((producto) => {
                    const row = [
                        producto.querySelector(".cantidad").value,
                        "UN",
                        producto.querySelector(".codigo").value,
                        producto.querySelector(".descripcion").textContent,
                        producto.querySelector(".longitud").value,
                        producto.querySelector(".precio-unitario").textContent,
                        producto.querySelector(".total-producto").textContent,
                    ];
                    data.push(row);
                });

                const headers = [
                    "Cantidad",
                    "Unidad",
                    "Código",
                    "Descripción",
                    "Longitud (m)",
                    "Precio Unitario",
                    "Total",
                ];

                doc.autoTable({
                    head: [headers],
                    body: data,
                    startY: 60,
                    theme: "striped",
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [22, 160, 133] },
                });

                const finalY = doc.autoTable.previous.finalY + 10;
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "bold");
                doc.text("Total General:", 20, finalY + 10);
                doc.text(
                    document.getElementById("total-general").textContent,
                    120,
                    finalY + 10,
                    { align: "right" },
                );
                doc.text("Descuento Total:", 20, finalY + 20);
                doc.text(
                    document.getElementById("descuento-total").textContent,
                    120,
                    finalY + 20,
                    { align: "right" },
                );
                doc.text("Total con Descuento:", 20, finalY + 30);
                doc.text(
                    document.getElementById("total-con-descuento").textContent,
                    120,
                    finalY + 30,
                    { align: "right" },
                );

                doc.save("cotizacion_ferromax.pdf");
            })
            .catch((error) => {
                console.error("Error cargando el logo:", error);
                alert(
                    "Hubo un error al cargar el logo. Asegúrate de que la ruta sea correcta.",
                );
            });
    }

    // Función para exportar a imagen
    function exportarAImagen() {
        const contenedor = document.createElement("div");
        contenedor.style.padding = "20px";
        contenedor.style.background = "white";
        contenedor.style.width = "800px";

        // Crear tabla
        const tabla = document.createElement("table");
        tabla.style.width = "100%";
        tabla.style.borderCollapse = "collapse";
        tabla.style.marginBottom = "20px";
        tabla.style.fontFamily = "Arial, sans-serif";

        // Crear encabezado
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr style="background-color: #f4f4f4;">
                <th style="padding: 10px; border: 1px solid #ddd;">Cantidad</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Unidad</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Código</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Descripción</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Longitud</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Precio Unit.</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
            </tr>
        `;
        tabla.appendChild(thead);

        // Crear cuerpo
        const tbody = document.createElement("tbody");
        document.querySelectorAll(".producto-block").forEach(producto => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="padding: 8px; border: 1px solid #ddd;">${producto.querySelector(".cantidad").value}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">UN</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${producto.querySelector(".codigo").value}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${producto.querySelector(".descripcion").textContent}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${producto.querySelector(".longitud").value}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${producto.querySelector(".precio-unitario").textContent}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${producto.querySelector(".total-producto").textContent}</td>
            `;
            tbody.appendChild(tr);
        });
        tabla.appendChild(tbody);

        // Agregar totales
        const totales = document.createElement("div");
        totales.style.marginTop = "20px";
        totales.style.padding = "15px";
        totales.style.backgroundColor = "#f8f9fa";
        totales.style.border = "1px solid #ddd";
        totales.style.borderRadius = "4px";
        totales.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Total General:</strong>
                <span>Q ${document.getElementById("total-general").textContent}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Descuento Total:</strong>
                <span>Q ${document.getElementById("descuento-total").textContent}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.2em; color: #2c3e50;">
                <strong>Total con Descuento:</strong>
                <span>Q ${document.getElementById("total-con-descuento").textContent}</span>
            </div>
        `;

        contenedor.appendChild(tabla);
        contenedor.appendChild(totales);

        document.body.appendChild(contenedor);

        html2canvas(contenedor).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = imgData;
            link.download = "cotizacion_ferromax.png";
            link.click();

            document.body.removeChild(contenedor);
        });
    }

    // Función para vincular eventos de forma segura
    function bindEvents() {
        const buscarBtn = document.getElementById("buscar-cotizacion-btn");
        const agregarBtn = document.getElementById("agregar-producto-btn");
        const guardarBtn = document.getElementById("guardar-cotizacion-btn");
        const exportarPDFBtn = document.getElementById("exportar-pdf-btn");
        const exportarImgBtn = document.getElementById("exportar-imagen-btn");
        const codigoEmpInput = document.getElementById("codigo-empleado");

        if (buscarBtn) buscarBtn.addEventListener("click", cargarCotizacion);
        if (agregarBtn) agregarBtn.addEventListener("click", agregarProducto);
        if (guardarBtn) guardarBtn.addEventListener("click", guardarCotizacion);
        if (exportarPDFBtn) exportarPDFBtn.addEventListener("click", exportarAPDF);
        if (exportarImgBtn) exportarImgBtn.addEventListener("click", exportarAImagen);
        if (codigoEmpInput) codigoEmpInput.addEventListener("input", actualizarEmpleado);

        // Agregar primer producto automáticamente si no hay ninguno
        const container = document.querySelector(".productos-container");
        if (container && container.children.length === 0) {
            agregarProducto();
        }
    }

    // Vincular eventos cuando el DOM esté listo
    bindEvents();
});
