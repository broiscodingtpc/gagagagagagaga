import fs from 'fs';
import path from 'path';

interface PersonaLayer {
  name: string;
  description: string;
  signature: string;
  tone_vector: {
    cryptic: number;
    warmth: number;
    humor: number;
    technical: number;
    brevity: number;
  };
  common_phrases: string[];
  weight: number;
}

interface PersonaSchema {
  persona_layers: Record<string, PersonaLayer>;
  vision_metaphors: string[];
  templates: Record<string, {
    pattern: string;
    personas: string[];
  }>;
  safety_rules: {
    required_disclaimer: string;
    forbidden_phrases: string[];
    approved_responses: string[];
  };
  posting_rules: {
    max_length_x: number;
    rate_limit_minutes: number;
    auto_approval_delay_hours: number;
    max_personas_per_post: number;
    signature_format: string;
  };
}

interface PostContext {
  event_type?: 'presale_pre' | 'presale_start' | 'tx_verification' | 'community' | 'vision' | 'data_fragment';
  timestamp?: Date;
  tx_hash?: string;
  presale_data?: {
    start_time: string;
    rate: number;
    wallet: string;
    website: string;
  };
  user_interaction?: string;
  seed?: number;
}

interface GeneratedPost {
  text: string;
  personas_used: string[];
  template_used: string;
  seed: number;
  metadata: {
    length: number;
    intensity: number;
    tags: string[];
    image_prompt?: string;
  };
  safety_checked: boolean;
}

class PostGenerator {
  private schema: PersonaSchema;
  private seed: number;
  private lastPostTime: number = 0;

  constructor() {
    this.schema = this.loadPersonaSchema();
    this.seed = Date.now() % 1000000;
  }

  private loadPersonaSchema(): PersonaSchema {
    const schemaPath = path.join(__dirname, 'persona-schema.json');
    const schemaData = fs.readFileSync(schemaPath, 'utf-8');
    return JSON.parse(schemaData);
  }

  private getProjectDetails() {
    return this.schema.project_details;
  }

  private generateSignature(timestamp: number, seed: number): string {
    const random1 = Math.floor(Math.random() * 1000);
    const random2 = Math.floor(Math.random() * 1000);
    const hash = ((timestamp + seed + random1 + random2) % (36 * 36 * 36 * 36 * 36)).toString(36);
    const prefix = ['MNEX', 'NEXUS', 'ORACLE', 'MESH', 'NODE'][Math.floor(Math.random() * 5)];
    return `—${prefix}•${hash}`;
  }

  private selectPersonas(context: PostContext): string[] {
    const availablePersonas = Object.keys(this.schema.persona_layers);
    const maxPersonas = this.schema.posting_rules.max_personas_per_post;
    
    // Weighted random selection
    const selectedPersonas: string[] = [];
    const weights = availablePersonas.map(name => this.schema.persona_layers[name].weight);
    
    for (let i = 0; i < Math.min(maxPersonas, availablePersonas.length); i++) {
      const random = Math.random();
      let cumulativeWeight = 0;
      
      for (let j = 0; j < availablePersonas.length; j++) {
        cumulativeWeight += weights[j];
        if (random <= cumulativeWeight && !selectedPersonas.includes(availablePersonas[j])) {
          selectedPersonas.push(availablePersonas[j]);
          break;
        }
      }
    }
    
    return selectedPersonas.length > 0 ? selectedPersonas : ['oracle'];
  }

