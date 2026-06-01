import { useState } from 'react';

import { resumenSemanal } from '../api/informes';

const ReporteSemanal = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setError(null);
  };

  const formularioValido = fechaInicio && fechaFin && fechaInicio <= fechaFin;

  // ─────────────────────────────────────────────
  // Handler
  // ─────────────────────────────────────────────

  const handleGenerarReporte = async () => {
    if (!formularioValido) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await resumenSemanal(fechaInicio, fechaFin);
      const url = URL.createObjectURL(
        new Blob([blob], { type: 'application/pdf' }),
      );
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('No se pudo generar el reporte. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="container_seccion">
      {/* ── Header ── */}
      <div className="header">
        <h2 className="header-title">Resumen de actividad</h2>
      </div>

      {/* ── Formulario ── */}
      <div className="p-4">
        {/* Descripción */}
        <p className="text-white-50 mb-4">
          Seleccioná un rango de fechas para generar el resumen de actividad de
          todos los clientes con movimientos en ese período.
        </p>

        {/* Inputs */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="text-white fw-semibold">Desde</label>
            <input
              type="date"
              className="form-control"
              value={fechaInicio}
              max={fechaFin || undefined}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="col-md-4">
            <label className="text-white fw-semibold">Hasta</label>
            <input
              type="date"
              className="form-control"
              value={fechaFin}
              min={fechaInicio || undefined}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-light w-100"
              onClick={limpiarFiltros}
              disabled={!fechaInicio && !fechaFin}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 mb-4"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{error}</span>
          </div>
        )}

        {/* Acción */}
        <div className="modal-footer">
          <button
            className="btn-save d-flex align-items-center gap-2"
            onClick={handleGenerarReporte}
            disabled={!formularioValido || loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                Generando...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-pdf-fill" />
                Generar reporte PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReporteSemanal;
