export class ServicesService {
    // Получение информации о услуге
    async getServiceDetails(db, serviceId) {
        try {
            const query = `
                SELECT 
                    s.service_id, 
                    s.name AS service_name, 
                    s.description, 
                    s.photo_url, 
                    s.price, 
                    p.name AS provider_name, 
                    sc.name AS category_name,
                    p.rating
                FROM "Service" s
                JOIN "Provider" p ON s.provider_id = p.provider_id
                JOIN "Service_Category" sc ON s.category_id = sc.category_id
                WHERE s.service_id = $1
            `;
            const result = await db.query(query, [serviceId]);

            if (result.rows.length === 0) {
                throw new Error('Service not found');
            }

            return result.rows[0];
        } catch (error) {
            throw new Error('Failed to retrieve service details: ' + error.message);
        }
    }

    // Получение отзывов об услуге
    async getServiceReviews(db, serviceId) {
        try {
            const query = `
                SELECT 
                    r.review_id, 
                    r.rating, 
                    r.comment, 
                    r.review_date, 
                    u.name AS user_name
                FROM "Review" r
                JOIN "User" u ON r.user_id = u.user_id
                WHERE r.service_id = $1
            `;
            const result = await db.query(query, [serviceId]);

            if (result.rows.length === 0) {
                return { message: 'No reviews found for this service' };
            }

            return result.rows;
        } catch (error) {
            throw new Error('Failed to retrieve service reviews: ' + error.message);
        }
    }

    // Получение календаря услуги
    async getServiceCalendar(db, serviceId) {
        try {
            const query = `
                SELECT 
                    t.date, 
                    t.time, 
                    t.status 
                FROM "Timeslot" t
                JOIN "Calendar" c ON t.calendar_id = c.calendar_id
                JOIN "Service" s ON c.provider_id = s.provider_id
                WHERE s.service_id = $1
            `;
            const result = await db.query(query, [serviceId]);

            if (result.rows.length === 0) {
                return { message: 'No available timeslots for this service' };
            }

            return result.rows;
        } catch (error) {
            throw new Error('Failed to retrieve service calendar: ' + error.message);
        }
    }

    // Получение пакетов услуг поставщика
    async getProviderPackages(db, providerId) {
        try {
            const query = `
                SELECT 
                    pp.package_id, 
                    pp.name AS package_name, 
                    pp.description, 
                    pp.price, 
                    array_agg(s.name) AS included_services
                FROM "Package" pp
                JOIN "Service_Package" sp ON pp.package_id = sp.package_id
                JOIN "Service" s ON sp.service_id = s.service_id
                WHERE pp.provider_id = $1
                GROUP BY pp.package_id
            `;
            const result = await db.query(query, [providerId]);

            return result.rows || [];
        } catch (error) {
            throw new Error('Failed to retrieve service packages: ' + error.message);
        }
    }

    // Добавление услуги
    async addService(db, serviceData) {
        try {
          const query = `
            INSERT INTO "Service" (name, description, price, provider_id, category_id, location_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING service_id
          `;
          const params = [
            serviceData.name,
            serviceData.description,
            serviceData.price || 0,
            serviceData.provider_id,
            serviceData.category_id || null,
            serviceData.location_id || null,
          ];
          const result = await db.query(query, params);
      
          return { 
            message: 'Service added successfully', 
            serviceId: result.rows[0].service_id 
          };
        } catch (error) {
          throw new Error('Failed to add service: ' + error.message);
        }
    }
      
      

    // Проверка возможности удаления услуги
    async confirmDeleteService(db, serviceId) {
        try {
            const query = `
                SELECT COUNT(*) AS active_orders 
                FROM "Orders" 
                WHERE service_id = $1 AND status = 'active'
            `;
            const result = await db.query(query, [serviceId]);

            if (parseInt(result.rows[0].active_orders, 10) > 0) {
                return { canDelete: false, message: 'Service has active orders and cannot be deleted' };
            }

            return { canDelete: true, message: 'Service can be deleted' };
        } catch (error) {
            throw new Error('Failed to confirm service deletion: ' + error.message);
        }
    }

    // Удаление услуги
    async deleteService(db, serviceId) {
        try {
            const query = `DELETE FROM "Service" WHERE service_id = $1 RETURNING service_id`;
            const result = await db.query(query, [serviceId]);

            if (result.rowCount === 0) {
                throw new Error('Service not found');
            }

            return { message: 'Service deleted successfully' };
        } catch (error) {
            throw new Error('Failed to delete service: ' + error.message);
        }
    }

    // Добавление нового пакета в таблицу "Service_Package"
async addServicePackage(db, packageData) {
    try {
        const { provider_id, photo_url, name, description, price, duration, services } = packageData;

        const query = `
            INSERT INTO "Service_Package" 
                (provider_id, photo_url, name, description, price, duration, services)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING package_id
        `;

        const params = [
            provider_id,
            photo_url,
            name,
            description,
            price,
            duration,
            services,
        ];

        const result = await db.query(query, params);

        return {
            message: 'Package added successfully',
            package_id: result.rows[0].package_id,
        };
    } catch (error) {
        throw new Error('Failed to add package: ' + error.message);
    }
}

// Получить все услуги конкретного провайдера
async getServicesForProvider(db, providerId) {
    try {
        const query = `
            SELECT service_id, name, description, photo_url, price
            FROM "Service"
            WHERE provider_id = $1
        `;
        const result = await db.query(query, [providerId]);
        return result.rows;
    } catch (error) {
        throw new Error('Failed to retrieve services for the provider: ' + error.message);
    }
}

async findOrCreateLocation(db, locationName, locationAddress) {
    try {
      // 1. Проверяем, есть ли уже такая запись
      const checkQuery = `
        SELECT location_id 
        FROM "Location"
        WHERE name = $1
          AND address = $2
        LIMIT 1
      `;
      const checkRes = await db.query(checkQuery, [locationName, locationAddress]);
      if (checkRes.rows.length > 0) {
        return checkRes.rows[0].location_id;
      }
  
      // 2. Если нет, вставляем новую
      const insertQuery = `
        INSERT INTO "Location" (name, address)
        VALUES ($1, $2)
        RETURNING location_id
      `;
      const insertRes = await db.query(insertQuery, [locationName, locationAddress]);
      return insertRes.rows[0].location_id;
    } catch (error) {
      throw new Error('Failed to find or create location: ' + error.message);
    }
  }
  
  async getAllCategories(db) {
    try {
        const query = `
            SELECT category_id, name
            FROM "Service_Category"
        `;
        const result = await db.query(query);
        // Возвращаем массив объектов { category_id, name }
        return result.rows;
    } catch (error) {
        throw new Error('Failed to retrieve categories: ' + error.message);
    }
}


}
