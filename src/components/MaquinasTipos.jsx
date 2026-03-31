import React, { useEffect, useState } from 'react';
import {
  addMaquinaTipo,
  allMaquinaTipo,
  updateMaquinaTipo,
} from '../api/maquinas_tipos.js';
import Spinner from './Spinner.jsx';
import { ToastContainer, Slide, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MaquinaTipo = () => {
  const [maquinaTipoList, setMaquinaTipoList] = useState([]);
  const [modal, setModal] = useState(false);
  const [tipoMaquina, setTipoMaquina] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllMaquinaTipo();
  }, []);

  const getAllMaquinaTipo = async () => {
    try {
      const resp = await allMaquinaTipo();
      console.log('MaquinaEstado', resp.data);
      setMaquinaTipoList(resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error.data);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validarCampos()) return;

      setIsSubmitting(true);
      setLoading(true);
      setModal(false);

      let resp;

      if (tipoMaquina?.id) {
        resp = await updateMaquinaTipo(tipoMaquina);
      } else {
        resp = await addMaquinaTipo(tipoMaquina);
      }

      setMsg(resp.message);
    } catch (error) {
      setMsg(error.message);
      setErrors({ submit: error.message });
    } finally {
      getAllMaquinaTipo();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setIsSubmitting(false);
      setMsg('');
    }
  };

  const modalUpMaquinaTipo = (maquina_tipo) => {
    setTipoMaquina({
      ...maquina_tipo,
      fecha_fabricacion: maquina_tipo.fecha_fabricacion?.split('T')[0] || '',
    });

    setErrors({});
    setModal(true);
  };

  const modalNewMaquinaTipo = () => {
    setTipoMaquina({
      tipo: '',
      marca: '',
      modelo: '',
      fecha_fabricacion: '',
    });
    setErrors({});
    setModal(true);
  };

  useEffect(() => {
    console.log('first', tipoMaquina);
  }, [tipoMaquina]);

  const handleCliente = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setTipoMaquina((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const modalClose = () => {
    setModal(false);
    setTipoMaquina({});
    setErrors({});
  };

  const excluir = []; // por ejemplo

  const validarCampos = () => {
    const newErrors = {};

    for (const [key, value] of Object.entries(tipoMaquina)) {
      if (!excluir.includes(key)) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          console.log('key', key);
          newErrors[key] = `Este campo es requerido`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor completa todos los campos requeridos');
      return false;
    }

    return true;
  };

  const handleVer = async (cliente) => {
    navigate(`/cliente/${cliente.id}/detalles`, {
      state: { cliente: cliente },
    });
  };

  const formatFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

  return (
    <>
      <div className="pozos-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2
              className="fw-bold text-success mb-1"
              style={{ fontSize: '2rem' }}
            >
              Tipos Maquinas
            </h2>
            <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem' }}>
              {maquinaTipoList.length} Maquinas registradas
            </p>
          </div>

          <button
            className="btn text-white d-flex align-items-center gap-2 shadow-lg pozo-btn-nuevo"
            onClick={modalNewMaquinaTipo}
          >
            <i className="bi bi-plus-lg"></i>
            Nuevo Tipo Maquina
          </button>
        </div>

        <div
          className="rounded shadow-lg"
          style={{
            background: 'linear-gradient(145deg, #4a5d7c 0%, #3d4d69 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              className="table table-hover mb-0"
              style={{
                '--bs-table-bg': 'transparent',
                '--bs-table-accent-bg': 'transparent',
                '--bs-table-striped-bg': 'transparent',
                '--bs-table-hover-bg': 'rgba(102, 126, 234, 0.1)',
                '--bs-table-color': '#ffffff',
                '--bs-table-border-color': 'rgba(255,255,255,0.15)',
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                    borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                  }}
                >
                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-tag me-2"></i>
                    Tipo
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-award me-2"></i>
                    Marca
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Modelo
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-calendar-event me-2"></i>
                    Fecha Fabricación
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4 text-center"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {maquinaTipoList.map((maquina_tipo) => (
                  <tr
                    key={maquina_tipo.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'rgba(102, 126, 234, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="py-3 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {maquina_tipo.tipo}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {maquina_tipo.marca}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {maquina_tipo.modelo}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {formatFecha(maquina_tipo.fecha_fabricacion)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(102, 126, 234, 0.2)',
                            color: '#93c5fd',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            padding: '0.4rem 1rem',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            modalUpMaquinaTipo(maquina_tipo);
                          }}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Spinner loading={loading} msg={msg} />

      {/* Modal con el nuevo estilo */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header-pozos">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon-container">
                  <i className="bi bi-gear-fill"></i>
                </div>
                <div>
                  <h3 className="modal-title-pozos mb-1">
                    {tipoMaquina?.id
                      ? 'Actualizar Tipo Máquina'
                      : 'Nuevo Tipo de Máquina'}
                  </h3>
                  <p className="modal-subtitle-pozos mb-0">
                    {tipoMaquina?.id
                      ? 'Modifica la información del tipo de máquina'
                      : 'Completa los datos del nuevo tipo de máquina'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={modalClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body-pozos">
              {/* Error general */}
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {errors.submit}
                </div>
              )}

              {/* Tipo */}
              <div className="form-group">
                <label htmlFor="tipo" className="form-label">
                  <i className="bi bi-tag-fill me-2"></i>
                  Tipo de Máquina
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  className={`form-control ${errors.tipo ? 'is-invalid' : ''}`}
                  value={tipoMaquina?.tipo || ''}
                  onChange={handleCliente}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>
                    Seleccione un tipo
                  </option>
                  <option value="Autopropulsada">Autopropulsada</option>
                  <option value="Suspendida">Suspendida</option>
                  <option value="Remolque">Remolque</option>
                  <option value="Fija">Fija</option>
                </select>
                {errors.tipo && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.tipo}
                  </div>
                )}
              </div>

              {/* Marca */}
              <div className="form-group">
                <label htmlFor="marca" className="form-label">
                  <i className="bi bi-award-fill me-2"></i>
                  Marca
                </label>
                <input
                  type="text"
                  id="marca"
                  name="marca"
                  className={`form-control ${errors.marca ? 'is-invalid' : ''}`}
                  placeholder="Ej: John Deere"
                  value={tipoMaquina?.marca || ''}
                  onChange={handleCliente}
                  disabled={isSubmitting}
                />
                {errors.marca && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.marca}
                  </div>
                )}
              </div>

              {/* Modelo */}
              <div className="form-group">
                <label htmlFor="modelo" className="form-label">
                  <i className="bi bi-box-seam me-2"></i>
                  Modelo
                </label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  className={`form-control ${
                    errors.modelo ? 'is-invalid' : ''
                  }`}
                  placeholder="Ej: 4730"
                  value={tipoMaquina?.modelo || ''}
                  onChange={handleCliente}
                  disabled={isSubmitting}
                />
                {errors.modelo && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.modelo}
                  </div>
                )}
              </div>

              {/* Fecha de Fabricación */}
              <div className="form-group">
                <label htmlFor="fecha_fabricacion" className="form-label">
                  <i className="bi bi-calendar-event me-2"></i>
                  Fecha de Fabricación
                </label>
                <input
                  type="date"
                  id="fecha_fabricacion"
                  name="fecha_fabricacion"
                  className={`form-control ${
                    errors.fecha_fabricacion ? 'is-invalid' : ''
                  }`}
                  placeholder="Ej: 2020 o 01/2020"
                  value={tipoMaquina?.fecha_fabricacion || ''}
                  onChange={handleCliente}
                  disabled={isSubmitting}
                />
                {errors.fecha_fabricacion && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.fecha_fabricacion}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancelar-pozos"
                  onClick={modalClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-guardar-pozos"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {tipoMaquina?.id ? 'Actualizar' : 'Crear Tipo Máquina'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaquinaTipo;
