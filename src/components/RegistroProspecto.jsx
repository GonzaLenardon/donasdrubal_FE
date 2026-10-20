import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getRegistroProspecto,
  upRegistroProspecto,
} from '../api/registroProspecto.js';
import { allPaises, ciudadesPorProvincia, provinciasPorPais } from '../api/ubicaciones.js';
import './RegistroProspecto.css';

const CAMPOS = [
  { name: 'razon_social', label: 'Razón social', required: true },
  { name: 'cuil_cuit', label: 'CUIL / CUIT' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
  { name: 'direccion_fiscal', label: 'Dirección fiscal' },
  { name: 'direccion', label: 'Dirección' },
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
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisId, setPaisId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [ciudadId, setCiudadId] = useState('');
  const [errorUbicaciones, setErrorUbicaciones] = useState('');
  const ubicacionInicializada = useRef(false);

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

  useEffect(() => {
    allPaises()
      .then(setPaises)
      .catch(() => setErrorUbicaciones('No se pudieron cargar los países.'));
  }, []);

  useEffect(() => {
    if (!paises.length || !formulario.pais || ubicacionInicializada.current) return undefined;
    let cancelado = false;
    const normalizar = (valor) => String(valor ?? '').trim().toLocaleLowerCase();
    const precargarUbicacion = async () => {
      try {
        const pais = paises.find((item) => normalizar(item.pais_nombre) === normalizar(formulario.pais));
        if (!pais) { ubicacionInicializada.current = true; return; }
        const idPais = String(pais.pais_id);
        const listaProvincias = await provinciasPorPais(idPais);
        const provincia = listaProvincias.find((item) => normalizar(item.nombre) === normalizar(formulario.provincia));
        const listaCiudades = provincia ? await ciudadesPorProvincia(String(provincia.id)) : [];
        const ciudad = listaCiudades.find((item) => normalizar(item.nombre) === normalizar(formulario.ciudad));
        if (cancelado) return;
        setPaisId(idPais);
        setProvincias(listaProvincias);
        setProvinciaId(provincia ? String(provincia.id) : '');
        setCiudades(listaCiudades);
        setCiudadId(ciudad ? String(ciudad.id) : '');
        ubicacionInicializada.current = true;
      } catch {
        if (!cancelado) setErrorUbicaciones('No se pudo precargar la ubicación guardada.');
      }
    };
    precargarUbicacion();
    return () => { cancelado = true; };
  }, [formulario.pais, formulario.provincia, formulario.ciudad, paises]);

  const cambiarPais = async (event) => {
    const id = event.target.value;
    const pais = paises.find((item) => String(item.pais_id) === id);
    setPaisId(id);
    setProvinciaId('');
    setCiudadId('');
    setProvincias([]);
    setCiudades([]);
    setFormulario((actual) => ({ ...actual, pais: pais?.pais_nombre ?? '', provincia: '', ciudad: '' }));
    if (!id) return;
    try { setProvincias(await provinciasPorPais(id)); }
    catch { setErrorUbicaciones('No se pudieron cargar las provincias.'); }
  };

  const cambiarProvincia = async (event) => {
    const id = event.target.value;
    const provincia = provincias.find((item) => String(item.id) === id);
    setProvinciaId(id);
    setCiudadId('');
    setCiudades([]);
    setFormulario((actual) => ({ ...actual, provincia: provincia?.nombre ?? '', ciudad: '' }));
    if (!id) return;
    try { setCiudades(await ciudadesPorProvincia(id)); }
    catch { setErrorUbicaciones('No se pudieron cargar las ciudades.'); }
  };

  const cambiarCiudad = (event) => {
    const id = event.target.value;
    const ciudad = ciudades.find((item) => String(item.id) === id);
    setCiudadId(id);
    setFormulario((actual) => ({ ...actual, ciudad: ciudad?.nombre ?? '' }));
  };

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
            <label className="registro-prospecto__campo">
              País
              <select value={paisId} onChange={cambiarPais}>
                <option value="">Selecciona un país</option>
                {paises.map((pais) => <option key={pais.pais_id} value={pais.pais_id}>{pais.pais_nombre}</option>)}
              </select>
            </label>
            <label className="registro-prospecto__campo">
              Provincia
              <select value={provinciaId} onChange={cambiarProvincia} disabled={!paisId}>
                <option value="">{paisId ? 'Selecciona una provincia' : 'Primero selecciona un país'}</option>
                {provincias.map((provincia) => <option key={provincia.id} value={provincia.id}>{provincia.nombre}</option>)}
              </select>
            </label>
            <label className="registro-prospecto__campo">
              Ciudad
              <select value={ciudadId} onChange={cambiarCiudad} disabled={!provinciaId}>
                <option value="">{provinciaId ? 'Selecciona una ciudad' : 'Primero selecciona una provincia'}</option>
                {ciudades.map((ciudad) => <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>)}
              </select>
            </label>
            {errorUbicaciones && <p className="registro-prospecto__error" role="alert">{errorUbicaciones}</p>}
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
