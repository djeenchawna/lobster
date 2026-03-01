import * as THREE from 'three';
import { Lobster } from './lobster';

export interface Counter {
    name: string;
    position: THREE.Vector3;
    color: number;
    description: string;
    commands: string[] | { [key: string]: string };
    group: THREE.Group;
    ring: THREE.Mesh;
    label: THREE.Mesh;
}

export class Counters {
    private scene: THREE.Scene;
    private lobster: Lobster;
    private counters: Counter[] = [];
    private interactionRange: number = 3.0;

    constructor(scene: THREE.Scene, lobster: Lobster) {
        this.scene = scene;
        this.lobster = lobster;
        
        this.createCounters();
    }

    private createCounters(): void {
        const counterData = [
            {
                name: 'Dashboard',
                position: new THREE.Vector3(-20, 0, -15),
                color: 0x29abe2,
                description: 'Open OpenClaw Dashboard',
                commands: ['openclaw dashboard'],
                isCrab: false
            },
            {
                name: 'Checker',
                position: new THREE.Vector3(20, 0, -15),
                color: 0x9c27b0,
                description: 'Check OpenClaw Package',
                commands: ['check-package'],
                isCrab: false
            },
            {
                name: 'Setup',
                position: new THREE.Vector3(-20, 0, 15),
                color: 0xff6b35,
                description: 'Setup and Configuration',
                commands: {
                    'Onboard': 'openclaw onboard',
                    'Pair up': 'pairing-menu',
                    'Doctor': 'openclaw doctor',
                    'Fix': 'openclaw doctor --fix',
                    'Console': 'openclaw tui'
                },
                isCrab: false
            },
            {
                name: 'Gateway',
                position: new THREE.Vector3(20, 0, 15),
                color: 0x00c853,
                description: 'Gateway Management',
                commands: {
                    'Run': 'openclaw gateway run',
                    'Status': 'openclaw gateway status',
                    'Start': 'openclaw gateway start',
                    'Stop': 'openclaw gateway stop',
                    'Restart': 'openclaw gateway restart'
                },
                isCrab: false
            },
            {
                name: 'Terminal',
                position: new THREE.Vector3(0, 0, -5),
                color: 0xffd700,
                description: 'Open Magnet Terminal',
                commands: ['ggc oc'],
                isCrab: false
            },
            // Checkpoint Crabs
            {
                name: 'Snowflake',
                position: new THREE.Vector3(-35, 0, -35),
                color: 0x56CCF2,
                description: 'Snowflake Crab - Data Warehouse Master',
                commands: {
                    'Learn SQL': 'upgrade-sql',
                    'Master Analytics': 'upgrade-analytics',
                    'Data Pipeline': 'upgrade-pipeline',
                    'Talk': 'crab-talk-snowflake'
                },
                isCrab: true
            },
            {
                name: 'Composio',
                position: new THREE.Vector3(35, 0, -35),
                color: 0xFF6B9D,
                description: 'Composio Crab - Integration Specialist',
                commands: {
                    'API Skills': 'upgrade-api',
                    'Webhooks': 'upgrade-webhooks',
                    'Integrations': 'upgrade-integrations',
                    'Talk': 'crab-talk-composio'
                },
                isCrab: true
            },
            {
                name: 'Skyfire',
                position: new THREE.Vector3(-35, 0, 35),
                color: 0xFFA500,
                description: 'Skyfire Crab - Payment Protocol Expert',
                commands: {
                    'Web3 Skills': 'upgrade-web3',
                    'Smart Contracts': 'upgrade-contracts',
                    'Payments': 'upgrade-payments',
                    'Talk': 'crab-talk-skyfire'
                },
                isCrab: true
            },
            {
                name: 'CrewAI',
                position: new THREE.Vector3(35, 0, 35),
                color: 0x9D4EDD,
                description: 'CrewAI Crab - Multi-Agent Orchestrator',
                commands: {
                    'AI Agents': 'upgrade-agents',
                    'Orchestration': 'upgrade-orchestration',
                    'Automation': 'upgrade-automation',
                    'Talk': 'crab-talk-crewai'
                },
                isCrab: true
            }
        ];

        counterData.forEach(data => {
            const counter = this.createCounter(data);
            this.counters.push(counter);
        });
    }

    private createCounter(data: any): Counter {
        const counterGroup = new THREE.Group();

        if (data.isCrab) {
            // Create crab character instead of counter
            this.createCrab(counterGroup, data.color);
        } else {
            // Regular counter
            // Counter base
            const baseGeometry = new THREE.BoxGeometry(3, 1.5, 2);
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: 0x555555,
                roughness: 0.5
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.75;
            base.castShadow = true;
            counterGroup.add(base);

            // Counter top (colored)
            const topGeometry = new THREE.BoxGeometry(3.2, 0.2, 2.2);
            const topMaterial = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.3,
                metalness: 0.5
            });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 1.6;
            top.castShadow = true;
            counterGroup.add(top);

