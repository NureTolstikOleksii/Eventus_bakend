import bcrypt from 'bcryptjs';

export class ChangeDataService {
    #passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[._-])[A-Za-z\d._-]{8,128}$/;
    #nameRegex = /^[A-Za-z]+$/;
    #organizationNameRegex = /^[A-Za-z]+$/;
    #emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Изменение email пользователя
    async updateUserEmail(db, userId, newEmail) {
        try {
            if (!this.#emailRegex.test(newEmail)) {
                throw new Error('Please enter a valid email address');
            }

            await db.query(`UPDATE "User" SET email = $1 WHERE user_id = $2`, [newEmail, userId]);
            return { message: 'Email updated successfully' };
        } catch (error) {
            throw new Error('Error updating email: ' + error.message);
        }
    };

    // Сервіс: Зміна імені постачальника
async updateProviderName(db, providerId, newName) {
    try {
        // Валідація нового імені
        if (!/^[a-zA-Z\s]+$/.test(newName)) {
            throw new Error('Name must contain only Latin letters and spaces.');
        }

        // Оновлення імені в базі даних
        const result = await db.query(
            `UPDATE "Provider" SET name = $1 WHERE provider_id = $2`,
            [newName, providerId]
        );

        if (result.rowCount === 0) {
            throw new Error('Provider not found.');
        }

        return { message: 'Name updated successfully' };
    } catch (error) {
        throw new Error('Error updating provider name: ' + error.message);
    }
}

    // Изменение пароля постачальника
    async updateProviderPassword(db, userId, oldPassword, newPassword, confirmPassword) {
        console.log('Starting password update process for provider:', userId);
    
        if (newPassword !== confirmPassword) {
            console.error('New password and confirm password do not match');
            throw new Error('New password and confirm password do not match');
        }
    
        // Отримати інформацію про постачальника
        const provider = await db('Provider').where({ provider_id: userId }).first();
        if (!provider) {
            console.error('Provider not found for userId:', userId);
            throw new Error('Provider not found');
        }
    
        // Перевірка старого паролю
        const isMatch = await bcrypt.compare(oldPassword, provider.password);
        console.log('Password match status:', isMatch);
        if (!isMatch) {
            console.error('Old password is incorrect for userId:', userId);
            throw new Error('Old password is incorrect');
        }
    
        // Хешування нового паролю
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('New hashed password:', hashedPassword);
    
        // Оновлення паролю у базі даних
        const updateResult = await db('Provider')
            .where({ provider_id: userId })
            .update({ password: hashedPassword });
        console.log('Password update result:', updateResult);
    
        if (updateResult === 0) {
            console.error('Password update failed in the database');
            throw new Error('Failed to update password in the database');
        }
    
        return { message: 'Password updated successfully' };
    }
    
    // Изменение пароля пользователя
    async updateUserPassword(db, userId, oldPassword, newPassword, confirmPassword) {
        try {
            if (newPassword !== confirmPassword) {
                throw new Error('New password and confirmed password do not match');
            }

            if (!this.#passwordRegex.test(newPassword)) {
                throw new Error('Password does not meet complexity requirements');
            }

            const result = await db.query(`SELECT password FROM "User" WHERE user_id = $1`, [userId]);
            const user = result.rows[0];
            if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
                throw new Error('Old password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await db.query(`UPDATE "User" SET password = $1 WHERE user_id = $2`, [hashedPassword, userId]);
            return { message: 'Password updated successfully' };
        } catch (error) {
            throw new Error('Error updating password: ' + error.message);
        }
    }

    // Изменение имени пользователя
    async updateUserName(db, userId, newName) {
        try {
            if (!this.#nameRegex.test(newName)) {
                throw new Error('Name must contain only Latin letters, without spaces or special characters');
            }

            await db.query(`UPDATE "User" SET name = $1 WHERE user_id = $2`, [newName, userId]);
            return { message: 'User name updated successfully' };
        } catch (error) {
            throw new Error('Error updating user name: ' + error.message);
        }
    }

    // Изменение категории услуг поставщика
    async updateServiceCategory(db, providerId, newCategory) {
        try {
            const result = await db.query(`SELECT * FROM "Service_Category" WHERE name = $1`, [newCategory]);
            if (result.rows.length === 0) {
                throw new Error('Invalid service category');
            }

            await db.query(`UPDATE "Provider" SET service_category = $1 WHERE provider_id = $2`, [newCategory, providerId]);
            return { message: 'Service category updated successfully' };
        } catch (error) {
            throw new Error('Error updating service category: ' + error.message);
        }
    }

    // Изменение имени организации поставщика
    async updateOrganizationName(db, providerId, newOrganizationName) {
        try {
            if (!this.#organizationNameRegex.test(newOrganizationName)) {
                throw new Error('Organization name must contain only allowed characters');
            }

            const result = await db.query(`SELECT * FROM "Provider" WHERE company_name = $1`, [newOrganizationName]);
            if (result.rows.length > 0) {
                throw new Error('Organization name already registered');
            }

            await db.query(`UPDATE "Provider" SET company_name = $1 WHERE provider_id = $2`, [newOrganizationName, providerId]);
            return { message: 'Organization name updated successfully' };
        } catch (error) {
            throw new Error('Error updating organization name: ' + error.message);
        }
    }

 // Оновлення адреси електронної пошти постачальника
async updateProviderEmail(db, providerId, newEmail) {
    try {
        // Перевірка валідності email
        if (!this.#emailRegex.test(newEmail)) {
            throw new Error('Invalid email format');
        }

        // Оновлення email в базі даних
        await db.query(
            `UPDATE "Provider" SET email = $1 WHERE provider_id = $2`,
            [newEmail, providerId]
        );

        return { message: 'Email updated successfully' };
    } catch (error) {
        throw new Error('Error updating email: ' + error.message);
    }
}


    // Обновление контактной информации пользователя
    async updateUserContactInfo(db, userId, newPhone, newEmail) {
        try {
            this.validateContactInfo(newPhone, newEmail);

            await db.query(
                `UPDATE "User" SET phone_number = $1, email = $2 WHERE user_id = $3`,
                [newPhone || null, newEmail || null, userId]
            );
            return { message: 'Contact information updated successfully' };
        } catch (error) {
            throw new Error('Error updating user contact information: ' + error.message);
        }
    }

    // Общая функция для проверки контактной информации
    validateContactInfo(phone, email) {
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (phone && !phoneRegex.test(phone)) {
            throw new Error('Enter a valid phone number');
        }
        if (email && !this.#emailRegex.test(email)) {
            throw new Error('Enter a valid email address');
        }
    }
}
