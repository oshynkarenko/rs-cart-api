import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

import { Order } from '../models';
import { DbConfig, getDbConfig } from '../../shared/helpers';

@Injectable()
export class OrderService {
  private orders: Record<string, Order> = {};
  private config: DbConfig;

  constructor(
      private readonly configService: ConfigService,
  ) {
    this.config = getDbConfig(configService);
  }

  async findById(cartId: string): Promise<Order> {
    let result;
    const dbClient = new Client(this.config);

    await dbClient.connect();
    try {
      const orderQuery = `SELECT * FROM orders WHERE cart_id = '${cartId}'`;
      const { rows: [ order ] } = await dbClient.query(orderQuery);
      console.log(5555, order);
      if (order) {
        const cartItemsQuery = `SELECT product_id, count FROM cart_items WHERE cart_id = '${cartId}'`;
        const { rows: items } = await dbClient.query(cartItemsQuery);

        result = {
          ...order,
          items,
        }
      } else {
        result = null;
      }
    } catch (error) {
      console.log(error);
    } finally {
      await dbClient.end();
    }
    return result;
  }

  async create(data: Order): Promise<Order> {
    let order;

    const dbClient = new Client(this.config);
    await dbClient.connect();

    try {
      const { userId, cartId, payment, delivery, comments, total } = data;
      const createQuery = `
        INSERT into orders (user_id, cart_id, payment, delivery, comments, status, total)
         values ('${userId}', '${cartId}', '${JSON.stringify(payment)}', '${JSON.stringify(delivery)}', '${comments}', 'CREATED', ${total || 0});`;
      await dbClient.query(createQuery);
      order = await this.findById(cartId);
    } catch (error) {
      console.log(error);
    } finally {
      await dbClient.end();
    }

    return order;
  }
}
