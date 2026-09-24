import { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ProductSearch = ({
  productos,
  value,
  onSelect,
  isInvalid,
  errorText,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedProduct = productos.find((p) => p.id === value);

  const filtered = query.trim()
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      onSelect(filtered[highlightIndex].id);
      setQuery('');
      setOpen(false);
      setHighlightIndex(-1);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div className="cmp-search-wrapper" ref={wrapperRef}>
      <Form.Control
        ref={inputRef}
        size="sm"
        className="cmp-compact-input"
        placeholder="Buscar producto..."
        value={selectedProduct ? selectedProduct.nombre : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlightIndex(-1);
        }}
        onFocus={() => {
          if (selectedProduct) {
            setQuery(selectedProduct.nombre);
            onSelect('');
          }
          setOpen(true);
          setTimeout(() => inputRef.current?.select(), 0);
        }}
        onKeyDown={handleKeyDown}
        isInvalid={isInvalid}
      />
      {isInvalid && (
        <div
          className="invalid-feedback"
          style={{ display: 'block', fontSize: 11 }}
        >
          {errorText}
        </div>
      )}
      {open && filtered.length > 0 && (
        <div className="cmp-search-results">
          {filtered.map((p, idx) => (
            <div
              key={p.id}
              className={`cmp-search-item ${idx === highlightIndex ? 'selected' : ''}`}
              onClick={() => {
                onSelect(p.id);
                setQuery('');
                setOpen(false);
                setHighlightIndex(-1);
              }}
            >
              {p.nombre}
            </div>
          ))}
        </div>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <div className="cmp-search-results">
          <div className="cmp-search-no-results">Sin resultados</div>
        </div>
      )}
    </div>
  );
};

