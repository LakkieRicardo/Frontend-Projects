import React from 'react';
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
        this.myRef = React.createRef();
    }

    render() {
        if (this.props.isNew) {
            window.scrollTo(0, 0);
        }
        let uploadServer = ConfigRetriever.GetTargetUploadServer();
        if (!uploadServer.endsWith("/")) uploadServer = uploadServer + "/";
        let resourceLocation = uploadServer + this.props.filename;
        return (
            <div ref={ (ref) => this.myRef = ref} className={this.props.isNew ? "fv-item--container fv-item--container-new" : "fv-item--container"}>
                <div className="fv-item--header">
                    <h3>{this.props.filename}</h3>
                </div>
                <a rel="noreferrer" target="_blank" href={resourceLocation} className="fv-item--button">Open {this.props.filename}</a>
            </div>
        );
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
                <div className="fv-search-wrapper"><input ref={this.searchRef} type="text" maxLength="100" aria-label="Search function" className="fv-header-search" name="search" placeholder="Search" onInput={this.updateSearch} /></div>
                <div className="fv-container">
                    {sortedFileList.map((filename, i) => {
                        return (<FileViewerItem key={i} filename={filename} isNew={this.state.newFiles.includes(filename)} />);
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