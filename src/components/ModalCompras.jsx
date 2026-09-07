import { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ProductSearch = ({ productos, value, onSelect, isInvalid, errorText }) => {
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
      setHighlightIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1,
      );
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
        placeholder={selectedProduct ? selectedProduct.nombre : 'Buscar producto...'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlightIndex(-1);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        isInvalid={isInvalid}
      />
      {selectedProduct && (
        <div className="d-flex align-items-center mt-1">
          <small className="text-muted me-2">
            <i className="bi bi-check-circle-fill text-success me-1"></i>
            {selectedProduct.nombre}
          </small>
          <Button
            variant="link"
            size="sm"
            className="p-0 text-danger"
            style={{ fontSize: 11 }}
            onClick={() => onSelect('')}
          >
            <i className="bi bi-x"></i>
          </Button>
        </div>
      )}
      {isInvalid && (
        <div className="invalid-feedback" style={{ display: 'block', fontSize: 11 }}>
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

const ModalCompras = ({ proveedores, depositos, productos, onClose, onSave }) => {
  const [form, setForm] = useState({
    provider_id: '',
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
          destinos: [{ warehouse_id: '', quantity: '' }],
        },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const addLote = (itemIndex) => {
    const newItems = [...form.items];
    newItems[itemIndex].lotes = [
      ...newItems[itemIndex].lotes,
      { lot_number: '', quantity: '', expiration_date: '' },
    ];
    setForm({ ...form, items: newItems });
  };

  const removeLote = (itemIndex, loteIndex) => {
    const newItems = [...form.items];
    newItems[itemIndex].lotes = newItems[itemIndex].lotes.filter(
      (_, i) => i !== loteIndex,
    );
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

  const getDistribuido = (item) => {
    return item.destinos.reduce(
      (sum, d) => sum + (parseFloat(d.quantity) || 0),
      0,
    );
  };

  const getLotesQty = (item) => {
    return item.lotes.reduce(
      (sum, l) => sum + (parseFloat(l.quantity) || 0),
      0,
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!form.provider_id) newErrors.provider_id = 'Seleccione un proveedor';
    if (!form.purchase_date) newErrors.purchase_date = 'La fecha es requerida';
    if (form.items.length === 0) newErrors.items = 'Agregue al menos un ítem';
    form.items.forEach((item, i) => {
      if (!item.product_id) newErrors[`item_${i}_product`] = 'Seleccione un producto';
      if (!item.quantity || parseFloat(item.quantity) <= 0)
        newErrors[`item_${i}_quantity`] = 'Cantidad inválida';
      item.lotes.forEach((lote, j) => {
        if (!lote.lot_number)
          newErrors[`item_${i}_lote_${j}_number`] = 'Nro de lote requerido';
        if (!lote.quantity || parseFloat(lote.quantity) <= 0)
          newErrors[`item_${i}_lote_${j}_quantity`] = 'Cantidad inválida';
      });
      if (item.destinos.length === 0) {
        newErrors[`item_${i}_destinos`] = 'Agregue al menos un destino';
      } else {
        const distribuido = getDistribuido(item);
        const total = parseFloat(item.quantity) || 0;
        if (Math.abs(distribuido - total) > 0.01) {
          newErrors[`item_${i}_destinos`] = `Distribuido: ${distribuido} ≠ Total: ${total}`;
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
        items: form.items.map((item) => ({
          ...item,
          product_id: parseInt(item.product_id),
          product_presentation_id: item.product_presentation_id
            ? parseInt(item.product_presentation_id)
            : null,
          quantity: parseFloat(item.quantity),
          lotes: item.lotes.map((l) => ({
            ...l,
            quantity: parseFloat(l.quantity),
          })),
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

  return (
    <Modal show onHide={onClose} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Nueva Compra</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label>Proveedor *</Form.Label>
              <Form.Select
                value={form.provider_id}
                onChange={(e) => setForm({ ...form, provider_id: e.target.value })}
                isInvalid={!!errors.provider_id}
              >
                <option value="">Seleccionar proveedor</option>
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
            <div className="col-md-6 mb-3">
              <Form.Label>Fecha *</Form.Label>
              <Form.Control
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                isInvalid={!!errors.purchase_date}
              />
              <Form.Control.Feedback type="invalid">
                {errors.purchase_date}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="mb-3">
            <Form.Label>Notas</Form.Label>
            <Form.Control
              type="text"
              size="sm"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <hr />
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Ítems de compra</h6>
            <Button variant="outline-primary" size="sm" onClick={addItem}>
              <i className="bi bi-plus-lg me-1"></i>Agregar producto
            </Button>
          </div>

          {errors.items && (
            <div className="text-danger mb-2" style={{ fontSize: 12 }}>
              {errors.items}
            </div>
          )}

          {form.items.map((item, i) => (
            <div key={i} className="card mb-3" style={{ border: '1px solid #dee2e6' }}>
              {/* Header del ítem */}
              <div
                className="d-flex justify-content-between align-items-center px-3 py-2"
                style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}
              >
                <span className="cmp-item-num">Ítem {i + 1}</span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeItem(i)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>

              <div className="p-3">
                {/* SECCIÓN 1: Producto + Cantidad */}
                <div className="cmp-section-producto">
                  <div className="section-title">
                    <i className="bi bi-box-seam"></i> Producto y cantidad
                  </div>
                  <div className="row">
                    <div className="col-md-8 mb-2">
                      <Form.Label>Producto *</Form.Label>
                      <ProductSearch
                        productos={productos}
                        value={item.product_id}
                        onSelect={(id) => updateItem(i, 'product_id', id)}
                        isInvalid={!!errors[`item_${i}_product`]}
                        errorText={errors[`item_${i}_product`]}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <Form.Label>Cantidad total *</Form.Label>
                      <Form.Control
                        size="sm"
                        className="cmp-compact-input"
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        isInvalid={!!errors[`item_${i}_quantity`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`item_${i}_quantity`]}
                      </Form.Control.Feedback>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: Lotes */}
                <div className="cmp-section-lotes">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="section-title mb-0">
                      <i className="bi bi-tag"></i> Lotes
                      {item.quantity && (
                        <span className="ms-2 fw-normal" style={{ fontSize: 10 }}>
                          (ingresados: {getLotesQty(item)} / total: {item.quantity})
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => addLote(i)}
                    >
                      <i className="bi bi-plus"></i> Lote
                    </Button>
                  </div>

                  {item.lotes.map((lote, j) => (
                    <div key={j} className="row mb-2 mt-2">
                      <div className="col-md-3">
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          placeholder="Nro lote *"
                          value={lote.lot_number}
                          onChange={(e) => updateLote(i, j, 'lot_number', e.target.value)}
                          isInvalid={!!errors[`item_${i}_lote_${j}_number`]}
                        />
                      </div>
                      <div className="col-md-3">
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          type="number"
                          step="0.01"
                          placeholder="Cantidad *"
                          value={lote.quantity}
                          onChange={(e) => updateLote(i, j, 'quantity', e.target.value)}
                          isInvalid={!!errors[`item_${i}_lote_${j}_quantity`]}
                        />
                      </div>
                      <div className="col-md-5">
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          type="date"
                          value={lote.expiration_date}
                          onChange={(e) =>
                            updateLote(i, j, 'expiration_date', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-1">
                        {item.lotes.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeLote(i, j)}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SECCIÓN 3: Destinos */}
                <div className="cmp-section-destinos">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="section-title mb-0">
                      <i className="bi bi-geo-alt"></i> Destinos
                    </div>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => addDestino(i)}
                    >
                      <i className="bi bi-plus"></i> Depósito
                    </Button>
                  </div>

                  {errors[`item_${i}_destinos`] && (
                    <div className="text-danger mt-2" style={{ fontSize: 11 }}>
                      {errors[`item_${i}_destinos`]}
                    </div>
                  )}

                  {item.destinos.map((destino, j) => (
                    <div key={j} className="row mb-2 mt-2 align-items-center">
                      <div className="col-md-6">
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
                        <Form.Control.Feedback type="invalid">
                          {errors[`item_${i}_dest_${j}_wh`]}
                        </Form.Control.Feedback>
                      </div>
                      <div className="col-md-5">
                        <Form.Control
                          size="sm"
                          className="cmp-compact-input"
                          type="number"
                          step="0.01"
                          placeholder="Cantidad *"
                          value={destino.quantity}
                          onChange={(e) =>
                            updateDestino(i, j, 'quantity', e.target.value)
                          }
                          isInvalid={!!errors[`item_${i}_dest_${j}_qty`]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`item_${i}_dest_${j}_qty`]}
                        </Form.Control.Feedback>
                      </div>
                      <div className="col-md-1">
                        {item.destinos.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeDestino(i, j)}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Resumen distribución */}
                  {item.quantity && (
                    <div className="text-end mt-2">
                      <span
                        className={`cmp-dist-badge ${
                          Math.abs(getDistribuido(item) - (parseFloat(item.quantity) || 0)) < 0.01
                            ? 'cmp-dist-ok'
                            : 'cmp-dist-pendiente'
                        }`}
                      >
                        {Math.abs(getDistribuido(item) - (parseFloat(item.quantity) || 0)) < 0.01 ? (
                          <>
                            <i className="bi bi-check-circle-fill"></i> OK ({getDistribuido(item)} / {item.quantity})
                          </>
                        ) : (
                          <>
                            <i className="bi bi-exclamation-circle-fill"></i> Pendiente: {((parseFloat(item.quantity) || 0) - getDistribuido(item)).toFixed(2)}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Compra'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalCompras;
