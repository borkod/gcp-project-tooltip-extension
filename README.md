# gcp-project-tooltip-extension
Chrome Extension that adds a tooltip with project names over project ID's in GCP console webpages.


# Requirements:

- Cloud Resource Manager API needs to be enabled

# Steps

## Configure the OAuth consent screen
We will also need to set an OAuth consent screen before we can get a Client ID. Choose OAuth consent screen from the left navigation panel.

Select the user type for the app, then click Create. Complete the app registration form, then click Save and Continue.

Add Scopes (Might need organization view scope?):
- API: Cloud Resource Manager API
- Scope: ./auth/cloudplatformprojects.readonly

## Create Credential
- Create OAuth client ID

