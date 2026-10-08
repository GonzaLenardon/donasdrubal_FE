import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getRegistroProspecto,
  upRegistroProspecto,
} from '../api/registroProspecto.js';
import './RegistroProspecto.css';

const CAMPOS = [
  { name: 'razon_social', label: 'Razón social', required: true },
  { name: 'cuil_cuit', label: 'CUIL / CUIT' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
  { name: 'direccion_fiscal', label: 'Dirección fiscal' },
  { name: 'direccion', label: 'Dirección' },
  { name: 'ciudad', label: 'Ciudad' },
  { name: 'provincia', label: 'Provincia' },
  { name: 'pais', label: 'País' },
];

const obtenerDatos = (respuesta) =>
  respuesta?.data?.prospecto ??
  respuesta?.prospecto ??
  respuesta?.data ??
  respuesta ??
  {};

const RegistroProspecto = () => {
  const { token } = useParams();
  const [formulario, setFormulario] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const cargarFormulario = async () => {
      try {
        const respuestaProspecto = await getRegistroProspecto(token);
        setFormulario(obtenerDatos(respuestaProspecto));
      } catch (err) {
        setError(
          err.response?.data?.mensaje ??
            err.response?.data?.message ??
            'No se pudo abrir el enlace. Puede haber vencido o ser inválido.',
        );
      } finally {
        setCargando(false);
      }
    };

    cargarFormulario();
  }, [token]);

  const cambiarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  };

  const enviarFormulario = async (event) => {
    event.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await upRegistroProspecto(token, {
        razon_social: formulario.razon_social?.trim(),
        cuil_cuit: formulario.cuil_cuit || '',
        iva_id: Number(formulario.iva_id),
        telefono: formulario.telefono || '',
        email: formulario.email?.trim(),
        direccion_fiscal: formulario.direccion_fiscal || '',
        direccion: formulario.direccion || '',
        ciudad: formulario.ciudad || '',
        provincia: formulario.provincia || '',
        pais: formulario.pais || '',
        notas: formulario.notas || '',
      });
      setEnviado(true);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ??
          err.response?.data?.message ??
          'No se pudieron guardar los datos. Intenta nuevamente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <main className="registro-prospecto estado-registro">Cargando formulario…</main>;
  }

  if (error && !formulario.razon_social && !formulario.email) {
    return <main className="registro-prospecto estado-registro"><h1>Enlace no disponible</h1><p>{error}</p></main>;
  }

  if (enviado) {
    return <main className="registro-prospecto estado-registro"><h1>Datos enviados</h1><p>Gracias. La información de tu empresa fue recibida correctamente.</p></main>;
  }

  return (
    <main className="registro-prospecto">
      <section className="registro-prospecto__card">
        <header className="registro-prospecto__header">
          <span className="registro-prospecto__marca">Don Asdrubal</span>
          <h1>Completa los datos de tu empresa</h1>
          <p>Verifica la información y completa los campos que faltan.</p>
        </header>
        <form onSubmit={enviarFormulario}>
          <div className="registro-prospecto__campos">
            {CAMPOS.slice(0, 2).map((campo) => (
              <label className="registro-prospecto__campo" key={campo.name}>
                {campo.label}{campo.required && <span> *</span>}
                <input name={campo.name} value={formulario[campo.name] ?? ''} onChange={cambiarCampo} required={campo.required} />
              </label>
            ))}
            <label className="registro-prospecto__campo">
              Condición de IVA <span>*</span>
              <select name="iva_id" value={formulario.iva_id ?? ''} onChange={cambiarCampo} required>
                <option value="">Selecciona una condición</option>
                <option value="1">Responsable Inscripto</option>
                <option value="2">Monotributo</option>
                <option value="3">Exento</option>
              </select>
            </label>
            {CAMPOS.slice(2).map((campo) => (
              <label className="registro-prospecto__campo" key={campo.name}>
                {campo.label}{campo.required && <span> *</span>}
                <input name={campo.name} type={campo.type ?? 'text'} value={formulario[campo.name] ?? ''} onChange={cambiarCampo} required={campo.required} />
              </label>
            ))}
            <label className="registro-prospecto__campo registro-prospecto__campo--ancho">
              Notas
              <textarea name="notas" rows="3" value={formulario.notas ?? ''} onChange={cambiarCampo} />
            </label>
          </div>
          {error && <p className="registro-prospecto__error" role="alert">{error}</p>}
          <button className="registro-prospecto__submit" type="submit" disabled={guardando}>
            {guardando ? 'Enviando…' : 'Enviar datos'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default RegistroProspecto;
