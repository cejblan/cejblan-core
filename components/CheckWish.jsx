export const CheckWish = (data, session, setIsInWishlist) => {
  if (!session?.user?.wishlist) {
    setIsInWishlist(false);
    return;
  }

  // session.user.wishlist es un array con los productos completos o con los ids
  // Ajusta según lo que guardes en token (normalmente es array de productos)
  const exists = session.user.wishlist.some(p => p.id === data.id);

  setIsInWishlist(exists);
};
