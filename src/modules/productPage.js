import { isIrishSite, isCstLoggedIn } from "./utils";

/**
 * Script to rum on product pages to clarify Sales Pack data.
 */
export default function productPage() {
  let bd = document.body.classList;

  // If we are on a product list/search page, remove 'U_SalesQty - ascending' from the sorting dropdown.
  if (bd.contains("productlist-list-page") || bd.contains("productlist-search-page")) {
    let sortOptions = document.getElementById("Sorting").childNodes;
    for (let i = 0; i < sortOptions.length; i += 1) {
      if (sortOptions[i].innerHTML == "U_SalesQty - ascending") sortOptions[i].remove();
    }
  }

  // If the page is a product page.
  if (bd.contains("product-details-page")) {
    
    // Update the hrefs of the 'Write a Review' links and append the product code to the URL.
    let itemProp = document.querySelector('[itemprop="productID"]');
    let productCode = itemProp.innerHTML;
    let reviewLinks = document.querySelectorAll('a[title="Write a review"]');
    for (let i = 0; i < reviewLinks.length; i += 1) {
      reviewLinks[i].href = '/write-a-review' + '?' + productCode;
    }

    // Get the custom dataset containing our UOM info.
    let data = document.getElementById("custom-data").dataset;

    // If it's the UK site and the customer is not logged in, run the following code.
    if (!isIrishSite() && !isCstLoggedIn()) {

      // Emphasise that trade prices are only visible when logged in to your business account.
      let orderBox = document.getElementsByClassName('order-box')[0];
      let tradePriceNote = document.createElement('div');
      tradePriceNote.classList.add('price-note');
      tradePriceNote.innerHTML = 'To see <strong>trade prices</strong>, please <a href="/profile/login">log in</a> to your business account.';
      orderBox.appendChild(tradePriceNote);

      // Include the VAT text (this is to address a VAT display-related bug that should be fixed in a future Sana version)      
      setTimeout(function() {
        // Include a slight delay, otherwise the element won't exist yet.
        document.querySelector('.prices .lbl-price sup').innerHTML += '<span class="vat">Inc. vat</span>';
      }, 500);
    }
    
    // Change 'Quantity' to 'Select' if item is in stock.
    if (document.getElementsByClassName("lbl-uom").length > 0) {
      document.querySelector(".row-quantity label").innerHTML = "Select";
    }

    // If the product is a Sales Pack, insert an extra form row.
    if (data.salesUomName === "Sales Pack") {
      let uomEl = document.createElement("div");
      uomEl.className += "form-row";
      let uomMarkup = `
        <div class="control">
            <div class="label"><label>Quantity</label></div>
            <div class="field"><span>${data.itemsPerSalesUnit} Units per Sales Pack</span>
        </div>
      `;
      uomEl.innerHTML = uomMarkup;
      let form = document.getElementById("product-form");
      form.insertBefore(uomEl, form.childNodes[0]);

      // If the item is an in-stock Sales Pack, provide extra clarification. This won't run unless a customer is logged in.
      if (document.getElementsByClassName("lbl-uom").length > 0) {
        let label = document.getElementsByClassName("lbl-uom")[0];
        let currencyStr = document.querySelectorAll('[itemprop="priceCurrency"]')[0].getAttribute("content");
        let currency = currencyStr === "EUR" ? "€" : "£";
        let price = document.querySelectorAll('[itemprop="price"]')[0].getAttribute("content");
        label.innerHTML = `Sales Packs x 1 = ${data.itemsPerSalesUnit} Units (${currency}${price})`;

        // Attach event listeners to quantity input field and buttons, once they exist (an artificial delay was necessary).
        window.onload = setTimeout(addSalesPackEventListeners, 1000);

        function addSalesPackEventListeners() {
          let qtyBox = document.querySelector(".row-quantity .tbx-quantity input");
          qtyBox.addEventListener("keyup", updateSalesPackInfo);

          let qtyPlus = document.querySelectorAll(".row-quantity .tbx-quantity a")[0];
          qtyPlus.addEventListener("click", updateSalesPackInfo);

          let qtyMinus = document.querySelectorAll(".row-quantity .tbx-quantity a")[1];
          qtyMinus.addEventListener("click", updateSalesPackInfo);
        }

        function updateSalesPackInfo() {
          let qty = document.querySelector(".tbx-quantity input").value;
          let newPrice = (price * qty).toFixed(2);
          label.innerHTML = `Sales Packs x ${qty} = ${data.itemsPerSalesUnit * qty} Units (${currency}${newPrice})`;
        }
      }
    }
  }
}
