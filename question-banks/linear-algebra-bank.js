// ============================================
// LINEAR ALGEBRA — question bank
// ============================================
// 1 subject, 4 topics, 40 questions (mix of MCQ / Fill / Theory).
// Every question, option, answer and explanation is drenched in
// MathJax so the app exercises the full rendering pipeline.
//
// Format reminder (see question-loader.js for the parser):
//   Subject:  <name>
//   Topic:    <name>
//   Type:     MCQ | Fill | Theory
//   Q###:     <question text>
//   Option:   A: <text>   (MCQ only)
//   Answer:   <A|B|C|D|text>
//   Marks:    <number>    (Theory only; defaults to 10)
//   Explanation: <text>   (multi-line continuation lines OK)
// ============================================

window.CBT_SUBJECT_BANKS = window.CBT_SUBJECT_BANKS || [];
window.CBT_SUBJECT_BANKS.push(`

Subject: Linear Algebra
Topic: Matrices and Determinants

Type: MCQ
Q001: A matrix of order \\( m \\times n \\) is best described as:
Option: A: A rectangular array of \\( mn \\) entries arranged in \\( m \\) rows and \\( n \\) columns
Option: B: A square array of \\( m^{2} \\) entries
Option: C: A single scalar of magnitude \\( mn \\)
Option: D: A vector of length \\( m + n \\)
Answer: A
Explanation: A matrix \\( A \\) of order \\( m \times n \\) has entries \\( a_{ij} \\) indexed by row \\( i \in \{1,\dots,m\} \\) and column \\( j \in \{1,\dots,n\} \\). The total number of entries is the product \\( m \cdot n \\). A matrix is square only when \\( m = n \\), so option B is a special case, not the general definition.

Type: MCQ
Q002: The determinant of the \\( 2 \times 2 \\) matrix \\( A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\) is:
Option: A: \\( ad - bc \\)
Option: B: \\( ab - cd \\)
Option: C: \\( ac - bd \\)
Option: D: \\( a + d - b - c \\)
Answer: A
Explanation: By the Laplace expansion along the first row, \\( \det(A) = a \det(d) - b \det(c) = ad - bc \\). Geometrically, \\( |\det(A)| \\) equals the area of the parallelogram spanned by the column vectors \\( (a,c)^{T} \\) and \\( (b,d)^{T} \\), and the sign indicates the orientation of the induced linear map \\( \mathbb{R}^{2} \to \mathbb{R}^{2} \\).

Type: MCQ
Q003: The transpose \\( A^{T} \\) of an \\( m \times n \\) matrix \\( A \\) is:
Option: A: The \\( n \times m \\) matrix with \\( (A^{T})_{ij} = a_{ji} \\)
Option: B: The \\( m \times n \\) matrix with \\( (A^{T})_{ij} = -a_{ij} \\)
Option: C: The inverse matrix \\( A^{-1} \\)
Option: D: The \\( m \times m \\) matrix of \\( A \\) multiplied by its determinant
Answer: A
Explanation: The transpose swaps rows and columns: entry \\( a_{ij} \\) moves to position \\( (j, i) \\), so an \\( m \times n \\) matrix becomes \\( n \times m \\). Key identities include \\( (A^{T})^{T} = A \\), \\( (AB)^{T} = B^{T} A^{T} \\) (order reverses), and \\( \det(A^{T}) = \det(A) \\).

Type: MCQ
Q004: A square matrix \\( A \\) is called symmetric if:
Option: A: \\( A^{T} = A \\)
Option: B: \\( A^{T} = -A \\)
Option: C: \\( A^{-1} = A \\)
Option: D: \\( \det(A) = 0 \\)
Answer: A
Explanation: Symmetry means \\( a_{ij} = a_{ji} \\) for all \\( i, j \\). Matrices satisfying \\( A^{T} = -A \\) are skew-symmetric, and \\( A^{-1} = A \\) defines an involutory matrix (for example, any reflection). Every square matrix decomposes uniquely into symmetric and skew-symmetric parts: \\( A = \tfrac{1}{2}(A + A^{T}) + \tfrac{1}{2}(A - A^{T}) \\).

Type: Fill
Q005: The determinant of the identity matrix \\( I_{n} \\) is ___.
Answer: 1
Explanation: The identity matrix has \\( 1 \\) on every diagonal entry and \\( 0 \\) elsewhere. Since \\( I_{n} \\) is triangular, its determinant equals the product of its diagonal entries: \\( \det(I_{n}) = \prod_{i=1}^{n} 1 = 1 \\). This reflects that the identity map preserves volume with scaling factor \\( 1 \\).

Type: MCQ
Q006: If a matrix \\( A \\) has a zero row, then \\( \det(A) \\) equals:
Option: A: \\( 0 \\)
Option: B: \\( 1 \\)
Option: C: The trace of \\( A \\)
Option: D: The product of its eigenvalues
Answer: A
Explanation: The determinant is alternating and multilinear in the rows: replacing row \\( i \\) with \\( 0 \cdot \text{row}_{i} \\) scales the determinant by \\( 0 \\). Equivalently, the rows are linearly dependent, so \\( \text{rank}(A) < n \\) and the induced linear map collapses volume to \\( 0 \\).

Type: MCQ
Q007: The cofactor expansion of \\( \det(A) \\) along the \\( i \\)-th row is:
Option: A: \\( \det(A) = \sum_{j=1}^{n} a_{ij} (-1)^{i+j} M_{ij} \\)
Option: B: \\( \det(A) = \sum_{j=1}^{n} a_{ij} M_{ij} \\)
Option: C: \\( \det(A) = \sum_{j=1}^{n} a_{ij}^{2} \\)
Option: D: \\( \det(A) = \prod_{i=1}^{n} a_{ii} \\)
Answer: A
Explanation: Here \\( M_{ij} \\) is the minor (the determinant of the \\( (n-1) \times (n-1) \\) submatrix obtained by deleting row \\( i \\) and column \\( j \\)), and \\( C_{ij} = (-1)^{i+j} M_{ij} \\) is the cofactor. The identity \\( \det(A) = \sum_{j=1}^{n} a_{ij} C_{ij} \\) holds for every fixed row \\( i \\) and is the basis of recursive determinant computation.

Type: Fill
Q008: For any square matrix \\( A \\), we have \\( \det(A^{T}) \\) equals ___.
Answer: det(A)
Explanation: The determinant of the transpose equals the determinant of the original matrix: \\( \det(A^{T}) = \det(A) \\). This follows from the fact that the determinant can be expanded along rows or along columns with the same cofactor pattern, and transposing swaps these two expansions without changing the numerical value.

Type: MCQ
Q009: If \\( A \\) and \\( B \\) are \\( n \times n \\) matrices, then \\( \det(AB) \\) equals:
Option: A: \\( \det(A) \det(B) \\)
Option: B: \\( \det(A) + \det(B) \\)
Option: C: \\( \det(A) - \det(B) \\)
Option: D: \\( \det(A) / \det(B) \\)
Answer: A
Explanation: The determinant is multiplicative: \\( \det(AB) = \det(A) \det(B) \\). Intuitively, the linear map \\( x \mapsto ABx \\) scales volume by the factor \\( \det(B) \\) (applied first) and then by \\( \det(A) \\), so the net scaling is the product. A quick corollary: \\( \det(A^{-1}) = 1 / \det(A) \\) whenever \\( A \\) is invertible.

Type: MCQ
Q010: An \\( n \times n \\) matrix \\( A \\) is invertible if and only if:
Option: A: \\( \det(A) \neq 0 \\)
Option: B: \\( \det(A) = 0 \\)
Option: C: \\( A \\) is symmetric
Option: D: \\( A \\) has at least one zero entry
Answer: A
Explanation: The invertibility of \\( A \\) is equivalent to each of the following: \\( \det(A) \neq 0 \\); the columns of \\( A \\) are linearly independent; \\( \text{rank}(A) = n \\); the null space \\( \ker(A) = \{0\} \\); and the linear system \\( Ax = b \\) has a unique solution for every \\( b \in \mathbb{R}^{n} \\). Conversely, \\( \det(A) = 0 \\) means \\( A \\) is singular and no inverse exists.

Topic: Systems of Linear Equations

Type: MCQ
Q001: A square system \\( Ax = b \\) has a unique solution if and only if:
Option: A: \\( A \\) is invertible, i.e. \\( \det(A) \neq 0 \\)
Option: B: \\( A \\) has more rows than columns
Option: C: \\( b = 0 \\)
Option: D: \\( A \\) is symmetric
Answer: A
Explanation: If \\( \det(A) \neq 0 \\), the unique solution is \\( x = A^{-1} b \\). If \\( \det(A) = 0 \\), \\( A \\) is singular and the system either has no solution (inconsistent) or infinitely many (a free subspace of positive dimension). Symmetry alone gives no guarantee of invertibility.

Type: MCQ
Q002: Gaussian elimination transforms the augmented matrix \\( [A \mid b] \\) into:
Option: A: Row-echelon form using elementary row operations
Option: B: The inverse matrix \\( A^{-1} \\)
Option: C: The transpose of \\( A \\)
Option: D: The product \\( AB \\)
Answer: A
Explanation: Gaussian elimination applies three elementary row operations (swap two rows, multiply a row by a nonzero scalar, add a multiple of one row to another) to reduce \\( [A \mid b] \\) to row-echelon form. Continuing to reduced row-echelon form (RREF) yields the solution set directly. When \\( A \\) is square and invertible, applying the same operations to \\( [A \mid I] \\) produces \\( [I \mid A^{-1}] \\).

Type: MCQ
Q003: Cramer's rule expresses the solution of an invertible \\( n \times n \\) system as:
Option: A: \\( x_i = \dfrac{\det(A_i)}{\det(A)} \\)
Option: B: \\( x_i = \det(A) \cdot \det(A_i) \\)
Option: C: \\( x_i = \dfrac{\det(A)}{\det(A_i)} \\)
Option: D: \\( x_i = \det(A - A_i) \\)
Answer: A
Explanation: Here \\( A_i \\) is the matrix obtained by replacing the \\( i \\)-th column of \\( A \\) with the right-hand side vector \\( b \\). Then \\( x_i = \det(A_i) / \det(A) \\) for each \\( i \\). Cramer's rule is elegant for small \\( n \\) but has cost \\( O(n^{4}) \\) if computed naively, so in practice Gaussian elimination (\\( O(n^{3}) \\)) is preferred for large systems.

Type: MCQ
Q004: The rank of a matrix \\( A \\) is defined as:
Option: A: The dimension of its row space (equivalently, its column space)
Option: B: The number of rows of \\( A \\)
Option: C: The sum of the diagonal entries of \\( A \\)
Option: D: The product of its eigenvalues
Answer: A
Explanation: The row rank (dimension of the span of the rows) and the column rank (dimension of the span of the columns) of any matrix coincide — this is a nontrivial theorem of linear algebra. Their common value \\( \text{rank}(A) \\) equals the number of leading \\( 1 \\)s in the RREF of \\( A \\), and it satisfies \\( 0 \le \text{rank}(A) \le \min(m, n) \\).

Type: MCQ
Q005: A homogeneous system \\( Ax = 0 \\) always has:
Option: A: The trivial solution \\( x = 0 \\)
Option: B: No solution
Option: C: Infinitely many solutions
Option: D: A unique nonzero solution
Answer: A
Explanation: For any matrix \\( A \\), the vector \\( x = 0 \\) trivially satisfies \\( Ax = 0 \\), so a homogeneous system is always consistent. Nonzero solutions exist if and only if \\( A \\) has a nontrivial null space, i.e., \\( \text{rank}(A) < n \\), in which case there are infinitely many solutions parameterized by \\( n - \text{rank}(A) \\) free variables.

Type: Fill
Q006: A linear system that has no solution is called ___.
Answer: inconsistent
Explanation: A system \\( Ax = b \\) is consistent if at least one \\( x \\) satisfies it, and inconsistent otherwise. By the Rouché–Capelli theorem, the system is inconsistent exactly when \\( \text{rank}(A) < \text{rank}([A \mid b]) \\), which geometrically means \\( b \\) is not in the column space of \\( A \\).

Type: MCQ
Q007: The Rouché–Capelli theorem states that \\( Ax = b \\) is consistent if and only if:
Option: A: \\( \text{rank}(A) = \text{rank}([A \mid b]) \\)
Option: B: \\( \det(A) \neq 0 \\)
Option: C: \\( A \\) is symmetric
Option: D: \\( b = 0 \\)
Answer: A
Explanation: The augmented matrix \\( [A \mid b] \\) adds one column to \\( A \\). If \\( b \\) lies in the column space of \\( A \\), appending it does not increase the rank, so \\( \text{rank}(A) = \text{rank}([A \mid b]) \\), and a solution exists. Otherwise the rank jumps by \\( 1 \\) and the system is inconsistent.

Type: MCQ
Q008: If \\( \det(A) = 0 \\) but \\( \text{rank}(A) = \text{rank}([A \mid b]) < n \\), the system \\( Ax = b \\) has:
Option: A: Infinitely many solutions
Option: B: No solution
Option: C: Exactly one solution
Option: D: Exactly \\( n \\) solutions
Answer: A
Explanation: The rank condition guarantees the system is consistent, and \\( \text{rank}(A) < n \\) means the null space of \\( A \\) has positive dimension \\( n - \text{rank}(A) \\). Adding any null-space vector to a particular solution gives another solution, so the solution set is an affine subspace of dimension \\( n - \text{rank}(A) \\), which is infinite.

Type: Theory
Q009: Explain Gaussian elimination and how it is used to solve a linear system \\( Ax = b \\).
Marks: 10
Explanation: Gaussian elimination is an algorithm that solves \\( Ax = b \\) by systematically reducing the augmented matrix \\( [A \mid b] \\) to row-echelon form (REF) using three elementary row operations: swapping two rows, multiplying a row by a nonzero scalar, and adding a multiple of one row to another. Each operation preserves the solution set. The algorithm proceeds column by column: choose a pivot (a nonzero entry) in the current column, optionally swap it to the top of the remaining rows, use it to eliminate the entries below via row replacement, then move to the next column and repeat. Once REF is reached, the solution is found by back-substitution, starting from the last pivot variable and working upward. For example, the system \\( \\begin{cases} x + y = 3 \\\\ 2x - y = 0 \\end{cases} \\) reduces to the row-echelon form \\( \\begin{cases} x + y = 3 \\\\ -3y = -6 \\end{cases} \\), giving \\( y = 2 \\) and \\( x = 1 \\). If the matrix is square and invertible, applying the same operations to \\( [A \mid I] \\) also yields the inverse \\( [I \mid A^{-1}] \\). The complexity is \\( O(n^{3}) \\) for an \\( n \times n \\) matrix, making it the standard workhorse for both direct solution and matrix inversion.

Type: MCQ
Q010: LU decomposition is primarily used to:
Option: A: Solve \\( Ax = b \\) efficiently for multiple right-hand sides \\( b \\)
Option: B: Compute only eigenvalues of \\( A \\)
Option: C: Compute the transpose of \\( A \\)
Option: D: Determine if \\( A \\) is symmetric
Answer: A
Explanation: LU decomposition factors \\( A = LU \\) with \\( L \\) lower-triangular and \\( U \\) upper-triangular. Then \\( Ax = b \\) splits into \\( Ly = b \\) (forward substitution) followed by \\( Ux = y \\) (backward substitution). Once \\( LU \\) is computed — at cost \\( O(n^{3}) \\) — solving for any new right-hand side \\( b \\) costs only \\( O(n^{2}) \\). This is exactly what numerical software does when many right-hand sides are required.

Topic: Vector Spaces

Type: MCQ
Q001: A vector space over a field \\( \mathbb{F} \\) must be closed under:
Option: A: Both vector addition and scalar multiplication
Option: B: Vector addition only
Option: C: Scalar multiplication only
Option: D: Neither operation
Answer: A
Explanation: Closure under addition means \\( u + v \in V \\) for all \\( u, v \in V \\). Closure under scalar multiplication means \\( \alpha u \in V \\) for all \\( \alpha \in \mathbb{F} \\) and \\( u \in V \\). Together with eight axioms (associativity, commutativity, existence of zero and inverses, distributivity, and scalar compatibility), these operations give \\( V \\) the structure of a vector space over \\( \mathbb{F} \\).

Type: MCQ
Q002: A set \\( \{v_{1}, \dots, v_{k}\} \\) is linearly independent if:
Option: A: \\( \sum_{i=1}^{k} \alpha_{i} v_{i} = 0 \implies \alpha_{1} = \cdots = \alpha_{k} = 0 \\)
Option: B: Every \\( v_{i} \\) is nonzero
Option: C: Their span is the whole space
Option: D: They are pairwise orthogonal
Answer: A
Explanation: Linear independence requires that the only linear combination equalling the zero vector is the trivial one. A nonzero set can still be dependent (e.g. \\( \{(1,0),(2,0)\} \\)). Independence is strictly stronger than "each vector nonzero" but not the same as "spanning" — a set is both independent and spanning precisely when it is a basis. Orthogonality is sufficient but not necessary for independence.

Type: MCQ
Q003: A basis of a vector space \\( V \\) is:
Option: A: A set of vectors that is both linearly independent and spans \\( V \\)
Option: B: Any set of \\( \dim(V) \\) vectors
Option: C: A maximal set of dependent vectors
Option: D: A set of mutually orthogonal vectors
Answer: A
Explanation: A basis provides coordinates: every \\( v \in V \\) has a unique expansion \\( v = \sum_{i=1}^{n} \alpha_{i} b_{i} \\). Existence of a basis for any vector space is guaranteed by Zorn's lemma in infinite dimensions; in finite dimensions every spanning set contains a basis and every independent set extends to a basis. A set of \\( \dim(V) \\) vectors is a basis if and only if it is independent (equivalently, if it spans).

Type: Fill
Q004: The dimension of the vector space \\( \mathbb{R}^{n} \\) over \\( \mathbb{R} \\) is ___.
Answer: n
Explanation: The standard basis \\( \{e_{1}, e_{2}, \dots, e_{n}\} \\) of \\( \mathbb{R}^{n} \\) consists of the \\( n \\) unit vectors, where \\( e_{i} \\) has \\( 1 \\) in the \\( i \\)-th position and \\( 0 \\) elsewhere. Since this basis contains \\( n \\) elements, \\( \dim(\mathbb{R}^{n}) = n \\).

Type: MCQ
Q005: The span of a subset \\( S \subseteq V \\) is:
Option: A: The set of all finite linear combinations of vectors in \\( S \\)
Option: B: The set of coefficients used in those combinations
Option: C: The orthogonal complement of \\( S \\)
Option: D: The union of \\( S \\) with the zero vector
Answer: A
Explanation: \\( \text{span}(S) = \left\{ \sum_{i=1}^{k} \alpha_{i} v_{i} \,\middle|\, k \ge 0, \alpha_{i} \in \mathbb{F}, v_{i} \in S \right\} \\). It is the smallest subspace of \\( V \\) containing \\( S \\), and it equals \\( V \\) if and only if \\( S \\) is a spanning set.

Type: MCQ
Q006: The rank-nullity theorem for a linear map \\( T \colon V \to W \\) with \\( \dim(V) = n \\) states:
Option: A: \\( \dim(V) = \dim(\ker T) + \dim(\operatorname{im} T) \\)
Option: B: \\( \dim(\ker T) = \dim(\operatorname{im} T) \\)
Option: C: \\( \dim(V) = \dim(\ker T) \cdot \dim(\operatorname{im} T) \\)
Option: D: \\( \dim(\operatorname{im} T) = n \\)
Answer: A
Explanation: Writing \\( \text{nullity}(T) = \dim(\ker T) \\) and \\( \text{rank}(T) = \dim(\operatorname{im} T) \\), the theorem states \\( n = \text{nullity}(T) + \text{rank}(T) \\). It is one of the most-used identities in linear algebra: it constrains the solution space of \\( Ax = b \\) via \\( \dim(\ker A) = n - \text{rank}(A) \\), and it underlies the Fredholm alternative in functional analysis.

Type: MCQ
Q007: Any two bases of the same finite-dimensional vector space have:
Option: A: The same number of vectors
Option: B: The same vectors
Option: C: Different numbers of vectors
Option: D: No relation to each other
Answer: A
Explanation: This is the well-definedness of dimension, proven via the Steinitz exchange lemma: if \\( \{u_{1}, \ldots, u_{m}\} \\) and \\( \{v_{1}, \ldots, v_{n}\} \\) are both bases, then \\( m \le n \\) and \\( n \le m \\), so \\( m = n \\). Different bases of the same space may consist of entirely different vectors, but they always share the same cardinality \\( \dim(V) \\).

Type: MCQ
Q008: The intersection \\( U \cap W \\) of two subspaces \\( U, W \subseteq V \\) is:
Option: A: Always a subspace of \\( V \\)
Option: B: Not necessarily a subspace
Option: C: Always equal to \\( \{0\} \\)
Option: D: A subspace only if \\( U \cap W = \emptyset \\)
Answer: A
Explanation: If \\( x, y \in U \cap W \\) and \\( \alpha \in \mathbb{F} \\), then \\( x + y \in U \\) (both are in \\( U \\)) and \\( x + y \in W \\) (both are in \\( W \\)), hence \\( x + y \in U \cap W \\). Similarly \\( \alpha x \in U \cap W \\). Since \\( 0 \in U \\) and \\( 0 \in W \\), \\( 0 \in U \cap W \\). So \\( U \cap W \\) is nonempty and closed under addition and scalar multiplication, hence a subspace. Note that the union \\( U \cup W \\) is generally not a subspace.

Type: MCQ
Q009: For subspaces \\( U, W \\) of a finite-dimensional space, \\( \dim(U + W) \\) equals:
Option: A: \\( \dim(U) + \dim(W) - \dim(U \cap W) \\)
Option: B: \\( \dim(U) + \dim(W) \\)
Option: C: \\( \dim(U) \cdot \dim(W) \\)
Option: D: \\( \max(\dim U, \dim W) \\)
Answer: A
Explanation: This is the dimension formula \\( \dim(U + W) = \dim(U) + \dim(W) - \dim(U \cap W) \\). When \\( U \cap W = \{0\} \\), the sum is direct, written \\( U \oplus W \\), and the dimension formula reduces to \\( \dim(U) + \dim(W) \\). The correction term \\( \dim(U \cap W) \\) prevents double-counting vectors that lie in both subspaces.

Type: Theory
Q010: Define what a basis of a vector space is, and explain why every vector in the space can be written uniquely as a linear combination of the basis vectors.
Marks: 10
Explanation: A basis \\( \mathcal{B} = \{b_{1}, b_{2}, \dots, b_{n}\} \\) of a vector space \\( V \\) over a field \\( \mathbb{F} \\) is a set of vectors that is both linearly independent and spans \\( V \\). Spinning this out: spanning means every \\( v \in V \\) can be expressed as some linear combination \\( v = \sum_{i=1}^{n} \alpha_{i} b_{i} \\) with \\( \alpha_{i} \in \mathbb{F} \\); linear independence means no \\( b_{i} \\) can be written as a linear combination of the others, which is equivalent to saying the equation \\( \sum_{i=1}^{n} \alpha_{i} b_{i} = 0 \\) forces all \\( \alpha_{i} = 0 \\). Now suppose \\( v \\) had two different expansions: \\( v = \sum_{i=1}^{n} \alpha_{i} b_{i} = \sum_{i=1}^{n} \beta_{i} b_{i} \\). Subtracting gives \\( \sum_{i=1}^{n} (\alpha_{i} - \beta_{i}) b_{i} = 0 \\). By linear independence, every \\( \alpha_{i} - \beta_{i} = 0 \\), so \\( \alpha_{i} = \beta_{i} \\) for each \\( i \\). Hence the expansion is unique — the coordinates \\( (\alpha_{1}, \dots, \alpha_{n}) \\) are well defined. This is exactly why we can identify every \\( n \\)-dimensional vector space over \\( \mathbb{F} \\) with the coordinate space \\( \mathbb{F}^{n} \\) once a basis is fixed. The number \\( n \\) is the dimension of \\( V \\), and it is independent of the chosen basis.

Topic: Eigenvalues and Eigenvectors

Type: MCQ
Q001: A nonzero vector \\( v \\) is an eigenvector of \\( A \\) if:
Option: A: \\( Av = \lambda v \\) for some scalar \\( \lambda \\)
Option: B: \\( Av = 0 \\)
Option: C: \\( A^{T} v = v \\)
Option: D: \\( v^{T} A v = 1 \\)
Answer: A
Explanation: The defining equation is \\( Av = \lambda v \\) with \\( v \neq 0 \\). Geometrically, applying \\( A \\) to \\( v \\) merely scales it by the eigenvalue \\( \lambda \\) (or reverses it, if \\( \lambda < 0 \\)); it does not rotate it off its own line. The restriction \\( v \neq 0 \\) is essential, since \\( A \cdot 0 = \lambda \cdot 0 \\) for every \\( \lambda \\).

Type: MCQ
Q002: The characteristic polynomial of \\( A \in \mathbb{R}^{n \times n} \\) is:
Option: A: \\( p(\lambda) = \det(A - \lambda I) \\)
Option: B: \\( p(\lambda) = \det(\lambda A) \\)
Option: C: \\( p(\lambda) = \det(A) - \lambda \\)
Option: D: \\( p(\lambda) = \operatorname{tr}(A) \cdot \lambda \\)
Answer: A
Explanation: From \\( Av = \lambda v \\) with \\( v \neq 0 \\), we get \\( (A - \lambda I)v = 0 \\), so \\( A - \lambda I \\) must be singular, i.e. \\( \det(A - \lambda I) = 0 \\). The expression \\( \det(A - \lambda I) \\) is a polynomial in \\( \lambda \\) of degree \\( n \\), with leading term \\( (-\lambda)^{n} \\) and constant term \\( \det(A) \\). Its roots (with algebraic multiplicity) are the eigenvalues of \\( A \\). Some texts use the equivalent form \\( \det(\lambda I - A) \\), which differs only by an overall sign \\( (-1)^{n} \\) and has the same roots.

Type: Fill
Q003: The sum of all eigenvalues of a matrix \\( A \\), counted with algebraic multiplicity, equals the ___ of \\( A \\).
Answer: trace
Explanation: Writing the characteristic polynomial as \\( p(\lambda) = (-\lambda)^{n} + \operatorname{tr}(A)(-\lambda)^{n-1} + \cdots + \det(A) \\), the coefficient of \\( \lambda^{n-1} \\) is \\( -\operatorname{tr}(A) \\). On the other hand, by Vieta's formulas this coefficient also equals \\( -\sum_{i=1}^{n} \lambda_{i} \\). Equating the two gives \\( \sum_{i=1}^{n} \lambda_{i} = \operatorname{tr}(A) \\).

Type: Fill
Q004: The product of all eigenvalues of a matrix \\( A \\), counted with algebraic multiplicity, equals ___.
Answer: det(A)
Explanation: In the characteristic polynomial \\( p(\lambda) = \det(A - \lambda I) \\), substituting \\( \lambda = 0 \\) yields \\( p(0) = \det(A) \\). Vieta's formulas state that the constant term of a monic polynomial equals \\( (-1)^{n} \\) times the product of its roots; for \\( p(\lambda) \\) written in the form \\( (-\lambda)^{n} + \cdots + \det(A) \\), this gives \\( \prod_{i=1}^{n} \lambda_{i} = \det(A) \\).

Type: MCQ
Q005: A square matrix \\( A \in \mathbb{F}^{n \times n} \\) is diagonalizable if and only if:
Option: A: It has \\( n \\) linearly independent eigenvectors
Option: B: It is symmetric
Option: C: Its determinant is nonzero
Option: D: Its trace is nonzero
Answer: A
Explanation: Diagonalizability means \\( A = P D P^{-1} \\) for some diagonal \\( D \\) and invertible \\( P \\). The columns of \\( P \\) are then eigenvectors of \\( A \\) and the diagonal entries of \\( D \\) are the corresponding eigenvalues. This factorization exists precisely when \\( A \\) admits a basis of \\( n \\) linearly independent eigenvectors. Symmetric real matrices are always diagonalizable (even orthogonally), but many non-symmetric matrices are also diagonalizable; and some are not, e.g. \\( \begin{pmatrix} 1 & 1 \\\\ 0 & 1 \end{pmatrix} \\).

Type: MCQ
Q006: If \\( \lambda \\) is an eigenvalue of \\( A \\) with eigenvector \\( v \\), then \\( \lambda^{2} \\) is an eigenvalue of:
Option: A: \\( A^{2} \\), with the same eigenvector \\( v \\)
Option: B: \\( A^{T} \\)
Option: C: \\( A^{-1} \\)
Option: D: \\( A + I \\)
Answer: A
Explanation: Applying \\( A \\) twice to \\( v \\): \\( A^{2} v = A(Av) = A(\lambda v) = \lambda Av = \lambda^{2} v \\). So \\( v \\) is an eigenvector of \\( A^{2} \\) with eigenvalue \\( \lambda^{2} \\). More generally, \\( A^{k} v = \lambda^{k} v \\) for any positive integer \\( k \\), and if \\( A \\) is invertible, \\( A^{-1} v = \lambda^{-1} v \\). The eigenvalues of \\( A + I \\) are \\( \lambda + 1 \\), not \\( \lambda^{2} \\).

Type: MCQ
Q007: Eigenvectors associated with distinct eigenvalues of the same matrix are:
Option: A: Linearly independent
Option: B: Orthogonal
Option: C: Parallel
Option: D: Necessarily equal
Answer: A
Explanation: If \\( v_{1}, \dots, v_{k} \\) are eigenvectors with \\( \lambda_{1}, \dots, \lambda_{k} \\) pairwise distinct, they are linearly independent. The proof is by induction: suppose \\( \sum \alpha_{i} v_{i} = 0 \\); applying \\( A \\) gives \\( \sum \alpha_{i} \lambda_{i} v_{i} = 0 \\); subtracting \\( \lambda_{k} \\) times the first equation gives \\( \sum_{i=1}^{k-1} \alpha_{i}(\lambda_{i} - \lambda_{k}) v_{i} = 0 \\), and the inductive hypothesis forces each \\( \alpha_{i}(\lambda_{i} - \lambda_{k}) = 0 \\), hence \\( \alpha_{i} = 0 \\). They are not necessarily orthogonal — orthogonality requires the matrix to be normal (in particular, symmetric real matrices).

Type: MCQ
Q008: A real symmetric matrix is always:
Option: A: Orthogonally diagonalizable with real eigenvalues
Option: B: Singular
Option: C: Not diagonalizable over \\( \mathbb{R} \\)
Option: D: Idempotent, i.e. \\( A^{2} = A \\)
Answer: A
Explanation: The spectral theorem for real symmetric matrices states that if \\( A \in \mathbb{R}^{n \times n} \\) satisfies \\( A^{T} = A \\), then there exist an orthogonal matrix \\( Q \\) and a diagonal matrix \\( \Lambda = \operatorname{diag}(\lambda_{1}, \dots, \lambda_{n}) \\) with real eigenvalues such that \\( A = Q \Lambda Q^{T} \\). Moreover, the columns of \\( Q \\) form an orthonormal basis of eigenvectors of \\( A \\). This is one of the most important results in applied linear algebra, underlying PCA, spectral clustering, and the SVD.

Type: MCQ
Q009: The Cayley–Hamilton theorem states that:
Option: A: \\( p(A) = 0 \\), where \\( p(\lambda) = \det(\lambda I - A) \\) is the characteristic polynomial of \\( A \\)
Option: B: \\( A^{T} = A \\) for all matrices
Option: C: \\( A \\) is invertible for all matrices
Option: D: \\( \operatorname{tr}(A) = 0 \\) for all matrices
Answer: A
Explanation: Every square matrix satisfies its own characteristic equation: if \\( p(\lambda) = \det(\lambda I - A) = \lambda^{n} + c_{n-1} \lambda^{n-1} + \cdots + c_{0} \\), then substituting the matrix \\( A \\) gives \\( A^{n} + c_{n-1} A^{n-1} + \cdots + c_{0} I = 0 \\). Two standard uses: (i) reduce high powers of \\( A \\) to combinations of lower powers, (ii) compute \\( A^{-1} = -\frac{1}{c_{0}}(A^{n-1} + c_{n-1} A^{n-2} + \cdots + c_{1} I) \\) whenever \\( c_{0} = \det(A) \neq 0 \\).

Type: Theory
Q010: State and explain the spectral theorem for real symmetric matrices, and describe what it tells us about their eigenvalues and eigenvectors.
Marks: 10
Explanation: The spectral theorem for real symmetric matrices states: if \\( A \in \mathbb{R}^{n \times n} \\) satisfies \\( A^{T} = A \\), then all eigenvalues of \\( A \\) are real, and there exists an orthonormal basis of \\( \mathbb{R}^{n} \\) consisting of eigenvectors of \\( A \\). Equivalently, \\( A \\) can be factored as \\( A = Q \Lambda Q^{T} \\), where \\( Q \\) is an \\( n \times n \\) orthogonal matrix (so \\( Q^{T} Q = Q Q^{T} = I \\)) whose columns are the orthonormal eigenvectors of \\( A \\), and \\( \Lambda = \operatorname{diag}(\lambda_{1}, \dots, \lambda_{n}) \\) is the diagonal matrix of the corresponding real eigenvalues. The theorem has several consequences. First, symmetric matrices are always diagonalizable over the reals — unlike general real matrices, which may have complex eigenvalues or fail to be diagonalizable. Second, eigenvectors belonging to distinct eigenvalues of a symmetric matrix are automatically orthogonal; the Gram–Schmidt process handles the repeated-eigenvalue case. Third, the decomposition \\( A = Q \Lambda Q^{T} \\) provides a numerically stable way to compute functions of \\( A \\), including \\( A^{-1} = Q \Lambda^{-1} Q^{T} \\), \\( A^{k} = Q \Lambda^{k} Q^{T} \\), and the matrix exponential \\( e^{A} = Q e^{\Lambda} Q^{T} \\). The theorem underlies principal component analysis (PCA), where the covariance matrix is symmetric and its eigenvectors give the principal directions of variance; it also underpins quadratic form analysis, spectral graph theory, and the singular value decomposition, since \\( A^{T} A \\) is symmetric for any \\( A \\).

`);
