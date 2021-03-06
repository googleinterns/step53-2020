import React from 'react';

import app from '../Firebase/';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import * as DB from '../../constants/database.js';

const db = app.firestore();
// This constant determines the max number of docs deleted in a batch (max
// number in each query). This is a magic number and can be tweaked as needed.
const NUM_DOCS_IN_BATCH_DELETE = 5;

/**
 * Deletes documents in query with a batch delete.
 *
 * This was taken from the delete collection snippets in the documentation
 * at https://firebase.google.com/docs/firestore/manage-data/delete-data.
  *
  * @param {firebase.firestore.Firestore} db Firestore database instance.
  * @param {firebase.firestore.Query} query Query containing documents from
  *     the activities subcollection of a trip documents.
  * @param {Function} resolve Resolve function that returns a void Promise.
  */
async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done.
    resolve();
    return;
  }

  // Delete documents in a batch.
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

/**
 * Deletes a trips subcollection of activities corrsponding to the
 * `tripId` prop.
 *
 * This was adapted from the delete collection snippets in the documentation
 * at https://firebase.google.com/docs/firestore/manage-data/delete-data.
 *
 * TODO(Issue #81): Consider deleting data with callabable cloud function
 * https://firebase.google.com/docs/firestore/solutions/delete-collections.
 *
 * @param {string} tripId Document ID for the current Trip document.
 * @return {Promise<void>} Void promise used to call {@link deleteQueryBatch}
 *     asynchronously and catch any potential errors.
 */
async function deleteTripActivities(tripId) {
  const query = db.collection(DB.COLLECTION_TRIPS)
      .doc(tripId)
      .collection(DB.COLLECTION_ACTIVITIES)
      .orderBy(DB.ACTIVITIES_TITLE)
      .limit(NUM_DOCS_IN_BATCH_DELETE);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

/**
 * Deletes a trip and its subcollection of activities corrsponding to the
 * `tripId` prop and then refreshes the TripsContainer component.
 *
 * @param {string} tripId Document ID for the current Trip document.
 */
async function deleteTrip(tripId) {
  if (window.confirm('Are you sure you want to delete this trip? This' +
      ' action cannot be undone!')) {
    await deleteTripActivities(tripId)
        .then(() => {
          console.log("Activity subcollection successfully deleted for trip" +
                      " with id: ", tripId);
        })
        .catch(error => {
          console.error("Error deleting activities subcollection: ", error);
        });

    db.collection(DB.COLLECTION_TRIPS)
        .doc(tripId)
        .delete()
        .then(() => {
          console.log("Document successfully deleted with id: ", tripId);
        }).catch(error => {
          console.error("Error removing document: ", error);
        });
  }
}

/**
 * Component used to delete a Trip.
 *
 * @property {Object} props These are the props for this component:
 * @property {string} props.tripId Document ID for the current Trip document.
 * @property {boolean} props.canModifyTrip Determines whether or not the button
 *     is disabled.
 */
const DeleteTripsButton = (props) => {
  return (
    <Button
      type='button'
      variant='link'
      onClick={() => deleteTrip(props.tripId)}
      disabled={!props.canModifyTrip}
    >
      <FontAwesomeIcon icon='trash' className='fa-icon'/>
    </Button>
  );
}

export default DeleteTripsButton;
