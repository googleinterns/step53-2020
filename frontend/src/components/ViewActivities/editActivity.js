import React from 'react';
import { Button, Col, Form, Row, FormControl } from 'react-bootstrap';
import { getField, writeActivity, getRefValue } from './activityfns.js';
import * as DB from '../../constants/database.js'
import { countryList } from '../../constants/countries.js';
import * as time from '../Utils/time.js';

/**
 * The form that's used when the user is editing an activity.
 * 
 * @param {Object} props This component expects the following props:
 * - `activity` The activity to display.
 * - `submitFunction` The function to run upon submission to trigger card flip.
 */
class EditActivity extends React.Component {
  /** @inheritdoc */
  constructor(props){
    super(props);

    this.state = {startTzRef: false, endTzRef: false};

    // Bind state users/modifiers to `this`.
    this.editActivity = this.editActivity.bind(this);
    this.finishEditActivity = this.finishEditActivity.bind(this);
    this.timezonePicker = this.timezonePicker.bind(this);

    // References. 
    this.editTitleRef = React.createRef();
    this.editStartDateRef = React.createRef();
    this.editEndDateRef = React.createRef();
    this.editStartTimeRef = React.createRef();
    this.editEndTimeRef = React.createRef();
    this.editDescriptionRef = React.createRef();
    this.editStartLocRef = React.createRef();
    this.editEndLocRef = React.createRef();
    this.editStartTzRef = React.createRef();
    this.editEndTzRef = React.createRef();
  }
  
  /**
   * Edit an activity in the database upon form submission.
   */
  editActivity() {
    const activity = this.props.activity;

    let newVals = {};
    // All the text fields. 
    newVals[DB.ACTIVITIES_TITLE] = 
      getRefValue(this.editTitleRef, '', activity[DB.ACTIVITIES_TITLE])
    newVals[DB.ACTIVITIES_DESCRIPTION] = 
      getRefValue(this.editDescriptionRef, '', activity[DB.ACTIVITIES_DESCRIPTION]);

    newVals[DB.ACTIVITIES_START_COUNTRY] = 
      getRefValue(this.editStartLocRef, 'No Change', activity[DB.ACTIVITIES_START_COUNTRY]);
    newVals[DB.ACTIVITIES_END_COUNTRY] = 
      getRefValue(this.editEndLocRef, 'No Change', activity[DB.ACTIVITIES_END_COUNTRY]);
    
    newVals[DB.ACTIVITIES_START_TZ] = getRefValue(this.editStartTzRef, '', '');
    newVals[DB.ACTIVITIES_END_TZ] = getRefValue(this.editEndTzRef, '', '');

    // Start time fields!
    const startTime = getRefValue(this.editStartTimeRef, '');
    const startDate = getRefValue(this.editStartDateRef, '');
    const startTz = newVals[DB.ACTIVITIES_START_TZ];
    newVals[DB.ACTIVITIES_START_TIME] = time.getFirebaseTime(startTime, startDate, startTz);

    // End time fields!
    const endTime = getRefValue(this.editEndTimeRef, '');
    const endDate = getRefValue(this.editEndDateRef, '');
    const endTz = newVals[DB.ACTIVITIES_END_TZ];
    newVals[DB.ACTIVITIES_END_TIME] = time.getFirebaseTime(endTime, endDate, endTz);

    writeActivity(this.props.activity.tripId, this.props.activity.id, newVals);
  }

  /** Runs when the `submit` button on the form is pressed.  */
  finishEditActivity(event) {
    event.preventDefault();
    this.editActivity();
    this.props.submitFunction();
  }

  startTimeTzUpdate = () => { this.setState({startTz : !this.state.startTz})};
  endTimeTzUpdate = () => { this.setState({endTz : !this.state.endTz})};

  /**
   * Returns a dropdown of all the timezones.
   * 
   * @param defaultTz The default time zone.
   * @param st either 'start' or 'end' depending on whether the 
   * timezone is for the start or end timezone.
   * 
   * Tests done manually via UI. 
   */
  timezonePicker(st, defaultTz) {
    let ref = st === 'start' ? this.editStartLocRef : this.editEndLocRef;
    let dbEntry = st === 'start' ? DB.ACTIVITIES_START_COUNTRY : DB.ACTIVITIES_END_COUNTRY;
    let timezones;
    if (ref.current == null) {
      // If activity[key] DNE, then timezones will just return all tzs anyway
      timezones = time.timezonesForCountry(this.props.activity[dbEntry]);
    } else {
      timezones = time.timezonesForCountry(ref.current.value);
    }

    return (
      <div>
      <FormControl as='select'
        ref={st === 'start' ? this.editStartTzRef : this.editEndTzRef}
        key={st === 'start' ? this.state.startTz : this.state.endTz}
        defaultValue={defaultTz}
      >
        {timezones.map((item, index) => {
          return (<option key={index}>{item}</option>);
        })}
      </FormControl>
      </div>
    )
  }

