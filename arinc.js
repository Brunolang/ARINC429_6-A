const { SerialPort } = require('serialport');

// Función para empaquetar un valor en una palabra ARINC 429 de 32 bits
function generarPalabraARINC429(labelOctal, valorDatos) {
    const label = parseInt(labelOctal, 8) & 0xFF;
    let palabra32bits = (label & 0xFF);
    
    const datosProcesados = Math.round(valorDatos) & 0x7FFFF;
    palabra32bits |= (datosProcesados << 10);

    console.log(`[ARINC 429] Label: ${labelOctal} | Valor: ${valorDatos} | Palabra 32 bits (Hex): 0x${palabra32bits.toString(16).toUpperCase()}`);
    
    return palabra32bits;
}

// Función para enviar la palabra por el puerto serial de forma segura
async function enviarPorSerial(palabra32bits) {
    const puertoPath = '/dev/ttyUSB0';

    try {
        // Verificamos primero si el puerto existe en el sistema Linux
        const puertosDisponibles = await SerialPort.list();
        const puertoExiste = puertosDisponibles.some(p => p.path === puertoPath);

        if (!puertoExiste) {
            console.log(`[SERIAL] Aviso: El puerto ${puertoPath} no está conectado físicamente. Simulación completada sin hardware.`);
            return;
        }

        const puertoSerial = new SerialPort({
            path: puertoPath,
            baudRate: 9600,
            autoOpen: false
        });

        puertoSerial.open((err) => {
            if (err) {
                console.error('[SERIAL] Error al abrir el puerto:', err.message);
                return;
            }

            const buffer = Buffer.alloc(4);
            buffer.writeUInt32BE(palabra32bits, 0);

            puertoSerial.write(buffer, (err) => {
                if (err) {
                    console.error('[SERIAL] Error al transmitir:', err.message);
                } else {
                    console.log('[SERIAL] Palabra ARINC 429 transmitida exitosamente por el puerto.');
                }
                puertoSerial.close();
            });
        });

    } catch (error) {
        console.log('[SERIAL] Modo simulación activo (sin dispositivos conectados).');
    }
}

module.exports = {
    generarPalabraARINC429,
    enviarPorSerial
};