'use strict';

import { literal, UUID, DataTypes } from 'sequelize';

export async function up(queryInterface) {
  // Enable uuid-ossp extension for UUID generation in PostgreSQL
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await queryInterface.createTable('final_contact', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: literal('uuid_generate_v4()'),
    },
    session_id: {
      type: UUID,
      allowNull: false,
      unique: true, // Unique constraint here
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
      type: DataTypes.ENUM('email', 'phone', 'sms', 'none'),
      allowNull: true,
      defaultValue: 'none',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('final_contact');
}
