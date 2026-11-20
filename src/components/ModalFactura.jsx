import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { remitosDisponibles, addFactura } from '../api/facturas';

const fechaHoy = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

const ModalFactura = ({
  clientes,
  remitoInicial = null,
  clienteInicial = null,
  fechaInicial = null,
  onClose,
  onSave,
}) => {
  const remitoInicialRef = useRef(remitoInicial);

  const [form, setForm] = useState({
    cliente_id: String(
      remitoInicial?.destination_client_id || clienteInicial || '',
    ),
    tipo: 'FACTURA',
    fecha: fechaInicial || fechaHoy(),
    numero: '',
    notas: '',
  });
  const [disponibles, setDisponibles] = useState([]);
  const [cargandoRemitos, setCargandoRemitos] = useState(false);
  // { [remito_id]: { marcado, cantidad } }
  const [seleccion, setSeleccion] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (form.tipo !== 'FACTURA' || !form.cliente_id) {
      setDisponibles([]);
      setSeleccion({});
      return undefined;
    }

    let cancelado = false;
    const cargar = async () => {
      try {
        setCargandoRemitos(true);
        const res = await remitosDisponibles(form.cliente_id);
        if (cancelado) return;
        const lista = res.data || [];
        const inicial = remitoInicialRef.current;
        const nuevaSeleccion = {};
        for (const remito of lista) {
          const premarcado = Boolean(inicial && inicial.id === remito.id);
          nuevaSeleccion[remito.id] = {
            marcado: premarcado,
            cantidad: Number(remito.saldo) || 0,
          };
        }
        setDisponibles(lista);
        setSeleccion(nuevaSeleccion);
      } catch (error) {
        console.error('Error al cargar remitos disponibles:', error);
        if (!cancelado) {
          setDisponibles([]);
          setSeleccion({});
        }
      } finally {
        if (!cancelado) setCargandoRemitos(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [form.cliente_id, form.tipo]);

  const esFactura = form.tipo === 'FACTURA';

  const marcados = disponibles.filter((r) => seleccion[r.id]?.marcado);

  const totalAFacturar = marcados.reduce(
    (sum, r) => sum + (Number(seleccion[r.id]?.cantidad) || 0),
    0,
  );

  const toggleRemito = (remito) => {
    setSeleccion((prev) => ({
      ...prev,
      [remito.id]: {
        marcado: !prev[remito.id]?.marcado,
        cantidad: Number(remito.saldo) || 0,
      },
    }));
  };

  const cambiarCantidad = (remito, valor) => {
    setSeleccion((prev) => ({
      ...prev,
      [remito.id]: {
        ...prev[remito.id],
        cantidad: valor,
      },
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.cliente_id) newErrors.cliente_id = 'Seleccione un cliente';
    if (!form.fecha) newErrors.fecha = 'Ingrese la fecha';
    if (form.numero && form.numero.trim().length > 20) {
      newErrors.numero = 'Máximo 20 caracteres';
    }

    if (esFactura) {
      if (marcados.length === 0) {
        newErrors.remitos = 'Seleccione al menos un remito para facturar';
      }
      marcados.forEach((remito) => {
        const cantidad = Number(seleccion[remito.id]?.cantidad);
        const saldo = Number(remito.saldo) || 0;
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
          newErrors[`remito_${remito.id}`] = 'Cantidad debe ser mayor a 0';
        } else if (cantidad > saldo + 0.0001) {
          newErrors[`remito_${remito.id}`] = `Máximo: ${saldo.toFixed(2)}`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await addFactura({
        cliente_id: Number(form.cliente_id),
        tipo: form.tipo,
        fecha: form.fecha,
        numero: form.numero.trim() || null,
        notas: form.notas.trim() || null,
        remitos: esFactura
          ? marcados.map((remito) => ({
              remito_id: remito.id,
              cantidad_facturada: Number(seleccion[remito.id].cantidad),
            }))
          : [],
      });
      onSave();
    } catch (error) {
      console.error('Error al crear factura:', error);
      window.alert(
        error.response?.data?.message || 'No se pudo crear la factura',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nueva Factura</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Cliente *</Form.Label>
              <Form.Select
                value={form.cliente_id}
                onChange={(e) =>
                  setForm({ ...form, cliente_id: e.target.value })
                }
                isInvalid={!!errors.cliente_id}
              >
                <option value="">Seleccionar</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razon_social}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.cliente_id}
              </Form.Control.Feedback>
            </Col>
            <Col md={2}>
              <Form.Label>Tipo *</Form.Label>
              <Form.Select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="FACTURA">Factura</option>
                <option value="ANTICIPO">Anticipo</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Fecha *</Form.Label>
              <Form.Control
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                isInvalid={!!errors.fecha}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fecha}
              </Form.Control.Feedback>
            </Col>
            <Col md={2}>
              <Form.Label>N° Factura</Form.Label>
              <Form.Control
                type="text"
                maxLength={20}
                placeholder="Opcional"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                isInvalid={!!errors.numero}
              />
              <Form.Control.Feedback type="invalid">
                {errors.numero}
              </Form.Control.Feedback>
            </Col>
            <Col md={2}>
              <Form.Label>Notas</Form.Label>
              <Form.Control
                type="text"
                placeholder="Opcional"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
              />
            </Col>
          </Row>

          {esFactura && (
            <>
              <h6 className="mb-3">Remitos a facturar</h6>

              {!form.cliente_id && (
                <p className="text-muted text-center py-3">
                  Seleccione un cliente para ver sus remitos disponibles
                </p>
              )}

              {form.cliente_id && cargandoRemitos && (
                <p className="text-muted text-center py-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Cargando remitos disponibles...
                </p>
              )}

              {form.cliente_id && !cargandoRemitos && disponibles.length === 0 && (
                <p className="text-muted text-center py-3">
                  No hay remitos listos para facturar de este cliente. Podés
                  revisar los pendientes en el panel de Facturación.
                </p>
              )}

              {!cargandoRemitos && disponibles.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Remito</th>
                        <th>Fecha</th>
                        <th className="text-end">Total</th>
                        <th className="text-end">Ya facturado</th>
                        <th className="text-end">Saldo</th>
                        <th style={{ width: '130px' }}>A facturar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disponibles.map((remito) => {
                        const sel = seleccion[remito.id] || {};
                        const fechaRemito =
                          remito.issued_at || remito.createdAt;
                        return (
                          <tr
                            key={remito.id}
                            className={sel.marcado ? 'table-light' : ''}
                          >
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={Boolean(sel.marcado)}
                                onChange={() => toggleRemito(remito)}
                              />
                            </td>
                            <td>
                              <strong>{remito.remito_number}</strong>
                            </td>
                            <td>
                              {fechaRemito
                                ? new Date(fechaRemito).toLocaleDateString(
                                    'es-AR',
                                  )
                                : '—'}
                            </td>
                            <td className="text-end">
                              {Number(remito.total_remitido || 0).toFixed(2)}
                            </td>
                            <td className="text-end">
                              {Number(remito.facturado || 0).toFixed(2)}
                            </td>
                            <td className="text-end">
                              <strong>{Number(remito.saldo || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                min="0.01"
                                max={remito.saldo}
                                disabled={!sel.marcado}
                                value={sel.cantidad ?? ''}
                                onChange={(e) =>
                                  cambiarCantidad(
                                    remito,
                                    e.target.value === ''
                                      ? ''
                                      : parseFloat(e.target.value),
                                  )
                                }
                                isInvalid={!!errors[`remito_${remito.id}`]}
                              />
                              {errors[`remito_${remito.id}`] && (
                                <div className="invalid-feedback d-block">
                                  {errors[`remito_${remito.id}`]}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {errors.remitos && (
                <div className="text-danger mt-2">{errors.remitos}</div>
              )}

              {marcados.length > 0 && (
                <div className="text-end mt-2">
                  <strong>
                    Total a facturar: {totalAFacturar.toFixed(2)}
                  </strong>
                </div>
              )}
            </>
          )}

          {!esFactura && (
            <p className="text-muted">
              Un anticipo no tiene remitos asociados: solo registra el importe
              recibido del cliente.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Factura'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalFactura;
