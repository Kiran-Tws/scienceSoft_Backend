// migrations/20251022-create-user-responses.mjs
import { literal, UUID, DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('user_responses', {
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
    question_id: {
      type: UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    subcategory_id: {
      type: UUID,
      allowNull: false,
      references: {
        model: 'subcategories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    selected_option_id: {
      type: UUID,
      allowNull: true,
      references: {
        model: 'question_options',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    response_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
    // updatedAt disabled as per your model configuration
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('user_responses');
}
