// Bean Boutique - simple website interactions

document.addEventListener("DOMContentLoaded", function () {
  // Mobile navigation
  var navButton = document.querySelector(".nav-toggle");
  var navigation = document.querySelector(".main-nav");
  if (navButton && navigation) {
    navButton.addEventListener("click", function () {
      navigation.classList.toggle("open");
      navButton.setAttribute("aria-expanded", navigation.classList.contains("open"));
    });
  }

  // Homepage slideshow
  var slides = document.querySelectorAll(".slide");
  if (slides.length > 1) {
    var currentSlide = 0;
    window.setInterval(function () {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }, 3500);
  }

  // First-visit discount popup. The user can close it or choose "Maybe later".
  var modal = document.getElementById("welcome-modal");
  if (modal) {
    window.setTimeout(function () {
      modal.hidden = false;
    }, 300);
  }
  if (modal) {
    var closeButton = modal.querySelector(".modal-close");
    function closeModal() {
      modal.hidden = true;
      localStorage.setItem("beanBoutiqueOfferSeen", "yes");
    }
    if (closeButton) closeButton.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  // Search products on the Coffee page with a small live message.
  var searchInput = document.querySelector("[data-search]");
  if (searchInput) {
    var searchCards = document.querySelectorAll("[data-product-card]");
    var emptyMessage = document.querySelector(".empty-search");
    var searchHint = document.querySelector(".search-hint");
    searchInput.addEventListener("input", function () {
      var term = searchInput.value.toLowerCase().trim();
      var visibleCount = 0;
      searchCards.forEach(function (card) {
        var searchableText = (card.dataset.name + " " + card.dataset.description).toLowerCase();
        var matches = searchableText.includes(term);
        card.hidden = !matches;
        if (matches) visibleCount++;
      });
      if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
      if (searchHint) searchHint.textContent = term ? visibleCount + " product(s) found." : "Start typing to find your perfect cup.";
    });
  }

  // Shopping cart: stored in this browser with localStorage.
  var CART_KEY = "beanBoutiqueCart";
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }
  function updateCartCount() {
    var cart = readCart();
    var total = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    document.querySelectorAll(".cart-count").forEach(function (counter) {
      counter.textContent = total;
    });
  }
  function addToCart(card) {
    var cart = readCart();
    var productId = card.dataset.id;
    var existing = cart.find(function (item) { return item.id === productId; });
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        quantity: 1
      });
    }
    saveCart(cart);
    var button = card.querySelector(".add-to-cart");
    if (button) {
      var oldText = button.textContent;
      button.textContent = "Added ✓";
      window.setTimeout(function () { button.textContent = oldText; }, 1000);
    }
  }
  document.querySelectorAll(".add-to-cart").forEach(function (button) {
    button.addEventListener("click", function () {
      var card = button.closest("[data-product-card]");
      if (card) addToCart(card);
    });
  });
  updateCartCount();

  // Slide-out transparent basket on Coffee and Services pages.
  if (document.body.dataset.page === "coffee" || document.body.dataset.page === "services") {
    var basketButton = document.createElement("button");
    basketButton.type = "button";
    basketButton.className = "basket-float-button";
    basketButton.innerHTML = '🛒 Basket <span class="cart-count">0</span>';
    basketButton.setAttribute("aria-label", "Open shopping basket");
    var basketOverlay = document.createElement("div");
    basketOverlay.className = "basket-overlay";
    basketOverlay.hidden = true;
    var basketDrawer = document.createElement("aside");
    basketDrawer.className = "basket-drawer";
    basketDrawer.setAttribute("aria-label", "Shopping basket");
    basketDrawer.innerHTML = '<div class="basket-drawer-top"><h2>Your basket</h2><button type="button" class="basket-drawer-close" aria-label="Close basket">×</button></div><div class="basket-drawer-items"></div><div class="basket-drawer-total"><span>Subtotal</span><strong class="basket-drawer-subtotal">€0.00</strong></div><a class="button" href="cart.html">View basket and checkout</a>';
    document.body.append(basketButton, basketOverlay, basketDrawer);

    function renderMiniBasket() {
      var miniItems = basketDrawer.querySelector(".basket-drawer-items");
      var miniSubtotal = basketDrawer.querySelector(".basket-drawer-subtotal");
      var currentCart = readCart();
      miniItems.innerHTML = "";
      var total = 0;
      if (currentCart.length === 0) {
        miniItems.textContent = "Your basket is empty. Add a coffee or a brewing tool to get started.";
      }
      currentCart.forEach(function (item) {
        total += item.price * item.quantity;
        var miniRow = document.createElement("div");
        miniRow.className = "basket-mini-item";
        var name = document.createElement("span");
        name.textContent = item.name + " × " + item.quantity;
        var price = document.createElement("strong");
        price.textContent = "€" + (item.price * item.quantity).toFixed(2);
        miniRow.append(name, price);
        miniItems.appendChild(miniRow);
      });
      miniSubtotal.textContent = "€" + total.toFixed(2);
      updateCartCount();
    }
    function openBasket() {
      renderMiniBasket();
      basketDrawer.classList.add("open");
      basketOverlay.hidden = false;
      basketButton.setAttribute("aria-expanded", "true");
    }
    function closeBasket() {
      basketDrawer.classList.remove("open");
      basketOverlay.hidden = true;
      basketButton.setAttribute("aria-expanded", "false");
    }
    basketButton.addEventListener("click", openBasket);
    basketDrawer.querySelector(".basket-drawer-close").addEventListener("click", closeBasket);
    basketOverlay.addEventListener("click", closeBasket);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeBasket();
    });
    document.querySelectorAll(".add-to-cart").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(renderMiniBasket, 0);
      });
    });
  }

  // Draw the cart page from saved selections.
  var cartContainer = document.getElementById("cart-items");
  var subtotalElement = document.getElementById("cart-subtotal");
  function renderCart() {
    if (!cartContainer) return;
    var cart = readCart();
    cartContainer.innerHTML = "";
    if (cart.length === 0) {
      cartContainer.innerHTML = '<div class="notice-box"><h2>Your basket is empty</h2><p>Add coffee or brewing equipment and it will appear here.</p><a class="text-link" href="coffee.html">Browse coffee ↗</a></div>';
    }
    var subtotal = 0;
    cart.forEach(function (item) {
      subtotal += item.price * item.quantity;
      var row = document.createElement("article");
      row.className = "cart-item";
      var details = document.createElement("div");
      var heading = document.createElement("h2");
      heading.textContent = item.name;
      var price = document.createElement("p");
      price.textContent = "€" + item.price.toFixed(2) + " each";
      var actions = document.createElement("div");
      actions.className = "cart-item-actions";
      var minus = document.createElement("button");
      minus.className = "quantity-button";
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Remove one " + item.name);
      minus.addEventListener("click", function () {
        item.quantity -= 1;
        if (item.quantity <= 0) cart = cart.filter(function (product) { return product.id !== item.id; });
        saveCart(cart);
        renderCart();
      });
      var quantity = document.createElement("span");
      quantity.textContent = "Quantity: " + item.quantity;
      var plus = document.createElement("button");
      plus.className = "quantity-button";
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Add one " + item.name);
      plus.addEventListener("click", function () {
        item.quantity += 1;
        saveCart(cart);
        renderCart();
      });
      var remove = document.createElement("button");
      remove.className = "remove-button";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        cart = cart.filter(function (product) { return product.id !== item.id; });
        saveCart(cart);
        renderCart();
      });
      actions.append(minus, quantity, plus, remove);
      details.append(heading, price, actions);
      var total = document.createElement("strong");
      total.textContent = "€" + (item.price * item.quantity).toFixed(2);
      row.append(details, total);
      cartContainer.appendChild(row);
    });
    if (subtotalElement) subtotalElement.textContent = "€" + subtotal.toFixed(2);
    updateCartCount();
  }
  renderCart();

  var clearCartButton = document.getElementById("clear-cart");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
      saveCart([]);
      renderCart();
      var message = document.getElementById("checkout-message");
      if (message) message.textContent = "Your basket has been cleared.";
    });
  }
  var checkoutButton = document.getElementById("checkout-button");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", function () {
      var cart = readCart();
      var message = document.getElementById("checkout-message");
      if (cart.length === 0) {
        message.textContent = "Your basket is empty. Add a product before checkout.";
        return;
      }
      var orderLines = cart.map(function (item) {
        return item.name + " x " + item.quantity + " = €" + (item.price * item.quantity).toFixed(2);
      });
      var total = cart.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
      var body = "Hello Bean Boutique,%0D%0A%0D%0AI would like to enquire about this order:%0D%0A" +
        encodeURIComponent(orderLines.join("\n")) + "%0D%0A%0D%0ASubtotal: €" + total.toFixed(2) +
        "%0D%0A%0D%0APlease contact me to confirm availability and payment.";
      message.textContent = "Your email app will open.";
      window.location.href = "mailto:?subject=" + encodeURIComponent("Bean Boutique order enquiry") + "&body=" + body;
    });
  }

  // Event page: fill the event select when a user chooses a registration button.
  document.querySelectorAll(".event-select").forEach(function (button) {
    button.addEventListener("click", function () {
      var eventSelect = document.getElementById("event-name");
      if (eventSelect) {
        eventSelect.value = button.dataset.event;
        eventSelect.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

  // Subscription plan buttons fill the enquiry form.
  document.querySelectorAll(".subscribe-button").forEach(function (button) {
    button.addEventListener("click", function () {
      var planSelect = document.getElementById("sub-plan");
      if (planSelect) {
        planSelect.value = button.dataset.plan.replace(" subscription", "");
        planSelect.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.location.href = "offers.html#subscription-enquiry";
      }
    });
  });

  // Beginner-friendly mailto form handling.
  document.querySelectorAll("[data-mailto-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var trap = form.querySelector('input[name="website"]');
      if (trap && trap.value !== "") {
        alert("Your form could not be submitted. Please try again.");
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var subject = form.dataset.subject || "Bean Boutique website enquiry";
      var lines = [];
      data.forEach(function (value, key) {
        if (key !== "website") lines.push(key + ": " + value);
      });
      var emailAddress = "mnowshad184@gmail.com";
      var mailto = "mailto:" + emailAddress + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      
      window.location.href = mailto;
    });
  });
});
