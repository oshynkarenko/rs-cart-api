export type Product = {
  id: string,
  title: string,
  description: string,
  price: number,
};


export type CartItem = {
  product_id: Product,
  count: number,
}

export type Cart = {
  id: string,
  items: CartItem[],
}
