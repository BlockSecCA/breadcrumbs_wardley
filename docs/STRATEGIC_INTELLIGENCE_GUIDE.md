# Strategic Intelligence Panel User Guide

## 🎯 Quick Start

1. **Open Wardley Map view** in Obsidian
2. **Look for analysis icon** (📊) next to the map selector
3. **Click to open Strategic Intelligence panel**
4. **Review warnings and insights** to improve your map

## 📊 What Each Section Shows

### Summary Cards
- **Components**: Total strategic components analyzed
- **Warnings**: Issues needing attention (🔴 red = urgent)
- **Insights**: Strategic opportunities (🔵 blue = actionable)

### Evolution Distribution
Visual bars showing component spread across evolution stages:
- **Genesis**: Novel, experimental, uncertain
- **Custom**: Competitive advantage, bespoke
- **Product**: Best practices, standardized  
- **Commodity**: Utility, stable, well-defined

## 🚨 Warning Types & How to Fix

### 🟡 Low Confidence
**Issue**: Component marked with low confidence
**Fix in YAML frontmatter**:
```yaml
# Change from:
confidence_level: low

# To:
confidence_level: high
```

### 🟡 Missing Evidence  
**Issue**: No evidence sources documented
**Fix in YAML frontmatter**:
```yaml
evidence_sources:
  - "[[Market Research 2024]]"
  - "[[Customer Feedback Survey]]"
  - "[[Competitor Analysis]]"
  - "[[Technical Assessment]]"
```

**Note**: Evidence sources should be Obsidian note links using `[[Note Name]]` format. These notes can contain any content - research data, analysis, meeting minutes, etc. They don't need strategic YAML frontmatter.

### 🔴🟡 Outdated Validation
**Issue**: `last_validated` is old (>6 months) or missing
**Fix in YAML frontmatter**:
```yaml
last_validated: "2025-01-08"  # Today's date
```

### 🟢 Evolution Inconsistency
**Issue**: Evolution stage doesn't match component type
**Common inconsistencies**:
- User needs in commodity stage (should be genesis/custom)
- Infrastructure in genesis stage (should be product/commodity)

**Fix by adjusting type or evolution_stage**:
```yaml
# For user needs:
type: user_need
evolution_stage: genesis  # or custom

# For infrastructure:
type: component  
evolution_stage: commodity  # or product
```

## 💡 Insight Types & How to Act

### 📋 Orphaned Components
**What**: Components with no strategic relationships
**Why important**: May indicate isolated capabilities or missing dependencies
**Action**: Add relationships in YAML:
```yaml
depends_on:
  - "[[Related Component]]"
enables:
  - "[[Dependent Component]]"
```

### ⚡ Critical Path
**What**: Components marked critical or with many dependencies
**Why important**: Strategic bottlenecks that affect everything else
**Action**: 
1. Ensure high confidence level
2. Add recent validation date
3. Document evidence sources
4. Consider backup options

### 📋 Evolution Gap
**What**: Missing evolution stages in dependency chains  
**Why important**: May indicate strategic opportunities or transition risks
**Action**: 
1. Check if intermediate stages exist but aren't documented
2. Consider if evolution transition is too rapid
3. Look for market opportunities in gaps

### ⚡ Dependency Risk
**What**: Components depending on unreliable dependencies
**Why important**: Risk cascades up the value chain
**Action**:
1. Fix the dependency issues first
2. Find alternative dependencies
3. Increase monitoring of risky dependencies

## 🛠️ Tea Shop Example Action Plan

Based on the Tea Shop Wardley Map, here's a practical improvement plan:

### Step 1: Add Validation Dates
Add to ALL components:
```yaml
last_validated: "2025-01-08"
```

### Step 2: Add Evidence Sources
For each component, add relevant evidence:

**Business (user need)**:
```yaml
evidence_sources:
  - "[[Customer Interviews]]"
  - "[[Market Demand Analysis]]"
  - "[[Revenue Data]]"
```

**Tea/Cup (commodity)**:
```yaml
evidence_sources:
  - "[[Supplier Catalogs]]" 
  - "[[Market Pricing Analysis]]"
  - "[[Availability Assessment]]"
```

**Kettle (custom)**:
```yaml
evidence_sources:
  - "[[Craftsmanship Assessment]]"
  - "[[Unique Features Analysis]]" 
  - "[[Custom Build Documentation]]"
```

### Step 3: Set Confidence Levels
Based on evidence quality:
- **High**: Well-documented with recent data
- **Medium**: Some evidence but could be stronger  
- **Low**: Assumptions or old data

### Step 4: Add Missing Relationships
Example for **Electric Kettle**:
```yaml
depends_on:
  - "[[Power]]"        # Needs electricity
enables:
  - "[[Hot Water]]"    # Produces hot water
evolved_from:
  - "[[Kettle]]"       # Evolution relationship
```

### Step 5: Set Strategic Importance
- **Critical**: Business, Cup of Tea (core value)
- **Important**: Hot Water, Kettle (key enablers)  
- **Supporting**: Cup, Tea, Water, Power (commodities)

## 📈 Strategic Analysis Workflow

### Daily Practice
1. **Review warnings** - fix data quality issues
2. **Check insights** - identify strategic opportunities
3. **Update validation dates** - keep assessments current
4. **Monitor evolution** - track component maturity

### Weekly Practice  
1. **Add new evidence** - document new research/data
2. **Reassess confidence** - adjust based on new information
3. **Review relationships** - ensure dependencies are current
4. **Update strategic importance** - based on business changes

### Monthly Practice
1. **Strategic review** - deep analysis of insights
2. **Evolution planning** - plan component transitions
3. **Risk assessment** - address dependency risks
4. **Map validation** - comprehensive accuracy check

## 🎯 Success Metrics

### Quality Indicators
- **Zero red warnings** (no high-severity issues)
- **All components validated** within 3 months
- **Evidence documented** for all critical/important components
- **No orphaned components** (all have relationships)

### Strategic Indicators  
- **Balanced evolution distribution** (not all in one stage)
- **Clear critical path** identified and protected
- **Dependencies well-understood** and documented
- **Evolution opportunities** identified and planned

## 🔧 Advanced Usage

### Custom Analysis
The intelligence panel can be extended with custom metrics:
- Industry-specific validation criteria
- Custom evidence source types  
- Domain-specific inconsistency checks
- Advanced dependency risk models

### Integration with Planning
Use insights to drive strategic planning:
- Evolution roadmaps based on gap analysis
- Investment priorities from critical path analysis
- Risk mitigation from dependency analysis
- Innovation opportunities from evolution tracking

---

**Remember**: The intelligence panel is most valuable when used regularly to maintain map quality and identify strategic opportunities. Start with fixing warnings, then use insights to drive strategic decisions.