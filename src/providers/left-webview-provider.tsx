import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window } from "vscode";
import { Utils } from "utils";
import LeftPanel from 'components/LeftPanel';
import * as ReactDOMServer from "react-dom/server";

export class LeftPanelWebview implements WebviewViewProvider {
    private _view: WebviewView | null = null;
    private _imageUris: string[] = [];
    private _selectedImageUri: string = '';

	constructor(
		private readonly extensionPath: Uri,
		private data: any,
	) {}

    private readonly _onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<any | undefined | null | void>();

    refresh(): void {
        this._onDidChangeTreeData.fire(null);
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        }
    }

	// Called when a view first becomes visible
	resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionPath],
		};
		this._view = webviewView;
        this._view.webview.html = this._getHtmlForWebview(this._view.webview);
		this.activateMessageListener();
	}

	private activateMessageListener() {
		this._view?.webview.onDidReceiveMessage((message) => {
			switch (message.action){
				case 'SHOW_WARNING_LOG':
					window.showWarningMessage(message.data.message);
					break;
				default:
					break;
			}
		});
	}

	private _getRandomImageUri(): string {
		const imageUris = [
			"wolf2.png",
			// Add more images as needed
		].map(image => this._view!.webview.asWebviewUri(Uri.joinPath(this.extensionPath, "assets", image)).toString());

		const randomIndex = Math.floor(Math.random() * imageUris.length);
		return imageUris[randomIndex];
	}

	private _getHtmlForWebview(webview: Webview) {
		// Select a random image URI if not already set
		if (!this._selectedImageUri) {
			this._selectedImageUri = this._getRandomImageUri();
		}

		// Script to handle user action
		const scriptUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionPath, "script", "left-webview-provider.js")
		);
		const constantUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionPath, "script", "constant.js")
		);
		// CSS file to handle styling
		const styleUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionPath, "script", "left-webview-provider.css")
		);

		// vscode-icon file from codicon lib
		const codiconsUri = webview.asWebviewUri(
			Uri.joinPath(this.extensionPath, "script", "codicon.css")
		);

		// Use a nonce to only allow a specific script to be run.
		const nonce = Utils.getNonce();

		return `<html>
                <head>
                    <meta charSet="utf-8"/>
                    <meta http-equiv="Content-Security-Policy" 
                            content="default-src 'none';
                            img-src vscode-resource: https:;
                            font-src ${webview.cspSource};
                            style-src ${webview.cspSource} 'unsafe-inline';
                            script-src 'nonce-${nonce}'
							
							;">             

                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${codiconsUri}" rel="stylesheet" />
                    <link href="${styleUri}" rel="stylesheet">

                </head>
                <body>
                    ${
                        ReactDOMServer.renderToString((
							<LeftPanel 
								message={"OwO"} 
								additionalText={""}
								imageUri={this._selectedImageUri}
							/>
						))
                    }
					<script nonce="${nonce}" type="text/javascript" src="${constantUri}"></script>
					<script nonce="${nonce}" src="${scriptUri}"></script>
				</body>
            </html>`;
	}
}
