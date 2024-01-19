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

    // Validate special characters in address fields
    const isValidAddress = (value) => /^[a-zA-Z0-9 ,._-]+$/.test(value);

    // Intercept logic
    buyerJourney.intercept(({ canBlockProgress }) => {
     console.log(shippingAddress, address, "how");

      const errors = [];

      if (!isValidAddress(address?.address1)) {
        errors.push({
          message: 'Invalid characters in address line 1. Please use only letters, numbers, spaces, hyphen (-), underscore (_), comma (,), or period (.).',
          target: '$.cart.deliveryGroups[0].deliveryAddress.address1',
        });
      }

      if (!isValidAddress(address?.address2)) {
        errors.push({
          message: 'Invalid characters in address line 2. Please use only letters, numbers, spaces, hyphen (-), underscore (_), comma (,), or period (.).',
          target: '$.cart.deliveryGroups[0].deliveryAddress.address2',
        });
      }

      if (canBlockProgress && errors.length > 0) {
        return {
          behavior: 'block',
          reason: 'Invalid characters in address',
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
