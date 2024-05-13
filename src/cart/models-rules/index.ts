import { Cart, CartItem } from '../models';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(cart: Cart): number {
  return cart ? cart.items.reduce((acc: number, { product_id: { price }, count }: CartItem) => {
    return acc += price * count;
  }, 0) : 0;
}
