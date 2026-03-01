import { Counter } from './counters';
import { Lobster } from './lobster';

// Declare vscode API
declare const acquireVsCodeApi: any;

export class UI {
    private interactionPrompt: HTMLElement;
    private dialogueBox: HTMLElement;
    private dialogueTitle: HTMLElement;
    private dialogueText: HTMLElement;
    private dialogueOptions: HTMLElement;
    private inputDialogueBox: HTMLElement;
    private inputDialogueTitle: HTMLElement;
    private inputDialogueText: HTMLElement;
    private inputDialogueInput: HTMLInputElement;
    private inputDialogueSubmit: HTMLElement;
    private inputDialogueCancel: HTMLElement;
    private vscode: any;

    constructor() {
        this.interactionPrompt = document.getElementById('interaction-prompt')!;
        this.dialogueBox = document.getElementById('dialogue-box')!;
        this.dialogueTitle = document.getElementById('dialogue-title')!;
        this.dialogueText = document.getElementById('dialogue-text')!;
        this.dialogueOptions = document.getElementById('dialogue-options')!;
        this.inputDialogueBox = document.getElementById('input-dialogue-box')!;
        this.inputDialogueTitle = document.getElementById('input-dialogue-title')!;
        this.inputDialogueText = document.getElementById('input-dialogue-text')!;
        this.inputDialogueInput = document.getElementById('input-dialogue-input')! as HTMLInputElement;
        this.inputDialogueSubmit = document.getElementById('input-dialogue-submit')!;
        this.inputDialogueCancel = document.getElementById('input-dialogue-cancel')!;
        
        // Acquire VS Code API
        this.vscode = acquireVsCodeApi();
    }

    public showInteractionPrompt(show: boolean): void {
        if (show) {
            this.interactionPrompt.classList.add('visible');
        } else {
            this.interactionPrompt.classList.remove('visible');
        }
    }

    public showDialogue(title: string, text: string, options: Array<{ text: string, action: () => void }>): void {
        this.dialogueTitle.textContent = title;
        this.dialogueText.textContent = text;
        this.dialogueOptions.innerHTML = '';

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dialogue-option';
            optionDiv.textContent = option.text;
            optionDiv.onclick = option.action;
            this.dialogueOptions.appendChild(optionDiv);
        });

        this.dialogueBox.classList.add('visible');
    }

    public hideDialogue(): void {
        this.dialogueBox.classList.remove('visible');
    }

    public showInputDialogue(title: string, text: string, placeholder: string, onSubmit: (value: string) => void, onCancel: () => void): void {
        this.inputDialogueTitle.textContent = title;
        this.inputDialogueText.textContent = text;
        this.inputDialogueInput.value = '';
        this.inputDialogueInput.placeholder = placeholder;

        // Remove previous event listeners by cloning elements
        const newSubmit = this.inputDialogueSubmit.cloneNode(true) as HTMLElement;
        const newCancel = this.inputDialogueCancel.cloneNode(true) as HTMLElement;
        this.inputDialogueSubmit.replaceWith(newSubmit);
        this.inputDialogueCancel.replaceWith(newCancel);
        this.inputDialogueSubmit = newSubmit;
        this.inputDialogueCancel = newCancel;

        // Add event listeners
        this.inputDialogueSubmit.onclick = () => {
            const value = this.inputDialogueInput.value.trim();
            if (value) {
                this.hideInputDialogue();
                onSubmit(value);
            }
        };

        this.inputDialogueCancel.onclick = () => {
            this.hideInputDialogue();
            onCancel();
        };

        // Handle Enter key
        this.inputDialogueInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const value = this.inputDialogueInput.value.trim();
                if (value) {
                    this.hideInputDialogue();
                    onSubmit(value);
                }
            } else if (e.key === 'Escape') {
                this.hideInputDialogue();
                onCancel();
            }
        };

        this.inputDialogueBox.classList.add('visible');
        this.inputDialogueInput.focus();
    }

    public hideInputDialogue(): void {
        this.inputDialogueBox.classList.remove('visible');
    }

    public sendCommand(command: string): void {
        this.vscode.postMessage({
            type: 'executeCommand',
            command: command
        });
    }

    public sendCheckPackage(): void {
        this.vscode.postMessage({
            type: 'checkPackage'
        });
    }

    public sendShowSubmenu(counter: string, options: string[]): void {
        this.vscode.postMessage({
            type: 'showSubmenu',
            counter: counter,
            options: options
        });
    }
}
