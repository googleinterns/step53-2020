import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { getField, writeActivity } from './activityfns.js';
import * as DB from '../../constants/database.js'
import { countryList } from '../../constants/countries.js';
import * as time from '../Utils/time.js';
import app from '../Firebase';
import * as formElements from './editActivityFormElements.js';

const db = app.firestore();

/**
 * React component for the form that's used when the user is editing an activity.
 *
 * @property {Object} props ReactJS props.
 * @property {ActivityInfo} props.activity The activity to display.
 * @property {function} props.submitFunction The function to run upon submission.
 */
class EditActivity extends React.Component {
  /** @override */
  constructor(props){
    super(props);

    this.state = {startTz: false, endTz: false};

    // Bind state users/modifiers to `this`.
    this.editActivity = this.editActivity.bind(this);
    this.finishEditActivity = this.finishEditActivity.bind(this);
    this.deleteActivity = this.deleteActivity.bind(this);
    this.timezoneDropdown = this.timezoneDropdown.bind(this);

    // References.
    this.editTitleRef = React.createRef();
    this.editStartDateRef = React.createRef();
    this.editEndDateRef = React.createRef();
    this.editStartTimeRef = React.createRef();
    this.editEndTimeRef = React.createRef();
    this.editDescriptionRef = React.createRef();
    this.editStartLocRef = React.createRef();
    this.editEndLocRef = React.createRef();
    this.startTz = React.createRef();
    this.endTz = React.createRef();
  }

  /**
   * Edit an activity in the database upon form submission.
   * TODO: Update times as well! This only does the text field forms (#64).
   */
  editActivity() {
    let newVals = {};
    if (this.editTitleRef.current.value !== '') {
      newVals[DB.ACTIVITIES_TITLE] = this.editTitleRef.current.value;
    }
    if (this.editDescriptionRef.current.value !== '') {
      newVals[DB.ACTIVITIES_DESCRIPTION] = this.editDescriptionRef.current.value;
    }
    if (this.editStartLocRef.current.value !== 'No Change'){
      newVals[DB.ACTIVITIES_START_COUNTRY] = this.editStartLocRef.current.value;
    }
    if (this.editEndLocRef.current.value !== 'No Change'){
      newVals[DB.ACTIVITIES_END_COUNTRY] = this.editEndLocRef.current.value;
    }
    if (Object.keys(newVals).length !== 0) {
      writeActivity(this.props.activity.tripId, this.props.activity.id, newVals);
    }
  }

  /** Runs when the `submit` button on the form is pressed.  */
  finishEditActivity(event) {
    event.preventDefault();
    this.editActivity();
    this.props.submitFunction();
  }

  // "Flip switch" on timezone dropdown so the dropdown's contents update to the
  // selected country's timezones.
  startTimeTzUpdate = () => { this.setState({startTz : !this.state.startTz})};
  endTimeTzUpdate = () => { this.setState({endTz : !this.state.endTz})};

  /**
   * Returns a dropdown of all the timezones.
   * The dropdown's values change based on the corrresponding country dropdown to
   * reduce scrolling and ensure that the location corresponds to the time zone.
   *
   * Tests done manually using UI.
   *
   * @param {string} st Either 'start' or 'end' depending on whether the
   * timezone is for the start or end timezone.
   * @return {HTML} HTML dropdown item.
   */
  timezoneDropdown(st) {
    const ref = st === 'start' ? this.editStartLocRef : this.editEndLocRef;
    const dbEntry = st === 'start' ? DB.ACTIVITIES_START_COUNTRY : DB.ACTIVITIES_END_COUNTRY;
    let timezones;
    if (ref.current == null) {
      // If activity[key] DNE, then timezones will just return all tzs anyway.
      timezones = time.timezonesForCountry(this.props.activity[dbEntry]);
    } else {
      timezones = time.timezonesForCountry(ref.current.value);
    }
    return (
      <Form.Control as='select'
        ref={st === 'start' ? this.startTz : this.endTz}
        key={st === 'start' ? this.state.startTz : this.state.endTz}
      >
        {timezones.map((item, index) => {
          return (<option key={index}>{item}</option>);
        })}
      </Form.Control>
    )
  }
  /**
   * Create a dropdown of all the countries.
   * This dropdown is linked to the corresponding timezone dropdown,
   * so when the country changes here, the values in the timezone dropdown
   * change as well.
   *
   * @param {ref} ref The reference to attach to the dropdown.
   * @param {ref} tzref The corresponding time zone reference field.
   * @return {HTML} HTML dropdown of all the countries with timezones.
   */
  countriesDropdown(ref, tzref) {
    return (
      <Form.Control as='select' ref={ref} onChange={tzref}>
        <option key='-1'>No Change</option>
        {countryList.map((item, index) => {
          return (
            <option key={index}>{item}</option>
          );
        })}
      </Form.Control>
    );
  }

  /**
   * Delete this activity.
   *
   * @return {boolean} true if the activity was successfully deleted.
   */
  async deleteActivity() {
    if (window.confirm(`Are you sure you want to delete ${this.props.activity[DB.ACTIVITIES_TITLE]}?`
        + 'This action cannot be undone!')) {
      await db.collection(DB.COLLECTION_TRIPS).doc(this.props.activity.tripId)
        .collection(DB.COLLECTION_ACTIVITIES).doc(this.props.activity.id)
        .delete();
      return true;
    } else {
      return false;
    }
  }

  render() {
    const activity = this.props.activity;
    return (
      <Form className='activity-editor' onSubmit={this.finishEditActivity}>
        {formElements.textElementFormGroup(
            'formActivityTitle',          // controlId
            'Title:',                     // formLabel
            activity[DB.ACTIVITIES_TITLE],// placeHolder
            this.editTitleRef             // ref
          )}
        {formElements.locationElementFormGroup(
          'formActivityStartLocation',                                         // controlId
          'Start Location:',                                                   // formLabel
          this.countriesDropdown(this.editStartLocRef, this.startTimeTzUpdate) // dropdown
          )}
        {formElements.locationElementFormGroup(
          'formActivityEndLocation',                                       // controlId
          'End Location:',                                                 // formLabel
          this.countriesDropdown(this.editEndLocRef, this.endTimeTzUpdate) // dropdown
          )}
        {formElements.dateTimeTzFormGroup(
          'formActivityStartTime',       // controlId
          'From:',                       // formLabel
          this.editStartDateRef,         // dateRef
          null,                          // dateDefault
          this.editStartTimeRef,         // timeRef,
          null,                          // timeDefault,
          this.timezoneDropdown('start') // tzpicker
          )}
        {formElements.dateTimeTzFormGroup(
          'formActivityEndTime',       // controlId
          'To:',                       // formLabel
          this.editEndDateRef,         // dateRef
          null,                        // dateDefault
          this.editEndTimeRef,         // timeRef,
          null,                        //timeDefault,
          this.timezoneDropdown('end') // tzpicker
          )}
        {formElements.textElementFormGroup(
            'formActivityDescription',                                          // controlId
            'Description:',                                                     // formLabel
            getField(activity, DB.ACTIVITIES_DESCRIPTION, 'Add some details!'), // placeHolder
            this.editDescriptionRef                                             // ref
          )}
        <Button type='submit' className='float-right'>Done!</Button>
        <Button type='button' onClick={this.deleteActivity}>
          Delete
        </Button>
      </Form>
    );
  }
}

export default EditActivity;
