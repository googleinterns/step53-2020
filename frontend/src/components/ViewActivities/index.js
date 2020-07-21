import React from 'react';
import ActivityList from './activitylist.js';
import EditActivity from './editActivity.js';
import { Button, Modal } from 'react-bootstrap';
import app from '../Firebase'; 
import * as DB from '../../constants/database.js';
import { firestore } from 'firebase';

const db = app.firestore();

/**
 * The whole view activities page.
 * 
 * @param {Object} props This component expects the following props:
 * - `tripId` {string} The trip's ID. This is sent to the component through the URL. 
 */
class ViewActivities extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = { addingActivity : false }
  }

  /**
   * Complete "Add Activity" operation
   */
  addActivity = (e) => {
    e.preventDefault();
    this.setState({ addingActivity: true });
  }

  doneAddingActivity = () => { this.setState({ addingActivity: false }) };

  emptyActivity = (tripId) => {
    const data = { 'fillerstamp' : firestore.Timestamp.now() };
    db.collection(DB.COLLECTION_TRIPS).doc(tripId)
      .collection(DB.COLLECTION_ACTIVITIES).add(data);
    return data;
  }

  render() {
    const tripId = this.props.match.params.tripId;
    if (!this.state.addingActivity) {
      return (
        <div>
          <div className='activity-page'> 
            <ActivityList tripId={tripId}/>
          </div>
          <Button type='button' onClick={this.addActivity}>+ Add</Button>
        </div>
      );
    } else {
      return (
        <Modal.Dialog>
          <Modal.Header>Add New Activity</Modal.Header>
          <Modal.Body>
            <EditActivity activity={this.emptyActivity(tripId)} 
              submitFunction={this.doneAddingActivity} new={true}/> 
          </Modal.Body>
        </Modal.Dialog>
      );
    }
  }
}

export default ViewActivities;
