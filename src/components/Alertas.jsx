import React, { useState } from 'react';
import { alertasNuevaCampaña } from '../api/alertas';

const Alertas = () => {
  const [fechas, setFechas] = useState({
    fecha_vencimiento: '',
    fecha_alerta: '',
  });

  const generarAlertas = async () => {
    try {
      const res = await alertasNuevaCampaña(fechas);
      console.log('respuestas ', res);
    } catch (error) {
      console.log('Error', error);
    }
  };

  return (
    <div>
      <h1>Alertas</h1>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="text-white fw-semibold">Fecha Vencimiento</label>
          <input
            type="date"
            className="form-control"
            value={fechas.vencimientos}
            onChange={(e) =>
              setFechas({ ...fechas, fecha_vencimiento: e.target.value })
            }
          />
        </div>
        <div className="col-md-4">
          <label className="text-white fw-semibold">Fecha Alertas</label>
          <input
            type="date"
            className="form-control"
            value={fechas.alertas}
            onChange={(e) =>
              setFechas({ ...fechas, fecha_alerta: e.target.value })
            }
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btn-light w-100"
            onClick={generarAlertas}
            /*  disabled={!desde && !hasta} */
          >
            Generar Alertas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alertas;
