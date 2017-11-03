import React, { Component } from 'react';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import './lumen.css';
import './App.css';
import $ from 'jquery';
import request from 'request';

class App extends Component {
  state = {
    selectedContainer: null,
    content: '',
    containers: [],
    currentRequest: null,
  }

  componentDidMount() {
    this.getContainers();
    setInterval(this.getContainers, 2500);
  }

  getContainers = () => {
    $.get('/containers', (data) => {
      this.setState({ containers: data.containers });
      if (data.containers.length > 0 && !this.state.selectedContainer) {
        this.handleSwitchContainer(data.containers[0].Id);
      }
    });
  }

  handleSwitchContainer = (containerId) => {
    if (this.state.currentRequest) {
      this.state.currentRequest.abort();
      this.setState({ currentRequest: null });
    }

    this.setState({ selectedContainer: containerId, content: '' });
    let req = request.get(`${window.location.origin}/containers/${containerId}`)
      .on('data', (data) => {
        this.setState({ content: this.state.content + data.toString() });
      });
    this.setState({ currentRequest: req });
  }

  componentDidUpdate () {
    var el = this.refs.screen;
    el.scrollTop = el.scrollHeight;
  }


  getContainerList = () => {
    if (this.state.containers.length===0) {
      return <p className="text-muted">No containers!</p>;
    }

    return this.state.containers.map((container) => {
      return (
        <ListGroupItem active={this.state.selectedContainer===container.Id}
        onClick={() => this.handleSwitchContainer(container.Id)}>
        {container.Image}{' / '}{container.Status}{' / '}{container.Id.slice(0, 7)}
        </ListGroupItem>
      );
    });
  }

  render() {
    return (
      <div style={{ marginLeft: 15, marginRight: 15 }}>
        <Row>
          <Col sm={3}>
            <hr />
            <p className="lead text-center">Containers</p>
            <hr />
            <ListGroup>
              {this.getContainerList()}
            </ListGroup>
          </Col>
          <Col sm={9}>
            <div className="bar">
              <div className="red"></div>
              <div className="yellow"></div>
              <div className="green"></div>
            </div>
            <div ref="screen" className="screen" style={{ minHeight: window.innerHeight - 30 }}>
              <p className="font">{this.state.content}</p>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
