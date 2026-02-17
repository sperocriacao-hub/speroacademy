export const formatPrice = (price: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: options?.currency || "BRL",
        ...options,
    }).format(price)
}
