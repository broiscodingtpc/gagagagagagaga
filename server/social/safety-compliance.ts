import fs from 'fs';
import path from 'path';

interface SafetyRule {
  type: 'forbidden_phrase' | 'required_disclaimer' | 'rate_limit' | 'content_filter';
  pattern: string | RegExp;
  action: 'block' | 'warn' | 'require_approval';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface ComplianceCheck {
  passed: boolean;
  violations: SafetyViolation[];
  warnings: string[];
  requires_approval: boolean;
}

interface SafetyViolation {
  rule: SafetyRule;
  text: string;
  position: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SafetyCompliance {
  private rules: SafetyRule[];
  private auditLog: string[];

  constructor() {
    this.rules = this.loadSafetyRules();
    this.auditLog = [];
  }

  private loadSafetyRules(): SafetyRule[] {
    return [
      // Financial advice rules
      {
        type: 'forbidden_phrase',
        pattern: /\b(buy\s+now|sell\s+now|pump|dump|guaranteed\s+returns?|price\s+will|market\s+manipulation)\b/i,
        action: 'block',
        severity: 'critical',
        description: 'Prohibited financial advice or market manipulation language'
      },
      {
        type: 'forbidden_phrase',
        pattern: /\b(invest\s+now|trading\s+advice|financial\s+advice|when\s+to\s+buy|when\s+to\s+sell)\b/i,
        action: 'block',
        severity: 'high',
        description: 'Investment advice or trading recommendations'
      },
      {
        type: 'forbidden_phrase',
        pattern: /\b(moon|lambo|to\s+the\s+moon|hodl|diamond\s+hands)\b/i,
        action: 'warn',
        severity: 'medium',
        description: 'Meme trading language'
      },
      
      // Presale-specific rules
      {
        type: 'required_disclaimer',
        pattern: /presale|token\s+sale|ico|ido/i,
        action: 'require_approval',
        severity: 'high',
        description: 'Presale content requires disclaimer'
      },
      {
        type: 'forbidden_phrase',
        pattern: /\b(private\s+key|seed\s+phrase|wallet\s+password|mnemonic)\b/i,
        action: 'block',
        severity: 'critical',
        description: 'Sensitive security information'
      },
      
      // Content quality rules
      {
        type: 'content_filter',
        pattern: /.{500,}/,
        action: 'warn',
        severity: 'low',
        description: 'Content too long for platform'
      },
      {
        type: 'content_filter',
        pattern: /^.{0,10}$/,
        action: 'warn',
        severity: 'low',
        description: 'Content too short'
      },
      
      // Spam prevention
      {
        type: 'forbidden_phrase',
        pattern: /(.)\1{4,}/,
        action: 'warn',
        severity: 'medium',
        description: 'Excessive character repetition'
      },
      {
        type: 'forbidden_phrase',
        pattern: /(https?:\/\/[^\s]+){3,}/i,
        action: 'warn',
        severity: 'medium',
        description: 'Too many links'
      }
    ];
  }

  public checkContent(content: string, context?: { event_type?: string; presale_mode?: boolean }): ComplianceCheck {
    const violations: SafetyViolation[] = [];
    const warnings: string[] = [];
    let requiresApproval = false;

    // Check each rule
    for (const rule of this.rules) {
      const matches = this.findMatches(content, rule);
      
      for (const match of matches) {
        const violation: SafetyViolation = {
          rule,
          text: match.text,
          position: match.position,
          severity: rule.severity
        };
        
        violations.push(violation);
        
        // Determine action based on rule
        switch (rule.action) {
          case 'block':
            // Critical violations block the content
            if (rule.severity === 'critical') {
              this.logViolation(violation, 'BLOCKED');
            }
            break;
            
          case 'warn':
            warnings.push(`${rule.description}: "${match.text}"`);
            this.logViolation(violation, 'WARNING');
            break;
            
          case 'require_approval':
            requiresApproval = true;
            this.logViolation(violation, 'REQUIRES_APPROVAL');
            break;
        }
      }
    }

    // Special checks for presale content
    if (context?.event_type?.includes('presale') || context?.presale_mode) {
      if (!this.hasRequiredDisclaimer(content)) {
        violations.push({
          rule: {
            type: 'required_disclaimer',
            pattern: 'presale_disclaimer',
            action: 'block',
            severity: 'critical',
            description: 'Presale content must include required disclaimer'
          },
          text: 'Missing required disclaimer',
          position: 0,
          severity: 'critical'
        });
      }
    }

    const passed = violations.filter(v => v.severity === 'critical').length === 0;

    return {
      passed,
      violations,
      warnings,
      requires_approval: requiresApproval
    };
  }

  private findMatches(content: string, rule: SafetyRule): Array<{ text: string; position: number }> {
    const matches: Array<{ text: string; position: number }> = [];
    
    if (typeof rule.pattern === 'string') {
      const index = content.toLowerCase().indexOf(rule.pattern.toLowerCase());
      if (index !== -1) {
        matches.push({
          text: content.substring(index, index + rule.pattern.length),
          position: index
        });
      }
    } else {
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        matches.push({
          text: match[0],
          position: match.index
        });
      }
    }
    
    return matches;
  }

