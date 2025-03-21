export class TreePosition {
    readonly gIndex: bigint;
    readonly depth: number;
    readonly index: bigint;

    private constructor(gIndex: bigint, depth: number, indexAtDepth: bigint) {
        this.gIndex = gIndex;
        this.depth = depth;
        this.index = indexAtDepth;
    }

    getParent(): TreePosition {
        const gIndex = this.gIndex >> BigInt(1);
        return TreePosition.fromGIndex(gIndex);
    }

    getSubtree(rootedAtDepth: number): TreePosition {
        if (rootedAtDepth > this.depth) {
            return this;
        }
        const subtreeDepth = this.depth - rootedAtDepth;
        const depthBit = BigInt(1) << BigInt(subtreeDepth);
        const mask = depthBit - BigInt(1);
        const gIndex = depthBit | (this.gIndex & mask);
        return TreePosition.fromGIndex(gIndex);
    }

    getAncestor(atDepth: number): TreePosition {
        const depthDiff = this.depth - atDepth;
        if (depthDiff <= 0) {
            return this;
        }
        const gIndex = this.gIndex >> BigInt(depthDiff);
        return TreePosition.fromGIndex(gIndex);
    }

    getRightmostDescendant(atDepth: number): TreePosition {
        let gIndex = this.gIndex;

        const distanceToDescendant = atDepth - this.depth;
        if (distanceToDescendant <= 0) {
            return this;
        }

        // Shift gIndex to the left by distanceToDescendant, then set all lower bits
        // to 1 to create the rightmost descendant
        gIndex = (gIndex << BigInt(distanceToDescendant)) | ((BigInt(1) << BigInt(distanceToDescendant)) - BigInt(1));
        
        // Use fromGIndex for consistency with other methods
        return TreePosition.fromGIndex(gIndex);
    }
    /**
     * Creates a new Position from a generalized index
     * @param gIndex The generalized index to create the position from
     */
    static fromGIndex(gIndex: bigint): TreePosition {
        const depth = this.calculateDepth(gIndex);
        const withoutMSBMask = ~(BigInt(1) << BigInt(depth));
        const indexAtDepth = gIndex & withoutMSBMask;
        return new TreePosition(gIndex, depth, indexAtDepth);
    }

    /**
     * Gets the most significant bit position of a bigint
     */
    private static calculateDepth(gIndex: bigint): number {
        if (gIndex === BigInt(0)) return 0;
        let mostSignificantBit = 0;
        let temp = gIndex;
        while (temp > BigInt(0)) {
            mostSignificantBit++;
            temp = temp >> BigInt(1);
        }
        //
        return mostSignificantBit - 1;
    }
}
