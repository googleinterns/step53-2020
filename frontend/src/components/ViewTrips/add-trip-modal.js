import React from 'react';

import app from '../Firebase';
import { Button, Modal, Form }  from 'react-bootstrap';

import { COLLECTION_TRIPS } from '../../constants/database.js';
import { formatTripData } from '../Utils/filter-input.js';

const db = app.firestore();

/**
 * Returns a Form.Control element with input type 'text' and other fields
 * specified by the function parameters.
 *
 * @param {string} placeholder Text placehold in the form input
 * @param {React.RefObject} ref Ref attached to the value inputted in the form.
 * @return {JSX.Element} The Form.Control element.
 */
function createTextFormControl(placeholder, ref) {
  return (
    <Form.Control
      type="text"
      placeholder={placeholder}
      ref={ref}
    />
  );
}

/**
 * Returns a Form.Control element with input type 'date' and other fields
 * specified by the function parameters.
 *
 * @param {React.RefObject} refArr The list of refs attached to the emails
 *     inputted in the form.
 * @return {JSX.Element} The Form.Control element.
 */
function createDateFormControl(ref) {
  return (
    <Form.Control
      type="date"
      ref={ref}
    />
  );
}

/**
 * Returns a Form.Control element with input type 'email' and other fields
 * specified by the function parameters.
 *
 * TODO(Issue #67): Email verification before submitting the form.
 *
 * @param {string} placeholder Text placehold in the form input
 * @param {React.RefObject} refArr The list of refs attached to the emails
 *     inputted in the form.
 * @return {JSX.Element} The Form.Control element.
 */
function createMultiFormControl(placeholder, refArr) {
  return (
    <>
      {refArr.map((ref, idx) => {
        return (
          <Form.Control
            type="email"
            placeholder={placeholder}
            ref={ref}
            key={idx}
          />
        );
      })}
    </>
  );
}

/**
 * Returns a Form.Group element with components specified by the input args.
 *
 * @param {string} controlId Prop that accessibly wires the nested label and
 *                           input prop.
 * @param {string} formLabel Label/title for the form input.
 * @param {string} inputType Input type of the form.
 * @param {string} placeholder Text placeholder in the form input.
 * @param {React.RefObject} ref Ref attached to the values inputted in the form.
 * @param {string} subFormText Subtext instructions under a form input.
 * @return {JSX.Element} The Form.Group element.
 */
function createFormGroup(controlId, formLabel, inputType, placeholder, ref) {
  let formControl;
  switch(inputType) {
    case 'text':
      formControl = createTextFormControl(placeholder, ref);
      break;
    case 'date':
      formControl = createDateFormControl(ref);
      break;
    case 'emails':
      formControl = createMultiFormControl(placeholder, ref);
      break;
    default:
      console.error('There should be no other input type')
  }

  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{formLabel}</Form.Label>
        {formControl}
    </Form.Group>
  )
}

/**
 * Component corresponding to add trips modal.
 *
 * @param {Object} props These are the props for this component:
 * - show: Boolean that determines if the add trips modal should be displayed.
 * - handleClose: The function that handles closing the add trips modal.
 * - refreshTripsContainer: Function that handles refreshing the TripsContainer
 *        component upon trip creation (Remove when fix Issue #62).
 * - key: Special React attribute that ensures a new AddTripModal instance is
 *        created whenever this key is updated
 *
 * @extends React.Component
 */
class AddTripModal extends React.Component {
  /** @inheritdoc */
  constructor(props) {
    super(props);

    this.nameRef = React.createRef();
    this.descriptionRef = React.createRef();
    this.destinationRef = React.createRef();
    this.startDateRef = React.createRef();
    this.endDateRef = React.createRef();
    this.state = { collaboratorsRefArr: [React.createRef()] }
  }

  /** Adds a new Ref element to the state variable `collaboratorsRefArr`. */
  addCollaboratorRef = () => {
    this.setState({ collaboratorsRefArr:
                      this.state.collaboratorsRefArr.concat([React.createRef()])
                  });
  }

  /**
   * Formats/cleans the form data and create a new Trip document in firestore.
   */
  createTrip() {
    const tripData = formatTripData(
        {
          name: this.nameRef.current.value,
          description: this.descriptionRef.current.value,
          destination: this.destinationRef.current.value,
          startDate: this.startDateRef.current.value,
          endDate: this.endDateRef.current.value,
          collaboratorEmails:
              this.state.collaboratorsRefArr.map(ref => ref.current.value),
        }
    );

    db.collection(COLLECTION_TRIPS)
        .add(tripData)
        .then(docRef => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(error => {
          console.error("Error adding document: ", error);
        });
  }

  /**
   * Handles submission of the form which includes:
   *  - Creation of the trip.
   *  - Refreshing the trips container.
   *  - Closing the modal.
   */
  handleSubmitForm = () => {
    this.createTrip();
    this.props.refreshTripsContainer();
    this.props.handleClose();
  }

  /** @inheritdoc */
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Trip</Modal.Title>
        </Modal.Header>

        <Form>
          <Modal.Body>
            {createFormGroup('tripNameGroup', 'Trip Name', 'text',
                             'Enter Trip Name', this.nameRef)}
            {createFormGroup('tripDescGroup', 'Trip Description', 'text',
                             'Enter Trip Description', this.descriptionRef)}
            {createFormGroup('tripDestGroup', 'Trip Destination', 'text',
                             'Enter Trip Destination', this.destinationRef)}
            {createFormGroup('tripStartDateGroup', 'Start Date', 'date',
                            '', this.startDateRef)}
            {createFormGroup('tripEndDateGroup', 'End Date', 'date',
                            '', this.endDateRef)}
            {createFormGroup('tripCollabsGroup', 'Trip Collaborators', 'emails',
                      'person@email.xyz', this.state.collaboratorsRefArr)}
            <Button onClick={this.addCollaboratorRef}>
              Add Another Collaborator
            </Button>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='secondary' onClick={this.props.handleClose}>
              Cancel
            </Button>
            <Button variant='primary' onClick={this.handleSubmitForm}>
              Add Trip
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
};

export default AddTripModal;