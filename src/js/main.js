"use strict";

console.log('Тестовое задание для компании "Системные технологии"');

const $receiptsList = document.querySelector('.receipt');

fetch('./db.json')
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    // const result = [...new Set(data.map(el => new Date(el.date).toLocaleDateString()))];
    // Сортуем массив по дате:
    const sortByDate = data
      .reduce((r, a) => {
        r[new Date(a.date).toLocaleDateString()] = r[new Date(a.date).toLocaleDateString()] || [];
        r[new Date(a.date).toLocaleDateString()].push(a);
        return r;
      }, {});
    console.log(sortByDate);
    for (let key in sortByDate) {
      // Создаём для каждой отдельной даты свой блок с приходом товаров:
      createReceipt(key, sortByDate[key]);
    };
  })
  .catch((error) => {
    console.log('Ошибка при обработке данных: ', error);
  });

// Стандартная функция для создания DOM-элементов:
const createElement = (params) => {
  const $item = document.createElement(params.type);
  if (params.className) {
    $item.classList.add(params.className)
  };
  if (params.content) {
    $item.innerHTML = params.content;
  };
  if (params.attributes) {
    for (let key in params.attributes) {
      $item.setAttribute(key, params.attributes[key]);
    };
  };
  return $item;
};

const createReceipt = (date, receipt) => {
  // Фильтруем массив по номеру поступления товара:
  const sortByDocId = receipt
    .reduce((r, a) => {
      r[a.docId] = r[a.docId] || [];
      r[a.docId].push(a);
      return r;
    }, {});
  const $item = createElement({
    type: 'li',
    className: 'receipt__item',
  });
  const $itemHeader = createElement({
    type: 'div',
    className: 'receipt-header',
    attributes: {
      tabindex: 0,
    }
  });
  const $itemDetails = createElement({
    type: 'div',
    className: 'receipt-details'
  });
  const $date = createElement({
    type: 'p',
    className: 'receipt-header__date',
    content: date
  });
  for (let key in sortByDocId) {
    const $arrival = createReceiptDetails(key, sortByDocId[key]);
    $itemDetails.appendChild($arrival);
  };
  const $receiptAmount = createElement({
    type: 'p',
    className: 'receipt-header__amount',
    content: `Документов: ${Object.keys(sortByDocId).length} (${calcFullPrice(receipt)})`
  });
  $itemHeader.appendChild($date);
  $itemHeader.appendChild($receiptAmount);
  $item.appendChild($itemHeader);
  $item.appendChild($itemDetails);
  $receiptsList.appendChild($item);
  $itemHeader.addEventListener('click', (e) => {
    e.preventDefault();
    $itemHeader.parentNode.classList.toggle('receipt__item--opened');
  });
  $itemHeader.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.keyCode === 32) {
      e.preventDefault();
      $itemHeader.parentNode.classList.toggle('receipt__item--opened');
    };
  });
  return $item;
};

const createReceiptDetails = (key, receipt) => {
  const $receiptDetails = createElement({
    type: 'div',
    className: 'receipt-item'
  });
  const $receiptDetailsHeader = createElement({
    type: 'div',
    className: 'receipt-item__header'
  });
  const $receiptNumber = createElement({
    type: 'p',
    className: 'receipt-number',
    content: `Приход № ${key}`
  });
  const $receiptSum = createElement({
    type: 'p',
    className: 'receipt-sum',
    content: `${calcFullPrice(receipt)} &#8381;`
  });
  const $receiptDetailsProducts = createElement({
    type: 'div',
    className: 'receipt-item__products'
  });
  const $receiptProductsAmount = createElement({
    type: 'p',
    className: 'products-amount',
    content: `Товаров: ${receipt.length}`,
    attributes: {
      tabindex: 0,
    }
  });
  const $receiptDetailsProductsList = createElement({
    type: 'ul',
    className: 'products-list'
  });
  receipt.forEach((el) => {
    const $receiptDetailsProductsItem = createReceiptProduct(el);
    $receiptDetailsProductsList.appendChild($receiptDetailsProductsItem);
  });
  $receiptProductsAmount.addEventListener('click', (e) => {
    e.preventDefault();
    $receiptProductsAmount.parentNode.classList.toggle('receipt-item__products--opened');
  });
  $receiptProductsAmount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.keyCode === 32) {
      e.preventDefault();
      $receiptProductsAmount.parentNode.classList.toggle('receipt-item__products--opened');
    };
  });
  $receiptDetailsHeader.appendChild($receiptNumber);
  $receiptDetailsHeader.appendChild($receiptSum);
  $receiptDetailsProducts.appendChild($receiptProductsAmount);
  $receiptDetailsProducts.appendChild($receiptDetailsProductsList);
  $receiptDetails.appendChild($receiptDetailsHeader);
  $receiptDetails.appendChild($receiptDetailsProducts);
  return $receiptDetails;
};

const createReceiptProduct = (product) => {
  const $product = createElement({
    type: 'li',
    className: 'product-item'
  });
  const $productImageContainer = createElement({
    type: 'div',
    className: 'product-item__image',
  });
  const $productImage = createElement({
    type: 'img',
    attributes: {
      src: product.image,
      alt: product.name,
      onError: "this.src='./img/no_icon.png'",
    },
  });
  const $productDescr = createElement({
    type: 'div',
    className: 'product-item__descr',
  });
  const $productName = createElement({
    type: 'p',
    className: 'product-item__name',
    content: product.name
  });
  const $productCounters = createElement({
    type: 'div',
    className: 'product-item__counters'
  });
  const $productAmounts = createElement({
    type: 'p',
    className: 'product-amount',
    content: `${product.quantity} штук x ${product.price} &#8381;`
  });
  const $productFullPrice = createElement({
    type: 'p',
    className: 'product-full-price',
    content: `${Math.ceil(product.quantity * product.price * 100)/100} &#8381;`
  });
  $productCounters.appendChild($productAmounts);
  $productCounters.appendChild($productFullPrice);
  $productDescr.appendChild($productName);
  $productDescr.appendChild($productCounters);
  $productImageContainer.appendChild($productImage);
  $product.appendChild($productImageContainer);
  $product.appendChild($productDescr);
  return $product;
}

const calcFullPrice = (arr) => {
  return new Intl.NumberFormat('ru').format(Math.ceil(arr.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100) / 100);
};