const express = require("express");
const axios = require("axios");
const ExcelJS = require("exceljs");
const port = 3003

const app = express();

app.get("/exportar/excel", async (req, res) => {
    try {
        const { data: productos } = await axios.get("http://localhost:8080/api/productos");

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Productos");

        worksheet.columns = [
            { header: "ID", key: "id", width: 8 },
            { header: "Nombre", key: "nombre", width: 30 },
            { header: "Categoría", key: "categoria", width: 15 },
            { header: "Precio (S/.)", key: "precio", width: 15 },
            { header: "Stock", key: "stock", width: 10 },
            { header: "Activo", key: "activo", width: 10 },
        ];

        productos.forEach((p) => {
            worksheet.addRow({
                id: p.id,
                nombre: p.nombre,
                categoria: p.categoria,
                precio: Number(p.precio).toFixed(2),
                stock: p.stock,
                activo: p.activo ? "Sí" : "No",
            });
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=productos.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error exportando Excel:", error);
        res.status(500).send("Error exportando Excel");
    }
});

app.listen(port, () => console.log("Servidor Node para Excel en puerto 3003"));
