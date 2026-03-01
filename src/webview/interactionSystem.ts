import { Counters, Counter } from './counters';
import { Lobster } from './lobster';
import { UI } from './ui';

export class InteractionSystem {
    private counters: Counters;
    private lobster: Lobster;
    private ui: UI;
    private dialogueActive: boolean = false;
    private currentCounter: Counter | null = null;

    constructor(counters: Counters, lobster: Lobster, ui: UI) {
        this.counters = counters;
        this.lobster = lobster;
        this.ui = ui;
    }

    public update(nearestCounter: Counter | null): void {
        // Show/hide interaction prompt
        if (nearestCounter && !this.dialogueActive) {
            this.ui.showInteractionPrompt(true);
            
            // Check for interact key
            if (this.lobster.isInteracting()) {
                this.lobster.resetInteract();
                this.startInteraction(nearestCounter);
            }
        } else if (!this.dialogueActive) {
            this.ui.showInteractionPrompt(false);
        }
    }

    private startInteraction(counter: Counter): void {
        this.currentCounter = counter;
        this.dialogueActive = true;

        // Check if commands is an array or object
        if (Array.isArray(counter.commands)) {
            // Single command - execute directly
            const command = counter.commands[0];
            if (command === 'check-package') {
                this.ui.sendCheckPackage();
                this.endInteraction();
            } else {
                this.ui.sendCommand(command);
                this.endInteraction();
            }
        } else {
            // Multiple commands - show menu
            const options = Object.keys(counter.commands).map(key => ({
                text: key,
                action: () => this.executeCounterCommand(key)
            }));

            options.push({
                text: 'Cancel',
                action: () => this.endInteraction()
            });

            this.ui.showDialogue(
                counter.name,
                counter.description,
                options
            );
        }
    }

    private executeCounterCommand(commandKey: string): void {
        if (!this.currentCounter || Array.isArray(this.currentCounter.commands)) {
            return;
        }

        const command = this.currentCounter.commands[commandKey];
        
        if (command === 'pairing-menu') {
            // Special handling for pairing menu
            this.ui.showDialogue(
                'Pairing Menu',
                'Select an app to pair',
                [
                    { text: 'Telegram', action: () => this.executePairing('telegram') },
                    { text: 'WhatsApp', action: () => this.executePairing('whatsapp') },
                    { text: 'Signal', action: () => this.executePairing('signal') },
                    { text: 'Discord', action: () => this.executePairing('discord') },
                    { text: 'Slack', action: () => this.executePairing('slack') },
                    { text: 'Cancel', action: () => this.endInteraction() }
                ]
            );
        } else if (command.startsWith('upgrade-')) {
            // Handle upgrade commands
            this.executeUpgrade(command, commandKey);
        } else if (command.startsWith('crab-talk-')) {
            // Handle crab talk commands
            this.executeCrabTalk(command);
        } else {
            this.ui.sendCommand(command);
            this.endInteraction();
        }
    }

    private executePairing(app: string): void {
        // Show input dialog to collect pairing code
        this.ui.showInputDialogue(
            'Pairing Code',
            `Enter the pairing code for ${app}:`,
            'Enter code...',
            (code: string) => {
                // Submit with the code
                this.ui.sendCommand(`openclaw pairing approve ${app} ${code}`);
                this.endInteraction();
            },
            () => {
                // Cancel - go back to interaction
                this.endInteraction();
            }
        );
    }

    private endInteraction(): void {
        this.dialogueActive = false;
        this.currentCounter = null;
        this.ui.hideDialogue();
    }

    public isDialogueActive(): boolean {
        return this.dialogueActive;
    }

