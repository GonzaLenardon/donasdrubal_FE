import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { alertasNuevaCampaña } from '../api/alertas';
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';

const Alertas = () => {
  const [fechas, setFechas] = useState({
    fecha_vencimiento: '',
    fecha_alerta: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Validación de fechas
  const validarFechas = () => {
    setError('');

    if (!fechas.fecha_vencimiento || !fechas.fecha_alerta) {
      setError('Ambas fechas son obligatorias');
      return false;
    }

    const fechaVenc = new Date(fechas.fecha_vencimiento);
    const fechaAlert = new Date(fechas.fecha_alerta);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaAlert < hoy) {
      setError('La fecha de alerta debe ser igual o posterior a hoy');
      return false;
    }

    if (fechaVenc <= fechaAlert) {
      setError(
        'La fecha de vencimiento debe ser posterior a la fecha de alerta',
      );
      return false;
    }

    const diasDiferencia = Math.ceil(
      (fechaVenc - fechaAlert) / (1000 * 60 * 60 * 24),
    );
    if (diasDiferencia < 7) {
      setError(
        'Debe haber al menos 7 días de diferencia entre la fecha de alerta y la de vencimiento',
      );
      return false;
    }

    return true;
  };

  const handleAbrirModal = () => {
    if (validarFechas()) {
      setShowModal(true);
    }
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setError('');
  };

  const generarAlertas = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await alertasNuevaCampaña(fechas);
      console.log('Respuesta:', res);

      setSuccess(res.data);
      setShowModal(false);

      // Limpiar formulario después de éxito
      setTimeout(() => {
        setFechas({
          fecha_vencimiento: '',
          fecha_alerta: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error al generar alertas:', error);
      setError(
        error.response?.data?.mensaje ||
          'Error al generar las alertas. Por favor, intente nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasAlerta = () => {
    if (fechas.fecha_vencimiento && fechas.fecha_alerta) {
      const fechaVenc = new Date(fechas.fecha_vencimiento);
      const fechaAlert = new Date(fechas.fecha_alerta);
      const dias = Math.ceil((fechaVenc - fechaAlert) / (1000 * 60 * 60 * 24));
      return dias > 0 ? dias : 0;
    }
    return 0;
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-2">
          <Calendar className="me-2 mb-1" size={32} />
          Nueva Campaña de Servicios
        </h2>
        <p className="text-muted">
          Generación automática de alertas para clientes AAA
        </p>
      </div>

      {/* Alert de información */}
      <Alert
        variant="light"
        className="border-0 shadow-sm mb-4"
        style={{
          background: 'linear-gradient(135deg, #2d5016 0%, #4a7c1f 100%)',
          color: 'white',
        }}
      >
        <div className="d-flex align-items-start">
          <AlertTriangle className="me-3 mt-1 flex-shrink-0" size={24} />
          <div>
            <h6 className="fw-bold mb-2">Generación Automática de Servicios</h6>
            <p className="mb-0" style={{ fontSize: '0.95rem' }}>
              Este proceso creará automáticamente servicios de{' '}
              <strong>Calibración</strong>,<strong> Muestras de Agua</strong> y{' '}
              <strong> Jornadas de Mezclas</strong> para todos los clientes
              clasificados como AAA (Tipo 3). Esta acción afectará a múltiples
              registros en el sistema.
            </p>
          </div>
        </div>
      </Alert>

      {/* Mensajes de éxito/error */}
      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess(null)}
          className="mb-4"
        >
          <CheckCircle className="me-2 mb-1" size={20} />
          <strong>¡Campaña generada exitosamente!</strong>
          <div className="mt-2 small">
            <div>
              Total de clientes procesados:{' '}
              <strong>{success.total_clientes || 0}</strong>
            </div>
            <div>
              Servicios creados: <strong>{success.total_servicios || 0}</strong>
            </div>
            <div>
              Alertas generadas: <strong>{success.total_alertas || 0}</strong>
            </div>
          </div>
        </Alert>
      )}

      {error && !showModal && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
          className="mb-4"
        >
          <AlertTriangle className="me-2 mb-1" size={20} />
          {error}
        </Alert>
      )}

      {/* Formulario */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="card-title fw-semibold mb-4">
            Configuración de Fechas
          </h5>

          <div className="row g-4">
            {/* Fecha de Alerta */}
            <div className="col-md-4">
              <label className="form-label fw-semibold text-dark">
                <Calendar size={18} className="me-2 mb-1" />
                Fecha de Alerta
              </label>
              <input
                type="date"
                className="form-control form-control-lg"
                value={fechas.fecha_alerta}
                onChange={(e) => {
                  setFechas({ ...fechas, fecha_alerta: e.target.value });
                  setError('');
                }}
                min={new Date().toISOString().split('T')[0]}
              />
              <small className="text-muted d-block mt-2">
                Fecha en la que se activarán las notificaciones
              </small>
            </div>

            {/* Fecha de Vencimiento */}
            <div className="col-md-4">
              <label className="form-label fw-semibold text-dark">
                <Calendar size={18} className="me-2 mb-1" />
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                className="form-control form-control-lg"
                value={fechas.fecha_vencimiento}
                onChange={(e) => {
                  setFechas({ ...fechas, fecha_vencimiento: e.target.value });
                  setError('');
                }}
                min={
                  fechas.fecha_alerta || new Date().toISOString().split('T')[0]
                }
              />
              <small className="text-muted d-block mt-2">
                Fecha límite para completar los servicios
              </small>
            </div>

            {/* Días de diferencia */}
            <div className="col-md-4">
              <label className="form-label fw-semibold text-dark">
                Días de Alerta Previa
              </label>
              <div
                className="form-control form-control-lg bg-light text-center"
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#2d5016',
                }}
              >
                {calcularDiasAlerta()}
              </div>
              <small className="text-muted d-block mt-2">
                Días entre la alerta y el vencimiento
              </small>
            </div>
          </div>

          {/* Botón de acción */}
          <div className="mt-4 pt-3 border-top">
            <button
              className="btn btn-lg px-5 text-white fw-semibold shadow"
              style={{
                background: 'linear-gradient(135deg, #2d5016 0%, #4a7c1f 100%)',
                border: 'none',
              }}
              onClick={handleAbrirModal}
              disabled={
                !fechas.fecha_vencimiento || !fechas.fecha_alerta || loading
              }
            >
              <Users className="me-2 mb-1" size={20} />
              Generar Campaña de Alertas
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        show={showModal}
        onHide={handleCerrarModal}
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton={!loading}
          style={{
            background: 'linear-gradient(135deg, #2d5016 0%, #4a7c1f 100%)',
            color: 'white',
          }}
        >
          <Modal.Title className="d-flex align-items-center">
            <AlertTriangle className="me-2" size={24} />
            Confirmar Generación de Campaña
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-3">
              <AlertTriangle className="me-2 mb-1" size={18} />
              {error}
            </Alert>
          )}

          <div className="mb-4">
            <p className="fw-semibold mb-3">
              Está a punto de generar servicios automáticos para{' '}
              <strong>todos los clientes AAA</strong>. Esta acción creará:
            </p>

            <ul className="list-unstyled ms-3">
              <li className="mb-2">
                <CheckCircle className="me-2 text-success" size={18} />
                Calibraciones para cada máquina registrada
              </li>
              <li className="mb-2">
                <CheckCircle className="me-2 text-success" size={18} />
                Muestras de agua para cada pozo activo
              </li>
              <li className="mb-2">
                <CheckCircle className="me-2 text-success" size={18} />
                Jornadas de mezclas según configuración
              </li>
            </ul>
          </div>

          <div className="bg-light p-3 rounded">
            <h6 className="fw-semibold mb-3">Resumen de fechas:</h6>
            <div className="row g-3">
              <div className="col-6">
                <small className="text-muted d-block">Fecha de Alerta</small>
                <strong className="text-dark">
                  {new Date(fechas.fecha_alerta).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">
                  Fecha de Vencimiento
                </small>
                <strong className="text-dark">
                  {new Date(fechas.fecha_vencimiento).toLocaleDateString(
                    'es-AR',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC',
                    },
                  )}
                </strong>
              </div>
            </div>
            <div className="mt-3 pt-3 border-top">
              <small className="text-muted d-block">
                Periodo de notificación
              </small>
              <strong className="text-success">
                {calcularDiasAlerta()} días de alerta previa
              </strong>
            </div>
          </div>

          <Alert variant="warning" className="mt-3 mb-0">
            <small>
              <strong>Importante:</strong> Esta acción no se puede deshacer.
              Asegúrese de que las fechas sean correctas antes de continuar.
            </small>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            onClick={handleCerrarModal}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            style={{
              background: 'linear-gradient(135deg, #2d5016 0%, #4a7c1f 100%)',
              border: 'none',
            }}
            onClick={generarAlertas}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Generando...
              </>
            ) : (
              <>
                <CheckCircle className="me-2 mb-1" size={18} />
                Confirmar y Generar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Alertas;
