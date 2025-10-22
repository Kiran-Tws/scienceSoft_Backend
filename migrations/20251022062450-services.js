// migrations/20251022-create-services.mjs
import { literal, UUID, DataTypes } from 'sequelize';

export async function up(queryInterface) {
  // Enable 'uuid-ossp' extension for PostgreSQL if needed
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('services', {
    id: {
      type: UUID,
      defaultValue: literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('services');
}
