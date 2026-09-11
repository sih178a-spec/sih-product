import React, { useState, useEffect } from 'react';
import ASTViewer from '../components/ASTViewer';
import IRViewer from '../components/IRViewer';
import RiskGauge from '../components/RiskGauge';
import { Lexer } from '../compiler/lexer';
import { Parser } from '../compiler/parser';
import { IRGenerator } from '../compiler/irGenerator';
import { RiskScorer } from '../compiler/riskScorer';
import { Terminal, Play, Cpu, Layers, Bug, Code2, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

const PRESET_SAMPLES = {
  jky_multi: {
    name: '.jky Full Multi-Severity Audit',
    language: 'jky',
    filename: 'multi_severity_audit.jky',
    code: `@import "jocky/audit"
@import "jocky/db"

func process_user_data(user_input, username, password) {
    // 1. CRITICAL: Unbounded Memory Buffer Copy
    var buffer = alloc_buffer(64);
    unsafe_copy(buffer, user_input);

    // 2. CRITICAL: OS Command Injection
    var shell_cmd = "log_event --payload " + buffer;
    execute_shell(shell_cmd);

    // 3. HIGH: SQL Command Injection
    var sql = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
    raw_sql_exec(sql);

    // 4. HIGH: Hardcoded API Secret Token
    var API_SECRET = "sk_live_998127391823719827391";

    // 5. MEDIUM: Insecure Weak PRNG
    var session_token = Math.random();

    // 6. LOW: Verbose Debug Log Leakage
    console.log("Debug session created: " + session_token);
    
    // 7. LOW: Uninitialized Untyped Variable
    var uninitialized_val;
}`
  },
  jky_forensic: {
    name: '.jky Cyber Forensic & Database Scan',
    language: 'jky',
    filename: 'forensic_scanner.jky',
    code: `@import "jocky/forensics"
@import "jocky/vault"

func run_forensic_investigation(target_ip, db_user) {
    // HIGH: SQL Query String Assembly
    var sql_query = "SELECT * FROM forensic_evidence WHERE investigator = '" + db_user + "'";
    query_db(sql_query);

    // CRITICAL: Unsanitized Shell Execution
    var ping_cmd = "ping -c 1 " + target_ip;
    system_run(ping_cmd);

    // HIGH: Hardcoded Vault Private Secret Key
    var VAULT_SECRET_KEY = "sec_vault_88719283719237";

    // HIGH: Dynamic Code Evaluation / Reflected XSS
    raw_eval("render_dashboard('" + target_ip + "')");

    // LOW: Debug Statement Leak
    debug_log("Investigation completed for IP: " + target_ip);
}`
  },
  jky_secure: {
    name: '.jky Secure Patched Code',
    language: 'jky',
    filename: 'secure_audit.jky',
    code: `@import "jocky/audit"
@import "jocky/vault"

func inspect_payload(user_input) {
    var buffer = alloc_buffer(64);
    // Secure bounded copy
    safe_copy(buffer, 64, user_input);
    
    audit.log("Safe payload processed");
}

func main() {
    var payload = gets_bounded(64);
    inspect_payload(payload);
    return 0;
}`
  },
  jky_exploits: {
    name: '.jky Advanced Exploits (SSRF & Traversal)',
    language: 'jky',
    filename: 'advanced_exploits.jky',
    code: `@import "jocky/net"
@import "jocky/fs"

func handle_remote_payload(user_url, file_path) {
    // 1. CRITICAL: Path Traversal
    var raw_file = file_read("../system/" + file_path);

    // 2. CRITICAL: Insecure Deserialization
    var obj = deserialize(raw_file);

    // 3. HIGH: SSRF Attack Vector
    var net_res = fetch_remote(user_url);

    // 4. MEDIUM: Hardcoded Private IP Leak
    var internal_gw = "192.168.1.254";

    // 5. MEDIUM: Use-After-Free Memory Reference
    free_buffer(obj);
}`
  },
  jky_blank: {
    name: '📝 Clean Slate Template',
    language: 'jky',
    filename: 'custom_scan.jky',
    code: `@import "jocky/audit"

func main() {
    // Write or paste your custom .jky code here to test new vulnerabilities!
    var input_data = gets();
    
    // Try typing: unsafe_copy, execute_shell, file_read, fetch_remote, etc.
    
    return 0;
}`
  }
};

export default function CompilerPage() {
  const [sourceCode, setSourceCode] = useState(PRESET_SAMPLES.jky_multi.code);
  const [language, setLanguage] = useState('jky');
  const [filename, setFilename] = useState('multi_severity_audit.jky');
  const [activeTab, setActiveTab] = useState('tokens'); // tokens | ast | ir | risk
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastCompiledAt, setLastCompiledAt] = useState(null);
  const [compileDuration, setCompileDuration] = useState(0);
  const [compileCount, setCompileCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  const runLocalScan = (codeToScan, langToScan, nameToScan) => {
    try {
      const lexer = new Lexer(codeToScan, langToScan);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const irGen = new IRGenerator();
      const irInstructions = irGen.generate(ast);
      const scorer = new RiskScorer();
      const evalResult = scorer.evaluate(codeToScan, tokens, ast, irInstructions);

      return {
        scanId: `SCAN-LOCAL-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        filename: nameToScan || 'multi_severity_audit.jky',
        language: langToScan || 'jky',
        sourceCode: codeToScan,
        totalRiskScore: evalResult.totalRiskScore,
        overallRiskSeverity: evalResult.overallRiskSeverity,
        findingCounts: evalResult.findingCounts,
        tokens,
        ast,
        irInstructions,
        findings: evalResult.findings,
        createdAt: new Date()
      };
    } catch (e) {
      console.error('Local scan failed:', e);
      return null;
    }
  };

  const executeScan = (codeToScan, langToScan, nameToScan, delay = 0) => {
    setLoading(true);
    setError(null);
    const targetCode = codeToScan !== undefined ? codeToScan : sourceCode;
    const targetLang = langToScan !== undefined ? langToScan : language;
    const targetName = nameToScan !== undefined ? nameToScan : filename;
    const startTime = performance.now();

    const processExecution = () => {
      const result = runLocalScan(targetCode, targetLang, targetName);
      const duration = Math.max(1, Math.round(performance.now() - startTime));

      if (result) {
        setScanResult(result);
        setActiveTab('risk');
        setLastCompiledAt(new Date().toLocaleTimeString());
        setCompileDuration(duration);
        setCompileCount(prev => prev + 1);
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 600);
      } else {
        setError('Compilation scan failed.');
      }
      setLoading(false);

      // Sync to backend asynchronously if available
      fetch('/api/compiler/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: targetCode, language: targetLang, filename: targetName })
      }).catch(() => {});
    };

    if (delay > 0) {
      setTimeout(processExecution, delay);
    } else {
      processExecution();
    }
  };

  useEffect(() => {
    executeScan(PRESET_SAMPLES.jky_multi.code, 'jky', 'multi_severity_audit.jky', 0);
  }, []);

  const handlePresetChange = (key) => {
    if (PRESET_SAMPLES[key]) {
      const sample = PRESET_SAMPLES[key];
      setSourceCode(sample.code);
      setLanguage(sample.language);
      setFilename(sample.filename);
      executeScan(sample.code, sample.language, sample.filename, 300);
    }
  };

  const generateRandomCodeChallenge = () => {
    const vulnSnippets = [
      '    var buf = alloc_buffer(32);\n    unsafe_copy(buf, input_val);\n',
      '    execute_shell("systemctl restart " + input_val);\n',
      '    raw_sql_exec("SELECT * FROM audit_logs WHERE id = \'" + input_val + "\'");\n',
      '    var API_KEY = "sk_live_" + Math.random();\n',
      '    var remote_content = fetch_remote("http://internal-api.local/" + input_val);\n',
      '    var secret_file = file_read("../etc/passwd/" + input_val);\n',
      '    var session_hash = MD5(input_val);\n',
      '    debug_log("Processing payload: " + input_val);\n',
      '    var internal_host = "192.168.1.100";\n',
      '    var raw_obj = deserialize(input_val);\n'
    ];

    const count = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...vulnSnippets].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const randomName = `scan_target_${Math.floor(Math.random() * 900 + 100)}.jky`;
    const generatedCode = `@import "jocky/audit"\n@import "jocky/security"\n\nfunc dynamic_handler_${Math.floor(Math.random() * 90 + 10)}(input_val) {\n` +
      selected.join('') +
      `    return 0;\n}`;

    setSourceCode(generatedCode);
    setFilename(randomName);
    executeScan(generatedCode, 'jky', randomName, 350);
  };

  const handleCompileAndScan = () => {
    executeScan(sourceCode, language, filename, 350);
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal color="#00f2fe" size={28} />
            .JKY Compiler & Security Analysis Engine
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time dynamic scanner: type custom code or pick presets to evaluate fresh vulnerabilities.
          </p>
        </div>

        {/* Preset sample buttons & Random Generator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={generateRandomCodeChallenge}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              borderRadius: '6px',
              border: '1px solid #00f2fe',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.2) 100%)',
              color: '#00f2fe',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={13} />
            🎲 Generate Random Test Code
          </button>

          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>PRESETS:</span>
          {Object.keys(PRESET_SAMPLES).map((key) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #1f293d',
                backgroundColor: '#111827',
                color: '#e5e7eb',
                cursor: 'pointer'
              }}
            >
              {PRESET_SAMPLES[key].filename}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Code Input Box */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={18} color="#00f2fe" />
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  fontFamily: 'Fira Code',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                background: '#0b0f19',
                border: '1px solid #1f293d',
                borderRadius: '6px',
                color: '#00f2fe',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <option value="jky">Jocky (.jky)</option>
            </select>
          </div>

          <textarea
            value={sourceCode}
            onChange={(e) => {
              const val = e.target.value;
              setSourceCode(val);
              executeScan(val, language, filename);
            }}
            className="code-font"
            style={{
              width: '100%',
              height: '380px',
              backgroundColor: '#0b0f19',
              border: '1px solid #1f293d',
              borderRadius: '8px',
              padding: '1rem',
              color: '#38bdf8',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical'
            }}
          />

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={handleCompileAndScan}
              disabled={loading}
              className="btn-cyber"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Running .JKY Lexer, AST Parser & IR Engine...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Compile & Scan .jky File
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pipeline Output Area */}
        <div className={`cyber-card ${isFlashing ? 'flash-active' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Live Compilation Status Indicator */}
          {lastCompiledAt && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.85rem',
              background: '#0b0f19',
              borderRadius: '8px',
              border: '1px solid #1f293d',
              marginBottom: '1rem',
              fontSize: '0.78rem',
              color: '#9ca3af',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: loading ? '#eab308' : '#22c55e',
                  boxShadow: loading ? '0 0 8px #eab308' : '0 0 8px #22c55e'
                }} />
                <strong style={{ color: '#ffffff' }}>
                  {loading ? 'COMPILING SOURCE...' : `COMPILATION #${compileCount} REFRESHED`}
                </strong>
                <span style={{ color: '#374151' }}>|</span>
                <span>Last Compiled: <strong style={{ color: '#00f2fe' }}>{lastCompiledAt}</strong></span>
                <span style={{ color: '#374151' }}>|</span>
                <span>Duration: <strong style={{ color: '#a7f3d0' }}>{compileDuration}ms</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Fira Code', fontSize: '0.72rem', color: '#6b7280' }}>
                <span>ID: {scanResult?.scanId}</span>
              </div>
            </div>
          )}

          {/* Output Stage Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1f293d', marginBottom: '1rem' }}>
            <button
              onClick={() => setActiveTab('tokens')}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'tokens' ? '2px solid #00f2fe' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === 'tokens' ? '#00f2fe' : '#9ca3af',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Code2 size={16} />
              1. .JKY Tokens ({scanResult ? (scanResult.tokens || []).length : 0})
            </button>

            <button
              onClick={() => setActiveTab('ast')}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'ast' ? '2px solid #00f2fe' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === 'ast' ? '#00f2fe' : '#9ca3af',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Layers size={16} />
              2. AST Tree
            </button>

            <button
              onClick={() => setActiveTab('ir')}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'ir' ? '2px solid #00f2fe' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === 'ir' ? '#00f2fe' : '#9ca3af',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Cpu size={16} />
              3. Lightweight IR
            </button>

            <button
              onClick={() => setActiveTab('risk')}
              style={{
                padding: '0.6rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'risk' ? '2px solid #ef4444' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === 'risk' ? '#ef4444' : '#9ca3af',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Bug size={16} />
              4. Risk Scorer Output
            </button>
          </div>

          {/* Tab Content Display */}
          <div style={{ flex: 1, minHeight: '380px', overflowY: 'auto', position: 'relative' }}>
            {error && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem' }}>
                <AlertTriangle size={18} style={{ marginRight: '0.5rem' }} />
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00f2fe', textAlign: 'center' }}>
                <RefreshCw size={40} className="spin" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Executing Jocky .JKY Compiler Pass...</h4>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.35rem' }}>
                  Running Lexer Tokenizer ➔ AST Parser ➔ TAC IR Generator ➔ Multi-Stage Risk Engine
                </p>
              </div>
            ) : !scanResult ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textAlign: 'center', padding: '3rem' }}>
                <Terminal size={48} style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>Ready to Compile .JKY Source Code</h4>
                <p style={{ fontSize: '0.85rem' }}>Click "Compile & Scan .jky File" to process code through the Jocky Lexer, AST Parser, IR Engine, and Risk Scorer.</p>
              </div>
            ) : (
              <>
                {/* TAB 1: LEXER TOKENS */}
                {activeTab === 'tokens' && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                      Token Stream ({scanResult.tokens.length} tokens generated by .JKY Lexer):
                    </h4>
                    <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #1f293d', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#0b0f19', color: '#9ca3af', textAlign: 'left', borderBottom: '1px solid #1f293d' }}>
                            <th style={{ padding: '0.5rem 0.75rem' }}>Line:Col</th>
                            <th style={{ padding: '0.5rem 0.75rem' }}>Token Type</th>
                            <th style={{ padding: '0.5rem 0.75rem' }}>Token Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scanResult.tokens.map((tok, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #1f293d' }}>
                              <td style={{ padding: '0.4rem 0.75rem', color: '#6b7280' }}>{tok.line}:{tok.column}</td>
                              <td style={{ padding: '0.4rem 0.75rem', fontWeight: 700, color: tok.type === 'KEYWORD' ? '#f472b6' : tok.type === 'STRING_LITERAL' ? '#a7f3d0' : '#38bdf8' }}>
                                {tok.type}
                              </td>
                              <td className="code-font" style={{ padding: '0.4rem 0.75rem', color: '#ffffff' }}>
                                {tok.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: AST TREE */}
                {activeTab === 'ast' && (
                  <ASTViewer ast={scanResult.ast} />
                )}

                {/* TAB 3: LIGHTWEIGHT IR */}
                {activeTab === 'ir' && (
                  <IRViewer instructions={scanResult.irInstructions} />
                )}

                {/* TAB 4: RISK SCORER OUTPUT */}
                {activeTab === 'risk' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#0b0f19', borderRadius: '12px', border: '1px solid #1f293d', marginBottom: '1.25rem' }}>
                      <RiskGauge score={scanResult.totalRiskScore} severity={scanResult.overallRiskSeverity} size={130} />
                      <div style={{ flex: 1, marginLeft: '1.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                          .JKY Risk Evaluation Summary
                        </h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0.25rem 0 0.5rem 0' }}>
                          Total Score: <strong style={{ color: '#ffffff' }}>{scanResult.totalRiskScore} / 100 MAX</strong> | Status: <span className={`cyber-badge badge-${(scanResult.overallRiskSeverity || 'LOW').toLowerCase()}`}>{scanResult.overallRiskSeverity}</span>
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          <span style={{ color: '#ef4444' }}>{scanResult.findingCounts.critical} Critical</span>
                          <span style={{ color: '#f97316' }}>{scanResult.findingCounts.high} High</span>
                          <span style={{ color: '#eab308' }}>{scanResult.findingCounts.medium} Medium</span>
                          <span style={{ color: '#22c55e' }}>{scanResult.findingCounts.low} Low</span>
                        </div>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
                      Detected Vulnerability Findings ({scanResult.findings.length}):
                    </h4>

                    {scanResult.findings.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: '#22c55e' }}>
                        <ShieldCheck size={28} style={{ marginBottom: '0.25rem' }} />
                        <p style={{ fontWeight: 700 }}>No vulnerability findings detected!</p>
                        <p style={{ fontSize: '0.8rem' }}>.JKY code passed static lexer/AST security evaluation clean.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {scanResult.findings.map((f, idx) => (
                          <div key={idx} style={{ padding: '0.85rem', background: '#0b0f19', borderRadius: '8px', border: '1px solid #1f293d' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={`cyber-badge badge-${(f.severity || 'LOW').toLowerCase()}`}>
                                  {f.severity} (+{f.scoreContribution} pts)
                                </span>
                                <span style={{ fontFamily: 'Fira Code', color: '#00f2fe', fontSize: '0.8rem', fontWeight: 700 }}>
                                  {f.cweId}
                                </span>
                                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>
                                  {f.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Line {f.lineNumber}</span>
                            </div>

                            <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                              {f.description}
                            </p>

                            <pre className="code-font" style={{ background: '#111827', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#f87171', marginBottom: '0.5rem' }}>
                              {f.codeSnippet}
                            </pre>

                            <p style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>
                              💡 Recommendation: {f.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
