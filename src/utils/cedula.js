/**
 * Valida matemáticamente una cédula ecuatoriana mediante el algoritmo Módulo 10.
 * @param {string} cedula - String de 10 dígitos numéricos.
 * @return {boolean} - true si es válida, false en caso contrario.
 */
export const validarCedulaEcuatoriana = (cedula) => {
  if (!cedula || typeof cedula !== 'string') return false;
  
  // Debe contener exactamente 10 dígitos numéricos
  if (cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;

  // Código de provincia (dos primeros dígitos): entre 01 y 24, o 30 (Ecuatorianos en el exterior)
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;

  // Tercer dígito debe ser menor a 6 (personas naturales)
  const tercerDigito = parseInt(cedula.substring(2, 3), 10);
  if (tercerDigito >= 6) return false;

  // Algoritmo Módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const modulo = suma % 10;
  const resultadoCalculado = modulo === 0 ? 0 : 10 - modulo;

  return resultadoCalculado === digitoVerificador;
};