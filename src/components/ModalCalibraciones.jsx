import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner.jsx';
import { addCalibraciones, upCalibraciones } from '../api/calibraciones.js';

const opcionesEstado = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'No aplica'];
const emptyCalibracion = {
      fecha:'',
      responsable:'', 
      estado_maquina:'',
      observaciones_estado_maquina:'',
      estado_bomba:'',
      observaciones_estado_bomba:'',
      estado_agitador:'',
      observaciones_estado_agitador:'', 
      estado_filtroPrimario:'',
      observarciones_estado_filtroPrimario:'',
      estado_filtroSecundario:'',
      observaciones_filtroSecundario:'', 
      estado_FiltroLinea:'',
      observaciones_estado_FiltroLinea:'',
      estado_manguerayconexiones:'',
      observaciones_estado_manguerayconexiones:'',
      estado_antigoteo:'',
      observaciones_estado_antigoteo:'',
      estado_limpiezaTanque:'',
      observaciones_estado_limpiezaTanque:'',
      estabilidadVerticalBotalon:'',  
      observaciones_estabilidadVerticalBotalon:'',
      estado_pastillas:'',
      observaciones_estado_pastillas:'',
      presion_unimap:'',
      presion_computadora:'',
      presion_manometro:'',
      observaciones_acronex:'',
      Observaciones:'',

    }



