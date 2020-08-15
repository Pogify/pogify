import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hosting: [],
    };
    this.create = this.create.bind(this);
  }

  create() {
    axios
      .post("/create", this.state.session, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
      .then((res) => {
        window.location.href = `/session/${res.data}`;
        console.log(res.data);
      })
      .catch(console.error);
  }

  componentDidMount() {
    axios.get("/getSessions").then((res) => {
      this.setState({
        hosting: res.data,
      });
    });
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {Boolean(this.state.hosting.length) && (
          <div>
            Your Current Listening Sessions:
            <ul>
              {this.state.hosting.map((item) => {
                return (
                  <li key={item}>
                    <Link to={`/session/${item}`} style={{ color: "unset" }}>
                      {item}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <button onClick={this.create}>Create New Listening Session</button>
      </div>
    );
  }
}
