import Anthropic from '@anthropic-ai/sdk';
import { SocretesMode, MODE_CONFIGS, detectFrustration, getHintInstruction, TeachingLevel, adjustPromptForTeachingLevel } from './prompts';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class ClaudeService {
  private client: Anthropic | null = null;
  private conversationHistory: Message[] = [];
  private currentMode: SocretesMode = 'explain';
  private modelName: string = 'claude-sonnet-4-5-20250929';
  private frustrationCount: number = 0;
  private teachingLevel: TeachingLevel = 'balanced';
  private instructorConstraints: string = '';

  constructor(apiKey?: string, modelName?: string, teachingLevel?: TeachingLevel, instructorConstraints?: string) {
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
    if (modelName) {
      this.modelName = modelName;
    }
    if (teachingLevel) {
      this.teachingLevel = teachingLevel;
    }
    if (instructorConstraints) {
      this.instructorConstraints = instructorConstraints;
    }
  }

  setApiKey(apiKey: string): void {
    this.client = new Anthropic({ apiKey });
  }

  setModel(modelName: string): void {
    this.modelName = modelName;
  }

  setTeachingLevel(level: TeachingLevel): void {
    this.teachingLevel = level;
  }

  setInstructorConstraints(constraints: string): void {
    this.instructorConstraints = constraints;
  }

  setMode(mode: SocretesMode): void {
    this.currentMode = mode;
  }

  getMode(): SocretesMode {
    return this.currentMode;
  }

  getConversationHistory(): Message[] {
    return [...this.conversationHistory];
  }

  clearConversation(): void {
    this.conversationHistory = [];
    this.frustrationCount = 0;
  }

  async startConversation(code: string, mode: SocretesMode, language?: string): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API key not configured. Please set your Anthropic API key in settings.');
    }

    this.currentMode = mode;
    this.conversationHistory = [];
    this.frustrationCount = 0;

    const config = MODE_CONFIGS[mode];
    const initialMessage = config.initialMessage(code, language);

    // Add initial message to history
    this.conversationHistory.push({
      role: 'assistant',
      content: initialMessage
    });

    return initialMessage;
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API key not configured. Please set your Anthropic API key in settings.');
    }

    // Check for frustration
    const isFrustrated = detectFrustration(userMessage);
    if (isFrustrated) {
      this.frustrationCount++;
    } else {
      this.frustrationCount = 0;
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Build system prompt with teaching level and frustration hint if needed
    let systemPrompt = adjustPromptForTeachingLevel(
      MODE_CONFIGS[this.currentMode].systemPrompt,
      this.teachingLevel
    );

    // Add instructor constraints if present
    if (this.instructorConstraints && this.instructorConstraints.trim()) {
      systemPrompt += `\n\nINSTRUCTOR CONSTRAINTS (MUST FOLLOW STRICTLY):\n${this.instructorConstraints}`;
    }

    if (this.frustrationCount >= 2) {
      systemPrompt += `\n\nIMPORTANT: ${getHintInstruction(this.currentMode)}`;
    }

    try {
      // Call Claude API
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 1024,
        system: systemPrompt,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const assistantMessage = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;
    } catch (error) {
      // Remove the user message from history if API call failed
      this.conversationHistory.pop();

      if (error instanceof Error) {
        throw new Error(`Claude API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling Claude API');
    }
  }

  exportConversation(): string {
    const config = MODE_CONFIGS[this.currentMode];
    let markdown = `# Socretes Conversation - ${config.name}\n\n`;
    markdown += `Mode: ${config.name}\n`;
    markdown += `Date: ${new Date().toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    for (const message of this.conversationHistory) {
      if (message.role === 'user') {
        markdown += `## Student\n\n${message.content}\n\n`;
      } else {
        markdown += `## Socretes\n\n${message.content}\n\n`;
      }
    }

    return markdown;
  }
}
