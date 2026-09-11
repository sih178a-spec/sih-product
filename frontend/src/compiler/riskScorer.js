/**
 * Client-Side Multi-Stage Risk Scoring Engine for Jocky (.jky), C++, C, JS & Python
 * Supports Critical, High, Medium, and Low severity vulnerability detection.
 */

export class RiskScorer {
  evaluate(sourceCode, tokens = [], ast = null, irInstructions = []) {
    const findings = [];
    const seenMap = new Set();
    const lines = (sourceCode || '').split('\n');
    let findingCounter = 1;

    const addFinding = (f) => {
      const key = `${f.cweId}-${f.lineNumber}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        f.findingId = `FIND-${findingCounter++}`;
        findings.push(f);
      }
    };

    // 1. Scan IR Instructions for Dangerous Calls
    for (const inst of (irInstructions || [])) {
      const func = (inst.arg1 || '').toLowerCase();
      const lineNum = inst.line || 1;
      const snippet = lines[lineNum - 1] ? lines[lineNum - 1].trim() : (inst.code || `${func}(...)`);

      if (['unsafe_copy', 'strcpy', 'strcat', 'gets', 'sprintf', 'vsprintf', 'memcpy'].includes(func)) {
        addFinding({
          title: `Dangerous Memory / Buffer Operation (${func})`,
          cweId: 'CWE-120',
          category: 'Buffer Overflow',
          severity: ['gets', 'unsafe_copy'].includes(func) ? 'CRITICAL' : 'HIGH',
          confidence: 'HIGH',
          scoreContribution: ['gets', 'unsafe_copy'].includes(func) ? 30 : 20,
          lineNumber: lineNum,
          codeSnippet: snippet,
          description: `Unbounded memory copy function '${func}' can cause stack/heap buffer overflows.`,
          evidenceSummary: `IR Instruction at line ${lineNum}: ${inst.code}`,
          recommendation: `Replace '${func}' with bounded alternatives like safe_copy() or strncpy_s().`
        });
      }

      if (['execute_shell', 'system_run', 'system', 'exec', 'execsync', 'popen', 'shellexecute'].includes(func)) {
        addFinding({
          title: `Arbitrary OS Command Injection (${func})`,
          cweId: 'CWE-78',
          category: 'Command Injection',
          severity: 'CRITICAL',
          confidence: 'HIGH',
          scoreContribution: 30,
          lineNumber: lineNum,
          codeSnippet: snippet,
          description: `Invoking shell primitive '${func}' with dynamic parameters allows arbitrary OS command execution.`,
          evidenceSummary: `IR Instruction at line ${lineNum}: ${inst.code}`,
          recommendation: `Avoid shell invocation. Use parameterized process vectors.`
        });
      }
    }

    // 2. Comprehensive Line-by-Line Security Audit
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

      // CRITICAL: Buffer Overflow
      if (/\b(unsafe_copy|strcpy|strcat|gets|sprintf|vsprintf|strcpy_raw)\b/i.test(trimmed)) {
        const isGets = /\bgets\b/i.test(trimmed) || /\bunsafe_copy\b/i.test(trimmed);
        addFinding({
          title: 'Dangerous Memory / Buffer Operation',
          cweId: 'CWE-120',
          category: 'Buffer Overflow',
          severity: isGets ? 'CRITICAL' : 'HIGH',
          confidence: 'HIGH',
          scoreContribution: isGets ? 30 : 20,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Unbounded memory operation writes user data into fixed memory buffers without boundary checking.',
          evidenceSummary: `Detected buffer function on line ${lineNum}`,
          recommendation: 'Replace unbounded calls with bounded alternatives (safe_copy / strncpy_s / snprintf).'
        });
      }

      // CRITICAL: Command Injection
      if (/\b(execute_shell|system_run|system|exec|execSync|popen|ShellExecute|subprocess\.call|os\.system)\b/i.test(trimmed)) {
        addFinding({
          title: 'Arbitrary OS Command Injection',
          cweId: 'CWE-78',
          category: 'Command Injection',
          severity: 'CRITICAL',
          confidence: 'HIGH',
          scoreContribution: 30,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Passing untrusted inputs into system shell execution functions permits remote command execution (RCE).',
          evidenceSummary: `Command execution call on line ${lineNum}`,
          recommendation: 'Use process spawning with explicit argument vectors instead of shell execution.'
        });
      }

      // HIGH: SQL Injection
      if (/\b(raw_sql_exec|query_db|query|mysql_query|execQuery|SELECT|INSERT|UPDATE|DELETE|DROP)\b/i.test(trimmed) && (trimmed.includes('+') || trimmed.includes('${') || trimmed.includes("'"))) {
        addFinding({
          title: 'Unescaped SQL Query String Assembly',
          cweId: 'CWE-89',
          category: 'SQL Injection',
          severity: 'HIGH',
          confidence: 'HIGH',
          scoreContribution: 25,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Constructing SQL query strings via dynamic string concatenation allows attacker input to manipulate SQL logic.',
          evidenceSummary: `SQL string assembly on line ${lineNum}`,
          recommendation: 'Use parameterized queries or prepared statement bindings.'
        });
      }

      // HIGH: Hardcoded Secrets
      if (/\b(secret|secret_key|API_SECRET|api_key|apikey|api_token|password|passwd|token|bearer|private_key|VAULT_SECRET_KEY)\b\s*[:=]\s*["'][A-Za-z0-9_\-]{6,}["']/i.test(trimmed)) {
        addFinding({
          title: 'Plaintext Hardcoded Secret Key or Password',
          cweId: 'CWE-798',
          category: 'Hardcoded Secrets',
          severity: 'HIGH',
          confidence: 'HIGH',
          scoreContribution: 20,
          lineNumber: lineNum,
          codeSnippet: trimmed.replace(/["'][A-Za-z0-9_\-]{6,}["']/, '"********"'),
          description: 'Secret credentials or API tokens embedded directly in source code will be exposed in version control.',
          evidenceSummary: `Hardcoded credential assignment on line ${lineNum}`,
          recommendation: 'Load credentials from environment variables or vault secret managers.'
        });
      }

      // HIGH: XSS / Dynamic Evaluation
      if (/\b(raw_eval|render_html|eval|innerHTML|document\.write|dangerouslySetInnerHTML)\b/i.test(trimmed)) {
        addFinding({
          title: 'Unsafe Dynamic Code Execution / Reflected XSS',
          cweId: 'CWE-79',
          category: 'Cross-Site Scripting',
          severity: 'HIGH',
          confidence: 'MEDIUM',
          scoreContribution: 20,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Executing unescaped dynamic strings via eval or innerHTML permits arbitrary script execution.',
          evidenceSummary: `XSS execution primitive on line ${lineNum}`,
          recommendation: 'Sanitize dynamic HTML inputs and avoid dynamic code evaluation.'
        });
      }

      // MEDIUM: Insecure Cryptography / Weak PRNG
      if (/\b(rand|Math\.random|MD5|SHA1|DES|RC4)\b/i.test(trimmed)) {
        addFinding({
          title: 'Cryptographically Weak PRNG or Obsolete Hash',
          cweId: 'CWE-327',
          category: 'Insecure Cryptography',
          severity: 'MEDIUM',
          confidence: 'HIGH',
          scoreContribution: 15,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Using predictable pseudorandom number generators or broken hash algorithms (MD5/SHA1).',
          evidenceSummary: `Weak cryptographic primitive on line ${lineNum}`,
          recommendation: 'Use secure random devices and modern SHA-256 or Argon2 algorithms.'
        });
      }

      // MEDIUM: Dynamic Memory Allocation
      if (/\b(alloc_buffer|malloc|new)\b/i.test(trimmed) && !trimmed.includes('safe_copy')) {
        addFinding({
          title: 'Unbounded Memory Buffer Allocation',
          cweId: 'CWE-401',
          category: 'Memory Allocation',
          severity: 'MEDIUM',
          confidence: 'MEDIUM',
          scoreContribution: 15,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Memory allocated dynamically requires strict size boundary verification to prevent leaks or overflows.',
          evidenceSummary: `Memory allocation on line ${lineNum}`,
          recommendation: 'Ensure allocated buffers are bounded and explicitly freed.'
        });
      }

      // CRITICAL: Path Traversal / Arbitrary File Access
      if (/\b(file_read|read_file|readFile|fs\.readFile|open_file|fopen|file_write|write_file|writeFile|fs\.writeFile)\b/i.test(trimmed) && (trimmed.includes('..') || trimmed.includes('+') || trimmed.includes('${') || trimmed.includes('path') || trimmed.includes('input'))) {
        addFinding({
          title: 'Arbitrary File Path Traversal / Unauthorized File Access',
          cweId: 'CWE-22',
          category: 'Path Traversal',
          severity: 'CRITICAL',
          confidence: 'HIGH',
          scoreContribution: 30,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Constructing file system paths from untrusted variables allows arbitrary directory traversal outside intended roots.',
          evidenceSummary: `Path manipulation detected on line ${lineNum}`,
          recommendation: 'Sanitize file paths using path.basename() and canonical path whitelist checking.'
        });
      }

      // CRITICAL: Insecure Deserialization
      if (/\b(deserialize|unserialize|yaml_load|pickle\.loads|marshal\.load|eval_object|json_decode_unsafe)\b/i.test(trimmed)) {
        addFinding({
          title: 'Insecure Object Deserialization Primitive',
          cweId: 'CWE-502',
          category: 'Insecure Deserialization',
          severity: 'CRITICAL',
          confidence: 'HIGH',
          scoreContribution: 30,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Deserializing raw byte streams from untrusted sources permits object injection and remote execution.',
          evidenceSummary: `Deserialization function on line ${lineNum}`,
          recommendation: 'Avoid dynamic object deserialization; use safe data formats like JSON.parse.'
        });
      }

      // HIGH: Server-Side Request Forgery (SSRF)
      if (/\b(fetch_remote|http_get|http_request|curl_exec|request_url|axios\.get|fetch|urlopen)\b/i.test(trimmed)) {
        addFinding({
          title: 'Server-Side Request Forgery (SSRF) Risk',
          cweId: 'CWE-918',
          category: 'SSRF',
          severity: 'HIGH',
          confidence: 'HIGH',
          scoreContribution: 25,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Issuing HTTP requests with dynamic target addresses allows attackers to scan internal infrastructure.',
          evidenceSummary: `Network request call on line ${lineNum}`,
          recommendation: 'Restrict remote outbound network calls to explicit IP/domain allowlists.'
        });
      }

      // HIGH: Unrestricted File Upload
      if (/\b(upload_file|save_uploaded_file|move_uploaded_file|handle_upload)\b/i.test(trimmed)) {
        addFinding({
          title: 'Unrestricted Executable File Upload',
          cweId: 'CWE-434',
          category: 'File Upload',
          severity: 'HIGH',
          confidence: 'HIGH',
          scoreContribution: 25,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Accepting uploaded files without MIME and extension validation permits web shell upload.',
          evidenceSummary: `File upload handler on line ${lineNum}`,
          recommendation: 'Validate file signatures, sanitize filenames, and store uploaded files outside web root.'
        });
      }

      // MEDIUM: Null Pointer Dereference / Free Buffer Access
      if (/\b(free_buffer|free|null_ptr|deref_null)\b/i.test(trimmed)) {
        addFinding({
          title: 'Potential Null Pointer Dereference / Use-After-Free',
          cweId: 'CWE-476',
          category: 'Memory Management',
          severity: 'MEDIUM',
          confidence: 'MEDIUM',
          scoreContribution: 15,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Accessing memory references after release or without null check risks crash or memory corruption.',
          evidenceSummary: `Memory free/dereference operation on line ${lineNum}`,
          recommendation: 'Set pointers to NULL immediately after freeing memory and verify non-null state before access.'
        });
      }

      // MEDIUM: Hardcoded Private IP Endpoint
      if (/\b(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}|127\.0\.0\.1|localhost)\b/i.test(trimmed)) {
        addFinding({
          title: 'Hardcoded Internal Private Network IP',
          cweId: 'CWE-1188',
          category: 'Information Disclosure',
          severity: 'MEDIUM',
          confidence: 'HIGH',
          scoreContribution: 15,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Hardcoding internal private IPs or localhost routes leaks network architecture and hinders portability.',
          evidenceSummary: `Hardcoded IP address on line ${lineNum}`,
          recommendation: 'Externalize network endpoints into environment variables or DNS service discovery.'
        });
      }

      // LOW: Debug Statement / Information Disclosure
      if (/\b(console\.log|printf|print|debug_log|audit\.debug)\b/i.test(trimmed)) {
        addFinding({
          title: 'Verbose Debug Logging in Production Script',
          cweId: 'CWE-532',
          category: 'Information Disclosure',
          severity: 'LOW',
          confidence: 'MEDIUM',
          scoreContribution: 5,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Debug print statement may leak sensitive internal variables into system logs or stdout.',
          evidenceSummary: `Debug log statement on line ${lineNum}`,
          recommendation: 'Disable verbose debug logging in production environments.'
        });
      }

      // LOW: Uninitialized Untyped Variable Declaration
      if (/\b(var|let)\s+[a-zA-Z0-9_]+\s*(;|$)/i.test(trimmed) && !trimmed.includes('=')) {
        addFinding({
          title: 'Uninitialized Untyped Variable Declaration',
          cweId: 'CWE-457',
          category: 'Code Quality',
          severity: 'LOW',
          confidence: 'LOW',
          scoreContribution: 5,
          lineNumber: lineNum,
          codeSnippet: trimmed,
          description: 'Variable declared without initial value may hold undefined memory state.',
          evidenceSummary: `Uninitialized variable on line ${lineNum}`,
          recommendation: 'Initialize variables with default safe values upon declaration.'
        });
      }
    });

    // 3. Compute Risk Scores
    let totalRiskScore = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const f of findings) {
      totalRiskScore += f.scoreContribution;
      if (f.severity === 'CRITICAL') criticalCount++;
      else if (f.severity === 'HIGH') highCount++;
      else if (f.severity === 'MEDIUM') mediumCount++;
      else if (f.severity === 'LOW') lowCount++;
    }

    // Cap maximum risk score at 100
    totalRiskScore = Math.min(100, totalRiskScore);

    let overallRiskSeverity = 'LOW';
    if (totalRiskScore >= 76 || criticalCount > 0) overallRiskSeverity = 'CRITICAL';
    else if (totalRiskScore >= 46 || highCount > 0) overallRiskSeverity = 'HIGH';
    else if (totalRiskScore >= 21 || mediumCount > 0) overallRiskSeverity = 'MEDIUM';

    return {
      totalRiskScore,
      overallRiskSeverity,
      findingCounts: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        total: findings.length
      },
      findings
    };
  }
}
