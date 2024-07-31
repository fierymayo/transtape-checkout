import { extension } from '@shopify/ui-extensions/checkout';

export default extension(
  'purchase.checkout.delivery-address.render-before',
  async (root, { buyerJourney, shippingAddress }) => {
    let address = shippingAddress?.current;

    // Subscribe to address changes
    shippingAddress?.subscribe((newAddress) => {
      address = newAddress;
    });

    // Wait for the address to be updated
    await new Promise((resolve) => setTimeout(resolve, 100)); // Adjust the timeout as needed

    // Validate address length and special characters
    const isValidAddress = (value) => {
      return value.length <= 30;
    };

    // Intercept logic
    buyerJourney.intercept(({ canBlockProgress }) => {
      const errors = [];

      if (address?.address1 && !isValidAddress(address.address1)) {
        errors.push({
          message: 'Address line 1 cannot exceed 30 characters.',
          target: '$.cart.deliveryGroups[0].deliveryAddress.address1',
        });
      }

      if (address?.address2 && !isValidAddress(address.address2)) {
        errors.push({
          message: 'Address line 2 cannot exceed 30 characters.',
          target: '$.cart.deliveryGroups[0].deliveryAddress.address2',
        });
      }

      if (canBlockProgress && errors.length > 0) {
        return {
          behavior: 'block',
          reason: 'Invalid address length',
          errors,
        };
      } else {
        return {
          behavior: 'allow',
        };
      }
    });
  },
);
