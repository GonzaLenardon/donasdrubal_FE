import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Users,
  UserRoundCog,
} from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { allCliente } from '../api/clientes.js';
import { generarInformeCrm } from '../api/informeCrm.js';
import { allIngenieros } from '../api/users.js';
import '../css/informeCrm.css';

const SERVICIOS = [
  { value: 'jornada', label: 'Jornadas' },
  { value: 'muestra_agua', label: 'Muestras de agua' },
  { value: 'calibracion', label: 'Calibraciones' },
];

const TIPOS_CLIENTE = [
  { value: 'a', label: 'Tipo A' },
  { value: 'b', label: 'Tipo B' },
  { value: 'c', label: 'Tipo C' },
];

const NOMBRE_SERVICIO = Object.fromEntries(
  SERVICIOS.map(({ value, label }) => [value, label]),
);

const leerLista = (response) =>
  Array.isArray(response?.data) ? response.data : [];

const InformeCrm = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [ingenieroId, setIngenieroId] = useState('');
  const [servicios, setServicios] = useState(SERVICIOS.map(({ value }) => value));
  const [tiposCliente, setTiposCliente] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [informe, setInforme] = useState(null);
  const [cargandoOpciones, setCargandoOpciones] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarOpciones = async () => {
      setCargandoOpciones(true);
      try {
        const [clientesResponse, ingenierosResponse] = await Promise.all([
          allCliente(),
          allIngenieros(),
        ]);
        if (!activo) return;
        setClientes(leerLista(clientesResponse));
        setIngenieros(leerLista(ingenierosResponse));
      } catch (loadError) {
        console.error('Error al cargar filtros del informe CRM:', loadError);
        if (activo) {
          setError(
            loadError.response?.data?.error ??
              'No se pudieron cargar los clientes y los ingenieros.',
          );
        }
      } finally {
        if (activo) setCargandoOpciones(false);
      }
    };

    cargarOpciones();
    return () => {
      activo = false;
    };
  }, []);

  const rangoValido =
    Boolean(fechaInicio && fechaFin) && fechaInicio <= fechaFin;
  const filtroServiciosValido = servicios.length > 0;
  const permitirGenerar =
    rangoValido && filtroServiciosValido && !generando && !cargandoOpciones;

  const resumenServicios = useMemo(
    () =>
      SERVICIOS.filter(({ value }) =>
        Object.hasOwn(informe?.indicadores?.porServicio ?? {}, value),
      ),
    [informe],
  );

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setClienteId('');
    setIngenieroId('');
    setServicios(SERVICIOS.map(({ value }) => value));
    setTiposCliente([]);
    setInforme(null);
    setError('');
  };

  const alternarValor = (value, setValores) => {
    setValores((actuales) =>
      actuales.includes(value)
        ? actuales.filter((actual) => actual !== value)
        : [...actuales, value],
    );
    setInforme(null);
  };

  const handleGenerar = async (event) => {
    event.preventDefault();
    if (!rangoValido || !filtroServiciosValido) {
      setError(
        !rangoValido
          ? 'Seleccioná un rango de fechas válido.'
          : 'Seleccioná al menos un servicio.',
      );
      return;
    }

    const filtros = {
      fechaInicio,
      fechaFin,
      servicios,
      ...(clienteId ? { clienteId: Number(clienteId) } : {}),
      ...(ingenieroId ? { ingenieroId: Number(ingenieroId) } : {}),
      ...(tiposCliente.length ? { tiposCliente } : {}),
    };

    setGenerando(true);
    setError('');
    try {
      setInforme(await generarInformeCrm(filtros));
    } catch (requestError) {
      console.error('Error al generar la previsualización CRM:', requestError);
      setInforme(null);
      setError(
        requestError.response?.data?.error ??
          'No se pudo generar el informe. Intentá nuevamente.',
      );
    } finally {
      setGenerando(false);
    }
  };

  const exportarExcel = () => {
    if (!informe) return;

    const libro = utils.book_new();
    const filtros = [
      { Filtro: 'Período', Valor: `${fechaInicio} al ${fechaFin}` },
      {
        Filtro: 'Cliente',
        Valor: informe.filtros.cliente || 'Todos',
      },
      {
        Filtro: 'Ingeniero',
        Valor: informe.filtros.ingeniero || 'Todos',
      },
      {
        Filtro: 'Servicios',
        Valor: informe.filtros.servicios
          .map((servicio) => NOMBRE_SERVICIO[servicio])
          .join(', '),
      },
      {
        Filtro: 'Tipos de cliente',
        Valor: informe.filtros.tiposCliente?.join(', ') || 'Todos',
      },
    ];
    const indicadores = [
      {
        Indicador: 'Clientes con actividad',
        Total: informe.indicadores.clientesActivos,
      },
      {
        Indicador: 'Ingenieros con actividad',
        Total: informe.indicadores.ingenierosActivos,
      },
      {
        Indicador: 'Total de actividades',
        Total: informe.indicadores.totalActividades,
      },
      ...resumenServicios.map(({ value, label }) => ({
        Indicador: label,
        Total: informe.indicadores.porServicio[value],
      })),
    ];
    const hojaResumen = utils.aoa_to_sheet([
      ['Informe configurable del CRM'],
      ['Filtros'],
      ['Filtro', 'Valor'],
      ...filtros.map(({ Filtro, Valor }) => [Filtro, Valor]),
      [],
      ['Indicadores'],
      ['Indicador', 'Total'],
      ...indicadores.map(({ Indicador, Total }) => [Indicador, Total]),
    ]);
    const hojaDetalle = utils.json_to_sheet(
      informe.detalle.map((fila) => ({
        Cliente: fila.cliente,
        Ingeniero: fila.ingeniero,
        Servicio: NOMBRE_SERVICIO[fila.servicio] ?? fila.servicio,
        Fecha: fila.fecha,
        'ID de actividad': fila.id,
      })),
      {
        header: [
          'Cliente',
          'Ingeniero',
          'Servicio',
          'Fecha',
          'ID de actividad',
        ],
      },
    );

    utils.book_append_sheet(libro, hojaResumen, 'Resumen');
    utils.book_append_sheet(libro, hojaDetalle, 'Actividades');
    writeFile(libro, `informe-crm-${fechaInicio}-${fechaFin}.xlsx`);
  };

  return (
    <main className="informe-crm">
      <header className="informe-crm__header">
        <div className="informe-crm__heading">
          <span className="informe-crm__eyebrow">GESTIÓN · CRM</span>
          <h1>
            <FileBarChart2 aria-hidden="true" />
            Informe de actividad
          </h1>
          <p>Filtrá, revisá y exportá la actividad del equipo y sus clientes.</p>
        </div>
        {informe && (
          <div className="informe-crm__header-actions">
            <button
              type="button"
              className="informe-crm__button informe-crm__button--quiet"
              onClick={() => window.print()}
            >
              <Printer size={17} />
              Guardar como PDF
            </button>
            <button
              type="button"
              className="informe-crm__button informe-crm__button--primary"
              onClick={exportarExcel}
            >
              <FileSpreadsheet size={17} />
              Exportar Excel
            </button>
          </div>
        )}
      </header>

      <form className="informe-crm__filters" onSubmit={handleGenerar}>
        <div className="informe-crm__section-heading">
          <div>
            <span className="informe-crm__section-kicker">01 / CRITERIOS</span>
            <h2>Definí tu consulta</h2>
          </div>
          <button
            type="button"
            className="informe-crm__text-button"
            onClick={limpiarFiltros}
          >
            <RotateCcw size={15} />
            Restablecer
          </button>
        </div>

        <div className="informe-crm__filter-grid">
          <label className="informe-crm__field">
            <span>
              <CalendarDays size={15} /> Desde <b>*</b>
            </span>
            <input
              type="date"
              required
              max={fechaFin || undefined}
              value={fechaInicio}
              onChange={(event) => {
                setFechaInicio(event.target.value);
                setInforme(null);
              }}
            />
          </label>
          <label className="informe-crm__field">
            <span>
              <CalendarDays size={15} /> Hasta <b>*</b>
            </span>
            <input
              type="date"
              required
              min={fechaInicio || undefined}
              value={fechaFin}
              onChange={(event) => {
                setFechaFin(event.target.value);
                setInforme(null);
              }}
            />
          </label>
          <label className="informe-crm__field">
            <span>
              <Users size={15} /> Cliente
            </span>
            <select
              value={clienteId}
              disabled={cargandoOpciones}
              onChange={(event) => {
                setClienteId(event.target.value);
                setInforme(null);
              }}
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.razon_social || `Cliente ${cliente.id}`}
                </option>
              ))}
            </select>
          </label>
          <label className="informe-crm__field">
            <span>
              <UserRoundCog size={15} /> Ingeniero
            </span>
            <select
              value={ingenieroId}
              disabled={cargandoOpciones}
              onChange={(event) => {
                setIngenieroId(event.target.value);
                setInforme(null);
              }}
            >
              <option value="">Todos los ingenieros</option>
              {ingenieros.map((ingeniero) => (
                <option key={ingeniero.id} value={ingeniero.id}>
                  {ingeniero.nombre || `Ingeniero ${ingeniero.id}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="informe-crm__choices">
          <legend>Servicios incluidos</legend>
          <div className="informe-crm__choice-list">
            {SERVICIOS.map(({ value, label }) => (
              <label className="informe-crm__choice" key={value}>
                <input
                  type="checkbox"
                  checked={servicios.includes(value)}
                  onChange={() =>
                    alternarValor(value, setServicios)
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="informe-crm__choices">
          <legend>
            Tipos de cliente <small>Sin selección incluye todos</small>
          </legend>
          <div className="informe-crm__choice-list">
            {TIPOS_CLIENTE.map(({ value, label }) => (
              <label className="informe-crm__choice" key={value}>
                <input
                  type="checkbox"
                  checked={tiposCliente.includes(value)}
                  onChange={() =>
                    alternarValor(value, setTiposCliente)
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {!filtroServiciosValido && (
          <div className="informe-crm__validation" role="status">
            Seleccioná al menos un servicio para generar el informe.
          </div>
        )}

        <div className="informe-crm__filter-footer">
          <span>* El rango de fechas es obligatorio.</span>
          <button
            type="submit"
            className="informe-crm__button informe-crm__button--primary"
            disabled={!permitirGenerar}
          >
            {generando ? (
              <>
                <span className="informe-crm__spinner" aria-hidden="true" />
                Consultando actividad…
              </>
            ) : (
              <>
                <Activity size={17} />
                Generar previsualización
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="informe-crm__error" role="alert">
            {error}
          </div>
        )}
      </form>

      {informe ? (
        <section className="informe-crm__preview" aria-live="polite">
          <div className="informe-crm__section-heading informe-crm__preview-heading">
            <div>
              <span className="informe-crm__section-kicker">02 / VISTA PREVIA</span>
              <h2>Resultado del informe</h2>
              <p>
                {informe.filtros.fechaInicio} — {informe.filtros.fechaFin}
                {informe.filtros.cliente
                  ? ` · ${informe.filtros.cliente}`
                  : ' · Todos los clientes'}
              </p>
            </div>
            <span className="informe-crm__result-count">
              {informe.indicadores.totalActividades} actividades
            </span>
          </div>

          <div className="informe-crm__printable">
            <div className="informe-crm__print-title">
              <span>DON ASDRÚBAL · CRM</span>
              <h2>Informe de actividad</h2>
              <p>
                Período: {informe.filtros.fechaInicio} al{' '}
                {informe.filtros.fechaFin}
              </p>
            </div>

            <div className="informe-crm__summary-grid">
              <article className="informe-crm__metric">
                <span>Clientes activos</span>
                <strong>{informe.indicadores.clientesActivos}</strong>
              </article>
              <article className="informe-crm__metric">
                <span>Ingenieros activos</span>
                <strong>{informe.indicadores.ingenierosActivos}</strong>
              </article>
              <article className="informe-crm__metric informe-crm__metric--total">
                <span>Actividades registradas</span>
                <strong>{informe.indicadores.totalActividades}</strong>
              </article>
              {resumenServicios.map(({ value, label }) => (
                <article className="informe-crm__metric" key={value}>
                  <span>{label}</span>
                  <strong>{informe.indicadores.porServicio[value]}</strong>
                </article>
              ))}
            </div>

            <div className="informe-crm__table-block">
              <div className="informe-crm__table-heading">
                <div>
                  <span className="informe-crm__section-kicker">
                    DETALLE OPERATIVO
                  </span>
                  <h3>Actividad por cliente</h3>
                </div>
                <span>{informe.detalle.length} registros</span>
              </div>
              <div className="informe-crm__table-wrap">
                <table className="informe-crm__table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Ingeniero</th>
                      <th>Servicio</th>
                      <th>Fecha</th>
                      <th>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informe.detalle.map((fila, index) => (
                      <tr key={`${fila.servicio}-${fila.id}-${index}`}>
                        <td>{fila.cliente}</td>
                        <td>{fila.ingeniero}</td>
                        <td>
                          <span className="informe-crm__service">
                            {NOMBRE_SERVICIO[fila.servicio] ?? fila.servicio}
                          </span>
                        </td>
                        <td>{fila.fecha}</td>
                        <td className="informe-crm__id">{fila.id}</td>
                      </tr>
                    ))}
                    {informe.sinResultados && (
                      <tr>
                        <td colSpan="5" className="informe-crm__empty">
                          No se encontraron actividades para los filtros
                          seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : (
        !error && (
          <div className="informe-crm__empty-state">
            <span className="informe-crm__empty-icon">
              <Download size={22} />
            </span>
            <strong>Tu informe aparecerá aquí</strong>
            <p>Elegí un período y generá una vista previa antes de exportar.</p>
          </div>
        )
      )}
    </main>
  );
};

export default InformeCrm;
