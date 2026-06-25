import React from 'react';
import { formatFecha } from '../utils/formatFecha';

// ─── Sub-componente: Tarjeta de nota (solo lectura) ───────────────────────────

const NotaCardReadOnly = ({ nota }) => {
  const fechaFormateada = nota.fecha ? formatFecha(nota.fecha) : '—';

  return (
    <div className="nota-card">
      <div className="nota-card__header">
        <span className="nota-card__fecha">
          <i className="bi bi-calendar3 me-1"></i>
          {fechaFormateada}
        </span>
      </div>
      <p className="nota-card__comentario">{nota.comentario}</p>
    </div>
  );
};

// ─── Sub-componente: Grupo de notas por cliente ───────────────────────────────

const ClienteNotasGroup = ({ razonSocial, notas }) => (
  <div className="notas-cliente-group mb-4">
    <div className="nota-separador">
      <span>
        <i className="bi bi-building me-2"></i>
        {razonSocial}
      </span>
    </div>
    <div className="notas-lista">
      {notas.map((nota) => (
        <NotaCardReadOnly key={nota.id} nota={nota} />
      ))}
    </div>
  </div>
);

// ─── Componente principal: ModalNotasUsuario ──────────────────────────────────

const ModalNotasUsuario = ({ isOpen, onClose, notas = [], nombreUsuario }) => {
  if (!isOpen) return null;

  // Agrupar notas por cliente_id
  const notasPorCliente = notas.reduce((acc, nota) => {
    const clienteId = nota.cliente_id;
    if (!acc[clienteId]) {
      acc[clienteId] = {
        razonSocial: nota.cliente?.razon_social ?? `Cliente #${clienteId}`,
        notas: [],
      };
    }
    // Insertar manteniendo orden por fecha ascendente dentro del grupo
    acc[clienteId].notas.push(nota);
    return acc;
  }, {});

  // Ordenar notas dentro de cada grupo por fecha ascendente
  Object.values(notasPorCliente).forEach((grupo) => {
    grupo.notas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  });

  const grupos = Object.values(notasPorCliente);
  const totalNotas = notas.length;

  return (
    <div className="modal-overlay">
      <div
        className="modal-container modal-container--notas"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="modal-header">
          <div className="d-flex align-items-center gap-3">
            <div className="modal-icon-container">
              <i className="bi bi-journal-text"></i>
            </div>
            <div>
              <h3 className="modal-title-pozos mb-1">
                Notas de{nombreUsuario ?? 'usuario'}
              </h3>
              <p className="modal-subtitle-pozos mb-0">
                {totalNotas > 0
                  ? `${totalNotas} nota${totalNotas !== 1 ? 's' : ''} en ${grupos.length} cliente${grupos.length !== 1 ? 's' : ''}`
                  : 'Sin notas registradas'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body-pozos">
          {grupos.length > 0 ? (
            grupos.map((grupo) => (
              <ClienteNotasGroup
                key={grupo.razonSocial}
                razonSocial={grupo.razonSocial}
                notas={grupo.notas}
              />
            ))
          ) : (
            <div className="notas-empty">
              <i className="bi bi-journal-x"></i>
              <p>Este usuario no tiene notas registradas</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer justify-content-end">
          <button type="button" className="btn-cancel" onClick={onClose}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNotasUsuario;
