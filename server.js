const express = require('express');
const sqlite3 = require('sqlite3-offline');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('./moya_dostavka.db');

// Разрешаем серверу читать данные, которые сайт отправляет в формате JSON
app.use(express.json());
app.use(express.static('public'));

// 1. API для получения ВСЕХ товаров (для главной страницы)
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM product', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. API для получения товаров в корзине (Честный SQL JOIN!)
app.get('/api/cart', (req, res) => {
    const sqlQuery = `
        SELECT product.id, product.name, product.price, cart.quantity 
        FROM cart
        JOIN product ON cart.product_id = product.id
    `;
    db.all(sqlQuery, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. API для добавления товара в корзину (SQL: INSERT)
app.post('/api/cart/add', (req, res) => {
    const { productId } = req.body;
    
    // SQL Магия: если товар уже есть в корзине — увеличиваем количество на 1, если нет — добавляем новую строку
    const sqlQuery = `
        INSERT INTO cart (product_id, quantity) 
        VALUES (?, 1)
        ON CONFLICT(product_id) DO UPDATE SET quantity = quantity + 1
    `;

    db.run(sqlQuery, [productId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 4. API для удаления товара из корзины (SQL: DELETE)
app.post('/api/cart/remove', (req, res) => {
    const { productId } = req.body;
    const sqlQuery = `DELETE FROM cart WHERE product_id = ?`;

    db.run(sqlQuery, [productId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 5. API для изменения количества товара вручную (SQL: UPDATE)
app.post('/api/cart/update', (req, res) => {
    const { productId, quantity } = req.body;
    
    // Если пользователь ввел 0 или меньше, мы просто удаляем товар из корзины
    if (quantity <= 0) {
        db.run('DELETE FROM cart WHERE product_id = ?', [productId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
        return;
    }

    // Если количество корректное — обновляем его в базе через UPDATE
    const sqlQuery = `UPDATE cart SET quantity = ? WHERE product_id = ?`;

    db.run(sqlQuery, [quantity, productId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});


app.listen(PORT, () => {
    console.log(`Сервер "moya_dostavka" запущен на http://localhost:${PORT}`);
});
