import React, { createRef } from 'react';
import * as ConfigRetriever from './ConfigRetriever';

/**
 * Retrieves a list of all the URIs which are in the index listing
 * @returns {Promise<Array<String>>}
 */
function GetFiles() {
    let listingURL = ConfigRetriever.GetTargetListingURL();
    if (!listingURL.endsWith("/")) listingURL = listingURL + "/";
    return new Promise((res, rej) => {
        
        fetch(listingURL, {mode: "cors"}).then(response => {
            response.text().then((fileListingContent) => {
                let filesArrayText = JSON.parse(fileListingContent)["result"];
                filesArrayText = filesArrayText.substring(1, filesArrayText.length - 1).replace(new RegExp("\"", "g"), "");
                let filesArray = [];
                if (filesArrayText.includes(",")) {
                    filesArray = filesArrayText.split(",");
                } else {
                    filesArray.push(filesArrayText);
                }
                let result = [];
                for (let i = 0; i < filesArray.length; i++) {
                    let filename = filesArray[i].replace(/.*\//, "");
                    if (filename === "." || filename === ".." || filename === ".htaccess") continue;
                    result.push(filename);
                }
                res(result);
            });
        });
    });
}

/**
 * Delete using FTP
 * @param {string} filename Name of the remote file to delete
 * @param {string} authPassword
 */
function DeleteFTP(filename, authPassword) {
    return new Promise((resolve, reject) => {
        if (authPassword) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", ConfigRetriever.GetTargetModifierURL());
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("operation=delete&auth_pswd=" + authPassword + "&filename=" + filename);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    resolve(xhr.status);
                }
            }
        } else {
            reject();
        }
    });
}

function RetrievePasswordFromCookie() {
    if (!document.cookie.includes("auth"))
        return null;
    return document.cookie.split("=")[1];
}

function SetAuthenticationPasswordCookie(authPassword) {
    document.cookie = "auth=" + authPassword;
}

/**
 * Renames a file through FTP
 * @param {string} oldName 
 * @param {string} newName 
 * @param {string} authPassword
 */
function RenameFTP(oldName, newName, authPassword) {
    return new Promise((resolve, reject) => {
        if (authPassword) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", ConfigRetriever.GetTargetModifierURL());
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("operation=rename&auth_pswd=" + authPassword + "&old_name=" + oldName + "&new_name=" + newName);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    resolve(xhr.status);
                }
            }
        } else {
            reject();
        }
    });
}

class FileViewerHeader extends React.Component {

    render() {
        return (
            <div className="fv-header">
                <h1 className="fv-header-title">File Uploads Viewer</h1>
                <h3 className="fv-header-subtitle">Lists all of the uploads made to <a href={ConfigRetriever.GetTargetUploadServer()}>{ConfigRetriever.GetTargetUploadServer()}</a></h3>
            </div>
        );
    }

}

class FileViewerItem extends React.Component {

    constructor(props) {
        super(props);
        this.onRename = this.onRename.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.requestRename = this.requestRename.bind(this);
        this.requestDelete = this.requestDelete.bind(this);
        this.handleAuthenticate = this.handleAuthenticate.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.notifyError = this.notifyError.bind(this);
        this.popupFieldRef = createRef();
        this.state = {
            authenticationActive: false
        };
    }

    handleExit() {
        this.setState({
            authenticationActive: false,
            targetAction: undefined,
            authPassword: undefined,
            error: false,
        });
    }

    notifyError() {
        this.setState({
            authenticationActive: this.state.authenticationActive,
            targetAction: this.state.targetAction,
            authPassword: this.state.authPassword,
            error: true,
        });
    }

    requestRename() {
        const authPswd = RetrievePasswordFromCookie();
        if (authPswd === null) {
            this.setState({
                authenticationActive: true,
                targetAction: "rename",
                error: false,
            });
        } else {
            this.setState({
                authenticationActive: false,
                targetAction: "rename",
                authPassword: authPswd,
                error: false,
            });
        }
    }

    requestDelete() {
        const authPswd = RetrievePasswordFromCookie();
        if (authPswd === null) {
            this.setState({
                authenticationActive: true,
                targetAction: "delete",
                error: false,
            });
        } else {
            this.setState({
                authenticationActive: false,
                targetAction: "delete",
                authPassword: authPswd,
                error: false,
            });
        }
    }

    handleAuthenticate() {
        SetAuthenticationPasswordCookie(this.popupFieldRef.current.value);
        this.setState({
            authenticationActive: false,
            targetAction: this.state.targetAction,
            authPassword: this.popupFieldRef.current.value,
            error: false,
        });
        this.popupFieldRef.current.value = "";
    }

    onRename() {
        RenameFTP(this.props.filename, this.popupFieldRef.current.value, this.state.authPassword)
        .then((status) => {
            if (status === 200) {
                this.handleExit();
                this.props.onUpdate();
            } else {
                this.notifyError();
            }
        }).catch(() => {
            this.notifyError();
        });
    }
    
    onDelete() {
        DeleteFTP(this.props.filename, this.state.authPassword)
        .then((status) => {
            if (status === 200) {
                this.handleExit();
                this.props.onUpdate();
            } else {
                this.setState({
                    authenticationActive: true,
                    targetAction: "delete",
                    authPassword: "",
                    error: true,
                });
            }
        })
        .catch(() => {
            this.setState({
                authenticationActive: true,
                targetAction: "delete",
                authPassword: "",
                error: true,
            });
        });
    }

    handleAuthKeyPress = (event) => {
        if (event.key === "Enter") this.handleAuthenticate();
    };

    handleRenameKeyPress = (event) => {
        if (event.key === "Enter") this.onRename();
    };

