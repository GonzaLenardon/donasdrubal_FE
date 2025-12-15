import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner.jsx';
import { addCalibraciones, upCalibraciones } from '../api/calibraciones.js';

const opcionesEstado = ['Malo', 'Regular', 'Bueno', 'Muy bueno'];

export const ModalCalibraciones = ({ onClose, calibracion, onSaved }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (calibracion) {
      setForm({
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
          className="custom-modal"
          style={{
            maxWidth: '95vw',
            width: '95vw',
          }}
        >
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="fw-bold">
              {form?.id ? 'Editar Calibración' : 'Agregar Calibración'}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            {/* DATOS PRINCIPALES */}
            <div className="row mb-4">
              <div className="col-md-8">
                <label className="fw-bold">Responsable</label>
                <input
                  type="text"
                  className="form-control"
                  name="responsable"
                  value={form.responsable || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="fw-bold">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  name="fecha"
                  value={form.fecha || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ESTADOS + OBSERVACIONES */}
            <h4 className="fw-bold mb-3 border-bottom pb-2">
              Estados y Observaciones
            </h4>

            <div className="row">
              {camposEstado.map(({ estado, obs, label }) => (
                <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={estado}>
                  <div className="border rounded p-3 h-100 bg-light">
                    <label className="fw-bold mb-1">{label}</label>

                    <select
                      className="form-control mb-2"
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
                      className="form-control"
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

            {/* OBSERVACIONES GENERALES */}
            <div className="mt-4">
              <label className="fw-bold">Observaciones Generales</label>
              <textarea
                className="form-control"
                rows="4"
                name="Observaciones"
                value={form.Observaciones || ''}
                onChange={handleChange}
              />
            </div>

            {/* FOOTER */}
            <div className="modal-footer mt-4">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
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
