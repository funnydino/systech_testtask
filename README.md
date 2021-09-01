# systech_testtask
<p>Тестовое задание, выполненное для компании &quot;Системные технологии&quot;.</p>
<p>Для получения массива объектов из базы данных SQLite был написан следующий SQL-запрос:</p>
<p>Вывод в формат JSON:</p>
<p><code>.mode json</code></p>
<p><code>.once db.json</code></p>
<p>Объединение таблицы:</p>
<pre>
<code>
SELECT docs.date, docTypes.name, rows.docId, products.image, products.name, products.price, rows.quantity, products.removed
FROM docs JOIN docTypes ON docs.typeId = docTypes.id
JOIN rows ON docs.id = rows.docId
JOIN products ON rows.productId = products.id
WHERE docs.removed = 0 AND docTypes.removed = 0
ORDER BY docs.date;
</code>
</pre>
<p>Готовый код страницы доступен в ветке <code>gh-pages</code></p>
