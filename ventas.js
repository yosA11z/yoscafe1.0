// ** CONFIGURACIÓN DE STRIPE **
const STRIPE_PUBLISHABLE_KEY = "pk_test_51RaTFNRHhRRFfUmqBhlqSYfJ57cTtLgFzYztLCvt6CLgxsvFAvxgoUYXiqAqo9JGLZY10TvBgzMBQVd0tCiClkiy00QHCWm1kq";

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

// Mensajes del sistema
const systemMessageContainer = document.getElementById('systemMessageContainer');

/**
 * Muestra un mensaje al usuario en el contenedor de mensajes del sistema.
 * @param {string} message - El texto del mensaje.
 * @param {'info'|'success'|'error'} type - El tipo de mensaje para aplicar estilos.
 */
function showSystemMessage(message, type = 'info') {
    systemMessageContainer.textContent = message;
    // Elimina todas las clases de tipo antes de añadir la nueva
    systemMessageContainer.classList.remove('hidden', 'success', 'error', 'info', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-blue-100', 'text-blue-800');
    if (type === 'success') {
        systemMessageContainer.classList.add('success');
    } else if (type === 'error') {
        systemMessageContainer.classList.add('error');
    } else {
        systemMessageContainer.classList.add('info');
    }
    systemMessageContainer.classList.remove('hidden'); // Asegura que el mensaje sea visible
}

/**
 * Oculta el contenedor de mensajes del sistema.
 */
function hideSystemMessage() {
    systemMessageContainer.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    // Definición de productos con sus respectivos Price IDs de Stripe
    const products = {
        classic: {
            name: "Café Yoscafé Clásico",
            price: 25000, 
            id: 'classic',
            stripePriceId: 'price_1RaTIdRHhRRFfUmq2K9VWTDy',
            keywords: "clásico, tradicional, medio, suave, chocolate, frutos secos, tostado",
            image: "Yoscafe.png", 
            description: "Nuestro blend tradicional, de tueste medio, con notas suaves a chocolate y frutos secos. Ideal para disfrutar en cualquier momento del día, ofreciendo una experiencia equilibrada y reconfortante."
        },
        premium: {
            name: "Café Yoscafé Premium Selección",
            price: 40000,
            id: 'premium',
            stripePriceId: 'price_1RaTJQRHhRRFfUmqKDrV6jrN',
            keywords: "premium, selección, especial, fuerte, intenso, frutal, acidez, floral, exótico",
            image: "Yoscafe_bolsa.png", 
            description: "Una selección especial de granos, con un tueste intenso que resalta sus notas frutales y una acidez vibrante. Un café para los paladares más exigentes."
        },
        decaf: {
            name: "Café Yoscafé Descafeinado",
            price: 30000,
            id: 'decaf',
            stripePriceId: 'price_1RaTKDRHhRRFfUmqEkTuqSUm',
            keywords: "descafeinado, suave, sin cafeína, noche, ligero, tranquilo",
            image: "Yoscafe_tarro.png", 
            description: "Disfruta del auténtico sabor del café sin cafeína. Nuestro descafeinado conserva el cuerpo y aroma, perfecto para tus noches o momentos de tranquilidad."
        }
    };

    // ** CAMBIO CLAVE AQUÍ: Inicializar el carrito desde localStorage **
    // Si no hay datos en localStorage, se inicializa como un array vacío.
    let cart = JSON.parse(localStorage.getItem('yoscafeCart')) || [];


    // Elementos del DOM existentes
    const productCards = document.querySelectorAll('.product-card');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const checkoutFormContainer = document.getElementById('checkoutFormContainer');
    const shippingForm = document.getElementById('shippingForm');
    const orderMessage = document.getElementById('orderMessage');

    // Elementos de la barra de búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    // Campos ocultos para Formspree
    const orderDetailsHidden = document.getElementById('orderDetailsHidden');
    const orderTotalHidden = document.getElementById('orderTotalHidden');

    // --- Elementos para controlar la visibilidad de las secciones ---
    const mainStoreContent = document.querySelector('.store-main-content');
    const cartSummarySection = document.getElementById('cartSummarySection');
    const viewCartBtn = document.getElementById('viewCartBtn');
    const homeLink = document.getElementById('homeLink');

    // NUEVOS ELEMENTOS PARA DETALLES DEL PRODUCTO
    const productDetailSection = document.getElementById('productDetailSection');
    const backToProductsBtn = document.getElementById('backToProductsBtn');
    const detailProductImage = document.getElementById('detailProductImage');
    const detailProductTitle = document.getElementById('detailProductTitle');
    const detailProductType = document.getElementById('detailProductType');
    const detailProductPrice = document.getElementById('detailProductPrice');
    const detailProductDescription = document.getElementById('detailProductDescription');
    const detailQtyInput = document.getElementById('detailQty');
    const detailAddToCartBtn = document.getElementById('detailAddToCartBtn');
    let currentProductInDetail = null; // Para saber qué producto se está viendo en detalle

    // --- Funciones para mostrar/ocultar secciones ---
    function showStoreContent() {
        mainStoreContent.style.display = 'block';
        cartSummarySection.style.display = 'none';
        checkoutFormContainer.style.display = 'none';
        productDetailSection.style.display = 'none'; // Oculta la sección de detalles
        checkoutBtn.style.display = 'block'; // Asegura que el botón "Proceder al Pago" esté visible
        // Asegúrate de que el botón de proceder al pago esté en su estado inicial
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.style.backgroundColor = cart.length === 0 ? '#383838' : '';
        checkoutBtn.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
    }

    function showCartSummary() {
        mainStoreContent.style.display = 'none';
        productDetailSection.style.display = 'none'; // Oculta la sección de detalles
        cartSummarySection.style.display = 'block';
        checkoutFormContainer.style.display = 'none';
        checkoutBtn.style.display = 'block';

        // Al mostrar el carrito, si hay items, habilita el botón de checkout
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.style.backgroundColor = cart.length === 0 ? '#383838' : '';
        checkoutBtn.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
    }

    // NUEVA FUNCIÓN: Mostrar detalles de un producto
    function showProductDetail(productId) {
        const product = products[productId];
        if (!product) {
            showSystemMessage('Error: Detalles del producto no encontrados.', 'error');
            showStoreContent(); // Volver a la vista de la tienda
            return;
        }

        // Rellenar la sección de detalles con la información del producto
        detailProductImage.src = product.image;
        detailProductImage.alt = `Imagen de ${product.name}`;
        detailProductTitle.textContent = product.name;
        // La lógica para `detailProductType` puede ser más robusta si tienes más tipos
        // O podrías añadir una propiedad 'typeDisplay' a tu objeto products
        detailProductType.textContent = product.name.includes("Clásico") ? "Blend Tradicional" :
                                       (product.name.includes("Premium") ? "Origen Especial" :
                                       (product.name.includes("Descafeinado") ? "Sin Cafeína" : ""));
        detailProductPrice.textContent = `$ ${product.price.toLocaleString('es-CO')} COP`;
        detailProductDescription.textContent = product.description;
        detailQtyInput.value = 1; // Resetea la cantidad a 1 por defecto
        currentProductInDetail = product; // Guarda el producto actual para el botón de añadir

        // Mostrar la sección de detalles y ocultar las demás
        mainStoreContent.style.display = 'none';
        cartSummarySection.style.display = 'none';
        checkoutFormContainer.style.display = 'none';
        productDetailSection.style.display = 'block';
    }


    // --- Funciones de la Barra de Búsqueda ---
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        // Solo aplica el filtro si estamos en la vista de productos
        if (mainStoreContent.style.display === 'block') {
            productCards.forEach(card => {
                const productTitle = card.querySelector('.product-title-epic').textContent.toLowerCase();
                const productType = card.querySelector('.product-type-epic').textContent.toLowerCase();
                const productKeywords = card.dataset.keywords ? card.dataset.keywords.toLowerCase() : '';

                if (searchTerm === '' || productTitle.includes(searchTerm) ||
                    productType.includes(searchTerm) ||
                    productKeywords.includes(searchTerm)) {
                    card.style.display = 'flex'; // Usamos flex porque las product-card son flex-items
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }

    // --- Funciones del Carrito ---
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutBtn.disabled = true;
            checkoutBtn.style.backgroundColor = '#383838';
            checkoutBtn.style.cursor = 'not-allowed';
            checkoutFormContainer.style.display = 'none';
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;
            checkoutBtn.style.backgroundColor = '';
            checkoutBtn.style.cursor = 'pointer';

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                itemCount += item.quantity;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <div class="item-details">
                        <span>${item.name}</span> x ${item.quantity}
                    </div>
                    <div class="item-price">
                        $ ${(itemTotal).toLocaleString('es-CO')} COP
                        <button class="remove-item-btn" data-product-id="${item.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        cartTotalSpan.textContent = `$ ${total.toLocaleString('es-CO')} COP`;
        document.getElementById('cartItemCount').textContent = itemCount;

        orderDetailsHidden.value = JSON.stringify(cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        })));
        orderTotalHidden.value = total.toLocaleString('es-CO');

        // Guarda el carrito en localStorage cada vez que se actualiza
        localStorage.setItem('yoscafeCart', JSON.stringify(cart));
    }

    /**
     * Añade un producto al carrito o incrementa su cantidad.
     * @param {string} productId - ID del producto a añadir.
     * @param {number} quantity - Cantidad a añadir.
     */
    function addToCart(productId, quantity) {
        const product = products[productId];
        if (!product || quantity <= 0) {
            showSystemMessage('Error: Producto no encontrado o cantidad inválida.', 'error');
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.id === productId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        showSystemMessage(`${quantity}x ${product.name} añadido al carrito.`, 'success');
        setTimeout(hideSystemMessage, 3000); 
        updateCartDisplay();
    }

    /**
     * Elimina un producto del carrito.
     * @param {string} productId - ID del producto a eliminar.
     */
    function removeFromCart(productId) {
        const removedItem = cart.find(item => item.id === productId);
        cart = cart.filter(item => item.id !== productId);
        if (removedItem) {
            showSystemMessage(`${removedItem.name} eliminado del carrito.`, 'info');
            setTimeout(hideSystemMessage, 3000);
        }
        updateCartDisplay();
    }

    // --- Event Listeners ---

    // Añadir al Carrito desde las tarjetas de productos (existente)
    productCards.forEach(card => {
        const productId = card.dataset.productId;
        const quantityInput = card.querySelector(`.product-quantity[id="qty-${productId}"]`);
        const addToCartBtn = card.querySelector('.add-to-cart-btn');

        // Listener para el botón "Agregar al Carrito" de la tarjeta
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);
                addToCart(productId, quantity);
            });
        }

        // Listener para clic en la imagen de la tarjeta para ver detalles
        const productImage = card.querySelector('.product-image-epic');
        if (productImage) {
            productImage.style.cursor = 'pointer'; // Para indicar que es clicable
            productImage.addEventListener('click', () => {
                showProductDetail(productId); // Muestra los detalles de ESTE producto
            });
        }
    });

    // NUEVO: Listener para el botón "Añadir al Carrito" en la sección de detalles
    if (detailAddToCartBtn) {
        detailAddToCartBtn.addEventListener('click', () => {
            if (currentProductInDetail) {
                const quantity = parseInt(detailQtyInput.value);
                addToCart(currentProductInDetail.id, quantity);
                
            }
        });
    }

    // NUEVO: Listener para el botón "Volver a Productos"
    if (backToProductsBtn) {
        backToProductsBtn.addEventListener('click', () => {
            showStoreContent();
        });
    }

    // Eliminar del Carrito (listener delegado en el contenedor del carrito)
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item-btn') || event.target.closest('.remove-item-btn')) {
            const button = event.target.closest('.remove-item-btn');
            const productId = button.dataset.productId;
            removeFromCart(productId);
        }
    });

    // ** INTEGRACIÓN DE STRIPE: Botón Proceder al Pago **
    checkoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            showSystemMessage('Tu carrito está vacío. Añade productos antes de proceder al pago.', 'error');
            return;
        }

        showSystemMessage('Redirigiendo a Stripe para completar el pago...', 'info');
        checkoutBtn.disabled = true;
        checkoutBtn.style.backgroundColor = '#383838';
        checkoutBtn.style.cursor = 'not-allowed';

        const lineItemsForStripe = cart.map(item => {
            const productDetails = products[item.id];
            if (!productDetails || !productDetails.stripePriceId) {
                console.error(`Error: Product ${item.id} missing Stripe Price ID.`);
                showSystemMessage(`Error: El producto "${item.name}" no tiene un ID de Precio de Stripe válido.`, 'error');
                return null;
            }
            return {
                price: productDetails.stripePriceId,
                quantity: item.quantity,
            };
        }).filter(item => item !== null);

        if (lineItemsForStripe.length === 0 || lineItemsForStripe.some(item => !item.price)) {
            showSystemMessage('No se pudieron preparar los productos para el pago de Stripe. Asegúrate de que todos los productos tienen un "stripePriceId" válido.', 'error');
            checkoutBtn.disabled = false;
            checkoutBtn.style.backgroundColor = '';
            checkoutBtn.style.cursor = 'pointer';
            return;
        }

        try {
            const result = await stripe.redirectToCheckout({
                lineItems: lineItemsForStripe,
                mode: "payment",
                successUrl: "https://yoscafe.vercel.app/pasareladepago/success.html",
                cancelUrl: "https://yoscafe.vercel.app/pasareladepago/cancel.html"
            });

            if (result.error) {
                console.error("Error en redirectToCheckout:", result.error.message);
                showSystemMessage(`Error al procesar el pago: ${result.error.message}`, 'error');
                checkoutBtn.disabled = false;
                checkoutBtn.style.backgroundColor = '';
                checkoutBtn.style.cursor = 'pointer';
            }
        } catch (error) {
            console.error("Ocurrió un error inesperado al intentar redirigir a Checkout:", error);
            showSystemMessage(`Ocurrió un error inesperado: ${error.message}`, 'error');
            checkoutBtn.disabled = false;
            checkoutBtn.style.backgroundColor = '';
            checkoutBtn.style.cursor = 'pointer';
        }
    });

    // Lógica para el formulario de envío (Formspree)
    shippingForm.addEventListener('submit', (event) => {
        event.preventDefault();

        orderMessage.classList.remove('success', 'error');
        orderMessage.textContent = 'Enviando tu orden... Recibirás las instrucciones de pago por correo.';
        orderMessage.style.color = 'green';

        const formData = new FormData(shippingForm);
        fetch(shippingForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                orderMessage.textContent = '¡Orden enviada con éxito! Revisa tu correo para las instrucciones de pago.';
                orderMessage.style.color = 'green';
                shippingForm.reset();
                cart = []; 
                updateCartDisplay();
            } else {
                response.json().then(data => {
                    if (Object.hasOwnProperty.call(data, 'errors')) {
                        orderMessage.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        orderMessage.textContent = 'Ocurrió un error al enviar tu orden.';
                    }
                    orderMessage.style.color = 'red';
                });
            }
        }).catch(error => {
            console.error('Error al enviar el formulario:', error);
            orderMessage.textContent = 'Hubo un problema de conexión al enviar tu orden.';
            orderMessage.style.color = 'red';
        });
    });

    // --- Event Listeners para la Barra de Búsqueda ---
    searchInput.addEventListener('input', filterProducts);
    searchBtn.addEventListener('click', filterProducts);

    // --- Event Listeners para la navegación entre secciones ---
    viewCartBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        showCartSummary();
    });

    homeLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        showStoreContent();
    });

    
    showStoreContent();
    updateCartDisplay(); 
    filterProducts();
});