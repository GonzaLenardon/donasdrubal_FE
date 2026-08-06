import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  UserCog,
  RotateCcw,
  FileBarChart,
} from 'lucide-react';

import { resumenSemanal } from '../api/informes';
import { allCliente } from '../api/clientes';
import { allIngenieros } from '../api/users';

const ReporteSemanal = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clienteList, setClienteList] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [ingenieroId, setIngenieroId] = useState('');
  const [intentoEnvio, setIntentoEnvio] = useState(false);

  useEffect(() => {
    getAllCliente();
    getAllIngenieros();
  }, []);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setClienteId('');
    setIngenieroId('');
    setError(null);
    setIntentoEnvio(false);
  };

  const fechasCompletas = Boolean(fechaInicio && fechaFin);
  const rangoValido = !fechasCompletas || fechaInicio <= fechaFin;
  const formularioValido = fechasCompletas && rangoValido;

  const mensajeError = (() => {
    if (!intentoEnvio) return null;
    if (!fechasCompletas)
      return 'Seleccioná ambas fechas para generar el reporte.';
    if (!rangoValido)
      return 'La fecha "Desde" no puede ser posterior a "Hasta".';
    return null;
  })();

  const ClienteFilter = ({ value, onChange, clientes }) => (
    <div className="col-md-3 reporte-semanal-field">
      <label className="fw-semibold">
        <Users size={16} />
        Cliente <span className="text-white-50 fw-normal">(opcional)</span>
      </label>
      <select className="form-control" value={value} onChange={onChange}>
        <option value="">Todos los clientes</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.razon_social || cliente.nombre || `Cliente ${cliente.id}`}
          </option>
        ))}
      </select>
    </div>
  );

  const IngenieroFilter = ({ value, onChange, ingenieros }) => (
    <div className="col-md-3 reporte-semanal-field">
      <label className="fw-semibold">
        <UserCog size={16} />
        Ingeniero <span className="text-white-50 fw-normal">(opcional)</span>
      </label>
      <select className="form-control" value={value} onChange={onChange}>
        <option value="">Todos los ingenieros</option>
        {ingenieros.map((ingeniero) => (
          <option key={ingeniero.id} value={ingeniero.id}>
            {ingeniero.nombre ||
              ingeniero.nombre_completo ||
              ingeniero.email ||
              `Ingeniero ${ingeniero.id}`}
          </option>
        ))}
      </select>
    </div>
  );

  // ─────────────────────────────────────────────
  // Handler
  // ─────────────────────────────────────────────

  const handleGenerarReporte = async () => {
    setIntentoEnvio(true);
    if (!formularioValido) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await resumenSemanal(
        fechaInicio,
        fechaFin,
        clienteId,
        ingenieroId,
      );
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

  const getAllCliente = async () => {
    try {
      const resp = await allCliente();
      console.log('clientes', resp.data);
      setClienteList(resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error.data);
    }
  };

  const getAllIngenieros = async () => {
    try {
      const resp = await allIngenieros();
      console.log('Ingeniero', resp.data);
      setIngenieros(resp.data);
    } catch (error) {
      console.error('Error al traer Ingenieros:', error.data);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="container-fluid p-2 ">
      {/* ── Header ── */}

      <div className="d-flex align-items-center gap-2 mb-3">
        <FileBarChart className="me-2 mb-1" size={24} />
        <h2 className="title">Resumen de actividad</h2>
      </div>

      {/* ── Formulario ── */}
      <div className="reporte-semanal-wrapper">
        {/* Descripción */}
        <p className="reporte-semanal-desc mb-1">
          Seleccioná un rango de fechas para generar el resumen de actividad de
          todos los clientes con movimientos en ese período.
        </p>

        {/* Inputs */}
        <div className="row g-3">
          <div className="col-md-3 reporte-semanal-field">
            <label className="fw-semibold">
              <Calendar size={16} />
              Desde <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-control ${intentoEnvio && !fechaInicio ? 'is-invalid' : ''}`}
              value={fechaInicio}
              max={fechaFin || undefined}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="col-md-3 reporte-semanal-field">
            <label className="fw-semibold">
              <Calendar size={16} />
              Hasta <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-control ${intentoEnvio && !fechaFin ? 'is-invalid' : ''}`}
              value={fechaFin}
              min={fechaInicio || undefined}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setError(null);
              }}
            />
          </div>

          <ClienteFilter
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              setError(null);
            }}
            clientes={clienteList}
          />

          <IngenieroFilter
            value={ingenieroId}
            onChange={(e) => {
              setIngenieroId(e.target.value);
              setError(null);
            }}
            ingenieros={ingenieros}
          />
          {/* Leyenda de campos obligatorios */}
          <p className="reporte-semanal-legend">
            <span className="text-danger">*</span> Campos obligatorios
          </p>
        </div>

        {/* Limpiar filtros */}
        <div className="reporte-semanal-actions">
          <button
            className="btn-clear-filters"
            onClick={limpiarFiltros}
            disabled={!fechaInicio && !fechaFin && !clienteId && !ingenieroId}
          >
            <RotateCcw size={15} />
            Limpiar filtros
          </button>
        </div>

        {/* Error */}
        {(mensajeError || error) && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{mensajeError || error}</span>
          </div>
        )}
      </div>

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
  );
};

export default ReporteSemanal;
