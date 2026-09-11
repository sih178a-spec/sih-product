const Lexer = require('../compiler/lexer');
const Parser = require('../compiler/parser');
const IRGenerator = require('../compiler/irGenerator');
const RiskScorer = require('../compiler/riskScorer');
const Scan = require('../models/Scan');
const { getIsConnected, memoryDb } = require('../config/db');

exports.compileAndScan = async (req, res) => {
  try {
    const { sourceCode, language = 'cpp', filename = 'sample.cpp' } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ error: 'sourceCode parameter is required.' });
    }

    // 1. Tokenize
    const lexer = new Lexer(sourceCode, language);
    const tokens = lexer.tokenize();

    // 2. Parse into AST
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // 3. Generate Lightweight IR
    const irGen = new IRGenerator();
    const irInstructions = irGen.generate(ast);

    // 4. Run Risk Scoring Engine
    const riskScorer = new RiskScorer();
    const evaluation = riskScorer.evaluate(sourceCode, tokens, ast, irInstructions);

    const scanRecord = {
      scanId: `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      filename,
      language,
      sourceCode,
      totalRiskScore: evaluation.totalRiskScore,
      overallRiskSeverity: evaluation.overallRiskSeverity,
      findingCounts: evaluation.findingCounts,
      tokens,
      ast,
      irInstructions,
      findings: evaluation.findings,
      createdAt: new Date()
    };

    // Save scan to DB (or memoryDb fallback)
    if (getIsConnected()) {
      await Scan.create(scanRecord);
    } else {
      memoryDb.scans.unshift(scanRecord);
    }

    return res.status(200).json({
      success: true,
      scan: scanRecord
    });
  } catch (err) {
    console.error('Compiler Error:', err);
    return res.status(500).json({ error: 'Compilation failed: ' + err.message });
  }
};
