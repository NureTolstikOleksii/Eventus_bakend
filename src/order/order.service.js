export class OrderService {

    // Создание заказа
    async createOrder(db, orderData) {
        const { user_id, service_id, special_requests } = orderData;

        // Получение данных о сервисе
        const serviceResult = await db.query(
            `SELECT * FROM "Service" WHERE service_id = $1`,
            [service_id]
        );

        const service = serviceResult.rows[0];
        if (!service) {
            throw new Error('Service not found');
        }

        // Форматирование даты
        const currentDate = new Date();
        const date = currentDate.toISOString().split('T')[0];

        try {
            // Начало транзакции
            await db.query('BEGIN');

            // Создание заказа
            const result = await db.query(
                `
                INSERT INTO "Orders" (name, date, comment, total_price, user_id, service_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING order_id;
                `,
                [
                    service.name, // Используем имя сервиса как имя заказа
                    date,
                    special_requests || null, // Спецзапросы, если есть
                    service.price, // Итоговая цена
                    user_id,
                    service_id,
                ]
            );

            // Завершение транзакции
            await db.query('COMMIT');

            return {
                orderId: result.rows[0].order_id,
                name: service.name,
                date,
                total_price: service.price,
                user_id,
                service_id,
            };
        } catch (error) {
            // Откат транзакции в случае ошибки
            await db.query('ROLLBACK');
            throw new Error(`Error creating order: ${error.message}`);
        }
    }

    // Получение страницы заказа
    async getOrderPage(db, userId, serviceId) {
        try {
            // Получение данных о сервисе
            const serviceResult = await db.query(
                `SELECT name, price FROM "Service" WHERE service_id = $1`,
                [serviceId]
            );
            const service = serviceResult.rows[0];

            if (!service) {
                throw new Error('Service not found');
            }

            // Получение данных о пользователе
            const userResult = await db.query(
                `SELECT name, phone_number FROM "User" WHERE user_id = $1`,
                [userId]
            );
            const user = userResult.rows[0];

            if (!user) {
                throw new Error('User not found');
            }

            // Форматируем дату и время
            const currentDate = new Date();
            const formattedDate = `${currentDate.toISOString().split('T')[0]} ${
                currentDate.toTimeString().split(' ')[0].slice(0, 5)
            }`;

            return {
                service_name: service.name,
                service_price: service.price,
                user_name: user.name,
                user_phone: user.phone_number,
                date_time: formattedDate,
            };
        } catch (error) {
            console.error('Error in getOrderPage:', error.message);
            throw error;
        }
    }

    // Получение заказов пользователя
    async getUserOrders(db, userId) {
        try {
            const result = await db.query(
                `SELECT name, date FROM "Orders" WHERE user_id = $1`,
                [userId]
            );

            return result.rows;
        } catch (error) {
            console.error('Error in getUserOrders:', error.message);
            throw error;
        }
    }

    // Получение заказов поставщика
    async getProviderOrders(db, providerId) {
        try {
            const result = await db.query(
                `
                SELECT 
                    o.date || ' ' || TO_CHAR(NOW(), 'HH24:MI') AS date_time,
                    s.name AS service_name,
                    o.special_requests,
                    u.name AS customer_name
                FROM "Orders" o
                INNER JOIN "Service" s ON o.service_id = s.service_id
                INNER JOIN "User" u ON o.user_id = u.user_id
                WHERE s.provider_id = $1
                `,
                [providerId]
            );

            return result.rows;
        } catch (error) {
            console.error('Error in getProviderOrders:', error.message);
            throw error;
        }
    }
}
