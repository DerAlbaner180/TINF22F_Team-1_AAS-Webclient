import React from "react";
import {controller, getFullShellData} from "./backend";
import {index, Main} from "./index";
import Dropdown from 'react-bootstrap/Dropdown';
import ReactDOM from 'react-dom';
import Error from './errorMessage';

class ServerMenu extends React.Component {
    state = {
        serverlist: ["https://v3.admin-shell-io.com/", "https://admin-shell-io.com/5001/", "http://aas.murrelektronik.com:4001/aas", "https://ccae4836-001e-48c2-a4f9-235554f9400b.ma.bw-cloud-instance.org"],
    }

    componentDidMount() {
        if (window.sessionStorage.getItem("url") === null) {
            window.sessionStorage.setItem("url", "https://v3.admin-shell-io.com/");
            getFullShellData();
        }
    } changeServer() {
        controller.abort();
        let url = document.getElementById("server-url").value;

        
        if (!url.startsWith("http")) {
                const errorContainer = document.getElementById('error-container');
                ReactDOM.unmountComponentAtNode(errorContainer);
                ReactDOM.render(<Error message = "URL has to start with http!"/>, errorContainer);
                return;
        }


        window.sessionStorage.clear();
        index.render(<Main/>);
        window.sessionStorage.setItem("url", url);
        document.getElementById("error_message_NextToSearchField").style.visibility = "hidden";
        document.getElementById("searchField").value = "";
        getFullShellData();
    }


    render() {
        return (
            <Dropdown className="mx-2" autoClose="outside" variant="light">
                <Dropdown.Toggle id="dropdown-autoclose-outside">
                    Server Menu
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item>
                        <form className="mx-2 d-flex flex-row justify-content-end"
                              onSubmit={(event) => event.preventDefault()}>
                            <input
                                id="server-url"
                                type="text"
                                className="form-control form-control-dark  w-auto"
                                placeholder="Type in Server-URL...">
                            </input>
                            <button
                                id={"addServerbtn"}
                                type="submit"
                                className="btn btn-link mx-2 text-nowrap"
                                onClick={this.changeServer}>
                                Add Server
                            </button>
                        </form>
                    </Dropdown.Item>
                    {this.state.serverlist.map(serverUrl => {
                        let changeServer = this.changeServer;
                        return (
                            <Dropdown.Item onClick={function () {
                                document.getElementById("server-url").value = serverUrl;
                                changeServer();
                            }}>
                                {serverUrl}
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default ServerMenu;