            // Glowing indicator
            const indicatorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1);
            const indicatorMaterial = new THREE.MeshStandardMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.5
            });
            const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
            indicator.position.y = 1.75;
            counterGroup.add(indicator);

            // Point light for glow
            const pointLight = new THREE.PointLight(data.color, 1, 10);
            pointLight.position.y = 2;
            counterGroup.add(pointLight);
        }

        // Animated ring
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.1;
        counterGroup.add(ring);

        // Label - larger and double-sided for visibility from any angle
        const labelGeometry = new THREE.PlaneGeometry(4, 1);
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = '#' + data.color.toString(16).padStart(6, '0');
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.name, 512, 128);
        
        const labelTexture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: labelTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(0, 3.5, 0);
        counterGroup.add(label);

        counterGroup.position.copy(data.position);
        this.scene.add(counterGroup);

        return {
            name: data.name,
            position: data.position,
            color: data.color,
            description: data.description,
            commands: data.commands,
            group: counterGroup,
            ring: ring,
            label: label
        };
    }

    public update(): Counter | null {
        const lobsterPos = this.lobster.getPosition();
        let nearestCounter = null;
        let minDistance = Infinity;

        this.counters.forEach(counter => {
            const distance = lobsterPos.distanceTo(counter.position);
            
            // Animate ring
            counter.ring.rotation.z += 0.01;
            counter.ring.position.y = 0.1 + Math.sin(Date.now() * 0.002) * 0.2;
            
            // Slowly rotate label for visibility from any angle
            counter.label.rotation.y += 0.005;

            if (distance < this.interactionRange) {
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCounter = counter;
                }
            }
        });

        return nearestCounter;
    }

    public getCounters(): Counter[] {
        return this.counters;
    }

    private createCrab(group: THREE.Group, color: number): void {
        // Crab body (main shell)
        const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        bodyGeometry.scale(1.5, 0.8, 1.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.4, 1.4, 0.8);
        leftEye.castShadow = true;
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.4, 1.4, 0.8);
        rightEye.castShadow = true;
        group.add(rightEye);

        // Eye pupils
        const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const pupilMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.4, 1.4, 0.95);
        group.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.4, 1.4, 0.95);
        group.add(rightPupil);

        // Claws (pincers)
        const clawMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.2
        });

        // Left claw
        const leftClawBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8),
            clawMaterial
        );
        leftClawBase.position.set(-1.2, 0.8, 0.5);
        leftClawBase.rotation.z = Math.PI / 4;
        leftClawBase.castShadow = true;
        group.add(leftClawBase);

        const leftClawPincer = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.2),
            clawMaterial
        );
        leftClawPincer.position.set(-1.6, 1.1, 0.5);
        leftClawPincer.castShadow = true;
        group.add(leftClawPincer);

        // Right claw
        const rightClawBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8),
            clawMaterial
        );
        rightClawBase.position.set(1.2, 0.8, 0.5);
        rightClawBase.rotation.z = -Math.PI / 4;
        rightClawBase.castShadow = true;
        group.add(rightClawBase);

        const rightClawPincer = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.2),
            clawMaterial
        );
        rightClawPincer.position.set(1.6, 1.1, 0.5);
        rightClawPincer.castShadow = true;
        group.add(rightClawPincer);

        // Legs (4 pairs = 8 legs)
        const legMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color).multiplyScalar(0.8),
            roughness: 0.6
        });

        const legPositions = [
            { x: -0.9, z: 0.3 },
            { x: -0.9, z: -0.1 },
            { x: -0.9, z: -0.5 },
            { x: -0.9, z: -0.9 },
            { x: 0.9, z: 0.3 },
            { x: 0.9, z: -0.1 },
            { x: 0.9, z: -0.5 },
            { x: 0.9, z: -0.9 }
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6),
                legMaterial
            );
            leg.position.set(pos.x, 0.5, pos.z);
            leg.rotation.z = pos.x < 0 ? Math.PI / 3 : -Math.PI / 3;
            leg.castShadow = true;
            group.add(leg);

            // Leg extension
            const legExt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6),
                legMaterial
            );
            const extX = pos.x < 0 ? pos.x - 0.4 : pos.x + 0.4;
            legExt.position.set(extX, 0.2, pos.z);
            legExt.rotation.z = pos.x < 0 ? -Math.PI / 6 : Math.PI / 6;
            legExt.castShadow = true;
            group.add(legExt);
        });

        // Glow effect around crab
        const glowLight = new THREE.PointLight(color, 1.5, 8);
        glowLight.position.y = 1.5;
        group.add(glowLight);
    }
}
