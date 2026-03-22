document.addEventListener("DOMContentLoaded", function () {
  // Countdown timer
  const eventDate = new Date("2026-05-09T14:00:00-04:00");
  const earlyBirdDeadline = new Date("2026-04-09T00:00:00-04:00");

  function updateCountdown() {
    const now = new Date();
    const diff = eventDate - now;

    if (diff <= 0) {
      document.getElementById("countdown").innerHTML =
        '<div class="countdown-message">The reunion is happening now! See you there!</div>';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Pricing logic based on date
  const now = new Date();
  const priceDisplay = document.getElementById("price-phase");
  if (now < earlyBirdDeadline) {
    priceDisplay.innerHTML =
      '<span class="price-tag early-bird">Early Bird: $16</span>' +
      '<span class="price-note">through April 9th</span>' +
      '<span class="price-tag regular-preview">$20 after April 9th</span>';
  } else {
    priceDisplay.innerHTML =
      '<span class="price-tag">$20 per person</span>';
  }

  // Load attendees
  fetch("attendees.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (attendees) {
      const grid = document.getElementById("attendee-grid");
      const count = document.getElementById("attendee-count");
      const totalGuests = attendees.length + attendees.filter(function (a) { return a.plusOne; }).length;
      count.textContent = totalGuests;

      attendees
        .sort(function (a, b) {
          return a.name.localeCompare(b.name);
        })
        .forEach(function (person) {
          const card = document.createElement("div");
          card.className = "attendee-card";
          card.innerHTML =
            '<span class="attendee-name">' + person.name + "</span>" +
            (person.plusOne
              ? '<span class="plus-one">+1</span>'
              : "");
          grid.appendChild(card);
        });
    })
    .catch(function () {
      document.getElementById("attendee-grid").innerHTML =
        "<p>Unable to load attendee list.</p>";
    });
});
