const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(__dirname));

// Ruta para la raíz
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Ruta para guardar cotizaciones
app.post("/save-cotizaciones", (req, res) => {
    const cotizacion = req.body;
    const filePath = path.join(__dirname, "cotizaciones.json");

    // Leer el archivo actual
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error leyendo el archivo:", err);
            return res.status(500).json({ error: "Error leyendo el archivo" });
        }

        let cotizacionesData = { cotizaciones: [] };
        if (data) {
            try {
                cotizacionesData = JSON.parse(data); // Parsear el archivo JSON existente
                if (!cotizacionesData.cotizaciones) {
                    cotizacionesData.cotizaciones = [];
                }
            } catch (error) {
                console.error("Error parseando el archivo JSON:", error);
                return res.status(500).json({ error: "Error parseando el archivo JSON" });
            }
        }

        // Agregar la nueva cotización
        if (!cotizacionesData.cotizaciones) {
            cotizacionesData.cotizaciones = [];
        }
        cotizacionesData.cotizaciones = [...cotizacionesData.cotizaciones, ...cotizacion.cotizaciones];

        // Guardar el archivo actualizado
        fs.writeFile(filePath, JSON.stringify({ cotizaciones: cotizacionesData.cotizaciones }, null, 2), (err) => {
            if (err) {
                console.error("Error guardando el archivo:", err);
                return res.status(500).json({ error: "Error guardando el archivo" });
            }
            res.json({ message: "Cotización guardada con éxito" });
        });
    });
});

// Ruta para obtener todas las cotizaciones
app.get("/get-cotizaciones", (req, res) => {
    const filePath = path.join(__dirname, "cotizaciones.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error leyendo el archivo:", err);
            return res.status(500).json({ error: "Error leyendo el archivo" });
        }

        try {
            const cotizaciones = JSON.parse(data);
            res.json(cotizaciones);
        } catch (error) {
            console.error("Error parseando el archivo JSON:", error);
            res.status(500).json({ error: "Error parseando el archivo JSON" });
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});