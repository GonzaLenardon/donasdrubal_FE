import React, { useState } from 'react';

const DEFAULTS = {
  CANT_AGUA_MUESTRA_LITROS: 1000.0,
  CAPACIDAD_SECUESTRO: 300.0,
};

const getEnvNumber = (key, fallback) => {
  const rawValue =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env[key] ?? import.meta.env[`VITE_${key}`]
      : undefined;

  if (rawValue === undefined || rawValue === '') return fallback;

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const calcularDosis = (dureza) => {
  const cantAguaLitros = getEnvNumber(
    'CANT_AGUA_MUESTRA_LITROS',
    DEFAULTS.CANT_AGUA_MUESTRA_LITROS,
  );
  const capacidadSecuestro = getEnvNumber(
    'CAPACIDAD_SECUESTRO',
    DEFAULTS.CAPACIDAD_SECUESTRO,
  );

  return (Number(dureza) * cantAguaLitros) / capacidadSecuestro;
};

const Herramientas = () => {
  const [dureza, setDureza] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const valorNumerico = Number(dureza);

    if (!dureza || Number.isNaN(valorNumerico) || valorNumerico < 0) {
      setError('Ingresá una dureza válida mayor o igual a 0.');
      setResultado(null);
      return;
    }

    setError('');
    setResultado(calcularDosis(valorNumerico));
  };

  return (
    <div className="container py-3">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h3 className="card-title mb-3">Herramientas</h3>
          <p className="text-muted mb-4">
            Calculá la dosis estimada de producto a partir de la dureza ingresada.
          </p>

          <form onSubmit={handleSubmit} className="row g-3 align-items-end">
            <div className="col-md-6">
              <label htmlFor="dureza" className="form-label">
                Dureza
              </label>
              <input
                id="dureza"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={dureza}
                onChange={(event) => setDureza(event.target.value)}
                placeholder="Ej.: 120"
              />
            </div>

            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100">
                Calcular
              </button>
            </div>
          </form>

          {error && <div className="alert alert-warning mt-3">{error}</div>}

          {resultado !== null && (
            <div className="alert alert-success mt-3 mb-0">
              <strong>Dosis estimada:</strong> {resultado.toFixed(2)}
            </div>
          )}

          <div className="mt-4 small text-muted">
            Fórmula utilizada: (dureza × 1000) / 300
          </div>
        </div>
      </div>
    </div>
  );
};

export default Herramientas;
