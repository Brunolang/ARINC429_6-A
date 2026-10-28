const express = require('express');
const path = require('path');
const db = require('./db');
const { generarPalabraARINC429, enviarPorSerial } = require('./arinc');
const { calcularTensionAuricular } = require('./audio');

const app = express();
const PORT = 3000;

// Middleware para leer datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (la interfaz HTML)
app.use(express.static(path.join(__dirname, 'public')));

// Diccionario de instrumentos y sus etiquetas ARINC estándar
const instrumentosConfig = {
    '1 - Avisos': { label: '043', min: 0, max: 120 },
    '2 - Altímetro': { label: '203', min: -1000, max: 40000 },
    '3 - Velocímetro': { label: '212', min: 0, max: 450 },
    '4 - Tacómetro (RPM)': { label: '044', min: 0, max: 6000 }
};

// --- API: CREAR ENVÍO ---
app.post('/api/envios', async (req, res) => {
    try {
        const { instrumento, valor } = req.body;
        const config = instrumentosConfig[instrumento] || { label: '000', min: 0, max: 100 };
        
        const minimo = config.min;
        const maximo = config.max;

        // 1. Guardar en MySQL
        const query = 'INSERT INTO envios (instrumento, valor, maximo, minimo) VALUES (?, ?, ?, ?)';
        const [resultado] = await db.execute(query, [instrumento, Number(valor), maximo, minimo]);

        // 2. Generar ARINC 429
        const palabra32bits = generarPalabraARINC429(config.label, valor);

        // 3. Transmisión Serial segura
        enviarPorSerial(palabra32bits);

        // 4. Calcular tensión para auricular
        const tensionSalida = calcularTensionAuricular(Number(valor), minimo, maximo);

        res.json({
            success: true,
            id: resultado.insertId,
            hex: `0x${palabra32bits.toString(16).toUpperCase()}`,
            tension: tensionSalida
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- API: LEER ENVÍOS ---
app.get('/api/envios', async (req, res) => {
    try {
        const [filas] = await db.execute('SELECT * FROM envios ORDER BY fecha_creacion DESC');
        res.json(filas);
    } catch (error) {
        console.error('Error al consultar los envíos:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- API: EDITAR ENVÍO ---
app.put('/api/envios/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { instrumento, valor } = req.body;
        const config = instrumentosConfig[instrumento];
        const valorNumerico = Number(valor);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, error: 'ID de envío inválido.' });
        }
        if (!config || valor === '' || valor === undefined || !Number.isFinite(valorNumerico)) {
            return res.status(400).json({ success: false, error: 'Instrumento o valor inválido.' });
        }

        const [resultado] = await db.execute(
            'UPDATE envios SET instrumento = ?, valor = ?, maximo = ?, minimo = ? WHERE id = ?',
            [instrumento, valorNumerico, config.max, config.min, id]
        );

        if (resultado.affectedRows === 0) {
            const [filas] = await db.execute('SELECT id FROM envios WHERE id = ?', [id]);
            if (filas.length === 0) {
                return res.status(404).json({ success: false, error: 'Envío no encontrado.' });
            }
        }

        res.json({ success: true, message: `Registro ${id} actualizado.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- API: ELIMINAR ENVÍO ---
app.delete('/api/envios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM envios WHERE id = ?', [id]);
        res.json({ success: true, message: `Registro ${id} eliminado.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de aviónica corriendo en http://localhost:${PORT}`);
});