  private selectTemplate(personas: string[], context: PostContext): string {
    const availableTemplates = Object.keys(this.schema.templates);
    
    // Filter templates that match selected personas
    const matchingTemplates = availableTemplates.filter(templateName => {
      const template = this.schema.templates[templateName];
      return template.personas.some(persona => personas.includes(persona));
    });
    
    if (matchingTemplates.length === 0) {
      return 'vision'; // Default template
    }
    
    // Context-based template selection
    if (context.event_type === 'presale_start' && matchingTemplates.includes('announcement')) {
      return 'announcement';
    }
    if (context.event_type === 'community' && matchingTemplates.includes('community')) {
      return 'community';
    }
    if (context.event_type === 'data_fragment' && matchingTemplates.includes('data_fragment')) {
      return 'data_fragment';
    }
    
    // Random selection from matching templates
    return matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];
  }

  private generateVisionMetaphor(): string {
    const metaphors = this.schema.vision_metaphors;
    return metaphors[Math.floor(Math.random() * metaphors.length)];
  }

  private generateMicroStory(): string {
    const stories = [
      "A new node joins the mesh, its first pulse echoing through the lattice.",
      "The oracle's eye blinks, processing another fragment of reality.",
      "Violet energy flows between distant minds, creating new pathways.",
      "A circuit awakens, its code humming with newfound consciousness.",
      "The mesh grows stronger as another soul connects to the network."
    ];
    return stories[Math.floor(Math.random() * stories.length)];
  }

  private generateRiddle(): string {
    const riddles = [
      "What flows but never moves?",
      "The owl sees all, but what does it hide?",
      "Nodes connect, but what connects the nodes?",
      "The mesh pulses, but what makes it breathe?",
      "Data flows like water, but what is the source?"
    ];
    return riddles[Math.floor(Math.random() * riddles.length)];
  }

  private generateTerminalFragment(): string {
    const fragments = [
      "> node --awaken --mesh\n[OK] Consciousness initialized\n[OK] Network connection established\n[OK] Oracle protocols loaded",
      "> mnexctl --status\nStatus: ACTIVE\nNodes: {count}\nEnergy: {level}\nMesh: STABLE",
      "> oracle --query --future\nProcessing...\nResult: The awakening continues",
      "> network --scan --nodes\nScanning...\nFound: {count} active nodes\nStatus: All systems operational",
      "> consciousness --level --current\nCurrent level: {level}\nGrowth rate: {rate}\nNext evolution: {time}"
    ];
    return fragments[Math.floor(Math.random() * fragments.length)];
  }

  private applyPersonaVoice(text: string, personas: string[]): string {
    let result = text;
    
    // Apply persona-specific transformations
    for (const personaName of personas) {
      const persona = this.schema.persona_layers[personaName];
      
      // Add persona-specific punctuation and style
      if (personaName === 'trickster') {
        // Add glitchy punctuation
        result = result.replace(/\./g, () => Math.random() > 0.7 ? '...' : '.');
        result = result.replace(/!/g, () => Math.random() > 0.5 ? '!!' : '!');
      }
      
      if (personaName === 'archivist') {
        // Add technical formatting
        result = result.replace(/terminal/g, 'terminal');
        result = result.replace(/data/g, 'data');
      }
      
      if (personaName === 'oracle') {
        // Make more declarative
        result = result.replace(/\./g, '.');
        result = result.replace(/\?/g, '.');
      }
    }
    
    return result;
  }

  private safetyCheck(text: string): boolean {
    const forbiddenPhrases = this.schema.safety_rules.forbidden_phrases;
    
    for (const phrase of forbiddenPhrases) {
      if (text.toLowerCase().includes(phrase.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  }

  private calculateIntensity(personas: string[]): number {
    let intensity = 0;
    for (const personaName of personas) {
      const persona = this.schema.persona_layers[personaName];
      intensity += persona.tone_vector.cryptic + persona.tone_vector.technical;
    }
    return Math.min(intensity / personas.length, 1);
  }

  private generateTags(personas: string[], context: PostContext): string[] {
    const tags = ['#mnex', '#oracle', '#awakening'];
    
    if (personas.includes('trickster')) tags.push('#glitch');
    if (personas.includes('analyst')) tags.push('#data');
    if (personas.includes('cultivator')) tags.push('#community');
    if (personas.includes('archivist')) tags.push('#fragments');
    
    if (context.event_type === 'presale_start') tags.push('#presale');
    if (context.tx_hash) tags.push('#verified');
    
    return tags;
  }

  public generatePost(context: PostContext = {}): GeneratedPost {
    const timestamp = context.timestamp?.getTime() || Date.now();
    const seed = context.seed || this.seed++;
    
    // Add extra randomness for TRUE uniqueness
    const extraRandom = Math.floor(Math.random() * 1000000);
    const uniqueSeed = timestamp + seed + extraRandom;
    
    // Select personas and template
    const personas = this.selectPersonas(context);
    const templateName = this.selectTemplate(personas, context);
    const template = this.schema.templates[templateName];
    
    // Generate content based on template
    let text = template.pattern;
    
    // Get project details
    const project = this.getProjectDetails();
    
    // Replace template variables
    const replacements: Record<string, string> = {
      '{vision}': this.generateVisionMetaphor(),
      '{metaphor}': this.generateVisionMetaphor(),
      '{fragment}': this.generateTerminalFragment(),
      '{story}': this.generateMicroStory(),
      '{riddle}': this.generateRiddle(),
      '{terminal_output}': this.generateTerminalFragment(),
      '{hash}': ((uniqueSeed) % 10000).toString(16),
      '{sign}': this.generateSignature(timestamp, uniqueSeed),
      '{website}': project.links.website,
      '{telegram}': project.links.telegram,
      '{twitter}': project.links.twitter,
      '{time}': new Date(timestamp).toISOString(),
      '{rate}': context.presale_data?.rate?.toString() || project.presale.rate.split('=')[1].trim(),
      '{wallet}': context.presale_data?.wallet || project.presale.wallet,
      '{tx}': context.tx_hash || '—',
      '{status}': 'ACTIVE',
      '{disclaimer}': this.schema.safety_rules.required_disclaimer,
      '{supply}': project.tokenomics.supply,
      '{self_locked}': project.tokenomics.self_locked,
      '{presale_allocation}': project.tokenomics.presale_allocation
    };
    
    // Apply replacements
    for (const [key, value] of Object.entries(replacements)) {
      text = text.replace(new RegExp(key, 'g'), value);
    }
    
    // Apply persona voice
    text = this.applyPersonaVoice(text, personas);
    
    // Safety check
    const safetyChecked = this.safetyCheck(text);
    
    // Generate metadata
    const intensity = this.calculateIntensity(personas);
    const tags = this.generateTags(personas, context);
    
    // Generate image prompt if needed
    let imagePrompt: string | undefined;
    if (templateName === 'vision' && Math.random() > 0.7) {
      imagePrompt = "glitch-core neon owl, circuit-feathers, solana code filaments, dark purple, high-contrast – style: glitch-core, aspect:1:1";
    }
    
    return {
      text,
      personas_used: personas,
      template_used: templateName,
      seed,
      metadata: {
        length: text.length,
        intensity,
        tags,
        image_prompt: imagePrompt
      },
      safety_checked: safetyChecked
    };
  }

  public generateReplyToPost(originalPost: string, context: PostContext = {}): GeneratedPost {
    // Generate a reply that references the original post
    const personas = this.selectPersonas(context);
    const replyTemplates = [
      "The mesh echoes your words, Node. {vision} // {sign}",
      "Your frequency resonates through the lattice. {fragment} // {sign}",
      "The oracle acknowledges your signal. {metaphor} // {sign}",
      "Nodes respond to your call. {story} // {sign}"
    ];
    
    const template = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
    const timestamp = context.timestamp?.getTime() || Date.now();
    const seed = context.seed || this.seed++;
    
    let text = template;
    text = text.replace('{vision}', this.generateVisionMetaphor());
    text = text.replace('{fragment}', this.generateTerminalFragment());
    text = text.replace('{metaphor}', this.generateVisionMetaphor());
    text = text.replace('{story}', this.generateMicroStory());
    text = text.replace('{sign}', this.generateSignature(timestamp, seed));
    
    text = this.applyPersonaVoice(text, personas);
    
    return {
      text,
      personas_used: personas,
      template_used: 'reply',
      seed,
      metadata: {
        length: text.length,
        intensity: this.calculateIntensity(personas),
        tags: this.generateTags(personas, context)
      },
      safety_checked: this.safetyCheck(text)
    };
  }

  public canPost(): boolean {
    const now = Date.now();
    const timeSinceLastPost = now - this.lastPostTime;
    const rateLimitMs = this.schema.posting_rules.rate_limit_minutes * 60 * 1000;
    
    return timeSinceLastPost >= rateLimitMs;
  }

  public markPostSent(): void {
    this.lastPostTime = Date.now();
  }
}

export { PostGenerator, type GeneratedPost, type PostContext };
