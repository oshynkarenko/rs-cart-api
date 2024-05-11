import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

import { DbConfig, getDbConfig } from '../../shared/helpers';

import { Cart, CartItem } from '../models';

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};
  config: DbConfig;

  constructor(
      private readonly configService: ConfigService,
  ) {
    this.config = getDbConfig(configService);
  }

  async findByUserId(userId: string): Promise<Cart> {
    let result: Cart;
    const dbClient = new Client(this.config);

    await dbClient.connect();

    try {
      const userQuery = `SELECT id, status FROM carts WHERE user_id = '${userId}'`;

      const { rows: [ cart ] } = await dbClient.query(userQuery);
      if (!cart) {
        result = null;
      } else {
        const cartItemsQuery = `SELECT product_id, count FROM cart_items WHERE cart_id = '${cart.id}'`;
        const { rows } = await dbClient.query(cartItemsQuery);

        result = { ...cart, items: rows };
      }
    } catch (error) {
      console.log(error);
    } finally {
      await dbClient.end();
    }
    return result;
  }

  async createByUserId(userId: string): Promise<Cart> {
    let result: Cart;
    const dbClient = new Client(this.config);

    await dbClient.connect();

    try {
      const date = new Date().toISOString();
      const tableFields = 'user_id, created_at, updated_at, status';
      const createCartQuery = `INSERT into carts (${tableFields}) values ('${userId}', '${date}', '${date}', 'OPEN')`;

      await dbClient.query(createCartQuery);
      result = await this.findByUserId(userId);
    } catch (error) {
      console.log(error);
    } finally {
      await dbClient.end();
    }

    return result;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    let result: Cart;
    const dbClient = new Client(this.config);
    await dbClient.connect();

    try {
      const { id, items: existingCartItems } = await this.findByUserId(userId);

      if (!id) return;

      let updateQuery = '';

      items.forEach((item: CartItem): void => {
        let itemQuery: string;
        const entryInCard = existingCartItems.find((entry: CartItem): boolean => item.product_id === entry.product_id);
        if (entryInCard) {
          itemQuery = `UPDATE cart_items SET product_id = '${item.product_id}', count = ${item.count + entryInCard.count} WHERE cart_id = '${id}' AND product_id = '${item.product_id}';`;
        } else {
          itemQuery = `INSERT into cart_items (cart_id, product_id, count) values ('${id}', '${item.product_id}', ${item.count});`;
        }
        updateQuery += itemQuery;
      })

      await dbClient.query(updateQuery);
      result = await this.findByUserId(userId);
      console.log(22222, result);
    } catch (error) {
      console.log(error);
    } finally {
      await dbClient.end();
    }

    return result;
  }

  async removeByUserId(userId): Promise<void> {
    const dbClient = new Client(this.config);
    await dbClient.connect();

    try {
      const deleteQuery = `DELETE from carts WHERE user_id = '${userId}'`;
      await dbClient.query(deleteQuery);
    } catch (error) {
      console.log(error);
    } finally {
      await dbClient.end();
    }
  }

  async changeCartStatus(cartId: string, userId: string): Promise<Cart> {
    let result: Cart;
    const dbClient = new Client(this.config);

    await dbClient.connect();

    try {
      const updateStatusQuery = `UPDATE carts SET status = 'ORDERED' WHERE id = '${cartId}';`;
      await dbClient.query(updateStatusQuery);
      result = await this.findByUserId(userId);
    } catch (error) {
      console.log(error);
    } finally {
      dbClient.end();
    }

    return result;
  }
}
