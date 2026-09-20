import {
  Mindmap,
  MindmapSummary,
  CreateMindmapInput,
  UpdateMindmapInput,
  markdownToMindmap,
} from "@/domain/mindmap/types";
import { MindmapRepository } from "./mindmap-repository";
import { StorageProvider } from "../storage/storage-provider";
import { LocalStorageProvider } from "../storage/local-storage";
import { generateId } from "@/utils/ids";

const MINDMAPS_INDEX_KEY = "mindmaps_index";
const MINDMAP_PREFIX = "mindmap_";

const DEFAULT_SEED_MARKDOWN = `# Loan Management System – Microservices Architecture
  - Core Lending Services
    - Loan Origination Service (LOS)
      - Application Intake & Parser
      - KYC & AML Verification
      - Deduplication Engine
    - Underwriting Engine
      - Credit Score Evaluator
      - Debt-to-Income (DTI) Analyzer
      - Automated Decision Rules
    - Servicing & Repayment
      - Payment Schedule Calculator
      - Auto-Debit & ACH Scheduler
      - Delinquency & Collections Manager
    - Collateral Management
      - Vehicle & Property Valuation
      - Lien Verification & Perfection
  - Integration Gateway
    - Credit Bureau APIs (Experian, TransUnion, Equifax)
    - Open Banking & Aggregation (Plaid, MX)
    - Payment Processors (Stripe, ACH Network, Wire)
    - Core Banking Systems (FIS, Fiserv, Temenos)
  - Compliance & Security
    - Identity & Access Management (OAuth2 / OIDC)
    - Immutable Audit Trails
    - Regulatory Reporting (HMDA, Fair Lending)
    - Data Encryption (At-Rest AES-256, In-Transit TLS 1.3)
  - Analytics & Intelligence
    - Default Risk Predictor (ML Model)
    - Real-time Portfolio Health Dashboard
    - Customer Churn & Refinance Predictor
    - Fraud Anomaly Detection`;

const SHOWCASE_UNDERWRITING_MARKDOWN = `# Loan Journey Underwriting & Calculation Matrix
  - Underwriting Calculations & Formulas
    - Equated Monthly Installment (EMI)
      $$\\text{EMI} = \\frac{P \\times r \\times (1+r)^n}{(1+r)^n - 1}$$
    - Debt-to-Income (DTI) Ratio
      $$\\text{DTI} = \\frac{\\sum \\text{Monthly Debt Obligations}}{\\text{Gross Monthly Income}} \\times 100\\%$$
    - Loan-to-Value (LTV) Ratio
      $$\\text{LTV} = \\frac{\\text{Requested Loan Amount}}{\\text{Appraised Collateral Value}} \\times 100\\%$$
  - Risk Tiering & Interest Rate Matrix
    - Credit Score Pricing Table
      | Score Tier | Base APR | Max LTV | STP Eligible | Fee |
      | :--- | :--- | :--- | :--- | :--- |
      | Tier 1 (750+) | 8.50% | 90% | Yes | 0.5% |
      | Tier 2 (700-749) | 9.75% | 80% | Review | 1.0% |
      | Tier 3 (< 700) | 12.50% | 65% | No | 2.0% |
  - Integration APIs & Event Payloads
    - Bureau Query Payload (CIBIL/Experian)
      \`\`\`json
      {
        "applicantId": "APP-2026-9812",
        "pan": "ABCDE1234F",
        "inquiryType": "PERSONAL_LOAN",
        "bureau": "CIBIL"
      }
      \`\`\`
    - Core Banking Disbursement Webhook
      \`\`\`json
      {
        "loanId": "LN-772910",
        "amount": 250000,
        "beneficiaryAccount": "918237192831",
        "paymentRail": "IMPS_INSTANT"
      }
      \`\`\`
  - Regulatory Governance
    - Mandatory Compliance Gates
      - Fair Lending Act Verification
      - Aadhaar e-KYC Biometric Verification
      - Anti-Money Laundering (AML) Sanctions Screening`;

export class LocalMindmapRepository implements MindmapRepository {
  private storage: StorageProvider;
  private initialized: boolean = false;

