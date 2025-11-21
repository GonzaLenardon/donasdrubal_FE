import { useState } from 'react';
import { addMaquinas, updateMaquina } from '../api/maquinas';
import Spinner from '../components/Spinner.jsx';

export const ModalMaquinas = ({
  onClose,
  maquina,
  setMaquinaEdit,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState();

  if (!maquina) return null; // evita crasheos

  console.log('maquina ', maquina);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaquinaEdit((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitMaquina = async () => {
    try {
      setLoading(true);

      let resp;

      // si existe id → actualizar, si no → crear
      if (maquina?.id) {
        resp = await updateMaquina(maquina);
      } else {
        resp = await addMaquinas(maquina);
      }

      setMsg(resp.message);
      onSaved(); // refresca la lista
    } catch (error) {
      console.log(error.message);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
            <h5>{maquina.id ? 'Editar Máquina' : 'Agregar Máquina'}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="form-group mb-2 fw-bold">
              <label>Tipo de máquina</label>
              <input
                type="text"
                className="form-control"
                name="tipo_maquina"
                value={maquina.tipo_maquina || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-2 py-1 fw-bold">
              <label>Marca</label>
              <input
                type="text"
                className="form-control"
                name="marca"
                value={maquina.marca || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-2 py-1 fw-bold">
              <label>Modelo</label>
              <input
                type="text"
                className="form-control"
                name="modelo"
                value={maquina.modelo || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-2 py-1 fw-bold">
              <label>Responsable</label>
              <input
                type="text"
                className="form-control"
                name="responsable"
                value={maquina.responsable || ''}
                onChange={handleChange}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmitMaquina}
              >
                {maquina.id ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Spinner msg={msg} loading={loading} />
    </>
  );
};
