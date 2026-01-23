# ONLYOFFICE app for Jira Cloud

This app allows users to create and edit office files in [Jira Cloud](https://www.atlassian.com/software/jira/premium) using ONLYOFFICE Docs.

## Features ⭐️

* View and edit documents, spreadsheets, PDFs, and presentations directly in Jira issues.
* Co-edit documents in real time: two co-editing modes (Fast and Strict), Track Changes, comments, built-in chat.
* Create new files directly from Jira Cloud.

### Supported formats

**For viewing:**

* **WORD:** DOC, DOCM, DOCX, DOT, DOTM, DOTX, EPUB, FB2, FODT, HTM, HTML, HWP, HWPX, MD, MHT, MHTML, ODT, OTT, PAGES, RTF, STW, SXW, TXT, WPS, WPT, XML
* **CELL:** CSV, ET, ETT, FODS, NUMBERS, ODS, OTS, SXC, XLS, XLSM, XLSX, XLT, XLTM, XLTX
* **SLIDE:** DPS, DPT, FODP, KEY, ODG, ODP, OTP, POT, POTM, POTX, PPS, PPSM, PPSX, PPT, PPTM, PPTX, SXI
* **PDF:** DJVU, DOCXF, OFORM, OXPS, PDF, XPS
* **DIAGRAM:** VSDM, VSDX, VSSM, VSSX, VSTM, VSTX

**For editing:**

* **WORD:** DOCM, DOCX, DOTM, DOTX
* **CELL:** XLSB, XLSM, XLSX, XLTM, XLTX
* **SLIDE:** POTM, POTX, PPSM, PPSX, PPTM, PPTX
* **PDF:** PDF

**For editing with possible loss of information:**

* **WORD:** EPUB, FB2, HTML, ODT, OTT, RTF, TXT
* **CELL:** CSV, ODS, OTS
* **SLIDE:** ODP, OTP

## Requirements
 - ONLYOFFICE Docs Atlassian Remote
 - ONLYOFFICE Docs (Document Server)

## Installing ONLYOFFICE Docs

To be able to work with office files within Jira Cloud, you will need an instance of [ONLYOFFICE Docs](https://www.onlyoffice.com/office-suite.aspx). You can install the self-hosted version of the editors or opt for ONLYOFFICE Docs Cloud which doesn't require downloading and installation.

### Self-hosted editors

You can install free Community version of ONLYOFFICE Docs or scalable Enterprise Edition.

To install free Community version, use [Docker](https://github.com/onlyoffice/Docker-DocumentServer) (recommended) or follow [these instructions](https://helpcenter.onlyoffice.com/docs/installation/docs-community-install-ubuntu.aspx) for Debian, Ubuntu, or derivatives.

To install Enterprise Edition, follow the instructions [here](https://helpcenter.onlyoffice.com/docs/installation/enterprise).

Community Edition vs Enterprise Edition comparison can be found [here](#onlyoffice-docs-editions).

### ONLYOFFICE Docs Cloud

To get ONLYOFFICE Docs Cloud, get started [here](https://www.onlyoffice.com/docs-registration.aspx).

## App installation 📥

1. Go to [marketplace.atlassian.com](http://marketplace.atlassian.com/).
2. Сhoose the ONLYOFFICE Connector for Jira and click the **Get it now** button.
3. In the pop-up window, select the site where you'd like to install your app and choose the edition you prefer, if multiple editions are available.

## App configuration ⚙️

Administrators can configure the ONLYOFFICE app via the Manage Apps section in Jira Cloud (Apps -> Manage apps -> Take me there -> ONLYOFFICE Connector for Jira -> Configure). On the configuration page, set up:

* **ONLYOFFICE Docs address**: The URL of the installed ONLYOFFICE Docs.

* **ONLYOFFICE Docs secret key**: Enables JWT to protect your documents from unauthorized access (further information can be found [here](https://helpcenter.onlyoffice.com/docs/installation/docs-configure-jwt.aspx)).

* **Authorization header**.

You can also connect to the public test server of ONLYOFFICE Docs for one month by checking the corresponding box.

## App usage

The Jira issue page includes an ONLYOFFICE Docs section, allowing users to create new files or edit previously uploaded ones seamlessly. If you don’t see this section, simply click the gear icon below the issue title and select ONLYOFFICE Docs to enable it.

### Creating files 📄

To create a new file, click the **Create with ONLYOFFICE** button. In the pop-up window, enter a file name and choose a file format. Currently, you can create files in the following formats: DOCX, XLSX, and PPTX.

Once you click Create, the file will be generated and instantly open in a pop-up window with editing permissions. The newly created file will also be added to the Attachments section for easy access.

### Editing existing files 📝

You can open any previously uploaded or created files in the ONLYOFFICE editors. Simply click the pencil icon to edit or the eye icon to view the file. The editor will launch accordingly.

### File access permissions 👥

* Downloading: Available to all users with access to the Jira issue.
* Viewing: Available to all users with access to the Jira issue.
* Editing: Users can edit files they have created. To edit files created by others, users must have the Delete All Attachments permission.

To grant the editing permission to a specific Jira role:

* Open the context menu for the desired project and select Project settings.
* Navigate to the Permissions section, click the Action button, and update the role list for Delete All Attachments.

### Important to know ℹ️

Due to certain constraints with the connector, the editor cannot remain open for extended periods. To ensure smooth functionality, it must be restarted every four hours.

## Development

1. Clone project from the GitHub repository:
```
git clone https://github.com/ONLYOFFICE/onlyoffice-jira-cloud
```

2. Install the project dependencies:
```
npm install
```

3. Install dependencies in Custom UI Project:
```
cd static/onlyoffice-jira-docs-forge-custom-ui
npm install
```

4. Build Custom UI Project:
```
npm run build
```

5. Install the Forge CLI globally by running:
```
npm install -g @forge/cli
```

6. Log in to the Forge CLI ([Learn more](https://developer.atlassian.com/platform/forge/getting-started-learn/#log-in-with-an-atlassian-api-token)):
```
forge login
```

7. Specify environment variables in the manifest.yml file:
```
environment:
  variables:
    - key: FORGE_APP_ID
      default: <YOUR_FORGE_APP_ID>
    - key: FORGE_REMOTE_APP_URL
      default: <YOUR_REMOTE_APP_URL>
```

8. Navigate to the app's top-level directory and deploy your app by running ([Learn more](https://developer.atlassian.com/platform/forge/build-a-hello-world-app-in-bitbucket/#install-your-app)):
```
forge deploy
```

9. Install your app by running:
```
forge install
```

10. You can start tunneling by running:
```
forge tunnel
```

## ONLYOFFICE Docs editions

ONLYOFFICE offers different versions of its online document editors that can be deployed on your own servers.

**ONLYOFFICE Docs** packaged as Document Server:

* Community Edition 🆓 (`onlyoffice-documentserver` package) – Perfect for small teams and personal use.
* Enterprise Edition 🏢 (`onlyoffice-documentserver-ee` package) – Designed for businesses with advanced features & support.

The table below will help you make the right choice.

| Pricing and licensing | Community Edition | Enterprise Edition |
| ------------- | ------------- | ------------- |
| | [Get it now](https://www.onlyoffice.com/download-community.aspx?utm_source=github&utm_medium=cpc&utm_campaign=GitHubJiraCloud#docs-community)  | [Start Free Trial](https://www.onlyoffice.com/download.aspx?utm_source=github&utm_medium=cpc&utm_campaign=GitHubJiraCloud#docs-enterprise)  |
| Cost  | FREE  | [Go to the pricing page](https://www.onlyoffice.com/docs-enterprise-prices.aspx?utm_source=github&utm_medium=cpc&utm_campaign=GitHubJiraCloud)  |
| Simultaneous connections | up to 20 maximum  | As in chosen pricing plan |
| Number of users | up to 20 recommended | As in chosen pricing plan |
| License | GNU AGPL v.3 | Proprietary |
| **Support** | **Community Edition** | **Enterprise Edition** |
| Documentation | [Help Center](https://helpcenter.onlyoffice.com/docs/installation/community) | [Help Center](https://helpcenter.onlyoffice.com/docs/installation/enterprise) |
| Standard support | [GitHub](https://github.com/ONLYOFFICE/DocumentServer/issues) or paid | One or three years support included |
| Premium support | [Contact us](mailto:sales@onlyoffice.com) | [Contact us](mailto:sales@onlyoffice.com) |
| **Services** | **Community Edition** | **Enterprise Edition** |
| Conversion Service                | + | + |
| Document Builder Service          | + | + |
| **Interface** | **Community Edition** | **Enterprise Edition** |
| Tabbed interface                       | + | + |
| Dark theme                             | + | + |
| 125%, 150%, 175%, 200% scaling         | + | + |
| White Label                            | - | - |
| Integrated test example (node.js)      | + | + |
| Mobile web editors                     | - | +* |
| **Plugins & Macros** | **Community Edition** | **Enterprise Edition** |
| Plugins                           | + | + |
| Macros                            | + | + |
| **Collaborative capabilities** | **Community Edition** | **Enterprise Edition** |
| Two co-editing modes              | + | + |
| Comments                          | + | + |
| Built-in chat                     | + | + |
| Review and tracking changes       | + | + |
| Display modes of tracking changes | + | + |
| Version history                   | + | + |
| **Document Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Adding Content control          | + | + | 
| Editing Content control         | + | + | 
| Layout tools                    | + | + |
| Table of contents               | + | + |
| Navigation panel                | + | + |
| Mail Merge                      | + | + |
| Comparing Documents             | + | + |
| **Spreadsheet Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Functions, formulas, equations  | + | + |
| Table templates                 | + | + |
| Pivot tables                    | + | + |
| Data validation           | + | + |
| Conditional formatting          | + | + |
| Sparklines                   | + | + |
| Sheet Views                     | + | + |
| **Presentation Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Transitions                     | + | + |
| Animations                      | + | + |
| Presenter mode                  | + | + |
| Notes                           | + | + |
| Slide Master	                  | + | + |
| **Form creator features** | **Community Edition** | **Enterprise Edition** |
| Adding form fields           | + | + |
| Form preview                    | + | + |
| Saving as PDF                   | + | + |
| **PDF Editor features**      | **Community Edition** | **Enterprise Edition** |
| Text editing and co-editing	  | + | + |
| Work with pages (adding, deleting, rotating) | + | + |
| Inserting objects (shapes, images, hyperlinks, etc.) | + | + |
| Text annotations (highlight, underline, cross out) | + | + |
| Comments                        | + | + |
| Freehand drawings               | + | + |
| Form filling                    | + | + |
| | [Get it now](https://www.onlyoffice.com/download-community.aspx?utm_source=github&utm_medium=cpc&utm_campaign=GitHubJiraCloud#docs-community)  | [Start Free Trial](https://www.onlyoffice.com/download.aspx?utm_source=github&utm_medium=cpc&utm_campaign=GitHubJiraCloud#docs-enterprise)  |

\* If supported by DMS.

## Need help? Feedback & Support 💡

In case of technical problems, the best way to get help is to submit your issues [here](https://github.com/ONLYOFFICE/onlyoffice-jira-cloud/issues). Alternatively, you can contact ONLYOFFICE team via [community.onlyoffice.com](https://community.onlyoffice.com) or [feedback.onlyoffice.com](https://feedback.onlyoffice.com/forums/966080-your-voice-matters).