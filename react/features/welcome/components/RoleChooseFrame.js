import React, { Component } from 'react';
import { Dialog } from '../../base/dialog';

export class RoleChooseFrame extends Component {

  state = {
    active: "moderatorButton"
  };

  buttons = [
    {id: "moderatorButton"},
    {id: "normalUserButton"},
  ];

  constructor(props) {
    super(props);    
  }

  chooseModerator = (event) => {
    this.props.chooseUser(true);
    this.setState({
      active: "moderatorButton"
    });
    event.preventDefault();
  };

  chooseNormalUser = (event) => {
    this.props.chooseUser(false);
    this.setState({
      active: "normalUserButton"
    });
    event.preventDefault();
  }

  render() {
    const {chooseModerator, chooseNormalUser } = this;
    const {buttons} = this;
    return (
      <div id="role_choose_frame">
        <button 
          id={buttons[0].id}
          type="button" 
          className={`role-moderator-button ${this.state.active === "moderatorButton" ? "role-selected-button" : ""}`}
          onClick={chooseModerator}>Moderator</button>
        <button 
          id={buttons[1].id}
          type="button" 
          className={`role-normal-button ${this.state.active === "normalUserButton" ? "role-selected-button" : ""}`}
          onClick={chooseNormalUser}>Normal User</button>
      </div>
    );
  }  

}