export const ModalCalibraciones = ({ onClose, calibracion, onSaved }) => {
  const [form, setForm] = useState({...emptyCalibracion});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (calibracion) {
      setForm({
        ...emptyCalibracion,
        ...calibracion,
        fecha: calibracion.fecha ? calibracion.fecha.split('T')[0] : '',
      });
    }
  }, [calibracion]);

  useEffect(() => {
    console.log('valorForm', form);
  }, [form]);

  if (!calibracion) return null;

  /** 🔗 Mapa estado → observación */
  const camposEstado = [
    {
      estado: 'estado_maquina',
      obs: 'observaciones_estado_maquina',
      label: 'Estado Máquina',
    },
    {
      estado: 'estado_bomba',
      obs: 'observaciones_estado_bomba',
      label: 'Bomba',
    },
    {
      estado: 'estado_agitador',
      obs: 'observaciones_estado_agitador',
      label: 'Agitador',
    },
    {
      estado: 'estado_filtroPrimario',
      obs: 'observarciones_estado_filtroPrimario',
      label: 'Filtro Primario',
    },
    {
      estado: 'estado_filtroSecundario',
      obs: 'observaciones_filtroSecundario',
      label: 'Filtro Secundario',
    },
    {
      estado: 'estado_FiltroLinea',
      obs: 'observaciones_estado_FiltroLinea',
      label: 'Filtro Línea',
    },
    {
      estado: 'estado_manguerayconexiones',
      obs: 'observaciones_estado_manguerayconexiones',
      label: 'Mangueras y Conexiones',
    },
    {
      estado: 'estado_antigoteo',
      obs: 'observaciones_estado_antigoteo',
      label: 'Sistema Antigoteo',
    },
    {
      estado: 'estado_limpiezaTanque',
      obs: 'observaciones_estado_limpiezaTanque',
      label: 'Limpieza Tanque',
    },
    {
      estado: 'estabilidadVerticalBotalon',
      obs: 'observaciones_estabilidadVerticalBotalon',
      label: 'Estabilidad Botalón',
    },
    {
      estado: 'estado_pastillas',
      obs: 'observaciones_estado_pastillas',
      label: 'Pastillas',
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let resp;
      if (form.id) {
        const { id, ...formSinId } = form;
        resp = await upCalibraciones(id, formSinId);
      } else {
        resp = await addCalibraciones(form);
      }

      setMsg(resp.message);
      onSaved();
    } catch (error) {
      console.error(error.message);
    } finally {
      await new Promise((res) => setTimeout(res, 2000));
      onClose();
      setLoading(false);
      setMsg('');
    }
  };

  return (
    <>
      {/* OVERLAY */}
<div className="modal-overlay">
  {/* MODAL ANCHO */}
  <div
    className="modal-container"
    style={{
      maxWidth: '95vw',
      width: '95vw',
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {/* HEADER */}
    <div className="modal-header-pozos">
      <div className="d-flex align-items-center gap-3">
        <div className="modal-icon-container">
          <i className="bi bi-gear-wide-connected"></i>
        </div>
        <div>
          <h3 className="modal-title-pozos mb-1">
            {form?.id ? 'Editar Calibración' : 'Agregar Calibración'}
          </h3>
          <p className="modal-subtitle-pozos mb-0">
            {form?.id
              ? 'Modifica la información de la calibración'
              : 'Completa los datos de la nueva calibración'}
          </p>
        </div>
      </div>
      <button className="modal-close-btn" onClick={onClose}>
        <i className="bi bi-x-lg"></i>
      </button>
    </div>

    {/* BODY */}
    <div className="modal-body-pozos">
      {/* DATOS PRINCIPALES */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="form-group-pozos">
            <label htmlFor="responsable" className="form-label-pozos">
              <i className="bi bi-person-fill me-2"></i>
              Responsable
            </label>
            <input
              type="text"
              id="responsable"
              className="form-control-pozos"
              name="responsable"
              placeholder="Ej: Juan Pérez"
              value={form.responsable || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group-pozos">
            <label htmlFor="fecha" className="form-label-pozos">
              <i className="bi bi-calendar-fill me-2"></i>
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              className="form-control-pozos"
              name="fecha"
              value={form.fecha || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* ESTADOS + OBSERVACIONES */}
      <h4 className="fw-bold mb-3 border-bottom pb-2">
        Estados y Observaciones
      </h4>

      <div className="row g-3">
        {camposEstado.map(({ estado, obs, label }) => (
          <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={estado}>
            <div className="border rounded p-3 h-100 bg-dark-pozos">
              <label className="form-label-pozos mb-2">
                <i className="bi bi-clipboard-check me-2"></i>
                {label}
              </label>

              <select
                className="form-control-pozos mb-2"
                name={estado}
                value={form[estado] || ''}
                onChange={handleChange}
              >
                <option value="">Seleccione estado</option>
                {opcionesEstado.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>

              <textarea
                className="form-control-pozos"
                rows="2"
                placeholder="Observaciones..."
                name={obs}
                value={form[obs] || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        ))}
      </div>

      {/* PRESIONES  */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="form-group-pozos">
            <label htmlFor="presion_unimap" className="form-label-pozos">
              <i className="bi bi-speedometer2 me-2"></i>
              Presión Unimap (bares)
            </label>
            <input
              type="number"
              id="presion_unimap"
              className="form-control-pozos"
              name="presion_unimap"
              placeholder="Ej: 3.5"
              value={form.presion_unimap || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group-pozos">
            <label htmlFor="presion_computadora" className="form-label-pozos">
              <i className="bi bi-speedometer2 me-2"></i>
              Presión Computadora (bares)
            </label>
            <input
              type="number"
              id="presion_computadora"
              className="form-control-pozos"
              name="presion_computadora"
              placeholder="Ej: 3.5"
              value={form.presion_computadora || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group-pozos">
            <label htmlFor="presion_manometro" className="form-label-pozos">
              <i className="bi bi-speedometer2 me-2"></i>
              Presión Manómetro (bares)
            </label>
            <input
              type="number"
              id="presion_manometro"
              className="form-control-pozos"
              name="presion_manometro"
              placeholder="Ej: 3.5"
              value={form.presion_manometro || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* OBSERVACIONES ACRONEX */}
      <div className="form-group-pozos mt-4">
        <label htmlFor="observaciones_acronex" className="form-label-pozos">
          <i className="bi bi-chat-left-text-fill me-2"></i>
          Observaciones ACRONEX
        </label>
        <textarea
          id="observaciones_acronex"
          className="form-control-pozos"
          rows="4"
          placeholder="Ingrese observaciones de ACRONEX..."
          name="observaciones_acronex"
          value={form.observaciones_acronex || ''}
          onChange={handleChange}
        />
      </div>

      {/* OBSERVACIONES GENERALES */}
      <div className="form-group-pozos mt-4">
        <label htmlFor="Observaciones" className="form-label-pozos">
          <i className="bi bi-chat-left-text-fill me-2"></i>
          Observaciones Generales
        </label>
        <textarea
          id="Observaciones"
          className="form-control-pozos"
          rows="4"
          placeholder="Ingrese observaciones generales..."
          name="Observaciones"
          value={form.Observaciones || ''}
          onChange={handleChange}
        />
      </div>

      {/* FOOTER */}
      <div className="modal-footer-pozos mt-4">
        <button
          type="button"
          className="btn-cancelar-pozos"
          onClick={onClose}
        >
          <i className="bi bi-x-circle me-2"></i>
          Cancelar
        </button>
        <button
          type="button"
          className="btn-guardar-pozos"
          onClick={handleSubmit}
        >
          <i className="bi bi-check-circle me-2"></i>
          {form?.id ? 'Actualizar' : 'Agregar'}
        </button>
      </div>
    </div>
  </div>
</div>

      <Spinner msg={msg} loading={loading} />
    </>
  );
};