  /**
   * Create a dropdown of all the countries.
   * 
   * @param ref The reference to attach to the dropdown.
   * @param defaultCountry The default country for the dropdown.
   */
  countriesDropdown(ref, tzref, defaultCountry) {
    return (
      <FormControl as='select' ref={ref} onChange={tzref} defaultValue={defaultCountry}>
        {countryList.map((item, index) => {
          return (<option key={index}>{item}</option>);
        })}
      </FormControl>
    );
  }


  render() {
    const activity = this.props.activity;
    const TITLEWIDTH = 2;
    const COUNTRYWIDTH = 6;
    const DATEWIDTH = 4;
    const TIMEWIDTH = 3;
    const TZPICKERWIDTH = 3;
    return (
      <Form className='activity-editor' onSubmit={this.finishEditActivity}>
        <Form.Group as={Row} controlId='formActivityTitle'>
          <Col sm={TITLEWIDTH}><Form.Label>Title:</Form.Label></Col>
          <Col>
            <Form.Control type='text'
             placeholder={activity[DB.ACTIVITIES_TITLE]} 
             ref={this.editTitleRef}/>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='formActivityStartLocation'>
          <Col xs={TITLEWIDTH}><Form.Label>Start Location:</Form.Label></Col>
          <Col sm={COUNTRYWIDTH}>
            {this.countriesDropdown(this.editStartLocRef,
              this.startTimeTzUpdate, 
              getField(activity, DB.ACTIVITIES_START_COUNTRY))}
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='formActivityStartLocation'>
          <Col xs={TITLEWIDTH}><Form.Label>End Location:</Form.Label></Col>
          <Col sm={COUNTRYWIDTH}>
            {this.countriesDropdown(this.editEndLocRef, 
              this.endTimeTzUpdate, 
              getField(activity, DB.ACTIVITIES_END_COUNTRY))}
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='formActivityStartTime'>
          <Col sm={TITLEWIDTH}><Form.Label>From:</Form.Label></Col>
          <Col sm={DATEWIDTH}>
            <FormControl type='date' label='date' ref={this.editStartDateRef} 
              defaultValue={time.getDateBarebones(getField(activity, DB.ACTIVITIES_START_TIME), 
              getField(activity, DB.ACTIVITIES_START_TZ))}/>
          </Col>
          <Col sm={TIMEWIDTH}>
            <FormControl type='time' label='time' ref={this.editStartTimeRef}
              defaultValue={time.get24hTime(getField(activity, DB.ACTIVITIES_START_TIME), 
              getField(activity, DB.ACTIVITIES_START_TZ))}/>
          </Col>
          <Col sm={TZPICKERWIDTH}>
            {this.timezonePicker('start', getField(activity, DB.ACTIVITIES_START_TZ))}
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='formActivityEndTime'>
          <Col sm={TITLEWIDTH}><Form.Label>To:</Form.Label></Col>
          <Col sm={DATEWIDTH}>
            <Form.Control type='date' label='date' ref={this.editEndDateRef}
              defaultValue={time.getDateBarebones(getField(activity, DB.ACTIVITIES_END_TIME), 
              getField(activity, DB.ACTIVITIES_END_TZ))}/>
          </Col>
          <Col sm={TIMEWIDTH}>
            <Form.Control type='time' label='time' ref={this.editEndTimeRef}
              defaultValue={time.get24hTime(getField(activity, DB.ACTIVITIES_END_TIME), 
              getField(activity, DB.ACTIVITIES_END_TZ))}/>
          </Col>
          <Col sm={TZPICKERWIDTH}>
            {this.timezonePicker('end', getField(activity, DB.ACTIVITIES_END_TZ))}
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='formActivityTitle'>
          <Col sm={TITLEWIDTH}><Form.Label>Description:</Form.Label></Col>
          <Col><Form.Control type='text' 
            placeholder={getField(activity, DB.ACTIVITIES_DESCRIPTION, 'Add some details!')}
            ref={this.editDescriptionRef} />
          </Col>
        </Form.Group>
        <Button type='submit' className='float-right'>Done!</Button>
      </Form>
    );
  }
}

export default EditActivity;
