const db = require('./db');
const { generarPalabraARINC429, enviarPorSerial } = require('./arinc');
const { calcularTensionAuricular } = require('./audio');

// --- CREAR ENVÍO, ARINC 429 Y SEÑAL DE TENSIÓN ---
async function crearEnvioCompleto(instrumento, valor, maximo, minimo) {
    try {
        // 1. Guardar en la base de datos MySQL
        const query = 'INSERT INTO envios (instrumento, valor, maximo, minimo) VALUES (?, ?, ?, ?)';
        const [resultado] = await db.execute(query, [instrumento, valor, maximo, minimo]);
        console.log(`[CREAR] Envío registrado con éxito en MySQL. ID: ${resultado.insertId}`);

        // 2. Definir una etiqueta octal representativa (ej: Label 043 para avisos)[cite: 1]
        const labelOctal = '043'; 

        // 3. Generar la palabra ARINC 429 de 32 bits[cite: 1]
        const palabra32bits = generarPalabraARINC429(labelOctal, valor);

        // 4. Intentar enviar por el puerto serial (manejando si no está conectado físicamente)
        try {
            enviarPorSerial(palabra32bits);
        } catch (e) {
            console.log('[SERIAL] Transmisión omitida por falta de hardware físico.');
        }

        // 5. Generar el valor de tensión correspondiente para el auricular[cite: 1]
        const tensionSalida = calcularTensionAuricular(valor, minimo, maximo);

    } catch (error) {
        console.error('Error en el proceso completo:', error.message);
    }
}

// --- LEER ENVÍOS ---
async function obtenerEnvios() {
    try {
        const [filas] = await db.execute('SELECT * FROM envios ORDER BY fecha_creacion DESC');
        console.log('\n[LEER] Lista de envíos en la base de datos:');
        console.table(filas);
        return filas;
    } catch (error) {
        console.error('Error al obtener los envíos:', error.message);
    }
}

// --- EJECUCIÓN PRINCIPAL ---
async function ejecutar() {
    console.log('--- INICIANDO PROCESO INTEGRADO DE AVIÓNICA --- \n');

    // Registramos un envío (Instrumento: 1 - Avisos, Valor: 105.5, Máx: 120.0, Mín: 0.0)[cite: 1]
    await crearEnvioCompleto('1 - Avisos', 105.5, 120.0, 0.0);

    // Mostramos la tabla actualizada
    await obtenerEnvios();
}

ejecutar();