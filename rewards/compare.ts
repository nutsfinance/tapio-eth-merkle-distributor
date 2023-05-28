import * as merkle1 from "./data/merkles/karura_taiksm_12.json";
import * as merkle2 from "./data/merkles/karura_taiksm_13.json";
import * as _ from "lodash";
import BN from 'bignumber.js';

// console.log(new BN((merkle2.tokenTotals["0x0000000000000000000100000000000000000084"]))
//     .minus(new BN(merkle1.tokenTotals["0x0000000000000000000100000000000000000084"])).toString());

// console.log(new BN((merkle2.tokenTotals["0x0000000000000000000300000000000000000000"]))
//     .minus(new BN(merkle1.tokenTotals["0x0000000000000000000300000000000000000000"])).toString());

const users1 = Object.keys(merkle1.claims);
const users2 = Object.keys(merkle2.claims);
const diff = _.differenceWith(users2, users1);

// console.log(users1.length)
console.log(users2.length)
// console.log(diff.length)

let sum1 = new BN(0);
let sum2 = new BN(0);
for (const user of users2) {
    sum1 = sum1.plus(new BN((merkle2.claims as any)[user].cumulativeAmounts[0]));
    sum2 = sum2.plus(new BN((merkle2.claims as any)[user].cumulativeAmounts[1]));

    // if ((merkle2.claims as any)[user].tokens[0] != "0x0000000000000000000100000000000000000084") {
    //     console.log(user)
    // }
}
console.log(sum1.toString())
console.log(sum2.toString())

// console.log(new BN(merkle2.tokenTotals["0x0000000000000000000100000000000000000084"]).minus(new BN(merkle1.tokenTotals["0x0000000000000000000100000000000000000084"])).toString())
// console.log(new BN(merkle2.tokenTotals["0x0000000000000000000300000000000000000000"]).minus(new BN(merkle1.tokenTotals["0x0000000000000000000300000000000000000000"])).toString())

let diff1 = new BN(0);
let diff2 = new BN(0);

for (const user of users1) {
    const amounts1 = (merkle1.claims as any)[user].cumulativeAmounts;
    const amounts2 = (merkle2.claims as any)[user].cumulativeAmounts;

    const amount1 = new BN(amounts1[0]);
    const amount2 = new BN(amounts1[1]);
    const amount3 = new BN(amounts2[0]);
    const amount4 = new BN(amounts2[1]);

    if (amount3.gt(amount1)) {
        diff1 = diff1.plus(amount3.minus(amount1));
    }
    if (amount4.gt(amount2)) {
        diff2 = diff2.plus(amount4.minus(amount2));
    }
}

console.log(diff1.toString())
console.log(diff2.toString())

let diff3 = new BN(0);
let diff4 = new BN(0);

for (const user of diff) {
    diff3 = diff3.plus(new BN((merkle2.claims as any)[user].cumulativeAmounts[0]));
    diff4 = diff4.plus(new BN((merkle2.claims as any)[user].cumulativeAmounts[1]));
}

console.log(diff3.toString())
console.log(diff4.toString())