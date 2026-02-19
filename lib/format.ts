export const formatPrice = (price: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat((options?.currency === "BRL" ? "pt-BR" : "pt-PT"), {
        style: "currency",
        currency: options?.currency || "EUR",
        ...options,
    }).format(price)
}
