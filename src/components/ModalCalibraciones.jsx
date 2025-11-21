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

      console.log('useEffect ', calibracion);
    }
  }, [calibracion]);

  if (!calibracion) return null;

  const formateo = {
    Observaciones: 'Observaciones',
    estabilidadVerticalBotalon: 'Estabilidad Vertical Botalon',
    estado_FiltroLinea: 'Estado Filtro Linea',
    estado_agitador: 'Estado Agitador',
    estado_antigoteo: 'Estado Antigoteo',
    estado_bomba: 'Estado Bomba',
    estado_filtroPrimario: 'Estado Filtro Primario',
    estado_filtroSecundario: 'Estado Filtro Secundario',
    estado_limpiezaTanque: 'Estado Limpieza Tanque',
    estado_manguerayconexiones: 'Estado Manguera y Conexiones',
    estado_maquina: 'Estado Maquina',
    estado_pastillas: 'Estado Pastillas',
    fecha: 'Fecha',
    id: 'Id',
    maquina_id: 'Maquina id',
    responsable: 'Responsable',
  };

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
      console.log(error.message);
    } finally {
      await new Promise((res) => setTimeout(res, 2000));
      onClose();
      setLoading(false);
      setMsg('');
    }
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="custom-modal">
          <div className="modal-header">
            <h5>{form?.id ? 'Editar Calibración' : 'Agregar Calibración'}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* --- Datos principales --- */}

            <div className="row">
              <div className="form-group mb-2 fw-bold col-md-7">
                <label>Responsable</label>
                <input
                  type="text"
                  className="form-control"
                  name="responsable"
                  value={form.responsable || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-2 fw-bold col-md-4">
                <label>Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  name="fecha"
                  value={form.fecha || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/*     <div className="form-group mb-3 fw-bold">
              <label>Máquina ID</label>
              <input
                type="number"
                className="form-control"
                name="maquina_id"
                value={calibracion.maquina_id || ''}
                onChange={handleChange}
              />
            </div> */}

            {/* --- Estados en grilla --- */}
            <h6 className="fw-bold mt-3 mb-2 bg-secondary d-flex justify-content-center fs-3 py-2 rounded mt-2">
              Estados de la máquina
            </h6>

            <div className="row">
              {[
                'estabilidadVerticalBotalon',
                'estado_FiltroLinea',
                'estado_agitador',
                'estado_antigoteo',
                'estado_bomba',
                'estado_filtroPrimario',
                'estado_filtroSecundario',
                'estado_limpiezaTanque',
                'estado_manguerayconexiones',
                'estado_maquina',
                'estado_pastillas',
              ].map((campo) => (
                <div className="col-md-4 mb-3" key={campo}>
                  <label className="fw-bold">{formateo[campo] || campo}</label>
                  <select
                    className="form-control"
                    name={campo}
                    value={form[campo] || ''}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione...</option>
                    {opcionesEstado.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* --- Observaciones --- */}
            <div className="form-group mb-3 fw-bold">
              <label>Observaciones</label>
              <textarea
                className="form-control"
                rows="3"
                name="Observaciones"
                value={form.Observaciones || ''}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="modal-footer">
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
