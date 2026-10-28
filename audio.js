// Función para calcular la tensión proporcional al valor del instrumento
function calcularTensionAuricular(valor, minimo, maximo) {
    // Evitamos división por cero si el rango es plano
    if (maximo === minimo) return 0.0;

    // Normalizamos el valor entre 0 y 1 en base al mínimo y máximo
    const valorAcotado = Math.max(minimo, Math.min(maximo, valor));
    const normalizado = (valorAcotado - minimo) / (maximo - minimo);

    // Mapeamos a un rango de tensión de salida de 0 a 5 Voltios (ajustable según hardware)
    const voltajeMin = 0.0;
    const voltajeMax = 5.0;
    const tension = voltajeMin + normalizado * (voltajeMax - voltajeMin);

    console.log(`[AUDIO / TENSIÓN] Valor: ${valor} (Mín: ${minimo}, Máx: ${maximo}) -> Tensión generada: ${tension.toFixed(2)} V`);
    
    return Number(tension.toFixed(2));
}

module.exports = {
    calcularTensionAuricular
};