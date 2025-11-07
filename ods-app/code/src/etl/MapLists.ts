/**
 * Copyright (c) 2025 Capital One
*/

const { distance, closest } = require('fastest-levenshtein')

export interface List {
    name: string;
    id: string;
    [key:string]: string;
}

export interface MapReturn {
    matchedList1: List[];       // list1 items that were mapped to an item in list2
    matchedList2: List[];       // list2 items that were mapped to an item in list1
    freeList1: List[];          // list1 items that were not mapped
    freeList2: List[];          // list2 items that were not mapped
}

export class MapLists {

    /**
     * Map one list of strings to another list
     * 
     * @param list1 Larger list of strings
     * @param list2 Smaller list of strings that are to be mapped to larger list
     * @returns 
     */
    public mapStrings = (list1: string[], list2: string[]): MapReturn => {
        let id = 1;
        const l1 = [];
        for (const s of list1) {
            l1.push({ name: s, id: ""+(id++) })
        }
        const l2 = [];
        for (const s of list2) {
            l2.push({ name: s, id: ""+(id++) })
        }
        return this.mapLists(l1, l2);
    }

    /**
     * Map one list of objects to another list.  
     * Both lists must have name property.
     * 
     * @param list1 Larger list of strings
     * @param list2 Smaller list of strings that are to be mapped to larger list
     * @returns 
     */
    public mapArrays = (list1: List[], list2: List[]): MapReturn => {
        const debug = false;

        // Build hash of modified list1 names with list1 id
        const freeList1: any = {};
        for (const item of list1) {
            if (!item.name) { continue }
            let name = item.name.replaceAll("_", "").replaceAll("*", "").toLowerCase();
            const colon = name.lastIndexOf(":");
            if (colon > -1) {
                name = name.substring(colon + 1);
            }
            freeList1[name] = { id: item.id, data: item, matches: [] };
        }
        console.log("0. freeList1 =", Object.keys(freeList1).length, freeList1);

        // Build hash of modified names with object
        const freeList2: any = {};
        for (const item of list2) {
            let name = item.name.replaceAll("_", "").replaceAll("*", "").toLowerCase();
            const colon = name.lastIndexOf(":");
            if (colon > -1) {
                name = name.substring(colon + 1);
            }
            freeList2[name] = item;
        }
        console.log("0. freeList2 =", Object.keys(freeList2).length, freeList2);

        return this.mapLists(freeList1, freeList2);
    }

