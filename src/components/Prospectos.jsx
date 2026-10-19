import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addProspecto,
  allProspectos,
  crearInvitacionProspecto,
  getProspecto,
  upProspecto,
  convertirProspecto,
} from '../api/prospectos.js';
import {
  allPaises,
  ciudadesPorProvincia,
  provinciasPorPais,
} from '../api/ubicaciones.js';
import './Prospectos.css';

const FORMULARIO_VACIO = {
  razon_social: '',
  cuil_cuit: '',
  iva_id: '',
  telefono: '',
  email: '',
  direccion_fiscal: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  pais: '',
  notas: '',
};

const CAMPOS = [
  { name: 'razon_social', label: 'Razón social', required: true },
  { name: 'cuil_cuit', label: 'CUIL / CUIT' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
  { name: 'direccion_fiscal', label: 'Dirección fiscal' },
  { name: 'direccion', label: 'Dirección' },
];

const mensajeError = (error, fallback) =>
  error.response?.data?.mensaje ?? error.response?.data?.message ?? fallback;

const fecha = (valor) => {
  if (!valor) return '—';
  const date = new Date(valor);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-AR');
};

const Prospectos = () => {
  const [prospectos, setProspectos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [prospectoEditando, setProspectoEditando] = useState(null);
  const usuario = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = usuario?.rol === 'Administrador';
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [invitacion, setInvitacion] = useState(null);
  const [invitacionCargandoId, setInvitacionCargandoId] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisId, setPaisId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [ciudadId, setCiudadId] = useState('');
  const [paisesCargando, setPaisesCargando] = useState(true);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(false);
  const [errorUbicaciones, setErrorUbicaciones] = useState('');
  const ubicacionRequest = useRef(0);

  const cargarProspectos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const respuesta = await allProspectos();
      setProspectos(Array.isArray(respuesta.prospectos) ? respuesta.prospectos : []);
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar los prospectos.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProspectos();
  }, [cargarProspectos]);

  useEffect(() => {
    allPaises()
      .then(setPaises)
      .catch((err) => setErrorUbicaciones(mensajeError(err, 'No se pudieron cargar los países.')))
      .finally(() => setPaisesCargando(false));
  }, []);

  const prospectosFiltrados = useMemo(() => {
    const criterio = busqueda.trim().toLocaleLowerCase();
    if (!criterio) return prospectos;
    return prospectos.filter((prospecto) =>
      [prospecto.razon_social, prospecto.email, prospecto.cuil_cuit, prospecto.estado]
        .some((valor) => String(valor ?? '').toLocaleLowerCase().includes(criterio)),
    );
  }, [busqueda, prospectos]);

  const abrirAlta = () => {
    setProspectoEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setPaisId('');
    setProvinciaId('');
    setCiudadId('');
    setProvincias([]);
    setCiudades([]);
    if (paises.length) setErrorUbicaciones('');
    setError('');
    setModalAbierto(true);
  };

  const abrirEdicion = async (prospecto) => {
    try {
      const respuesta = await getProspecto(prospecto.id);
      const datos = respuesta.prospecto ?? respuesta.data;
      setProspectoEditando(datos);
      setFormulario({ ...FORMULARIO_VACIO, ...datos, iva_id: String(datos.iva_id ?? '') });
      setError('');
      setModalAbierto(true);
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar los datos del prospecto.'));
    }
  };

  const convertirEnCliente = async (prospecto) => {
    if (!window.confirm('Convertir a ' + prospecto.razon_social + ' en cliente?')) return;
    setError('');
    try {
      await convertirProspecto(prospecto.id);
      await cargarProspectos();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo convertir el prospecto.'));
    }
  };

  const cambiarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  };

  const cambiarPais = async (event) => {
    const id = event.target.value;
    const requestId = ++ubicacionRequest.current;
    const pais = paises.find((item) => String(item.pais_id) === id);
    setPaisId(id);
    setProvinciaId('');
    setCiudadId('');
    setProvincias([]);
    setCiudades([]);
    setErrorUbicaciones('');
    setFormulario((actual) => ({ ...actual, pais: pais?.pais_nombre ?? '', provincia: '', ciudad: '' }));
    if (!id) return;

    setCargandoUbicaciones(true);
    try {
      const respuesta = await provinciasPorPais(id);
      if (requestId === ubicacionRequest.current) setProvincias(respuesta);
    } catch (err) {
      if (requestId === ubicacionRequest.current) setErrorUbicaciones(mensajeError(err, 'No se pudieron cargar las provincias.'));
    } finally {
      if (requestId === ubicacionRequest.current) setCargandoUbicaciones(false);
    }
  };

  const cambiarProvincia = async (event) => {
    const id = event.target.value;
    const requestId = ++ubicacionRequest.current;
    const provincia = provincias.find((item) => String(item.id) === id);
    setProvinciaId(id);
    setCiudadId('');
    setCiudades([]);
    setErrorUbicaciones('');
    setFormulario((actual) => ({ ...actual, provincia: provincia?.nombre ?? '', ciudad: '' }));
    if (!id) return;

    setCargandoUbicaciones(true);
    try {
      const respuesta = await ciudadesPorProvincia(id);
      if (requestId === ubicacionRequest.current) setCiudades(respuesta);
    } catch (err) {
      if (requestId === ubicacionRequest.current) setErrorUbicaciones(mensajeError(err, 'No se pudieron cargar las ciudades.'));
    } finally {
      if (requestId === ubicacionRequest.current) setCargandoUbicaciones(false);
    }
  };

  const cambiarCiudad = (event) => {
    const id = event.target.value;
    const ciudad = ciudades.find((item) => String(item.id) === id);
    setCiudadId(id);
    setFormulario((actual) => ({ ...actual, ciudad: ciudad?.nombre ?? '' }));
  };

  const guardarProspecto = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError('');
    const datos = {
      ...formulario,
      razon_social: formulario.razon_social.trim(),
      email: formulario.email.trim(),
      iva_id: Number(formulario.iva_id),
    };
    try {
      if (prospectoEditando) await upProspecto(prospectoEditando.id, datos);
      else await addProspecto(datos);
      setModalAbierto(false);
      setProspectoEditando(null);
      await cargarProspectos();
    } catch (err) {
      const coincidencias = err.response?.data?.coincidencias;
      if (Array.isArray(coincidencias) && coincidencias.length) {
        const registros = coincidencias
          .map((item) => `${item.razon_social}${item.email ? ` (${item.email})` : ''}`)
          .join(', ');
        setError(`No se creó el prospecto: el CUIT o el email ya figura en otro registro. ${mensajeError(err, 'Se encontraron posibles duplicados')}. Coincidencias: ${registros}. Revisa la sección Prospectos o Clientes antes de volver a intentarlo.`);
      } else {
        setError(mensajeError(err, 'No se pudo crear el prospecto.'));
      }
    } finally {
      setGuardando(false);
    }
  };

  const generarInvitacion = async (prospecto) => {
    setInvitacionCargandoId(prospecto.id);
    setError('');
    setCopiado(false);
    try {
      const respuesta = await crearInvitacionProspecto(prospecto.id);
      setInvitacion({ url: respuesta.url, expiresAt: respuesta.expires_at, razonSocial: prospecto.razon_social });
    } catch (err) {
      setError(mensajeError(err, 'No se pudo generar la invitación.'));
    } finally {
      setInvitacionCargandoId(null);
    }
  };

  const copiarInvitacion = async () => {
    try {
      await navigator.clipboard.writeText(invitacion.url);
      setCopiado(true);
    } catch {
      setError('No se pudo copiar el enlace. Selecciónalo y cópialo manualmente.');
    }
  };

  return (
    <main className="prospectos-page">
      <div className="prospectos-page__heading">
        <div>
          <p className="prospectos-page__eyebrow">CRM · Clientes</p>
          <h1>Prospectos</h1>
          <p>Registra empresas interesadas y envíales un enlace para completar sus datos.</p>
        </div>
        <button className="prospectos-button prospectos-button--primary" onClick={abrirAlta}>
          <i className="bi bi-plus-lg" aria-hidden="true" /> Nuevo prospecto
        </button>
      </div>

      {error && !modalAbierto && !invitacion && <div className="prospectos-alert" role="alert">{error}</div>}

      <section className="prospectos-panel">
        <div className="prospectos-panel__toolbar">
          <div>
            <h2>Prospectos registrados</h2>
            <span>{prospectosFiltrados.length} registros</span>
          </div>
          <label className="prospectos-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por empresa, email o CUIT" />
          </label>
        </div>

        {cargando ? (
          <div className="prospectos-empty">Cargando prospectos…</div>
        ) : prospectosFiltrados.length === 0 ? (
          <div className="prospectos-empty">
            <i className="bi bi-person-lines-fill" aria-hidden="true" />
            <strong>{busqueda ? 'No hay coincidencias' : 'Todavía no hay prospectos'}</strong>
            <span>{busqueda ? 'Prueba con otro término.' : 'Crea el primero para comenzar.'}</span>
          </div>
        ) : (
          <div className="prospectos-table-wrap">
            <table className="prospectos-table">
              <thead><tr><th>Empresa</th><th>Contacto</th><th>Estado</th><th>Alta</th><th aria-label="Acciones" /></tr></thead>
              <tbody>
                {prospectosFiltrados.map((prospecto) => (
                  <tr key={prospecto.id}>
                    <td><strong>{prospecto.razon_social}</strong><small>{prospecto.cuil_cuit || 'CUIT no informado'}</small></td>
                    <td><span>{prospecto.email || '—'}</span><small>{prospecto.telefono || 'Teléfono no informado'}</small></td>
                    <td><span className="prospectos-status">{prospecto.estado || 'Nuevo'}</span></td>
                    <td>{fecha(prospecto.createdAt)}</td>
                    <td className="prospectos-table__actions">
                      <button className="prospectos-button prospectos-button--outline" onClick={() => abrirEdicion(prospecto)}>Editar</button>
                      <button className="prospectos-button prospectos-button--outline" onClick={() => generarInvitacion(prospecto)} disabled={invitacionCargandoId === prospecto.id}>{invitacionCargandoId === prospecto.id ? 'Generando...' : 'Generar enlace'}</button>
                      {isAdmin && <button className="prospectos-button prospectos-button--primary" onClick={() => convertirEnCliente(prospecto)}>Convertir en cliente</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="prospectos-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !guardando) setModalAbierto(false); }}>
          <section className="prospectos-modal" role="dialog" aria-modal="true" aria-labelledby="nuevo-prospecto-titulo">
            <header className="prospectos-modal__header">
              <div><span>CRM · Prospectos</span><h2 id="nuevo-prospecto-titulo">{prospectoEditando ? 'Editar prospecto' : 'Nuevo prospecto'}</h2></div>
              <button className="prospectos-icon-button" onClick={() => setModalAbierto(false)} aria-label="Cerrar" disabled={guardando}><i className="bi bi-x-lg" /></button>
            </header>
            <form onSubmit={guardarProspecto}>
              <div className="prospectos-modal__body">
                <p className="prospectos-required-note">Los campos con * son obligatorios.</p>
                <div className="prospectos-form-grid">
                  {CAMPOS.slice(0, 2).map((campo) => <label className="prospectos-field" key={campo.name}>{campo.label}{campo.required && <span> *</span>}<input name={campo.name} value={formulario[campo.name]} onChange={cambiarCampo} required={campo.required} maxLength="255" /></label>)}
                  <label className="prospectos-field">Condición de IVA <span>*</span><select name="iva_id" value={formulario.iva_id} onChange={cambiarCampo} required><option value="">Selecciona una condición</option><option value="1">Responsable Inscripto</option><option value="2">Monotributo</option><option value="3">Exento</option></select></label>
                  {CAMPOS.slice(2).map((campo) => <label className="prospectos-field" key={campo.name}>{campo.label}{campo.required && <span> *</span>}<input name={campo.name} type={campo.type ?? 'text'} value={formulario[campo.name]} onChange={cambiarCampo} required={campo.required} maxLength="255" /></label>)} 
                  {prospectoEditando ? (
                    ['pais', 'provincia', 'ciudad'].map((campo) => <label className="prospectos-field" key={campo}>{campo[0].toUpperCase() + campo.slice(1)}<input name={campo} value={formulario[campo] ?? ''} onChange={cambiarCampo} maxLength="255" /></label>)
                  ) : <>
                    <label className="prospectos-field">País<select value={paisId} onChange={cambiarPais} disabled={paisesCargando || cargandoUbicaciones}><option value="">{paisesCargando ? 'Cargando países…' : 'Selecciona un país'}</option>{paises.map((pais) => <option key={pais.pais_id} value={pais.pais_id}>{pais.pais_nombre}</option>)}</select></label>
                    <label className="prospectos-field">Provincia<select value={provinciaId} onChange={cambiarProvincia} disabled={!paisId || cargandoUbicaciones}><option value="">{paisId ? 'Selecciona una provincia' : 'Primero selecciona un país'}</option>{provincias.map((provincia) => <option key={provincia.id} value={provincia.id}>{provincia.nombre}</option>)}</select></label>
                    <label className="prospectos-field">Ciudad<select value={ciudadId} onChange={cambiarCiudad} disabled={!provinciaId || cargandoUbicaciones}><option value="">{provinciaId ? 'Selecciona una ciudad' : 'Primero selecciona una provincia'}</option>{ciudades.map((ciudad) => <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>)}</select></label>
                  </>}
                  {prospectoEditando && <label className="prospectos-field">Estado<select name="estado" value={formulario.estado ?? 'Nuevo'} onChange={cambiarCampo}>{['Nuevo', 'Contactado', 'Interesado', 'En negociación', 'Datos recibidos', 'Activo', 'No interesado', 'Descartado'].map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select></label>}
                  <label className="prospectos-field prospectos-field--wide">Notas<textarea name="notas" value={formulario.notas} onChange={cambiarCampo} rows="3" /></label>
                </div>
                {errorUbicaciones && <p className="prospectos-alert" role="alert">{errorUbicaciones}</p>}
                {error && <p className="prospectos-alert" role="alert">{error}</p>}
              </div>
              <footer className="prospectos-modal__footer"><button type="button" className="prospectos-button prospectos-button--outline" onClick={() => setModalAbierto(false)} disabled={guardando}>Cancelar</button><button type="submit" className="prospectos-button prospectos-button--primary" disabled={guardando}>{guardando ? 'Guardando...' : prospectoEditando ? 'Guardar cambios' : 'Crear prospecto'}</button></footer>
            </form>
          </section>
        </div>
      )}

      {invitacion && (
        <div className="prospectos-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInvitacion(null); }}>
          <section className="prospectos-modal prospectos-modal--invitation" role="dialog" aria-modal="true" aria-labelledby="invitacion-titulo">
            <header className="prospectos-modal__header"><div><span>Invitación lista</span><h2 id="invitacion-titulo">Enlace para {invitacion.razonSocial}</h2></div><button className="prospectos-icon-button" onClick={() => setInvitacion(null)} aria-label="Cerrar"><i className="bi bi-x-lg" /></button></header>
            <div className="prospectos-modal__body"><p>Comparte este enlace con el prospecto para que complete sus datos. Solo puede utilizarse una vez.</p><div className="prospectos-invite-url"><input readOnly value={invitacion.url} onFocus={(event) => event.target.select()} /><button className="prospectos-button prospectos-button--primary" onClick={copiarInvitacion}>{copiado ? 'Copiado' : 'Copiar enlace'}</button></div>{invitacion.expiresAt && <small>Vence: {new Date(invitacion.expiresAt).toLocaleString('es-AR')}</small>}</div>
            <footer className="prospectos-modal__footer"><button className="prospectos-button prospectos-button--outline" onClick={() => setInvitacion(null)}>Cerrar</button></footer>
          </section>
        </div>
      )}
    </main>
  );
};

export default Prospectos;
