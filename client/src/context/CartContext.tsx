import { createContext, useState, useEffect } from "react";


export const CartContext = createContext();

export const CartProvider = ({children}: {children: React.ReactNode}) => {


 return <CartContext.Provider value={} >
  {children}
 </CartContext.Provider> 
}