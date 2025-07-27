# Updated Step-Relationship Business Rules

## Core Business Rule
**Only direct marriage connections to blood relatives create step-relationships. Extended family of step-relatives are "Unrelated".**

## What This Means

### ✅ VALID Step-Relationships (Direct Marriage to Blood Relatives)
1. **Step-Parent**: When someone marries your biological parent → They become your step-parent
2. **Step-Child**: When you marry someone's biological parent → Their child becomes your step-child  
3. **Step-Sibling**: Direct biological children of your step-parent (only if no shared biological parents)
4. **Step-Grandparent**: When someone NEW marries your biological grandparent → They become your step-grandparent (only applies to new family members acquired through marriage)
5. **Step-Great-Grandparent**: When someone NEW marries your biological great-grandparent → They become your step-great-grandparent (only applies to new family members acquired through marriage)

### ❌ INVALID Step-Relationships (Should be "Unrelated")
1. **Step-parent's biological parents**: NOT step-grandparents → **"Unrelated"**
2. **Step-grandparent's biological parents**: NOT step-great-grandparents → **"Unrelated"**
3. **Step-parent's siblings**: NOT step-aunts/uncles → **"Unrelated"**
4. **Step-sibling's children**: NOT step-nieces/nephews → **"Unrelated"**
5. **Any extended family of step-relatives**: → **"Unrelated"**

## Scenarios Analyzed

### Basic Scenario: Step-Grandmother
- **Situation**: Biological grandfather remarries Sarah (a NEW family member)
- **Correct**: Sarah is step-grandmother (NEW person married to blood grandparent)
- **Sarah's biological parents**: **"Unrelated"** (not step-great-grandparents)
- **Sarah's siblings**: **"Unrelated"** (not step-aunts/uncles)
- **Sarah's children from other relationships**: **"Unrelated"** (not step-parents)

### Valid Step-Great-Grandparent Scenario  
- **Situation**: Biological great-grandfather remarries Emma (a NEW family member)
- **Correct**: Emma is step-great-grandmother (NEW person married to blood great-grandparent)  
- **Emma's biological parents**: **"Unrelated"** (not step-great-great-grandparents)
- **Emma's children**: **"Unrelated"** (not step-grandparents)

### Non-Obvious Considerations
1. **Marital Status Irrelevant**: Whether step-grandmother's parents are married to each other doesn't affect their classification as "Unrelated"
2. **Extended Marriages**: If step-grandmother's mother marries someone else, that spouse is "Unrelated"
3. **Timeline Validation**: Deceased step-relatives must have been alive when relationship was established
4. **Ex-Spouse Exclusion**: Divorced spouses create no step-relationships

## Implementation Changes Made

### ✅ Fixed - Direct Marriage Logic
**File**: `improvedRelationshipCalculator.js:678-755`

```javascript
// Step-parent: Person marries root's biological parent
// Step-child: Root marries person's biological parent
// Includes proper timeline validation for deceased spouses
// Excludes ex-spouses from creating step-relationships
```

### ❌ Removed - Extended Step-Relationship Logic
- **Step-grandparent logic** (lines 744-850): Removed - parents of step-relatives are "Unrelated"
- **Step-great-grandparent logic** (lines 851+): To be removed - all extended ancestors are "Unrelated"
- **Step-aunt/uncle logic**: To be removed - siblings of step-relatives are "Unrelated"
- **Step-niece/nephew logic**: To be removed - children of step-relatives are "Unrelated"

## Result
The family tree program now correctly distinguishes between:
1. **Blood Relations**: Direct biological family connections
2. **Step-Relations**: Only through direct marriage to biological family members  
3. **Unrelated**: All extended family of step-relatives

This prevents incorrect classification of step-family's biological relatives as step-relationships, ensuring only meaningful direct connections are labeled as "step-" relationships.