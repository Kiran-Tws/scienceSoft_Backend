// migrations/20251022-create-final-contact.mjs
import { literal, UUID, DataTypes } from 'sequelize';

export async function up(queryInterface) {
  // Enable 'uuid-ossp' for PostgreSQL UUID generation
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('final_contact', {
    id: {
      type: UUID,
      defaultValue: literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true,
    },
    session_id: {
      type: UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    work_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferred_communication: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
    // updated_at deliberately not included, matching model config
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('final_contact');
}
