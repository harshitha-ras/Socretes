import * as vscode from 'vscode';
import { ClaudeService } from './claudeService';
import { SocretesMode, MODE_CONFIGS } from './prompts';

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  private selectedCode: string = '';
  private selectedLanguage: string = '';

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private claudeService: ClaudeService
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage': {
          try {
            let userMessage = data.message;

            // If there's selected code and no conversation yet, include it
            if (this.selectedCode && this.claudeService.getConversationHistory().length === 0) {
              userMessage = `I have this ${this.selectedLanguage} code:\n\n\`\`\`${this.selectedLanguage}\n${this.selectedCode}\n\`\`\`\n\n${data.message}`;

              // Clear selected code after using it
              this.selectedCode = '';
              this.selectedLanguage = '';

              // Notify webview to clear indicator
              webviewView.webview.postMessage({
                type: 'codeContextCleared'
              });
            }

            const response = await this.claudeService.sendMessage(userMessage);
            webviewView.webview.postMessage({
              type: 'assistantMessage',
              message: response
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            webviewView.webview.postMessage({
              type: 'error',
              message: errorMessage
            });
          }
          break;
        }
        case 'changeMode': {
          this.claudeService.setMode(data.mode);
          webviewView.webview.postMessage({
            type: 'modeChanged',
            mode: data.mode
          });
          break;
        }
        case 'newSession': {
          this.claudeService.clearConversation();
          webviewView.webview.postMessage({
            type: 'sessionCleared'
          });
          break;
        }
        case 'exportConversation': {
          const markdown = this.claudeService.exportConversation();
          const doc = await vscode.workspace.openTextDocument({
            content: markdown,
            language: 'markdown'
          });
          await vscode.window.showTextDocument(doc);
          break;
        }
        case 'clearCodeSelection': {
          this.clearSelectedCode();
          break;
        }
      }
    });
  }

  public async startConversation(code: string, mode: SocretesMode, language?: string) {
    try {
      const initialMessage = await this.claudeService.startConversation(code, mode, language);

      this._view?.webview.postMessage({
        type: 'conversationStarted',
        mode: mode,
        message: initialMessage,
        code: code,
        language: language
      });

      // Show the sidebar if it's not visible
      if (this._view) {
        this._view.show?.(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(errorMessage);

      this._view?.webview.postMessage({
        type: 'error',
        message: errorMessage
      });
    }
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  public setSelectedCode(code: string, language: string) {
    this.selectedCode = code;
    this.selectedLanguage = language;

    // Notify webview that code is selected
    this._view?.webview.postMessage({
      type: 'codeSelected',
      code: code,
      language: language
    });
  }

  public clearSelectedCode() {
    this.selectedCode = '';
    this.selectedLanguage = '';

    // Notify webview
    this._view?.webview.postMessage({
      type: 'codeContextCleared'
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleResetUri}" rel="stylesheet">
  <link href="${styleVSCodeUri}" rel="stylesheet">
  <link href="${styleMainUri}" rel="stylesheet">
  <title>Socretes</title>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div>
          <h2>Socretes</h2>
          <p class="subtitle">Your Socratic Coding Tutor</p>
        </div>
        <button id="newSessionBtn" class="new-session-btn" title="Start New Session">+</button>
      </div>
    </div>

    <div class="mode-selector">
      <button class="mode-btn" data-mode="explain">📖 Explain</button>
      <button class="mode-btn" data-mode="start">🚀 Start</button>
      <button class="mode-btn" data-mode="debug">🐛 Debug</button>
      <button class="mode-btn" data-mode="review">✨ Review</button>
    </div>

    <div id="conversation" class="conversation">
      <div class="welcome-message">
        <h3>Welcome to Socretes!</h3>
        <p>Select some code and choose a mode from the right-click menu to begin:</p>
        <ul>
          <li><strong>Explain This Code</strong> - Understand code through guided questions</li>
          <li><strong>Help Me Start</strong> - Get help planning your assignment</li>
          <li><strong>Debug This</strong> - Find bugs through Socratic questioning</li>
          <li><strong>Review My Code</strong> - Improve your working solution</li>
        </ul>
      </div>
    </div>

    <div class="input-container">
      <div id="codeIndicator" class="code-indicator" style="display: none;">
        <span class="indicator-text">📎 Code selected</span>
        <button id="clearCodeBtn" class="clear-code-btn">×</button>
      </div>
      <textarea
        id="userInput"
        class="user-input"
        placeholder="Select code in editor and type your question here..."
        rows="3"
      ></textarea>
      <div class="button-group">
        <button id="exportBtn" class="secondary-btn">Export Conversation</button>
      </div>
    </div>
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
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