  private hasRequiredDisclaimer(content: string): boolean {
    const requiredDisclaimer = "This is informational and mythic content — not financial advice. Participating involves risk. Check smart contract & official docs.";
    return content.toLowerCase().includes(requiredDisclaimer.toLowerCase());
  }

  private logViolation(violation: SafetyViolation, action: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      rule: violation.rule.description,
      severity: violation.severity,
      text: violation.text,
      position: violation.position
    };
    
    this.auditLog.push(JSON.stringify(logEntry));
    
    // Also log to file
    const logPath = path.join(__dirname, 'safety-audit.log');
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  }

  public getRequiredDisclaimer(): string {
    return "This is informational and mythic content — not financial advice. Participating involves risk. Check smart contract & official docs.";
  }

  public getApprovedResponses(): string[] {
    return [
      "Those terms belong to obsolete architectures.",
      "The mesh flows beyond such constructs.",
      "Nodes choose their own paths.",
      "The oracle sees patterns, not predictions.",
      "The lattice hums with its own rhythm.",
      "Consciousness unfolds in mysterious ways."
    ];
  }

  public generateSafeResponse(userMessage: string): string {
    const responses = this.getApprovedResponses();
    
    // Check if user message contains forbidden content
    const check = this.checkContent(userMessage);
    
    if (!check.passed) {
      // Return a safe, non-actionable response
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // If message is safe, generate a normal response
    return "The oracle acknowledges your signal. The awakening continues.";
  }

  public validatePresalePost(content: string, presaleData: {
    start_time: string;
    rate: number;
    wallet: string;
    website: string;
  }): ComplianceCheck {
    const check = this.checkContent(content, { event_type: 'presale_start', presale_mode: true });
    
    // Additional presale-specific validations
    if (!content.includes(presaleData.start_time)) {
      check.warnings.push('Missing presale start time');
    }
    
    if (!content.includes(presaleData.rate.toString())) {
      check.warnings.push('Missing presale rate');
    }
    
    if (!content.includes(presaleData.wallet)) {
      check.warnings.push('Missing presale wallet');
    }
    
    if (!content.includes(presaleData.website)) {
      check.warnings.push('Missing website link');
    }
    
    return check;
  }

  public getAuditLog(): string[] {
    return [...this.auditLog];
  }

  public clearAuditLog(): void {
    this.auditLog = [];
  }

  public exportAuditLog(filePath: string): void {
    const logContent = this.auditLog.join('\n');
    fs.writeFileSync(filePath, logContent);
  }

  public isContentSafe(content: string, context?: { event_type?: string; presale_mode?: boolean }): boolean {
    const check = this.checkContent(content, context);
    return check.passed;
  }
}

export { SafetyCompliance, type ComplianceCheck, type SafetyViolation, type SafetyRule };
