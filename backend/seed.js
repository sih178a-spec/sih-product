const { memoryDb } = require('./config/db');
const Vulnerability = require('./models/Vulnerability');
const Scan = require('./models/Scan');
const Lexer = require('./compiler/lexer');
const Parser = require('./compiler/parser');
const IRGenerator = require('./compiler/irGenerator');
const RiskScorer = require('./compiler/riskScorer');

const sampleVulnerabilities = [
  {
    vulnerabilityId: 'VULN-001',
    title: 'Stack-based Buffer Overflow via unsafe_copy() in .jky',
    cweId: 'CWE-120',
    category: 'Buffer Overflow',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    owaspCategory: 'A06:2021 - Vulnerable and Outdated Components / Memory Safety',
    attackVector: 'Network / Unauthenticated Remote Payload',
    rootCause: 'Memory buffer allocation of 64 bytes is filled using unsafe_copy() without verifying payload length, leading to stack memory corruption and instruction pointer overwrite.',
    description: 'Unbounded memory copy operation in Jocky (.jky) script using unsafe_copy() writes user payload into a fixed-length memory buffer without boundary checking.',
    impact: 'Arbitrary code execution, stack corruptions, and remote takeover of Jocky execution vault.',
    vulnerableCode: `func handleInput(userInput) {\n    var buffer = alloc_buffer(64);\n    unsafe_copy(buffer, userInput); // Vulnerable: No boundary check\n}`,
    patchedCode: `func handleInput(userInput) {\n    var buffer = alloc_buffer(64);\n    // Secure: Bounded copy procedure\n    safe_copy(buffer, 64, userInput);\n}`,
    remediationSteps: [
      'Replace all unsafe_copy() calls with safe_copy(dest, limit, src).',
      'Specify explicit buffer limits when allocating memory in .jky files.',
      'Enable Jocky runtime boundary assertions (-Djocky.bounds.check=true).',
      'Enforce GCC/Clang -fstack-protector-strong compile flags.'
    ],
    compilerFlags: ['-fstack-protector-all', '-D_FORTIFY_SOURCE=2', '-Wno-stringop-overflow'],
    references: ['https://cwe.mitre.org/data/definitions/120.html', 'https://owasp.org/www-community/vulnerabilities/Buffer_Overflow']
  },
  {
    vulnerabilityId: 'VULN-002',
    title: 'Unescaped SQL Command Assembly in .jky',
    cweId: 'CWE-89',
    category: 'SQL Injection',
    severity: 'HIGH',
    cvssScore: 8.9,
    owaspCategory: 'A03:2021 - Injection Flaws',
    attackVector: 'Web Request Form Input / Query Parameters',
    rootCause: 'Dynamic string concatenation of untrusted input into raw SQL queries breaks structural syntax, allowing attackers to inject arbitrary SQL statements.',
    description: 'Building SQL queries by concatenating raw string variables in Jocky (.jky) scripts allows attackers to manipulate query structures.',
    impact: 'Unauthorized database read/write access, sensitive data exfiltration, and admin authentication bypass.',
    vulnerableCode: `func getUser(userId) {\n    var query = "SELECT * FROM users WHERE id = " + userId;\n    return raw_sql_exec(query); // Vulnerable\n}`,
    patchedCode: `func getUser(userId) {\n    var query = "SELECT * FROM users WHERE id = ?";\n    return query_db(query, [userId]); // Secure\n}`,
    remediationSteps: [
      'Use parameterized Jocky query_db bindings with prepared statements.',
      'Avoid raw string concatenation in raw_sql_exec calls.',
      'Apply strict numeric / alphanumeric type validation on input variables.'
    ],
    compilerFlags: ['-Wsql-injection-warning', '-Djocky.db.parameterize=strict'],
    references: ['https://cwe.mitre.org/data/definitions/89.html', 'https://owasp.org/www-community/attacks/SQL_Injection']
  },
  {
    vulnerabilityId: 'VULN-003',
    title: 'Arbitrary Shell Command Injection in .jky',
    cweId: 'CWE-78',
    category: 'Command Injection',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    owaspCategory: 'A03:2021 - Injection Flaws',
    attackVector: 'Remote API Endpoint Payload Input',
    rootCause: 'Passing raw user input directly to execute_shell() invokes the OS system shell without escaping shell metacharacters like ";", "&&", or "|".',
    description: 'Passing untrusted parameters to execute_shell() or system_run() in Jocky (.jky) files allows arbitrary OS command execution.',
    impact: 'Total compromise of host operating system with shell privilege escalation.',
    vulnerableCode: `func runAuditPing(targetHost) {\n    var cmd = "ping -c 1 " + targetHost;\n    execute_shell(cmd); // Vulnerable to shell injection\n}`,
    patchedCode: `func runAuditPing(targetHost) {\n    // Secure: Use Jocky process vector binding\n    process.spawn("/bin/ping", ["-c", "1", targetHost]);\n}`,
    remediationSteps: [
      'Avoid execute_shell() with dynamic string inputs.',
      'Use process.spawn with explicit argument vectors to prevent shell invocation.',
      'Sanitize all hostname and IP input fields against shell escape sequences.'
    ],
    compilerFlags: ['-Djocky.shell.disabled=true', '-Wno-system-calls'],
    references: ['https://cwe.mitre.org/data/definitions/78.html', 'https://owasp.org/www-community/attacks/Command_Injection']
  },
  {
    vulnerabilityId: 'VULN-004',
    title: 'Hardcoded Secret Tokens & Encryption Keys in .jky Source',
    cweId: 'CWE-798',
    category: 'Hardcoded Secrets',
    severity: 'HIGH',
    cvssScore: 7.5,
    owaspCategory: 'A07:2021 - Identification and Authentication Failures',
    attackVector: 'Repository Code Audit / Reverse Engineering',
    rootCause: 'Private API secret keys, database credentials, and cryptographic tokens are embedded directly as string literal constants inside Jocky source code.',
    description: 'Storing plain-text secret credentials inside application source code exposes them to anyone with read access to the codebase or compiled binaries.',
    impact: 'Credential leak, unauthorized API access, and compromise of protected backend services.',
    vulnerableCode: `func authenticateVault() {\n    var API_SECRET = "sk_live_998127391823719827391";\n    connect_vault(API_SECRET);\n}`,
    patchedCode: `func authenticateVault() {\n    // Secure: Read secret from environment vault\n    var API_SECRET = env.get("JOCKY_VAULT_SECRET");\n    connect_vault(API_SECRET);\n}`,
    remediationSteps: [
      'Extract all secrets into environment variables or dedicated secret vaults.',
      'Use git secret scanners (e.g. gitleaks or trufflehog) in CI/CD pipelines.',
      'Rotate any leaked keys immediately.'
    ],
    compilerFlags: ['-Djocky.detect.hardcoded.secrets=true'],
    references: ['https://cwe.mitre.org/data/definitions/798.html']
  },
  {
    vulnerabilityId: 'VULN-005',
    title: 'Directory Path Traversal via file_read() in .jky',
    cweId: 'CWE-22',
    category: 'Path Traversal',
    severity: 'HIGH',
    cvssScore: 8.6,
    owaspCategory: 'A01:2021 - Broken Access Control',
    attackVector: 'HTTP Request File Download Query',
    rootCause: 'File paths passed to file_read() allow relative path sequences like "../" without canonicalization, permitting access outside the intended web root directory.',
    description: 'Failure to sanitize input path parameters lets remote attackers read sensitive system configuration files (e.g. /etc/passwd or config.json).',
    impact: 'Information disclosure of sensitive system files, passwords, and private server configuration.',
    vulnerableCode: `func loadDocument(userPath) {\n    var path = "../data/" + userPath;\n    return file_read(path); // Vulnerable to path traversal\n}`,
    patchedCode: `func loadDocument(userPath) {\n    var safeName = path.basename(userPath);\n    var fullPath = path.join("/var/data/", safeName);\n    return file_read(fullPath); // Secure bounded path\n}`,
    remediationSteps: [
      'Use path.basename() to strip leading directory separator sequences.',
      'Validate that target paths reside strictly inside the allowed root directory.',
      'Enforce sandbox chroot directory constraints.'
    ],
    compilerFlags: ['-Djocky.fs.chroot=/var/data/'],
    references: ['https://cwe.mitre.org/data/definitions/22.html']
  },
  {
    vulnerabilityId: 'VULN-006',
    title: 'Server-Side Request Forgery (SSRF) Vector in .jky',
    cweId: 'CWE-918',
    category: 'SSRF Attack Vector',
    severity: 'MEDIUM',
    cvssScore: 6.8,
    owaspCategory: 'A10:2021 - Server-Side Request Forgery',
    attackVector: 'Unrestricted Remote URL Query Parameter',
    rootCause: 'Calling fetch_remote() with arbitrary user-controlled URLs allows internal infrastructure scanning and access to cloud metadata endpoints (169.254.169.254).',
    description: 'Allowing arbitrary remote HTTP fetch requests enables attackers to probe internal private network ports and cloud metadata APIs.',
    impact: 'Internal port scanning, cloud metadata token theft, and internal service access bypass.',
    vulnerableCode: `func fetchWebhook(targetUrl) {\n    var res = fetch_remote(targetUrl); // Vulnerable to SSRF\n    return res.body;\n}`,
    patchedCode: `func fetchWebhook(targetUrl) {\n    // Secure: Validate domain against strict whitelist\n    if (!url.isWhitelisted(targetUrl)) throw "Invalid Domain";\n    return fetch_remote(targetUrl);\n}`,
    remediationSteps: [
      'Maintain a strict domain whitelist for outbound HTTP requests.',
      'Block internal IP ranges (10.0.0.0/8, 192.168.0.0/16, 127.0.0.1, 169.254.169.254).',
      'Disable automatic HTTP redirect following in fetch clients.'
    ],
    compilerFlags: ['-Djocky.net.whitelist=strict'],
    references: ['https://cwe.mitre.org/data/definitions/918.html']
  }
];

const sampleJockyCode = `@import "jocky/audit"
@import "jocky/vault"

func inspect_payload(user_input) {
    var buffer = alloc_buffer(64);
    unsafe_copy(buffer, user_input); // Buffer overflow flaw
    
    var shell_cmd = "log_event --payload " + buffer;
    execute_shell(shell_cmd); // Command injection flaw
}

func main() {
    var payload = gets_raw();
    inspect_payload(payload);
    return 0;
}`;

function seedInitialData() {
  memoryDb.vulnerabilities = sampleVulnerabilities;
  memoryDb.scans = [];
  console.log('[Seed] Vulnerability remediation rules initialized. Scan history set to real-time execution mode.');
}

module.exports = { seedInitialData, sampleVulnerabilities };
