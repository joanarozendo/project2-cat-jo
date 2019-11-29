"use strict";


////Map from create events
function initMap() {
  const $mapContainer = document.getElementById("map");
  if ($mapContainer) {
    const map = new window.google.maps.Map($mapContainer, {
      center: {
        lat: 38.696024,
        lng: -9.1712558
      },
      zoom: 13.04,
      //disableDefaultUI: true,  --> wil remove all the arrows, lines
      //disableDefaultUI: true
      mapTypeId: "roadmap"
    });

    //variable with coordinates
    const coordinates = {
      lat: 0,
      lng: 0
    };

    //new class for marker
    const marker = new window.google.maps.Marker({
      position: coordinates,
      map
    });

    const $inputLatitude = document.querySelector('input[name="latitude"]');
    const $inputLongitude = document.querySelector('input[name="longitude"]');

    let placedMarker;
    //when the user clicks on the map, we save its position and place it in a marker
    map.addListener("click", event => {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };

      $inputLatitude.value = position.lat;
      $inputLongitude.value = position.lng;

      if (placedMarker) {
        placedMarker.setMap(null);
      }

      placedMarker = new window.google.maps.Marker({
        position,
        map
      });
    });
  }
}

//Map from list
function initMapList() {
  const $mapContainer = document.getElementById("map_list");
  if ($mapContainer) {
    const map = new window.google.maps.Map($mapContainer, {
      center: {
        lat: 38.696024,
        lng: -9.1712558
      },
      zoom: 7,
      //disableDefaultUI: true,  --> wil remove all the arrows, lines
      mapTypeId: "roadmap"
    });

    //load events
    function getEvents() {
      axios
        .get("/events/data")
        .then(response => {
          placeEvents(response.data.events);
        })
        .catch(error => {
          console.log("there was an error", error);
        });
    }

    function placeEvents(events) {
      const markers = [];
      events.forEach(event => {
        if (event.address.latitude & event.address.longitude) {
          const position = {
            lat: event.address.latitude,
            lng: event.address.longitude
          };
          const pin = new google.maps.Marker({
            position: position,
            map: map,
            title: 'The band ' + event.nameOfEvent + ` on ${event.day}/${event.month}/${event.year}`,
            url: `/events/profile/${event._id}`
          });
          google.maps.event.addListener(pin, 'click', function () {
            window.location.href = this.url;
          });
          markers.push(pin);

        } else {
          console.log("the event has no latitude or longitude");
        }
      });
    }

    getEvents();

  }
}