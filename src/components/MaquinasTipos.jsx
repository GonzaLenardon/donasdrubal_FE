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
  const [searchTerm, setSearchTerm] = useState('');
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
    navigate(`/clientes/${cliente.id}`, {
      state: { cliente: cliente },
    });
  };

  const formatFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

  const filteredMaquinaTipos = maquinaTipoList.filter(
    (m) =>
      m.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.modelo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="container_seccion">
        <div style={{ margin: '0 auto' }}>
          {/* HEADER */}
          <div className="header">
            <div>
              <h2 className="title">Tipos de Máquinas</h2>
              <p className="subtitle">
                {maquinaTipoList.length} Tipos de máquinas registrados
              </p>
            </div>
            <button className="btn-primary" onClick={modalNewMaquinaTipo}>
              <i className="bi bi-plus-lg"></i>
              Nuevo Tipo Máquina
            </button>
          </div>

          {/* BUSCADOR */}

          <div
            className="container-table rounded shadow-lg mb-2"
            style={{ background: '#1c4f1b36' }}
          >
            <div>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar tipo de máquina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABLA */}
          <div className="container-table rounded shadow-lg">
            <table
              className="table mb-0"
              style={{ tableLayout: 'fixed', width: '100%' }}
            >
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>
                    <i className="bi bi-tag me-1"></i>Tipo
                  </th>
                  <th style={{ width: '20%' }}>
                    <i className="bi bi-award me-1"></i>Marca
                  </th>
                  <th style={{ width: '20%' }}>
                    <i className="bi bi-box-seam me-1"></i>Modelo
                  </th>
                  <th style={{ width: '20%' }}>
                    <i className="bi bi-calendar-event me-1"></i>Fecha
                    Fabricación
                  </th>
                  <th className="text-center" style={{ width: '10%' }}>
                    <i className="bi bi-gear"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMaquinaTipos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Sin tipos de máquinas registrados
                    </td>
                  </tr>
                ) : (
                  filteredMaquinaTipos.map((maquina_tipo) => (
                    <tr key={maquina_tipo.id}>
                      <td>
                        <span className="table-text">{maquina_tipo.tipo}</span>
                      </td>
                      <td>
                        <span className="table-text">{maquina_tipo.marca}</span>
                      </td>
                      <td>
                        <span className="table-text">
                          {maquina_tipo.modelo}
                        </span>
                      </td>
                      <td>
                        <span className="table-text">
                          {formatFecha(maquina_tipo.fecha_fabricacion)}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-btn table-btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              modalUpMaquinaTipo(maquina_tipo);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Spinner loading={loading} msg={msg} />

      {/* MODAL FORMULARIO */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon">
                  <i className="bi bi-gear-fill"></i>
                </div>
                <div>
                  <h3 className="modal-title mb-1">
                    {tipoMaquina?.id
                      ? 'Actualizar Tipo Máquina'
                      : 'Nuevo Tipo de Máquina'}
                  </h3>
                  <p className="modal-subtitle mb-0">
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
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {errors.submit}
                </div>
              )}

              {/* Tipo */}
              <div className="form-group">
                <label htmlFor="tipo" className="form-label">
                  <i className="bi bi-tag-fill me-2"></i>Tipo de Máquina
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
                  <i className="bi bi-award-fill me-2"></i>Marca
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
                  <i className="bi bi-box-seam me-2"></i>Modelo
                </label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  className={`form-control ${errors.modelo ? 'is-invalid' : ''}`}
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
                  <i className="bi bi-calendar-event me-2"></i>Fecha de
                  Fabricación
                </label>
                <input
                  type="date"
                  id="fecha_fabricacion"
                  name="fecha_fabricacion"
                  className={`form-control ${errors.fecha_fabricacion ? 'is-invalid' : ''}`}
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

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={modalClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>Cancelar
                </button>
                <button
                  type="button"
                  className="btn-save"
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
