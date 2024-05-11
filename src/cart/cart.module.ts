import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ OrderModule, ConfigModule ],
  providers: [ CartService],
  controllers: [ CartController ]
})
export class CartModule {}
