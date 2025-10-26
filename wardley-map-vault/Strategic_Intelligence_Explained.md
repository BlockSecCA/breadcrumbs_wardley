# Strategic Intelligence Panel: What It Actually Does

## The Big Picture

When you create Wardley Maps using YAML frontmatter in your notes, you're making **strategic claims**:
- "This component is at the Product stage"
- "This is critically important to our business"
- "We have high confidence in this assessment"

The Strategic Intelligence panel is like a **fact-checker for your strategic thinking**. It asks uncomfortable questions:
- *"How do you know this?"*
- *"When did you last verify this?"*
- *"Does this claim make sense with your other claims?"*

## What You See: The Three Sections

### 1. Summary Cards (Top Row)

**Components**: How many strategic items you're analyzing
**Warnings**: Problems with your map's data quality
**Insights**: Strategic patterns the system detected

Think of warnings as **"your homework is incomplete"** and insights as **"here's something interesting you should know."**

---

### 2. Evolution Distribution (Bar Chart)

Shows how many components you have in each evolution stage:
- Genesis (red): Experimental, novel
- Custom (orange): Competitive advantage
- Product (blue): Best practices
- Commodity (green): Utilities

**What it tells you:**
- If everything is green → maybe you're being too conservative?
- If everything is red → are you really that innovative, or missing the boring infrastructure?
- Balanced distribution → probably realistic

This is a **sanity check on your overall map**.

#### Evolution Gap Warnings: Interpretation Guide

The plugin flags dependency chains that skip evolution stages. 
These warnings are **informational only** and require your judgment:

**Common patterns flagged:**
- Genesis → Commodity (innovation on stable platforms) → Usually normal
- Custom → Commodity (skipping Product) → Often normal  
- Commodity → Genesis (backwards dependency) → Usually problematic

**How to use:**
1. Review flagged components
2. Ask: "Does this make sense for my context?"
3. Ignore if intentional, investigate if unexpected

These warnings detect patterns, not problems. Only you know if a 
pattern represents technical debt, strategic choice, or 
documentation of current state.

---

### 3. Validation Warnings

These check the **quality of your strategic data**:

#### 🟡 Missing Evidence
**What it checks**: Does your YAML have `evidence_sources: [[links]]`?
**Why it matters**: Strategic claims without evidence are just opinions.
**The deeper check**: It actually verifies those `[[Note Name]]` links exist in your vault!

**Example scenario:**
```yaml
evidence_sources:
  - "[[Market Research 2024]]"
  - "[[Customer Survey]]"
```
If "Market Research 2024.md" doesn't exist → warning!

**Philosophy**: If you claim something strategic, you should be able to point to *where you learned it*.

---

#### 🔴 Outdated Validation
**What it checks**: The `last_validated: "2025-01-08"` date
**Why it matters**: Strategic assumptions decay. What was true 18 months ago might not be true today.

**The escalation logic:**
- 6+ months old → Yellow warning (🟡 medium)
- 12+ months old → Red warning (🔴 high)
- No date at all → Green warning (🟢 low, but still noted)

**Philosophy**: Strategy isn't "set and forget" - it requires regular validation.

---

#### 🟡 Low Confidence
**What it checks**: The `confidence_level` field
**Why it matters**: If you're not confident in an assessment, that's strategic uncertainty you should manage.

**Philosophy**: Knowing what you *don't* know is as important as knowing what you do know.

---

#### 🟢 Evolution Inconsistency
**What it checks**: Does your component type match its evolution stage?
**Why it matters**: Some combinations rarely make sense in reality.

