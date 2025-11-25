document.addEventListener("DOMContentLoaded", () => {

  let carrito = [];

  try {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
    }
  } catch (e) {
    console.error("Error cargando carrito desde localStorage:", e);
  }


  // ✅ NÚMERO DE WHATSAPP
  const numeroWpp = "5491138438009";

  // ✅ ELEMENTOS DEL DOM
  const contenedor = document.getElementById("productos");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total-carrito");
  const contador = document.getElementById("contador-carrito");
  const btnWpp = document.getElementById("btn-wpp");
  const btnVaciar = document.getElementById("vaciar-carrito");
  let productos = [];

  btnVaciar.addEventListener("click", () => {
    if (confirm("¿Seguro quieres vaciar el carrito?")) {
      carrito = [];
      actualizarCarrito();
    }
  });

  actualizarCarrito();
  // ✅ CARGAR PRODUCTOS
  fetch("../productos.json")
    .then(r => r.json())
    .then(data => {
      productos = data;

      // 🟢 Obtener categorías únicas
      const categorias = [...new Set(productos.map(p => p.Categoría.trim().toLowerCase()))];

      // 🟢 Crear los botones dinámicamente
      const contenedorBotones = document.getElementById("botones-categorias");
      contenedorBotones.innerHTML = `
      <button class="btn btn-outline-danger filter-btn active" data-filter="all">Todos</button>
    `;

      categorias.forEach(cat => {
        const nombreMostrar = cat.charAt(0).toUpperCase() + cat.slice(1);
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-danger filter-btn";
        btn.dataset.filter = cat;
        btn.textContent = nombreMostrar;
        contenedorBotones.appendChild(btn);
      });

      // 🟢 Asignar eventos a los botones
      const filterButtons = document.querySelectorAll('.filter-btn');
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          mostrarProductos(btn.dataset.filter);
        });
      });

      mostrarProductos();
    })
    .catch(e => console.error("Error al cargar productos.json:", e));

  function mostrarProductos(filtro = "all", listaPersonalizada = null) {
    contenedor.innerHTML = "";

    const lista = listaPersonalizada
      ? listaPersonalizada
      : filtro === "all"
        ? productos
        : productos.filter(p => p.Categoría.toLowerCase() === filtro);

    lista.forEach(prodBase => {
      const card = document.createElement("div");
      card.classList.add("col-12", "col-sm-6", "col-lg-3", "mb-4");

      // Descripción
      const descripcionHTML = prodBase.Descripción
        ? `<p class="text-muted small mb-1">${prodBase.Descripción}</p>`
        : "";

      // Mostrar precios correctamente
      let precioHTML = "";
      const esBulonera = prodBase.Categoría?.toLowerCase().includes("bulonera");

      // 📝 Si tiene nota, mostrarla
      let notaHTML = "";
      if (prodBase["Notas"]) {
        notaHTML = `<p class="text-info small fst-italic mb-2">Nota: ${prodBase.Notas}</p>`;
      }

      if (esBulonera) {
        // 🟩 Mostrar precios de bulonera
        precioHTML = `
        <p class="fw-bold mb-1 text-success">
          Precio unidad por bulto: $${prodBase.PrecioUnidadxBulto ? prodBase.PrecioUnidadxBulto.toFixed(2) : "-"}
        </p>
        ${prodBase.UnidadesPorBulto
            ? `<p class="text-muted small mb-1">(Trae ${prodBase.UnidadesPorBulto} unidades por bulto)</p>`
            : ""}
        ${prodBase.PrecioTotalBulto
            ? `<p class="text-muted small mb-1">Precio total bulto: $${prodBase.PrecioTotalBulto ? prodBase.PrecioTotalBulto.toFixed(2) : "-"}</p>`
            : ""}
      `;
      } else if (prodBase.PrecioConDescuento) {
        // 💵 Si tiene descuento, mostrar ambos precios
        precioHTML = `
        <p class="fw-bold mb-1 text-danger">
          Precio: <s>$${Number(prodBase.Precio).toFixed(2)}</s>
        </p>
        <p class="fw-bold mb-1 text-success">
          Precio con descuento: $${Number(prodBase.PrecioConDescuento).toFixed(2)}
        </p>
      `;
      } else if (prodBase.PrecioTotalBulto) {
        // 🟦 Productos con precio por bulto
        precioHTML = `
        <p class="fw-bold mb-1 text-success">
          Precio unidad por bulto: $${prodBase.PrecioUnidadxBulto ? prodBase.PrecioUnidadxBulto.toFixed(2) : "-"}
        </p>
        ${prodBase.UnidadesPorBulto
            ? `<p class="text-muted small mb-2">(Trae ${prodBase.UnidadesPorBulto} unidades por bulto)</p>`
            : ""}
        <p class="text-muted small mb-1">Precio unidad suelta: $${prodBase.Precio ? prodBase.Precio.toFixed(2) : "-"}</p>
      `;
      } else {
        // 🟨 Productos simples
        precioHTML = `
        <p class="fw-bold mb-2 text-success">
          Precio: $${prodBase.Precio ? prodBase.Precio.toFixed(2) : "-"}
        </p>
      `;
      }

      // Ver si es polvo o quimico (venden por unidad o por bulto)
      const tieneTablaBultos =
        prodBase.PrecioUnidadxBulto !== undefined &&
        prodBase.PrecioTotalBulto !== undefined &&
        prodBase.UnidadesPorBulto !== undefined;
      // Si NO tienen precio individual → solo vender por bulto
      const soloBulto = prodBase.Precio === undefined || prodBase.Precio === null;
      // 🧱 Estructura de la card
      card.innerHTML = `
      <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
        <div class="d-flex align-items-center justify-content-center bg-light" style="height: 250px;">
          <img src="../img/${prodBase.Img || 'sin-imagen.png'}" class="img-fluid" alt="${prodBase.Producto}" style="max-height:230px; object-fit:contain;">
        </div>

        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-semibold mb-2" title="${prodBase.Producto}">
            ${prodBase.Producto.toUpperCase()}
          </h5>
          ${descripcionHTML}
          <div class="zona-precio mb-2">${precioHTML}</div>
          ${notaHTML}
          ${tieneTablaBultos
          ? (
            soloBulto
              ? `
            <label class="form-label small mb-1">Cantidad de bultos:</label>
            <input type="number" min="1" value="1" class="form-control form-control-sm mb-3 cantidad-bultos">
          `
              : `
            <label class="form-label small mb-1">Cantidad de bultos:</label>
            <input type="number" min="0" value="0" class="form-control form-control-sm mb-2 cantidad-bultos">
            <label class="form-label small mb-1">Cantidad de unidades sueltas:</label>
            <input type="number" min="0" value="0" class="form-control form-control-sm mb-3 cantidad-unidades">
          `
          )
          : `<input type="number" min="1" value="1" class="form-control form-control-sm mb-3 cantidad-input">`
        }

          <button class="btn btn-success w-100 mt-auto agregar-carrito">
            <i class="bi bi-cart-plus"></i> Agregar
          </button>
        </div>
      </div>
    `;

      contenedor.appendChild(card);

      // ✅ Agregar al carrito
      const btn = card.querySelector(".agregar-carrito");

      btn.addEventListener("click", () => {

        let productoParaAgregar = { ...prodBase };

        // Aplicar precio correcto
        if (prodBase.PrecioConDescuento) {
          productoParaAgregar.precioAplicado = Number(prodBase.PrecioConDescuento);
          productoParaAgregar.conDescuento = true;

        } else if (prodBase.Precio != null) {
          productoParaAgregar.precioAplicado = Number(prodBase.Precio);
          productoParaAgregar.conDescuento = false;

        } else if (soloBulto && prodBase.PrecioTotalBulto) {
          productoParaAgregar.precioAplicado = Number(prodBase.PrecioTotalBulto);
          productoParaAgregar.conDescuento = false;
        }

        // SI TIENE TABLA DE BULTOS / UNIDADES
        if (tieneTablaBultos) {

          const inputBultos = card.querySelector(".cantidad-bultos");
          const inputUnidades = card.querySelector(".cantidad-unidades"); // puede NO existir

          const cantidadBultos = inputBultos ? parseInt(inputBultos.value) || 0 : 0;
          const cantidadUnidades = inputUnidades ? parseInt(inputUnidades.value) || 0 : 0;

          if (cantidadBultos > 0 || cantidadUnidades > 0) {
            agregarAlCarrito({
              ...productoParaAgregar,
              cantidadBultos,
              cantidadUnidades
            });
          }

          // Reset seguro
          if (inputBultos) inputBultos.value = soloBulto ? 1 : 0;
          if (inputUnidades) inputUnidades.value = 0;

        }
        else {

          const inputCantidad = card.querySelector(".cantidad-input");
          const cantidad = inputCantidad ? parseInt(inputCantidad.value) || 1 : 1;

          if (cantidad > 0) {
            agregarAlCarrito({
              ...productoParaAgregar,
              cantidad
            });
          }

          if (inputCantidad) inputCantidad.value = 1;
        }
      });

    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mostrarProductos(btn.dataset.filter);
    });
  });

  // ✅ BUSCADOR
  const buscador = document.getElementById("buscador");
  buscador.addEventListener("input", () => {
    const texto = buscador.value.trim().toLowerCase();
    mostrarProductosBusqueda(texto);
  });

  function mostrarProductosBusqueda(texto) {
    const filtrados = texto === ""
      ? productos
      : productos.filter(p => p.Producto.toLowerCase().includes(texto));
    mostrarProductos("busqueda", filtrados);
  }

  function agregarAlCarrito(prod) {
    const unidadesPorBulto = Number(prod.UnidadesPorBulto) || 0;
    const precioAplicado = Number(prod.precioAplicado) || 0; // 💰 viene ya definido desde mostrarProductos()

    // Buscar coincidencias en carrito (mismo producto, tipoVenta y condición de descuento)
    const buscarExistente = (tipoVenta) =>
      carrito.findIndex(
        item =>
          Number(item.Id) === Number(prod.Id) &&
          item.tipoVenta === tipoVenta &&
          (!!item.conDescuento === !!prod.conDescuento)
      );

    // 🧩 Caso: polvos / productos con bultos y unidades
    if (prod.cantidadBultos !== undefined || prod.cantidadUnidades !== undefined) {
      const cantidadBultos = Number(prod.cantidadBultos) || 0;
      const cantidadUnidades = Number(prod.cantidadUnidades) || 0;

      // 🔹 Bultos completos
      if (cantidadBultos > 0) {
        const tipoVenta = "bulto";
        const idx = buscarExistente(tipoVenta);
        const precioBulto = Number(prod.PrecioTotalBulto) || 0;
        if (idx >= 0) {
          carrito[idx].cantidad += cantidadBultos;
        } else {
          carrito.push({
            ...prod,
            tipoVenta,
            cantidad: cantidadBultos,
            detalle: `${cantidadBultos} bulto(s) (${unidadesPorBulto}u c/u)`,
            precioAplicado: precioBulto,
          });
        }
      }

      // 🔹 Unidades sueltas
      if (cantidadUnidades > 0) {
        const tipoVenta = "unidad";
        const idx = buscarExistente(tipoVenta);

        if (idx >= 0) {
          carrito[idx].cantidad += cantidadUnidades;
        } else {
          carrito.push({
            ...prod,
            tipoVenta,
            cantidad: cantidadUnidades,
            detalle: `${cantidadUnidades} unidad(es) suelta(s)`,
            precioAplicado,
          });
        }
      }
    }
    // 🧩 Caso normal (no polvo)
    else {
      const cantidad = Number(prod.cantidad) || 1;
      const esBulonera = prod.Categoría?.toLowerCase().includes("bulonera");
      const tipoVenta = esBulonera ? "bulto" : "unidad";

      // ✅ Precio correcto según tipo
      const precioFinal = esBulonera
        ? Number(prod.PrecioTotalBulto) || 0   // precio del bulto
        : Number(precioAplicado) || 0;         // precio unidad o descuento

      const idx = buscarExistente(tipoVenta);
      if (idx >= 0) {
        carrito[idx].cantidad += cantidad;
      } else {
        carrito.push({
          ...prod,
          tipoVenta,
          cantidad,
          precioAplicado: precioFinal, // ✅ ahora guarda el precio total por bulto
          detalle: esBulonera
            ? `${cantidad} bulto(s) (${prod.UnidadesPorBulto}u c/u)`
            : `${cantidad} unidad(es)`
        });
      }
    }


    actualizarCarrito();
  }
  function actualizarCarrito() {
    listaCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((p, i) => {
      const precioAplicado = Number(p.precioAplicado) || 0;
      const cantidad = Number(p.cantidad) || 0;
      const subtotal = precioAplicado * cantidad;
      total += subtotal;

      const precioStr = precioAplicado.toFixed(2);
      const textoDescuento = p.conDescuento
        ? ' <span class="text-success small">(precio con descuento aplicado)</span>'
        : '';

      const li = document.createElement("li");
      li.classList.add(
        "list-group-item",
        "d-flex",
        "justify-content-between",
        "align-items-center",
        "flex-wrap"
      );

      li.innerHTML = `
      <div>
        <strong>${p.Producto}</strong> (${p.Tipo || "Único"})${textoDescuento}<br>
        <small class="text-muted">${p.detalle ? p.detalle : (p.tipoVenta ? p.tipoVenta.toUpperCase() : "")}</small><br>
        <small>Precio: $${precioStr}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary restar">-</button>
        <input type="number" min="1" value="${cantidad}" class="form-control form-control-sm cantidad-carrito" style="width:60px;">
        <button class="btn btn-sm btn-outline-secondary sumar">+</button>
        <button class="btn btn-sm btn-danger eliminar"><i class="bi bi-trash"></i></button>
      </div>
    `;

      // ➕➖ botones
      li.querySelector(".sumar").addEventListener("click", () => {
        p.cantidad = Number(p.cantidad || 0) + 1;
        actualizarCarrito();
      });

      li.querySelector(".restar").addEventListener("click", () => {
        p.cantidad = Number(p.cantidad || 0) - 1;
        if (p.cantidad < 1) carrito.splice(i, 1);
        actualizarCarrito();
      });

      li.querySelector(".cantidad-carrito").addEventListener("input", e => {
        const nuevaCantidad = Number(e.target.value);
        if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
          p.cantidad = nuevaCantidad;
          actualizarCarrito();
        }
      });

      li.querySelector(".eliminar").addEventListener("click", () => {
        carrito.splice(i, 1);
        actualizarCarrito();
      });

      listaCarrito.appendChild(li);
    });

    // Totales
    totalCarrito.textContent = total.toFixed(2);
    contador.textContent = carrito.reduce((acc, p) => acc + (Number(p.cantidad) || 0), 0);

    // Generar mensaje para WhatsApp
    const mensaje = carrito
      .map(p => {
        const tipoCompra = p.tipoVenta ? p.tipoVenta.toUpperCase() : "UNIDAD";
        const subtotal = (Number(p.precioAplicado) * Number(p.cantidad)).toFixed(2);
        const subtotalSinDcto = (Number(p.Precio) * Number(p.cantidad)).toFixed(2);
        if (p.conDescuento) {
          return `- ${p.Producto} • Cant: ${p.cantidad} • precioConDcto: $${p.precioAplicado.toFixed(2)} = $${subtotal} (sin dcto: $${Number(p.Precio).toFixed(2)} = $${subtotalSinDcto})`;
        }
        return `- ${p.Producto} (${p.Tipo || "Único"}) • ${tipoCompra} x${p.cantidad} = $${subtotal}`;
      })
      .join("%0A");

    btnWpp.href = `https://wa.me/${numeroWpp}?text=Hola!%20Quiero%20pedir:%0A${mensaje}%0A%0ATotal:%20$${total.toFixed(2)}`;

    localStorage.setItem("carrito", JSON.stringify(carrito));
  }
});