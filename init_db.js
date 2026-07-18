const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./moya_dostavka.db');

db.serialize(() => {
    // 1. Создаем таблицу категорий
    db.run(`CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`);

    // 2. Создаем таблицу товаров
    db.run(`CREATE TABLE IF NOT EXISTS product (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL, category_id INTEGER)`);

    // 3. НОВАЯ ТАБЛИЦА: Корзина покупателя
    db.run(`
        CREATE TABLE IF NOT EXISTS cart (
            product_id INTEGER PRIMARY KEY, -- ID товара (уникальный, один товар - одна строка в корзине)
            quantity INTEGER NOT NULL       -- Количество товара в корзине
        )
    `);

    // Очистим корзину при инициализации, чтобы начать с чистого листа
    db.run(`DELETE FROM cart`);

    // Заполняем базовые данные (если их еще нет)
    db.run(`INSERT OR IGNORE INTO category (id, name) VALUES (1, 'Молочные продукты и яйца'), (2, 'Овощи, фрукты, ягоды')`);
    db.run(`INSERT OR IGNORE INTO product (id, name, price, category_id) VALUES (101, 'Молоко Савушкин 3.2%, 1л', 3.50, 1)`);
    db.run(`INSERT OR IGNORE INTO product (id, name, price, category_id) VALUES (102, 'Бананы лимонные, 1кг', 5.99, 2)`);
    db.run(`INSERT OR IGNORE INTO product (id, name, price, category_id) VALUES (103, 'Хлеб Бородинский, 400г', 1.80, 1)`); // Добавим еще один товар!

    console.log("База данных moya_dostavka.db успешно обновлена!");
});

db.close();
