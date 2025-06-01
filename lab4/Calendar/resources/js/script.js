const CALENDAR_EVENTS = [
  {
    name: 'Running',
    day: 'wednesday',
    time: '09:00',
    modality: 'In-person',
    location: 'Boulder',
    url: '',
    attendees: 'Alice, Jack, Ben',
  },
  {
    name: 'Lecture',
    day: 'wednesday',
    time: '14:00',
    modality: 'remote',
    location: '',
    url: 'https://zoom.us/j/123456789',
    attendees: 'John Doe and others',
  },
];


const CALENDAR_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];


let EVENT_MODAL;


/********************** PART B: 6.1: CREATE CALENDAR *************************/


function createBootstrapCard(day) {
    // Use `document.createElement()` function to create a `div`
    var card = document.createElement('div');
    // Add Bootstrap classes to the div to upgrade its appearance
    card.className = 'col-sm m-1 bg-white rounded px-1 px-md-2';
    // Set the id of the card to the lowercase day name
    card.id = day.toLowerCase();
    return card;
 
}


function createTitle(day) {
    // Create weekday as the title.
    // @TODO: Use `document.createElement()` function to create a `div` for title
    const title = document.createElement('div');
    title.className = 'h6 text-center position-relative py-2';
    title.innerHTML = day;
    return title;
 
}


function createEventIcon(card) {
    // Use `document.createElement()` function to add an icon button to the card. Use `i` to create an icon.
    const icon = document.createElement('i');
    icon.className =
      'bi bi-calendar-plus btn position-absolute translate-middle start-100  rounded p-0 btn-link';
    // Adding an event listener to the click event of the icon to open the modal
    // This is equivalent to: <i onclick="openEventModal({day: 'monday'})"> in HTML.
    icon.setAttribute('onclick', `openEventModal({day: "${card.id}"})`);
    return icon;
 
}


function createEventDiv() {
    // Use `document.createElement()` function to add a `div` to the weekday card, which will be populated with events later.
    const eventsDiv = document.createElement('div');
    // We are adding a class for this container to be able to call it when we're populating the days with events
    eventsDiv.classList.add('event-container');
    return eventsDiv;
 
 
}


function initializeCalendar() {
    // Step 1: Initialize the modal (No changes required here).
    initializeEventModal();
 
    // Step 2: Select the calendar div element by its id.
    const calendarElement = document.getElementById('calendar');
 
    // Step 3: Loop through each day in the CALENDAR_DAYS array.
    CALENDAR_DAYS.forEach(day => {
      // Step 4: Create a Bootstrap card for the day.
      var card = createBootstrapCard(day);
 
      // Step 5: Add the created card to the calendar element.
      calendarElement.appendChild(card);
 
      // Step 6: Create the title for the day.
      var title = createTitle(day);
 
      // Step 7: Add the title to the card.
      card.appendChild(title);
 
      // Step 8: Create the event icon.
      var icon = createEventIcon(card);
 
      // Step 9: Add the icon to the title.
      title.appendChild(icon);
 
      // Step 10: Create the events div.
      var eventsDiv = createEventDiv();
 
      // Step 11: Add the events div to the card.
      card.appendChild(eventsDiv);
 
      // Step 12: Log the card to the console for verification.
      console.log(card);
    });
 
    // Step 13: Uncomment this after you implement the updateDOM() function.
    updateDOM();
 
 
}


/********************** PART B: 6.2: CREATE MODAL ****************************/


