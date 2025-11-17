import * as vscode from 'vscode';
import { ClaudeService } from './claudeService';
import { SidebarProvider } from './SidebarProvider';
import { SocretesMode } from './prompts';

let claudeService: ClaudeService;
let sidebarProvider: SidebarProvider;

// Helper function to get teaching level with lock enforcement
function getEffectiveTeachingLevel(): 'strict' | 'balanced' | 'helpful' {
  const workspaceConfig = vscode.workspace.getConfiguration('socretes', null);
  const isLocked = workspaceConfig.get<boolean>('lockTeachingLevel', false);

  if (isLocked) {
    // If locked, only use workspace setting (ignore user settings)
    const workspaceLevel = workspaceConfig.inspect<string>('teachingLevel')?.workspaceValue;
    if (workspaceLevel) {
      return workspaceLevel as 'strict' | 'balanced' | 'helpful';
    }
  }

  // Not locked or no workspace setting, use whatever is configured
  return workspaceConfig.get<string>('teachingLevel', 'balanced') as 'strict' | 'balanced' | 'helpful';
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Socretes extension is now active!');

  // Initialize Claude service
  const config = vscode.workspace.getConfiguration('socretes');
  const apiKey = config.get<string>('anthropicApiKey');
  const modelName = config.get<string>('modelName');
  const instructorConstraints = config.get<string>('instructorConstraints', '');

  // Get teaching level with lock check
  const teachingLevel = getEffectiveTeachingLevel();

  claudeService = new ClaudeService(apiKey, modelName, teachingLevel, instructorConstraints);

  // Check if API key is configured
  if (!apiKey) {
    vscode.window.showWarningMessage(
      'Socretes: Please configure your Anthropic API key in settings',
      'Open Settings'
    ).then(selection => {
      if (selection === 'Open Settings') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'socretes.anthropicApiKey');
      }
    });
  }

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('socretes.anthropicApiKey')) {
        const newApiKey = vscode.workspace.getConfiguration('socretes').get<string>('anthropicApiKey');
        if (newApiKey) {
          claudeService.setApiKey(newApiKey);
        }
      }
      if (e.affectsConfiguration('socretes.modelName')) {
        const newModelName = vscode.workspace.getConfiguration('socretes').get<string>('modelName');
        if (newModelName) {
          claudeService.setModel(newModelName);
        }
      }
      if (e.affectsConfiguration('socretes.teachingLevel') || e.affectsConfiguration('socretes.lockTeachingLevel')) {
        const newTeachingLevel = getEffectiveTeachingLevel();
        claudeService.setTeachingLevel(newTeachingLevel);

        // Show message if teaching level is locked and student tried to change it
        const isLocked = vscode.workspace.getConfiguration('socretes').get<boolean>('lockTeachingLevel', false);
        if (isLocked && e.affectsConfiguration('socretes.teachingLevel')) {
          const workspaceLevel = vscode.workspace.getConfiguration('socretes').inspect<string>('teachingLevel')?.workspaceValue;
          vscode.window.showWarningMessage(
            `Teaching level is locked to "${workspaceLevel}" by your instructor and cannot be changed.`
          );
        }
      }
      if (e.affectsConfiguration('socretes.instructorConstraints')) {
        const newConstraints = vscode.workspace.getConfiguration('socretes').get<string>('instructorConstraints', '');
        claudeService.setInstructorConstraints(newConstraints);
      }
    })
  );

  // Register sidebar provider
  sidebarProvider = new SidebarProvider(context.extensionUri, claudeService);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('socretes.sidebarView', sidebarProvider)
  );

  // Listen for text selection changes and notify sidebar
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      const selectedText = e.textEditor.document.getText(e.selections[0]);
      if (selectedText && selectedText.trim().length > 0) {
        sidebarProvider.setSelectedCode(selectedText, e.textEditor.document.languageId);
      } else {
        sidebarProvider.clearSelectedCode();
      }
    })
  );

  // Helper function to get selected code
  const getSelectedCode = (): { code: string; language: string } | null => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return null;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showErrorMessage('No code selected');
      return null;
    }

    return {
      code: selectedText,
      language: editor.document.languageId
    };
  };

  // Register command: Explain This Code
  context.subscriptions.push(
    vscode.commands.registerCommand('socretes.explainCode', async () => {
      const result = getSelectedCode();
      if (result) {
        await sidebarProvider.startConversation(result.code, 'explain', result.language);
      }
    })
  );

  // Register command: Help Me Start
  context.subscriptions.push(
    vscode.commands.registerCommand('socretes.helpStart', async () => {
      const result = getSelectedCode();
      if (result) {
        await sidebarProvider.startConversation(result.code, 'start', result.language);
      }
    })
  );

  // Register command: Debug This
  context.subscriptions.push(
    vscode.commands.registerCommand('socretes.debugThis', async () => {
      const result = getSelectedCode();
      if (result) {
        await sidebarProvider.startConversation(result.code, 'debug', result.language);
      }
    })
  );

  // Register command: Review My Code
  context.subscriptions.push(
    vscode.commands.registerCommand('socretes.reviewCode', async () => {
      const result = getSelectedCode();
      if (result) {
        await sidebarProvider.startConversation(result.code, 'review', result.language);
      }
    })
  );

  // Register command: Open Sidebar
  context.subscriptions.push(
    vscode.commands.registerCommand('socretes.openSidebar', () => {
      vscode.commands.executeCommand('socretes.sidebarView.focus');
    })
  );

  // Register command: New Session
  context.subscriptions.push(
    vscode.commands.registerCommand('socretes.newSession', () => {
      claudeService.clearConversation();
      vscode.window.showInformationMessage('Socretes: New session started');
    })
  );
}

export function deactivate() {
  // Cleanup if needed
}
