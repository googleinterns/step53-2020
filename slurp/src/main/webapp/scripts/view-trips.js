// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Temporary hardcoded function that returns the current users email.
 *
 * The hardcoded string was created based on one of the manually created test
 * Trip Documents. This function will be implemented in the user authentication
 * JS module using Firebase's Authentication API.
 *
 * TODO(Issue 16): Remove this function once implemented in authentication
 *                 module.
 */
function getUserEmail() {
  return 'matt.murdock';
}


/**
 * Creates an <div> element containing the HTML of an error message when the
 * query in getTrips() fails to fetch the users trips.
 *
 * @param {string} errorMessage The error message that should be placed in the
 *    created div element and displayed on the view-trips page.
 * @return {HTMLDivElement} The div element containing the error message.
 */
function createErrorElement(errorMessage) {
  const divElement = document.createElement('div');
  const textElement = document.createElement('p');
  textElement.innerText = errorMessage;
  divElement.appendChild(textElement);

  return divElement;
}

/**
 * Creates an <div> element containing the HTML for an individual trip.
 *
 * Temporarily, only the title and associated document ID are included in a
 * text element for each trip <div> element. This is done to simple test the
 * query functionality.
 *
 * TODO(Issue 17): Feed all the Trip Doc data to the UI.
 *
 * @param {object} tripObj A JS object containg the fields (key value pairs) of
 *    of a Trip Document.
 * @param {string} tripId The Id associated with the current Trip Document.
 * @return {HTMLDivElement} The div element containing the trip data.
 */
function createTripElement(tripObj, tripId) {
  const tripElement = document.createElement('div');

  const titleEl = document.createElement('p');
  titleEl.innerText = `Title: ${tripObj.name} | Document Id: ${tripId}`;
  tripElement.appendChild(titleEl);

  return tripElement;
}

/**
 * Queries, fetches, and serves all trips to the UI that the current user is a
 * collaborator on.
 *
 * The current user's email is retrieved from getUserEmail in the Authentication
 * module. Once all of the Trip documents are fetched, they are each passed to
 * createTripElement() to create the HTML for each trip and appended to the
 * trips-container <div>.
 */
function getTrips() {
  const tripsContainer = document.getElementById('trips-container');
  const userEmail = getUserEmail();
  db.collection('trips')
      .where('collaborators', 'array-contains', userEmail)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(typeof doc.id);
          tripsContainer.appendChild(createTripElement(doc.data(), doc.id));
        });
      })
      .catch(error => {
        console.log(`Error in getCommentsThread: ${error}`);
        tripsContainer.appendChild(
            createErrorElement('Error: Unable to load your trips.'));
      })
}

/**
 * Wrapper function that calls functions that need to be executed upon loading
 * view-trips.html.
 *
 * This method prevents the need to use inline scripting on the
 * body html element.
 */
function loadPage() {
  getTrips();
}
window.onload = loadPage;
