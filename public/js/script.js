const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      // Log location and accuracy for debugging purposes
      console.log(
        `Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`
      );

      // Emit the location data to the server
      socket.emit("send-location", { latitude, longitude, accuracy });
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000, // Increased timeout for better accuracy
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude, accuracy } = data;

  // Log the received data for debugging
  console.log(
    `Received data for user ${id}: Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`
  );

  // Update the map view and markers based on the received location
  map.setView([latitude, longitude], 16);

  // If the marker for the user exists, update its position, otherwise create a new marker
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }

  // Optionally, update the marker popup to show accuracy
  markers[id].bindPopup(`Accuracy: ${accuracy} meters`).openPopup();
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
