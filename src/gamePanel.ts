import * as vscode from 'vscode';
import * as path from 'path';
import { CommandExecutor } from './commandExecutor';

export class GamePanel {
    public static currentPanel: GamePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private commandExecutor: CommandExecutor;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this.commandExecutor = new CommandExecutor(context);

        // Set webview content
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                this._handleMessage(message);
            },
            null,
            this._disposables
        );

        // Handle panel disposal
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow(context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (GamePanel.currentPanel) {
            GamePanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'lobsterGame',
            'Lobster Game',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'out', 'webview')
                ],
                retainContextWhenHidden: true
            }
        );

        GamePanel.currentPanel = new GamePanel(panel, context.extensionUri, context);
    }

    private async _handleMessage(message: any) {
        switch (message.type) {
            case 'executeCommand':
                await this.commandExecutor.executeCommand(message.command);
                this._panel.webview.postMessage({ type: 'commandComplete', success: true });
                break;
            
            case 'showSubmenu':
                // For submenus, we could show a quickpick, but for now execute directly
                const selection = await vscode.window.showQuickPick(message.options, {
                    placeHolder: `Select ${message.counter} command`
                });
                if (selection) {
                    this._panel.webview.postMessage({ 
                        type: 'submenuResponse', 
                        selection: selection 
                    });
                }
                break;
            
            case 'checkPackage':
                await this.commandExecutor.checkPackage();
                break;
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'game.js')
        );

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';">
    <title>Lobster Game</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
        }
        #game-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
        #hud {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
        }
        #interaction-prompt {
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            display: none;
        }
        #interaction-prompt.visible {
            display: block;
        }
        #dialogue-box {
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            max-width: 90%;
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 12px;
            color: white;
            display: none;
        }
        #dialogue-box.visible {
            display: block;
        }
        #dialogue-box h2 {
            margin: 0 0 10px 0;
            color: #29abe2;
        }
        #dialogue-box p {
            margin: 0 0 20px 0;
            line-height: 1.5;
        }
        .dialogue-option {
            padding: 10px 15px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .dialogue-option:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: #29abe2;
        }
        #input-dialogue-box {
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            width: 500px;
            max-width: 90%;
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 12px;
            color: white;
            display: none;
        }
        #input-dialogue-box.visible {
            display: block;
        }
        #input-dialogue-box h2 {
            margin: 0 0 10px 0;
            color: #29abe2;
        }
        #input-dialogue-box p {
            margin: 0 0 15px 0;
            line-height: 1.5;
        }
        #input-dialogue-input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            color: white;
            font-size: 16px;
            font-family: var(--vscode-font-family);
            box-sizing: border-box;
        }
        #input-dialogue-input:focus {
            outline: none;
            border-color: #29abe2;
            background: rgba(255, 255, 255, 0.15);
        }
        #input-dialogue-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        .input-dialogue-buttons {
            display: flex;
            gap: 10px;
        }
        .input-dialogue-button {
            flex: 1;
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            color: white;
        }
        .input-dialogue-button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: #29abe2;
        }
        .input-dialogue-button.submit {
            background: rgba(41, 171, 226, 0.3);
            border-color: #29abe2;
        }
        .input-dialogue-button.submit:hover {
            background: rgba(41, 171, 226, 0.5);
        }
        #controls-info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px 15px;
            border-radius: 8px;
            color: white;
            font-size: 12px;
        }
        #controls-info kbd {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <canvas id="game-canvas"></canvas>
    
    <div id="hud">
        <div>Command Counters Available</div>
        <div id="counter-list"></div>
    </div>

    <div id="interaction-prompt">
        Press <kbd>E</kbd> to interact
    </div>

    <div id="dialogue-box">
        <h2 id="dialogue-title"></h2>
        <p id="dialogue-text"></p>
        <div id="dialogue-options"></div>
    </div>

    <div id="input-dialogue-box">
        <h2 id="input-dialogue-title"></h2>
        <p id="input-dialogue-text"></p>
        <input type="text" id="input-dialogue-input" placeholder="Enter code..." />
        <div class="input-dialogue-buttons">
            <div id="input-dialogue-submit" class="input-dialogue-button submit">Submit</div>
            <div id="input-dialogue-cancel" class="input-dialogue-button">Cancel</div>
        </div>
    </div>

    <div id="controls-info">
        <p><kbd>W/A/S/D</kbd> Move | <kbd>E</kbd> Interact | <kbd>Mouse</kbd> Look</p>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    public dispose() {
        GamePanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