  constructor(storage?: StorageProvider) {
    this.storage = storage ?? new LocalStorageProvider();
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    let index =
      (await this.storage.getItem<string[]>(MINDMAPS_INDEX_KEY)) || [];

    const seedId = "mindmap-sample-lms-architecture";
    const showcaseId = "mindmap-sample-underwriting-matrix";

    const hasSeed = index.includes(seedId);
    const hasShowcase = index.includes(showcaseId);

    if (!hasSeed) {
      const seedMindmap = markdownToMindmap(
        DEFAULT_SEED_MARKDOWN,
        seedId,
        "Loan Management System – Microservices Architecture",
      );
      seedMindmap.isPinned = false;
      seedMindmap.description =
        "Enterprise cloud-native microservices architecture for loan origination, servicing, and intelligence.";
      await this.storage.setItem(`${MINDMAP_PREFIX}${seedId}`, seedMindmap);
      index.push(seedId);
    }

    if (!hasShowcase) {
      const showcaseMindmap = markdownToMindmap(
        SHOWCASE_UNDERWRITING_MARKDOWN,
        showcaseId,
        "Loan Journey Underwriting & Calculation Matrix",
      );
      showcaseMindmap.isPinned = true;
      showcaseMindmap.description =
        "Showcase of rich Markdown capabilities in Loan Journey Crafter: EMI/DTI formulas, pricing rate tables, and API JSON payloads.";
      await this.storage.setItem(
        `${MINDMAP_PREFIX}${showcaseId}`,
        showcaseMindmap,
      );
      index.unshift(showcaseId); // Place showcase first
    }

    await this.storage.setItem(MINDMAPS_INDEX_KEY, index);
    this.initialized = true;
  }

  private mindmapToSummary(mindmap: Mindmap): MindmapSummary {
    const branchCount = mindmap.nodes.filter(
      (n) => n.parentId === mindmap.rootId,
    ).length;
    return {
      id: mindmap.id,
      title: mindmap.title,
      description: mindmap.description,
      nodeCount: mindmap.nodes.length,
      branchCount,
      createdAt: mindmap.createdAt,
      updatedAt: mindmap.updatedAt,
      isPinned: !!mindmap.isPinned,
    };
  }

  async list(): Promise<MindmapSummary[]> {
    await this.ensureInitialized();
    const index =
      (await this.storage.getItem<string[]>(MINDMAPS_INDEX_KEY)) ?? [];
    const summaries: MindmapSummary[] = [];

    for (const id of index) {
      const mindmap = await this.storage.getItem<Mindmap>(
        `${MINDMAP_PREFIX}${id}`,
      );
      if (mindmap) {
        summaries.push(this.mindmapToSummary(mindmap));
      }
    }

    return summaries.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  async get(id: string): Promise<Mindmap | null> {
    await this.ensureInitialized();
    return this.storage.getItem<Mindmap>(`${MINDMAP_PREFIX}${id}`);
  }

  async create(input: CreateMindmapInput): Promise<Mindmap> {
    await this.ensureInitialized();
    const id = `mindmap-${generateId()}`;
    let mindmap: Mindmap;

    if (input.initialMarkdown && input.initialMarkdown.trim()) {
      mindmap = markdownToMindmap(input.initialMarkdown, id, input.title);
      if (input.description) mindmap.description = input.description;
    } else {
      const now = new Date().toISOString();
      const rootId = `${id}-root`;
      mindmap = {
        id,
        title: input.title,
        description: input.description ?? "Blank MindMap",
        rootId,
        nodes: [
          {
            id: rootId,
            label: input.title,
            parentId: null,
            isRoot: true,
            collapsed: false,
            color: "#1e293b",
            depth: 0,
            order: 0,
          },
        ],
        createdAt: now,
        updatedAt: now,
        isPinned: false,
      };
    }

    await this.storage.setItem(`${MINDMAP_PREFIX}${id}`, mindmap);

    const index =
      (await this.storage.getItem<string[]>(MINDMAPS_INDEX_KEY)) ?? [];
    if (!index.includes(id)) {
      index.unshift(id);
      await this.storage.setItem(MINDMAPS_INDEX_KEY, index);
    }

    return mindmap;
  }

  async update(id: string, input: UpdateMindmapInput): Promise<Mindmap> {
    await this.ensureInitialized();
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Mindmap not found: ${id}`);
    }

    const updated: Mindmap = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      nodes: input.nodes ?? existing.nodes,
      isPinned:
        input.isPinned !== undefined ? input.isPinned : existing.isPinned,
      updatedAt: new Date().toISOString(),
    };

    // If title changed, update root node label as well
    if (input.title && input.title !== existing.title) {
      updated.nodes = updated.nodes.map((n) =>
        n.id === updated.rootId ? { ...n, label: input.title! } : n,
      );
    }

    await this.storage.setItem(`${MINDMAP_PREFIX}${id}`, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();
    await this.storage.removeItem(`${MINDMAP_PREFIX}${id}`);

    const index =
      (await this.storage.getItem<string[]>(MINDMAPS_INDEX_KEY)) ?? [];
    const filtered = index.filter((item) => item !== id);
    await this.storage.setItem(MINDMAPS_INDEX_KEY, filtered);

    return true;
  }

  async togglePin(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const mindmap = await this.get(id);
    if (!mindmap) return false;

    const newPinned = !mindmap.isPinned;
    await this.update(id, { isPinned: newPinned });
    return newPinned;
  }
}
