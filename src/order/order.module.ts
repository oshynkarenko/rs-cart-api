import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderService } from './services';

@Module({
  imports: [ConfigModule],
  providers: [ OrderService ],
  exports: [ OrderService ]
})
export class OrderModule {}