**Built-in expectations:**
- `user_need` → usually genesis or custom (new needs don't start commoditized)
- `capability` → usually custom or product (capabilities are built, not bought)
- `component` or `service` → usually product or commodity (infrastructure tends to mature)

**Example weird combo:**
```yaml
type: user_need
evolution_stage: commodity
```
This says "we have a user need that's fully commoditized" - that's philosophically strange. Usually user needs drive the system and evolve slowly.

**Philosophy**: This is a gentle nudge saying "double-check this, it's unusual."

---

## 4. Strategic Insights

These analyze the **strategic patterns** in your map:

#### 📋 Orphaned Components
**What it finds**: Components with no `depends_on` or `enables` relationships
**Why it matters**: In Wardley Maps, everything should be part of the value chain. If something is isolated, either:
- You forgot to link it
- It doesn't actually belong on this map
- You discovered something truly independent (rare!)

**Philosophy**: Wardley Maps are about dependencies - orphans break that principle.

---

#### ⚡ Critical Path
**What it finds**: 
1. Anything marked `strategic_importance: critical`
2. Anything with 3+ dependency connections

**Why it matters**: These are your **bottlenecks and single points of failure**. If they break, everything breaks.

**The second rule is clever**: Even if you didn't mark something as critical, if many things depend on it, it *functionally* is critical. The system catches what you might have missed.

**Philosophy**: Know your dependencies, especially the critical ones.

---

#### 📋 Evolution Gap
**What it finds**: Dependency chains where evolution stages skip steps

**Example problematic chain:**
```
[Genesis component] depends_on [Commodity component]
```
You're depending on something 3 evolutionary stages more mature than you. This creates questions:
- Why are you in Genesis if your dependencies are so mature?
- Is there a Product/Custom version you should be depending on?
- Did you mis-categorize something?

**Philosophy**: Dependencies usually flow from less-evolved (top) to more-evolved (bottom). Big gaps suggest misunderstandings or opportunities.

---

#### ⚡ Dependency Risk
**What it finds**: Components that depend on risky dependencies

**A dependency is "risky" if:**
- It has `confidence_level: low`
- It hasn't been validated in 12+ months

**Why it matters**: Risk cascades upward in value chains. If your foundation is shaky, everything built on it is shaky.

**Philosophy**: You're only as strong as your weakest dependency.

---

## The Philosophy Behind All This

### Strategic Hygiene
Just like code needs linting and tests, **strategy needs validation**. The panel is asking:
- Are your claims backed by evidence?
- Are your assessments current?
- Do your assumptions hold together logically?

### Evidence-Based Strategy
Most Wardley Map tools let you draw whatever you want. This tool forces you to ask:
- *"How do I know this is at the Product stage?"*
- *"What evidence supports this being critical?"*
- *"When did I last check if this is still true?"*

### Treating Strategy Like Infrastructure
In DevOps, we don't just deploy code - we monitor it, test it, validate it. The Strategic Intelligence panel applies the same principle to strategy:
- **Validation dates** = health checks
- **Evidence sources** = test coverage
- **Confidence levels** = risk metrics
- **Warnings** = CI/CD failures

---

## How to Actually Use It

### Start Simple: Fix Warnings
1. Add validation dates to everything
2. Add evidence sources to critical/important components
3. Fix any low confidence ratings (or accept them consciously)

### Then: Act on Insights
1. Connect orphaned components (or remove them)
2. Double-check critical path items (validate + add evidence)
3. Investigate evolution gaps (are they real opportunities?)
4. Address dependency risks (fix the foundations first)

### Regular Maintenance
- **Daily**: Glance at the panel when working on strategic notes
- **Weekly**: Fix new warnings that appear
- **Monthly**: Review insights for strategic opportunities

---

## What It's NOT

❌ **Not a strategic advisor** - It won't tell you what strategy to pursue
❌ **Not AI magic** - It's rule-based checks, not LLM insights (yet)
❌ **Not mandatory** - You can ignore it entirely and just use the visual map
❌ **Not perfect** - Evolution inconsistency checks are heuristics, not laws

## What It IS

✅ **A quality checker** - Like spell-check for strategy
✅ **A reminder system** - "Did you validate this recently?"
✅ **A pattern detector** - Finds structural issues in your map
✅ **A forcing function** - Encourages evidence-based thinking

---

## Final Thought

The Strategic Intelligence panel treats your Wardley Map like **living documentation** that needs:
- Evidence (to be credible)
- Validation dates (to stay current)
- Logical consistency (to be trustworthy)
- Relationship mapping (to be useful)

It's the difference between:
- **Opinion mapping**: "I think this is at Product stage"
- **Evidence-based mapping**: "This is at Product stage because [[Market Analysis 2024]] shows 3 competing products with similar features, last validated 2024-12-15"

The second version is defensible, auditable, and maintainable. That's what the panel pushes you toward.