function initializeEventModal() {
     // @TODO: Create a modal using JS. The id will be `event-modal`:
  // Reference: https://getbootstrap.com/docs/5.3/components/modal/#via-javascript
    EVENT_MODAL = new bootstrap.Modal(document.getElementById('event-modal'));
 
}
function openEventModal({id, day}) {
    // Since we will be reusing the same modal for both creating and updating events,
    // we're creating variables to reference the title of the modal and the submit button
    // in JavaScript so we can update the text suitably.
    const submit_button = document.querySelector("#submit_button");
    const modal_title = document.querySelector(".modal-title");
 
    // Check if the event exists in the CALENDAR_EVENTS by using `id`.
    // Note that on the first try, when you attempt to access an event that does not exist,
    // an event will be added to the list. This is expected.
    let event = CALENDAR_EVENTS[id];
 
    // If event is undefined, i.e., it does not exist in the CALENDAR_EVENTS, then we create a new event.
    // Else, we load the current event into the modal.
    if (!event) {
      event = {
        name: "",
        day: day,
        time: "",
        modality: "",
        location: "",
        url: "",
        attendees: "",
      };
      // @TODO: Update the innerHTML for modalTitle and submitButton
      // Replace <> with the correct attribute
      modal_title.innerHTML = "Create Event";
      submit_button.innerHTML = "Create Event";
 
      // Allocate a new event id. Note that nothing is inserted into the CALENDAR_EVENTS yet.
      // @TODO: Set the id to be the length of the CALENDAR_EVENTS because we are adding a new element
      id = CALENDAR_EVENTS.length;
    } else {
      // We will default to "Update Event" as the text for the title and the submit button
      modal_title.innerHTML = "Update Event";
      submit_button.innerHTML = "Update Event";
    }
 
    // Once the event is fetched/created, populate the modal.
    // Use document.querySelector('<>').value to get the form elements. Replace <>
    // Hint: If it is a new event, the fields in the modal will be empty.
    document.querySelector("#event_name").value = event.name;
    document.querySelector("#event_weekday").value = event.day;
    document.querySelector("#event_time").value = event.time;
    document.querySelector("#event_modality").value = event.modality;
    document.querySelector("#event_location").value = event.location;
    document.querySelector("#event_remote_url").value = event.url;
    document.querySelector("#event_attendees").value = event.attendees;
 
    // Location options depend on the event modality
    // @TODO: pass event.modality as an argument to the updateLocationOptions() function. Replace <> with event.modality.
    updateLocationOptions(event.modality);
 
    // Set the "action" event for the form to call the updateEventFromModal
    // when the form is submitted by clicking on the "Create/Update Event" button
    const form = document.querySelector("#event-modal form");
    form.setAttribute("action", `javascript:updateEventFromModal(${id})`);
 
    EVENT_MODAL.show();
 
}
function updateLocationOptions(modality_value) {
    // Get the "Location", "Remote URL", and "Attendees" HTML elements from the modal.
    const location = document.getElementById('location-field'); // get the "Location" field
    const remoteUrl = document.getElementById('remote-url-field'); // get the "Remote URL" field
    const attendees = document.getElementById('attendees-field'); // get the "Attendees" field
 
    // Depending on the "value" change the visibility style of these fields on the modal.
    if (modality_value == "in-person") {
      location.style.display = 'block';
      remoteUrl.style.display = 'none';
      attendees.style.display = 'block';
    } else if (modality_value == "remote") {
      location.style.display = 'none';
      remoteUrl.style.display = 'block';
      attendees.style.display = 'block';
    } else {
      location.style.display = 'none';
      remoteUrl.style.display = 'none';
      attendees.style.display = 'none';
    }
  }
 




/********************** PART B: 6.3: UPDATE DOM ******************************/


function createEventElement(id) {
  // Create a new div element.
  var eventElement = document.createElement('div');
  // Adding classes to the <div> element.
  eventElement.classList = "event row border rounded m-1 py-1";
  // Set the id attribute of the eventElement to be the same as the input id.
  // Replace <> with the correct HTML attribute
  eventElement.id = `event-${id}`;
  return eventElement;
}
function updateEventFromModal(id) {
  // @TODO: Pick the modal field values using document.querySelector(<>).value,
  // and assign it to each field in CALENDAR_EVENTS.
  CALENDAR_EVENTS[id] = {
    name: document.querySelector('#event_name').value,
    day: document.querySelector('#event_weekday').value,
    time: document.querySelector('#event_time').value,
    modality: document.querySelector('#event_modality').value,
    location: document.querySelector('#event_location').value,
    url: document.querySelector('#event_remote_url').value,
    attendees: document.querySelector('#event_attendees').value,
  };


  // Update the DOM to display the newly created or updated event and hide the event modal
  updateDOM();
  EVENT_MODAL.hide();
}


function createTitleForEvent(event) {
  var title = document.createElement('div');
  title.classList.add('col', 'event-title');
  title.innerHTML = event.name;
  return title;
}


function updateDOM() {
  const events = CALENDAR_EVENTS;
  events.forEach((event, id) => {
    // Try to fetch the event element if it already exists.
    let eventElement = document.querySelector(`#event-${id}`);
    // If the event element doesn't exist, create a new one.
    if (eventElement === null) {
      eventElement = createEventElement(id);
      const title = createTitleForEvent(event);
      // Append the title to the event element.
      eventElement.appendChild(title);
    } else {
      // Remove the old element while updating the event.
      eventElement.remove();
      // Create a new event element.
      eventElement = createEventElement(id);
      const title = createTitleForEvent(event);
      eventElement.appendChild(title);
    }
    // Add the event name
    const title = eventElement.querySelector('div.event-title');
    title.innerHTML = event.name;
    // On clicking the event div, it should open the modal with the fields pre-populated.
    // Set the onclick attribute.
    eventElement.setAttribute('onclick', `openEventModal({id: ${id}})`);
    // Add the event div to the parent day in the calendar.
    document
      .querySelector(`#${event.day} .event-container`)
      .appendChild(eventElement);
    });
    updateTooltips();
}


/********************** PART C: 1. Display Tooltip ***************************/


function updateTooltips() {
// Select all event elements
const eventElements = document.querySelectorAll('.event');


eventElements.forEach(eventElement => {
  // Get the event id from the element's id attribute
  const eventId = eventElement.id.replace('event-', '');
  const event = CALENDAR_EVENTS[eventId];


  // Create the tooltip content
  let tooltipContent = `<strong>${event.name}</strong><br/>Time: ${event.time}`;
  if (event.modality === 'in-person') {
    tooltipContent += `<br/>Location: ${event.location}`;
  } else if (event.modality === 'remote') {
    tooltipContent += `<br/>URL: ${event.url}`;
  }


  // Initialize the Bootstrap tooltip
  new bootstrap.Tooltip(eventElement, {
    title: tooltipContent,
    html: true,
    placement: 'top',
    trigger: 'hover',
  });
});
}