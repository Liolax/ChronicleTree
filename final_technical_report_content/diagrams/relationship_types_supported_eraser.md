title Decision Tree for ChronicleTree Relationship Types

// Relationship type outcomes
Parent Relationship    [icon: user-tie,      color: blue]
Child Relationship     [icon: user-tie,         color: green]
Sibling Relationship   [icon: user-tie,  color: orange]
Current Spouse         [icon: heart, color: lightpink]
Ex-Spouse              [icon: heart, color: gray]
Deceased Spouse        [icon: cross,         color: gray]

// Decision points
Adding New Relationship [icon: user-plus,     color: purple]
Same Generation        [icon: layer-group,   color: orange]
Blood Related          [icon: dna,           color: violet]
Marriage Status        [icon: balance-scale, color: pink]
Spouse Alive           [icon: check-circle,  color: pink]
Still Married          [icon: handshake,     color: pink]

// Age and validation checks
Age Difference         [icon: clock, color: violet]
Shared Parent          [icon: user,           color: orange]
Marriage Age Valid     [icon: gavel,          color: pink]

// Start the decision tree
Adding New Relationship > Blood Related              [shape: oval]: "Creating family connection"

// Blood relationship path
Blood Related          > Same Generation            [shape: oval]: Yes
Blood Related          > Age Difference             [shape: oval]: No

// Same generation – siblings
Same Generation        > Shared Parent             [shape: oval]: Yes
Same Generation        > Current Spouse            [shape: oval]: No

Shared Parent          > Sibling Relationship       : Yes
Shared Parent          > Current Spouse            : No

// Different generations – parent/child
Age Difference         > Parent Relationship        : "Person is older"
Age Difference         > Child Relationship         : "Person is younger"

// Marriage path
Blood Related          > Marriage Status           [shape: oval]: No
Marriage Status        > Marriage Age Valid        [shape: oval]: "Checking marriage"

// Marriage age validation outcomes
Marriage Age Valid     > Current Spouse            : "Valid marriage age"
Marriage Age Valid     > Error                     [icon: warning, color: violet]: "Too young to marry"

// Marriage status variations
Current Spouse         > Spouse Alive              [shape: oval]: "Marriage created"
Spouse Alive           > Still Married             [shape: oval]: Yes
Spouse Alive           > Deceased Spouse           : No

Still Married          > Current Spouse            : Yes
Still Married          > Ex-Spouse                 : No

// Validation rules
note right of Blood Related    : "Business Rule:\nBlood relatives cannot marry\nPrevents invalid relationships"
note bottom of Marriage Age Valid : "Temporal Validation:\nMinimum marriage age check\nAge difference validation"
note left of Shared Parent     : "Automatic Sibling Creation:\nWhen parent-child added\nSiblings auto-generated"
note top of Current Spouse     : "Single Spouse Rule:\nOnly one current spouse\nPrevious must be ex/deceased"