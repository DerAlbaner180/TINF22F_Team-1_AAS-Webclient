import React from 'react';
import Item from "./item";
import ReactDOM from 'react-dom';
import Error from './errorMessage';
import NoServerPage from './noServerPage'; // Stelle sicher, dass der richtige Importpfad verwendet wird

class ItemView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadedAndChanged: false // Initialisiere loadedAndChanged im Zustand
        };
    }

    componentDidMount() {
        // Überprüfen, ob sessionStorage 'loaded' nicht "true" ist, und nach 5 Sekunden den Zustand aktualisieren
        setTimeout(() => {
            if (window.sessionStorage.getItem('loaded') !== "true") {
                this.setState({ loadedAndChanged: true });
            }
        }, 5000);
    }

    render() {
        if (window.sessionStorage.getItem("url") === null) {
            return <div></div>;
        } else {
            let shells = JSON.parse(window.sessionStorage.getItem("content"));
            
            if (shells !== null && shells !== undefined) {
                return (
                    <div className="m-2 p-2 col-4 overflow-auto list-group">
                        <h3>Select Asset</h3>
                        <div>
                            {shells.map(shell => {
                                return <Item key={shell.idShort} shell={shell}/>
                            })}
                        </div>
                    </div>
                );
            } else {
                // Wenn loadedAndChanged true ist, render NoServerPage mit der Meldung "Server not available"
                if (this.state.loadedAndChanged) {
                    return <NoServerPage message="Server not available" />;
                } else {
                    return (
                        <div className="position-absolute top-50 start-50 translate-middle">
                            <div className="spinner-border" role="status">
                                <span className="sr-only"/>
                            </div>
                        </div>
                    );
                }
            }
        }
    }
}

export default ItemView;
