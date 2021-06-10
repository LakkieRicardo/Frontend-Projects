/**
 * Gets the website from which the index listing will be queried
 * @returns {String}
 */
function GetTargetListingURL() {
    return document.querySelector('meta[name="fv-target-website-listing"]').content;
}

/**
 * Gets the website where the uploads are stored
 * @returns {String}
 */
 function GetTargetUploadServer() {
    return document.querySelector('meta[name="fv-target-website"]').content;
}

export { GetTargetListingURL, GetTargetUploadServer };