export class OrderService {
    async createOrder(db, orderData) {
        const { user_id, service_id, special_requests } = orderData;

        const service = await db.get(
            `SELECT * FROM Service WHERE service_id = ?;`,
            [service_id]
        );

        if (!service) {
            throw new Error('Service not found');
        }

        const date = new Date().toISOString().split('T')[0];

        const result = await db.run(
            `
            INSERT INTO Orders (name, date, total_price, user_id, service_id, special_requests)
            VALUES (?, ?, ?, ?, ?, ?);
            `,
            [
                service.name, // Use the service name for the order name
                date,
                service.price, // Use the service price for the total price
                user_id,
                service_id,
                special_requests || null, // If no special requests, set as NULL
            ]
        );

        return {
            orderId: result.lastID,
            ...orderData,
            date,
            total_price: service.price,
        };
    }

    async getOrderPage(db, userId, serviceId) {
        try {
            // Отримуємо дані про послугу
            const service = await db.get(
                `SELECT name, price FROM Service WHERE service_id = ?;`,
                [serviceId]
            );

            if (!service) {
                throw new Error('Service not found');
            }

            console.log('Service fetched:', service);

            // Отримуємо дані про користувача
            const user = await db.get(
                `SELECT name, phone_number FROM User WHERE user_id = ?;`,
                [userId]
            );

            if (!user) {
                throw new Error('User not found');
            }

            console.log('User fetched:', user);

            // Форматуємо дату та час
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

    async getUserOrders(db, userId) {
        try {
            const orders = await db.all(
                `SELECT name, date FROM Orders WHERE user_id = ?;`,
                [userId]
            );

            if (!orders || orders.length === 0) {
                return []; 
            }

            console.log('Orders fetched:', orders);
            return orders;
        } catch (error) {
            console.error('Error in getUserOrders:', error.message);
            throw error;
        }
    }

    async getProviderOrders(db, providerId) {
        try {
            // SQL-запит для отримання замовлень постачальника
            const orders = await db.all(
                `
                SELECT 
                    o.date || ' ' || strftime('%H:%M', 'now') AS date_time,
                    s.name AS service_name,
                    o.special_requests,
                    u.name AS customer_name
                FROM Orders o
                INNER JOIN Service s ON o.service_id = s.service_id
                INNER JOIN User u ON o.user_id = u.user_id
                WHERE s.provider_id = ?;
                `,
                [providerId]
            );

            if (!orders || orders.length === 0) {
                return []; 
            }

            console.log('Provider orders fetched:', orders);
            return orders;
        } catch (error) {
            console.error('Error in getProviderOrders:', error.message);
            throw error;
        }
    }
}
