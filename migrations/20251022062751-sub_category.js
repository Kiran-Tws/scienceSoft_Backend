// migrations/20251022-create-subcategories.mjs
import { literal, UUID, DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('subcategories', {
    id: {
      type: UUID,
      defaultValue: literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true,
    },
    category_id: {
      type: UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
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
  await queryInterface.dropTable('subcategories');
}
