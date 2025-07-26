# Step-Relationship Business Rules Documentation

## Overview
This document clarifies the business rules for step-relationships in the ChronicleTree family tree application, particularly regarding step-great-grandparent relationships.

## Step-Great-Grandparent Logic

### Principle
Step-relationships follow logical family tree extensions:
- If Person A is Person B's step-grandparent, then Person A's parents are Person B's step-great-grandparents
- This creates meaningful family connections that reflect real-world step-family dynamics

### Example Case: Bob Anderson Family Tree
```
William + Patricia → Lisa
John + Jane → Alice
John + Lisa (current marriage)
Alice + David → Bob Anderson
```

**Relationships to Bob Anderson:**
- John: Biological Grandfather
- Lisa: Step-Grandmother (John's current wife)
- William: Step-Great-Grandfather (Lisa's father)
- Patricia: Step-Great-Grandmother (Lisa's mother)

### Business Rule Decision
**ADOPTED RULE**: Step-great-grandparent relationships are VALID and should be calculated.

**Rationale:**
1. **Logical Consistency**: If Lisa is Bob's step-grandmother, her parents naturally become Bob's step-great-grandparents
2. **Real-World Relevance**: In blended families, extended step-family members often have meaningful relationships
3. **System Completeness**: Allows for comprehensive family tree visualization
4. **User Expectations**: Users expect step-relationships to extend logically through generations

### Alternative Rule (Rejected)
**REJECTED RULE**: Step-great-grandparents should be considered "Unrelated"

**Reasons for Rejection:**
1. Creates logical inconsistency (why would step-relationships stop at grandparent level?)
2. Limits system's ability to represent complex family structures
3. May confuse users who expect logical relationship extensions

## Implementation Status
- ✅ Step-great-grandparent detection implemented
- ✅ Bidirectional relationships working (A→B and B→A)
- ✅ Timeline validation applied (deceased people can't form new step-relationships)
- ✅ Ex-spouse exclusion (step-relationships end with divorce)

## Test Results
All step-great-grandparent relationship tests pass:
- William → Bob: "Step-Great-Grandfather" ✅
- Patricia → Bob: "Step-Great-Grandmother" ✅  
- Bob → William: "Step-Great-Grandson" ✅
- Bob → Patricia: "Step-Great-Grandson" ✅

## Updated Test Expectations
Tests have been updated to reflect the adopted business rule:
- `test_bob_lisa_step_grandparent.js`: Now expects step-great-grandparent relationships
- `test_william_bob_step_great_grandparent.js`: Confirms bidirectional relationships work

## Related Files
- `chronicle_tree_client/src/utils/improvedRelationshipCalculator.js`: Core logic implementation
- `test_bob_lisa_step_grandparent.js`: Updated test expectations
- `test_william_bob_step_great_grandparent.js`: Comprehensive bidirectional testing

---
*Last Updated: 2025-01-25*
*Decision Made By: Development Team based on logical consistency and user expectations*