    public mapLists = (freeList1: any, freeList2: any): MapReturn => {
        const debug = true;

        // Find exact matches and remove them from both lists
        console.log("1. Find exact matches...")
        const matchedList1: any = {};
        const matchedList2: any = {};
        for (const name of Object.keys(freeList2)) {
            // If list1 name == list2 name, then remove from each hash
            if (freeList1[name]) {
                matchedList1[name] = freeList1[name];
                matchedList1[name].matches.push({ name: name, id: freeList2[name].id, similarity:1, distance: 0, changes: 0 })
                matchedList2[name] = freeList2[name];
                delete freeList1[name];
                delete freeList2[name];
            }
        }
        console.log("1. matchedList1 =", Object.keys(matchedList1).length);
        console.log("1. matchedList2 =", Object.keys(matchedList2).length);
        console.log("1. freeList1 =", Object.keys(freeList1).length);
        console.log("1. freeList2 =", Object.keys(freeList2).length);

        console.log("3. Find closest matches...")
        var ng = 4;
        console.log(">>>>>> NG=", ng);
        let count = 0;
        let prevMatchLength = Object.keys(matchedList2).length;
        while (!count || (prevMatchLength != Object.keys(matchedList2).length)) {
            console.log(">>> COUNT=", count, "prevMatchLength=", prevMatchLength, "matchedList2.length=", Object.keys(matchedList2).length);
            count++;
            prevMatchLength = Object.keys(matchedList2).length;

            // Find possible matches using n-gram calculation
            for (const list2Name of Object.keys(freeList2)) {
                const { closestMatch, similarity } = this.findClosestMatch(list2Name, Object.keys(freeList1), ng);
                if (closestMatch) {
                    const changes = distance(list2Name, closestMatch);
                    const _distance = changes / Math.max(closestMatch.length, list2Name.length);
                    if ((ng==4 && similarity >= 0.4) // 4-gram
                        || (ng==3 && similarity > 0.6)  // trigram
                        ) {
                        if (debug) console.log("3. closet match=", closestMatch, "~", list2Name, " similarity=", similarity,
                            "changes=", changes,
                            "distance=", _distance,
                            "list1 item=", freeList1[closestMatch]);
                        const matches = freeList1[closestMatch].matches;
                        if (matches.length > 0) {
                            if (debug) console.log(">>> Already has a match")
                        }
                        matches.push({ name: list2Name, id: freeList2[list2Name].id, similarity: similarity, distance: _distance, changes: changes });
                    }
                }
            }
            // If multiple possible matches found, then select one with closes distance
            for (const list1Name of Object.keys(freeList1)) {
                const item1 = freeList1[list1Name];
                if (item1.matches.length) {
                    if (item1.matches.length > 1) {
                        if (debug) console.log("MORE THAN 1 MATCH FOUND: ", list1Name, JSON.stringify(item1, null, 4));
                        let min = null;
                        for (const match of item1.matches) {
                            if (!min) {
                                min = match;
                            }
                            else if (min.distance > match.distance) {
                                min = match;
                            }
                        }
                        item1.matches = [min];
                        if (debug) console.log(" -- NEW ITEM1: ", JSON.stringify(item1, null, 4));
                    }
                    const list2Name = item1.matches[0].name;
                    if (freeList2[list2Name]) {
                        if (debug) console.log(" --> MATCHED ", list2Name, " with ", list1Name, " similarity=", item1.matches[0].similarity);

                        // Remove from freeList1 and freeList2
                        matchedList1[list1Name] = item1;
                        matchedList2[list2Name] = freeList2[list2Name];
                        delete freeList1[list1Name];
                        delete freeList2[list2Name];
                    }
                }
            }
            console.log("3. matchedList1 =", Object.keys(matchedList1).length);
            console.log("3. matchedList2 =", Object.keys(matchedList2).length);
            console.log("3. freeList1 =", Object.keys(freeList1).length);
            console.log("3. freeList2 =", Object.keys(freeList2).length);
        }


        // For those that aren't matched, at least show closest match
        if (debug) {
            const notMatched: any = [];
            for (const list2Name of Object.keys(freeList2)) {
                const { closestMatch, similarity } = this.findClosestMatch(list2Name, Object.keys(freeList1), 4);
                if (closestMatch) {
                    if (debug) console.log("4. closet match=", closestMatch, "~", list2Name, " similarity=", similarity, "list1 item=", freeList1[closestMatch]);
                    notMatched.push({ list2: list2Name, list1: closestMatch, similarity: similarity });
                }
                else {
                    notMatched.push({ list2: list2Name, list1: closestMatch, similarity: 0 });
                }
            }
            if (debug) console.log("4. No match found: ", JSON.stringify(notMatched, null, 4));
            console.log("4. No match found length: ", notMatched.length);
        }

        return { matchedList1: matchedList1, matchedList2: matchedList2, freeList1: freeList1, freeList2: freeList2 }

    }

    public getNgrams = (s: string, ngram: number) => {
        const trigrams = new Set();
        if (s.length < ngram) return trigrams;
        for (let i = 0; i <= s.length - ngram; i++) {
            trigrams.add(s.substring(i, i + ngram));
        }
        return trigrams;
    }

    public ngramSimilarity = (string1: string, string2: string, ngram: number) => {
        const trigrams1 = this.getNgrams(string1, ngram);
        const trigrams2 = this.getNgrams(string2, ngram);
        const intersectionSize = [...trigrams1].filter(trigram => trigrams2.has(trigram)).length;
        const unionSize = new Set([...trigrams1, ...trigrams2]).size;
        return unionSize === 0 ? 0 : intersectionSize / unionSize;
    }

    // @TODO: return top 4 matches
    public findClosestMatch = (inputString: string, stringArray: string[], ngram: number) => {
        let bestMatch = "";
        let highestSimilarity = 0;

        for (const candidateString of stringArray) {
            const similarity = this.ngramSimilarity(inputString, candidateString, ngram);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = candidateString;
            }
        }
        return { closestMatch: bestMatch, similarity: highestSimilarity };
    }

}