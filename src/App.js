import React, { Component } from "react";
import "react-bulma-components/dist/react-bulma-components.min.css";
import "./bulmaswatch.min.css";
import {
  Button,
  Columns,
  Container,
  Form,
  Heading,
  Section,
} from "react-bulma-components";
import tick from "./tick.wav";
import ding from "./ding.mp3";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPerson: "",
      selectedPerson: -1,
      people: [],
      cycleTime: 1,
      breakTime: 2,
      breakRotations: 3,
      rotateTime: 3,
      timer: 60,
      status: "begin",
      rotations: 0,
      dragPerson: -1,
      draggedOverPerson: -1,
    };

    this.audioTick = new Audio(tick);
    this.audioDing = new Audio(ding);
  }

  componentDidMount() {
    setInterval(() => {
      if (this.state.status === "begin" || this.state.status === "pause") {
        return;
      }

      if (this.state.status === "rotate" && this.state.timer === 0) {
        this.run();
      }

      if (this.state.status === "running" && this.state.timer === 0) {
        this.nextPerson();
      }

      if (this.state.status === "break" && this.state.timer === 0) {
        this.nextPerson();
      }

      if (
        (this.state.status === "running" || this.state.status === "break") &&
        this.state.timer > 1 &&
        this.state.timer <= 4
      ) {
        this.audioTick.play();
      }

      if (
        (this.state.status === "running" || this.state.status === "break") &&
        this.state.timer === 1
      ) {
        this.audioDing.play();
      }

      let timer = this.state.timer - 1;
      if (timer <= 0) {
        timer = 0;
      }
      this.setState({
        timer: timer,
      });
    }, 1000);
  }

  startPressed() {
    if (this.state.status === "begin") {
      if (this.state.people.length === 0) {
        return;
      }

      this.setState({
        status: "running",
        timer: this.getCycleTime(),
        selectedPerson: 0,
      });
    }

    if (this.state.status === "running") {
      this.setState({
        status: "pause",
      });
    }

    if (this.state.status === "rotate") {
      this.run();
    }

    if (this.state.status === "pause") {
      this.setState({
        status: "running",
      });
    }

    if (this.state.status === "break") {
      this.nextPerson();
    }
  }

  skipPressed() {
    this.nextPerson();
  }

  resetPressed() {
    this.setState({
      status: "begin",
      timer: this.getCycleTime(),
      selectedPerson: -1,
      rotations: 0,
    });
  }

  shufflePressed() {
    if (this.state.status !== "begin") {
      return;
    }
    let people = this.state.people;
    people = this.shuffle(people);
    this.setState({
      people: people,
    });
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  addPerson() {
    if (this.state.currentPerson === "") {
      return;
    }

    this.setState({
      people: [...this.state.people, this.state.currentPerson],
      currentPerson: "",
    });
  }

  //////////////////////////
  nextPerson() {
    if (this.state.people.length === 0) {
      return;
    }

    if (
      this.state.rotations + 1 !== 0 &&
      (this.state.rotations + 1) % this.getBreakRotations() === 0
    ) {
      this.break();
      return;
    }

    this.setState({
      status: "rotate",
      timer: this.getRotateTime(),
      selectedPerson: this.nextSelectedPerson(),
      rotations: this.state.rotations + 1,
    });
  }

  break() {
    this.setState({
      status: "break",
      timer: this.getBreakTime(),
      rotations: -1,
    });
  }

  run() {
    this.setState({
      status: "running",
      timer: this.getCycleTime(),
    });
  }

  nextSelectedPerson() {
    const selectedPerson = this.state.selectedPerson + 1;
    if (selectedPerson === this.state.people.length) {
      return 0;
    }

    return selectedPerson;
  }

  getCycleTime() {
    if (isNaN(this.state.cycleTime)) {
      return 8;
    }

    return this.state.cycleTime * 60;
  }

  getRotateTime() {
    if (isNaN(this.state.rotateTime)) {
      return 0;
    }

    return this.state.rotateTime;
  }

  getBreakRotations() {
    if (isNaN(this.state.breakRotations)) {
      return 0;
    }

    return this.state.breakRotations;
  }

  getBreakTime() {
    if (isNaN(this.state.breakTime)) {
      return 0;
    }

    return this.state.breakTime * 60;
  }

  removePerson(index) {
    if (index === this.state.selectedPerson) {
      return;
    }
    if (index < this.state.selectedPerson) {
    }
    this.setState({
      people: [
        ...this.state.people.slice(0, index),
        ...this.state.people.slice(index + 1),
      ],
      selectedPerson:
        index < this.state.selectedPerson
          ? this.state.selectedPerson - 1
          : this.state.selectedPerson,
    });
  }

  render() {
    const {
      currentPerson,
      timer,
      status,
      people,
      selectedPerson,
      dragPerson,
      cycleTime,
      rotateTime,
      breakRotations,
      breakTime,
      draggedOverPerson,
    } = this.state;

    const minutes = Math.floor(timer / 60);
    const seconds = timer - minutes * 60;

    return (
      <div className="App">
        <Section>
          <Container>
            <Columns>
              <Columns.Column>
                {people.map((person, i) => (
                  <div
                    key={i}
                    style={{
                      width: "100%",
                      backgroundColor: i === selectedPerson ? "#5c9ff1" : "#f1f1f1",
                      color: i === selectedPerson ? "white" : "black",
                      marginLeft: i === draggedOverPerson ? 12 : 0,
                      transition: "all 100ms linear",
                      textAlign: "center",
                      padding: "8px 0",
                      marginBottom: 8,
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    draggable={true}
                    onClick={() => {
                      if (status !== "begin") {
                        return
                      }
                      this.removePerson(i);
                    }}
                    onDragStart={e => {
                      if (status !== "begin") {
                        return
                      }
                      this.setState({
                        dragPerson: i
                      });
                    }}
                    onDragEnd={e => {
                      if (status !== "begin") {
                        return
                      }
                      if (dragPerson === -1) {
                        return
                      }
                      people.splice(draggedOverPerson, 0, people.splice(dragPerson, 1)[0]);
                      this.setState({
                        dragPerson: -1,
                        draggedOverPerson: -1,
                        people: people
                      });
                    }}
                    onDragOver={e => {
                      if (status !== "begin") {
                        return
                      }
                      if (draggedOverPerson !== i) {
                        this.setState({
                          draggedOverPerson: i,
                        })
                      }
                    }}
                    >
                    {person}
                  </div>
                ))}

                <Form.Field>
                  <Form.Label>Participants</Form.Label>
                  <Form.Control>
                    <Form.Input
                      value={currentPerson}
                      onChange={(val) => {
                        this.setState({
                          currentPerson: val.target.value,
                        });
                      }}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          this.addPerson();
                        }
                      }}
                      placeholder="Add someone"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field>
                  <Form.Control>
                    <Button
                      fullwidth
                      color="success"
                      onClick={this.addPerson.bind(this)}
                    >
                      Add
                    </Button>
                  </Form.Control>
                </Form.Field>

                <Form.Field>
                  <Form.Label>Cycle Time</Form.Label>
                  <Form.Control>
                    <Form.Input
                      type="number"
                      value={cycleTime}
                      onChange={(val) => {
                        this.setState({
                          cycleTime: val.target.value,
                        });
                      }}
                      placeholder="Durations in Minutes"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field>
                  <Form.Label>Rotation Time (Seconds)</Form.Label>
                  <Form.Control>
                    <Form.Input
                      type="number"
                      value={rotateTime}
                      onChange={(val) => {
                        this.setState({
                          rotateTime: val.target.value,
                        });
                      }}
                      placeholder="Durations in Seconds"
                    />
                  </Form.Control>
                </Form.Field>

                <Columns>
                  <Columns.Column>
                    <Form.Field>
                      <Form.Label>Break after rotations</Form.Label>
                      <Form.Control>
                        <Form.Input
                          type="number"
                          value={breakRotations}
                          onChange={(val) => {
                            this.setState({
                              breakRotations: val.target.value,
                            });
                          }}
                          placeholder="Amount of rotations"
                        />
                      </Form.Control>
                    </Form.Field>
                  </Columns.Column>

                  <Columns.Column>
                    <Form.Field>
                      <Form.Label>Break duration</Form.Label>
                      <Form.Control>
                        <Form.Input
                          type="number"
                          value={breakTime}
                          onChange={(val) => {
                            this.setState({
                              breakTime: val.target.value,
                            });
                          }}
                          placeholder="Duration in Minutes"
                        />
                      </Form.Control>
                    </Form.Field>
                  </Columns.Column>
                </Columns>
              </Columns.Column>

              <Columns.Column style={{ textAlign: "center" }}>
                <Heading style={{ fontSize: "100px" }} size={1}>
                  {minutes < 10 ? "0" + minutes : minutes}:
                  {("0" + seconds).slice(-2)}
                </Heading>

                <div style={{ fontSize: "36px" }}>
                  {status === "begin" && "Press Start to Begin"}
                  {status === "running" &&
                    people[selectedPerson] + ", you're up!"}
                  {status === "pause" && "Timer is paused"}
                  {status === "rotate" &&
                    people[selectedPerson] + ", grab the keyboard!"}
                  {status === "break" && "Brews n Loos!"}
                </div>
              </Columns.Column>
            </Columns>
          </Container>
        </Section>

        <Section>
          <Container>
            <Button.Group>
              <Button color="success" onClick={this.startPressed.bind(this)}>
                {status === "begin" && "Start"}
                {status === "running" && "Pause"}
                {status === "pause" && "Resume"}
                {status === "rotate" && "I'm Ready"}
                {status === "break" && "I'm Ready"}
              </Button>

              <Button color="primary" onClick={this.skipPressed.bind(this)}>
                Skip
              </Button>

              <Button color="danger" onClick={this.resetPressed.bind(this)}>
                Reset
              </Button>

              {status === "begin" && (
                <Button color="info" onClick={this.shufflePressed.bind(this)}>
                  Shuffle
                </Button>
              )}
            </Button.Group>
          </Container>
        </Section>
      </div>
    );
  }
}
export default App;
