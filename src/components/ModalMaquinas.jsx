import { useState, useEffect } from 'react';
import { addMaquinas, updateMaquina } from '../api/maquinas';
import { allMaquinaTipo } from '../api/maquinas_tipos.js';
import Spinner from '../components/Spinner.jsx';

export const ModalMaquinas = ({
  onClose,
  maquinaEdit,
  setMaquinaEdit,
  onSaved,
  onlyView,
}) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState();
  const [tipos, setTipos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Maquina Edit', maquinaEdit);
  }, [maquinaEdit]);

  useEffect(() => {
    const cargarTipos = async () => {
      const resp = await allMaquinaTipo();
      console.log('maquinas_tipos ', resp.data);
      setTipos(resp.data);
    };
    cargarTipos();
  }, []);

  if (!maquinaEdit) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaquinaEdit((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validarCampos = () => {
    const newErrors = {};
    const camposRequeridos = [
      'tipo_maquina',
      'responsable',
      'ancho_trabajo',
      'numero_picos',
      'distancia_entrePicos',
      'capacidad_tanque',
      'sistema_corte',
    ];

    camposRequeridos.forEach((campo) => {
      const valor = maquinaEdit[campo];
      if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
        newErrors[campo] = 'Este campo es requerido';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmitMaquina = async () => {
    // Validar campos antes de enviar
    if (!validarCampos()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      let resp;

      if (maquinaEdit?.id) {
        resp = await updateMaquina(maquinaEdit);
      } else {
        resp = await addMaquinas(maquinaEdit);
      }

      setMsg(resp.message);
      onSaved();

      // Solo cerrar si todo fue exitoso
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onClose();
    } catch (error) {
      console.log(error.message);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      setMsg('');
    }
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="d-flex align-items-center gap-3">
              <div className="modal-icon-container">
                <i className="bi bi-gear-wide-connected"></i>
              </div>
              <div>
                <h3 className="modal-title mb-1">
                  {maquinaEdit.id ? 'Editar Máquina' : 'Nueva Máquina'}
                </h3>
                <p className="modal-subtitle mb-0">
                  {maquinaEdit.id
                    ? 'Modifica la información de la máquina'
                    : 'Completa los datos de la nueva máquina'}
                </p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Error general */}
            {errors.submit && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errors.submit}
              </div>
            )}

            {/* Tipo de Máquina */}
            <div className="form-group">
              <label htmlFor="tipo_maquina" className="form-label">
                <i className="bi bi-tag-fill me-2"></i>
                Tipo de Máquina
              </label>
              <select
                id="tipo_maquina"
                name="tipo_maquina"
                className={`form-control ${
                  errors.tipo_maquina ? 'is-invalid' : ''
                }`}
                value={maquinaEdit.tipo_maquina || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Seleccione un tipo...</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tipo} - {t.marca} - {t.modelo}
                  </option>
                ))}
              </select>
              {errors.tipo_maquina && (
                <div className="invalid-feedback">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.tipo_maquina}
                </div>
              )}
            </div>

            {/* Fila 1: Operario y Ancho Trabajo */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="responsable" className="form-label">
                    <i className="bi bi-person-fill me-2"></i>
                    Operario
                  </label>
                  <input
                    type="text"
                    id="responsable"
                    name="responsable"
                    className={`form-control ${
                      errors.responsable ? 'is-invalid' : ''
                    }`}
                    placeholder="Ej: Juan Pérez"
                    value={maquinaEdit?.responsable || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.responsable && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.responsable}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="ancho_trabajo" className="form-label">
                    <i className="bi bi-arrows-expand me-2"></i>
                    Ancho Trabajo
                  </label>
                  <input
                    type="text"
                    id="ancho_trabajo"
                    name="ancho_trabajo"
                    className={`form-control ${
                      errors.ancho_trabajo ? 'is-invalid' : ''
                    }`}
                    placeholder="Ej: 24 metros"
                    value={maquinaEdit?.ancho_trabajo || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.ancho_trabajo && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.ancho_trabajo}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fila 2: Número Picos y Distancia entre Picos */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="numero_picos" className="form-label">
                    <i className="bi bi-hash me-2"></i>
                    Número Picos
                  </label>
                  <input
                    type="text"
                    id="numero_picos"
                    name="numero_picos"
                    className={`form-control ${
                      errors.numero_picos ? 'is-invalid' : ''
                    }`}
                    placeholder="Ej: 48"
                    value={maquinaEdit?.numero_picos || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.numero_picos && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.numero_picos}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="distancia_entrePicos" className="form-label">
                    <i className="bi bi-rulers me-2"></i>
                    Distancia entre Picos
                  </label>
                  <input
                    type="text"
                    id="distancia_entrePicos"
                    name="distancia_entrePicos"
                    className={`form-control ${
                      errors.distancia_entrePicos ? 'is-invalid' : ''
                    }`}
                    placeholder="Ej: 0.5 metros"
                    value={maquinaEdit?.distancia_entrePicos || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.distancia_entrePicos && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.distancia_entrePicos}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fila 3: Capacidad Tanque y Sistema Corte */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="capacidad_tanque" className="form-label">
                    <i className="bi bi-droplet-half me-2"></i>
                    Capacidad Tanque
                  </label>
                  <input
                    type="text"
                    id="capacidad_tanque"
                    name="capacidad_tanque"
                    className={`form-control ${
                      errors.capacidad_tanque ? 'is-invalid' : ''
                    }`}
                    placeholder="Ej: 3000 litros"
                    value={maquinaEdit?.capacidad_tanque || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.capacidad_tanque && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.capacidad_tanque}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="tipo_maquina" className="form-label">
                    <i className="bi bi-tag-fill me-2"></i>
                    Sistema de Corte
                  </label>
                  <select
                    id="sistema_corte"
                    name="sistema_corte"
                    className={`form-control ${
                      errors.sistema_corte ? 'is-invalid' : ''
                    }`}
                    value={maquinaEdit.sistema_corte || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccione un sistema corte...</option>

                    <option key={1} value={'Electroválvula'}>
                      Electroválvula
                    </option>
                    <option key={2} value={'Neumatico'}>
                      Neuamatico
                    </option>
                    <option key={3} value={'PWN'}>
                      PWN
                    </option>
                    <option key={4} value={'PWN pico a pico'}>
                      PWN pico a pico
                    </option>
                  </select>
                  {errors.tipo_maquina && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.tipo_maquina}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}

            {!onlyView && (
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSubmitMaquina}
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
                      {maquinaEdit.id ? 'Actualizar' : 'Crear Máquina'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Spinner msg={msg} loading={loading} />
    </>
  );
};
