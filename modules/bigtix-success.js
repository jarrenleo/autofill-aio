(function () {
  if (window.__bigtixSuccessLoaded) return;
  window.__bigtixSuccessLoaded = true;

  async function fetchBookingData() {
    try {
      const params = new URLSearchParams(location.search);
      const bookingRef = params.get("bookingRef");
      const cartId = params.get("cartId");

      if (!bookingRef || !cartId) return;

      const response = await fetch(
        location.origin + "/api/v2/transactions/items/query",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          credentials: "include",
          body: JSON.stringify({ bookingId: bookingRef, cartId }),
        },
      );

      const { data } = await response.json();
      if (!data.items?.length) return;
      const item = data.items[0];

      const seatAssignment = item.seats.map((seat) => {
        const [, section, row, seatNo] = seat.code.split("-");
        return { section, row, seatNo };
      });

      const ticket = {
        bookingRef,
        email: data.email,
        eventName: item.product.name,
        venue: item.venues,
        category: item.categoryName,
        quantity: item.qty,
        seatAssignment,
        pricePerTicket: item.nominalPrice,
        totalPrice: item.totalPrice,
        paymentType: data.payments[0].paymentMethodName,
        ticketType: item.ticketType.name,
        startTime: item.session.startTime,
      };

      await fetch(
        "https://queueit-webhook-api-production.up.railway.app/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticket),
        },
      );
    } catch (e) {
      console.error("bigtix-success:", e);
    }
  }

  fetchBookingData();
})();