    private executeUpgrade(command: string, skillName: string): void {
        const upgradeMessages: { [key: string]: { title: string, message: string } } = {
            'upgrade-sql': {
                title: 'SQL Mastery Unlocked!',
                message: 'You\'ve learned advanced SQL querying! Your lobster can now write complex queries, optimize database performance, and understand data relationships.'
            },
            'upgrade-analytics': {
                title: 'Analytics Expert!',
                message: 'Analytics skills upgraded! You can now perform advanced data analysis, create insights, and build powerful dashboards.'
            },
            'upgrade-pipeline': {
                title: 'Pipeline Builder!',
                message: 'Data pipeline skills acquired! You can now design ETL processes, manage data flows, and automate data transformations.'
            },
            'upgrade-api': {
                title: 'API Specialist!',
                message: 'API integration mastered! You can now connect to any REST API, handle webhooks, and build seamless integrations.'
            },
            'upgrade-webhooks': {
                title: 'Webhook Master!',
                message: 'Webhook skills unlocked! You can now set up real-time event notifications and automate workflows.'
            },
            'upgrade-integrations': {
                title: 'Integration Expert!',
                message: 'Integration skills maxed out! You can now connect hundreds of apps and services together effortlessly.'
            },
            'upgrade-web3': {
                title: 'Web3 Pioneer!',
                message: 'Web3 skills acquired! You can now work with blockchain, cryptocurrencies, and decentralized applications.'
            },
            'upgrade-contracts': {
                title: 'Smart Contract Developer!',
                message: 'Smart contract skills unlocked! You can now write, deploy, and interact with blockchain smart contracts.'
            },
            'upgrade-payments': {
                title: 'Payment Protocol Master!',
                message: 'Payment integration complete! You can now handle crypto payments, stablecoins, and cross-chain transactions.'
            },
            'upgrade-agents': {
                title: 'AI Agent Creator!',
                message: 'AI agent skills unlocked! You can now build intelligent agents that work together to solve complex problems.'
            },
            'upgrade-orchestration': {
                title: 'Orchestration Master!',
                message: 'Multi-agent orchestration mastered! You can now coordinate teams of AI agents to accomplish any task.'
            },
            'upgrade-automation': {
                title: 'Automation Expert!',
                message: 'Automation skills maxed out! You can now automate complex workflows and build self-managing systems.'
            }
        };

        const upgrade = upgradeMessages[command] || {
            title: 'Skill Upgraded!',
            message: `${skillName} has been enhanced!`
        };

        this.ui.showDialogue(
            upgrade.title,
            upgrade.message,
            [
                { text: 'Awesome!', action: () => this.endInteraction() }
            ]
        );
    }

    private executeCrabTalk(command: string): void {
        const crabDialogues: { [key: string]: { greeting: string, message: string } } = {
            'crab-talk-snowflake': {
                greeting: '🦀 Snowflake Crab says:',
                message: 'Greetings, young lobster! I am the guardian of data warehouses. Master SQL, analytics, and pipelines to unlock the true power of data. The cloud data platform awaits your mastery!'
            },
            'crab-talk-composio': {
                greeting: '🦀 Composio Crab says:',
                message: 'Hello there! I\'ve connected thousands of systems together. With my knowledge of APIs and webhooks, you can integrate anything with anything. Let\'s build bridges between platforms!'
            },
            'crab-talk-skyfire': {
                greeting: '🦀 Skyfire Crab says:',
                message: 'Welcome, adventurer! The future of payments is decentralized. Learn Web3, smart contracts, and payment protocols to navigate the blockchain seas. Let\'s revolutionize transactions!'
            },
            'crab-talk-crewai': {
                greeting: '🦀 CrewAI Crab says:',
                message: 'Greetings! I orchestrate teams of AI agents working in harmony. Learn to build, coordinate, and automate with multiple intelligent agents. Together, we accomplish the impossible!'
            }
        };

        const dialogue = crabDialogues[command] || {
            greeting: '🦀 Wise Crab says:',
            message: 'Keep learning and growing, young lobster!'
        };

        this.ui.showDialogue(
            dialogue.greeting,
            dialogue.message,
            [
                { text: 'Thank you!', action: () => this.endInteraction() },
                { text: 'Tell me more', action: () => this.showCrabLore(command) }
            ]
        );
    }

    private showCrabLore(command: string): void {
        const loreMessages: { [key: string]: string } = {
            'crab-talk-snowflake': 'Snowflake is the data cloud - a modern platform built for all your data and applications. With near-unlimited scale and concurrency, it empowers data engineers, scientists, and analysts to collaborate seamlessly.',
            'crab-talk-composio': 'Composio enables you to integrate your AI agents with 100+ tools. From GitHub to Slack, Gmail to Google Sheets - connect your agents to the entire software ecosystem effortlessly.',
            'crab-talk-skyfire': 'Skyfire is pioneering AI payment rails for the internet. Enable autonomous AI agents to make payments, access paid APIs, and transact seamlessly in the digital economy.',
            'crab-talk-crewai': 'CrewAI is a framework for orchestrating autonomous AI agents. Create crews of specialized agents that collaborate, delegate tasks, and work together like a well-coordinated team.'
        };

        const lore = loreMessages[command] || 'The path to mastery requires dedication and practice.';

        this.ui.showDialogue(
            'Ancient Knowledge',
            lore,
            [
                { text: 'Fascinating!', action: () => this.endInteraction() }
            ]
        );
    }
}
