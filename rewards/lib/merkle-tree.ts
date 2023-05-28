import { ethers } from "ethers";

export class MerkleTree {
    public elements: string[];
    public layers: string[][];

    constructor(nodes: string[]) {
        // Merkle tree elements are sorted
        this.elements = nodes.map(node => ethers.utils.keccak256(node)).sort();
        this.layers = MerkleTree.getLayers(this.elements);
    }

    public getRoot(): string {
        return this.layers[this.layers.length - 1][0];
    }

    public getProof(node: string) {
        const element = ethers.utils.keccak256(node);
        let index = this.elements.indexOf(element);
        const proof = [];

        for (const layer of this.layers) {
            const pairIndex = index % 2 == 0 ? index + 1 : index - 1;
            if (pairIndex < layer.length) {
                proof.push(layer[pairIndex]);
            }
            index = Math.floor(index / 2);
        }

        return proof;
    }

    public static getLayers(elements: string[]): string[][] {
        const layers: string[][] = [];
        layers.push(elements);

        while (layers[layers.length - 1].length > 1) {
            layers.push(MerkleTree.getNextLayer(layers[layers.length - 1]));
        }

        return layers;
    }

    public static getNextLayer(elements: string[]): string[] {
        const next: string[] = [];
        for (let i = 0; i < elements.length; i += 2) {
            next.push(MerkleTree.combined(elements[i], elements[i + 1]));
        }

        return next;
    }

    public static combined(a: string, b: string): string {
        if (!a) return b;
        if (!b) return a;

        const a1 = ethers.utils.arrayify(a);
        const b1 = ethers.utils.arrayify(b);
        return ethers.utils.keccak256(a < b ? [...a1, ...b1] : [...b1, ...a1]);
    }
}