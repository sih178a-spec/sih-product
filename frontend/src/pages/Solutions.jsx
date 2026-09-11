import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DiffViewer from '../components/DiffViewer';
import { 
  Wrench, CheckCircle2, ShieldCheck, FileText, ChevronRight, 
  AlertTriangle, ShieldAlert, Cpu, ExternalLink, Terminal, Search, Lock, Layers
} from 'lucide-react';

const FALLBACK_SOLUTIONS = [
  {
    vulnerabilityId: 'VULN-001',
    title: 'Stack-based Buffer Overflow via unsafe_copy() in .jky',
    cweId: 'CWE-120',
    category: 'Buffer Overflow',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    owaspCategory: 'A06:2021 - Vulnerable Components / Memory Safety',
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

export default function Solutions() {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vulnerabilities');
      const data = await res.json();
      if (data.success && data.vulnerabilities.length > 0) {
        setSolutions(data.vulnerabilities);
        setActiveId(data.vulnerabilities[0].vulnerabilityId);
      } else {
        setSolutions(FALLBACK_SOLUTIONS);
        setActiveId(FALLBACK_SOLUTIONS[0].vulnerabilityId);
      }
    } catch (err) {
      console.error('Failed to load solutions, using rich fallback:', err);
      setSolutions(FALLBACK_SOLUTIONS);
      setActiveId(FALLBACK_SOLUTIONS[0].vulnerabilityId);
    } finally {
      setLoading(false);
    }
  };

  const filteredSolutions = solutions.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cweId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSolution = solutions.find(s => s.vulnerabilityId === activeId) || solutions[0] || FALLBACK_SOLUTIONS[0];

  const toggleStep = (stepIdx) => {
    const key = `${activeSolution.vulnerabilityId}-${stepIdx}`;
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Wrench color="#00FF00" size={28} />
          Vulnerability Remediation & Secure Code Fixes
        </h2>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Deep architectural security analysis, root-cause diagnostics, side-by-side diff patches, compiler hardening parameters, and interactive fix checklists.
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#8b949e' }}>Loading remediation solutions...</p>
      ) : (
        <div className="grid-4" style={{ gridTemplateColumns: '1.1fr 2.9fr', gap: '1.5rem' }}>
          {/* Left Sidebar: Solution Topics */}
          <div className="cyber-card" style={{ padding: '1rem', height: 'fit-content' }}>
            {/* Search filter in sidebar */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
              <input
                type="text"
                placeholder="Search topics / CWE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.5rem 0.45rem 2.1rem',
                  backgroundColor: '#0D1117',
                  border: '1px solid rgba(0, 255, 255, 0.25)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  outline: 'none',
                  fontFamily: 'Fira Code'
                }}
              />
            </div>

            <h4 style={{ fontSize: '0.75rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>
              REMEDIATION TOPICS ({filteredSolutions.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {filteredSolutions.map((item) => {
                const isActive = activeId === item.vulnerabilityId;
                const isCrit = item.severity === 'CRITICAL';
                const isHigh = item.severity === 'HIGH';
                const badgeColor = isCrit ? '#FF3333' : isHigh ? '#ff9900' : '#00FF00';

                return (
                  <button
                    key={item.vulnerabilityId}
                    onClick={() => setActiveId(item.vulnerabilityId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isActive ? '#00FFFF' : 'rgba(0, 255, 255, 0.15)',
                      backgroundColor: isActive ? 'rgba(0, 255, 255, 0.12)' : '#0D1117',
                      color: isActive ? '#ffffff' : '#8b949e',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#00FFFF', fontFamily: 'Fira Code', fontWeight: 800 }}>
                          {item.cweId}
                        </span>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          color: badgeColor,
                          backgroundColor: `${badgeColor}18`,
                          border: `1px solid ${badgeColor}40`,
                          fontFamily: 'Fira Code'
                        }}>
                          {item.severity}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isActive ? '#f0f6fc' : '#c9d1d9', display: 'block', lineHeight: 1.3 }}>
                        {item.category}
                      </span>
                    </div>
                    <ChevronRight size={16} color={isActive ? '#00FFFF' : '#484f58'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Content Panel */}
          {activeSolution && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Card 1: Header Meta Info & Badges */}
              <div className="cyber-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span className={`cyber-badge badge-${(activeSolution.severity || 'LOW').toLowerCase()}`}>
                      {activeSolution.severity} SEVERITY
                    </span>
                    <span style={{ fontFamily: 'Fira Code', color: '#00FFFF', fontWeight: 800, fontSize: '0.85rem', background: 'rgba(0, 255, 255, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(0, 255, 255, 0.3)' }}>
                      {activeSolution.cweId}
                    </span>
                    <span style={{ fontFamily: 'Fira Code', color: '#FF3333', fontWeight: 800, fontSize: '0.8rem', background: 'rgba(255, 51, 51, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 51, 51, 0.3)' }}>
                      CVSS v3.1: {activeSolution.cvssScore || 9.0} / 10.0
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/compiler')}
                    className="btn-cyber"
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                  >
                    <Terminal size={14} />
                    Test Fix in Jocky Compiler
                  </button>
                </div>

                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f0f6fc', marginBottom: '0.6rem', fontFamily: 'Fira Code', lineHeight: 1.3 }}>
                  {activeSolution.title}
                </h3>
                <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {activeSolution.description}
                </p>
              </div>

              {/* Card 2: Deep Technical Analysis Grid (Root Cause & Attack Vector) */}
              <div className="grid-2" style={{ gap: '1.25rem' }}>
                {/* Root Cause Analysis */}
                <div className="cyber-card" style={{ background: '#0D1117' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00FFFF', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontFamily: 'Fira Code' }}>
                    <Cpu size={16} color="#00FFFF" />
                    Technical Root Cause Analysis
                  </h4>
                  <p style={{ color: '#c9d1d9', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {activeSolution.rootCause || 'Underlying memory / input validation defect during execution.'}
                  </p>
                </div>

                {/* Exploitation Impact & OWASP */}
                <div className="cyber-card" style={{ background: '#0D1117' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FF3333', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontFamily: 'Fira Code' }}>
                    <AlertTriangle size={16} color="#FF3333" />
                    Exploitation Threat & OWASP Category
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.83rem' }}>
                    <div>
                      <span style={{ color: '#8b949e', fontWeight: 700 }}>OWASP Mapping: </span>
                      <span style={{ color: '#00FF00', fontWeight: 700, fontFamily: 'Fira Code' }}>
                        {activeSolution.owaspCategory || 'OWASP Top 10 Security Vector'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#8b949e', fontWeight: 700 }}>Attack Vector: </span>
                      <span style={{ color: '#f0f6fc' }}>
                        {activeSolution.attackVector || 'Remote Input Injection'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#8b949e', fontWeight: 700 }}>Impact: </span>
                      <span style={{ color: '#FF3333', fontWeight: 700 }}>
                        {activeSolution.impact || 'System Compromise'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Side-by-Side Code Diff Viewer */}
              <DiffViewer
                vulnerableCode={activeSolution.vulnerableCode}
                patchedCode={activeSolution.patchedCode}
                title={`Code Diff & Patch Preview: ${activeSolution.category}`}
              />

              {/* Card 4: Interactive Remediation Action Plan & Fix Checklist */}
              <div className="cyber-card">
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f0f6fc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Fira Code' }}>
                  <ShieldCheck size={20} color="#00FF00" />
                  Recommended Action Plan & Fix Verification Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(activeSolution.remediationSteps || [
                    'Review affected code lines.',
                    'Replace insecure API functions with bounded alternatives.',
                    'Test changes with compiler warnings enabled.'
                  ]).map((step, idx) => {
                    const stepKey = `${activeSolution.vulnerabilityId}-${idx}`;
                    const isChecked = !!completedSteps[stepKey];

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem 0.95rem',
                          background: isChecked ? 'rgba(0, 255, 0, 0.08)' : '#0D1117',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: isChecked ? 'rgba(0, 255, 0, 0.4)' : 'rgba(0, 255, 255, 0.15)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <CheckCircle2
                          size={18}
                          color={isChecked ? '#00FF00' : '#484f58'}
                          style={{ marginTop: '2px', flexShrink: 0 }}
                        />
                        <span style={{
                          color: isChecked ? '#00FF00' : '#c9d1d9',
                          fontSize: '0.875rem',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          lineHeight: 1.5
                        }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 5: Compiler & Hardening Configuration Flags */}
              {activeSolution.compilerFlags && (
                <div className="cyber-card" style={{ background: '#0D1117' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00FFFF', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Fira Code' }}>
                    <Layers size={18} color="#00FFFF" />
                    Recommended Compiler Hardening & Safeguard Flags
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {activeSolution.compilerFlags.map((flag, idx) => (
                      <code
                        key={idx}
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: '#161b22',
                          border: '1px solid rgba(0, 255, 255, 0.3)',
                          borderRadius: '6px',
                          color: '#00FFFF',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        {flag}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Card 6: External References */}
              {activeSolution.references && activeSolution.references.length > 0 && (
                <div className="cyber-card" style={{ background: '#0D1117', padding: '1rem' }}>
                  <h5 style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'Fira Code' }}>
                    EXTERNAL SECURITY STANDARDS & MITRE CITATIONS
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {activeSolution.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#00FFFF',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          textDecoration: 'none',
                          fontFamily: 'Fira Code'
                        }}
                      >
                        <ExternalLink size={13} />
                        {ref}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
