export const generateOrderEmailTemplate = (order, userDoc) => {
    const {
      shippingInfo,
      orderItems,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentMethod,
      paymentInfo,
      _id,
      createdAt,
      orderStatus,
    } = order;
  
    const formattedDate = new Date(createdAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  
    const itemsHTML = orderItems.map(
      (item) => `
        <tr>
          <td><img src="${item.image}" alt="${item.name}" width="50" height="40" /></td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${Number(item.price).toFixed(2)}</td>
          <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    ).join("");
  
    return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">
          <span style="color: #e74c3c;">Awor</span><span style="color: #000;">Food</span>
        </h2>
        <p style="font-size: 14px; color: #777;">Order Confirmation • ${formattedDate}</p>
      </div>
  
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h3 style="color: #333;">Order Summary</h3>
        <p><strong>Order ID:</strong> ${_id}</p>
        <p><strong>Status:</strong> ${orderStatus}</p>
        <p><strong>Name:</strong> ${userDoc?.name}</p>
        <p><strong>Phone:</strong> ${shippingInfo.phoneNo}</p>
        <p><strong>Shipping Address:</strong><br/>
          ${shippingInfo.address}, ${shippingInfo.city},<br/>
          ${shippingInfo.zipCode}, ${shippingInfo.country}
        </p>
  
        <hr style="margin: 20px 0;" />
  
        <h4 style="margin-bottom: 10px;">🛒 Order Items</h4>
        <table style="width: 100%; border-collapse: collapse;" border="1" cellspacing="0" cellpadding="8">
          <thead style="background: #eee;">
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
  
        <hr style="margin: 20px 0;" />
  
        <h4>💳 Payment Summary</h4>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Payment Status:</strong> ${paymentInfo?.status?.toUpperCase() || 'N/A'}</p>
        <p><strong>Stripe ID:</strong> ${paymentInfo?.id || 'N/A'}</p>
  
        <table style="width: 100%; margin-top: 10px;">
          <tr>
            <td>Items Price:</td>
            <td style="text-align: right;">$${Number(itemsPrice).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax:</td>
            <td style="text-align: right;">$${Number(taxAmount).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Shipping:</td>
            <td style="text-align: right;">${shippingAmount > 0 ? `$${shippingAmount.toFixed(2)}` : 'Free'}</td>
          </tr>
          <tr style="font-weight: bold;">
            <td>Total:</td>
            <td style="text-align: right;">$${Number(totalAmount).toFixed(2)}</td>
          </tr>
        </table>
  
        <p style="margin-top: 30px; font-size: 14px; color: #888;">
          If you have any questions about your order, feel free to reply to this email.<br/>
          Thank you for choosing <strong>AworFood</strong>!
        </p>
      </div>
    </div>
    `;
  };
  