import React, { use, useEffect, useState } from 'react';
import { addCliente, allCliente, upCliente } from '../api/clientes.js';
import Modal from '../components/Modal.jsx'; // ✅ import del nuevo modal
import Spinner from './Spinner.jsx';
import { ToastContainer, Slide, toast } from 'react-toastify';
// import { Button } from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import { allIngenieros } from '../api/users.js';

const Clientes = () => {
  const [clienteList, setClienteList] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [modal, setModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [newCliente, SetNewCliente] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const all = async () => {
      getAllCliente();
      getAllIngenieros();
    };
    all();
  }, []);

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

  const updateCliente = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await upCliente(newCliente);

      setMsg(resp.mensaje);
    } catch (error) {
      setMsg(error.mensaje);
    } finally {
      getAllCliente();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const insertCliente = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await addCliente(newCliente);
      setMsg(resp.mensaje);
    } catch (error) {
      setMsg(error.mensaje);
    } finally {
      getAllCliente();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const modalUpCliente = (cliente) => {
    SetNewCliente(cliente);
    setIsUpdate(true);
    setModal(true);
  };

  const modalNewCliente = () => {
    SetNewCliente({
      categoria: '',
      razon_social: '',
      direccion_fiscal: '',
      cuil_cuit: '',
      iva_id: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      pais: '',
      estado: '',
      modo_ingreso: '',
      ingeniero_id: '',
      notas: '',
    });
    setIsUpdate(false);
    setModal(true);
  };

  useEffect(() => {
    console.log('first', newCliente);
  }, [newCliente]);

  const handleCliente = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewCliente((prev) => ({ ...prev, [name]: value }));
  };

  const modalClose = () => {
    setModal(false);
    SetNewCliente({});
  };

  const excluir = [
    'categoria',
    'direccion',
    'modo_ingreso',
    ' notas',
    'user_email',
    'user_nombre',
    'user_password',
    'notas',
  ]; // por ejemplo

  const validarCampos = () => {
    for (const [key, value] of Object.entries(newCliente)) {
      if (!excluir.includes(key)) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          console.log('key', key);
          toast.error(`Completar el campo: ${key}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleVer = async (cliente) => {
    /* navigate(`/cliente/${cliente.id}/detalles`, { state: { cliente } }); */
    navigate(`/cliente/${cliente.id}/detalles`, {
      state: { cliente: cliente },
    });
  };

  useEffect(() => {
    console.log('New Cliente', newCliente);
  }, [newCliente]);

  return (
    <>
      <div className="pozos-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2
              className="fw-bold text-white mb-1"
              style={{ fontSize: '2rem' }}
            >
              Clientes
            </h2>
            <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem' }}>
              {clienteList.length} Clientes registradas
            </p>
          </div>

          <button
            className="btn text-white d-flex align-items-center gap-2 shadow-lg pozos-btn-nuevo"
            onClick={modalNewCliente}
          >
            <i className="bi bi-plus-lg"></i>
            Nuevo Cliente
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
                    <i className="bi bi-person-badge me-2"></i>
                    Nombre
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-geo-alt me-2"></i>
                    Domicilio
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-envelope-at me-2"></i>
                    Email
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-telephone me-2"></i>
                    Teléfono
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-toggle-on me-2"></i>
                    Estado
                  </th>

                  <th
                    className="text-white fw-semibold py-3 px-4 text-center"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-tags me-2"></i>
                    Categoría
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
                {clienteList.map((cliente) => (
                  <tr
                    key={cliente.id}
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
                    <td className="py-1 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {cliente.razon_social}
                      </span>
                    </td>

                    <td className="py-1 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {cliente.direccion_fiscal}
                      </span>
                    </td>

                    <td className="py-1 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {cliente.email}
                      </span>
                    </td>

                    <td className="py-1 px-4">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {cliente.telefono}
                      </span>
                    </td>

                    <td className="py-1 px-4 text-center">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {cliente.estado}
                      </span>
                    </td>

                    <td className="py-1 px-4 text-center">
                      <span
                        className="fw-semibold text-white"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {cliente.categoria}
                      </span>
                    </td>

                    <td className="py-1 px-1">
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
                            modalUpCliente(cliente);
                          }}
                        >
                          <i className="bi bi-pencil me-1"></i>
                        </button>

                        <button
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            padding: '0.4rem 1rem',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVer(cliente);
                          }}
                        >
                          <i className="bi bi-eye me-1"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Spinner loading={loading} msg={msg} />

        {/* 🔹 Usamos el nuevo modal */}

        <Modal
          show={modal}
          title={isUpdate ? 'Actualizar Cliente' : 'Nuevo Cliente'}
          onClose={modalClose}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={modalClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={isUpdate ? updateCliente : insertCliente}
              >
                {isUpdate ? 'Actualizar' : 'Aceptar'}
              </button>
            </>
          }
        >
          <div className="modal-cliente-grid">
            {/* Fila 1 */}
            <div className="form-group-modal">
              <label>Razón Social</label>
              <input
                className="form-control rounded"
                name="razon_social"
                type="text"
                value={newCliente?.razon_social || ''}
                onChange={handleCliente}
                placeholder="Ingrese razón social"
              />
            </div>

            <div className="form-group-modal">
              <label>Domicilio Fiscal</label>
              <input
                className="form-control rounded"
                name="direccion_fiscal"
                type="text"
                value={newCliente?.direccion_fiscal || ''}
                onChange={handleCliente}
                placeholder="Calle, número, código postal"
              />
            </div>

            {/* Fila 2 */}
            <div className="form-group-modal">
              <label>CUIL / CUIT</label>
              <input
                className="form-control rounded"
                name="cuil_cuit"
                type="text"
                value={newCliente?.cuil_cuit || ''}
                onChange={handleCliente}
                placeholder="XX-XXXXXXXX-X"
              />
            </div>

            <div className="form-group-modal">
              <label>Condición IVA</label>
              <select
                className="form-select"
                name="iva_id"
                value={newCliente?.iva_id || ''}
                onChange={handleCliente}
              >
                <option value="" disabled>
                  Seleccione tipo impositivo
                </option>
                <option value="1">Responsable Inscripto</option>
                <option value="2">Consumidor Final</option>
                <option value="3">Exento</option>
                <option value="4">Autónomo</option>
              </select>
            </div>

            {/* Fila 3 */}
            <div className="form-group-modal">
              <label>Teléfono</label>
              <input
                className="form-control rounded"
                name="telefono"
                type="text"
                value={newCliente?.telefono || ''}
                onChange={handleCliente}
                placeholder="+54 9 11 XXXX-XXXX"
              />
            </div>

            <div className="form-group-modal">
              <label>Email</label>
              <input
                className="form-control rounded"
                name="email"
                type="email"
                value={newCliente?.email || ''}
                onChange={handleCliente}
                placeholder="ejemplo@email.com"
              />
            </div>

            {/* Fila 4 */}
            <div className="form-group-modal">
              <label>Ciudad</label>
              <input
                className="form-control rounded"
                name="ciudad"
                type="text"
                value={newCliente?.ciudad || ''}
                onChange={handleCliente}
                placeholder="Ej: Paraná"
              />
            </div>

            <div className="form-group-modal">
              <label>Provincia</label>
              <input
                className="form-control rounded"
                name="provincia"
                type="text"
                value={newCliente?.provincia || ''}
                onChange={handleCliente}
                placeholder="Ej: Entre Ríos"
              />
            </div>

            {/* Fila 5 */}
            <div className="form-group-modal">
              <label>País</label>
              <input
                className="form-control rounded"
                name="pais"
                type="text"
                value={newCliente?.pais || ''}
                onChange={handleCliente}
                placeholder="Ej: Argentina"
              />
            </div>

            <div className="form-group-modal">
              <label>Estado Cliente</label>
              <select
                className="form-select"
                name="estado"
                value={newCliente?.estado || ''}
                onChange={handleCliente}
              >
                <option value="" disabled>
                  Seleccione estado
                </option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            <div className="form-group-modal">
              <label>Ingeniero asignado</label>
              <select
                className="form-select"
                name="ingeniero_id"
                value={newCliente?.ingeniero_id || ''}
                onChange={handleCliente}
              >
                <option value="" disabled>
                  Ingeniero
                </option>

                {ingenieros.map((i) => (
                  <option value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fila 6 - Notas ocupa toda la fila */}
            <div className="form-group-modal form-group-full">
              <label>Notas</label>
              <textarea
                className="form-control rounded"
                name="notas"
                rows="3"
                value={newCliente?.notas || ''}
                onChange={handleCliente}
                placeholder="Información adicional del cliente..."
              />
            </div>
          </div>
        </Modal>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Slide}
        />
      </div>
    </>
  );
};

export default Clientes;