    render() {
        if (this.props.isNew) {
            window.scrollTo(0, 0);
        }
        let uploadServer = ConfigRetriever.GetTargetUploadServer();
        if (!uploadServer.endsWith("/")) uploadServer = uploadServer + "/";
        let resourceLocation = uploadServer + this.props.filename;
        if (this.state.authenticationActive) {
            return (
                <div className={this.props.isNew ? "fv-item--container fv-item--container-new" : "fv-item--container"}>
                    <span className="fv-item--button" onClick={this.requestRename}>Rename...</span>
                    <span className="fv-item--button" onClick={this.requestDelete}>Delete</span>
                    <a rel="noreferrer" target="_blank" href={resourceLocation} className="fv-item--button">Open</a>
                    <div className="fv-item--header">
                        <h3>{this.props.filename}</h3>
                    </div>
                    <div className="popup">
                        <div className="popup--bg" onClick={this.handleExit} />
                        <div className="popup--card">
                            <div>
                                {this.state.error && <h3 className="popup--error">Error sending request to server</h3>}
                                <h2>Enter authentication password</h2>
                                <input type="password" name="auth" id="auth-input" onKeyUp={this.handleAuthKeyPress} ref={this.popupFieldRef} autoFocus={true} />
                                <br />
                                <input type="submit" value="Authenticate" onClick={this.handleAuthenticate} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (this.state.targetAction === "rename") {
            return (
                <div className={this.props.isNew ? "fv-item--container fv-item--container-new" : "fv-item--container"}>
                    <span className="fv-item--button" onClick={this.requestRename}>Rename</span>
                    <span className="fv-item--button" onClick={this.requestDelete}>Delete</span>
                    <a rel="noreferrer" target="_blank" href={resourceLocation} className="fv-item--button">Open</a>
                    <div className="fv-item--header">
                        <h3>{this.props.filename}</h3>
                    </div>
                    <div className="popup">
                        <div className="popup--bg" onClick={this.handleExit} />
                        <div className="popup--card">
                            <div>
                                {this.state.error && <h3 className="popup--error">Error sending request to server</h3>}
                                <h2>Rename to...</h2>
                                <input type="text" name="rename" id="rename-input" onKeyUp={this.handleRenameKeyPress} ref={this.popupFieldRef} autoFocus={true} />
                                <br />
                                <input type="submit" value="Rename" onClick={this.onRename} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            if (this.state.targetAction === "delete") {
                this.onDelete();
            }
            return (
                <div className={this.props.isNew ? "fv-item--container fv-item--container-new" : "fv-item--container"}>
                    <span className="fv-item--button" onClick={this.requestRename}>Rename</span>
                    <span className="fv-item--button" onClick={this.requestDelete}>Delete</span>
                    <a rel="noreferrer" target="_blank" href={resourceLocation} className="fv-item--button">Open</a>
                    <div className="fv-item--header">
                        <h3>{this.props.filename}</h3>
                    </div>
                </div>
            );
        }
    }

}

class FileViewerBody extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
            searchResults: [],
            newFiles: []
        };
        this.updateSearch = this.updateSearch.bind(this);
        this.searchRef = React.createRef();
        this.updateFiles = this.updateFiles.bind(this);
    }

    updateFiles() {
        GetFiles().then((value) => {
            let newFiles = value.filter(elem => !this.state.fileList.includes(elem));
            let searchResults = this.state.fileList.filter(item => item.toLowerCase().includes(this.searchRef.current.value));
            for (let i = 0; i < newFiles.length; i++) {
                searchResults.splice(0, 0, newFiles[i]);
            }
            this.setState({
                fileList: value,
                searchResults: searchResults,
                newFiles: newFiles
            });
        });
    }

    componentDidMount() {
        GetFiles().then((value) => {
            this.setState({
                fileList: value,
                searchResults: value,
                newFiles: []
            });
        });
        this.filesPoller = setInterval(() => {
            this.updateFiles();
        }, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.filesPoller);
    }

    updateSearch(event) {
        this.setState({
            fileList: this.state.fileList,
            searchResults: this.state.fileList.filter(item => item.toLowerCase().includes(this.searchRef.current.value)),
            newFiles: []
        });
    }

    render() {
        let sortedFileList = this.state.fileList.sort((a, b) => {
            if (this.state.newFiles.includes(a) && this.state.newFiles.includes(b)) {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            } else if (this.state.newFiles.includes(a)) {
                return -1;
            } else if (this.state.newFiles.includes(b)) {
                return 1;
            } else {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            }
        }).filter(item => this.state.searchResults.includes(item));
        return (
            <>
                <div className="fv-search-wrapper"><input ref={this.searchRef} type="search" maxLength="100" aria-label="Search function" className="fv-header-search" name="search" placeholder="Search" onInput={this.updateSearch} autoComplete="off" /></div>
                <div className="fv-container">
                    {sortedFileList.map((filename, i) => {
                        return (<FileViewerItem key={i} filename={filename} isNew={this.state.newFiles.includes(filename)} onUpdate={() => this.updateFiles()} />);
                    })}
                </div>
            </>
        );
    }

}

class FileViewerFooter extends React.Component {

    render() {
        return (
            <footer>
                <div className="fv-footer--container">
                    <h2>File Viewer for {ConfigRetriever.GetTargetUploadServer()}</h2>
                    <h3>Page created by Diego Ricardo</h3>
                </div>
                <div className="fv-footer--padding" />
            </footer>
        );
    }

}

class FileViewer extends React.Component {
    
    render() {
        return (
            <>
                <FileViewerHeader />
                <FileViewerBody />
                <FileViewerFooter />
            </>
        );
    }

}

export default FileViewer;