const ModalCompras = ({
  proveedores,
  depositos,
  productos,
  presentaciones,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({
    provider_id: '',
    warehouse_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          product_id: '',
          product_presentation_id: '',
          quantity: '',
          lotes: [{ lot_number: '', quantity: '', expiration_date: '' }],
          destinos: [{ warehouse_id: form.warehouse_id || '', quantity: '' }],
        },
      ],
    });
  };

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity') {
      if (newItems[index].lotes.length > 0) {
        newItems[index].lotes[0].quantity = value;
      }
      if (newItems[index].destinos.length === 1) {
        newItems[index].destinos[0].quantity = value;
      }
    }
    setForm({ ...form, items: newItems });
  };

  const updateLote = (itemIndex, loteIndex, field, value) => {
    const newItems = [...form.items];
    newItems[itemIndex].lotes[loteIndex] = {
      ...newItems[itemIndex].lotes[loteIndex],
      [field]: value,
    };
    setForm({ ...form, items: newItems });
  };

  const addDestino = (itemIndex) => {
    const newItems = [...form.items];
    newItems[itemIndex].destinos = [
      ...newItems[itemIndex].destinos,
      { warehouse_id: '', quantity: '' },
    ];
    setForm({ ...form, items: newItems });
  };

  const removeDestino = (itemIndex, destinoIndex) => {
    const newItems = [...form.items];
    newItems[itemIndex].destinos = newItems[itemIndex].destinos.filter(
      (_, i) => i !== destinoIndex,
    );
    setForm({ ...form, items: newItems });
  };

  const updateDestino = (itemIndex, destinoIndex, field, value) => {
    const newItems = [...form.items];
    newItems[itemIndex].destinos[destinoIndex] = {
      ...newItems[itemIndex].destinos[destinoIndex],
      [field]: value,
    };
    setForm({ ...form, items: newItems });
  };

  const getDistribuido = (item) =>
    item.destinos.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

  const getConversion = (item) => {
    const pres = presentaciones.find(
      (p) => p.id === parseInt(item.product_presentation_id),
    );
    if (!pres?.cantidad_base) return null;
    const qty = parseFloat(item.quantity) || 0;
    const unidad = pres.unidadBase?.nombre || '';
    return `= ${(qty * parseFloat(pres.cantidad_base)).toFixed(2)} ${unidad}`;
  };

  const getProductName = (id) =>
    productos.find((p) => p.id === parseInt(id))?.nombre || '';
  const getPresentacionName = (id) => {
    const p = presentaciones.find((pr) => pr.id === parseInt(id));
    if (!p) return '';
    return p.unidadBase
      ? `${p.nombre} (${p.cantidad_base} ${p.unidadBase.nombre})`
      : p.nombre;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.provider_id) newErrors.provider_id = 'Seleccione un proveedor';
    if (!form.purchase_date) newErrors.purchase_date = 'La fecha es requerida';
    if (form.items.length === 0) newErrors.items = 'Agregue al menos un ítem';
    form.items.forEach((item, i) => {
      if (!item.product_id)
        newErrors[`item_${i}_product`] = 'Seleccione un producto';
      if (!item.product_presentation_id)
        newErrors[`item_${i}_presentation`] = 'Seleccione presentación';
      if (!item.quantity || parseFloat(item.quantity) <= 0)
        newErrors[`item_${i}_quantity`] = 'Cantidad inválida';
      const lote = item.lotes[0];
      if (!lote?.lot_number)
        newErrors[`item_${i}_lote_number`] = 'Nro de lote requerido';
      if (item.destinos.length === 0) {
        newErrors[`item_${i}_destinos`] = 'Agregue al menos un destino';
      } else {
        const distribuido = getDistribuido(item);
        const total = parseFloat(item.quantity) || 0;
        if (Math.abs(distribuido - total) > 0.01) {
          newErrors[`item_${i}_destinos`] =
            `Distribuido: ${distribuido} ≠ Total: ${total}`;
        }
        item.destinos.forEach((destino, j) => {
          if (!destino.warehouse_id)
            newErrors[`item_${i}_dest_${j}_wh`] = 'Seleccione depósito';
          if (!destino.quantity || parseFloat(destino.quantity) <= 0)
            newErrors[`item_${i}_dest_${j}_qty`] = 'Cantidad inválida';
        });
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await onSave({
        ...form,
        provider_id: parseInt(form.provider_id),
        warehouse_id: form.warehouse_id ? parseInt(form.warehouse_id) : null,
        items: form.items.map((item) => ({
          ...item,
          product_id: parseInt(item.product_id),
          product_presentation_id: parseInt(item.product_presentation_id),
          quantity: parseFloat(item.quantity),
          lotes: item.lotes
            .filter((l) => l.lot_number)
            .map((l) => ({ ...l, quantity: parseFloat(item.quantity) })),
          destinos: item.destinos.map((d) => ({
            warehouse_id: parseInt(d.warehouse_id),
            quantity: parseFloat(d.quantity),
          })),
        })),
      });
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentacionesActivas = presentaciones.filter((p) => p.activo);

  return (
    <Modal
      show
      onHide={onClose}
      centered
      size="xl"
      dialogClassName="cmp-modal-wide"
    >
      <Modal.Header closeButton className="cmp-modal-header">
        <Modal.Title>
          <i className="bi bi-bag-plus me-2"></i>Nueva Compra
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="cmp-modal-body">
          {/* SECCIÓN 1: CABECERA */}
          <div className="cmp-section cmp-section-header">
            <div className="cmp-section-title">
              <i className="bi bi-file-earmark-text"></i>
              Datos de la compra
            </div>
            <div className="cmp-header-grid">
              <div>
                <label className="cmp-label">Proveedor *</label>
                <Form.Select
                  size="sm"
                  className="cmp-compact-select"
                  value={form.provider_id}
                  onChange={(e) =>
                    setForm({ ...form, provider_id: e.target.value })
                  }
                  isInvalid={!!errors.provider_id}
                >
                  <option value="">Seleccionar</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.provider_id}
                </Form.Control.Feedback>
              </div>
              <div>
                <label className="cmp-label">Fecha *</label>
                <Form.Control
                  size="sm"
                  className="cmp-compact-input"
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) =>
                    setForm({ ...form, purchase_date: e.target.value })
                  }
                  isInvalid={!!errors.purchase_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.purchase_date}
                </Form.Control.Feedback>
              </div>
              <div>
                <label className="cmp-label">Depósito default</label>
                <Form.Select
                  size="sm"
                  className="cmp-compact-select"
                  value={form.warehouse_id}
                  onChange={(e) =>
                    setForm({ ...form, warehouse_id: e.target.value })
                  }
                >
                  <option value="">Seleccionar</option>
                  {depositos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} ({d.codigo})
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div>
                <label className="cmp-label">Notas</label>
                <Form.Control
                  size="sm"
                  className="cmp-compact-input"
                  type="text"
                  placeholder="Observaciones..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: ÍTEMS */}
          <div className="cmp-section cmp-section-items">
            <div className="cmp-section-title">
              <i className="bi bi-box-seam"></i>
              Ítems de compra
              {form.items.length > 0 && (
                <span className="cmp-badge-count">{form.items.length}</span>
              )}
              <Button
                variant="success"
                size="sm"
                className="ms-auto"
                onClick={addItem}
              >
                <i className="bi bi-plus-lg me-1"></i>Agregar
              </Button>
            </div>

            {errors.items && (
              <div className="text-danger mb-2" style={{ fontSize: 12 }}>
                {errors.items}
              </div>
            )}

            {form.items.length === 0 ? (
              <div className="cmp-empty-state">
                <i className="bi bi-inbox"></i>
                <p>Sin ítems cargados</p>
                <small>Hacé clic en "Agregar" para cargar productos</small>
              </div>
            ) : (
              <>
                {/* Header de la tabla */}
                <div className="cmp-items-table-header">
                  <span className="cmp-col-num">#</span>
                  <span className="cmp-col-producto">Producto</span>
                  <span className="cmp-col-presentacion">Presentación</span>
                  <span className="cmp-col-lote">Lote</span>
                  <span className="cmp-col-cantidad">Cantidad</span>
                  <span className="cmp-col-vencimiento">Vencimiento</span>
                  <span className="cmp-col-accion"></span>
                </div>

                {/* Filas de ítems */}
                {form.items.map((item, i) => {
                  const conversion = getConversion(item);
                  return (
                    <div key={i} className="cmp-items-row">
                      <span className="cmp-col-num">
                        <span className="cmp-row-num">{i + 1}</span>
                      </span>
                      <span className="cmp-col-producto">
                        <ProductSearch
                          productos={productos}
                          value={item.product_id}
                          onSelect={(id) => updateItem(i, 'product_id', id)}
                          isInvalid={!!errors[`item_${i}_product`]}
                          errorText={errors[`item_${i}_product`]}
                        />
                      </span>
                      <span className="cmp-col-presentacion">
                        <Form.Select
                          size="sm"
                          className="cmp-compact-select"
                          value={item.product_presentation_id}
                          onChange={(e) =>
                            updateItem(
                              i,
                              'product_presentation_id',
                              e.target.value,
                            )
                          }
                          isInvalid={!!errors[`item_${i}_presentation`]}
                        >
                          <option value="">--</option>
                          {presentacionesActivas.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                              {p.unidadBase ? ` (${p.cantidad_base})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                      </span>
                      <span className="cmp-col-lote">
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          type="text"
                          placeholder="LP-001"
                          value={item.lotes[0]?.lot_number || ''}
                          onChange={(e) =>
                            updateLote(i, 0, 'lot_number', e.target.value)
                          }
                          isInvalid={!!errors[`item_${i}_lote_number`]}
                        />
                      </span>
                      <span className="cmp-col-cantidad">
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(i, 'quantity', e.target.value)
                          }
                          isInvalid={!!errors[`item_${i}_quantity`]}
                        />
                        {conversion && (
                          <small className="cmp-conversion">{conversion}</small>
                        )}
                      </span>
                      <span className="cmp-col-vencimiento">
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          type="date"
                          value={item.lotes[0]?.expiration_date || ''}
                          onChange={(e) =>
                            updateLote(i, 0, 'expiration_date', e.target.value)
                          }
                        />
                      </span>
                      <span className="cmp-col-accion">
                        <button
                          type="button"
                          className="cmp-btn-eliminar"
                          onClick={() => removeItem(i)}
                          title="Eliminar ítem"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* SECCIÓN 3: DESTINOS */}
          {form.items.length > 0 && (
            <div className="cmp-section cmp-section-destinos">
              <div className="cmp-section-title">
                <i className="bi bi-geo-alt"></i>
                Destinos de entrega
              </div>

              {form.items.map((item, i) => {
                const distribuido = getDistribuido(item);
                const total = parseFloat(item.quantity) || 0;
                const distOk = Math.abs(distribuido - total) < 0.01;
                const productName = getProductName(item.product_id);
                const presName = getPresentacionName(
                  item.product_presentation_id,
                );

                return (
                  <div key={i} className="cmp-destino-group">
                    <div className="cmp-destino-group-header">
                      <span className="cmp-destino-item-num">{i + 1}</span>
                      <span className="cmp-destino-item-name">
                        {productName}
                        {presName && (
                          <span className="cmp-destino-item-pres">
                            {' '}
                            — {presName}
                          </span>
                        )}
                      </span>
                      <span
                        className={`cmp-destino-status ${distOk ? 'cmp-destino-ok' : 'cmp-destino-pend'}`}
                      >
                        {distOk ? (
                          <>
                            <i className="bi bi-check-circle-fill"></i> OK
                          </>
                        ) : (
                          <>
                            <i className="bi bi-exclamation-circle-fill"></i>{' '}
                            Pendiente: {(total - distribuido).toFixed(2)}
                          </>
                        )}
                      </span>
                    </div>

                    {errors[`item_${i}_destinos`] && (
                      <div
                        className="text-danger mb-1"
                        style={{ fontSize: 11 }}
                      >
                        {errors[`item_${i}_destinos`]}
                      </div>
                    )}

                    {item.destinos.map((destino, j) => (
                      <div key={j} className="cmp-destino-row">
                        <Form.Select
                          size="sm"
                          className="cmp-compact-select"
                          value={destino.warehouse_id}
                          onChange={(e) =>
                            updateDestino(i, j, 'warehouse_id', e.target.value)
                          }
                          isInvalid={!!errors[`item_${i}_dest_${j}_wh`]}
                        >
                          <option value="">Seleccionar depósito</option>
                          {depositos.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nombre} ({d.codigo})
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          type="number"
                          step="0.01"
                          placeholder="Cantidad"
                          value={destino.quantity}
                          onChange={(e) =>
                            updateDestino(i, j, 'quantity', e.target.value)
                          }
                          isInvalid={!!errors[`item_${i}_dest_${j}_qty`]}
                        />
                        {item.destinos.length > 1 && (
                          <button
                            type="button"
                            className="cmp-btn-eliminar-sm"
                            onClick={() => removeDestino(i, j)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="cmp-btn-add-destino"
                      onClick={() => addDestino(i)}
                    >
                      <i className="bi bi-plus"></i> Agregar destino
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="cmp-modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="bi bi-arrow-repeat spin me-1"></i>Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i>Guardar Compra
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalCompras;
