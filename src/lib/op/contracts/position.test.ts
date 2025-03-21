import { describe, it, expect } from 'vitest';
import { TreePosition } from './position';

describe('TreePosition', () => {
    describe('fromGIndex', () => {
        it('correctly creates a position at depth 0', () => {
            const gIndex = BigInt(1); // Root node at depth 0
            const position = TreePosition.fromGIndex(gIndex);
            
            expect(position.depth).toBe(0);
            expect(position.gIndex).toBe(BigInt(1));
            expect(position.index).toBe(BigInt(0));
        });

        it('correctly creates a position at depth 1', () => {
            const gIndex = BigInt(2); // Left child at depth 1
            const position = TreePosition.fromGIndex(gIndex);
            
            expect(position.depth).toBe(1);
            expect(position.gIndex).toBe(BigInt(2));
            expect(position.index).toBe(BigInt(0));

            const gIndex2 = BigInt(3); // Right child at depth 1
            const position2 = TreePosition.fromGIndex(gIndex2);
            
            expect(position2.depth).toBe(1);
            expect(position2.gIndex).toBe(BigInt(3));
            expect(position2.index).toBe(BigInt(1));
        });

        it('correctly creates a position at depth 2', () => {
            const gIndex = BigInt(4); // Left-left at depth 2
            const position = TreePosition.fromGIndex(gIndex);
            
            expect(position.depth).toBe(2);
            expect(position.gIndex).toBe(BigInt(4));
            expect(position.index).toBe(BigInt(0));

            const gIndex2 = BigInt(7); // Right-right at depth 2
            const position2 = TreePosition.fromGIndex(gIndex2);
            
            expect(position2.depth).toBe(2);
            expect(position2.gIndex).toBe(BigInt(7));
            expect(position2.index).toBe(BigInt(3));
        });

        it('handles edge case with gIndex 0', () => {
            const gIndex = BigInt(0);
            const position = TreePosition.fromGIndex(gIndex);
            
            expect(position.depth).toBe(0);
            expect(position.gIndex).toBe(BigInt(0));
            expect(position.index).toBe(BigInt(0));
        });

        it('correctly handles large gIndex values', () => {
            // Test with a larger value that would exercise more bits
            const gIndex = BigInt('1099511627776'); // 2^40 (depth 39)
            const position = TreePosition.fromGIndex(gIndex);
            
            expect(position.depth).toBe(40);
            expect(position.gIndex).toBe(BigInt('1099511627776'));
            expect(position.index).toBe(BigInt(0));
        });
    });

    describe('getAncestor', () => {
        it('returns self when requesting ancestor at same depth', () => {
            const position = TreePosition.fromGIndex(BigInt(7)); // depth 2, index 3
            const ancestor = position.getAncestor(2);
            
            expect(ancestor.depth).toBe(2);
            expect(ancestor.gIndex).toBe(BigInt(7));
            expect(ancestor.index).toBe(BigInt(3));
        });

        it('returns self when requesting ancestor at greater depth', () => {
            const position = TreePosition.fromGIndex(BigInt(7)); // depth 2, index 3
            const ancestor = position.getAncestor(3);
            
            expect(ancestor.depth).toBe(2);
            expect(ancestor.gIndex).toBe(BigInt(7));
            expect(ancestor.index).toBe(BigInt(3));
        });

        it('correctly finds parent', () => {
            const position = TreePosition.fromGIndex(BigInt(7)); // depth 2, index 3
            const ancestor = position.getAncestor(1);
            
            expect(ancestor.depth).toBe(1);
            expect(ancestor.gIndex).toBe(BigInt(3));
            expect(ancestor.index).toBe(BigInt(1));
        });

        it('correctly finds root ancestor', () => {
            const position = TreePosition.fromGIndex(BigInt(15)); // depth 3, index 7
            const ancestor = position.getAncestor(0);
            
            expect(ancestor.depth).toBe(0);
            expect(ancestor.gIndex).toBe(BigInt(1));
            expect(ancestor.index).toBe(BigInt(0));
        });

        it('correctly handles multi-level ancestry', () => {
            // Position at depth 4 (binary: 10101)
            const position = TreePosition.fromGIndex(BigInt(21));
            
            // Get ancestor at depth 2
            const ancestor = position.getAncestor(2);
            expect(ancestor.depth).toBe(2);
            expect(ancestor.gIndex).toBe(BigInt(5)); // 101 in binary
            expect(ancestor.index).toBe(BigInt(1));
            
            // Get ancestor at depth 1
            const grandAncestor = position.getAncestor(1);
            expect(grandAncestor.depth).toBe(1);
            expect(grandAncestor.gIndex).toBe(BigInt(2)); // 10 in binary
            expect(grandAncestor.index).toBe(BigInt(0));
        });
    });

    describe('getSubtree', () => {
        it('returns root when called on root position', () => {
            const root = TreePosition.fromGIndex(BigInt(1));
            const subtree = root.getSubtree(0);
            
            expect(subtree.gIndex).toBe(BigInt(1));
            expect(subtree.depth).toBe(0);
            expect(subtree.index).toBe(BigInt(0));
        });

        it('correctly gets subtree from left child at depth 1', () => {
            const position = TreePosition.fromGIndex(BigInt(2)); // depth 1, left child
            const subtree = position.getSubtree(2); // Get subtree at depth 2
            
            expect(subtree.gIndex).toBe(BigInt(2)); // Should match original node's gIndex
            expect(subtree.depth).toBe(1);
            expect(subtree.index).toBe(BigInt(0));
        });

        it('correctly gets subtree from right child at depth 1', () => {
            const position = TreePosition.fromGIndex(BigInt(3)); // depth 1, right child
            const subtree = position.getSubtree(2); // Get subtree at depth 2
            
            expect(subtree.gIndex).toBe(BigInt(3)); // Should match original node's gIndex
            expect(subtree.depth).toBe(1);
            expect(subtree.index).toBe(BigInt(1));
        });

        it('returns self when requesting subtree at current depth', () => {
            const position = TreePosition.fromGIndex(BigInt(5)); // depth 2, index 1
            const subtree = position.getSubtree(2);
            
            expect(subtree.gIndex).toBe(BigInt(1)); // This will be the root
            expect(subtree.depth).toBe(0);
            expect(subtree.index).toBe(BigInt(0));
        });

        it('returns a position when requesting subtree at lower depth', () => {
            const position = TreePosition.fromGIndex(BigInt(7)); // depth 2, index 3
            const subtree = position.getSubtree(1);
            
            // When requesting a lower depth, we expect to get a position at that depth
            // representing the subtree rooted at the position
            expect(subtree.depth).toBe(1);
        });

        it('correctly gets subtree at higher depth', () => {
            const position = TreePosition.fromGIndex(BigInt(3)); // depth 1, index 1
            const subtree = position.getSubtree(3); // Get subtree at depth 3
            
            expect(subtree.gIndex).toBe(BigInt(3)); // Should match original node's gIndex
            expect(subtree.depth).toBe(1);
            expect(subtree.index).toBe(BigInt(1));
        });
        
        it('handles multi-level subtree computation correctly', () => {
            const root = TreePosition.fromGIndex(BigInt(1));
            const subtreeDepth3 = root.getSubtree(3);
            
            // Root at depth 0 with depth parameter 3 should return the same root
            expect(subtreeDepth3.gIndex).toBe(BigInt(1));
            expect(subtreeDepth3.depth).toBe(0);
            expect(subtreeDepth3.index).toBe(BigInt(0));
            
            // Now get a deeper subtree from a position at depth 2
            const position = TreePosition.fromGIndex(BigInt(5)); // depth 2, index 1
            const subtreeDepth5 = position.getSubtree(5);
            
            // Should return same position since target depth > current depth
            expect(subtreeDepth5.gIndex).toBe(BigInt(5));
            expect(subtreeDepth5.depth).toBe(2);
            expect(subtreeDepth5.index).toBe(BigInt(1));
        });
    });

    describe('getRightmostDescendant', () => {
        it('returns self when requesting descendant at same depth', () => {
            const position = TreePosition.fromGIndex(BigInt(3)); // depth 1, index 1
            const descendant = position.getRightmostDescendant(1);
            
            expect(descendant.depth).toBe(1);
            expect(descendant.gIndex).toBe(BigInt(3));
            expect(descendant.index).toBe(BigInt(1));
        });

        it('returns self when requesting descendant at lesser depth', () => {
            const position = TreePosition.fromGIndex(BigInt(3)); // depth 1, index 1
            const descendant = position.getRightmostDescendant(0);
            
            expect(descendant.depth).toBe(1);
            expect(descendant.gIndex).toBe(BigInt(3));
            expect(descendant.index).toBe(BigInt(1));
        });

        it('correctly finds rightmost child at next depth', () => {
            const position = TreePosition.fromGIndex(BigInt(2)); // depth 1, index 0
            const descendant = position.getRightmostDescendant(2);
            
            // Expected to be rightmost child: gIndex = 5 (binary: 101)
            expect(descendant.depth).toBe(2);
            expect(descendant.gIndex).toBe(BigInt(5));
            expect(descendant.index).toBe(BigInt(1));
        });

        it('correctly finds rightmost descendant multiple levels down', () => {
            const position = TreePosition.fromGIndex(BigInt(1)); // root
            const descendant = position.getRightmostDescendant(3);
            
            // Expected to be rightmost descendant at depth 3: gIndex = 15 (binary: 1111)
            expect(descendant.depth).toBe(3);
            expect(descendant.gIndex).toBe(BigInt(15));
            expect(descendant.index).toBe(BigInt(7));
        });

        it('creates a rightmost descendant with all lower bits set to 1', () => {
            const position = TreePosition.fromGIndex(BigInt(2)); // depth 1, index 0
            const descendant = position.getRightmostDescendant(4);
            
            // Expected: original (2) << 3 bits plus lower 3 bits set to 1
            // Binary: 10000 | 111 = 10111 = 23
            expect(descendant.gIndex).toBe(BigInt(23));
            expect(descendant.depth).toBe(4);
            
            // Check the binary representation
            const binary = descendant.gIndex.toString(2);
            expect(binary).toBe('10111');
        });

        it('gives correct results for deeper trees', () => {
            // Position at depth 3, index 3 (binary: 1011)
            const position = TreePosition.fromGIndex(BigInt(11));
            
            // Get rightmost descendant at depth 6
            const descendant = position.getRightmostDescendant(6);
            
            // Original 11 (1011) << 3 positions, with lower 3 bits set to 1
            // 1011000 | 111 = 1011111 = 95
            expect(descendant.gIndex).toBe(BigInt(95));
            expect(descendant.depth).toBe(6);
            expect(descendant.index).toBe(BigInt(31));
        });
    });

    describe('complex operations', () => {
        it('can navigate up and down the tree consistently', () => {
            // Start at depth 2, index 1 (binary: 101 = 5)
            const position = TreePosition.fromGIndex(BigInt(5));
            
            // Go up to root
            const root = position.getAncestor(0);
            expect(root.gIndex).toBe(BigInt(1)); // Root should have gIndex 1
            
            // Go back down to the rightmost descendant at depth 2
            const descendant = root.getRightmostDescendant(2);
            expect(descendant.gIndex).toBe(BigInt(7)); // Binary: 111
            expect(descendant.depth).toBe(2);
            expect(descendant.index).toBe(BigInt(3)); // Rightmost index at depth 2
        });

        it('handles multiple getRightmostDescendant calls correctly', () => {
            // Start at depth 0 (root)
            const root = TreePosition.fromGIndex(BigInt(1));
            
            // Get rightmost descendant at depth 2
            const depth2 = root.getRightmostDescendant(2);
            expect(depth2.gIndex).toBe(BigInt(7)); // Binary: 111
            expect(depth2.depth).toBe(2);
            
            // Get rightmost descendant at depth 4 from the depth 2 node
            const depth4 = depth2.getRightmostDescendant(4);
            expect(depth4.gIndex).toBe(BigInt(31)); // Binary: 11111
            expect(depth4.depth).toBe(4);
        });

        it('correctly performs ancestor and descendant operations in sequence', () => {
            // Start at a deeper position
            const position = TreePosition.fromGIndex(BigInt(27)); // depth 4, index 11 (binary: 11011)
            
            // Get ancestor at depth 2
            const ancestor = position.getAncestor(2);
            expect(ancestor.gIndex).toBe(BigInt(6)); // depth 2, index 2 (binary: 110)
            
            // Now get rightmost descendant at depth 5
            const descendant = ancestor.getRightmostDescendant(5);
            
            // Expected: 6 (110) << 3 bits | 111 = 110000 | 111 = 110111 = 55
            expect(descendant.gIndex).toBe(BigInt(55));
            expect(descendant.depth).toBe(5);
            expect(descendant.index).toBe(BigInt(23));
        });
    });

    describe('boundary conditions', () => {
        it('handles extreme depths', () => {
            // Create position at a very high depth (near BigInt max)
            const highDepth = 100; // Typical real-world trees won't be this deep
            const gIndex = BigInt(1) << BigInt(highDepth);
            const position = TreePosition.fromGIndex(gIndex);
            
            expect(position.depth).toBe(highDepth);
            
            // Get ancestor at depth 0
            const ancestor = position.getAncestor(0);
            expect(ancestor.depth).toBe(0);
            expect(ancestor.gIndex).toBe(BigInt(1));
            
            // Try getting rightmost descendant back at original depth
            const descendant = ancestor.getRightmostDescendant(highDepth);
            expect(descendant.depth).toBe(highDepth);
            
            // The gIndex should have all bits set from 0 to highDepth
            const expectedGIndex = (BigInt(1) << BigInt(highDepth+1)) - BigInt(1);
            expect(descendant.gIndex).toBe(expectedGIndex);
        });
    });
}); 