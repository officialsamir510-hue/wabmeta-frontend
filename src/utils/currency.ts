/**
 * Format amount from paise to Indian Rupees
 * @param amountInPaise - Amount in smallest unit (paise)
 * @returns Formatted string like "₹1,234"
 */
export const formatINR = (amountInPaise: number): string => {
    const amount = Number(amountInPaise) || 0;

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount / 100);
};

/**
 * Format with decimals (for detailed view)
 */
export const formatINRWithDecimals = (amountInPaise: number): string => {
    const amount = Number(amountInPaise) || 0;

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount / 100);
};

/**
 * Format large numbers in lakhs/crores
 */
export const formatINRCompact = (amountInPaise: number): string => {
    const amount = (Number(amountInPaise) || 0) / 100;

    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return formatINR(amountInPaise);
};
