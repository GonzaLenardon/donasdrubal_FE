export const UMBRAL_GRUPADO_POR_DEFECTO = 5;

export const parseNumeroRemito = (remitoNumber) => {
  const numero = parseInt(String(remitoNumber ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(numero) ? numero : null;
};

export const formatNumeroRemito = (numero, ancho = 8) =>
  String(numero ?? '').padStart(ancho, '0');

export const construirRunsFaltantes = (numerosFaltantes, umbral) => {
  const numeros = [...new Set(numerosFaltantes)].sort((a, b) => a - b);
  const corridas = [];

  let inicio = null;
  let previo = null;

  numeros.forEach((numero) => {
    if (inicio === null) {
      inicio = numero;
      previo = numero;
      return;
    }
    if (numero === previo + 1) {
      previo = numero;
      return;
    }
    corridas.push({ desde: inicio, hasta: previo, cantidad: previo - inicio + 1 });
    inicio = numero;
    previo = numero;
  });

  if (inicio !== null) {
    corridas.push({ desde: inicio, hasta: previo, cantidad: previo - inicio + 1 });
  }

  const resultado = [];

  corridas.forEach((corrida) => {
    if (corrida.cantidad > umbral) {
      resultado.push({ ...corrida, agrupado: true });
      return;
    }
    for (let numero = corrida.desde; numero <= corrida.hasta; numero += 1) {
      resultado.push({ desde: numero, hasta: numero, cantidad: 1, agrupado: false });
    }
  });

  return resultado;
};

export const filtrarRemitos = (remitos, { depositoId = '', ingenieroId = '' } = {}, clientes = []) =>
  (remitos ?? []).filter((remito) => {
    if (depositoId && remito.origin_warehouse_id !== Number(depositoId)) return false;

    if (ingenieroId) {
      const ingId = Number(ingenieroId);
      const cliente = clientes.find((c) => c.id === remito.destination_client_id);
      const asignado = cliente?.ingenieros?.some((ing) => ing.user_id === ingId);
      if (!asignado && remito.creadoPor?.id !== ingId) return false;
    }

    return true;
  });

export const analizarRemitos = (
  remitos,
  { depositoId = '', ingenieroId = '', umbral = UMBRAL_GRUPADO_POR_DEFECTO } = {},
  clientes = [],
) => {
  const filtrados = filtrarRemitos(remitos, { depositoId, ingenieroId }, clientes);

  const porDeposito = new Map();

  filtrados.forEach((remito) => {
    const id = remito.origin_warehouse_id;
    if (!porDeposito.has(id)) porDeposito.set(id, []);
    porDeposito.get(id).push(remito);
  });

  const grupos = [...porDeposito.entries()]
    .map(([depId, lista]) => {
      const items = lista
        .map((remito) => ({ remito, numero: parseNumeroRemito(remito.remito_number) }))
        .filter((item) => item.numero !== null)
        .sort((a, b) => a.numero - b.numero);

      const presentes = new Set(items.map((item) => item.numero));
      const numeroMin = items.length ? items[0].numero : null;
      const numeroMax = items.length ? items[items.length - 1].numero : null;

      const faltantes = [];
      if (numeroMin !== null) {
        for (let numero = numeroMin + 1; numero <= numeroMax; numero += 1) {
          if (!presentes.has(numero)) faltantes.push(numero);
        }
      }

      const ancho =
        lista.reduce(
          (acc, remito) =>
            Math.max(
              acc,
              String(remito.remito_number ?? '').replace(/\D/g, '').length,
            ),
          0,
        ) || 8;

      return {
        depositoId: depId,
        items,
        faltantes: construirRunsFaltantes(faltantes, umbral),
        totalFaltantes: faltantes.length,
        totalRemitos: items.length,
        numeroMin,
        numeroMax,
        siguienteNumero: numeroMax !== null ? numeroMax + 1 : null,
        ancho,
      };
    })
    .sort((a, b) => a.depositoId - b.depositoId);

  return {
    grupos,
    totalRemitos: filtrados.length,
    totalFaltantes: grupos.reduce((acc, grupo) => acc + grupo.totalFaltantes, 0),
    depositosConFaltantes: grupos.filter((grupo) => grupo.totalFaltantes > 0).length,
  };
};

export const construirFilasGrupo = (grupo) => {
  const filas = [];
  let indiceFaltante = 0;

  grupo.items.forEach((item) => {
    while (
      indiceFaltante < grupo.faltantes.length &&
      grupo.faltantes[indiceFaltante].hasta < item.numero
    ) {
      filas.push({ tipo: 'faltante', ...grupo.faltantes[indiceFaltante] });
      indiceFaltante += 1;
    }
    filas.push({ tipo: 'remito', numero: item.numero, remito: item.remito });
  });

  while (indiceFaltante < grupo.faltantes.length) {
    filas.push({ tipo: 'faltante', ...grupo.faltantes[indiceFaltante] });
    indiceFaltante += 1;
  }

  return filas;
};

export const construirCsvFaltantes = (grupos, getNombreDeposito) => {
  const encabezado = ['Deposito', 'Desde', 'Hasta', 'Cantidad', 'Tipo'];
  const filas = [];

  grupos.forEach((grupo) => {
    grupo.faltantes.forEach((faltante) => {
      filas.push([
        getNombreDeposito(grupo.depositoId),
        formatNumeroRemito(faltante.desde, grupo.ancho),
        formatNumeroRemito(faltante.hasta, grupo.ancho),
        String(faltante.cantidad),
        faltante.agrupado ? 'Rango' : 'Numero',
      ]);
    });
  });

  const escapar = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;

  return [encabezado, ...filas].map((fila) => fila.map(escapar).join(';')).join('\n');
};
