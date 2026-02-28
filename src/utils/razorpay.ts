// src/utils/razorpay.ts

let razorpayLoaded = false;

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Already loaded
    if (razorpayLoaded && (window as any).Razorpay) {
      return resolve(true);
    }

    // Check if already in DOM
    if (document.getElementById("razorpay-sdk")) {
      razorpayLoaded = true;
      return resolve(true);
    }

    // Load script dynamically
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      razorpayLoaded = true;
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

// ✅ Initiate payment - loads Razorpay only when needed
export const initiateRazorpayPayment = async (options: {
  planKey: string;
  planName: string;
  amount: number;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: any) => void;
}) => {
  try {
    // Load Razorpay script first
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      throw new Error("Failed to load payment gateway. Please try again.");
    }

    // Import API dynamically to avoid circular deps
    const { billing } = await import('../services/api');

    // Create order
    const orderResponse = await billing.createRazorpayOrder({
      planKey: options.planKey,
      billingCycle: 'monthly', // Default or from context if needed
    });

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message || 'Failed to create order');
    }

    const { id: orderId, amount, currency, key } = orderResponse.data.data;

    const razorpayOptions = {
      key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY || '',
      amount: amount,
      currency: currency || 'INR',
      name: 'WabMeta',
      description: `Subscription: ${options.planName}`,
      order_id: orderId,
      theme: {
        color: '#22c55e',
      },
      handler: function (response: any) {
        options.onSuccess(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      modal: {
        ondismiss: function () {
          console.log('Payment cancelled');
        },
      },
    };

    const razorpay = new (window as any).Razorpay(razorpayOptions);

    razorpay.on('payment.failed', function (response: any) {
      options.onError(response.error);
    });

    razorpay.open();

  } catch (error: any) {
    console.error('Razorpay error:', error);
    options.onError(error);
  }
};